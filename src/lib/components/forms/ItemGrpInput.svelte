<script>
    import { Label, Select } from 'flowbite-svelte';
    import { onMount } from 'svelte';

    // Props
    export let id = 'itemGrpCode';
    export let label = '카테고리';
    export let value = '';
    export let placeholder = '카테고리 선택';
    export let required = false;
    export let disabled = false;
    export let class_name = '';
    export let width = 'w-40'; // 드롭다운 너비

    // Events
    export let onInput = () => {};
    export let onChange = () => {};
    export let onSearch = () => {}; // 사용하지 않음 (호환성 유지)

    // 카테고리 목록
    let categories = [];
    let loading = true;

    // 카테고리 목록 로드 (기초코드에서)
    onMount(async () => {
      try {
        const response = await fetch('/api/code-detail/HERBER_KIND');
        const data = await response.json();
        categories = data
          .filter(item => item.use_yn !== 'N') // 사용중인 것만
          .map(item => ({
            value: item.code,        // 값은 코드
            name: item.code_name     // 화면에는 코드명
          }));
        loading = false;
      } catch (error) {
        console.error('카테고리 목록 로드 실패:', error);
        loading = false;
      }
    });

    function handleChange(event) {
      value = event.target.value;
      onInput(event);
      onChange(event);
    }
  </script>

  <div class={class_name}>
    <Label for={id} class="mb-2">{label}</Label>
    <Select
      {id}
      {value}
      {required}
      {disabled}
      data-filter="true"
      data-name="ITEM_GRP_CD"
      on:change={handleChange}
      class="{width}"
    >
      <option value="">전체</option>
      {#if loading}
        <option disabled>로딩 중...</option>
      {:else}
        {#each categories as category}
          <option value={category.value}>{category.name}</option>
        {/each}
      {/if}
    </Select>
  </div>