const createToken = require("./create-token");
const {
  findParenLevelToken,
  findLimitInsertionIndex,
  nextNonCommentNonWhitespace,
} = require("./token-utils");

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

module.exports = {
  hasFetch,
  addFetch,
};
