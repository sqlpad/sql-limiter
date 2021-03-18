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
 * @returns {string}
 */
function limit(sqlText, limitStrategies, limitNumber) {
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
      statement.enforceLimit(strategies, limitNumber);
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

module.exports = {
  limit,
  getStatements: apiGetStatements,
  removeTerminator,
};
