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
    sqlLimiter.limit(`SELECT * from something`, "top", 100);
    sqlLimiter.limit(`SELECT * from something`, "TOP", 100);
  });

  it("single limit not existing", function () {
    const res = sqlLimiter.limit(`SELECT * from something`, "limit", 100);
    assert.equal(res, `SELECT * from something limit 100`);
  });

  it("single limit not existing w/;", function () {
    const res = sqlLimiter.limit(`SELECT * from something;`, "limit", 100);
    assert.equal(res, `SELECT * from something limit 100;`);
  });

  it("single limit existing under;", function () {
    const res = sqlLimiter.limit(
      `SELECT * from something limit 10;`,
      "limit",
      100
    );
    assert.equal(res, `SELECT * from something limit 10;`);
  });

  it("single limit existing over;", function () {
    const res = sqlLimiter.limit(
      `SELECT * from something limit 999;`,
      "limit",
      100
    );
    assert.equal(res, `SELECT * from something limit 100;`);
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
});

describe("api: getStatements", function () {
  it("throws errors for invalid args", function () {
    assert.throws(() => sqlLimiter.getStatements());
  });

  it("gets statements", function () {
    const statements = sqlLimiter.getStatements(
      `SELECT * ; SELECT 2 --; SELECT 3`
    );
    assert.equal(statements.length, 2);
    assert.equal(statements[0], "SELECT * ;");
    assert.equal(statements[1], " SELECT 2 --; SELECT 3");
  });
});

describe("api: removeTerminator", function () {
  it("throws errors for invalid args", function () {
    assert.throws(() => sqlLimiter.removeTerminator());
  });

  it("throws errors for multiple statements", function () {
    assert.throws(() => sqlLimiter.removeTerminator(`SELECT * ; SELECT 2;`));
  });

  it("removes terminator", function () {
    let res = sqlLimiter.removeTerminator(`SELECT * ;`);
    assert.equal(res, "SELECT * ");

    res = sqlLimiter.removeTerminator(`select ;     `);
    assert.equal(res, "select ");
  });
});
