const {
  getQueriesTokens,
  enforceTopOrFirst,
  enforceLimit,
} = require("./utils.js");

const VALID_LIMIT_KEYWORDS = ["limit", "first", "top"];

/**
 * Enforce limit/top on SQL SELECT queries.
 * Non SELECT queries will not be altered.
 * If existing limit exists, it will be lowered if it is larger than `limitNumber` specified
 * If limit does not exist, it will be added.
 * Returns SQL text with limits enforced.
 *
 * @param {string} sqlText - sql text to limit
 * @param {string} limitKeyword -- must be one of `limit`, `top`
 * @param {number} limitNumber -- number to enforce for limit keyword
 * @returns {string}
 */
function limit(sqlText, limitKeyword, limitNumber) {
  if (typeof sqlText !== "string") {
    throw new Error("sqlText must be string");
  }
  if (typeof limitKeyword !== "string") {
    throw new Error("limitKeyword must be string");
  }
  if (typeof limitNumber !== "number") {
    throw new Error("limitNumber must be number");
  }

  const lowerKeyword = limitKeyword.toLowerCase();
  if (!VALID_LIMIT_KEYWORDS.includes(lowerKeyword)) {
    throw new Error(
      `limitKeyword must be one of ${VALID_LIMIT_KEYWORDS.join(", ")}`
    );
  }

  let enforcedSql = "";

  const queriesTokens = getQueriesTokens(sqlText);

  queriesTokens.forEach((queryTokens) => {
    let enforcedTokens = [];
    if (lowerKeyword === "top" || lowerKeyword === "first") {
      enforcedTokens = enforceTopOrFirst(
        queryTokens,
        limitKeyword,
        limitNumber
      );
    } else {
      enforcedTokens = enforceLimit(queryTokens, limitNumber);
    }
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
