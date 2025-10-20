<script>
  import { Label, Input } from 'flowbite-svelte';

  // Props
  export let id = 'month';
  export let label = '년월';
  export let value = '';
  export let placeholder = 'YYYY-MM';
  export let required = false;
  export let disabled = false;
  export let class_name = '';

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
  <Label for={id} class="mb-2">{label}</Label>
  <Input
    type="month"
    {id}
    {value}
    {placeholder}
    {required}
    {disabled}
    data-filter="true"
    data-name="INBOUND_MONTH"
    on:input={handleInput}
    on:change={handleChange}
  />
</div>
