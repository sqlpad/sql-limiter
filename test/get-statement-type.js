const assert = require("assert");
const getQueriesTokens = require("../src/get-queries-tokens");
const getStatementType = require("../src/get-statement-type");

function get(sql) {
  const queriesTokens = getQueriesTokens(sql);
  return getStatementType(queriesTokens[0]);
}

describe("getStatementType", function () {
  it("identifies basic select", function () {
    const res = get(`SELECT * FROM something`);
    assert.equal(res.statementkeywordIndex, 0);
    assert.equal(res.statementKeyword, "select");
    assert.equal(res.targetParenLevel, 0);
  });

  it("identifies select in paren", function () {
    const res = get(`(select * from something)`);
    assert.equal(res.statementkeywordIndex, 1);
    assert.equal(res.statementKeyword, "select");
    assert.equal(res.targetParenLevel, 1);
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
    assert.equal(res.targetParenLevel, 0);
  });
});
