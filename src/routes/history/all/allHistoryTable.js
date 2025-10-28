import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';
import { createCodeFormatter } from '../../../lib/components/commonTabulator/codeEditor.js';

// 입출고내역 전체보기 테이블 클래스
export class AllHistoryTable extends CommonTable {
  constructor() {
    super();

    // 검색 필터 데이터
    this.searchData = {
      startDate: '',
      endDate: '',
      ioType: '', // 'IN', 'OUT', '' (전체)
      itemCode: '',
      itemName: ''
    };

    // 테이블 필드 설정
    const tableFields = [
      {
        field: "io_type",
        title: "구분",
        width: 80,
        hozAlign: "center",
        formatter: (cell) => {
          const value = cell.getValue();
          if (value === 'IN') {
            return '<span class="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">입고</span>';
          } else if (value === 'OUT') {
            return '<span class="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">출고</span>';
          }
          return value;
        }
      },
      { field: "inbound_no", title: "입고번호", width: 120 },
      { field: "stock_code", title: "품목코드", width: 120 },
      { field: "stock_name", title: "품목명", width: 180 },
      {
        field: "io_date",
        title: "입출고일자",
        width: 120,
        sorter: "date",
        sorterParams: { format: "yyyy-MM-dd" },
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        }
      },
      {
        field: "preparation_date",
        title: "조제일자",
        width: 120,
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '-';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        }
      },
      {
        field: "quantity",
        title: "수량",
        width: 100,
        hozAlign: "right",
        formatter: (cell) => {
          const value = cell.getValue();
          if (value === null || value === undefined || value === '') return '';
          const row = cell.getRow().getData();
          const quantity = Math.floor(Number(value)).toLocaleString();
          const isInbound = row.io_type === 'IN';
          const color = isInbound ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400';
          return `<span class="font-semibold ${color}">${isInbound ? '+' : '-'}${quantity}</span>`;
        }
      },
      {
        field: "unit",
        title: "단위",
        width: 100,
        formatter: createCodeFormatter('UNIT')
      },
      {
        field: "expiry_date",
        title: "유통기한",
        width: 120,
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '-';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return '-';
          return date.toISOString().split('T')[0];
        }
      },
      { field: "remark", title: "비고", width: 200 }
    ];

    // 테이블 설정
    this.setFields(tableFields);
    this.setTbSelectorId('allHistoryTable');
    this.setUniCD(['id']); // 고유키 설정
    this.setTableName('입출고내역');

    // 날짜 기준 최신순 정렬
    this.setCtbSetting({
      layout: "fitData", // 컬럼 너비 유지하고 가로 스크롤 생성
      height: "100%", // 명시적 높이 설정
      initialSort: [
        { column: "stock_name", dir: "asc" }
      ]
    });

    this.setTableBuilt(); // 테이블 생성 시 자동 데이터 로드

    // AJAX 설정 - 백엔드 API 엔드포인트
    this.setAjaxUrl('/api/stock-hst');

    // 필터 셀렉터 설정
    this.setFilterSelector('[data-filter]');
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
    // 검색 필터용 품목 선택 모달 (검색 조건에 품목코드/품목명 설정)
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
                <button id="closeSearchModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div class="mb-4 flex gap-2 justify-between items-center">
                <input
                  type="text"
                  id="searchItemNameFilter"
                  placeholder="품명으로 검색..."
                  class="w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  id="resetSearchFilter"
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                  초기화
                </button>
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

    document.getElementById('closeSearchModal').addEventListener('click', closeModal);
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
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer search-item-row"
                data-code="${item.code}"
                data-name="${item.name}">
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

      // 품목 선택 처리 함수
      const selectItem = (code, name) => {
        // 검색 데이터에 설정
        this.updateSearchData('itemCode', code);
        this.updateSearchData('itemName', name);

        // 입력 필드에 값 표시
        const itemCodeInput = document.querySelector('[data-name="ITEM_CD"]');
        const itemNameInput = document.querySelector('[data-name="ITEM_NM"]');
        if (itemCodeInput) itemCodeInput.value = code;
        if (itemNameInput) itemNameInput.value = name;

        closeModal();
      };

      // 선택 버튼 및 행 더블클릭 이벤트 등록 함수
      const attachSelectButtons = () => {
        // 선택 버튼 클릭 이벤트
        document.querySelectorAll('.select-search-item').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 행 클릭 이벤트와 충돌 방지
            const code = e.target.dataset.code;
            const name = e.target.dataset.name;
            selectItem(code, name);
          });
        });

        // 행 더블클릭 이벤트
        document.querySelectorAll('.search-item-row').forEach(row => {
          row.addEventListener('dblclick', (e) => {
            const code = e.currentTarget.dataset.code;
            const name = e.currentTarget.dataset.name;
            selectItem(code, name);
          });
        });
      };

      // 필터링 함수
      const filterItems = (filterText) => {
        const filteredItems = items.filter(item => {
          const itemName = (item.name || '').toLowerCase();
          return itemName.includes(filterText);
        });
        document.getElementById('searchItemTableContainer').innerHTML = renderTable(filteredItems);
        // 필터링 후 선택 버튼 이벤트 재등록
        attachSelectButtons();
      };

      // 필터 이벤트 등록
      const filterInput = document.getElementById('searchItemNameFilter');
      if (filterInput) {
        filterInput.addEventListener('input', (e) => {
          const filterText = e.target.value.toLowerCase();
          filterItems(filterText);
        });
      }

      // 초기화 버튼 이벤트 등록 - 메인 페이지의 품목코드/품목명 초기화
      const resetButton = document.getElementById('resetSearchFilter');
      if (resetButton) {
        resetButton.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('초기화 버튼 클릭됨');

          // 메인 페이지의 검색 데이터 초기화
          this.updateSearchData('itemCode', '');
          this.updateSearchData('itemName', '');

          // 메인 페이지의 입력 필드 초기화
          const itemCodeInput = document.querySelector('[data-name="ITEM_CD"]');
          const itemNameInput = document.querySelector('[data-name="ITEM_NM"]');
          if (itemCodeInput) itemCodeInput.value = '';
          if (itemNameInput) itemNameInput.value = '';

          // 모달 닫기
          closeModal();
        });
      }

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
