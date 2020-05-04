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
        match: /"(?:\["\\]|[^\n"\\])*"/,
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

function tokenize(query) {
  const lexer = getLexer();
  const tokens = [];
  lexer.reset(query);
  let next = lexer.next();
  while (next) {
    tokens.push(next);
    next = lexer.next();
  }
  return tokens;
}

module.exports = {
  getLexer,
  tokenize,
};
