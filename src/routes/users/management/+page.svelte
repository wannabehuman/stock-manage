<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button, Badge, Alert, Input } from 'flowbite-svelte';
  import { HomeSolid, UserSolid, UsersGroupSolid, PenSolid, TrashBinSolid, SearchSolid } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import FormModal from '$lib/components/modals/FormModal.svelte';
  import { CommonTable } from '$lib/components/commonTabulator/commonTable.js';

  // 권한 체크
  let currentUser = null;
  let hasAdminAccess = false;

  // 사용자 데이터
  let users = [];
  let filteredUsers = [];
  let searchTerm = '';

  // 모달 상태
  let showUserModal = false;
  let modalMode = 'add'; // 'add' | 'edit'
  let editingUser = null;
  let modalLoading = false;
  let validationErrors = {};

  // 사용자 폼 데이터
  let userFormData = {
    username: '',
    email: '',
    name: '',
    role: 'user',
    department: '',
    isActive: true,
    password: '',
    confirmPassword: ''
  };

  // 폼 필드 정의
  const userFormFields = [
    {
      name: 'username',
      type: 'input',
      label: '사용자명',
      placeholder: '사용자명을 입력하세요',
      required: true
    },
    {
      name: 'email',
      type: 'email',
      label: '이메일',
      placeholder: '이메일을 입력하세요',
      required: true
    },
    {
      name: 'name',
      type: 'input',
      label: '이름',
      placeholder: '이름을 입력하세요',
      required: true
    },
    {
      name: 'role',
      type: 'select',
      label: '권한',
      placeholder: '권한을 선택하세요',
      required: true,
      options: [
        { value: 'admin', name: '관리자' },
        { value: 'manager', name: '매니저' },
        { value: 'user', name: '일반사용자' }
      ]
    },
    {
      name: 'department',
      type: 'select',
      label: '부서',
      placeholder: '부서를 선택하세요',
      required: false,
      options: [
        { value: 'it', name: 'IT팀' },
        { value: 'sales', name: '영업팀' },
        { value: 'logistics', name: '물류팀' },
        { value: 'accounting', name: '회계팀' }
      ]
    },
    {
      name: 'password',
      type: 'input',
      inputType: 'password',
      label: '비밀번호',
      placeholder: '비밀번호를 입력하세요',
      required: true
    },
    {
      name: 'confirmPassword',
      type: 'input',
      inputType: 'password',
      label: '비밀번호 확인',
      placeholder: '비밀번호를 다시 입력하세요',
      required: true
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: '활성 상태',
      defaultValue: true
    }
  ];

  // 테이블 클래스
  class UserTable extends CommonTable {
    constructor() {
      super();
      
      const fields = [
        { field: "id", title: "ID", width: 80, headerFilter: false },
        { field: "username", title: "사용자명", width: 120, headerFilter: true },
        { field: "name", title: "이름", width: 100, headerFilter: true },
        { field: "email", title: "이메일", width: 200, headerFilter: true },
        { 
          field: "role", 
          title: "권한", 
          width: 100,
          formatter: (cell) => {
            const value = cell.getValue();
            const roleMap = {
              'admin': '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">관리자</span>',
              'manager': '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">매니저</span>',
              'user': '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">일반사용자</span>'
            };
            return roleMap[value] || value;
          }
        },
        { field: "department", title: "부서", width: 100 },
        { 
          field: "isActive", 
          title: "상태", 
          width: 80,
          formatter: (cell) => {
            const value = cell.getValue();
            return value 
              ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">활성</span>'
              : '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">비활성</span>';
          }
        },
        { field: "lastLogin", title: "최근 로그인", width: 140 },
        {
          field: "actions",
          title: "작업",
          width: 120,
          headerFilter: false,
          formatter: (cell) => {
            const rowData = cell.getRow().getData();
            return `
              <div class="flex gap-1">
                <button class="edit-btn px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600" data-id="${rowData.id}">
                  수정
                </button>
                <button class="delete-btn px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600" data-id="${rowData.id}">
                  삭제
                </button>
              </div>
            `;
          }
        }
      ];
      
      this.setFields(fields);
      this.setTableName('사용자 관리');
    }

    async init() {
      const settings = {
        height: "500px",
        layout: "fitColumns",
        pagination: true,
        paginationSize: 15,
        responsiveLayout: "hide",
        placeholder: "사용자 데이터가 없습니다.",
        headerFilterPlaceholder: "검색...",
      };

      this.setCtbSetting(settings);
      await super.init();

      // 버튼 이벤트 설정
      if (this._tabulator) {
        this._tabulator.on("cellClick", (e, cell) => {
          const target = e.target;
          if (target.classList.contains('edit-btn')) {
            const userId = parseInt(target.dataset.id);
            editUser(userId);
          } else if (target.classList.contains('delete-btn')) {
            const userId = parseInt(target.dataset.id);
            deleteUser(userId);
          }
        });
      }
    }
  }

  let userTable = null;

  // 권한 체크 함수
  function checkAdminAccess() {
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

  // 샘플 사용자 데이터 생성
  function generateSampleUsers() {
    return [
      {
        id: 1,
        username: 'admin',
        name: '관리자',
        email: 'admin@company.com',
        role: 'admin',
        department: 'it',
        isActive: true,
        lastLogin: '2024-10-03 09:15:32',
        createdAt: '2024-01-01'
      },
      {
        id: 2,
        username: 'kim.manager',
        name: '김매니저',
        email: 'kim.manager@company.com',
        role: 'manager',
        department: 'logistics',
        isActive: true,
        lastLogin: '2024-10-02 16:42:15',
        createdAt: '2024-02-15'
      },
      {
        id: 3,
        username: 'lee.user',
        name: '이사용자',
        email: 'lee.user@company.com',
        role: 'user',
        department: 'sales',
        isActive: true,
        lastLogin: '2024-10-01 14:20:08',
        createdAt: '2024-03-10'
      },
      {
        id: 4,
        username: 'park.user',
        name: '박사용자',
        email: 'park.user@company.com',
        role: 'user',
        department: 'accounting',
        isActive: false,
        lastLogin: '2024-09-28 11:35:42',
        createdAt: '2024-04-20'
      },
      {
        id: 5,
        username: 'choi.manager',
        name: '최매니저',
        email: 'choi.manager@company.com',
        role: 'manager',
        department: 'sales',
        isActive: true,
        lastLogin: '2024-10-03 08:45:21',
        createdAt: '2024-05-05'
      }
    ];
  }

  // 사용자 추가 모달 열기
  function openAddUserModal() {
    modalMode = 'add';
    editingUser = null;
    userFormData = {
      username: '',
      email: '',
      name: '',
      role: 'user',
      department: '',
      isActive: true,
      password: '',
      confirmPassword: ''
    };
    validationErrors = {};
    showUserModal = true;
  }

  // 사용자 수정 모달 열기
  function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    modalMode = 'edit';
    editingUser = user;
    userFormData = {
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      password: '',
      confirmPassword: ''
    };
    validationErrors = {};
    showUserModal = true;
  }

  // 사용자 삭제
  function deleteUser(userId) {
    if (userId === 1) {
      alert('기본 관리자 계정은 삭제할 수 없습니다.');
      return;
    }

    if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      users = users.filter(user => user.id !== userId);
      updateTable();
    }
  }

  // 폼 제출 처리
  function handleUserSubmit(event) {
    const data = event.detail;
    validationErrors = {};

    // 유효성 검사
    if (!data.username) validationErrors.username = '사용자명을 입력하세요.';
    if (!data.email) validationErrors.email = '이메일을 입력하세요.';
    if (!data.name) validationErrors.name = '이름을 입력하세요.';
    if (!data.role) validationErrors.role = '권한을 선택하세요.';
    
    if (modalMode === 'add' || data.password) {
      if (!data.password) validationErrors.password = '비밀번호를 입력하세요.';
      if (data.password !== data.confirmPassword) {
        validationErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }
    }

    // 사용자명 중복 체크 (추가 모드이거나 기존과 다른 사용자명인 경우)
    if (modalMode === 'add' || (editingUser && editingUser.username !== data.username)) {
      if (users.some(user => user.username === data.username)) {
        validationErrors.username = '이미 존재하는 사용자명입니다.';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    modalLoading = true;

    // API 호출 시뮬레이션
    setTimeout(() => {
      if (modalMode === 'add') {
        // 새 사용자 추가
        const newUser = {
          id: Math.max(...users.map(u => u.id)) + 1,
          username: data.username,
          name: data.name,
          email: data.email,
          role: data.role,
          department: data.department,
          isActive: data.isActive,
          lastLogin: '-',
          createdAt: new Date().toISOString().split('T')[0]
        };
        users = [...users, newUser];
      } else {
        // 기존 사용자 수정
        users = users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...data, password: undefined, confirmPassword: undefined }
            : user
        );
      }

      updateTable();
      modalLoading = false;
      showUserModal = false;
      
    }, 1000);
  }

  // 모달 취소
  function handleUserCancel() {
    showUserModal = false;
    validationErrors = {};
  }

  // 테이블 업데이트
  function updateTable() {
    if (userTable && userTable._tabulator) {
      userTable.setData(users);
    }
  }

  // 검색 처리
  function handleSearch() {
    if (userTable && userTable._tabulator) {
      if (searchTerm) {
        userTable._tabulator.setFilter([
          {field: "username", type: "like", value: searchTerm},
          {field: "name", type: "like", value: searchTerm},
          {field: "email", type: "like", value: searchTerm}
        ], "or");
      } else {
        userTable._tabulator.clearFilter();
      }
    }
  }

  // 검색어 변경 시 자동 검색
  $: if (searchTerm !== undefined) {
    handleSearch();
  }

  onMount(async () => {
    if (!checkAdminAccess()) return;

    // 샘플 데이터 로드
    users = generateSampleUsers();

    // 테이블 초기화
    userTable = new UserTable();
    userTable.setTbSelectorId('userTable');
    await userTable.init();
    userTable.setData(users);
  });
