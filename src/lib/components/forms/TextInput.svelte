<script>
  import { Label, Input } from 'flowbite-svelte';
  
  // Props
  export let id = '';
  export let label = '';
  export let value = '';
  export let placeholder = '';
  export let type = 'text'; // text, number, email, etc.
  export let required = false;
  export let disabled = false;
  export let class_name = '';
  export let data_filter = '';
  export let data_name = '';
  
  // Events
  export let onInput = () => {};
  export let onChange = () => {};
  
  function handleInput(event) {
    value = event.target.value;
    onInput(event);
  }
  
  function handleChange(event) {
    onChange(event);
  }
</script>

<div class={class_name}>
  {#if label}
    <Label for={id} class="mb-2">{label}</Label>
  {/if}
  <Input 
    {id}
    {type}
    {value}
    {placeholder}
    {required}
    {disabled}
    data-filter={data_filter}
    data-name={data_name}
    on:input={handleInput}
    on:change={handleChange}
  />
</div>