const createToken = require("./create-token");
const {
  findParenLevelToken,
  nextNonCommentNonWhitespace,
} = require("./token-utils");

function has(tokens, startingIndex) {
  const limitKeywordToken = findParenLevelToken(
    tokens,
    startingIndex,
    (token) => token.type === "keyword" && token.value === "limit"
  );

  // Supported OFFSET syntaxes
  // OFFSET <offset_number> { ROW | ROWS }
  // LIMIT <offset_number>,<limit_number>
  // LIMIT <limit_number> OFFSET <offset_number>

  // OFFSET <offset_number> ROW/ROWS
  if (!limitKeywordToken) {
    const offsetKeywordToken = findParenLevelToken(
      tokens,
      startingIndex,
      (token) => token.type === "keyword" && token.value === "offset"
    );

    if (!offsetKeywordToken) {
      return null;
    }

    const offsetNumberToken = nextNonCommentNonWhitespace(
      tokens,
      offsetKeywordToken.index + 1
    );

    if (!offsetNumberToken) {
      throw new Error("Unexpected end of statement");
    }

    if (offsetNumberToken.type !== "number") {
      throw new Error(`Expected number got ${firstNumber.type}`);
    }

    const rowsToken = nextNonCommentNonWhitespace(
      tokens,
      offsetNumberToken.index + 1
    );

    if (!rowsToken) {
      throw new Error("Expected ROW or ROWS after offset_number");
    }

    if (
      rowsToken &&
      (rowsToken.value === "row" || rowsToken.value === "rows")
    ) {
      return offsetNumberToken;
    }
  }

  const firstNumber = nextNonCommentNonWhitespace(
    tokens,
    limitKeywordToken.index + 1
  );

  if (!firstNumber) {
    throw new Error("Unexpected end of statement");
  }

  if (firstNumber.type !== "number") {
    throw new Error(`Expected number got ${firstNumber.type}`);
  }

  const possibleCommaOrOffset = nextNonCommentNonWhitespace(
    tokens,
    firstNumber.index + 1
  );

  if (possibleCommaOrOffset) {
    // LIMIT <offset_number>,<limit_number>
    if (possibleCommaOrOffset.type === "comma") {
      const secondNumber = nextNonCommentNonWhitespace(
        tokens,
        possibleCommaOrOffset.index + 1
      );

      if (!secondNumber) {
        throw new Error("Unexpected end of statement");
      }

      if (secondNumber.type !== "number") {
        throw new Error(`Expected number got ${secondNumber.type}`);
      }

      return firstNumber;
    }
    // LIMIT <limit_number> OFFSET <offset_number>
    else if (
      possibleCommaOrOffset.type === "keyword" &&
      possibleCommaOrOffset.value === "offset"
    ) {
      const offsetNumber = nextNonCommentNonWhitespace(
        tokens,
        possibleCommaOrOffset.index + 1
      );

      if (!offsetNumber) {
        throw new Error("Unexpected end of statement");
      }

      if (offsetNumber.type !== "number") {
        throw new Error(`Expected number got ${offsetNumber.type}`);
      }

      return offsetNumber;
    }
  }

  return null;
}

/**
 * Adds offset to query that does not have it
 * @param {*} queryTokens
 * @param {*} statementKeywordIndex
 * @param {*} offset
 */
function add(queryTokens, statementKeywordIndex, offset) {
  // Find the limit token
  const limitToken = findParenLevelToken(
    queryTokens,
    statementKeywordIndex,
    (token) => token.type === "keyword" && token.value === "limit"
  );

  if (limitToken) {
    // Insert OFFSET after the LIMIT clause
    const nextToken = nextNonCommentNonWhitespace(
      queryTokens,
      limitToken.index + 2
    );

    const firstHalf = queryTokens.slice(0, nextToken.index + 1);
    const secondHalf = queryTokens.slice(nextToken.index + 1);
    return [
      ...firstHalf,
      createToken.singleSpace(),
      createToken.keyword("offset"),
      createToken.singleSpace(),
      createToken.number(offset),
      ...secondHalf,
    ];
  }
  return;
}

exports.has = has;
exports.add = add;
