import sqlLimiter from "../../src/index.js";
import Diff from "text-diff";

let strategy1 = "limit";
let strategy2 = "fetch";
let limitNumber = 100;

const strategies = [strategy1, strategy2].filter(
(s) => s !== ""
);

let sql = `SELECT * FROM some_table;`;

let diff = new Diff();
let limited = "";
let textDiff;
let prettyHtml;
let error;

try {
  error = null;
  limited = sqlLimiter.limit(sql, strategies, limitNumber);
  textDiff = diff.main(sql, limited);
  prettyHtml = diff.prettyHtml(textDiff);
} catch (e) {
  error = e;
}


console.log(limited)
console.log(textDiff)
console.log(prettyHtml)