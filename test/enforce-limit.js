const assert = require("assert");
const sqlLimiter = require("../src/index");

describe("enforceLimit", function () {
  it("basic limit not existing", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(`SELECT * FROM something`);
    const queryTokens = sqlLimiter.enforceLimit(queriesTokens[0], 1000);
    const enforcedSql = queryTokens.map((t) => t.text).join("");
    assert.equal(enforcedSql, "SELECT * FROM something limit 1000");
  });

  it("basic limit not existing with semi", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(`SELECT * FROM something;`);
    const queryTokens = sqlLimiter.enforceLimit(queriesTokens[0], 1000);
    const enforcedSql = queryTokens.map((t) => t.text).join("");
    assert.equal(enforcedSql, "SELECT * FROM something limit 1000;");
  });

  it("basic limit existing, under", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(
      `SELECT * FROM something LIMIT 10;`
    );
    const queryTokens = sqlLimiter.enforceLimit(queriesTokens[0], 1000);
    const enforcedSql = queryTokens.map((t) => t.text).join("");
    assert.equal(enforcedSql, "SELECT * FROM something LIMIT 10;");
  });

  it("basic limit existing, over", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(
      `SELECT * FROM something LIMIT 9999;`
    );
    const queryTokens = sqlLimiter.enforceLimit(queriesTokens[0], 1000);
    const enforcedSql = queryTokens.map((t) => t.text).join("");
    assert.equal(enforcedSql, "SELECT * FROM something LIMIT 1000;");
  });

  it("cte limit existing, over", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(
      `WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 10) SELECT * FROM something LIMIT 9999 ;`
    );
    const queryTokens = sqlLimiter.enforceLimit(queriesTokens[0], 1000);
    const enforcedSql = queryTokens.map((t) => t.text).join("");
    assert.equal(
      enforcedSql,
      "WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 10) SELECT * FROM something LIMIT 1000 ;"
    );
  });

  it("handles unexpected limit", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(
      `SELECT * FROM something limit`
    );
    const queryTokens = sqlLimiter.enforceLimit(queriesTokens[0], 1000);
    const enforcedSql = queryTokens.map((t) => t.text).join("");
    assert.equal(enforcedSql, `SELECT * FROM something limit`);
  });

  it("ignores non-select", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(
      `INSERT INTO foo SELECT * FROM something`
    );
    const queryTokens = sqlLimiter.enforceLimit(queriesTokens[0], 1000);
    const enforcedSql = queryTokens.map((t) => t.text).join("");
    assert.equal(enforcedSql, `INSERT INTO foo SELECT * FROM something`);
  });
});
