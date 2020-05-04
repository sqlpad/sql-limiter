const { hasTokenValueCount } = require("./utils");

describe("token identification", function () {
  it("line comments", function () {
    const str = `
      select -- ;this is -- /* something */ a comment
      FROM table_a
    `;

    hasTokenValueCount(
      str,
      "lineComment",
      "-- ;this is -- /* something */ a comment",
      1
    );
  });

  it("multiline comments", function () {
    const str = `
      select /* /*** ---line
      -- /*
      comment
      */ a comment /* ;{()} */
      FROM table_a
    `;

    hasTokenValueCount(
      str,
      "multiComment",
      `/* /*** ---line
      -- /*
      comment
      */`,
      1
    );

    hasTokenValueCount(str, "multiComment", `/* ;{()} */`, 1);
  });

  it("identifies operators", function () {
    hasTokenValueCount("<> = > < <= >=", "operator", "<>", 1);
    hasTokenValueCount("<> = > < <= >=", "operator", "=", 1);
    hasTokenValueCount("<> = > < <= >=", "operator", ">", 1);
    hasTokenValueCount("<> = > < <= >=", "operator", "<", 1);
    hasTokenValueCount("<> = > < <= >=", "operator", "<=", 1);
    hasTokenValueCount("<> = > < <= >=", "operator", ">=", 1);
  });

  it("keywords are lower case", function () {
    hasTokenValueCount("select FROM", "keyword", "select", 1);
    hasTokenValueCount("select FROM", "keyword", "from", 1);
  });

  it("non-quoted identifiers are lower case", function () {
    hasTokenValueCount(`FROM Table_A`, "identifier", "table_a", 1);
  });

  it("quoted identifiers are original case", function () {
    hasTokenValueCount(`FROM "Table_A"`, "quotedIdentifier", "Table_A", 1);
  });

  it("quoted identifiers w/space", function () {
    hasTokenValueCount(`FROM "Table A"`, "quotedIdentifier", "Table A", 1);
  });

  it("terminates as expected", function () {
    //
  });
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
 MAX(300)
`;
