<script>
  import { Label, Input } from 'flowbite-svelte';
  
  // Props
  export let id = 'itemName';
  export let label = '품목명';
  export let value = '';
  export let placeholder = '품목명 입력';
  export let required = false;
  export let disabled = false;
  export let class_name = '';
  export let maxlength = 100; // 품목명 최대 길이
  export let width = 'w-48'; // 품목명 최대 길이
  
  // Events
  export let onInput = () => {};
  export let onChange = () => {};
  export let onSearch = () => {}; // 품목 검색 팝업 등
  
  function handleInput(event) {
    value = event.target.value;
    onInput(event);
  }
  
  function handleChange(event) {
    onChange(event);
  }
  
  function handleKeydown(event) {
    // Enter 키나 F4 키로 검색 팝업 열기
    if (event.key === 'Enter' || event.key === 'F4') {
      event.preventDefault();
      onSearch();
    }
  }
</script>

<div class={class_name}>
  <Label for={id} class="mb-2">{label}</Label>
  <Input 
    {id}
    type="text"
    {value}
    {placeholder}
    {required}
    {disabled}
    {maxlength}
    data-filter="true"
    data-name="ITEM_NM"
    class={width}
    on:input={handleInput}
    on:change={handleChange}
    on:keydown={handleKeydown}
  />
</div>