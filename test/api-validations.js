const assert = require("assert");
const sqlLimiter = require("../src/index");

describe("api: limit", function () {
  it("throws errors for invalid args", function () {
    assert.throws(() => sqlLimiter.limit(`SELECT 1`, "not valid", "100"));
    assert.throws(() => sqlLimiter.limit(`SELECT 1`, "not valid", 100));
    assert.throws(() => sqlLimiter.limit(`SELECT 1`, "limit"));
    assert.throws(() => sqlLimiter.limit(`SELECT 1`));
    assert.throws(() => sqlLimiter.limit());
  });

  it("accepts upper/lower case keywords", function () {
    sqlLimiter.limit(`SELECT * from something`, "limit", 100);
    sqlLimiter.limit(`SELECT * from something`, "LIMIT", 100);
    sqlLimiter.limit(`SELECT * from something`, "fetch", 100);
    sqlLimiter.limit(`SELECT * from something`, "FETCH", 100);
    sqlLimiter.limit(`SELECT * from something`, ["limit", "FETCH"], 100);
  });

  it("limit array", function () {
    const res = sqlLimiter.limit(`SELECT * from something`, ["limit"], 100);
    assert.equal(res, `SELECT * from something limit 100`);
  });

  it("limit & fetch, limit preference", function () {
    const res = sqlLimiter.limit(
      `SELECT * from something`,
      ["limit", "fetch"],
      100
    );
    assert.equal(res, `SELECT * from something limit 100`);
  });

  it("fetch & limit, fetch preference", function () {
    const res = sqlLimiter.limit(
      `SELECT * from something`,
      ["fetch", "limit"],
      100
    );
    assert.equal(res, `SELECT * from something fetch first 100 rows only`);
  });

  it("multi limit mixed", function () {
    const original = `
      SELECT * from something limit 999;
      SELECT * from something limit 10;
      -- SELECT * from this_is_ignored LIMIT 9999;
      SELECT * from something limit 10 offset 99999;
      SELECT * from something limit 9999 offset 99999;
      SELECT * from something
    `;

    const expected = `
      SELECT * from something limit 100;
      SELECT * from something limit 10;
      -- SELECT * from this_is_ignored LIMIT 9999;
      SELECT * from something limit 10 offset 99999;
      SELECT * from something limit 100 offset 99999;
      SELECT * from something limit 100
    `;

    const res = sqlLimiter.limit(original, "limit", 100);
    assert.equal(res, expected);
  });

  it("limit, offset with insert mode", function () {
    const res = sqlLimiter.limit(
      `SELECT * from something limit 10000`,
      ["limit"],
      100,
      10,
      "insert"
    );
    assert.equal(res, `SELECT * from something limit 10000 offset 10`);
  });

  it("limit with replace mode", function () {
    const res = sqlLimiter.limit(
      `SELECT * from something limit 10000 offset 10`,
      ["limit"],
      100,
      0,
      "replace"
    );
    assert.equal(res, `SELECT * from something limit 100 offset 0`);
  });
});

describe("api: getStatementType", function () {
  it("throws errors for multiple statements", function () {
    assert.throws(() => sqlLimiter.getStatementType(`SELECT *; SELECT *;`));
  });

  it("returns correct keywords", function () {
    assert.strictEqual(sqlLimiter.getStatementType("SELECT *"), "select");
    assert.strictEqual(
      sqlLimiter.getStatementType("-- select comment"),
      undefined
    );
    assert.strictEqual(
      sqlLimiter.getStatementType(
        "WITH something AS (SELECT) INSERT INTO blah *"
      ),
      "insert"
    );
  });
});
