<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button } from 'flowbite-svelte';
  import { HomeSolid, MailBoxSolid, GridSolid } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';
  import { OutboundRegisterTable } from './outboundRegisterTable.js';
  import { SearchForm, ItemCdInput, ItemNmInput, DateStInput, DateEdInput } from '../../../lib/components/forms';

  // 테이블 인스턴스
  let outboundRegisterTable;

  onMount(() => {
    // 입고등록 테이블 초기화
    setTimeout(() => {
      try {
        console.log('Initializing OutboundRegisterTable...');
        outboundRegisterTable = new OutboundRegisterTable();
        console.log('Calling init...');
        outboundRegisterTable.init();
        console.log('Table initialization completed');
      } catch (error) {
        console.error('Error initializing table:', error);
      }
    }, 100); // 100ms 지연
  });
</script>

<svelte:head>
  <title>출고등록 - 재고관리시스템</title>
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
    <BreadcrumbItem href="/outbound" class="whitespace-nowrap">
      <div class="flex items-center">
        <MailBoxSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        출고관리
      </div>
    </BreadcrumbItem>
    <BreadcrumbItem class="whitespace-nowrap">
      <div class="flex items-center">
        <GridSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        출고등록
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- 검색 필터 -->
<div class="flex-shrink-0">
<SearchForm 
  title="검색 조건"
  columns={4}
  onSearch={() => outboundRegisterTable?.search()}
>
  <DateStInput 
    value={outboundRegisterTable?.getSearchData()?.startDate || ''}
    onInput={(e) => outboundRegisterTable?.updateSearchData('startDate', e.target.value)}
  />
  <DateEdInput 
    value={outboundRegisterTable?.getSearchData()?.endDate || ''}
    onInput={(e) => outboundRegisterTable?.updateSearchData('endDate', e.target.value)}
  />
  <ItemCdInput 
    value={outboundRegisterTable?.getSearchData()?.itemCode || ''}
    onInput={(e) => outboundRegisterTable?.updateSearchData('itemCode', e.target.value)}
  />
  <ItemNmInput 
    value={outboundRegisterTable?.getSearchData()?.itemName || ''}
    onInput={(e) => outboundRegisterTable?.updateSearchData('itemName', e.target.value)}
  />
  
  <svelte:fragment slot="buttons">
    <Button color="blue" on:click={() => outboundRegisterTable?.saveData()}>
      💾
      저장
    </Button>
  </svelte:fragment>
</SearchForm>
</div>

<!-- 입고등록 테이블 -->
<Card class="p-3 w-full max-w-full overflow-hidden flex-1 flex flex-col">
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3 flex-shrink-0">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex-shrink-0">출고 목록</h2>
    <!-- 행 추가 버튼 -->
    <Button color="green" class="w-full sm:w-auto flex-shrink-0" on:click={() => {
      console.log('Add row button clicked, outboundRegisterTable:', outboundRegisterTable);
      outboundRegisterTable?.addRow();
    }}>
      +
      행 추가
    </Button>
  </div>
  <div id="outboundTable" class="w-full flex-1 min-h-0 overflow-x-auto"></div>
</Card>
</div>