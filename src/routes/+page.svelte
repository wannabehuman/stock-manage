<script>
  import { Card, Button, Badge, Breadcrumb, BreadcrumbItem, Spinner } from 'flowbite-svelte';
  import { ShoppingBagSolid, TruckSolid, ClockSolid, HomeSolid, ExclamationCircleSolid } from 'flowbite-svelte-icons';
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';

  let loading = true;
  let dashboardData = null;
  let error = null;

  onMount(async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('대시보드 데이터를 불러오는데 실패했습니다.');
      }
      dashboardData = await response.json();
      loading = false;
    } catch (err) {
      error = err.message;
      loading = false;
      console.error('Dashboard error:', err);
    }
  });

  // 최근 입출고 5건만 표시 (전체보기는 별도 메뉴에서)
  async function loadRecentTransactions() {
    try {
      const response = await fetch('/api/dashboard/recent-transactions?limit=5');
      if (response.ok) {
        const data = await response.json();
        if (dashboardData) {
          dashboardData.recentTransactions = data;
        }
      }
    } catch (err) {
      console.error('Failed to load recent transactions:', err);
    }
  }

  // 통계 데이터 계산
  $: stats = dashboardData ? [
    {
      title: '전체 재고',
      value: Number(dashboardData.summary?.total_quantity || 0).toLocaleString(),
      icon: ShoppingBagSolid,
      color: 'blue',
      link: '/inbound/stock-status',
      description: '재고현황 보기'
    },
    {
      title: '유통기한 임박',
      value: dashboardData.expiring?.length || 0,
      icon: ClockSolid,
      color: 'orange',
      link: '/outbound/register',
      description: '출고등록 하기'
    },
    {
      title: '재고 부족',
      value: dashboardData.lowStock?.length || 0,
      icon: ExclamationCircleSolid,
      color: 'red',
      link: '/inbound/register',
      description: '입고등록 하기'
    },
    // {
    //   title: '전체 품목수',
    //   value: dashboardData.summary?.active_items || 0,
    //   icon: TruckSolid,
    //   color: 'green',
    //   link: '/master/items',
    //   description: '품목관리 보기'
    // }
  ] : [];

  function getDaysLeftColor(days) {
    if (days <= 2) return 'red';
    if (days <= 5) return 'yellow';
    return 'green';
  }

  function getStockLevelColor(current, safety) {
    const shortage = safety - current;
    if (current === 0) return 'red';
    if (shortage >= safety * 0.5) return 'red';
    if (shortage >= safety * 0.3) return 'orange';
    return 'yellow';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<svelte:head>
  <title>재고관리시스템 - 대시보드</title>
</svelte:head>

<div class="page-container">
<!-- Breadcrumb -->
<div class="breadcrumb-container" in:fly="{{ y: -20, duration: 300 }}">
  <Breadcrumb class="breadcrumb-responsive">
    <BreadcrumbItem href="/" home class="whitespace-nowrap">
      <div class="flex items-center">
        <!-- <HomeSolid class="w-4 h-4 mr-2 flex-shrink-0" /> -->
        홈
      </div>
    </BreadcrumbItem>
    <BreadcrumbItem class="whitespace-nowrap">
      <div class="flex items-center">대시보드</div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- 전체 화면 그리드 레이아웃 -->
<div class="page-content">
{#if loading}
  <div class="flex items-center justify-center h-96">
    <Spinner size="12" />
  </div>
{:else if error}
  <div class="flex items-center justify-center h-96">
    <Card class="text-center">
      <ExclamationCircleSolid class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <p class="text-lg text-red-600 dark:text-red-400">{error}</p>
    </Card>
  </div>
{:else if dashboardData}
<div class="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
  <!-- 통계 카드들 (위쪽 4개) - 클릭 가능 -->
  {#each stats as stat, i}
    <div in:fly="{{ y: 20, duration: 500, delay: 150 + i * 100 }}">
      <a href={stat.link} class="block">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-all duration-300 border-l-4 border-{stat.color}-500 p-4 cursor-pointer transform hover:scale-105">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide dark:text-gray-400 mb-1">
                {stat.title}
              </p>
              <p class="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p class="text-xs text-{stat.color}-600 dark:text-{stat.color}-400 flex items-center">
                {stat.description}
                <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </p>
            </div>
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-{stat.color}-100 to-{stat.color}-200 rounded-lg dark:from-{stat.color}-900 dark:to-{stat.color}-800">
              <svelte:component this={stat.icon} class="w-6 h-6 text-{stat.color}-600 dark:text-{stat.color}-300" />
            </div>
          </div>
        </div>
      </a>
    </div>
  {/each}
</div>

<!-- 두 번째 행: 유통기한 임박 & 발주 시급 재고 -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full mt-4">
  <!-- 유통기한 임박 품목 -->
  <div in:fly="{{ y: 20, duration: 500, delay: 600 }}">
    <Card class="shadow-lg border-l-4 border-orange-500 p-4 h-[350px] flex flex-col" style="max-width:none;">
      <div class="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center">
            <ClockSolid class="w-4 h-4 text-orange-500 mr-2" />
            유통기한 임박
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">30일 이내 만료</p>
        </div>
        <Badge color="orange" class="text-xs font-semibold">
          {dashboardData.expiring?.length || 0}건
        </Badge>
      </div>

      <div class="space-y-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
        {#if dashboardData.expiring && dashboardData.expiring.length > 0}
          {#each dashboardData.expiring as item, i}
            <div class="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                 in:fly="{{ x: -20, duration: 300, delay: 700 + i * 50 }}">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 dark:text-white text-xs truncate">{item.stock_name}</p>
                <p class="text-xs text-gray-600 dark:text-gray-300">
                  {item.stock_code} · {Number(item.quantity).toLocaleString()}{item.unit}
                </p>
                <p class="text-xs text-gray-500">
                  만료일: {new Date(item.expiry_date).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div class="text-right ml-2">
                <Badge color={getDaysLeftColor(Number(item.days_until_expiry))} class="text-xs">
                  {Math.floor(Number(item.days_until_expiry))}일
                </Badge>
              </div>
            </div>
          {/each}
        {:else}
          <p class="text-center text-gray-500 py-8 text-sm">유통기한 임박 재고가 없습니다.</p>
        {/if}
      </div>
    </Card>
  </div>

  <!-- 재고 부족 품목 -->
  <div in:fly="{{ y: 20, duration: 500, delay: 800 }}">
    <Card class="shadow-lg border-l-4 border-red-500 p-4 h-[350px] flex flex-col" style="max-width:none;">
      <div class="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center">
            <ExclamationCircleSolid class="w-4 h-4 text-red-500 mr-2" />
            발주 시급 재고
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">안전재고 이하</p>
        </div>
        <Button href="/inbound/register" color="red" size="xs">
          발주
        </Button>
      </div>

      <div class="space-y-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
        {#if dashboardData.lowStock && dashboardData.lowStock.length > 0}
          {#each dashboardData.lowStock as item, i}
            <div class="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                 in:fly="{{ x: -20, duration: 300, delay: 900 + i * 50 }}">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 dark:text-white text-xs truncate">{item.stock_name}</p>
                <p class="text-xs text-gray-600 dark:text-gray-300">
                  {item.category} · {item.stock_code}
                </p>
                <p class="text-xs text-red-600 dark:text-red-400">
                  부족: {Number(item.shortage).toLocaleString()}{item.unit}
                </p>
              </div>
              <div class="text-right ml-2">
                <Badge color={getStockLevelColor(Number(item.current_stock), Number(item.safety_stock))} class="text-xs">
                  {Number(item.current_stock).toLocaleString()}/{Number(item.safety_stock).toLocaleString()}
                </Badge>
              </div>
            </div>
          {/each}
        {:else}
          <p class="text-center text-gray-500 py-8 text-sm">발주 시급 재고가 없습니다.</p>
        {/if}
      </div>
    </Card>
  </div>
</div>

<!-- 세 번째 행: 최근 입출고 내역 (전체 너비) -->
<div class="w-full mt-4">
  <div in:fly="{{ y: 20, duration: 500, delay: 1000 }}">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-blue-500 p-4">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center">
            <TruckSolid class="w-4 h-4 text-blue-500 mr-2" />
            최근 입출고 내역
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">최근 5건</p>
        </div>
        <a
          href="/history/all"
          class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
        >
          전체보기
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
            <tr>
              <th class="px-3 py-2">구분</th>
              <th class="px-3 py-2">품목코드</th>
              <th class="px-3 py-2">품목명</th>
              <th class="px-3 py-2">수량</th>
              <th class="px-3 py-2">단위</th>
              <th class="px-3 py-2">일자</th>
              <th class="px-3 py-2">비고</th>
            </tr>
          </thead>
          <tbody>
            {#if dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0}
              {#each dashboardData.recentTransactions as item, i}
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    in:fly="{{ x: -20, duration: 300, delay: 1100 + i * 20 }}">
                  <td class="px-3 py-2">
                    <Badge color={item.transaction_type === 'IN' ? 'green' : 'purple'} class="text-xs">
                      {item.transaction_type === 'IN' ? '입고' : '출고'}
                    </Badge>
                  </td>
                  <td class="px-3 py-2 font-medium text-xs">{item.stock_code}</td>
                  <td class="px-3 py-2 text-xs">{item.stock_name}</td>
                  <td class="px-3 py-2 text-right">
                    <span class="font-semibold text-xs {item.transaction_type === 'IN' ? 'text-green-600' : 'text-purple-600'}">
                      {item.transaction_type === 'IN' ? '+' : '-'}{Number(item.quantity).toLocaleString()}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-xs">{item.unit}</td>
                  <td class="px-3 py-2 text-xs">
                    {new Date(item.transaction_date).toLocaleDateString('ko-KR')}
                  </td>
                  <td class="px-3 py-2 text-xs truncate" style="max-width: 120px;">{item.remark || '-'}</td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td colspan="7" class="px-3 py-8 text-center text-gray-500 text-sm">
                  입출고 내역이 없습니다.
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
{/if}
</div>
</div>
