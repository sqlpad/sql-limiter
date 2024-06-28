const assert = require("assert");
const sqlLimiter = require("../src/index");

function test(sqlText, expected) {
  const enforcedSql = sqlLimiter.limit(sqlText, "limit", 100, 10);
  assert.equal(enforcedSql, expected);
}

describe("offset", () => {
  it("basic limit not existing", () => {
    test(
      `SELECT * FROM something`,
      "SELECT * FROM something limit 100 offset 10"
    );
  });

  it("offset is not defined", () => {
    test(
      `SELECT * FROM something limit 100`,
      "SELECT * FROM something limit 100 offset 10"
    );
  });

  it("offset existing", () => {
    test(
      `SELECT i FROM t1 ORDER BY i ASC offset 10`,
      "SELECT i FROM t1 ORDER BY i ASC limit 100 offset 10"
    );
  });

  it("both limit and offset existing, over", () => {
    test(
      `SELECT * FROM something limit 10 offset 5`,
      "SELECT * FROM something limit 10 offset 5"
    );
  });

  it("handles cte", function () {
    test(
      `WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 1) SELECT * FROM something limit 999 ;`,
      "WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 1) SELECT * FROM something limit 100 offset 10 ;"
    );
  });

  it("throws for unexpected offset", function () {
    assert.throws(() => test(`SELECT * FROM something limit 100 offset`));
  });

  it("offset,limit existing, over", function () {
    test(
      `SELECT * FROM something limit 5, 10`,
      "SELECT * FROM something limit 5, 10"
    );
  });

  it("handles offset,limit", function () {
    test(
      `SELECT * FROM something limit 0,999`,
      `SELECT * FROM something limit 0,100`
    );
    test(
      `SELECT * FROM something limit 0 , 999`,
      `SELECT * FROM something limit 0 , 100`
    );
    test(
      `SELECT * FROM something limit 0 , 9`,
      `SELECT * FROM something limit 0 , 9`
    );
  });

  it("handles trailing line comment", function () {
    test(
      `SELECT * FROM something -- comment`,
      `SELECT * FROM something limit 100 offset 10 -- comment`
    );
  });

  it("handles subquery", function () {
    test(
      `SELECT * FROM ( select something OFFSET 1 ROW ) ;`,
      `SELECT * FROM ( select something OFFSET 1 ROW )  limit 100 offset 10;`
    );
  });

  it("handles query wrapped in parens", function () {
    test(
      `(SELECT * FROM ( select something OFFSET 1 ROW ))`,
      `(SELECT * FROM ( select something OFFSET 1 ROW ) limit 100 offset 10)`
    );
  });

  it("handles FOR", function () {
    test(
      `SELECT * FROM something FOR UPDATE ;`,
      `SELECT * FROM something limit 100 offset 10 FOR UPDATE ;`
    );
  });

  it("ignores non-select", function () {
    test(
      `INSERT INTO foo SELECT * FROM something`,
      `INSERT INTO foo SELECT * FROM something`
    );
  });
});
