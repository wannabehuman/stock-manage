<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button } from 'flowbite-svelte';
  import { HomeSolid, MailBoxSolid, GridSolid } from 'flowbite-svelte-icons';
  import { onMount, onDestroy } from 'svelte';
  import { InboundRegisterTable } from './inboundRegisterTable.js';
  import { SearchForm, ItemCdInput, ItemNmInput, DateStInput, DateEdInput } from '../../../lib/components/forms';
  import { SingleTon } from '../../../lib/components/commonTabulator/singleTon.js';

  // 테이블 인스턴스
  let inboundTable;
  const single = SingleTon.getInstance();

  onMount(() => {
    // 입고등록 테이블 초기화
    setTimeout(() => {
      try {
        console.log('Initializing InboundRegisterTable...');
        inboundTable = new InboundRegisterTable();
        console.log('Calling init...');
        inboundTable.init();
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
  <title>입고등록 - 재고관리시스템</title>
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
        <GridSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        입고등록
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- 검색 필터 -->
<div class="flex-shrink-0">
<SearchForm 
  title="검색 조건"
  columns={4}
  onSearch={() => inboundTable?.search()}
>
  <DateStInput 
    value={inboundTable?.getSearchData()?.startDate || ''}
    onInput={(e) => inboundTable?.updateSearchData('startDate', e.target.value)}
  />
  <DateEdInput 
    value={inboundTable?.getSearchData()?.endDate || ''}
    onInput={(e) => inboundTable?.updateSearchData('endDate', e.target.value)}
  />
  <ItemCdInput
    value={inboundTable?.getSearchData()?.itemCode || ''}
    onInput={(e) => inboundTable?.updateSearchData('itemCode', e.target.value)}
    onSearch={() => inboundTable?.openSearchItemModal()}
  />
  <ItemNmInput
    value={inboundTable?.getSearchData()?.itemName || ''}
    onInput={(e) => inboundTable?.updateSearchData('itemName', e.target.value)}
    onSearch={() => inboundTable?.openSearchItemModal()}
  />
  
  <svelte:fragment slot="buttons">
    <Button color="blue" on:click={() => inboundTable?.saveData()}>
      💾
      저장
    </Button>
  </svelte:fragment>
</SearchForm>
</div>

<!-- 입고등록 테이블 -->
<Card class="p-3 w-full max-w-full overflow-hidden flex-1 flex flex-col">
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3 flex-shrink-0">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex-shrink-0">입고 목록</h2>
    <!-- 행 추가 버튼 -->
    <Button color="green" class="w-full sm:w-auto flex-shrink-0" on:click={() => {
      console.log('Add row button clicked, inboundTable:', inboundTable);
      inboundTable?.addRow();
    }}>
      +
      행 추가
    </Button>
  </div>
  <div id="inboundTable" class="w-full flex-1 min-h-0"></div>
</Card>
</div>