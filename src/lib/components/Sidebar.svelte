<script>
  import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper, Avatar, Badge, DarkMode } from 'flowbite-svelte';
  import { ChartPieSolid, GridSolid, MailBoxSolid, UserSolid, UsersGroupSolid, ArrowRightToBracketOutline, CogSolid, BellSolid, ChevronDownOutline, ChevronRightOutline, DatabaseSolid, SearchSolid, ClipboardListSolid } from 'flowbite-svelte-icons';
  import { page } from '$app/stores';
  import { slide } from 'svelte/transition';
  
  export let isOpen = true;
  
  // 사용자 정보
  let user = {
    name: "김관리자",
    role: "재고 관리자",
    avatar: "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
  };

  // 실제 로그인된 사용자 정보 가져오기
  function getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const currentUser = JSON.parse(userStr);
        const roleMap = {
          'admin': '관리자',
          'manager': '매니저',
          'user': '일반사용자'
        };

        // localStorage에서 아바타 가져오기
        const savedAvatar = localStorage.getItem('userAvatar');

        user = {
          name: currentUser.username,
          role: roleMap[currentUser.role] || currentUser.role,
          avatar: savedAvatar || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
        };
      }
    }
  }

  // 컴포넌트 마운트 시 사용자 정보 로드
  import { onMount } from 'svelte';
  onMount(() => {
    getCurrentUser();

    // storage 이벤트 리스너 (다른 탭에서 변경 시)
    window.addEventListener('storage', getCurrentUser);

    // 같은 페이지 내에서 변경 감지를 위한 커스텀 이벤트
    window.addEventListener('avatarUpdated', getCurrentUser);

    return () => {
      window.removeEventListener('storage', getCurrentUser);
      window.removeEventListener('avatarUpdated', getCurrentUser);
    };
  });
  
  // 알림 개수
  let notifications = 3;
  let lowStockItems = 8;
  
  // 서브메뉴 토글 상태
  let expandedMenus = {
    master: false,
    inbound: false,
    outbound: false,
    users: false
  };
  
  function toggleMenu(menu) {
    const isCurrentlyOpen = expandedMenus[menu];

    // 모든 메뉴 닫기
    expandedMenus = {
      master: false,
      inbound: false,
      outbound: false,
      users: false
    };

    // 클릭한 메뉴가 닫혀있었다면 열기
    if (!isCurrentlyOpen) {
      expandedMenus[menu] = true;
    }
  }
  
  // 현재 페이지에 따라 메뉴 자동 확장
  $: {
    // 모든 메뉴 닫기
    expandedMenus = {
      master: false,
      inbound: false,
      outbound: false,
      users: false
    };

    // 현재 페이지에 해당하는 메뉴만 열기
    if ($page.url.pathname.startsWith('/master')) {
      expandedMenus.master = true;
    } else if ($page.url.pathname.startsWith('/inbound')) {
      expandedMenus.inbound = true;
    } else if ($page.url.pathname.startsWith('/outbound')) {
      expandedMenus.outbound = true;
    } else if ($page.url.pathname.startsWith('/users')) {
      expandedMenus.users = true;
    }
  }
</script>

