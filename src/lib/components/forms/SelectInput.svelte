<script>
  import { Label, Select } from 'flowbite-svelte';

  // Props
  export let id = '';
  export let label = '';
  export let value = '';
  export let options = []; // [{ value: '', label: '' }, ...]
  export let required = false;
  export let disabled = false;
  export let class_name = '';
  export let dataFilter = '';
  export let dataName = '';

  // Events
  export let onChange = () => {};

  function handleChange(event) {
    value = event.target.value;
    onChange(event);
  }

  // Select 옵션 형식으로 변환
  $: selectOptions = options.map(opt => ({
    value: opt.value,
    name: opt.label
  }));
</script>

<div class={class_name}>
  {#if label}
    <Label for={id} class="mb-2">{label}</Label>
  {/if}
  <Select
    {id}
    {value}
    {required}
    {disabled}
    data-filter={dataFilter}
    data-name={dataName}
    items={selectOptions}
    on:change={handleChange}
  />
</div>
