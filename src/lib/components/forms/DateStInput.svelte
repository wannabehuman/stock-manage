<script>
  import { Label, Input } from 'flowbite-svelte';
  
  // Props
  export let id = 'startDate';
  export let label = '시작일';
  export let value = '';
  export let required = false;
  export let disabled = false;
  export let class_name = '';
  export let autoSetToday = false; // 자동으로 오늘 날짜 설정 여부
  export let autoSetMonthStart = true; // 자동으로 이번달 1일 설정 여부
  export let width = 'w-48'; // 날짜 입력 최대 길이
  
  // Events
  export let onInput = () => {};
  export let onChange = () => {};
  
  // 컴포넌트 마운트 시 기본값 설정
  import { onMount } from 'svelte';
  
  onMount(() => {
    if (!value) {
      if (autoSetToday) {
        value = new Date().toISOString().split('T')[0];
      } else if (autoSetMonthStart) {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        value = monthStart.toISOString().split('T')[0];
      }
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
  <Label for={id} class="mb-2">{label}</Label>
  <Input 
    {id}
    type="date"
    {value}
    {required}
    {disabled}
    data-filter="true"
    data-name="ST_DT"
    class={width}
    on:input={handleInput}
    on:change={handleChange}
  />
</div>