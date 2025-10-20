import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';
import { createCodeEditor, createCodeFormatter } from '../../../lib/components/commonTabulator/codeEditor.js';

// 품목 테이블 클래스 (CommonTable 상속)
export class ItemsTable extends CommonTable {
  constructor() {
    super();
    console.log('ItemsTable constructor called');

    // 검색 필터 데이터
    this.searchData = {
      itemGrpCode: '',
      itemCode: '',
      itemName: ''
    };

    // 테이블 필드 설정
    const tableFields = [
      // { field: "select", title: "선택", width: 60, formatter: "tickCross", editor: true, headerSort: false },
      { field: "code", title: "품목코드", width: 150, editor: "input",
        validation: [{ type: 'required' }] },
      { field: "name", title: "품목명", width: 200, editor: "input",
        validation: [{ type: 'required' }] },
      { field: "category", title: "카테고리", width: 150,
        editor: createCodeEditor('HERBER_KIND'),
        formatter: createCodeFormatter('HERBER_KIND'),
        // validation: [{ type: 'required' }]
      },
      { field: "unit", title: "단위", width: 100,
        editor: createCodeEditor('UNIT'),
        formatter: createCodeFormatter('UNIT'),
        validation: [{ type: 'required' }] },
      { field: "max_use_period", title: "최대사용기간(일)", width: 150, editor: "number", hozAlign: "right",
        editorParams: { min: 0, step: 1, selectContents: true },
        validator: ["integer", "min:0"],
        formatter: (cell) => {
          const value = cell.getValue();
          if (value === null || value === undefined || value === '') return '';
          return Math.floor(Number(value)).toLocaleString();
        }
      },
      { field: "safety_stock", title: "안전재고", width: 120, editor: "number", hozAlign: "right",
        editorParams: { min: 0, step: 1, selectContents: true },
        validator: ["integer", "min:0"],
        formatter: (cell) => {
          const value = cell.getValue();
          if (value === null || value === undefined || value === '') return '';
          return Math.floor(Number(value)).toLocaleString();
        }
      },
      { field: "remark", title: "비고", width: 200, editor: "input" },
      // { field: "isAlert", title: "알림", width: 80, formatter: "tickCross", editor: true, hozAlign: "center" },
      // { field: "isActive", title: "활성", width: 80, formatter: "tickCross", editor: true, hozAlign: "center" },
      { field: "Del_Check", title: "삭제", frozen: true, width: 70,
        formatter: (cell) => {
            return '🗑️';
          // return '<i class="fas fa-trash text-red-500 cursor-pointer"></i>';
        },
      },
    ];
    
    // 테이블 설정
    // console.log('Setting table fields:', tableFields);
    this.setFields(tableFields);
    // console.log('Setting table selector: itemsTable');
    this.setTbSelectorId('itemsTable');
    this.setUniCD(['code']); // 고유키 설정
    this.setTableName('품목관리');

    // 품명 기준 정렬 설정
    this.setCtbSetting({
      initialSort: [
        { column: "name", dir: "asc" }
      ]
    });

    this.setTableBuilt();
    console.log('Table configuration completed');

    // AJAX 설정
    this.setAjaxUrl('/api/stock-base');

    // 필터 셀렉터 설정
    this.setFilterSelector('[data-filter]');
  }
  
  // 기본 품목 데이터 생성
  getDefaultRowData() {
    return {
      code: '',
      name: '',
      category: '',
      unit: 'EA',
      max_use_period: null,
      safety_stock: 0,
      remark: '',
      isAlert: false,
      isActive: true
    };
  }

  // 행 추가
  addRow() {
    console.log('ItemsTable addRow called');
    const defaultData = this.getDefaultRowData();
    super.addRow(defaultData);
    console.log('ItemsTable addRow completed');
  }
  
  // 데이터 저장
  saveData() {
    this.putData();
  }
  
  // 검색 데이터 업데이트
  updateSearchData(field, value) {
    this.searchData[field] = value;
  }

  // 검색 데이터 가져오기
  getSearchData() {
    return this.searchData;
  }

  // 검색 실행
  search() {
    this.getMainList();
  }

