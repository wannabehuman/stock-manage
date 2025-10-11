<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button, Label, Input } from 'flowbite-svelte';
  import { HomeSolid, MailBoxSolid, GridSolid } from 'flowbite-svelte-icons';
  import { onMount, onDestroy } from 'svelte';
  import { InboundDailyTable } from './inboundDailyTable.js';
  import { SingleTon } from '../../../lib/components/commonTabulator/singleTon.js';

  // 테이블 인스턴스
  let inboundDailyTable;
  const single = SingleTon.getInstance();

  // 현재 년월 (기본값)
  const now = new Date();
  let selectedYear = now.getFullYear();
  let selectedMonth = now.getMonth() + 1;

  onMount(() => {
    // 테이블 초기화
    setTimeout(() => {
      try {
        console.log('Initializing InboundDailyTable...');
        inboundDailyTable = new InboundDailyTable();
        inboundDailyTable.init();

        // 현재 년월로 데이터 로드
        loadDailyData();

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

  // 데이터 로드 함수
  function loadDailyData() {
    if (inboundDailyTable) {
      inboundDailyTable.loadData(selectedYear, selectedMonth);
    }
  }

  // 조회 버튼 클릭
  function handleSearch() {
    loadDailyData();
  }
</script>

<svelte:head>
  <title>일별입고이력 - 재고관리시스템</title>
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
        <GridSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        일별입고이력
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- 검색 필터 -->
<div class="flex-shrink-0">
  <Card padding="none" class="mb-4 p-3 w-full max-w-none">
    <div class="flex justify-between items-end gap-4">
      <!-- 년월 선택 -->
      <div class="flex gap-3 flex-wrap items-end">
        <div>
          <Label for="year" class="mb-2">년도</Label>
          <Input
            id="year"
            type="number"
            bind:value={selectedYear}
            min="2000"
            max="2100"
            class="w-32"
          />
        </div>
        <div>
          <Label for="month" class="mb-2">월</Label>
          <Input
            id="month"
            type="number"
            bind:value={selectedMonth}
            min="1"
            max="12"
            class="w-24"
          />
        </div>
      </div>

      <!-- 버튼 -->
      <div class="flex gap-2 flex-shrink-0">
        <Button color="blue" on:click={handleSearch}>
          <GridSolid class="w-4 h-4 mr-2" />
          조회
        </Button>
      </div>
    </div>
  </Card>
</div>

<!-- 일별 입고 이력 테이블 -->
<Card padding="none" class="p-3 w-full max-w-full overflow-hidden flex-1 flex flex-col">
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3 flex-shrink-0">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex-shrink-0">
      일별 입고 이력 ({selectedYear}년 {selectedMonth}월)
    </h2>
  </div>
  <div id="inboundDailyTable" class="w-full flex-1 min-h-0 overflow-x-auto"></div>
</Card>
</div>
