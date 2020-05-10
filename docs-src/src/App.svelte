<script>
  import sqlLimiter from "sql-limiter";
  import Diff from "text-diff";

  let diff = new Diff();
  let limited = "";
  let original = `SELECT * FROM some_table;`;
  let textDiff;
  let prettyHtml;
  let error;

  $: try {
    error = null;
    limited = sqlLimiter.limit(original, "limit", 100);
    textDiff = diff.main(original, limited);
    prettyHtml = diff.prettyHtml(textDiff);
  } catch (e) {
    error = e;
  }
</script>

<style>
  :global(ins) {
    color: green;
  }

  :global(del) {
    color: red;
  }

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

  .error {
    color: red;
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
    width: 100%;
    font-family: monospace;
    padding: 8px;
    font-family: inherit;
    font-size: inherit;
    margin: 0;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 2px;
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
  <div class="row">
    <div class="col-100">
      <h1>sql-limiter</h1>
    </div>
  </div>

  <div class="row">
    <div class="col-50">
      <label for="sql-in">input</label>
      <textarea id="sql-in" class="sql" rows="15" bind:value={original} />
    </div>
    <div class="col-50">
      <label>result</label>
      {#if error}
        <pre class="sql out error">{error}</pre>
      {:else}
        <pre class="sql out">
          {@html prettyHtml}
        </pre>
      {/if}
    </div>
  </div>
</main>
