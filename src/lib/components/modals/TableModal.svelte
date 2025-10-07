<script>
  import { Modal, Button, Input, Badge } from 'flowbite-svelte';
  import { SearchSolid } from 'flowbite-svelte-icons';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  // Props
  export let open = false;
  export let title = '테이블 선택';
  export let size = 'xl'; // xs, sm, md, lg, xl
  export let tableClass = null; // CommonPop 클래스
  export let tableId = 'modalTable';
  export let showSearch = true;
  export let showFooterInfo = true;
  export let confirmText = '선택';
  export let cancelText = '취소';
  export let selectionMode = 'single'; // single, multiple, none
  export let searchPlaceholder = '검색어를 입력하세요';

  const dispatch = createEventDispatcher();

  // 내부 상태
  let tableInstance = null;
  let searchTerm = '';
  let selectedCount = 0;
  let totalCount = 0;
  let isLoading = false;

  // 모달이 열릴 때 테이블 초기화
  $: if (open && tableClass && !tableInstance) {
    initializeTable();
  }

  // 모달이 닫힐 때 정리
  $: if (!open && tableInstance) {
    cleanup();
  }

  async function initializeTable() {
    try {
      isLoading = true;
      
      // 테이블 클래스 인스턴스 생성
      tableInstance = new tableClass();
      
      // 모달 설정
      tableInstance.setModalSettings({
        title,
        size,
        showSearch,
        selectionMode,
        maxHeight: '400px'
      });

      // 테이블 셀렉터 설정
      tableInstance.setTbSelectorId(tableId);
      
      // 콜백 함수 설정
      tableInstance.setCallbacks({
        onSelect: handleSelect,
        onConfirm: handleConfirm,
        onCancel: handleCancel
      });

      // 테이블 초기화
      await tableInstance.init();
      
      // 초기 데이터 로드
      updateCounts();
      
      isLoading = false;
      
    } catch (error) {
      console.error('Table initialization failed:', error);
      isLoading = false;
    }
  }

  function cleanup() {
    if (tableInstance) {
      tableInstance.destroy();
      tableInstance = null;
    }
    searchTerm = '';
    selectedCount = 0;
    totalCount = 0;
  }

  function handleSearch() {
    if (tableInstance) {
      tableInstance.performSearch(searchTerm);
      updateCounts();
    }
  }

  function clearSearch() {
    searchTerm = '';
    if (tableInstance) {
      tableInstance.clearSearch();
      updateCounts();
    }
  }

  function handleSelect(selectedData, selectedRows) {
    selectedCount = Array.isArray(selectedData) ? selectedData.length : (selectedData ? 1 : 0);
    dispatch('select', { selectedData, selectedRows });
  }

  function handleConfirm() {
    const selectedData = tableInstance?.getSelectedData();
    const selectedRows = tableInstance?.getSelectedRows();
    
    dispatch('confirm', { selectedData, selectedRows });
    handleClose();
  }

  function handleCancel() {
    if (tableInstance) {
      tableInstance.cancel();
    }
    dispatch('cancel');
    handleClose();
  }

  function handleClose() {
    open = false;
    dispatch('close');
  }

  function updateCounts() {
    if (tableInstance && tableInstance._tabulator) {
      // 필터된 데이터 개수 가져오기
      const filteredData = tableInstance._tabulator.getData(true); // true = 필터된 데이터만
      totalCount = filteredData.length;
    }
  }

  // 검색어 변경 시 자동 검색 (디바운스)
  let searchTimeout;
  $: if (searchTerm !== undefined) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      handleSearch();
    }, 300);
  }

  onDestroy(() => {
    cleanup();
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  });
</script>

<Modal bind:open {title} {size} on:close={handleClose} autoclose={false}>
  <!-- 검색 영역 -->
  {#if showSearch}
    <div class="mb-4 flex gap-2">
      <div class="flex-1 relative">
        <Input
          bind:value={searchTerm}
          placeholder={searchPlaceholder}
          class="pl-10"
          disabled={isLoading}
        />
        <SearchSolid class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      {#if searchTerm}
        <Button color="alternative" size="sm" on:click={clearSearch} disabled={isLoading}>
          초기화
        </Button>
      {/if}
    </div>
  {/if}

  <!-- 정보 표시 -->
  {#if showFooterInfo}
    <div class="mb-3 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
      <div>
        총 <span class="font-semibold">{totalCount}</span>개 항목
        {#if searchTerm}
          ('{searchTerm}' 검색 결과)
        {/if}
      </div>
      {#if selectionMode !== 'none'}
        <div class="flex items-center gap-2">
          선택된 항목: 
          <Badge color={selectedCount > 0 ? 'blue' : 'gray'}>
            {selectedCount}
          </Badge>
        </div>
      {/if}
    </div>
  {/if}

  <!-- 로딩 상태 -->
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-400">테이블을 로드하는 중...</span>
    </div>
  {/if}

  <!-- 테이블 컨테이너 -->
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <div id={tableId} class="w-full"></div>
  </div>

  <!-- 커스텀 콘텐츠 슬롯 -->
  <slot name="additional-content" {tableInstance} {selectedCount} {totalCount} />

  <svelte:fragment slot="footer">
    <div class="flex justify-between items-center w-full">
      <!-- 왼쪽 정보 -->
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {#if selectionMode === 'multiple'}
          다중 선택 가능 (Ctrl/Cmd + 클릭)
        {:else if selectionMode === 'single'}
          단일 선택 모드
        {/if}
      </div>

      <!-- 오른쪽 버튼들 -->
      <div class="flex gap-2">
        <Button color="alternative" on:click={handleCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        {#if selectionMode !== 'none'}
          <Button 
            color="blue" 
            on:click={handleConfirm}
            disabled={selectedCount === 0 || isLoading}
          >
            {confirmText}
            {#if selectedCount > 0}
              ({selectedCount})
            {/if}
          </Button>
        {/if}
      </div>
    </div>
  </svelte:fragment>
</Modal>

<style>
  /* 테이블 스타일 조정 */
  :global(#modalTable .tabulator) {
    border: none;
    font-size: 0.875rem;
  }
  
  :global(#modalTable .tabulator-header) {
    background-color: rgb(249 250 251);
    border-bottom: 1px solid rgb(229 231 235);
  }
  
  :global(.dark #modalTable .tabulator-header) {
    background-color: rgb(55 65 81);
    border-bottom: 1px solid rgb(75 85 99);
  }
  
  :global(#modalTable .tabulator-row) {
    cursor: pointer;
  }
  
  :global(#modalTable .tabulator-row:hover) {
    background-color: rgb(249 250 251);
  }
  
  :global(.dark #modalTable .tabulator-row:hover) {
    background-color: rgb(55 65 81);
  }
  
  :global(#modalTable .tabulator-row.tabulator-selected) {
    background-color: rgb(219 234 254) !important;
  }
  
  :global(.dark #modalTable .tabulator-row.tabulator-selected) {
    background-color: rgb(30 58 138) !important;
  }
</style>