  // 카테고리 검색 모달
  async openSearchCategoryModal() {
    // 모달이 이미 열려있으면 무시
    if (document.getElementById('searchCategoryModal')) {
      return;
    }

    // 모달 HTML 생성
    const modalHTML = `
      <div id="searchCategoryModal" class="fixed inset-0 z-50 overflow-y-auto" style="background-color: rgba(0,0,0,0.5);">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">카테고리 검색</h3>
                <button id="closeSearchCategoryModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div id="searchCategoryTableContainer" style="height: 400px; overflow: auto;">
                <div class="text-center py-4">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                  <p class="mt-2 text-gray-600 dark:text-gray-400">카테고리 목록을 불러오는 중...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 모달을 DOM에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 닫기 버튼 이벤트
    const closeModal = () => {
      const modal = document.getElementById('searchCategoryModal');
      if (modal) {
        modal.remove();
      }
    };

    document.getElementById('closeSearchCategoryModal').addEventListener('click', closeModal);
    document.getElementById('searchCategoryModal').addEventListener('click', (e) => {
      if (e.target.id === 'searchCategoryModal') {
        closeModal();
      }
    });

    try {
      // 카테고리 목록 가져오기 (HERBER_KIND 기초코드)
      const response = await fetch('/api/code-detail/HERBER_KIND', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const categories = await response.json();

      // 테이블 HTML 생성
      let tableHTML = `
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
            <tr>
              <th class="px-4 py-3">코드</th>
              <th class="px-4 py-3">카테고리명</th>
              <th class="px-4 py-3">선택</th>
            </tr>
          </thead>
          <tbody>
      `;

      categories.forEach(category => {
        tableHTML += `
          <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <td class="px-4 py-3">${category.code || ''}</td>
            <td class="px-4 py-3">${category.code_name || ''}</td>
            <td class="px-4 py-3">
              <button class="select-search-category px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      data-code="${category.code}">
                선택
              </button>
            </td>
          </tr>
        `;
      });

      tableHTML += '</tbody></table>';

      // 테이블 표시
      document.getElementById('searchCategoryTableContainer').innerHTML = tableHTML;

      // 선택 버튼 이벤트
      document.querySelectorAll('.select-search-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const code = e.target.dataset.code;

          // 검색 데이터에 설정
          this.updateSearchData('itemGrpCode', code);

          // 입력 필드에 값 표시
          const itemGrpInput = document.querySelector('[data-name="ITEM_GRP_CD"]');
          if (itemGrpInput) itemGrpInput.value = code;

          closeModal();
        });
      });

    } catch (error) {
      console.error('카테고리 목록 조회 실패:', error);
      document.getElementById('searchCategoryTableContainer').innerHTML = `
        <div class="text-center py-4 text-red-600 dark:text-red-400">
          카테고리 목록을 불러오는데 실패했습니다.
        </div>
      `;
    }
  }

  // 품목 검색 모달 (검색 필터용)
  async openSearchItemModal() {
    // 모달이 이미 열려있으면 무시
    if (document.getElementById('searchItemModal')) {
      return;
    }

    // 모달 HTML 생성
    const modalHTML = `
      <div id="searchItemModal" class="fixed inset-0 z-50 overflow-y-auto" style="background-color: rgba(0,0,0,0.5);">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">품목 검색</h3>
                <button id="closeSearchItemModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div class="mb-4">
                <input
                  type="text"
                  id="searchItemNameFilter"
                  placeholder="품명으로 검색..."
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div id="searchItemTableContainer" style="height: 400px; overflow: auto;">
                <div class="text-center py-4">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                  <p class="mt-2 text-gray-600 dark:text-gray-400">품목 목록을 불러오는 중...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 모달을 DOM에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 닫기 버튼 이벤트
    const closeModal = () => {
      const modal = document.getElementById('searchItemModal');
      if (modal) {
        modal.remove();
      }
    };

    document.getElementById('closeSearchItemModal').addEventListener('click', closeModal);
    document.getElementById('searchItemModal').addEventListener('click', (e) => {
      if (e.target.id === 'searchItemModal') {
        closeModal();
      }
    });

    try {
      // 품목 목록 가져오기
      const response = await fetch('/api/stock-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      let items = await response.json();

      // 품명 기준 가나다순 정렬
      items.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB, 'ko-KR');
      });

      // 테이블 렌더링 함수
      const renderTable = (filteredItems) => {
        let tableHTML = `
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
              <tr>
                <th class="px-4 py-3">품목코드</th>
                <th class="px-4 py-3">품목명</th>
                <th class="px-4 py-3">카테고리</th>
                <th class="px-4 py-3">단위</th>
                <th class="px-4 py-3">선택</th>
              </tr>
            </thead>
            <tbody>
        `;

        filteredItems.forEach(item => {
          tableHTML += `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td class="px-4 py-3">${item.code || ''}</td>
              <td class="px-4 py-3">${item.name || ''}</td>
              <td class="px-4 py-3">${item.category || ''}</td>
              <td class="px-4 py-3">${item.unit || ''}</td>
              <td class="px-4 py-3">
                <button class="select-search-item px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        data-code="${item.code}"
                        data-name="${item.name}">
                  선택
                </button>
              </td>
            </tr>
          `;
        });

        tableHTML += '</tbody></table>';
        return tableHTML;
      };

      // 초기 테이블 표시
      document.getElementById('searchItemTableContainer').innerHTML = renderTable(items);

      // 필터 이벤트 등록
      const filterInput = document.getElementById('searchItemNameFilter');
      filterInput.addEventListener('input', (e) => {
        const filterText = e.target.value.toLowerCase();
        const filteredItems = items.filter(item => {
          const itemName = (item.name || '').toLowerCase();
          return itemName.includes(filterText);
        });
        document.getElementById('searchItemTableContainer').innerHTML = renderTable(filteredItems);

        // 필터링 후 선택 버튼 이벤트 재등록
        attachSelectButtons();
      });

      // 선택 버튼 이벤트 등록 함수
      const attachSelectButtons = () => {
        document.querySelectorAll('.select-search-item').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const code = e.target.dataset.code;
            const name = e.target.dataset.name;

            // 검색 데이터에 설정
            this.updateSearchData('itemCode', code);
            this.updateSearchData('itemName', name);

            // 입력 필드에 값 표시
            const itemCodeInput = document.querySelector('[data-name="ITEM_CD"]');
            const itemNameInput = document.querySelector('[data-name="ITEM_NM"]');
            if (itemCodeInput) itemCodeInput.value = code;
            if (itemNameInput) itemNameInput.value = name;

            closeModal();
          });
        });
      };

      // 초기 선택 버튼 이벤트 등록
      attachSelectButtons();

    } catch (error) {
      console.error('품목 목록 조회 실패:', error);
      document.getElementById('searchItemTableContainer').innerHTML = `
        <div class="text-center py-4 text-red-600 dark:text-red-400">
          품목 목록을 불러오는데 실패했습니다.
        </div>
      `;
    }
  }
}