<script>
  import { Card, Breadcrumb, BreadcrumbItem, Button } from 'flowbite-svelte';
  import { HomeSolid } from 'flowbite-svelte-icons';
  import FormModal from '$lib/components/modals/FormModal.svelte';
  import TableModal from '$lib/components/modals/TableModal.svelte';
  import { CommonPop } from '$lib/components/commonTabulator/commonPop.js';

  // FormModal 상태
  let showFormModal = false;
  let formLoading = false;
  let formData = {
    name: '',
    email: '',
    role: '',
    isActive: false,
    description: '',
    birthDate: ''
  };
  let validationErrors = {};

  // TableModal 상태
  let showTableModal = false;
  let selectedItems = null;

  // FormModal 필드 정의
  const formFields = [
    {
      name: 'name',
      type: 'input',
      label: '이름',
      placeholder: '이름을 입력하세요',
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
      name: 'role',
      type: 'select',
      label: '역할',
      placeholder: '역할을 선택하세요',
      required: true,
      options: [
        { value: 'admin', name: '관리자' },
        { value: 'manager', name: '매니저' },
        { value: 'user', name: '사용자' }
      ]
    },
    {
      name: 'birthDate',
      type: 'date',
      label: '생년월일',
      required: false
    },
    {
      name: 'description',
      type: 'textarea',
      label: '설명',
      placeholder: '설명을 입력하세요',
      rows: 3,
      required: false
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: '활성 상태',
      defaultValue: true
    }
  ];

  // 샘플 테이블 데이터 생성
  class SampleTablePop extends CommonPop {
    constructor() {
      super();
      
      // 테이블 필드 설정
      const fields = [
        { field: "id", title: "ID", width: 60 },
        { field: "name", title: "이름", width: 120 },
        { field: "email", title: "이메일", width: 200 },
        { field: "role", title: "역할", width: 100 },
        { field: "department", title: "부서", width: 120 },
        { field: "status", title: "상태", width: 80, 
          formatter: (cell) => {
            const value = cell.getValue();
            const color = value === '활성' ? 'green' : 'red';
            return `<span class="px-2 py-1 text-xs rounded-full bg-${color}-100 text-${color}-800">${value}</span>`;
          }
        }
      ];
      
      this.setFields(fields);
      this.setSearchFields(['name', 'email', 'department']);
      this.setTableName('사용자 선택');
      
      // 샘플 데이터
      const sampleData = [
        { id: 1, name: '김철수', email: 'kim@example.com', role: '관리자', department: 'IT', status: '활성' },
        { id: 2, name: '이영희', email: 'lee@example.com', role: '매니저', department: '영업', status: '활성' },
        { id: 3, name: '박민수', email: 'park@example.com', role: '사용자', department: 'IT', status: '비활성' },
        { id: 4, name: '최지연', email: 'choi@example.com', role: '매니저', department: '마케팅', status: '활성' },
        { id: 5, name: '장동건', email: 'jang@example.com', role: '사용자', department: 'HR', status: '활성' },
        { id: 6, name: '김영수', email: 'kimys@example.com', role: '사용자', department: 'IT', status: '활성' },
        { id: 7, name: '이미나', email: 'leemina@example.com', role: '매니저', department: '재무', status: '비활성' },
        { id: 8, name: '박성호', email: 'parksh@example.com', role: '사용자', department: '영업', status: '활성' }
      ];
      
      // 테이블 초기화 후 데이터 설정
      this.on('tableReady', () => {
        this.setData(sampleData);
      });
    }

    // 이벤트 시스템 추가
    on(event, callback) {
      if (!this._events) this._events = {};
      if (!this._events[event]) this._events[event] = [];
      this._events[event].push(callback);
    }

    emit(event, data) {
      if (this._events && this._events[event]) {
        this._events[event].forEach(callback => callback(data));
      }
    }

    async init() {
      await super.init();
      this.emit('tableReady');
    }
  }

  // FormModal 핸들러
  function openFormModal() {
    formData = {
      name: '',
      email: '',
      role: '',
      isActive: false,
      description: '',
      birthDate: ''
    };
    validationErrors = {};
    showFormModal = true;
  }

  function handleFormSubmit(event) {
    const data = event.detail;
    console.log('Form submitted:', data);
    
    // 간단한 유효성 검사
    const errors = {};
    if (!data.name) errors.name = '이름은 필수입니다.';
    if (!data.email) errors.email = '이메일은 필수입니다.';
    if (!data.role) errors.role = '역할을 선택해주세요.';
    
    if (Object.keys(errors).length > 0) {
      validationErrors = errors;
      return;
    }

    // 성공적인 제출 시뮬레이션
    formLoading = true;
    setTimeout(() => {
      formLoading = false;
      showFormModal = false;
      alert(`사용자 '${data.name}'이 성공적으로 저장되었습니다!`);
    }, 1000);
  }

  function handleFormCancel() {
    showFormModal = false;
    validationErrors = {};
  }

  // TableModal 핸들러
  function openTableModal() {
    selectedItems = null;
    showTableModal = true;
  }

  function handleTableConfirm(event) {
    const { selectedData } = event.detail;
    selectedItems = selectedData;
    console.log('Selected items:', selectedData);
    
    if (Array.isArray(selectedData)) {
      alert(`${selectedData.length}개 항목이 선택되었습니다.`);
    } else if (selectedData) {
      alert(`'${selectedData.name}' 항목이 선택되었습니다.`);
    }
  }

  function handleTableCancel() {
    console.log('Table selection cancelled');
  }

  function handleTableSelect(event) {
    const { selectedData } = event.detail;
    console.log('Selection changed:', selectedData);
  }
