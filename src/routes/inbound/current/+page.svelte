<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button, Label, Input } from 'flowbite-svelte';
  import { HomeSolid, MailBoxSolid, SearchSolid, RefreshOutline } from 'flowbite-svelte-icons';
  import { onMount, onDestroy } from 'svelte';
  import { CurrentStockTable } from './currentStockTable.js';
  import { SingleTon } from '../../../lib/components/commonTabulator/singleTon.js';
  import SearchForm from '../../../lib/components/forms/SearchForm.svelte';

  // 테이블 인스턴스
  let currentStockTable;
  const single = SingleTon.getInstance();

  // 검색 조건
  let searchData = {
    stock_code: '',
    stock_name: '',
    category: ''
  };

  onMount(() => {
    // 테이블 초기화
    setTimeout(() => {
      try {
        console.log('Initializing CurrentStockTable...');
        currentStockTable = new CurrentStockTable();
        currentStockTable.init();
        console.log('Table initialization completed');
      } catch (error) {
        console.error('Error initializing table:', error);
      }
    }, 100);
  });

  onDestroy(() => {
    // 페이지 이동 시 SingleTon 데이터 리셋
    single.resetData('saveData');
    single.resetData('activedRow');
  });

  // // 검색 실행
  // function handleSearch() {
  //   if (currentStockTable && currentStockTable._tabulator) {
  //     // 필터 조건 생성
  //     const filters = [];

  //     if (searchData.stock_code) {
  //       filters.push({ field: 'stock_code', type: 'like', value: searchData.stock_code });
  //     }
  //     if (searchData.stock_name) {
  //       filters.push({ field: 'stock_name', type: 'like', value: searchData.stock_name });
  //     }
  //     if (searchData.category) {
  //       filters.push({ field: 'category', type: 'like', value: searchData.category });
  //     }

  //     // 필터 적용
  //     if (filters.length > 0) {
  //       currentStockTable._tabulator.setFilter(filters);
  //     } else {
  //       currentStockTable._tabulator.clearFilter();
  //     }
  //   }
  // }

  // 새로고침
  function handleRefresh() {
    if (currentStockTable) {
      searchData = { stock_code: '', stock_name: '', category: '' };
      currentStockTable.search();
    }
  }
</script>

<svelte:head>
  <title>현재고조회 - 재고관리시스템</title>
</svelte:head>

<div class="h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
<!-- Breadcrumb -->
<div class="mb-4 flex-shrink-0">
  <Breadcrumb class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg w-full">
    <BreadcrumbItem href="/" home class="whitespace-nowrap">
      <div class="flex items-center">
        <!-- <HomeSolid class="w-4 h-4 mr-2 flex-shrink-0" /> -->
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
        <SearchSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        현재고조회
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- 현재고 테이블 -->
<Card padding="none" class="p-3 w-full max-w-full overflow-hidden flex-1 flex flex-col">
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3 flex-shrink-0">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex-shrink-0">
      현재고 조회
    </h2>
    <div class="flex gap-2 flex-shrink-0">
      <Button color="blue" size="sm" on:click={handleRefresh}>
        <RefreshOutline class="w-4 h-4 mr-2" />
        새로고침
      </Button>
    </div>
  </div>
  <div id="currentStockTable" class="w-full flex-1 min-h-0 overflow-x-auto"></div>
</Card>
</div>