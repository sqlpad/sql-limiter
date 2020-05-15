/* eslint-disable no-restricted-syntax */
const strategies = require("./strategies");

/**
 * Detects, enforces or injects a limit using strategies specified.
 * @param {object} statementTypeToken
 * @param {Array<Object>} queryTokens
 * @param {Array<String>|String} limitStrategies
 * @param {Number} limitNumber
 */
function enforceLimit(
  statementTypeToken,
  queryTokens,
  limitStrategies,
  limitNumber
) {
  const strategiesToEnforce =
    typeof limitStrategies === "string" ? [limitStrategies] : limitStrategies;

  if (!Array.isArray(strategiesToEnforce)) {
    throw new Error("limit strategies must be array or string");
  }

  for (const toEnforce of strategiesToEnforce) {
    const strategyImplementation = strategies[toEnforce];
    if (!strategyImplementation) {
      throw new Error(`Strategy ${toEnforce} not supported`);
    }
    const numberToken = strategyImplementation.has(
      queryTokens,
      statementTypeToken.index
    );
    if (numberToken) {
      // If the number if over the limit, reset it
      if (parseInt(numberToken.value, 10) > limitNumber) {
        const firstHalf = queryTokens.slice(0, numberToken.index);
        const secondhalf = queryTokens.slice(numberToken.index + 1);
        return [
          ...firstHalf,
          { ...numberToken, text: limitNumber, value: limitNumber },
          ...secondhalf,
        ];
      }
      return queryTokens;
    }
  }

  const preferredStrategy = strategiesToEnforce[0];
  return strategies[preferredStrategy].add(
    queryTokens,
    statementTypeToken.index,
    statementTypeToken.parenLevel,
    limitNumber
  );
}

module.exports = enforceLimit;
