const getQueriesTokens = require("./get-queries-tokens");
const enforceLimit = require("./enforce-limit.js");

const VALID_STRATEGIES = ["limit", "fetch"];

/**
 * Enforce limit/top on SQL SELECT queries.
 * Non SELECT queries will not be altered.
 * If existing limit exists, it will be lowered if it is larger than `limitNumber` specified
 * If limit does not exist, it will be added.
 * Returns SQL text with limits enforced.
 *
 * @param {string} sqlText - sql text to limit
 * @param {Array<String>|String} limitStrategies -- Values must be `limit` and/or `fetch`. First value takes priority if no limit exists
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

  strategies = strategies.map((s) => s.toLowerCase());

  strategies.forEach((strategy) => {
    if (!VALID_STRATEGIES.includes(strategy)) {
      throw new Error(
        `limitStrategies must be one of ${VALID_STRATEGIES.join(", ")}`
      );
    }
  });

  let enforcedSql = "";

  const queriesTokens = getQueriesTokens(sqlText);

  queriesTokens.forEach((queryTokens) => {
    let enforcedTokens = [];
    enforcedTokens = enforceLimit(queryTokens, strategies, limitNumber);
    enforcedSql += enforcedTokens.map((t) => t.text).join("");
  });

  // Return a string
  return enforcedSql;
}

/**
 * Splits SQL text on terminator, returning an array of SQL statements
 * @param {string} sqlText
 */
function getStatements(sqlText) {
  if (typeof sqlText !== "string") {
    throw new Error("sqlText must be string");
  }
  const queriesTokens = getQueriesTokens(sqlText);
  return queriesTokens.map((queryTokens) =>
    queryTokens.map((t) => t.text).join("")
  );
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
  const queriesTokens = getQueriesTokens(sqlStatement);

  const statements = queriesTokens
    .map((queryTokens) =>
      queryTokens
        .filter((t) => t.type !== "terminator")
        .map((t) => t.text)
        .join("")
    )
    .filter((statement) => statement.trim() !== "");

  if (statements.length > 1) {
    throw new Error("Multiple statements detected");
  }

  return statements[0];
}

module.exports = {
  limit,
  getStatements,
  removeTerminator,
};
