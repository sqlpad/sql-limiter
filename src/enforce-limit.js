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

  // Limit was not found, so figure out where it should be inserted
  // Limits go at the end, so rewind from end and find first keyword
  // If last keyword is offset, need to put limit before that
  // If not offset, put limit at end, before terminator if present
  const insertBeforeToken = findParenLevelToken(
    queryTokens,
    statementkeywordIndex,
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
    statementkeywordIndex,
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

module.exports = enforceLimit;
