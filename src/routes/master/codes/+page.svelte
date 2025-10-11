<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button } from 'flowbite-svelte';
  import { HomeSolid, MailBoxSolid, GridSolid } from 'flowbite-svelte-icons';
  import { onMount, onDestroy } from 'svelte';
  import { CodesTable } from './codesTable.js';
  import { SingleTon } from '../../../lib/components/commonTabulator/singleTon.js';
  // import { CodesTable2 } from './codesTable2.js';

  // 테이블 인스턴스
  let codesTable;
  // let codesTable2;
  const single = SingleTon.getInstance();

  onMount(() => {
    // 기초코드 테이블 초기화
    setTimeout(() => {
      try {
        console.log('Initializing CodesTable...');
        codesTable = new CodesTable();

        console.log('Calling init...');
        codesTable.init();

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
  <title>기초코드관리 - 재고관리시스템</title>
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
    <BreadcrumbItem href="/master" class="whitespace-nowrap">
      <div class="flex items-center">
        <MailBoxSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        기준정보관리
      </div>
    </BreadcrumbItem>
    <BreadcrumbItem class="whitespace-nowrap">
      <div class="flex items-center">
        <GridSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        기초코드관리
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- 상단 버튼 영역 -->
<div class="flex-shrink-0 mb-4">
  <div class="flex gap-2 justify-end">
    <!-- <Button color="blue" on:click={() => {
      codesTable?.saveData();
      codesTable?.codesTable2?.saveData();
    }}>
      💾 저장
    </Button> -->
  </div>
</div>

<!-- 코드 그룹/상세 테이블 -->
<Card class="p-3 w-full max-w-full overflow-hidden flex-1 flex flex-col gap-4">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
    <!-- 대분류 (코드 그룹) -->
    <div class="flex flex-col min-w-0">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 flex-shrink-0">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex-shrink-0">대분류 (코드그룹)</h2>
        <Button color="green" class="w-full sm:w-auto flex-shrink-0" on:click={() => {
          console.log('Add row button clicked, codesTable:', codesTable);
          codesTable?.addRow();
        }}>
          + 행 추가
        </Button>
        <Button color="blue" on:click={() => {
          codesTable?.saveData();
          // codesTable?.codesTable2?.saveData();
        }}>
          💾 저장
        </Button>
      </div>
      <div id="codesTable" class="w-full flex-1 min-h-0 overflow-auto"></div>
    </div>

    <!-- 소분류 (코드 상세) -->
    <div class="flex flex-col min-w-0">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 flex-shrink-0">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex-shrink-0">소분류 (코드상세)</h2>
        <Button color="green" class="w-full sm:w-auto flex-shrink-0" on:click={() => {
          // console.log('Add row button clicked, codesTable2:', codesTable2);
          codesTable.addRow2();
        }}>
          + 행 추가
        </Button>
        <Button color="blue" on:click={() => {
          // codesTable?.saveData();
          codesTable?.codesTable2?.saveData();
        }}>
          💾 저장
        </Button>
      </div>
      <div id="codesTable2" class="w-full flex-1 min-h-0 overflow-auto"></div>
    </div>
  </div>
</Card>
</div>