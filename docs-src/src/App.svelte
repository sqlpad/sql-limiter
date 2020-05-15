<script>
  import Diff from "text-diff";
  import Logo from "./Logo.svelte";
  import SqlDiff from "./SqlDiff.svelte";
  import Strategies from "./Strategies.svelte";

  let strategy1 = "limit";
  let strategy2 = "fetch";
  let strategy3 = "";
  let limitNumber = 100;
  let original = `SELECT * FROM some_table;`;

  $: limitStrategies = [strategy1, strategy2, strategy3].filter(s => s !== "");
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

  .m8 {
    margin: 8px;
  }

  .col-100 {
    box-sizing: border-box;
    width: 50%;
    flex-grow: 1;
  }
  .col-50 {
    box-sizing: border-box;
    width: 50%;
    flex-grow: 1;
  }

  #sql-in {
    white-space: pre;
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

  .input {
    width: 180px;
    height: 36px;
  }

  .out {
    overflow-x: auto;
  }
</style>

<main>
  <Logo />
  <div class="row">
    <div class="col-100 m8">
      <h1>sql-limiter</h1>

    </div>
  </div>

  <div class="row">
    <div class="m8">
      <Strategies label="strategy 1" bind:value={strategy1} />
    </div>
    <div class="m8">
      <Strategies label="strategy 2" bind:value={strategy2} />
    </div>
    <div class="m8">
      <Strategies label="strategy 3" bind:value={strategy3} />
    </div>
    <div class="m8">
      <label for="limit-number">limit number</label>
      <input
        id="limit-number"
        class="input"
        type="number"
        bind:value={limitNumber} />
    </div>
  </div>

  <div class="row">
    <div class="col-50 m8">
      <label for="sql-in">input</label>
      <textarea id="sql-in" class="sql" rows="15" bind:value={original} />
    </div>
    <div class="col-50 m8">
      <label>result</label>
      <pre class="sql out">
        <SqlDiff sql={original} strategies={limitStrategies} {limitNumber} />
      </pre>
    </div>
  </div>

</main>
