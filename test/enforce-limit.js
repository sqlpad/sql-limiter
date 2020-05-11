const assert = require("assert");
const utils = require("../src/utils");

function enforceFirst(sqlText, expected) {
  const queriesTokens = utils.getQueriesTokens(sqlText);
  const queryTokens = utils.enforceLimit(queriesTokens[0], 1000);
  const enforcedSql = queryTokens.map((t) => t.text).join("");
  assert.equal(enforcedSql, expected);
}

describe("enforceLimit", function () {
  it("basic limit not existing", function () {
    enforceFirst(
      `SELECT * FROM something`,
      "SELECT * FROM something limit 1000"
    );
  });

  it("basic limit not existing with semi", function () {
    enforceFirst(
      `SELECT * FROM something;`,
      "SELECT * FROM something limit 1000;"
    );
  });

  it("basic limit existing, under", function () {
    enforceFirst(
      `SELECT * FROM something LIMIT 10;`,
      "SELECT * FROM something LIMIT 10;"
    );
  });

  it("basic limit existing, over", function () {
    enforceFirst(
      `SELECT * FROM something LIMIT 9999;`,
      "SELECT * FROM something LIMIT 1000;"
    );
  });

  it("cte limit existing, over", function () {
    enforceFirst(
      `WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 10) SELECT * FROM something LIMIT 9999 ;`,
      "WITH cte AS (SELECT TOP 1 * FROM foo LIMIT 10) SELECT * FROM something LIMIT 1000 ;"
    );
  });

  it("throws for unexpected limit", function () {
    assert.throws(() => enforceFirst(`SELECT * FROM something limit`));
  });

  it("handles offset", function () {
    enforceFirst(
      `SELECT * FROM something limit 9999 OFFSET 10`,
      `SELECT * FROM something limit 1000 OFFSET 10`
    );
  });

  it("handles trailing line comment", function () {
    enforceFirst(
      `SELECT * FROM something -- comment`,
      `SELECT * FROM something limit 1000 -- comment`
    );
  });

  it("handles offset no limit", function () {
    enforceFirst(
      `SELECT * FROM something OFFSET 10`,
      `SELECT * FROM something limit 1000 OFFSET 10`
    );
  });

  it("ignores non-select", function () {
    enforceFirst(
      `INSERT INTO foo SELECT * FROM something`,
      `INSERT INTO foo SELECT * FROM something`
    );
  });
});
