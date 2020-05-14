const createToken = require("./create-token");
const getStatementType = require("./get-statement-type");

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

function nextNonCommentNonWhitespace(tokens, startingIndex) {
  return findToken(
    tokens,
    startingIndex,
    (token) => token.type !== "whitespace" && token.type !== "comment"
  );
}

function hasLimit(tokens, startingIndex) {
  const limitKeywordToken = findParenLevelToken(
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

/**
 * Determines whether query tokens have "FETCH" style limits
 * Postgres, IBM, Actian/Ingres, SQL Server 2012 support this SQL 2008 addition
 *
 * The postgres docs showcase the format nicely:
 * [ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } ONLY ]
 * [ FOR { UPDATE | NO KEY UPDATE | SHARE | KEY SHARE } [ OF table_name [, ...] ] [ NOWAIT | SKIP LOCKED ] [...] ]
 *
 * For the purposes of sql-limiter, we will look for "fetch first <number>" and "fetch next <number>"
 * Assuming that whitespace or comments can be between
 *
 * Resources:
 * https://www.postgresql.org/docs/12/sql-select.html
 * https://docs.actian.com/ingres/10s/index.html#page/SQLRef%2FSELECT_Clause.htm%23
 * https://www.ibm.com/support/knowledgecenter/SSEPEK_10.0.0/sqlref/src/tpc/db2z_sql_fetchfirstclause.html
 * https://use-the-index-luke.com/sql/partial-results/top-n-queries
 *
 * @param {array<object>} tokens
 * @param {number} startingIndex
 */
function hasFetch(tokens, startingIndex) {
  const fetchKeywordToken = findParenLevelToken(
    tokens,
    startingIndex,
    (token) => token.type === "keyword" && token.value === "fetch"
  );

  if (!fetchKeywordToken) {
    return null;
  }

  let nextNonWC = nextNonCommentNonWhitespace(
    tokens,
    fetchKeywordToken.index + 1
  );

  if (!nextNonWC) {
    throw new Error("Unexpected end of statement");
  }

  if (
    nextNonWC.type !== "keyword" ||
    (nextNonWC.value !== "next" && nextNonWC.value !== "first")
  ) {
    throw new Error(`Unexpected token: ${nextNonWC.type} ${nextNonWC.value}`);
  }

  nextNonWC = nextNonCommentNonWhitespace(tokens, nextNonWC.index + 1);
  if (!nextNonWC) {
    throw new Error("Unexpected end of statement");
  }
  if (nextNonWC.type !== "number") {
    throw new Error(`Expected number got ${nextNonWC.type}`);
  }

  return {
    fetchKeywordToken,
    fetchNumberToken: nextNonWC,
  };
}

function findLimitInsertionIndex(queryTokens, targetParenLevel) {
  let level = 0;
  for (let i = queryTokens.length - 1; i >= 0; i--) {
    const token = queryTokens[i];
    if (
      level === targetParenLevel &&
      token.type !== "comment" &&
      token.type !== "whitespace"
    ) {
      return i + 1;
    }

    if (token.type === "rparen") {
      level++;
    } else if (token.type === "lparen") {
      level--;
    }
  }
  // This should never happen.
  // And if it did this lib doesn't know what to do
  throw new Error("Unexpected index");
}

/**
 * Adds limit to query that does not have it
 * @param {*} queryTokens
 * @param {*} statementKeywordIndex
 * @param {*} targetParenLevel
 * @param {*} limit
 */
function addLimit(queryTokens, statementKeywordIndex, targetParenLevel, limit) {
  // Limit was not found, so figure out where it should be inserted
  // If last keyword is offset, need to put limit before that
  // If not offset, put limit at end, before terminator if present
  const insertBeforeToken = findParenLevelToken(
    queryTokens,
    statementKeywordIndex,
    (token) =>
      token.type === "keyword" &&
      (token.value === "offset" || token.value === "for")
  );
  if (insertBeforeToken) {
    const firstHalf = queryTokens.slice(0, insertBeforeToken.index);
    const secondhalf = queryTokens.slice(insertBeforeToken.index);
    return [
      ...firstHalf,
      createToken.keyword("limit"),
      createToken.singleSpace(),
      createToken.number(limit),
      createToken.singleSpace(),
      ...secondhalf,
    ];
  }

  // If there is a terminator add it just before
  const terminatorToken = findParenLevelToken(
    queryTokens,
    statementKeywordIndex,
    (token) => token.type === "terminator"
  );
  if (terminatorToken) {
    const firstHalf = queryTokens.slice(0, terminatorToken.index);
    const secondhalf = queryTokens.slice(terminatorToken.index);
    return [
      ...firstHalf,
      createToken.singleSpace(),
      createToken.keyword("limit"),
      createToken.singleSpace(),
      createToken.number(limit),
      ...secondhalf,
    ];
  }

  // No terminator. Append to end
  // skipping past any trailing comments, whitespace, terminator
  const targetIndex = findLimitInsertionIndex(queryTokens, targetParenLevel);
  const firstHalf = queryTokens.slice(0, targetIndex);
  const secondhalf = queryTokens.slice(targetIndex);
  return [
    ...firstHalf,
    createToken.singleSpace(),
    createToken.keyword("limit"),
    createToken.singleSpace(),
    createToken.number(limit),
    ...secondhalf,
  ];
}

/**
 * Adds limit to query that does not have it
 * @param {*} queryTokens
 * @param {*} statementKeywordIndex
 * @param {*} targetParenLevel
 * @param {*} limit
 */
function addFetch(queryTokens, statementKeywordIndex, targetParenLevel, limit) {
  // fetch first was not found, so figure out where it should be inserted
  // fetch first goes at end before for if that exists. Otherwise before terminator if it exists
  const insertBeforeToken = findParenLevelToken(
    queryTokens,
    statementKeywordIndex,
    (token) => token.type === "keyword" && token.value === "for"
  );

  const fetchToOnlyTokens = [
    createToken.keyword("fetch"),
    createToken.singleSpace(),
    createToken.keyword("first"),
    createToken.singleSpace(),
    createToken.number(limit),
    createToken.singleSpace(),
    createToken.keyword("rows"),
    createToken.singleSpace(),
    createToken.keyword("only"),
  ];

  if (insertBeforeToken) {
    const firstHalf = queryTokens.slice(0, insertBeforeToken.index);
    const secondhalf = queryTokens.slice(insertBeforeToken.index);
    return [
      ...firstHalf,
      ...fetchToOnlyTokens,
      createToken.singleSpace(),
      ...secondhalf,
    ];
  }

  // If there is a terminator add it just before
  const terminatorToken = findParenLevelToken(
    queryTokens,
    statementKeywordIndex,
    (token) => token.type === "terminator"
  );
  if (terminatorToken) {
    const firstHalf = queryTokens.slice(0, terminatorToken.index);
    const secondhalf = queryTokens.slice(terminatorToken.index);
    return [
      ...firstHalf,
      createToken.singleSpace(),
      ...fetchToOnlyTokens,
      ...secondhalf,
    ];
  }

  // No terminator. Append to end
  // skipping past any trailing comments, whitespace, terminator
  const targetIndex = findLimitInsertionIndex(queryTokens, targetParenLevel);
  const firstHalf = queryTokens.slice(0, targetIndex);
  const secondhalf = queryTokens.slice(targetIndex);
  return [
    ...firstHalf,
    createToken.singleSpace(),
    ...fetchToOnlyTokens,
    ...secondhalf,
  ];
}

/**
 * Detects, enforces or injects a limit using strategies specified.
 * @param {Array<Object>} queryTokens
 * @param {Array<String>|String} limitStrategies
 * @param {Number} limit
 */
function enforceLimit(queryTokens, limitStrategies, limit) {
  const strategies =
    typeof limitStrategies === "string" ? [limitStrategies] : limitStrategies;

  if (!Array.isArray(strategies)) {
    throw new Error("limit strategies must be array or string");
  }

  const statementTypeToken = getStatementType(queryTokens);

  // If not dealing with a select return tokens unaltered
  if (statementTypeToken.value !== "select") {
    return queryTokens;
  }

  if (strategies.includes("limit")) {
    const limitResult = hasLimit(queryTokens, statementTypeToken.index);
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
  }

  if (strategies.includes("fetch")) {
    const fetchResult = hasFetch(queryTokens, statementTypeToken.index);
    if (fetchResult) {
      // limit is there, so find next number and validate
      // is the next non-whitespace non-comment a number?
      // If so, enforce that number be no larger than limit
      const { fetchNumberToken } = fetchResult;

      // If the number if over the limit, reset it
      if (parseInt(fetchNumberToken.value, 10) > limit) {
        const firstHalf = queryTokens.slice(0, fetchNumberToken.index);
        const secondhalf = queryTokens.slice(fetchNumberToken.index + 1);
        return [
          ...firstHalf,
          { ...fetchNumberToken, text: limit, value: limit },
          ...secondhalf,
        ];
      }
      return queryTokens;
    }
  }

  const preferredStrategy = strategies[0];

  if (preferredStrategy === "limit") {
    return addLimit(
      queryTokens,
      statementTypeToken.index,
      statementTypeToken.parenLevel,
      limit
    );
  }
  if (preferredStrategy === "fetch") {
    return addFetch(
      queryTokens,
      statementTypeToken.index,
      statementTypeToken.parenLevel,
      limit
    );
  }

  return [];
}

module.exports = enforceLimit;
