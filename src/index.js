const fs = require("fs");
const moo = require("moo");
const path = require("path");

// Load keywords, converting all to lower case
const keywords = fs
  .readFileSync(path.join(__dirname, "keywords.txt"), "utf8")
  .split("\n")
  .map((kw) => kw.trim().toLowerCase())
  .filter((kw) => Boolean(kw));

// Incoming values will also be compared as lower case to make keyword matching case insensitive
const caseInsensitiveKeywords = (defs) => {
  const keywords = moo.keywords(defs);
  return (value) => keywords(value.toLowerCase());
};

function getLexer() {
  return moo.compile({
    whitespace: /[ \t]+/,
    newline: { match: /\n/, lineBreaks: true },
    lineComment: /--.*?$/,
    multiComment: /\/\*[^]*?\*\//,
    lparen: "(",
    rparen: ")",
    comma: ",",
    period: ".",

    number: /0|[1-9][0-9]*/,

    // ; is standard, \g is used for Actian dbs
    // Are there others?
    terminator: [";", "\\g"],

    // text == original text
    // value == value inside quotes
    quotedIdentifier: [
      {
        match: /".*?"/,
        value: (x) => x.slice(1, -1),
      },
      {
        match: /\[.*?\]/,
        value: (x) => x.slice(1, -1),
      },
    ],

    // text == original text
    // value == value inside quotes
    string: /'(?:\\['\\]|[^\n'\\])*'/,

    // Remaining test is assumed to be an identifier of some kinds (column or table)
    // UNLESS it matches a keyword case insensitively
    // The value of these tokens are converted to lower case
    identifier: {
      match: /[a-zA-Z_0-9]+/,
      type: caseInsensitiveKeywords({
        keyword: keywords,
      }),
      value: (s) => s.toLowerCase(),
    },

    // Any combination of special characters is to be treated as an operator (as a guess anyways)
    // Initially these were being noted here but the list is large
    // and there is no way to know all operators since this supports anything that is SQL-ish
    operator: {
      match: /[<>~!@#$%^?&|`*\-{}+=:/\\[\]]+/,
      lineBreaks: false,
    },
  });
}

/**
 * Takes SQL text and generates an array of tokens using moo
 * @param {string} sqlText
 */
function tokenize(sqlText) {
  const lexer = getLexer();
  const tokens = [];
  lexer.reset(sqlText);
  let next = lexer.next();
  while (next) {
    tokens.push(next);
    next = lexer.next();
  }
  return tokens;
}

/**
 * Splits sql text into an array of arrays of tokens
 * If includeTerminators is set, they are included in the token results.
 * If a set of tokens includes only whitespace, it is not considered a query
 * @param {string} sqlText
 */
function getQueriesTokens(sqlText) {
  const tokens = tokenize(sqlText);
  const queriesTokens = [];
  let queryTokens = [];
  tokens.forEach((token) => {
    queryTokens.push(token);
    if (token.type === "terminator") {
      queriesTokens.push(queryTokens);
      queryTokens = [];
    }
  });
  return queriesTokens;
}

/**
 * Takes SQL text and splits it by terminator
 * Returns array of single SQL statements.
 * Extra spaces trailing terminator are not returned for a query
 * @param {string} sqlText
 * @param {boolean} includeTerminators = include terminators in individual queries
 */
function getQueries(sqlText, includeTerminators = false) {
  const queries = [];
  const queriesTokens = getQueriesTokens(sqlText, includeTerminators);
  queriesTokens.forEach((queryTokens) => {
    // if set of tokens has something other than whitespace/terminators, consider it
    if (
      queryTokens.filter(
        (t) =>
          t.type !== "whitespace" &&
          t.type !== "terminator" &&
          t.type !== "newline"
      ).length > 0
    ) {
      if (includeTerminators) {
        const query = queryTokens.map((token) => token.text).join("");
        queries.push(query);
      } else {
        const query = queryTokens
          .filter((token) => token.type !== "terminator")
          .map((token) => token.text)
          .join("");
        queries.push(query);
      }
    }
  });
  return queries;
}

module.exports = {
  getLexer,
  getQueries,
  getQueriesTokens,
  tokenize,
};
