const moo = require("moo");

const caseInsensitiveKeywords = (defs) => {
  const keywords = moo.keywords(defs);
  return (value) => keywords(value.toLowerCase());
};

const lexer = moo.compile({
  whitespace: /[ \t]+/,
  lineComment: /--.*?$/,
  multiComment: /\/\*[^]*?\*\//,
  number: /0|[1-9][0-9]*/,
  quotedIdentifier: /"(?:\["\\]|[^\n"\\])*"/,
  string: /'(?:\\['\\]|[^\n'\\])*'/,
  lparen: "(",
  rparen: ")",
  comma: ",",
  equals: "=",
  delimiter: [";", "/g"],
  // identifier: {
  //   match: /[a-zA-Z_0-9]+/,
  //   type: moo.keywords({
  //     KW: ["with", "if", "LIMIT"],
  //   }),
  // },
  identifier: {
    match: /[a-zA-Z_0-9]+/,
    type: caseInsensitiveKeywords({ keyword: ["with", "max", "limit"] }),
  },
  // keyword: ["with", "while", "if", "else", "moo", "limit"],
  newline: { match: /\n/, lineBreaks: true },
  // identifier: /[a-zA-Z_0-9]+/,
  myError: moo.error,
});

const query = `
  WITH cte_a (a, b) AS (
    select a, b
    FROM table_a
  )
  SELECT a AS "col a"
  FROM "cte_a"
  where a = 'something' 
  /* comment */
  /*
  comment; /*
  */
 /g ; ';'
 LIMIT 100
 limit 200
 max(300)
`;

lexer.reset(query);

let next = lexer.next();
while (next) {
  console.log(next);
  next = lexer.next();
}
