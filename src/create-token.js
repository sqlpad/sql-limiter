module.exports = {
  singleSpace() {
    return {
      type: "whitespace",
      text: " ",
      value: " ",
    };
  },
  keyword(text) {
    return {
      type: "keyword",
      text,
      value: text.toLowerCase(),
    };
  },
  number(n) {
    return {
      type: "number",
      text: `${n}`,
      value: n,
    };
  },
};