<Sidebar class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform {isOpen ? 'translate-x-0' : '-translate-x-full'} bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700">
  <SidebarWrapper class="px-3 py-4">
    <!-- 사용자 프로필 섹션 -->
    <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" transition:slide>
      <div class="flex items-center space-x-3">
        <a href="/users/account" class="cursor-pointer">
          <Avatar src={user.avatar} size="md" class="ring-2 ring-blue-500 hover:ring-blue-600 transition-all" />
        </a>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {user.name}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.role}
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <DarkMode size="sm" />
          <div class="relative">
            <BellSolid class="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-pointer" />
            {#if notifications > 0}
              <Badge color="red" class="absolute -top-2 -right-2 w-5 h-5 text-xs">
                {notifications}
              </Badge>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- 메인 메뉴 -->
    <SidebarGroup>
      <h3 class="mb-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">메인 메뉴</h3>
      
      <!-- 대시보드 -->
      <SidebarItem label="대시보드" href="/" class="mb-1 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 {$page.url.pathname === '/' ? 'bg-blue-100 dark:bg-gray-700 border-r-4 border-blue-500' : ''}">
        <svelte:fragment slot="icon">
          <ChartPieSolid class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </svelte:fragment>
      </SidebarItem>
      
      <!-- 기준정보관리 -->
      <div class="mb-1">
        <button 
          on:click={() => toggleMenu('master')}
          class="w-full flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-yellow-50 dark:hover:bg-gray-700 dark:text-white group text-left {$page.url.pathname.startsWith('/master') ? 'bg-yellow-100 dark:bg-gray-700 border-r-4 border-yellow-500' : ''}"
        >
          <DatabaseSolid class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <span class="ml-3 flex-1 whitespace-nowrap">기준정보관리</span>
          {#if expandedMenus.master}
            <ChevronDownOutline class="w-4 h-4 text-gray-500" />
          {:else}
            <ChevronRightOutline class="w-4 h-4 text-gray-500" />
          {/if}
        </button>
        {#if expandedMenus.master}
          <div transition:slide class="ml-6 mt-1 space-y-1">
            <SidebarItem label="품목관리" href="/master/items" class="text-sm hover:bg-yellow-25 dark:hover:bg-gray-600 rounded-lg {$page.url.pathname === '/master/items' ? 'bg-yellow-50 dark:bg-gray-600' : ''}">
              <svelte:fragment slot="icon">
                <GridSolid class="w-4 h-4 text-yellow-500" />
              </svelte:fragment>
            </SidebarItem>
            <SidebarItem label="기초코드관리" href="/master/codes" class="text-sm hover:bg-yellow-25 dark:hover:bg-gray-600 rounded-lg {$page.url.pathname === '/master/codes' ? 'bg-yellow-50 dark:bg-gray-600' : ''}">
              <svelte:fragment slot="icon">
                <CogSolid class="w-4 h-4 text-yellow-500" />
              </svelte:fragment>
            </SidebarItem>
          </div>
        {/if}
      </div>
      
      <!-- 입고관리 -->
      <div class="mb-1">
        <button 
          on:click={() => toggleMenu('inbound')}
          class="w-full flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-green-50 dark:hover:bg-gray-700 dark:text-white group text-left {$page.url.pathname.startsWith('/inbound') ? 'bg-green-100 dark:bg-gray-700 border-r-4 border-green-500' : ''}"
        >
          <MailBoxSolid class="w-5 h-5 text-green-600 dark:text-green-400" />
          <span class="ml-3 flex-1 whitespace-nowrap">입고관리</span>
          {#if expandedMenus.inbound}
            <ChevronDownOutline class="w-4 h-4 text-gray-500" />
          {:else}
            <ChevronRightOutline class="w-4 h-4 text-gray-500" />
          {/if}
        </button>
        {#if expandedMenus.inbound}
          <div transition:slide class="ml-6 mt-1 space-y-1">
            <SidebarItem label="입고등록" href="/inbound/register" class="text-sm hover:bg-green-25 dark:hover:bg-gray-600 rounded-lg {$page.url.pathname === '/inbound/register' ? 'bg-green-50 dark:bg-gray-600' : ''}">
              <svelte:fragment slot="icon">
                <GridSolid class="w-4 h-4 text-green-500" />
              </svelte:fragment>
            </SidebarItem>
            <SidebarItem label="현재고조회" href="/inbound/current" class="text-sm hover:bg-green-25 dark:hover:bg-gray-600 rounded-lg {$page.url.pathname === '/inbound/current' ? 'bg-green-50 dark:bg-gray-600' : ''}">
              <svelte:fragment slot="icon">
                <SearchSolid class="w-4 h-4 text-green-500" />
              </svelte:fragment>
            </SidebarItem>
            <SidebarItem label="입고이력조회" href="/inbound/history" class="text-sm hover:bg-green-25 dark:hover:bg-gray-600 rounded-lg {$page.url.pathname === '/inbound/history' ? 'bg-green-50 dark:bg-gray-600' : ''}">
              <svelte:fragment slot="icon">
                <ClipboardListSolid class="w-4 h-4 text-green-500" />
              </svelte:fragment>
            </SidebarItem>
          </div>
        {/if}
      </div>
     <!-- 출고관리 -->
     <div class="mb-1">
      <button 
        on:click={() => toggleMenu('outbound')}
        class="w-full flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-red-50 dark:hover:bg-gray-700 dark:text-white group text-left {$page.url.pathname.startsWith('/outbound') ? 'bg-red-100 dark:bg-gray-700 border-r-4 border-red-500' : ''}"
      >
        <MailBoxSolid class="w-5 h-5 text-red-600 dark:text-red-400" />
        <span class="ml-3 flex-1 whitespace-nowrap">출고관리</span>
        {#if expandedMenus.outbound}
          <ChevronDownOutline class="w-4 h-4 text-gray-500" />
        {:else}
          <ChevronRightOutline class="w-4 h-4 text-gray-500" />
        {/if}
      </button>
      {#if expandedMenus.outbound}
        <div transition:slide class="ml-6 mt-1 space-y-1">
          <SidebarItem label="출고등록" href="/outbound/register" class="text-sm hover:bg-red-25 dark:hover:bg-gray-600 rounded-lg {$page.url.pathname === '/outbound/register' ? 'bg-red-50 dark:bg-gray-600' : ''}">
            <svelte:fragment slot="icon">
              <MailBoxSolid class="w-4 h-4 text-red-500" />
            </svelte:fragment>
          </SidebarItem>
          <SidebarItem label="출고이력조회" href="/outbound/history" class="text-sm hover:bg-red-25 dark:hover:bg-gray-600 rounded-lg {$page.url.pathname === '/outbound/history' ? 'bg-red-50 dark:bg-gray-600' : ''}">
            <svelte:fragment slot="icon">
              <ClipboardListSolid class="w-4 h-4 text-red-500" />
            </svelte:fragment>
          </SidebarItem>
        </div>
      {/if}
    </div>
    <!-- 사용자관리 -->
    <div class="mb-1">
      <button 
        on:click={() => toggleMenu('users')}
        class="w-full flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-red-50 dark:hover:bg-gray-700 dark:text-white group text-left {$page.url.pathname.startsWith('/users') ? 'bg-purple-100 dark:bg-gray-700 border-r-4 border-purple-500' : ''}"
      >
        <CogSolid class="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <span class="ml-3 flex-1 whitespace-nowrap">사용자관리</span>
        {#if expandedMenus.users}
          <ChevronDownOutline class="w-4 h-4 text-gray-500" />
        {:else}
          <ChevronRightOutline class="w-4 h-4 text-gray-500" />
        {/if}
      </button>
      {#if expandedMenus.users}
        <div transition:slide class="ml-6 mt-1 space-y-1">
          <SidebarItem label="계정관리" href="/users/account" class="text-sm hover:bg-purple-25 dark:hover:bg-gray-600 rounded-lg {$page.url.pathname === '/users/account' ? 'bg-purple-50 dark:bg-gray-600' : ''}">
            <svelte:fragment slot="icon">
              <UserSolid class="w-4 h-4 text-purple-500" />
            </svelte:fragment>
          </SidebarItem>
          <SidebarItem label="회원관리" href="/users/management" class="text-sm hover:bg-purple-25 dark:hover:bg-gray-600 rounded-lg {$page.url.pathname === '/users/management' ? 'bg-purple-50 dark:bg-gray-600' : ''}">
            <svelte:fragment slot="icon">
              <UsersGroupSolid class="w-4 h-4 text-purple-500" />
            </svelte:fragment>
          </SidebarItem>
          <SidebarItem label="알림톡" href="/users/notification" class="text-sm hover:bg-purple-25 dark:hover:bg-gray-600 rounded-lg {$page.url.pathname === '/users/notification' ? 'bg-purple-50 dark:bg-gray-600' : ''}">
            <svelte:fragment slot="icon">
              <ClipboardListSolid class="w-4 h-4 text-purple-500" />
            </svelte:fragment>
          </SidebarItem>
        </div>
      {/if}
    </div>
      <!-- 계정관리 -->
      <!-- <SidebarItem label="계정관리" href="/users" class="mb-1 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 {$page.url.pathname.startsWith('/users') ? 'bg-purple-100 dark:bg-gray-700 border-r-4 border-purple-500' : ''}">
        <svelte:fragment slot="icon">
          <UserSolid class="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </svelte:fragment>
      </SidebarItem> -->
      
      <!-- 모달 예시 -->
      <SidebarItem label="모달 예시" href="/modal-examples" class="mb-1 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 {$page.url.pathname.startsWith('/modal-examples') ? 'bg-indigo-100 dark:bg-gray-700 border-r-4 border-indigo-500' : ''}">
        <svelte:fragment slot="icon">
          <CogSolid class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </svelte:fragment>
      </SidebarItem>
    </SidebarGroup>

    <!-- 하단 고정 메뉴 -->
    <div class="absolute bottom-4 left-3 right-3">
      <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
        <SidebarItem label="로그아웃" href="/logout" class="hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 text-red-600 dark:text-red-400">
          <svelte:fragment slot="icon">
            <ArrowRightToBracketOutline class="w-5 h-5 text-red-600 dark:text-red-400" />
          </svelte:fragment>
        </SidebarItem>
      </div>
      
      <!-- 빠른 통계 카드 -->
      <div class="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">오늘의 요약</h4>
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-gray-600 dark:text-gray-300">신규 입고</span>
            <span class="font-semibold text-green-600">+15</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-600 dark:text-gray-300">출고 완료</span>
            <span class="font-semibold text-blue-600">8</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-600 dark:text-gray-300">재고 부족</span>
            <span class="font-semibold text-red-600">{lowStockItems}</span>
          </div>
        </div>
      </div>
    </div>
  </SidebarWrapper>
</Sidebar>