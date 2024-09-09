const getStatements = require("./get-statements");

/**
 * Enforce limit/top on SQL SELECT queries.
 * Non SELECT queries will not be altered.
 * If existing limit exists, it will be lowered if it is larger than `limitNumber` specified
 * If limit does not exist, it will be added.
 * Returns SQL text with limits enforced.
 *
 * @param {string} sqlText - sql text to limit
 * @param {Array<String>|String} limitStrategies -- First strategy value takes priority if no limit exists
 * @param {number} limitNumber -- number to enforce for limit keyword
 * @param {number} [offsetNumber] -- offset number to enforce
 * @param {boolean} [mode] -- Mode for enforcing `limitNumber` or `offsetNumber`
 * @returns {string}
 */
function limit(
  sqlText,
  limitStrategies,
  limitNumber,
  offsetNumber,
  mode = "cap"
) {
  if (typeof sqlText !== "string") {
    throw new Error("sqlText must be string");
  }
  if (typeof limitNumber !== "number") {
    throw new Error("limitNumber must be number");
  }

  let strategies =
    typeof limitStrategies === "string" ? [limitStrategies] : limitStrategies;

  if (!Array.isArray(strategies)) {
    throw new Error("limitStrategies must be an array or string");
  }

  if (strategies.length === 0) {
    throw new Error("limitStrategies must not be empty");
  }

  strategies = strategies.map((s) => s.toLowerCase());

  return getStatements(sqlText)
    .map((statement) => {
      statement.enforceLimit(strategies, limitNumber, mode);
      if (typeof offsetNumber === "number") {
        statement.enforceOffset(offsetNumber, mode);
      }
      return statement.toString();
    })
    .join("");
}

/**
 * Splits SQL text on terminator, returning an array of SQL statements
 * @param {string} sqlText
 */
function apiGetStatements(sqlText) {
  if (typeof sqlText !== "string") {
    throw new Error("sqlText must be string");
  }
  const statements = getStatements(sqlText);
  return statements.map((statement) => statement.toString());
}

/**
 * Splits SQL text on terminator, returning an array of Statement objects
 * @param {string} sqlText
 * @returns {Statement[]} Statement objects.
 */
function getStatementClasses(sqlText) {
  if (typeof sqlText !== "string") {
    throw new Error("sqlText must be string");
  }
  return getStatements(sqlText);
}

/**
 * Removes terminator from SQL statement.
 * Only a single statement allowed.
 * Throws error if multiple statements are included
 * @param {string} sqlStatement
 */
function removeTerminator(sqlStatement) {
  if (typeof sqlStatement !== "string") {
    throw new Error("sqlText must be string");
  }
  const statements = getStatements(sqlStatement)
    .map((s) => s.toString(true))
    .filter((s) => s.trim() !== "");

  if (statements.length > 1) {
    throw new Error("Multiple statements detected");
  }

  return statements[0];
}

/**
 * Gets statement type keyword from statement string (select, update, delete, etc)
 * Only a single statement allowed.
 * Throws error if multiple statements are included
 * @param {string} statementType
 */
function getStatementType(sqlStatement) {
  if (typeof sqlStatement !== "string") {
    throw new Error("sqlText must be string");
  }
  const statementObjects = getStatements(sqlStatement).filter(
    (s) => s.toString().trim() !== ""
  );

  if (statementObjects.length > 1) {
    throw new Error("Multiple statements detected");
  }

  return statementObjects[0].getStatementType();
}

module.exports = {
  getStatements: apiGetStatements,
  getStatementClasses,
  getStatementType,
  limit,
  removeTerminator,
};
