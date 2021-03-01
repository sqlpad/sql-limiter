<script>
  import sqlLimiter from "../../src/index.js";
  import Diff from "text-diff";

  export let sql = "";
  export let strategies = ["limit"];
  export let limitNumber = 100;

  let diff = new Diff();
  let limited = "";
  let textDiff;
  let prettyHtml;
  let error;

  $: try {
    error = null;
    limited = sqlLimiter.limit(sql, strategies, limitNumber);
    textDiff = diff.main(sql, limited);
    prettyHtml = diff.prettyHtml(textDiff);
  } catch (e) {
    error = e;
  }
</script>

{#if error}
  <span class="error">{error}</span>
{:else}
  {@html prettyHtml}
{/if}

<style>
  :global(ins) {
    color: green;
  }

  :global(del) {
    color: red;
  }

  .error {
    color: red;
  }
</style>
