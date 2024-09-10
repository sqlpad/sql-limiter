import sqlLimiter from "../../src/index.js";
import Diff from "text-diff";

let strategy1 = "limit";
let strategy2 = "fetch";
let strategy3 = "";
let limitNumber = 100;
let original = `SELECT * FROM some_table;`;

const limitStrategies = [strategy1, strategy2, strategy3].filter(
(s) => s !== ""
);

let sql = "";

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
consosle.log(prettyHtml)