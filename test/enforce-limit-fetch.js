const assert = require("assert");
const enforceLimit = require("../src/enforce-limit");
const getQueriesTokens = require("../src/get-queries-tokens");

function test(sqlText, expected) {
  const queriesTokens = getQueriesTokens(sqlText);
  const queryTokens = enforceLimit(queriesTokens[0], "fetch", 1000);
  const enforcedSql = queryTokens.map((t) => t.text).join("");
  assert.equal(enforcedSql, expected);
}

describe("enforceLimit: fetch", function () {
  it("basic fetch not existing", function () {
    test(
      `SELECT * FROM something`,
      "SELECT * FROM something fetch first 1000 rows only"
    );
  });

  it("basic fetch not existing with semi", function () {
    test(
      `SELECT * FROM something;`,
      "SELECT * FROM something fetch first 1000 rows only;"
    );
  });

  it("basic fetch existing, under", function () {
    test(
      `SELECT * FROM something FETCH FIRST 10 ROWS ONLY;`,
      "SELECT * FROM something FETCH FIRST 10 ROWS ONLY;"
    );
  });

  it("basic fetch first existing, over", function () {
    test(
      `SELECT * FROM something FETCH FIRST 9999 ROWS ONLY;`,
      "SELECT * FROM something FETCH FIRST 1000 ROWS ONLY;"
    );
  });

  it("basic fetch next existing, over", function () {
    test(
      `SELECT * FROM something FETCH NEXT 9999 ROWS ONLY;`,
      "SELECT * FROM something FETCH NEXT 1000 ROWS ONLY;"
    );
  });

  it("cte fetch existing, over", function () {
    test(
      `WITH cte AS (SELECT TOP 1 * FROM foo FETCH FIRST 9999 ROWS ONLY) SELECT * FROM something FETCH FIRST 9999 ROWS ONLY ;`,
      "WITH cte AS (SELECT TOP 1 * FROM foo FETCH FIRST 9999 ROWS ONLY) SELECT * FROM something FETCH FIRST 1000 ROWS ONLY ;"
    );
  });

  it("throws for unexpected fetch", function () {
    assert.throws(() => test(`SELECT * FROM something fetch`));
  });

  it("handles offset", function () {
    test(
      `SELECT * FROM something OFFSET 10 FETCH FIRST 9999 rows only`,
      `SELECT * FROM something OFFSET 10 FETCH FIRST 1000 rows only`
    );
  });

  it("handles trailing line comment", function () {
    test(
      `SELECT * FROM something -- comment`,
      `SELECT * FROM something fetch first 1000 rows only -- comment`
    );
  });

  it("handles offset with ROWS", function () {
    test(
      `SELECT * FROM something OFFSET 10 ROWS ;`,
      `SELECT * FROM something OFFSET 10 ROWS  fetch first 1000 rows only;`
    );
  });

  it("handles offset with ROW", function () {
    test(
      `SELECT * FROM something OFFSET 10 ROW ;`,
      `SELECT * FROM something OFFSET 10 ROW  fetch first 1000 rows only;`
    );
  });

  it("handles offset in subquery", function () {
    test(
      `SELECT * FROM ( select something OFFSET 10 ROW ) ;`,
      `SELECT * FROM ( select something OFFSET 10 ROW )  fetch first 1000 rows only;`
    );
  });

  it("handles offset in subquery no ;", function () {
    test(
      `SELECT * FROM ( select something OFFSET 10 ROW )`,
      `SELECT * FROM ( select something OFFSET 10 ROW ) fetch first 1000 rows only`
    );
  });

  it("handles query wrapped in parens", function () {
    test(
      `(SELECT * FROM ( select something OFFSET 10 ROW ))`,
      `(SELECT * FROM ( select something OFFSET 10 ROW ) fetch first 1000 rows only)`
    );
  });

  it("handles FOR", function () {
    test(
      `SELECT * FROM something FOR UPDATE ;`,
      `SELECT * FROM something fetch first 1000 rows only FOR UPDATE ;`
    );
  });

  it("handles offset no limit", function () {
    test(
      `SELECT * FROM something OFFSET 10`,
      `SELECT * FROM something OFFSET 10 fetch first 1000 rows only`
    );
  });

  it("ignores non-select", function () {
    test(
      `INSERT INTO foo SELECT * FROM something`,
      `INSERT INTO foo SELECT * FROM something`
    );
  });
});
