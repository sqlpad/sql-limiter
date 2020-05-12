<script>
  import sqlLimiter from "../../src/index.js";
  import Diff from "text-diff";
  import Logo from "./Logo.svelte";

  export let sql = "";
  export let limitKeywords = "";
  export let limitNumber = 100;

  let diff = new Diff();
  let limited = "";
  let textDiff;
  let prettyHtml;
  let error;
  let limitStrategies;

  $: try {
    error = null;
    if (limitKeywords === "limit" || limitKeywords === "fetch") {
      limitStrategies = [limitKeywords];
    } else if (limitKeywords === "limit-fetch") {
      limitStrategies = ["limit", "fetch"];
    } else if (limitKeywords === "fetch-limit") {
      limitStrategies = ["fetch", "limit"];
    }
    limited = sqlLimiter.limit(sql, limitStrategies, limitNumber);
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
