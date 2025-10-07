<script>
  import { Card, Button, Badge, Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
  import { ShoppingBagSolid, TruckSolid, ClockSolid, HomeSolid } from 'flowbite-svelte-icons';
  import { fly } from 'svelte/transition';
  
  let stats = [
    { title: '전체 재고', value: '1,247', icon: ShoppingBagSolid, color: 'blue' },
    { title: '유통기한 임박', value: '12', icon: ClockSolid, color: 'orange' },
    { title: '재고 부족', value: '8', icon: ClockSolid, color: 'red' },
    { title: '오늘 입출고', value: '23', icon: TruckSolid, color: 'green' }
  ];
  
  // 유통기한 임박 품목
  let expiringItems = [
    { id: 1, name: '우유 500ml', expiryDate: '2024-01-18', daysLeft: 3, quantity: 25, location: 'A-01' },
    { id: 2, name: '요거트 딸기맛', expiryDate: '2024-01-20', daysLeft: 5, quantity: 15, location: 'A-02' },
    { id: 3, name: '치즈 슬라이스', expiryDate: '2024-01-19', daysLeft: 4, quantity: 8, location: 'A-03' },
    { id: 4, name: '생크림', expiryDate: '2024-01-17', daysLeft: 2, quantity: 12, location: 'B-01' }
  ];
  
  // 재고 부족 품목
  let lowStockItems = [
    { id: 1, name: '노트북 삼성 A1', currentStock: 2, minStock: 10, orderQuantity: 20, supplier: '삼성전자' },
    { id: 2, name: '마우스 로지텍 B2', currentStock: 1, minStock: 5, orderQuantity: 15, supplier: '로지텍코리아' },
    { id: 3, name: '키보드 기계식 C3', currentStock: 0, minStock: 8, orderQuantity: 25, supplier: '체리MX' },
    { id: 4, name: '모니터 LG 27인치', currentStock: 3, minStock: 12, orderQuantity: 30, supplier: 'LG전자' }
  ];
  
  // 최근 입고 목록
  let recentInbound = [
    { id: 1, item: '스마트폰 갤럭시 S24', quantity: 50, date: '2024-01-15 14:30', supplier: '삼성전자', location: 'C-01' },
    { id: 2, item: '태블릿 아이패드', quantity: 25, date: '2024-01-15 11:20', supplier: '애플코리아', location: 'C-02' },
    { id: 3, item: '무선이어폰 에어팟', quantity: 100, date: '2024-01-14 16:45', supplier: '애플코리아', location: 'D-01' },
    { id: 4, item: '충전기 고속충전', quantity: 200, date: '2024-01-14 09:15', supplier: '삼성전자', location: 'D-02' }
  ];
  
  // 최근 출고 목록
  let recentOutbound = [
    { id: 1, item: '노트북 맥북 프로', quantity: 8, date: '2024-01-15 15:45', customer: '㈜테크컴퍼니', orderNo: 'ORD-2024-001' },
    { id: 2, item: '마우스 무선마우스', quantity: 15, date: '2024-01-15 13:20', customer: '오피스솔루션', orderNo: 'ORD-2024-002' },
    { id: 3, item: '키보드 무선키보드', quantity: 12, date: '2024-01-14 17:30', customer: '스마트오피스', orderNo: 'ORD-2024-003' },
    { id: 4, item: '웹캠 HD화질', quantity: 30, date: '2024-01-14 14:10', customer: '원격솔루션', orderNo: 'ORD-2024-004' }
  ];
  
  function getDaysLeftColor(days) {
    if (days <= 2) return 'red';
    if (days <= 5) return 'yellow';
    return 'green';
  }
  
  function getStockLevelColor(current, min) {
    if (current === 0) return 'red';
    if (current <= min * 0.5) return 'orange';
    return 'yellow';
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
        <HomeSolid class="w-4 h-4 mr-2 flex-shrink-0" />
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
<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
  <!-- 통계 카드들 (위쪽 4개) -->
  {#each stats as stat, i}
    <div in:fly="{{ y: 20, duration: 500, delay: 150 + i * 100 }}">
      <Card class="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-{stat.color}-500 flex flex-col justify-center">
        <div class="text-center">
          <div class="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-{stat.color}-100 to-{stat.color}-200 rounded-xl dark:from-{stat.color}-900 dark:to-{stat.color}-800 shadow-lg mx-auto mb-3">
            <svelte:component this={stat.icon} class="w-8 h-8 text-{stat.color}-600 dark:text-{stat.color}-300" />
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {stat.value}
          </p>
          <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide dark:text-gray-300 mt-1">
            {stat.title}
          </p>
        </div>
      </Card>
    </div>
  {/each}

  <!-- 유통기한 임박 품목 -->
  <div class="lg:col-span-2" in:fly="{{ y: 20, duration: 500, delay: 600 }}">
    <Card class="h-full shadow-lg border-l-4 border-orange-500 flex flex-col w-full max-w-none">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <ClockSolid class="w-5 h-5 text-orange-500 mr-2" />
            유통기한 임박
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">긴급 처리 필요</p>
        </div>
        <Badge color="orange" class="text-xs font-semibold">
          {expiringItems.length}건
        </Badge>
      </div>
      
      <div class="space-y-2 flex-1 overflow-y-auto">
        {#each expiringItems as item, i}
          <div class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg" 
               in:fly="{{ x: -20, duration: 300, delay: 700 + i * 100 }}">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
              <p class="text-xs text-gray-600 dark:text-gray-300">{item.location} · {item.quantity}개</p>
            </div>
            <div class="text-right ml-2">
              <Badge color={getDaysLeftColor(item.daysLeft)} class="text-xs">
                {item.daysLeft}일
              </Badge>
            </div>
          </div>
        {/each}
      </div>
    </Card>
  </div>

  <!-- 재고 부족 품목 -->
  <div class="lg:col-span-2" in:fly="{{ y: 20, duration: 500, delay: 800 }}">
    <Card class="h-full shadow-lg border-l-4 border-red-500 flex flex-col w-full max-w-none">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <ClockSolid class="w-5 h-5 text-red-500 mr-2" />
            재고 부족
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">주문 필요</p>
        </div>
        <Button href="/inbound/register" color="red" size="xs">
          주문
        </Button>
      </div>
      
      <div class="space-y-2 flex-1 overflow-y-auto">
        {#each lowStockItems as item, i}
          <div class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg" 
               in:fly="{{ x: -20, duration: 300, delay: 900 + i * 100 }}">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
              <p class="text-xs text-gray-600 dark:text-gray-300">{item.supplier}</p>
            </div>
            <div class="text-right ml-2">
              <Badge color={getStockLevelColor(item.currentStock, item.minStock)} class="text-xs">
                {item.currentStock}/{item.minStock}
              </Badge>
            </div>
          </div>
        {/each}
      </div>
    </Card>
  </div>

  <!-- 최근 입고 -->
  <div class="lg:col-span-2" in:fly="{{ y: 20, duration: 500, delay: 1000 }}">
    <Card class="h-full shadow-lg border-l-4 border-green-500 flex flex-col w-full max-w-none">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <TruckSolid class="w-5 h-5 text-green-500 mr-2" />
            최근 입고
          </h3>
        </div>
        <Button href="/inbound/history" color="green" size="xs">
          전체
        </Button>
      </div>
      
      <div class="space-y-2 flex-1 overflow-y-auto">
        {#each recentInbound as item, i}
          <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg" 
               in:fly="{{ x: -20, duration: 300, delay: 1100 + i * 100 }}">
            <div class="flex items-center justify-between mb-1">
              <p class="font-medium text-gray-900 dark:text-white text-sm">{item.item}</p>
              <Badge color="green" class="text-xs font-bold">
                +{item.quantity}
              </Badge>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-300">{item.supplier}</p>
            <p class="text-xs text-gray-500 flex items-center mt-1">
              <ClockSolid class="w-3 h-3 mr-1" />
              {item.date}
            </p>
          </div>
        {/each}
      </div>
    </Card>
  </div>

  <!-- 최근 출고 -->
  <div class="lg:col-span-2" in:fly="{{ y: 20, duration: 500, delay: 1200 }}">
    <Card class="h-full shadow-lg border-l-4 border-purple-500 flex flex-col w-full max-w-none">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <TruckSolid class="w-5 h-5 text-purple-500 mr-2" />
            최근 출고
          </h3>
        </div>
        <Button href="/outbound/history" color="purple" size="xs">
          전체
        </Button>
      </div>
      
      <div class="space-y-2 flex-1 overflow-y-auto">
        {#each recentOutbound as item, i}
          <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg" 
               in:fly="{{ x: -20, duration: 300, delay: 1300 + i * 100 }}">
            <div class="flex items-center justify-between mb-1">
              <p class="font-medium text-gray-900 dark:text-white text-sm">{item.item}</p>
              <Badge color="purple" class="text-xs font-bold">
                -{item.quantity}
              </Badge>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-300">{item.customer}</p>
            <p class="text-xs text-gray-500 flex items-center mt-1">
              <ClockSolid class="w-3 h-3 mr-1" />
              {item.date}
            </p>
          </div>
        {/each}
      </div>
    </Card>
  </div>
</div>
</div>
</div>
