const createToken = require("../create-token");
const {
  findParenLevelToken,
  nextNonCommentNonWhitespace,
} = require("../token-utils");

/**
 * Find token containing the number following the FIRST keyword
 * @param {Array<Object>} tokens
 * @param {Number} startingIndex
 */
function has(tokens, startingIndex) {
  const firstKeywordToken = findParenLevelToken(
    tokens,
    startingIndex,
    (token) => token.type === "keyword" && token.value === "first"
  );

  if (!firstKeywordToken) {
    return null;
  }

  const nextNonWC = nextNonCommentNonWhitespace(
    tokens,
    firstKeywordToken.index + 1
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
 * Adds FIRST to query that does not have it.
 *
 * FIRST is an Actian keyword that operates similar to SQL Server's TOP.
 * TODO - find documentation/examples to figure out if there are any potential edge cases with this solution
 * https://docs.actian.com/vectorhadoop/6.0/#page/SQLLang%2FSELECT_(Interactive).htm%23
 *
 * @param {Array<Object>} tokens
 * @param {Number} statementKeywordIndex
 * @param {Number} targetParenLevel
 * @param {Number} limitNumber
 */
function add(tokens, statementKeywordIndex, targetParenLevel, limitNumber) {
  // FIRST was not found, so put it immediately following the SELECT statement
  const firstHalf = tokens.slice(0, statementKeywordIndex + 1);
  const secondhalf = tokens.slice(statementKeywordIndex + 1);
  return [
    ...firstHalf,
    createToken.singleSpace(),
    createToken.keyword("first"),
    createToken.singleSpace(),
    createToken.number(limitNumber),
    ...secondhalf,
  ];
}

exports.has = has;
exports.add = add;
