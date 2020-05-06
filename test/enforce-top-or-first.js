const assert = require("assert");
const sqlLimiter = require("../src/index");

describe("enforceTopOrFirst", function () {
  it("basic top not existing", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(`SELECT * FROM something`);
    const queryTokens = sqlLimiter.enforceTopOrFirst(
      queriesTokens[0],
      "TOP",
      1000
    );
    const enforcedSql = queryTokens.map((t) => t.value).join("");
    assert.equal(enforcedSql, "select top 1000  * from something");
  });

  it("basic first not existing", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(`SELECT * FROM something`);
    const queryTokens = sqlLimiter.enforceTopOrFirst(
      queriesTokens[0],
      "first",
      1000
    );
    const enforcedSql = queryTokens.map((t) => t.value).join("");
    assert.equal(enforcedSql, "select first 1000  * from something");
  });

  it("basic top existing, under", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(
      `SELECT top 10 * FROM something`
    );
    const queryTokens = sqlLimiter.enforceTopOrFirst(
      queriesTokens[0],
      "TOP",
      1000
    );
    const enforcedSql = queryTokens.map((t) => t.value).join("");
    assert.equal(enforcedSql, "select top 10 * from something");
  });

  it("basic top existing, over", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(
      `SELECT top 99999 * FROM something`
    );
    const queryTokens = sqlLimiter.enforceTopOrFirst(
      queriesTokens[0],
      "TOP",
      1000
    );
    const enforcedSql = queryTokens.map((t) => t.text).join("");
    assert.equal(enforcedSql, "SELECT top 1000 * FROM something");
  });

  it("cte top existing, over", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(
      `WITH cte AS (SELECT TOP 1 * FROM foo) SELECT top 99999 * FROM something`
    );
    const queryTokens = sqlLimiter.enforceTopOrFirst(
      queriesTokens[0],
      "TOP",
      1000
    );
    const enforcedSql = queryTokens.map((t) => t.text).join("");
    assert.equal(
      enforcedSql,
      "WITH cte AS (SELECT TOP 1 * FROM foo) SELECT top 1000 * FROM something"
    );
  });

  it("handles unexpected top", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(
      `SELECT top * FROM something`
    );
    const queryTokens = sqlLimiter.enforceTopOrFirst(
      queriesTokens[0],
      "TOP",
      1000
    );
    const enforcedSql = queryTokens.map((t) => t.text).join("");
    assert.equal(enforcedSql, `SELECT top * FROM something`);
  });

  it("ignores non-select", function () {
    let queriesTokens = sqlLimiter.getQueriesTokens(
      `INSERT INTO foo SELECT * FROM something`
    );
    const queryTokens = sqlLimiter.enforceTopOrFirst(
      queriesTokens[0],
      "TOP",
      1000
    );
    const enforcedSql = queryTokens.map((t) => t.text).join("");
    assert.equal(enforcedSql, `INSERT INTO foo SELECT * FROM something`);
  });
});
