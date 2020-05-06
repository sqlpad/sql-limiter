const assert = require("assert");
const sqlLimiter = require("../src/index");

function get(sql) {
  const queriesTokens = sqlLimiter.getQueriesTokens(sql);
  return sqlLimiter.getStatementType(queriesTokens[0]);
}

describe("getStatementType", function () {
  it("identifies basic select", function () {
    const res = get(`SELECT * FROM something`);
    assert.equal(res.statementkeywordIndex, 0);
    assert.equal(res.statementKeyword, "select");
  });

  it("identifies select in paren", function () {
    const res = get(`(select * from something)`);
    assert.equal(res.statementkeywordIndex, 1);
    assert.equal(res.statementKeyword, "select");
  });

  it("handles cte", function () {
    const res = get(`
      with something (a, b) as (
        select * from something
      ),
      t2 as (
        select * from something_else
      )
      insert into foo
      select * from bar;
    `);
    assert.equal(res.statementkeywordIndex, 50);
    assert.equal(res.statementKeyword, "insert");
  });
});
