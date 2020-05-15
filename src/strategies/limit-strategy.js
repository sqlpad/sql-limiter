const createToken = require("../create-token");
const {
  findParenLevelToken,
  findLimitInsertionIndex,
  nextNonCommentNonWhitespace,
} = require("../token-utils");

function has(tokens, startingIndex) {
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

  return nextNonWC;
}

/**
 * Adds limit to query that does not have it
 * @param {*} queryTokens
 * @param {*} statementKeywordIndex
 * @param {*} targetParenLevel
 * @param {*} limit
 */
function add(queryTokens, statementKeywordIndex, targetParenLevel, limit) {
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

exports.has = has;
exports.add = add;
