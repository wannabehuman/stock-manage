<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button } from 'flowbite-svelte';
  import { HomeSolid, MailBoxSolid, GridSolid } from 'flowbite-svelte-icons';
  import { onMount, onDestroy } from 'svelte';
  import { OutboundHistoryTable } from './outboundHistoryTable.js';
  import { SearchForm, ItemCdInput, ItemNmInput, MonthInput } from '../../../lib/components/forms';
  import { SingleTon } from '../../../lib/components/commonTabulator/singleTon.js';

  // 테이블 인스턴스
  let outboundHistoryTable;
  const single = SingleTon.getInstance();

  onMount(() => {
    // 출고이력 테이블 초기화
    setTimeout(() => {
      try {
        console.log('Initializing OutboundHistoryTable...');
        outboundHistoryTable = new OutboundHistoryTable();
        console.log('Calling init...');
        outboundHistoryTable.init();
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
  <title>출고이력조회 - 재고관리시스템</title>
  <style>
    .tabulator-row .tabulator-cell {
      border-right: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
    }
  </style>
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
    <BreadcrumbItem href="/outbound" class="whitespace-nowrap">
      <div class="flex items-center">
        <MailBoxSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        출고관리
      </div>
    </BreadcrumbItem>
    <BreadcrumbItem class="whitespace-nowrap">
      <div class="flex items-center">
        <GridSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        출고이력조회
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- 검색 필터 -->
<div class="flex-shrink-0">
<SearchForm
  title="검색 조건"
  columns={3}
  onSearch={() => outboundHistoryTable?.search()}
>
  <MonthInput
    label="조회년월"
    value={outboundHistoryTable?.getSearchData()?.month || ''}
    onInput={(e) => outboundHistoryTable?.updateSearchData('month', e.target.value)}
  />
  <ItemCdInput
    value={outboundHistoryTable?.getSearchData()?.itemCode || ''}
    onInput={(e) => outboundHistoryTable?.updateSearchData('itemCode', e.target.value)}
  />
  <ItemNmInput
    value={outboundHistoryTable?.getSearchData()?.itemName || ''}
    onInput={(e) => outboundHistoryTable?.updateSearchData('itemName', e.target.value)}
  />

  <svelte:fragment slot="buttons">
    <Button color="blue" on:click={() => outboundHistoryTable?.search()}>
      🔍
      조회
    </Button>
  </svelte:fragment>
</SearchForm>
</div>

<!-- 출고이력 테이블 -->
<Card class="p-3 w-full max-w-full flex-1 flex flex-col">
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3 flex-shrink-0">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex-shrink-0">출고이력조회</h2>
  </div>
  <div class="my-tabulator" style="height: 100%;">
    <div id="outboundHistoryTable" class="w-full flex-1 min-h-0"></div>
  </div>
</Card>
</div>