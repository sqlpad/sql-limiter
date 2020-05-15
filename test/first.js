const assert = require("assert");
const sqlLimiter = require("../src/index");

function test(sqlText, expected) {
  const enforcedSql = sqlLimiter.limit(sqlText, "first", 100);
  assert.equal(enforcedSql, expected);
}

describe("first", function () {
  it("basic first not existing", function () {
    test(`SELECT * FROM something`, "SELECT first 100 * FROM something");
  });

  it("basic first not existing with semi", function () {
    test(`SELECT * FROM something;`, "SELECT first 100 * FROM something;");
  });

  it("basic first existing, under", function () {
    test(
      `SELECT FIRST 1 * FROM something;`,
      `SELECT FIRST 1 * FROM something;`
    );
  });

  it("basic first existing, over", function () {
    test(
      `SELECT FIRST 999 * FROM something;`,
      "SELECT FIRST 100 * FROM something;"
    );
  });

  it("cte first existing, over", function () {
    test(
      `WITH cte AS (SELECT FIRST 1 * FROM foo LIMIT 1) SELECT FIRST 999 * FROM something;`,
      "WITH cte AS (SELECT FIRST 1 * FROM foo LIMIT 1) SELECT FIRST 100 * FROM something;"
    );
  });

  it("throws for unexpected first", function () {
    assert.throws(() => test(`SELECT FIRST * FROM something`));
  });

  it("handles line comment", function () {
    test(
      `SELECT -- comment \n  * FROM something`,
      `SELECT first 100 -- comment \n  * FROM something`
    );
  });

  it("handles query wrapped in parens", function () {
    test(
      `(SELECT * FROM ( select something OFFSET 1 ROW ))`,
      `(SELECT first 100 * FROM ( select something OFFSET 1 ROW ))`
    );
  });

  it("ignores non-select", function () {
    test(
      `INSERT INTO foo SELECT * FROM something`,
      `INSERT INTO foo SELECT * FROM something`
    );
  });
});
