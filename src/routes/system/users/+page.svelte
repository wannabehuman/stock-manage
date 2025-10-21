<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button, Modal, Label, Input, Select, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Badge } from 'flowbite-svelte';
  import { HomeSolid, CogSolid, UsersSolid, PlusOutline, EditOutline, TrashBinOutline, LockOpenOutline } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';

  let users = [];
  let filteredUsers = [];
  let showModal = false;
  let showResetPasswordModal = false;
  let isEditMode = false;

  // 검색 필터
  let searchUsername = '';
  let searchName = '';
  let searchStatus = '';

  // 모달 폼 데이터
  let formData = {
    id: '',
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active'
  };

  // 비밀번호 초기화
  let resetPasswordUserId = '';
  let resetPasswordUsername = '';
  let newPassword = '';

  onMount(() => {
    loadUsers();
  });

  async function loadUsers() {
    try {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');

      console.log('Access Token:', token ? 'exists' : 'missing');

      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('Current user:', user);
        console.log('User role:', user.role);
        console.log('User status:', user.status);
      }

      if (!token) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }

        if (response.status === 403) {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            alert(`관리자 권한이 필요합니다.\n현재 사용자: ${user.username}\n현재 권한: ${user.role}\n현재 상태: ${user.status}`);
          } else {
            alert('관리자 권한이 필요합니다.');
          }
          return;
        }

        let errorMessage = '사용자 목록 조회 실패';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          console.error('Error parsing response:', e);
        }
        throw new Error(errorMessage);
      }

      users = await response.json();
      console.log('Users loaded:', users.length);
      applyFilters();
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      alert(error.message || '사용자 목록을 불러오는데 실패했습니다.');
    }
  }

  function applyFilters() {
    filteredUsers = users.filter(user => {
      const matchUsername = !searchUsername || user.username.toLowerCase().includes(searchUsername.toLowerCase());
      const matchName = !searchName || user.name.toLowerCase().includes(searchName.toLowerCase());
      const matchStatus = !searchStatus || user.status === searchStatus;

      return matchUsername && matchName && matchStatus;
    });
  }

  function openAddModal() {
    isEditMode = false;
    formData = {
      id: '',
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active'
    };
    showModal = true;
  }

  function openEditModal(user) {
    isEditMode = true;
    formData = {
      id: user.id,
      username: user.username,
      password: '',
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    };
    showModal = true;
  }

  async function saveUser() {
    try {
      if (isEditMode) {
        // 수정
        const response = await fetch(`/api/users/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            status: formData.status
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || '사용자 수정 실패');
        }

        alert('사용자 정보가 수정되었습니다.');
      } else {
        // 추가 - 유효성 검사
        if (!formData.username || formData.username.length < 4) {
          alert('아이디는 4자 이상이어야 합니다.');
          return;
        }
        if (!formData.password || formData.password.length < 6) {
          alert('비밀번호는 6자 이상이어야 합니다.');
          return;
        }
        if (!formData.name || formData.name.length < 2) {
          alert('이름은 2자 이상이어야 합니다.');
          return;
        }

        // 회원가입 API 사용
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            name: formData.name,
            email: formData.email
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || '사용자 추가 실패');
        }

        // 회원가입 후 상태/권한 업데이트가 필요한 경우 (관리자가 직접 추가하는 경우)
        alert('사용자가 추가되었습니다. 필요시 승인 상태를 변경해주세요.');
      }

      showModal = false;
      loadUsers();
    } catch (error) {
      console.error('저장 실패:', error);
      alert(error.message || '저장에 실패했습니다.');
    }
  }

  async function deleteUser(userId, username) {
    if (!confirm(`정말로 "${username}" 사용자를 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '사용자 삭제 실패');
      }

      alert('사용자가 삭제되었습니다.');
      loadUsers();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert(error.message || '삭제에 실패했습니다.');
    }
  }

  function openResetPasswordModal(userId, username) {
    resetPasswordUserId = userId;
    resetPasswordUsername = username;
    newPassword = '';
    showResetPasswordModal = true;
  }

  async function resetPassword() {
    if (!newPassword || newPassword.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      const response = await fetch(`/api/users/${resetPasswordUserId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '비밀번호 초기화 실패');
      }

      const result = await response.json();
      alert(result.message || '비밀번호가 초기화되었습니다.');
      showResetPasswordModal = false;
    } catch (error) {
      console.error('비밀번호 초기화 실패:', error);
      alert(error.message || '비밀번호 초기화에 실패했습니다.');
    }
  }

  function getStatusBadge(status) {
    const statusMap = {
      'pending': { color: 'yellow', text: '승인대기' },
      'active': { color: 'green', text: '활성' },
      'rejected': { color: 'red', text: '승인거부' }
    };
    return statusMap[status] || { color: 'gray', text: status };
  }

  function getRoleBadge(role) {
    const roleMap = {
      'admin': { color: 'purple', text: '관리자' },
      'user': { color: 'blue', text: '일반사용자' }
    };
    return roleMap[role] || { color: 'gray', text: role };
  }
</script>

<svelte:head>
  <title>회원관리 - 재고관리시스템</title>
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
    <BreadcrumbItem href="/system" class="whitespace-nowrap">
      <div class="flex items-center">
        <CogSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        시스템관리
      </div>
    </BreadcrumbItem>
    <BreadcrumbItem class="whitespace-nowrap">
      <div class="flex items-center">
        <UsersSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        회원관리
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- 검색 필터 -->
<Card class="mb-4 flex-shrink-0">
  <h3 class="text-lg font-semibold mb-4">검색 조건</h3>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div>
      <Label for="search-username" class="mb-2">사용자ID</Label>
      <Input
        id="search-username"
        type="text"
        placeholder="사용자ID 입력"
        bind:value={searchUsername}
        on:input={applyFilters}
      />
    </div>
    <div>
      <Label for="search-name" class="mb-2">이름</Label>
      <Input
        id="search-name"
        type="text"
        placeholder="이름 입력"
        bind:value={searchName}
        on:input={applyFilters}
      />
    </div>
    <div>
      <Label for="search-status" class="mb-2">상태</Label>
      <Select
        id="search-status"
        bind:value={searchStatus}
        on:change={applyFilters}
      >
        <option value="">전체</option>
        <option value="pending">승인대기</option>
        <option value="active">활성</option>
        <option value="rejected">승인거부</option>
      </Select>
    </div>
    <div class="flex items-end">
      <Button color="blue" on:click={applyFilters}>검색</Button>
    </div>
  </div>
</Card>

<!-- 회원 목록 -->
<Card class="p-3 w-full max-w-full overflow-hidden flex-1 flex flex-col">
  <div class="flex justify-between items-center mb-4 flex-shrink-0">
    <h3 class="text-lg font-semibold">회원 목록 ({filteredUsers.length}명)</h3>
    <Button color="green" on:click={openAddModal}>
      <PlusOutline class="w-4 h-4 mr-2" />
      회원 추가
    </Button>
  </div>

  <div class="overflow-auto flex-1">
    <Table hoverable={true}>
      <TableHead>
        <TableHeadCell>사용자ID</TableHeadCell>
        <TableHeadCell>이름</TableHeadCell>
        <TableHeadCell>이메일</TableHeadCell>
        <TableHeadCell>전화번호</TableHeadCell>
        <TableHeadCell>권한</TableHeadCell>
        <TableHeadCell>상태</TableHeadCell>
        <TableHeadCell>가입일</TableHeadCell>
        <TableHeadCell>관리</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each filteredUsers as user}
          <TableBodyRow>
            <TableBodyCell>{user.username}</TableBodyCell>
            <TableBodyCell>{user.name}</TableBodyCell>
            <TableBodyCell>{user.email || '-'}</TableBodyCell>
            <TableBodyCell>{user.phone || '-'}</TableBodyCell>
            <TableBodyCell>
              <Badge color={getRoleBadge(user.role).color}>{getRoleBadge(user.role).text}</Badge>
            </TableBodyCell>
            <TableBodyCell>
              <Badge color={getStatusBadge(user.status).color}>{getStatusBadge(user.status).text}</Badge>
            </TableBodyCell>
            <TableBodyCell>{new Date(user.createdAt).toLocaleDateString('ko-KR')}</TableBodyCell>
            <TableBodyCell>
              <div class="flex gap-2">
                <Button size="xs" color="blue" on:click={() => openEditModal(user)}>
                  <EditOutline class="w-3 h-3" />
                </Button>
                <Button size="xs" color="yellow" on:click={() => openResetPasswordModal(user.id, user.username)}>
                  <LockOpenOutline class="w-3 h-3" />
                </Button>
                <Button size="xs" color="red" on:click={() => deleteUser(user.id, user.username)}>
                  <TrashBinOutline class="w-3 h-3" />
                </Button>
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>
</Card>
</div>

<!-- 회원 추가/수정 모달 -->
<Modal bind:open={showModal} size="md" autoclose={false}>
  <h3 class="text-xl font-semibold mb-4">
    {isEditMode ? '회원 정보 수정' : '회원 추가'}
  </h3>

  <div class="space-y-4">
    {#if !isEditMode}
      <div>
        <Label for="username" class="mb-2">사용자ID *</Label>
        <Input
          id="username"
          type="text"
          bind:value={formData.username}
          required
        />
      </div>
      <div>
        <Label for="password" class="mb-2">비밀번호 *</Label>
        <Input
          id="password"
          type="password"
          bind:value={formData.password}
          required
        />
      </div>
    {:else}
      <div>
        <Label class="mb-2">사용자ID</Label>
        <Input
          type="text"
          value={formData.username}
          disabled
        />
      </div>
    {/if}

    <div>
      <Label for="name" class="mb-2">이름 *</Label>
      <Input
        id="name"
        type="text"
        bind:value={formData.name}
        required
      />
    </div>

    <div>
      <Label for="email" class="mb-2">이메일</Label>
      <Input
        id="email"
        type="email"
        bind:value={formData.email}
      />
    </div>

    <div>
      <Label for="phone" class="mb-2">전화번호</Label>
      <Input
        id="phone"
        type="tel"
        bind:value={formData.phone}
      />
    </div>

    <div>
      <Label for="role" class="mb-2">권한 *</Label>
      <Select
        id="role"
        bind:value={formData.role}
        required
      >
        <option value="user">일반사용자</option>
        <option value="admin">관리자</option>
      </Select>
    </div>

    <div>
      <Label for="status" class="mb-2">상태 *</Label>
      <Select
        id="status"
        bind:value={formData.status}
        required
      >
        <option value="pending">승인대기</option>
        <option value="active">활성</option>
        <option value="rejected">승인거부</option>
      </Select>
    </div>
  </div>

  <svelte:fragment slot="footer">
    <Button color="blue" on:click={saveUser}>저장</Button>
    <Button color="alternative" on:click={() => showModal = false}>취소</Button>
  </svelte:fragment>
</Modal>

<!-- 비밀번호 초기화 모달 -->
<Modal bind:open={showResetPasswordModal} size="sm" autoclose={false}>
  <h3 class="text-xl font-semibold mb-4">비밀번호 초기화</h3>

  <p class="mb-4 text-gray-600">
    <strong>{resetPasswordUsername}</strong> 사용자의 비밀번호를 초기화합니다.
  </p>

  <div>
    <Label for="new-password" class="mb-2">새 비밀번호 (최소 6자)</Label>
    <Input
      id="new-password"
      type="password"
      bind:value={newPassword}
      placeholder="새 비밀번호 입력"
      required
    />
  </div>

  <svelte:fragment slot="footer">
    <Button color="blue" on:click={resetPassword}>초기화</Button>
    <Button color="alternative" on:click={() => showResetPasswordModal = false}>취소</Button>
  </svelte:fragment>
</Modal>
