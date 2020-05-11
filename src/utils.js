const tokenize = require("./tokenize");
const createToken = require("./create-token");

/**
 * Splits sql text into an array of arrays of tokens
 * @param {string} sqlText
 */
function getQueriesTokens(sqlText) {
  const tokens = tokenize(sqlText);
  const queriesTokens = [];
  let queryTokens = [];
  tokens.forEach((token) => {
    queryTokens.push(token);
    if (token.type === "terminator") {
      queriesTokens.push(queryTokens);
      queryTokens = [];
    }
  });
  // push last set
  if (queryTokens.length) {
    queriesTokens.push(queryTokens);
  }

  return queriesTokens;
}

/**
 * Find if a query is a select query or not.
 * CTEs *may* be a select. They could also be inserts/updates
 * @param {array<object>} queryTokens
 */
function getStatementType(queryTokens = []) {
  // Queries could be wrapped in parens (WITH something AS (some query) SELECT 'hello' AS world;)
  // In event that this query wrapped in parents, this needs to track what level of parens need the limit injected into
  let parenLevel = 0;
  let targetParenLevel;
  // statementKeyword will be `select`, `insert`, `alter`, etc.
  // keywords `with` and `as` not included to filter out cte
  let statementKeyword = "";
  let statementkeywordIndex;

  for (let index = 0; index < queryTokens.length; index++) {
    const token = queryTokens[index];
    if (token.type === "lparen") {
      parenLevel++;
    } else if (token.type === "rparen") {
      parenLevel--;
    } else if (token.type === "keyword") {
      // If targetParenLevel has not yet been set,
      // we are dealing with the first keyword, which informs us of the "level"
      // we want to consider for finding SELECT and TOP/LIMIT
      if (targetParenLevel === undefined) {
        targetParenLevel = parenLevel;
      }
      // Statement keyword we are considering not something found in prep of CTE
      // If the current keyword isn't a `with` and not `as`, and at the same level as our targetParenLevel,
      // We can assume it tells us what kind of query we are dealing with.
      // Consider queries like the following queries
      //
      // WITH cte AS (...) SELECT ...
      // WITH cte AS (...) INSERT INTO ... SELECT
      // WITH cte AS (...) UPDATE ... FROM ...
      // (WITH cte AS (...) SELECT ...)
      if (
        !statementKeyword &&
        targetParenLevel === parenLevel &&
        token.value !== "with" &&
        token.value !== "as"
      ) {
        statementKeyword = token.value;
        statementkeywordIndex = index;

        // We've identified the statement keyword
        // We can exit the loop
        index = queryTokens.length;
      }
    }
  }

  return {
    statementkeywordIndex,
    statementKeyword,
    targetParenLevel,
  };
}

function findParenLevelToken(tokens, startingIndex, predicate) {
  let level = 0;
  for (let i = startingIndex; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === "lparen") {
      level++;
    } else if (token.type === "rparen") {
      level--;
    } else if (level === 0 && predicate(token)) {
      return { ...token, index: i };
    }
  }
  return null;
}

function findToken(tokens, startingIndex, predicate) {
  for (let i = startingIndex; i < tokens.length; i++) {
    const token = tokens[i];
    if (predicate(token)) {
      return { ...token, index: i };
    }
  }
  return null;
}

function nextKeyword(tokens, startingIndex) {
  return findParenLevelToken(
    tokens,
    startingIndex,
    (token) => token.type === "keyword"
  );
}

function nextNonCommentNonWhitespace(tokens, startingIndex) {
  return findToken(
    tokens,
    startingIndex,
    (token) => token.type !== "whitespace" && token.type !== "comment"
  );
}

function hasLimit(tokens, startingIndex) {
  const limitKeywordToken = findToken(
    tokens,
    startingIndex,
    (token) => token.type === "keyword" && token.value === "limit"
  );

  if (!limitKeywordToken) {
    return null;
  }

  const nextNonWC = nextNonCommentNonWhitespace(
    tokens,
    limitKeywordToken.index + 1
  );

  if (!nextNonWC) {
    throw new Error("Unexpected end of statement");
  }

  if (nextNonWC.type !== "number") {
    throw new Error(`Expected number got ${nextNonWC.type}`);
  }

  return {
    limitKeywordToken,
    limitNumberToken: nextNonWC,
  };
}

