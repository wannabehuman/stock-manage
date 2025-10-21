<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button } from 'flowbite-svelte';
  import { HomeSolid, FileChartBarSolid } from 'flowbite-svelte-icons';
  import { onMount, onDestroy } from 'svelte';
  import { AllHistoryTable } from './allHistoryTable.js';
  import { SearchForm, ItemCdInput, ItemNmInput, DateStInput, DateEdInput, SelectInput } from '../../../lib/components/forms';
  import { SingleTon } from '../../../lib/components/commonTabulator/singleTon.js';

  // 테이블 인스턴스
  let allHistoryTable;
  const single = SingleTon.getInstance();

  onMount(() => {
    // 입출고내역 테이블 초기화
    setTimeout(() => {
      try {
        console.log('Initializing AllHistoryTable...');
        allHistoryTable = new AllHistoryTable();
        console.log('Calling init...');
        allHistoryTable.init();
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

  // 구분 옵션
  const ioTypeOptions = [
    { value: '', label: '전체' },
    { value: 'IN', label: '입고' },
    { value: 'OUT', label: '출고' }
  ];
</script>

<svelte:head>
  <title>입출고내역 - 재고관리시스템</title>
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
        홈
      </div>
    </BreadcrumbItem>
    <BreadcrumbItem class="whitespace-nowrap">
      <div class="flex items-center">
        <FileChartBarSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        입출고내역
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- 검색 필터 -->
<div class="flex-shrink-0">
<SearchForm
  title="검색 조건"
  columns={5}
  onSearch={() => allHistoryTable?.search()}
>
  <DateStInput 
    value={allHistoryTable?.getSearchData()?.startDate || ''}
    onInput={(e) => allHistoryTable?.updateSearchData('startDate', e.target.value)}
  />
  <DateEdInput 
    value={allHistoryTable?.getSearchData()?.endDate || ''}
    onInput={(e) => allHistoryTable?.updateSearchData('endDate', e.target.value)}
  />
  <SelectInput
    label="구분"
    dataFilter="true"
    dataName="IO_TYPE"
    options={ioTypeOptions}
    value={allHistoryTable?.getSearchData()?.ioType || ''}
    onChange={(e) => allHistoryTable?.updateSearchData('ioType', e.target.value)}
  />
  <ItemCdInput
    value={allHistoryTable?.getSearchData()?.itemCode || ''}
    onInput={(e) => allHistoryTable?.updateSearchData('itemCode', e.target.value)}
    onSearch={() => allHistoryTable?.openSearchItemModal()}
  />
  <ItemNmInput
    value={allHistoryTable?.getSearchData()?.itemName || ''}
    onInput={(e) => allHistoryTable?.updateSearchData('itemName', e.target.value)}
    onSearch={() => allHistoryTable?.openSearchItemModal()}
  />

  <svelte:fragment slot="buttons">

  </svelte:fragment>
</SearchForm>
</div>

<!-- 입출고내역 테이블 -->
<Card class="p-3 w-full max-w-full flex-1 flex flex-col">
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3 flex-shrink-0">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex-shrink-0">입출고내역 전체보기</h2>
  </div>
  <div class="my-tabulator" style="height: 100%;">
    <div id="allHistoryTable" class="w-full flex-1 min-h-0"></div>
  </div>
</Card>
</div>
