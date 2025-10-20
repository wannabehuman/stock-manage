<script>
  import '../app.css';
  import { page } from '$app/stores';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { beforeNavigate } from '$app/navigation';

  let sidebarOpen = true;
  let isAuthenticated = false;
  let currentUser = null;
  let isInitialized = false;

  // 로그인이 필요 없는 페이지들
  const publicRoutes = ['/login', '/logout'];

  function checkAuthentication() {
    if (typeof window === 'undefined') return false;

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        currentUser = JSON.parse(userStr);
        isAuthenticated = true;
        return true;
      } catch (e) {
        localStorage.removeItem('user');
        isAuthenticated = false;
        return false;
      }
    } else {
      currentUser = null;
      isAuthenticated = false;
      return false;
    }
  }

  // 네비게이션 전에 인증 체크
  beforeNavigate(({ to, cancel }) => {
    if (!isInitialized || !to) return;

    const isPublic = publicRoutes.includes(to.url.pathname);
    const authenticated = checkAuthentication();

    // 비공개 페이지인데 인증되지 않은 경우
    if (!isPublic && !authenticated) {
      cancel();
      goto('/login');
    }
    // 로그인 페이지인데 이미 인증된 경우
    else if (to.url.pathname === '/login' && authenticated) {
      cancel();
      goto('/');
    }
  });

  onMount(() => {
    const authenticated = checkAuthentication();
    const currentPath = $page.url.pathname;
    const isPublic = publicRoutes.includes(currentPath);

    // 인증이 필요한 페이지인데 인증되지 않은 경우
    if (!isPublic && !authenticated) {
      goto('/login').then(() => {
        isInitialized = true;
      });
    }
    // 로그인 페이지인데 이미 인증된 경우
    else if (currentPath === '/login' && authenticated) {
      goto('/').then(() => {
        isInitialized = true;
      });
    }
    // 그 외의 경우 (공개 페이지이거나, 인증된 사용자가 비공개 페이지 접근)
    else {
      isInitialized = true;
    }
  });
</script>

{#if !isInitialized}
  <!-- 초기화 중 로딩 화면 -->
  <div class="antialiased bg-gray-900 min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-pulse">
        <span class="text-2xl text-white font-bold">📦</span>
      </div>
      <p class="text-gray-400">로딩 중...</p>
    </div>
  </div>
{:else if publicRoutes.includes($page.url.pathname)}
  <!-- 로그인/로그아웃 페이지는 사이드바 없이 전체 화면 -->
  <div class="antialiased bg-gray-50 dark:bg-gray-900">
    <slot />
  </div>
{:else}
  <!-- 일반 페이지는 사이드바와 함께 -->
  <div class="antialiased bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <Sidebar bind:isOpen={sidebarOpen} />

    <!-- Main content -->
    <main class="p-4 h-screen transition-all duration-300 {sidebarOpen ? 'ml-64' : 'ml-16'}">
      <slot />
    </main>
  </div>
{/if}