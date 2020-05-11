const assert = require("assert");
const enforceLimit = require("../src/enforce-limit");
const getQueriesTokens = require("../src/get-queries-tokens");

function test(sqlText, expected) {
  const queriesTokens = getQueriesTokens(sqlText);
  const queryTokens = enforceLimit(queriesTokens[0], 1000);
  const enforcedSql = queryTokens.map((t) => t.text).join("");
  assert.equal(enforcedSql, expected);
}

describe("enforceLimit", function () {
  it("basic limit not existing", function () {
    test(`SELECT * FROM something`, "SELECT * FROM something limit 1000");
  });

  it("basic limit not existing with semi", function () {
    test(`SELECT * FROM something;`, "SELECT * FROM something limit 1000;");
  });

  it("basic limit existing, under", function () {
    test(
      `SELECT * FROM something LIMIT 10;`,
      "SELECT * FROM something LIMIT 10;"
    );
  });

  it("basic limit existing, over", function () {
    test(
      `SELECT * FROM something LIMIT 9999;`,
      "SELECT * FROM something LIMIT 1000;"
    );
  });

  it("cte limit existing, over", function () {
    test(
      `WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 10) SELECT * FROM something LIMIT 9999 ;`,
      "WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 10) SELECT * FROM something LIMIT 1000 ;"
    );
  });

  it("throws for unexpected limit", function () {
    assert.throws(() => test(`SELECT * FROM something limit`));
  });

  it("handles offset", function () {
    test(
      `SELECT * FROM something limit 9999 OFFSET 10`,
      `SELECT * FROM something limit 1000 OFFSET 10`
    );
  });

  it("handles trailing line comment", function () {
    test(
      `SELECT * FROM something -- comment`,
      `SELECT * FROM something limit 1000 -- comment`
    );
  });

  it("handles trailing line before offset", function () {
    test(
      `SELECT * FROM something -- comment\nOFFSET 10`,
      `SELECT * FROM something -- comment\nlimit 1000 OFFSET 10`
    );
  });

  it("handles multiline before offset", function () {
    test(
      `SELECT * FROM something -- comment\n/* comment */ OFFSET 10`,
      `SELECT * FROM something -- comment\n/* comment */ limit 1000 OFFSET 10`
    );
  });

  it("handles offset with ROWS", function () {
    test(
      `SELECT * FROM something OFFSET 10 ROWS ;`,
      `SELECT * FROM something limit 1000 OFFSET 10 ROWS ;`
    );
  });

  it("handles offset with ROW", function () {
    test(
      `SELECT * FROM something OFFSET 10 ROW ;`,
      `SELECT * FROM something limit 1000 OFFSET 10 ROW ;`
    );
  });

  it("handles offset in subquery", function () {
    test(
      `SELECT * FROM ( select something OFFSET 10 ROW ) ;`,
      `SELECT * FROM ( select something OFFSET 10 ROW )  limit 1000;`
    );
  });

  it("handles offset in subquery no ;", function () {
    test(
      `SELECT * FROM ( select something OFFSET 10 ROW )`,
      `SELECT * FROM ( select something OFFSET 10 ROW ) limit 1000`
    );
  });

  it("handles query wrapped in parens", function () {
    test(
      `(SELECT * FROM ( select something OFFSET 10 ROW ))`,
      `(SELECT * FROM ( select something OFFSET 10 ROW ) limit 1000)`
    );
  });

  it("handles FOR", function () {
    test(
      `SELECT * FROM something FOR UPDATE ;`,
      `SELECT * FROM something limit 1000 FOR UPDATE ;`
    );
  });

  it("handles offset no limit", function () {
    test(
      `SELECT * FROM something OFFSET 10`,
      `SELECT * FROM something limit 1000 OFFSET 10`
    );
  });

  it("ignores non-select", function () {
    test(
      `INSERT INTO foo SELECT * FROM something`,
      `INSERT INTO foo SELECT * FROM something`
    );
  });
});
