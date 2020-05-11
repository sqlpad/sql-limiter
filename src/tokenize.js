const moo = require("moo");
const keywords = require("./keywords.js");

// Incoming values will also be compared as lower case to make keyword matching case insensitive
const caseInsensitiveKeywords = (defs) => {
  const defineKeywords = moo.keywords(defs);
  return (value) => defineKeywords(value.toLowerCase());
};

const lexer = moo.compile({
  whitespace: [/[ \t]+/, { match: /\n/, lineBreaks: true }],
  // First expression is --line comment, second is /* multi line */
  comment: [/--.*?$/, /\/\*[^]*?\*\//],
  lparen: "(",
  rparen: ")",
  comma: ",",
  period: ".",

  number: /0|[1-9][0-9]*/,

  // ; is standard, \g is a shortcut used in psql and Actian tooling
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

/**
 * Takes SQL text and generates an array of tokens using moo
 * @param {string} sqlText
 */
function tokenize(sqlText) {
  const tokens = [];
  lexer.reset(sqlText);
  let next = lexer.next();
  while (next) {
    tokens.push(next);
    next = lexer.next();
  }
  return tokens;
}

module.exports = tokenize;
