const assert = require("assert");
const sqlLimiter = require("../src/index");

function test(sqlText, expected) {
  const enforcedSql = sqlLimiter.limit(sqlText, "top", 100);
  assert.equal(enforcedSql, expected);
}

describe("top", function () {
  it("basic top not existing", function () {
    test(`SELECT * FROM something`, "SELECT top 100 * FROM something");
  });

  it("basic top not existing with semi", function () {
    test(`SELECT * FROM something;`, "SELECT top 100 * FROM something;");
  });

  it("basic top existing, under", function () {
    test(`SELECT TOP 1 * FROM something;`, `SELECT TOP 1 * FROM something;`);
  });

  it("basic top existing, over", function () {
    test(
      `SELECT TOP 999 * FROM something;`,
      "SELECT TOP 100 * FROM something;"
    );
  });

  it("cte top existing, over", function () {
    test(
      `WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 1) SELECT TOP 999 * FROM something;`,
      "WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 1) SELECT TOP 100 * FROM something;"
    );
  });

  it("throws for unexpected top", function () {
    assert.throws(() => test(`SELECT TOP * FROM something`));
  });

  it("handles line comment", function () {
    test(
      `SELECT -- comment \n  * FROM something`,
      `SELECT top 100 -- comment \n  * FROM something`
    );
  });

  it("handles query wrapped in parens", function () {
    test(
      `(SELECT * FROM ( select something OFFSET 1 ROW ))`,
      `(SELECT top 100 * FROM ( select something OFFSET 1 ROW ))`
    );
  });

  it("ignores non-select", function () {
    test(
      `INSERT INTO foo SELECT * FROM something`,
      `INSERT INTO foo SELECT * FROM something`
    );
  });
});
