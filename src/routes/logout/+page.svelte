<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    // 로컬 스토리지에서 사용자 정보 제거
    localStorage.removeItem('user');
    
    // 로그인 페이지로 리다이렉트
    goto('/login');
  });
</script>

<!-- 로그아웃 처리 중 표시 -->
<div class="min-h-screen bg-gray-900 flex items-center justify-center">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
    <p class="text-gray-400">로그아웃 중...</p>
  </div>
</div>