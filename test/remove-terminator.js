const assert = require("assert");
const sqlLimiter = require("../src/index");

describe("removeTerminator", function () {
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
