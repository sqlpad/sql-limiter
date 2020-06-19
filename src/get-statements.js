const moo = require("moo");
const keywords = require("./keywords.js");
const Statement = require("./statement");

// Incoming values will also be compared as lower case to make keyword matching case insensitive
const caseInsensitiveKeywords = (defs) => {
  const defineKeywords = moo.keywords(defs);
  return (value) => defineKeywords(value.toLowerCase());
};

const lexer = moo.compile({
  whitespace: [
    /[ \t]+/u,
    { match: /\r\n/u, lineBreaks: true },
    { match: /\n/u, lineBreaks: true },
  ],
  // First expression is --line comment, second is /* multi line */
  comment: [/--.*?$/u, /\/\*[^]*?\*\//u],
  lparen: "(",
  rparen: ")",
  comma: ",",
  period: ".",

  number: /0|[1-9][0-9]*/u,

  // ; is standard, \g is a shortcut used in psql and Actian tooling
  // Are there others?
  terminator: [";", "\\g"],

  // text == original text
  // value == value inside quotes
  quotedIdentifier: [
    {
      match: /".*?"/u,
      value: (x) => x.slice(1, -1),
    },
    {
      match: /\[.*?\]/u,
      value: (x) => x.slice(1, -1),
    },
    {
      match: /`.*?`/u,
      value: (x) => x.slice(1, -1),
    },
  ],

  // text == original text
  string: /'(?:\\['\\]|[^\n'\\])*'/u,

  // Remaining test is assumed to be an identifier of some kinds (column or table)
  // UNLESS it matches a keyword case insensitively
  // The value of these tokens are converted to lower case
  identifier: [
    {
      // This is added to handle non-english identifiers.
      // This range may be too broad
      // eslint-disable-next-line no-control-regex
      match: /(?:\w|[^\u0000-\u007F])+/u,
      type: caseInsensitiveKeywords({
        keyword: keywords,
      }),
      value: (s) => s.toLowerCase(),
    },
  ],

  // Any combination of special characters is to be treated as an operator (as a guess anyways)
  // Initially these were being noted here but the list is large
  // and there is no way to know all operators since this supports anything that is SQL-ish
  operator: {
    match: /[<>~!@#$%^?&|`*\-{}+=:/\\[\]]+/u,
    lineBreaks: false,
  },
});

/**
 * Takes SQL text and generates an array of tokens using moo
 * @param {string} sqlText
 */
function getStatements(sqlText) {
  const statements = [];
  let statement = new Statement();

  lexer.reset(sqlText);
  let next = lexer.next();

  while (next) {
    statement.appendToken(next);
    if (next.type === "terminator") {
      statements.push(statement);
      statement = new Statement();
    }
    next = lexer.next();
  }
  // push last set
  if (statement.tokens.length) {
    statements.push(statement);
  }
  return statements;
}

module.exports = getStatements;
