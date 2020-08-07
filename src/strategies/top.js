const createToken = require("../create-token");
const {
  findParenLevelToken,
  nextNonCommentNonWhitespace,
} = require("../token-utils");

/**
 * Find token containing the number following the TOP keyword
 * @param {Array<Object>} tokens
 * @param {Number} startingIndex
 */
function has(tokens, startingIndex) {
  const topKeywordToken = findParenLevelToken(
    tokens,
    startingIndex,
    (token) => token.type === "keyword" && token.value === "top"
  );

  if (!topKeywordToken) {
    return null;
  }

  const nextNonWC = nextNonCommentNonWhitespace(
    tokens,
    topKeywordToken.index + 1
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
 * Adds TOP to query that does not have it.
 *
 * TOP in Actian behaves similar to its FIRST keyword, and SQL Server's TOP (though unclear about its compat with UNION)
 * @param {Array<Object>} tokens
 * @param {Number} statementKeywordIndex
 * @param {Number} targetParenLevel
 * @param {Number} limitNumber
 */
function add(tokens, statementKeywordIndex, targetParenLevel, limitNumber) {
  // TOP was not found, so put it immediately following the SELECT statement
  const firstHalf = tokens.slice(0, statementKeywordIndex + 1);
  const secondhalf = tokens.slice(statementKeywordIndex + 1);
  return [
    ...firstHalf,
    createToken.singleSpace(),
    createToken.keyword("top"),
    createToken.singleSpace(),
    createToken.number(limitNumber),
    ...secondhalf,
  ];
}

exports.has = has;
exports.add = add;
