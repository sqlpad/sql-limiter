const assert = require("assert");
const utils = require("../src/utils");

function enforceFirst(sqlText, keyword) {
  const queriesTokens = utils.getQueriesTokens(sqlText);
  const queryTokens = utils.enforceTopOrFirst(queriesTokens[0], keyword, 1000);
  return queryTokens.map((t) => t.text).join("");
}

describe("enforceTopOrFirst", function () {
  it("basic top not existing", function () {
    const enforcedSql = enforceFirst(`SELECT * FROM something`, "top");
    assert.equal(enforcedSql, "SELECT top 1000  * FROM something");
  });

  it("basic first not existing", function () {
    const enforcedSql = enforceFirst(`SELECT * FROM something`, "first");
    assert.equal(enforcedSql, "SELECT first 1000  * FROM something");
  });

  it("basic top existing, under", function () {
    const enforcedSql = enforceFirst(`SELECT top 10 * FROM something`, "top");
    assert.equal(enforcedSql, "SELECT top 10 * FROM something");
  });

  it("basic top existing, over", function () {
    const enforcedSql = enforceFirst(
      `SELECT top 99999 * FROM something`,
      "top"
    );
    assert.equal(enforcedSql, "SELECT top 1000 * FROM something");
  });

  it("cte top existing, over", function () {
    const enforcedSql = enforceFirst(
      `WITH cte AS (SELECT TOP 1 * FROM foo) SELECT top 99999 * FROM something`,
      "top"
    );
    assert.equal(
      enforcedSql,
      "WITH cte AS (SELECT TOP 1 * FROM foo) SELECT top 1000 * FROM something"
    );
  });

  it("handles unexpected top", function () {
    const enforcedSql = enforceFirst(`SELECT top * FROM something`, "top");
    assert.equal(enforcedSql, `SELECT top * FROM something`);
  });

  it("ignores non-select", function () {
    const enforcedSql = enforceFirst(
      `INSERT INTO foo SELECT * FROM something`,
      "top"
    );
    assert.equal(enforcedSql, `INSERT INTO foo SELECT * FROM something`);
  });
});
