const assert = require("assert");
const sqlLimiter = require("../src/index");

function test(sqlText, expected) {
  const enforcedSql = sqlLimiter.limit(sqlText, "fetch", 100);
  assert.equal(enforcedSql, expected);
}

describe("fetch", function () {
  it("basic fetch not existing", function () {
    test(
      `SELECT * FROM something`,
      "SELECT * FROM something fetch first 100 rows only"
    );
  });

  it("basic fetch not existing with semi", function () {
    test(
      `SELECT * FROM something;`,
      "SELECT * FROM something fetch first 100 rows only;"
    );
  });

  it("basic fetch existing, under", function () {
    test(
      `SELECT * FROM something FETCH FIRST 1 ROWS ONLY;`,
      "SELECT * FROM something FETCH FIRST 1 ROWS ONLY;"
    );
  });

  it("basic fetch first existing, over", function () {
    test(
      `SELECT * FROM something FETCH FIRST 999 ROWS ONLY;`,
      "SELECT * FROM something FETCH FIRST 100 ROWS ONLY;"
    );
  });

  it("basic fetch next existing, over", function () {
    test(
      `SELECT * FROM something FETCH NEXT 999 ROWS ONLY;`,
      "SELECT * FROM something FETCH NEXT 100 ROWS ONLY;"
    );
  });

  it("cte fetch existing, over", function () {
    test(
      `WITH cte AS (SELECT TOP 1 * FROM foo FETCH FIRST 999 ROWS ONLY) SELECT * FROM something FETCH FIRST 999 ROWS ONLY ;`,
      "WITH cte AS (SELECT TOP 1 * FROM foo FETCH FIRST 999 ROWS ONLY) SELECT * FROM something FETCH FIRST 100 ROWS ONLY ;"
    );
  });

  it("throws for unexpected fetch", function () {
    assert.throws(() => test(`SELECT * FROM something fetch`));
  });

  it("handles offset", function () {
    test(
      `SELECT * FROM something OFFSET 1 FETCH FIRST 999 rows only`,
      `SELECT * FROM something OFFSET 1 FETCH FIRST 100 rows only`
    );
  });

  it("handles trailing line comment", function () {
    test(
      `SELECT * FROM something -- comment`,
      `SELECT * FROM something fetch first 100 rows only -- comment`
    );
  });

  it("handles offset with ROWS", function () {
    test(
      `SELECT * FROM something OFFSET 1 ROWS ;`,
      `SELECT * FROM something OFFSET 1 ROWS  fetch first 100 rows only;`
    );
  });

  it("handles offset with ROW", function () {
    test(
      `SELECT * FROM something OFFSET 1 ROW ;`,
      `SELECT * FROM something OFFSET 1 ROW  fetch first 100 rows only;`
    );
  });

  it("handles offset in subquery", function () {
    test(
      `SELECT * FROM ( select something OFFSET 1 ROW ) ;`,
      `SELECT * FROM ( select something OFFSET 1 ROW )  fetch first 100 rows only;`
    );
  });

  it("handles offset in subquery no ;", function () {
    test(
      `SELECT * FROM ( select something OFFSET 1 ROW )`,
      `SELECT * FROM ( select something OFFSET 1 ROW ) fetch first 100 rows only`
    );
  });

  it("handles query wrapped in parens", function () {
    test(
      `(SELECT * FROM ( select something OFFSET 1 ROW ))`,
      `(SELECT * FROM ( select something OFFSET 1 ROW ) fetch first 100 rows only)`
    );
  });

  it("handles FOR", function () {
    test(
      `SELECT * FROM something FOR UPDATE ;`,
      `SELECT * FROM something fetch first 100 rows only FOR UPDATE ;`
    );
  });

  it("handles offset no limit", function () {
    test(
      `SELECT * FROM something OFFSET 1`,
      `SELECT * FROM something OFFSET 1 fetch first 100 rows only`
    );
  });

  it("ignores non-select", function () {
    test(
      `INSERT INTO foo SELECT * FROM something`,
      `INSERT INTO foo SELECT * FROM something`
    );
  });
});
