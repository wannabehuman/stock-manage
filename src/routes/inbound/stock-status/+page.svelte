<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button } from 'flowbite-svelte';
  import { HomeSolid, MailBoxSolid, ChartPieSolid } from 'flowbite-svelte-icons';
  import { onMount, onDestroy } from 'svelte';
  import { StockStatusTable } from './stockStatusTable.js';
  import { SearchForm, ItemCdInput, ItemNmInput, ItemGrpInput } from '../../../lib/components/forms';
  import { SingleTon } from '../../../lib/components/commonTabulator/singleTon.js';

  // 테이블 인스턴스
  let stockStatusTable;
  const single = SingleTon.getInstance();

  onMount(() => {
    // 재고현황 테이블 초기화
    setTimeout(() => {
      try {
        console.log('Initializing StockStatusTable...');
        stockStatusTable = new StockStatusTable();
        console.log('Calling init...');
        stockStatusTable.init();
        console.log('Table initialization completed');
      } catch (error) {
        console.error('Error initializing table:', error);
      }
    }, 100); // 100ms 지연
  });

  onDestroy(() => {
    // 페이지 이동 시 SingleTon 데이터 리셋
    single.resetData('saveData');
    single.resetData('activedRow');
  });
</script>

<svelte:head>
  <title>재고현황 - 재고관리시스템</title>
</svelte:head>

<div class="h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
<!-- Breadcrumb -->
<div class="mb-4 flex-shrink-0">
  <Breadcrumb class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg w-full">
    <BreadcrumbItem href="/" home class="whitespace-nowrap">
      <div class="flex items-center">
        <HomeSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        홈
      </div>
    </BreadcrumbItem>
    <BreadcrumbItem href="/inbound" class="whitespace-nowrap">
      <div class="flex items-center">
        <MailBoxSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        입고관리
      </div>
    </BreadcrumbItem>
    <BreadcrumbItem class="whitespace-nowrap">
      <div class="flex items-center">
        <ChartPieSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        재고현황
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- 검색 필터 -->
<div class="flex-shrink-0">
<SearchForm
  title="검색 조건"
  columns={3}
  onSearch={() => stockStatusTable?.search()}
>
  <ItemGrpInput
    value={stockStatusTable?.getSearchData()?.itemGrpCode || ''}
    onInput={(e) => stockStatusTable?.updateSearchData('itemGrpCode', e.target.value)}
  />
  <ItemCdInput
    value={stockStatusTable?.getSearchData()?.itemCode || ''}
    onInput={(e) => stockStatusTable?.updateSearchData('itemCode', e.target.value)}
    onSearch={() => stockStatusTable?.openSearchItemModal()}
  />
  <ItemNmInput
    value={stockStatusTable?.getSearchData()?.itemName || ''}
    onInput={(e) => stockStatusTable?.updateSearchData('itemName', e.target.value)}
    onSearch={() => stockStatusTable?.openSearchItemModal()}
  />

  <svelte:fragment slot="buttons">
    <!-- <Button color="blue" on:click={() => stockStatusTable?.search()}>
      🔍
      조회
    </Button> -->
  </svelte:fragment>
</SearchForm>
</div>

<!-- 재고현황 테이블 -->
<Card class="p-3 w-full max-w-full flex-1 flex flex-col">
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3 flex-shrink-0">
    <div>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex-shrink-0">재고현황</h2>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        💡 이력 컬럼의 📋 아이콘을 클릭하면 해당 품목의 입출고 이력을 확인할 수 있습니다.
      </p>
    </div>
  </div>
  <div id="stockStatusTable" class="w-full flex-1 min-h-0 overflow-x-auto"></div>
</Card>
</div>