</script>

<svelte:head>
  <title>회원관리 - 재고관리시스템</title>
</svelte:head>

{#if !hasAdminAccess}
  <div class="flex items-center justify-center h-64">
    <Alert color="red">
      <span class="font-medium">접근 권한이 없습니다.</span> 관리자만 이 페이지에 접근할 수 있습니다.
    </Alert>
  </div>
{:else}
  <div class="page-container">
    <!-- 브레드크럼 -->
    <div class="breadcrumb-container">
      <Breadcrumb class="breadcrumb-responsive">
        <BreadcrumbItem href="/" home class="whitespace-nowrap">
          <div class="flex items-center">
            <!-- <HomeSolid class="w-4 h-4 mr-2 flex-shrink-0" /> -->
            홈
          </div>
        </BreadcrumbItem>
        <BreadcrumbItem class="whitespace-nowrap">
          <div class="flex items-center">
            <UserSolid class="w-4 h-4 mr-2 flex-shrink-0" />
            회원관리
          </div>
        </BreadcrumbItem>
      </Breadcrumb>
    </div>

    <!-- 검색 및 액션 영역 -->
    <div class="section-container">
      <Card class="card-responsive card-compact">
        <div class="card-header">
          <h2 class="card-title">사용자 관리</h2>
          <div class="card-actions">
            <Button color="blue" on:click={openAddUserModal}>
              <UsersGroupSolid class="w-4 h-4 mr-2" />
              사용자 추가
            </Button>
          </div>
        </div>
        <div class="card-content">
          <div class="flex gap-4 mb-4">
            <div class="flex-1 relative">
              <Input
                bind:value={searchTerm}
                placeholder="사용자명, 이름, 이메일로 검색..."
                class="pl-10"
              />
              <SearchSolid class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 사용자 테이블 -->
    <div class="section-content">
      <Card class="card-responsive h-full">
        <div class="card-content h-full">
          <div id="userTable" class="w-full h-full"></div>
        </div>
      </Card>
    </div>
  </div>

  <!-- 사용자 추가/수정 모달 -->
  <FormModal
    bind:open={showUserModal}
    title={modalMode === 'add' ? '사용자 추가' : '사용자 수정'}
    formFields={userFormFields}
    bind:formData={userFormData}
    bind:validationErrors
    loading={modalLoading}
    submitText={modalMode === 'add' ? '추가' : '수정'}
    on:submit={handleUserSubmit}
    on:cancel={handleUserCancel}
  >
    <div slot="additional-fields" class="space-y-4">
      {#if modalMode === 'edit'}
        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <p class="text-sm text-yellow-800 dark:text-yellow-200">
            💡 <strong>참고:</strong> 비밀번호를 변경하지 않으려면 비밀번호 필드를 비워두세요.
          </p>
        </div>
      {/if}
    </div>
  </FormModal>
{/if}

<style>
  /* 테이블 버튼 스타일 */
  :global(.edit-btn) {
    transition: all 0.2s;
  }
  
  :global(.delete-btn) {
    transition: all 0.2s;
  }
</style>