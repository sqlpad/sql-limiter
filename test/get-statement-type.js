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
    assert.equal(res.index, 0);
    assert.equal(res.value, "select");
    assert.equal(res.parenLevel, 0);
  });

  it("identifies select in paren", function () {
    const res = get(`(select * from something)`);
    assert.equal(res.index, 1);
    assert.equal(res.value, "select");
    assert.equal(res.parenLevel, 1);
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
    assert.equal(res.index, 50);
    assert.equal(res.value, "insert");
    assert.equal(res.parenLevel, 0);
  });
});
