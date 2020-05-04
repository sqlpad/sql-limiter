const { hasTokens } = require("./utils");

describe("tokenize", function () {
  it("line comments", function () {
    const str = `
      select -- ;this is -- /* something */ a comment
      FROM table_a
    `;

    hasTokens(
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

    hasTokens(
      str,
      "multiComment",
      `/* /*** ---line
      -- /*
      comment
      */`,
      1
    );

    hasTokens(str, "multiComment", `/* ;{()} */`, 1);
  });

  it("identifies operators", function () {
    hasTokens("<> = > < <= >=", "operator", "<>", 1);
    hasTokens("<> = > < <= >=", "operator", "=", 1);
    hasTokens("<> = > < <= >=", "operator", ">", 1);
    hasTokens("<> = > < <= >=", "operator", "<", 1);
    hasTokens("<> = > < <= >=", "operator", "<=", 1);
    hasTokens("<> = > < <= >=", "operator", ">=", 1);
  });

  it("keywords are lower case", function () {
    hasTokens("select FROM", "keyword", "select", 1);
    hasTokens("select FROM", "keyword", "from", 1);
  });

  it("non-quoted identifiers are lower case", function () {
    hasTokens(`FROM Table_A`, "identifier", "table_a", 1);
  });

  it("quoted identifiers are original case", function () {
    hasTokens(`FROM "Table_A"`, "quotedIdentifier", "Table_A", 1);
  });

  it("quoted identifiers w/space", function () {
    hasTokens(`FROM "Table A"`, "quotedIdentifier", "Table A", 1);
  });

  it("quoted bracket identifiers", function () {
    hasTokens(`FROM [Table A]`, "quotedIdentifier", "Table A", 1);
    hasTokens(`FROM [Table A]`, "operator", "[", 0);
    hasTokens(`FROM [Table A]`, "operator", "]", 0);
  });

  it("quoted identifiers w/comment", function () {
    hasTokens(`FROM " /* /*  */"`, "quotedIdentifier", " /* /*  */", 1);
  });

  it("terminates as expected", function () {
    // Ansi style
    hasTokens(`select ; select; -- ;\n select /* ; */`, "terminator", ";", 2);
    // Actian style
    hasTokens(
      `select \\g select\\g -- \\g\n select /* \\g */`,
      "terminator",
      "\\g",
      2
    );
    // Mixed
    hasTokens(`select ; \\g ;`, "terminator", ";", 2);
    hasTokens(`select ; \\g ;`, "terminator", "\\g", 1);
  });
});
