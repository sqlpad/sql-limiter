const assert = require("assert");
const sqlLimiter = require("../index");

describe("splits", function () {
  it("Excludes terminators", function () {
    const sql = `select -- ;\n;select 2;`;
    const queries = sqlLimiter.split(sql);
    assert.equal(queries.length, 2);
    assert.equal(queries[0], "select -- ;\n");
    assert.equal(queries[1], "select 2");
  });

  it("Includes terminators", function () {
    const sql = `select -- ;\n;select 2;`;
    const queries = sqlLimiter.split(sql, true);
    assert.equal(queries.length, 2);
    assert.equal(queries[0], "select -- ;\n;");
    assert.equal(queries[1], "select 2;");
  });

  it("Terminates on \\g", function () {
    const sql = `select 1\\gselect 2\\g`;
    const queries = sqlLimiter.split(sql);
    assert.equal(queries.length, 2);
    assert.equal(queries[0], "select 1");
    assert.equal(queries[1], "select 2");
  });

  it("Strips empty queries", function () {
    const sql = `select 1;; ;; select 2;   `;
    const queries = sqlLimiter.split(sql);
    assert.equal(queries.length, 2);
    assert.equal(queries[0], "select 1");
    assert.equal(queries[1], " select 2");
  });
});
