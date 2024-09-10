import sqlLimiter from "../../src/index.js";
import Diff from "text-diff";

function renderDiff () {
  const strategy1 = document.getElementById("strategy1").value;
  const strategy2 = document.getElementById("strategy2").value;
  const limitNumber = document.getElementById("limit-number").value;
  const sql = document.getElementById("sql-in").value;

  const strategies = [strategy1, strategy2].filter(
    (s) => s !== ""
  );

  console.log(strategies, sql, limitNumber)

  let diff = new Diff();
  let limited = "";
  let textDiff;
  let prettyHtml;
  let error;

  try {
    error = null;
    limited = sqlLimiter.limit(sql, strategies, parseInt(limitNumber, 10));
    textDiff = diff.main(sql, limited);
    prettyHtml = diff.prettyHtml(textDiff);
  } catch (e) {
    error = e;
  }

  document.getElementById("sql-out").innerHTML = prettyHtml;


  console.log(limited)
  console.log(textDiff)
  console.log(prettyHtml)
}

function onLoad() {
  const strategy1El = document.getElementById("strategy1");
  strategy1El.oninput = renderDiff;

  const strategy2El = document.getElementById("strategy2");
  strategy2El.oninput = renderDiff;

  document.getElementById("sql-in").oninput = renderDiff;
  document.getElementById("limit-number").oninput = renderDiff;

  renderDiff();
}

window.addEventListener("load", onLoad);