function firstKeywordFromEnd(
  queryTokens,
  targetParenLevel,
  excludedKeywordValues = []
) {
  let level = 0;
  for (let i = queryTokens.length - 1; i >= 0; i--) {
    const token = queryTokens[i];
    if (token.type === "rparen") {
      level++;
    } else if (token.type === "lparen") {
      level--;
    } else if (
      token.type === "keyword" &&
      level === targetParenLevel &&
      !excludedKeywordValues.includes(token.value)
    ) {
      return { ...token, index: i };
    }
  }
  return null;
}

function findLimitInsertionIndex(queryTokens, targetParenLevel) {
  let level = 0;
  for (let i = queryTokens.length - 1; i >= 0; i--) {
    const token = queryTokens[i];

    if (token.type === "rparen") {
      level++;
    } else if (token.type === "lparen") {
      level--;
    } else if (
      level === targetParenLevel &&
      token.type !== "comment" &&
      token.type !== "whitespace" &&
      token.type !== "terminator"
    ) {
      return i + 1;
    }
  }
  return -1;
}

function enforceLimit(queryTokens, limit) {
  const {
    statementKeyword,
    statementkeywordIndex,
    targetParenLevel,
  } = getStatementType(queryTokens);

  // If not dealing with a select return tokens unaltered
  if (statementKeyword !== "select") {
    return queryTokens;
  }

  const limitResult = hasLimit(queryTokens, statementkeywordIndex);
  if (limitResult) {
    // limit is there, so find next number and validate
    // is the next non-whitespace non-comment a number?
    // If so, enforce that number be no larger than limit

    const { limitNumberToken } = limitResult;

    // If the number if over the limit, reset it
    if (parseInt(limitNumberToken.value, 10) > limit) {
      const firstHalf = queryTokens.slice(0, limitNumberToken.index);
      const secondhalf = queryTokens.slice(limitNumberToken.index + 1);
      return [
        ...firstHalf,
        { ...limitNumberToken, text: limit, value: limit },
        ...secondhalf,
      ];
    }
    return queryTokens;
  }

  // Limits go at the end, so we are going to rewind from end and find first keyword
  // if that first keyword is `limit`, we'll enforce the limit
  // if that keyword is not limit, we need to add limit

  // limit is not there so inject it
  const injectedTokens = [
    createToken.keyword("limit"),
    createToken.singleSpace(),
    createToken.number(limit),
  ];

  // if last keyword is offset, need to put limit before that
  // TODO - there are lots of other keywords that could be in end. This approach does not work
  // TODO - if offset if found, this doesn't solve trailing comment
  const lastKeyword = firstKeywordFromEnd(queryTokens, targetParenLevel);
  if (lastKeyword.value === "offset") {
    const firstHalf = queryTokens.slice(0, lastKeyword.index);
    const secondhalf = queryTokens.slice(lastKeyword.index);
    return [
      ...firstHalf,
      ...injectedTokens,
      createToken.singleSpace(),
      ...secondhalf,
    ];
  }

  // Otherwise append to end,
  // skipping past any trailing comments, whitespace, terminator
  const targetIndex = findLimitInsertionIndex(queryTokens, targetParenLevel);
  const firstHalf = queryTokens.slice(0, targetIndex);
  const secondhalf = queryTokens.slice(targetIndex);
  return [
    ...firstHalf,
    createToken.singleSpace(),
    ...injectedTokens,
    ...secondhalf,
  ];
}

/**
 * Takes SQL text and splits it by terminator
 * Returns array of single SQL statements.
 * Extra spaces trailing terminator are not returned for a query
 * @param {string} sqlText
 * @param {boolean} includeTerminators = include terminators in individual queries
 */
function getQueries(sqlText, includeTerminators = false) {
  const queries = [];
  const queriesTokens = getQueriesTokens(sqlText);
  queriesTokens.forEach((queryTokens) => {
    // if set of tokens has something other than whitespace/terminators, consider it
    if (
      queryTokens.filter(
        (t) => t.type !== "whitespace" && t.type !== "terminator"
      ).length > 0
    ) {
      if (includeTerminators) {
        const query = queryTokens.map((token) => token.text).join("");
        queries.push(query);
      } else {
        const query = queryTokens
          .filter((token) => token.type !== "terminator")
          .map((token) => token.text)
          .join("");
        queries.push(query);
      }
    }
  });
  return queries;
}

module.exports = {
  enforceLimit,
  getQueries,
  getQueriesTokens,
  getStatementType,
  tokenize,
};
