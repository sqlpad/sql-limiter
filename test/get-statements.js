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

  it("handles stored procedure with semi before BEGIN", function () {
    const procWithSemiBefore = `
      CREATE PROCEDURE ReportTitle1 (:rpttitle1 VARCHAR(20) = 'Finance Department');
      BEGIN
      PRINT :rpttitle1;
      END;
      CALL ReportTitle1
    `.trim();

    const expected1 = `
      CREATE PROCEDURE ReportTitle1 (:rpttitle1 VARCHAR(20) = 'Finance Department');
      BEGIN
      PRINT :rpttitle1;
      END;`;

    const statements = sqlLimiter.getStatements(procWithSemiBefore);
    assert.equal(statements.length, 2);
    assert.equal(statements[0], expected1);
    assert.equal(statements[1].trim(), "CALL ReportTitle1");
  });
});
