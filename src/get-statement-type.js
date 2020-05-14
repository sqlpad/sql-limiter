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
  let statementToken;

  for (let index = 0; index < queryTokens.length; index++) {
    const token = queryTokens[index];
    token.parenLevel = parenLevel;
    token.index = index;

    if (token.type === "lparen") {
      parenLevel++;
    } else if (token.type === "rparen") {
      parenLevel--;
    } else if (token.type === "keyword") {
      // If targetParenLevel has not yet been set,
      // we are dealing with the first keyword, which informs us of the "level"
      // we want to consider for finding SELECT statments
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
        !statementToken &&
        targetParenLevel === parenLevel &&
        token.value !== "with" &&
        token.value !== "as"
      ) {
        statementToken = token;
      }

      // If we have the statement token identified
      // And the query is a SELECT, and we're at the right paren level
      // Check for other important keywords and take note of them
      // LIMIT, FETCH, and FIRST need to be noted
      if (statementToken && parenLevel === statementToken.parenLevel) {
        // TODO
      }
    }
  }

  return statementToken;
}

module.exports = getStatementType;
