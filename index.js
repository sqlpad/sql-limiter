const fs = require("fs");
const moo = require("moo");

// Load keywords, converting all to lower case
const keywords = fs
  .readFileSync("./keywords.txt", "utf8")
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
      match: /[<>~!@#$%^?&|`*\-{}+=:\/\\\[\]]+/,
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
 * Takes SQL text and splits it by terminator
 * Returns array of single SQL statements.
 * Extra spaces trailing terminator are not returned for a query
 * @param {string} sqlText
 * @param {boolean} includeTerminators = include terminators in individual queries
 */
function split(sqlText, includeTerminators = false) {
  const tokens = tokenize(sqlText);
  const queries = [];
  let query = "";
  tokens.forEach((token) => {
    if (token.type === "terminator") {
      if (includeTerminators) {
        query += token.text;
      }
      if (query.trim() !== "") {
        queries.push(query);
      }
      query = "";
    } else {
      query += token.text;
    }
  });
  // any remaining text is pushed to queries if it has something
  if (query.trim() !== "") {
    queries.push(query);
  }
  return queries;
}

module.exports = {
  getLexer,
  tokenize,
  split,
};
