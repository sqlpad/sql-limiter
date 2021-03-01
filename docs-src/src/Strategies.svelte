<script>
  export let value = "";
  export let label = "strategy";
</script>

<label for={label}>{label}</label>
<select id={label} class="input" bind:value>
  <option value="">
    <em>none</em>
  </option>
  <option value="fetch">fetch</option>
  <option value="first">first</option>
  <option value="limit">limit</option>
  <option value="top">top</option>
</select>

<style>
  label {
    font-variant: small-caps;
  }

  .input {
    width: 180px;
    height: 36px;
  }
</style>
