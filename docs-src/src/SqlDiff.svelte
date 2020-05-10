<script>
  import sqlLimiter from "../../src/index.js";
  import Diff from "text-diff";
  import Logo from "./Logo.svelte";

  export let sql = "";
  export let limitKeyword = "";
  export let limitNumber = 100;

  let diff = new Diff();
  let limited = "";
  let textDiff;
  let prettyHtml;
  let error;

  $: try {
    error = null;
    limited = sqlLimiter.limit(sql, limitKeyword, limitNumber);
    textDiff = diff.main(sql, limited);
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

  .error {
    color: red;
  }
</style>

{#if error}
  <span class="error">{error}</span>
{:else}
  {@html prettyHtml}
{/if}
