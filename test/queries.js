const assert = require("assert");
const utils = require("../src/utils");

describe("getQueries", function () {
  it("excludes terminators", function () {
    const sql = `select -- ;\n;select 2;`;
    const queries = utils.getQueries(sql);
    assert.equal(queries.length, 2);
    assert.equal(queries[0], "select -- ;\n");
    assert.equal(queries[1], "select 2");
  });

  it("includes terminators", function () {
    const sql = `select -- ;\n;select 2;`;
    const queries = utils.getQueries(sql, true);
    assert.equal(queries.length, 2);
    assert.equal(queries[0], "select -- ;\n;");
    assert.equal(queries[1], "select 2;");
  });

  it("terminates on \\g", function () {
    const sql = `select 1\\gselect 2\\g`;
    const queries = utils.getQueries(sql);
    assert.equal(queries.length, 2);
    assert.equal(queries[0], "select 1");
    assert.equal(queries[1], "select 2");
  });

  it("strips empty queries", function () {
    const sql = `select 1;; ;; select 2;   `;
    const queries = utils.getQueries(sql);
    assert.equal(queries.length, 2);
    assert.equal(queries[0], "select 1");
    assert.equal(queries[1], " select 2");
  });
});
