const assert = require("assert");
const sqlLimiter = require("../src/index");

describe("getStatements", function () {
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
