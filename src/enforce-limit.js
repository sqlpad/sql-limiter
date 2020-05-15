const { hasLimit, addLimit } = require("./limit-strategy");
const { hasFetch, addFetch } = require("./fetch-strategy");

/**
 * Detects, enforces or injects a limit using strategies specified.
 * @param {object} statementTypeToken
 * @param {Array<Object>} queryTokens
 * @param {Array<String>|String} limitStrategies
 * @param {Number} limit
 */
function enforceLimit(statementTypeToken, queryTokens, limitStrategies, limit) {
  const strategies =
    typeof limitStrategies === "string" ? [limitStrategies] : limitStrategies;

  if (!Array.isArray(strategies)) {
    throw new Error("limit strategies must be array or string");
  }

  if (strategies.includes("limit")) {
    const limitResult = hasLimit(queryTokens, statementTypeToken.index);
    if (limitResult) {
      // limit is there, so find next number and validate
      // is the next non-whitespace non-comment a number?
      // If so, enforce that number be no larger than limit
      const { limitNumberToken } = limitResult;

      // If the number if over the limit, reset it
      if (parseInt(limitNumberToken.value, 10) > limit) {
        const firstHalf = queryTokens.slice(0, limitNumberToken.index);
        const secondhalf = queryTokens.slice(limitNumberToken.index + 1);
        return [
          ...firstHalf,
          { ...limitNumberToken, text: limit, value: limit },
          ...secondhalf,
        ];
      }
      return queryTokens;
    }
  }

  if (strategies.includes("fetch")) {
    const fetchResult = hasFetch(queryTokens, statementTypeToken.index);
    if (fetchResult) {
      // limit is there, so find next number and validate
      // is the next non-whitespace non-comment a number?
      // If so, enforce that number be no larger than limit
      const { fetchNumberToken } = fetchResult;

      // If the number if over the limit, reset it
      if (parseInt(fetchNumberToken.value, 10) > limit) {
        const firstHalf = queryTokens.slice(0, fetchNumberToken.index);
        const secondhalf = queryTokens.slice(fetchNumberToken.index + 1);
        return [
          ...firstHalf,
          { ...fetchNumberToken, text: limit, value: limit },
          ...secondhalf,
        ];
      }
      return queryTokens;
    }
  }

  const preferredStrategy = strategies[0];

  if (preferredStrategy === "limit") {
    return addLimit(
      queryTokens,
      statementTypeToken.index,
      statementTypeToken.parenLevel,
      limit
    );
  }
  if (preferredStrategy === "fetch") {
    return addFetch(
      queryTokens,
      statementTypeToken.index,
      statementTypeToken.parenLevel,
      limit
    );
  }

  return [];
}

module.exports = enforceLimit;
