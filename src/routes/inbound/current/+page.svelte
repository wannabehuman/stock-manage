<script>
  import { Card, Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
  import { HomeSolid, MailBoxSolid, SearchSolid } from 'flowbite-svelte-icons';
  import { fly } from 'svelte/transition';
</script>

<svelte:head>
  <title>현재고조회 - 재고관리시스템</title>
</svelte:head>

<!-- Breadcrumb -->
<div class="mb-6" in:fly="{{ y: -20, duration: 300 }}">
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
        <SearchSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        현재고조회
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- 현재고조회 컨텐츠 -->
<div in:fly="{{ y: 20, duration: 500 }}">
  <Card class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">현재고조회</h1>
    <p class="text-gray-600 dark:text-gray-400">현재 재고 현황을 조회하는 페이지입니다.</p>
  </Card>
</div>