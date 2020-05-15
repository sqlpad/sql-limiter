const enforceLimit = require("./enforce-limit");

class Statement {
  constructor() {
    this.tokens = [];
    this.parenLevel = 0;
    this.targetParenLevel = null;
    this.statementToken = null;
    this.fetchToken = null;
    this.limitToken = null;
  }

  appendToken(t) {
    const token = { ...t };
    token.parenLevel = this.parenLevel;
    // Index once token is added
    token.index = this.tokens.length;
    this.tokens.push(token);

    if (token.type === "lparen") {
      this.parenLevel++;
    } else if (token.type === "rparen") {
      this.parenLevel--;
    } else if (token.type === "keyword") {
      // If targetParenLevel has not yet been set,
      // we are dealing with the first keyword, which informs us of the "level"
      // we want to consider for finding SELECT statments
      if (this.targetParenLevel === null) {
        this.targetParenLevel = this.parenLevel;
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
        !this.statementToken &&
        this.targetParenLevel === this.parenLevel &&
        token.value !== "with" &&
        token.value !== "as"
      ) {
        this.statementToken = token;
      }
    }
  }

  enforceLimit(strategies, limitNumber) {
    if (this.statementToken && this.statementToken.value === "select") {
      this.tokens = enforceLimit(
        this.statementToken,
        this.tokens,
        strategies,
        limitNumber
      );
    }
  }

  toString(stripTerminator = false) {
    if (stripTerminator) {
      return this.tokens
        .filter((t) => t.type !== "terminator")
        .map((t) => t.text)
        .join("");
    }
    return this.tokens.map((token) => token.text).join("");
  }
}

module.exports = Statement;
