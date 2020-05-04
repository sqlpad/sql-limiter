const assert = require("assert");
const sqlLimiter = require("../index");

function hasTokenValueCount(str, type, value, count) {
  const tokens = sqlLimiter.tokenize(str);
  const actualCount = tokens.filter((t) => t.value === value && t.type === type)
    .length;

  assert.equal(
    actualCount,
    count,
    `hasTokenValueCount [type=${type}] [value=${value}] [count=${count}]`
  );
}

module.exports = {
  hasTokenValueCount,
};
