<script>
    import { Label, Input } from 'flowbite-svelte';
    
    // Props
    export let id = 'itemGrpCode';
    export let label = '카테고리';
    export let value = '';
    export let placeholder = '카테고리 입력';
    export let required = false;
    export let disabled = false;
    export let class_name = '';
    export let maxlength = 20; // 품목코드 최대 길이
    export let width = 'w-40'; // 품목코드 입력 너비
    
    // Events
    export let onInput = () => {};
    export let onChange = () => {};
    export let onSearch = () => {}; // 품목 검색 팝업 등
    
    function handleInput(event) {
      // 대문자 변환 및 특수문자 제거
      let inputValue = event.target.value.toUpperCase().replace(/[^A-Z0-9-_]/g, '');
      value = inputValue;
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
      data-name="ITEM_GRP_CD"
      on:input={handleInput}
      on:change={handleChange}
      on:keydown={handleKeydown}
      class="uppercase font-mono {width}"
    />
  </div>