</script>

<svelte:head>
  <title>모달 예시 - 재고관리시스템</title>
</svelte:head>

<div class="page-container">
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
        <span class="w-4 h-4 mr-2 flex-shrink-0">⚡</span>
        모달 예시
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<!-- Form Modal Example -->
<div class="section-container">
  <Card class="card-responsive card-compact">
    <div class="card-header">
      <h2 class="card-title">폼 모달 예시</h2>
      <div class="card-actions">
        <Button color="blue" on:click={openFormModal}>
          <span class="w-4 h-4 mr-2">+</span>
          폼 모달 열기
        </Button>
      </div>
    </div>
    <div class="card-content">
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-400">
          다양한 입력 필드를 포함한 폼 모달입니다. 유효성 검사, 로딩 상태, 커스텀 필드를 지원합니다.
        </p>
        
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">지원하는 필드 타입:</h3>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>텍스트 입력 (input, email, number, date)</li>
            <li>선택 박스 (select)</li>
            <li>텍스트 영역 (textarea)</li>
            <li>체크박스 (checkbox)</li>
            <li>커스텀 필드 (슬롯 기반)</li>
          </ul>
        </div>
      </div>
    </div>
  </Card>
</div>

<!-- Table Modal Example -->
<div class="section-container">
  <Card class="card-responsive card-compact">
    <div class="card-header">
      <h2 class="card-title">테이블 모달 예시</h2>
      <div class="card-actions">
        <Button color="green" on:click={openTableModal}>
          <span class="w-4 h-4 mr-2">🗂️</span>
          테이블 모달 열기
        </Button>
      </div>
    </div>
    <div class="card-content">
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-400">
          CommonTable을 상속받은 CommonPop 클래스를 사용하는 테이블 모달입니다. 검색, 페이지네이션, 선택 기능을 지원합니다.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">주요 기능:</h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>실시간 검색 및 필터링</li>
              <li>단일/다중 선택 모드</li>
              <li>페이지네이션</li>
              <li>더블클릭으로 즉시 선택</li>
              <li>키보드 네비게이션</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">선택 결과:</h3>
            {#if selectedItems}
              {#if Array.isArray(selectedItems)}
                <p class="text-sm text-blue-600 dark:text-blue-400">
                  {selectedItems.length}개 항목 선택됨
                </p>
                <div class="mt-2 max-h-32 overflow-y-auto">
                  {#each selectedItems as item}
                    <div class="text-xs text-gray-600 dark:text-gray-400">
                      • {item.name} ({item.email})
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-sm text-blue-600 dark:text-blue-400">
                  선택된 항목: {selectedItems.name}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {selectedItems.email} - {selectedItems.role}
                </p>
              {/if}
            {:else}
              <p class="text-sm text-gray-500 dark:text-gray-400">
                아직 선택된 항목이 없습니다.
              </p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </Card>
</div>
</div>

<!-- Form Modal -->
<FormModal
  bind:open={showFormModal}
  title="사용자 등록"
  {formFields}
  bind:formData
  bind:validationErrors
  loading={formLoading}
  submitText="등록"
  on:submit={handleFormSubmit}
  on:cancel={handleFormCancel}
>
  <!-- 커스텀 필드 예시 -->
  <div slot="additional-fields" class="space-y-4">
    <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
      <p class="text-sm text-yellow-800 dark:text-yellow-200">
        💡 <strong>참고:</strong> 이 폼은 예시용입니다. 실제 데이터는 저장되지 않습니다.
      </p>
    </div>
  </div>
</FormModal>

<!-- Table Modal -->
<TableModal
  bind:open={showTableModal}
  title="사용자 선택"
  tableClass={SampleTablePop}
  tableId="userSelectTable"
  selectionMode="single"
  searchPlaceholder="이름, 이메일, 부서로 검색..."
  confirmText="선택"
  on:confirm={handleTableConfirm}
  on:cancel={handleTableCancel}
  on:select={handleTableSelect}
>
  <div slot="additional-content" class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <p class="text-sm text-gray-600 dark:text-gray-400">
      💡 <strong>사용법:</strong> 행을 클릭하여 선택하거나, 더블클릭으로 즉시 선택할 수 있습니다.
    </p>
  </div>
</TableModal>