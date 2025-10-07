<script>
  import { Label, Input } from 'flowbite-svelte';
  
  // Props
  export let id = 'date';
  export let label = '날짜';
  export let value = '';
  export let placeholder = '';
  export let required = false;
  export let disabled = false;
  export let class_name = '';
  export let data_filter = '';
  export let data_name = '';
  export let autoSetToday = false; // 자동으로 오늘 날짜 설정 여부
  export let minDate = ''; // 최소 날짜 제한
  export let maxDate = ''; // 최대 날짜 제한
  
  // Events
  export let onInput = () => {};
  export let onChange = () => {};
  
  // 컴포넌트 마운트 시 기본값 설정
  import { onMount } from 'svelte';
  
  onMount(() => {
    if (!value && autoSetToday) {
      value = new Date().toISOString().split('T')[0];
    }
  });
  
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
    type="date"
    {value}
    {placeholder}
    {required}
    {disabled}
    min={minDate}
    max={maxDate}
    data-filter={data_filter}
    data-name={data_name}
    on:input={handleInput}
    on:change={handleChange}
  />
</div>