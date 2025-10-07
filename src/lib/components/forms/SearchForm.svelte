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
</script>

<Card class="mb-4 p-4 w-full max-w-none">
  <div class="flex justify-between items-end gap-6">
    <!-- 검색 조건 입력들 -->
    <div class="flex gap-4 flex-wrap items-end">
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