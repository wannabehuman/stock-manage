<script>
  import { Card, Button } from 'flowbite-svelte';
  import { GridSolid } from 'flowbite-svelte-icons';

  // Props
  export let title = '검색 조건';
  export let columns = 4; // grid columns (1-12)
  export let onSearch = () => {};
  export let searchButtonText = '조회';
  export let searchButtonColor = 'blue';
  export let showButtons = true; // 버튼 표시 여부

  // 엔터 키 핸들러
  function handleKeydown(event) {
    // 엔터 키이고, 검색 버튼이 포함되어 있으면 onSearch 실행
    if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
      event.preventDefault();
      onSearch();
    }
  }
</script>

<Card padding="none" class="mb-4 p-3 w-full max-w-none">
  <div class="flex justify-between items-end gap-4" on:keydown={handleKeydown} role="search">
    <!-- 검색 조건 입력들 -->
    <div class="flex gap-3 flex-wrap items-end">
      <slot />
    </div>

    <!-- 버튼들 -->
    {#if showButtons}
      <div class="flex gap-2 flex-shrink-0">
        <Button color={searchButtonColor} on:click={onSearch}>
          <GridSolid class="w-4 h-4 mr-2" />
          {searchButtonText}
        </Button>
        <slot name="buttons" />
      </div>
    {/if}
  </div>
</Card>