function findParenLevelToken(tokens, startingIndex, predicate) {
  let level = 0;
  for (let i = startingIndex; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) {
      return null;
    }
    if (token.type === "lparen") {
      level++;
    } else if (token.type === "rparen") {
      level--;
    } else if (level === 0 && predicate(token)) {
      return { ...token, index: i };
    }
  }
  return null;
}

function findToken(tokens, startingIndex, predicate) {
  for (let i = startingIndex; i < tokens.length; i++) {
    const token = tokens[i];
    if (predicate(token)) {
      return { ...token, index: i };
    }
  }
  return null;
}

function nextNonCommentNonWhitespace(tokens, startingIndex) {
  return findToken(
    tokens,
    startingIndex,
    (token) => token.type !== "whitespace" && token.type !== "comment"
  );
}

function findLimitInsertionIndex(queryTokens, targetParenLevel) {
  let level = 0;
  for (let i = queryTokens.length - 1; i >= 0; i--) {
    const token = queryTokens[i];
    if (
      level === targetParenLevel &&
      token.type !== "comment" &&
      token.type !== "whitespace"
    ) {
      return i + 1;
    }

    if (token.type === "rparen") {
      level++;
    } else if (token.type === "lparen") {
      level--;
    }
  }
  // This should never happen.
  // And if it did this lib doesn't know what to do
  throw new Error("Unexpected index");
}

module.exports = {
  findParenLevelToken,
  findToken,
  findLimitInsertionIndex,
  nextNonCommentNonWhitespace,
};
