<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button, Badge, Alert, Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell } from 'flowbite-svelte';
  import { HomeSolid, UserSolid, CheckCircleSolid, CloseCircleSolid, RefreshOutline } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // 권한 체크
  let currentUser = null;
  let hasAdminAccess = false;

  // 사용자 데이터
  let pendingUsers = [];
  let allUsers = [];
  let loading = false;
  let errorMessage = '';

  // 권한 체크 함수
  function checkAdminAccess() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      goto('/login');
      return false;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      goto('/login');
      return false;
    }

    currentUser = JSON.parse(userStr);
    hasAdminAccess = currentUser.role === 'admin';

    if (!hasAdminAccess) {
      goto('/');
      return false;
    }

    return true;
  }

  // 승인 대기 사용자 목록 조회
  async function loadPendingUsers() {
    loading = true;
    errorMessage = '';

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        pendingUsers = await response.json();
      } else {
        errorMessage = '승인 대기 사용자 목록을 불러오는데 실패했습니다.';
      }
    } catch (error) {
      console.error('Error loading pending users:', error);
      errorMessage = '승인 대기 사용자 목록을 불러오는데 실패했습니다.';
    } finally {
      loading = false;
    }
  }

  // 전체 사용자 목록 조회
  async function loadAllUsers() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        allUsers = await response.json();
      }
    } catch (error) {
      console.error('Error loading all users:', error);
    }
  }

  // 사용자 승인
  async function approveUser(userId) {
    if (!confirm('이 사용자를 승인하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/approve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          status: 'active',
          approvedBy: currentUser.id
        })
      });

      if (response.ok) {
        alert('사용자가 승인되었습니다.');
        await loadPendingUsers();
        await loadAllUsers();
      } else {
        const result = await response.json();
        alert(result.message || '사용자 승인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('사용자 승인에 실패했습니다.');
    }
  }

  // 사용자 거부
  async function rejectUser(userId) {
    if (!confirm('이 사용자를 거부하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/approve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          status: 'rejected',
          approvedBy: currentUser.id
        })
      });

      if (response.ok) {
        alert('사용자가 거부되었습니다.');
        await loadPendingUsers();
        await loadAllUsers();
      } else {
        const result = await response.json();
        alert(result.message || '사용자 거부에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('사용자 거부에 실패했습니다.');
    }
  }

  // 새로고침
  async function handleRefresh() {
    await loadPendingUsers();
    await loadAllUsers();
  }

  // 역할 표시 포맷
  function getRoleBadge(role) {
    if (role === 'admin') {
      return { color: 'red', text: '관리자' };
    } else {
      return { color: 'blue', text: '사용자' };
    }
  }

  // 상태 표시 포맷
  function getStatusBadge(status) {
    if (status === 'active') {
      return { color: 'green', text: '활성' };
    } else if (status === 'pending') {
      return { color: 'yellow', text: '대기' };
    } else {
      return { color: 'red', text: '거부' };
    }
  }

  onMount(async () => {
    if (!checkAdminAccess()) return;
    await loadPendingUsers();
    await loadAllUsers();
  });
</script>

<svelte:head>
  <title>회원승인 - 재고관리시스템</title>
</svelte:head>

{#if !hasAdminAccess}
  <div class="flex items-center justify-center h-64">
    <Alert color="red">
      <span class="font-medium">접근 권한이 없습니다.</span> 관리자만 이 페이지에 접근할 수 있습니다.
    </Alert>
  </div>
{:else}
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
        <BreadcrumbItem class="whitespace-nowrap">
          <div class="flex items-center">
            <UserSolid class="w-4 h-4 mr-2 flex-shrink-0" />
            회원승인
          </div>
        </BreadcrumbItem>
      </Breadcrumb>
    </div>

    {#if errorMessage}
      <Alert color="red" class="mb-4">
        {errorMessage}
      </Alert>
    {/if}

    <!-- 승인 대기 사용자 -->
    <Card padding="none" class="p-3 mb-4 w-full max-w-full overflow-hidden flex-shrink-0">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          승인 대기 사용자 ({pendingUsers.length})
        </h2>
        <Button color="blue" size="sm" on:click={handleRefresh} disabled={loading}>
          <RefreshOutline class="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      {#if loading}
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <p class="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      {:else if pendingUsers.length === 0}
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          승인 대기 중인 사용자가 없습니다.
        </div>
      {:else}
        <div class="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell>사용자명</TableHeadCell>
              <TableHeadCell>이름</TableHeadCell>
              <TableHeadCell>이메일</TableHeadCell>
              <TableHeadCell>역할</TableHeadCell>
              <TableHeadCell>가입일</TableHeadCell>
              <TableHeadCell>작업</TableHeadCell>
            </TableHead>
            <TableBody>
              {#each pendingUsers as user (user.id)}
                <TableBodyRow>
                  <TableBodyCell>{user.username}</TableBodyCell>
                  <TableBodyCell>{user.name}</TableBodyCell>
                  <TableBodyCell>{user.email || '-'}</TableBodyCell>
                  <TableBodyCell>
                    <Badge color={getRoleBadge(user.role).color}>{getRoleBadge(user.role).text}</Badge>
                  </TableBodyCell>
                  <TableBodyCell>{new Date(user.createdAt).toLocaleDateString()}</TableBodyCell>
                  <TableBodyCell>
                    <div class="flex gap-2">
                      <Button color="green" size="xs" on:click={() => approveUser(user.id)}>
                        <CheckCircleSolid class="w-4 h-4 mr-1" />
                        승인
                      </Button>
                      <Button color="red" size="xs" on:click={() => rejectUser(user.id)}>
                        <CloseCircleSolid class="w-4 h-4 mr-1" />
                        거부
                      </Button>
                    </div>
                  </TableBodyCell>
                </TableBodyRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}
    </Card>

    <!-- 전체 사용자 목록 -->
    <Card padding="none" class="p-3 w-full max-w-full overflow-hidden flex-1 flex flex-col">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        전체 사용자 ({allUsers.length})
      </h2>

      {#if allUsers.length === 0}
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          등록된 사용자가 없습니다.
        </div>
      {:else}
        <div class="overflow-x-auto flex-1">
          <Table>
            <TableHead>
              <TableHeadCell>사용자명</TableHeadCell>
              <TableHeadCell>이름</TableHeadCell>
              <TableHeadCell>이메일</TableHeadCell>
              <TableHeadCell>역할</TableHeadCell>
              <TableHeadCell>상태</TableHeadCell>
              <TableHeadCell>가입일</TableHeadCell>
              <TableHeadCell>승인일</TableHeadCell>
            </TableHead>
            <TableBody>
              {#each allUsers as user (user.id)}
                <TableBodyRow>
                  <TableBodyCell>{user.username}</TableBodyCell>
                  <TableBodyCell>{user.name}</TableBodyCell>
                  <TableBodyCell>{user.email || '-'}</TableBodyCell>
                  <TableBodyCell>
                    <Badge color={getRoleBadge(user.role).color}>{getRoleBadge(user.role).text}</Badge>
                  </TableBodyCell>
                  <TableBodyCell>
                    <Badge color={getStatusBadge(user.status).color}>{getStatusBadge(user.status).text}</Badge>
                  </TableBodyCell>
                  <TableBodyCell>{new Date(user.createdAt).toLocaleDateString()}</TableBodyCell>
                  <TableBodyCell>{user.approvedAt ? new Date(user.approvedAt).toLocaleDateString() : '-'}</TableBodyCell>
                </TableBodyRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}
    </Card>
  </div>
{/if}
