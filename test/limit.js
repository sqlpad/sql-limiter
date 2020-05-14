const assert = require("assert");
const sqlLimiter = require("../src/index");

function test(sqlText, expected) {
  const enforcedSql = sqlLimiter.limit(sqlText, "limit", 100);
  assert.equal(enforcedSql, expected);
}

describe("limit", function () {
  it("basic limit not existing", function () {
    test(`SELECT * FROM something`, "SELECT * FROM something limit 100");
  });

  it("basic limit not existing with semi", function () {
    test(`SELECT * FROM something;`, "SELECT * FROM something limit 100;");
  });

  it("basic limit existing, under", function () {
    test(
      `SELECT * FROM something LIMIT 1;`,
      "SELECT * FROM something LIMIT 1;"
    );
  });

  it("basic limit existing, over", function () {
    test(
      `SELECT * FROM something LIMIT 999;`,
      "SELECT * FROM something LIMIT 100;"
    );
  });

  it("cte limit existing, over", function () {
    test(
      `WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 1) SELECT * FROM something LIMIT 999 ;`,
      "WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 1) SELECT * FROM something LIMIT 100 ;"
    );
  });

  it("throws for unexpected limit", function () {
    assert.throws(() => test(`SELECT * FROM something limit`));
  });

  it("handles offset", function () {
    test(
      `SELECT * FROM something limit 999 OFFSET 1`,
      `SELECT * FROM something limit 100 OFFSET 1`
    );
  });

  it("handles trailing line comment", function () {
    test(
      `SELECT * FROM something -- comment`,
      `SELECT * FROM something limit 100 -- comment`
    );
  });

  it("handles trailing line before offset", function () {
    test(
      `SELECT * FROM something -- comment\nOFFSET 1`,
      `SELECT * FROM something -- comment\nlimit 100 OFFSET 1`
    );
  });

  it("handles multiline before offset", function () {
    test(
      `SELECT * FROM something -- comment\n/* comment */ OFFSET 1`,
      `SELECT * FROM something -- comment\n/* comment */ limit 100 OFFSET 1`
    );
  });

  it("handles offset with ROWS", function () {
    test(
      `SELECT * FROM something OFFSET 1 ROWS ;`,
      `SELECT * FROM something limit 100 OFFSET 1 ROWS ;`
    );
  });

  it("handles offset with ROW", function () {
    test(
      `SELECT * FROM something OFFSET 1 ROW ;`,
      `SELECT * FROM something limit 100 OFFSET 1 ROW ;`
    );
  });

  it("handles offset in subquery", function () {
    test(
      `SELECT * FROM ( select something OFFSET 1 ROW ) ;`,
      `SELECT * FROM ( select something OFFSET 1 ROW )  limit 100;`
    );
  });

  it("handles offset in subquery no ;", function () {
    test(
      `SELECT * FROM ( select something OFFSET 1 ROW )`,
      `SELECT * FROM ( select something OFFSET 1 ROW ) limit 100`
    );
  });

  it("handles query wrapped in parens", function () {
    test(
      `(SELECT * FROM ( select something OFFSET 1 ROW ))`,
      `(SELECT * FROM ( select something OFFSET 1 ROW ) limit 100)`
    );
  });

  it("handles FOR", function () {
    test(
      `SELECT * FROM something FOR UPDATE ;`,
      `SELECT * FROM something limit 100 FOR UPDATE ;`
    );
  });

  it("handles offset no limit", function () {
    test(
      `SELECT * FROM something OFFSET 1`,
      `SELECT * FROM something limit 100 OFFSET 1`
    );
  });

  it("ignores non-select", function () {
    test(
      `INSERT INTO foo SELECT * FROM something`,
      `INSERT INTO foo SELECT * FROM something`
    );
  });
});
