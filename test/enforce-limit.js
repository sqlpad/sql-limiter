const assert = require("assert");
const utils = require("../src/utils");

function enforceFirst(sqlText) {
  const queriesTokens = utils.getQueriesTokens(sqlText);
  const queryTokens = utils.enforceLimit(queriesTokens[0], 1000);
  return queryTokens.map((t) => t.text).join("");
}

describe("enforceLimit", function () {
  it("basic limit not existing", function () {
    const enforcedSql = enforceFirst(`SELECT * FROM something`);
    assert.equal(enforcedSql, "SELECT * FROM something limit 1000");
  });

  it("basic limit not existing with semi", function () {
    const enforcedSql = enforceFirst(`SELECT * FROM something;`);
    assert.equal(enforcedSql, "SELECT * FROM something limit 1000;");
  });

  it("basic limit existing, under", function () {
    const enforcedSql = enforceFirst(`SELECT * FROM something LIMIT 10;`);
    assert.equal(enforcedSql, "SELECT * FROM something LIMIT 10;");
  });

  it("basic limit existing, over", function () {
    const enforcedSql = enforceFirst(`SELECT * FROM something LIMIT 9999;`);
    assert.equal(enforcedSql, "SELECT * FROM something LIMIT 1000;");
  });

  it("cte limit existing, over", function () {
    const enforcedSql = enforceFirst(
      `WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 10) SELECT * FROM something LIMIT 9999 ;`
    );
    assert.equal(
      enforcedSql,
      "WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 10) SELECT * FROM something LIMIT 1000 ;"
    );
  });

  it("throws for unexpected limit", function () {
    assert.throws(() => enforceFirst(`SELECT * FROM something limit`));
  });

  it("handles offset", function () {
    const enforcedSql = enforceFirst(
      `SELECT * FROM something limit 9999 OFFSET 10`
    );
    assert.equal(enforcedSql, `SELECT * FROM something limit 1000 OFFSET 10`);
  });

  it("handles offset no limit", function () {
    const enforcedSql = enforceFirst(`SELECT * FROM something OFFSET 10`);
    assert.equal(enforcedSql, `SELECT * FROM something limit 1000 OFFSET 10`);
  });

  it("ignores non-select", function () {
    const enforcedSql = enforceFirst(`INSERT INTO foo SELECT * FROM something`);
    assert.equal(enforcedSql, `INSERT INTO foo SELECT * FROM something`);
  });
});
