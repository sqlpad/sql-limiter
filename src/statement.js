/* eslint-disable no-restricted-syntax */
const strategies = require("./strategies");
const offset = require("./offset");

class Statement {
  constructor() {
    this.endReached = false;
    this.isProcedure = false;
    this.tokens = [];
    this.parenLevel = 0;
    this.beginCount = 0;
    this.endCount = 0;
    this.targetParenLevel = null;
    this.statementToken = null;
    this.fetchToken = null;
    this.limitToken = null;
  }

  /**
   * Returns the statement type keyword in lower case.
   * If CTE is detected, the first keywords after WITH and AS is returned
   * @returns string
   */
  getStatementType() {
    if (this.statementToken) {
      return this.statementToken.value;
    }
    return undefined;
  }

  appendToken(t) {
    const token = { ...t };
    token.parenLevel = this.parenLevel;
    // Index once token is added
    token.index = this.tokens.length;
    this.tokens.push(token);

    // Keep track of level of begin/end.
    // This is for tracking begin/end blocks for stored procedures and similar
    // Queries within begin/end are ignored for better or for worse
    if (token.type === "keyword" && token.value === "begin") {
      this.beginCount++;
    } else if (token.type === "keyword" && token.value === "end") {
      this.endCount++;
    }

    // If terminator and we're not inside a BEGIN/END block
    if (token.type === "terminator" && this.beginCount === this.endCount) {
      // This is funky, but some procedure syntaxes like Actian allow a terminator before the BEGIN keyword
      // *Most* procedures use BEGIN/END blocks though, so if we're dealing with a procedure, make sure we've had at least 1 END
      // (not sure if BEGIN/END can be nested)
      // Otherwise if this is not a procedure and we're dealing with a terminator, the terminator outside a BEGIN/END block is the real terminator
      if ((this.isProcedure && this.endCount > 0) || !this.isProcedure) {
        this.endReached = true;
      }
    } else if (token.type === "lparen") {
      this.parenLevel++;
    } else if (token.type === "rparen") {
      this.parenLevel--;
    } else if (token.type === "keyword") {
      if (token.value === "procedure") {
        this.isProcedure = true;
      }

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

  /**
   *
   * @param {Array<String>} strategiesToEnforce
   * @param {Number} limitNumber
   */
  enforceLimit(strategiesToEnforce, limitNumber) {
    const { statementToken, tokens } = this;

    strategiesToEnforce.forEach((s) => {
      if (!strategies[s]) {
        throw new Error(`Strategy ${s} not supported`);
      }
    });

    if (statementToken && statementToken.value === "select") {
      for (const toEnforce of strategiesToEnforce) {
        const strategyImplementation = strategies[toEnforce];
        const numberToken = strategyImplementation.has(
          tokens,
          statementToken.index
        );

        // If number token, check to see if over the limit and reset it if it is
        // Otherwise return early
        if (numberToken) {
          if (parseInt(numberToken.value, 10) > limitNumber) {
            const firstHalf = tokens.slice(0, numberToken.index);
            const secondhalf = tokens.slice(numberToken.index + 1);
            this.tokens = [
              ...firstHalf,
              { ...numberToken, text: limitNumber, value: limitNumber },
              ...secondhalf,
            ];
            return;
          }
          return;
        }
      }

      // An existing limit strategy was not found,
      // so take the first one in list of strategies to enforce and add it to tokens
      const preferredStrategy = strategiesToEnforce[0];
      this.tokens = strategies[preferredStrategy].add(
        tokens,
        statementToken.index,
        statementToken.parenLevel,
        limitNumber
      );
    }
  }

  /**
   * @param {number} offsetNumber
   */
  injectOffset(offsetNumber) {
    const { statementToken, tokens } = this;

    if (statementToken && statementToken.value === "select") {
      const offsetToken = offset.has(tokens, statementToken.index);
      // If offset token exists already, return early
      if (offsetToken) {
        return;
      }

      // Offset clause was not found, so add it
      this.tokens = offset.add(tokens, statementToken.index, offsetNumber);
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
