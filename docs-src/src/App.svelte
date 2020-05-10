<script>
  import sqlLimiter from "sql-limiter";
  import Diff from "text-diff";
  import Logo from "./Logo.svelte";
  import SqlDiff from "./SqlDiff.svelte";

  let limitKeyword = "limit";
  let limitNumber = 100;
  let original = `SELECT * FROM some_table;`;
</script>

<style>
  h1 {
    color: #ff3e00;
    font-variant: small-caps;
    text-transform: uppercase;
    font-size: 2em;
    font-weight: 100;
  }

  label {
    font-variant: small-caps;
  }

  .row {
    display: flex;
  }

  .col-100 {
    box-sizing: border-box;
    width: 50%;
    flex-grow: 1;
    margin: 8px;
  }
  .col-50 {
    box-sizing: border-box;
    width: 50%;
    flex-grow: 1;
    margin: 8px;
  }

  /* consistent styling for textarea and not */
  .sql {
    border-radius: 2px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    font-family: monospace;
    font-size: 14px;
    margin: 0;
    padding: 8px;
    width: 100%;
  }

  /* fixes to make pre break like a textarea */
  .out {
    overflow-x: auto;
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
  }
</style>

<main>
  <Logo />
  <div class="row">
    <div class="col-100">
      <h1>sql-limiter</h1>

      <label for="limit-keyword">Limit keyword</label>
      <select id="limit-keyword" bind:value={limitKeyword}>
        <option value="limit">limit</option>
        <option value="top">top</option>
        <option value="first">first</option>
      </select>
      <label for="limit-number">Limit number</label>
      <input id="limit-number" type="number" bind:value={limitNumber} />
    </div>
  </div>

  <div class="row">
    <div class="col-50">
      <label for="sql-in">input</label>
      <textarea id="sql-in" class="sql" rows="15" bind:value={original} />
    </div>
    <div class="col-50">
      <label>result</label>
      <pre class="sql out">
        <SqlDiff sql={original} {limitKeyword} {limitNumber} />
      </pre>
    </div>
  </div>

</main>
