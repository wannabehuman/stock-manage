import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';
import { createCodeEditor, createCodeFormatter } from '../../../lib/components/commonTabulator/codeEditor.js';

// 입고등록 테이블 클래스 (CommonTable 상속)
export class InboundRegisterTable extends CommonTable {
  constructor() {
    super();
    console.log('InboundRegisterTable constructor called');
    
    // 검색 필터 데이터
    this.searchData = {
      startDate: '',
      endDate: '',
      itemCode: '',
      itemName: ''
    };
    
    // 테이블 필드 설정
    const tableFields = [
      // { field: "select", title: "선택", width: 60, formatter: "tickCross", editor: true, headerSort: false },
      { field: "inbound_no", title: "입고번호", width: 120, editor: "input" },
      { field: "stock_code", title: "품목코드", width: 120,
        validation: [{ type: 'required' }],
        cellClick: (e, cell) => {
          this.openItemModal(cell);
        },
        formatter: (cell) => {
          const value = cell.getValue();
          return value || '<span style="color: #999;">클릭하여 품목 선택</span>';
        }
      },
      { field: "stock_name", title: "품목명", width: 150, editor: false },
      { field: "inbound_date", title: "입고일자", width: 120, editor: "date",
        validation: [{ type: 'required' }],
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        },
        cellEdited: (cell) => {
          // 입고일자가 수정되면 조제일자에 같은 날짜 자동 입력
          const inboundDate = cell.getValue();
          if (inboundDate) {
            const row = cell.getRow();
            row.getCell('preparation_date').setValue(inboundDate);
          }
        }
      },
      { field: "preparation_date", title: "조제일자", width: 120, editor: "date",
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        }
      },
      { field: "quantity", title: "수량", width: 100, editor: "number", hozAlign: "right",
        editorParams: { min: 0, step: 1, selectContents: true },
        validator: ["required", "integer", "min:0"],
        formatter: (cell) => {
          const value = cell.getValue();
          if (value === null || value === undefined || value === '') return '';
          return Math.floor(Number(value)).toLocaleString();
        }
      },
      { field: "unit", title: "단위", width: 100,
        editor: createCodeEditor('UNIT'),
        formatter: createCodeFormatter('UNIT'),
        validation: [{ type: 'required' }]
      },
      { field: "expiry_date", title: "유통기한", width: 120, editor: false,
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        }
      },
      { field: "remark", title: "비고", width: 200, editor: "input" },
      { field: "Del_Check", title: "삭제", frozen: true, width: 70,
        formatter: (cell) => {
          return '🗑️';
        }
      },
    ];

    // 테이블 설정
    console.log('Setting table fields:', tableFields);
    this.setFields(tableFields);
    console.log('Setting table selector: inboundTable');
    this.setTbSelectorId('inboundTable');
    this.setUniCD(['inbound_no']); // 고유키 설정
    this.setTableName('입고등록');

    // 품명 기준 정렬 설정
    this.setCtbSetting({
      initialSort: [
        { column: "stock_name", dir: "asc" }
      ]
    });

    this.setTableBuilt(); // 테이블 생성 시 자동 데이터 로드
    console.log('Table configuration completed');

    // AJAX 설정
    this.setAjaxUrl('/api/inbound');

    // 필터 셀렉터 설정
    this.setFilterSelector('[data-filter]');
  }
  
  // 기본 입고 데이터 생성
  getDefaultRowData() {
    const today = new Date().toISOString().split('T')[0];
    return {
      inbound_no: '', // 서버에서 자동 생성
      stock_code: '',
      inbound_date: today,
      preparation_date: today, // 조제일자도 오늘 날짜로 기본 설정
      quantity: 0,
      unit: 'EA',
      remark: ''
    };
  }

  // 행 추가
  addRow() {
    console.log('InboundRegisterTable addRow called');
    const defaultData = this.getDefaultRowData();
    super.addRow(defaultData);
    console.log('InboundRegisterTable addRow completed');
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
            e.stopPropagation();
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

      // 초기화 버튼 이벤트 등록
      const resetButton = document.getElementById('resetSearchFilter');
      if (resetButton) {
        resetButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.updateSearchData('itemCode', '');
          this.updateSearchData('itemName', '');
          const itemCodeInput = document.querySelector('[data-name="ITEM_CD"]');
          const itemNameInput = document.querySelector('[data-name="ITEM_NM"]');
          if (itemCodeInput) itemCodeInput.value = '';
          if (itemNameInput) itemNameInput.value = '';
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

  // 품목 선택 모달 열기 (테이블 셀용)
  async openItemModal(cell) {
    // 모달이 이미 열려있으면 무시
    if (document.getElementById('itemModal')) {
      return;
    }

    // 모달 HTML 생성
    const modalHTML = `
      <div id="itemModal" class="fixed inset-0 z-50 overflow-y-auto" style="background-color: rgba(0,0,0,0.5);">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">품목 선택</h3>
                <button id="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div class="mb-4">
                <input
                  type="text"
                  id="itemNameFilter"
                  placeholder="품명으로 검색..."
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div id="itemTableContainer" style="height: 400px; overflow: auto;">
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
      const modal = document.getElementById('itemModal');
      if (modal) {
        modal.remove();
      }
    };

    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('itemModal').addEventListener('click', (e) => {
      if (e.target.id === 'itemModal') {
        closeModal();
      }
    });

    try {
      // 품목 목록과 재고 정보 동시에 가져오기
      const [itemsResponse, stockResponse] = await Promise.all([
        fetch('/api/stock-base', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }),
        fetch('/api/inbound', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
      ]);

      let items = await itemsResponse.json();
      const stockItems = await stockResponse.json();

      // 품명 기준 가나다순 정렬
      items.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB, 'ko-KR');
      });

      // 품목별 현재 재고 수량 집계
      const stockMap = {};
      stockItems.forEach(stock => {
        if (!stockMap[stock.stock_code]) {
          stockMap[stock.stock_code] = 0;
        }
        stockMap[stock.stock_code] += parseFloat(stock.quantity) || 0;
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
                <th class="px-4 py-3">현재재고</th>
                <th class="px-4 py-3">단위</th>
                <th class="px-4 py-3">선택</th>
              </tr>
            </thead>
            <tbody>
        `;

        filteredItems.forEach(item => {
          const currentStock = stockMap[item.code] || 0;
          tableHTML += `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td class="px-4 py-3">${item.code || ''}</td>
              <td class="px-4 py-3">${item.name || ''}</td>
              <td class="px-4 py-3">${item.category || ''}</td>
              <td class="px-4 py-3 text-right font-semibold ${currentStock > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}">${currentStock.toFixed(2)}</td>
              <td class="px-4 py-3">${item.unit || ''}</td>
              <td class="px-4 py-3">
                <button class="select-item px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        data-code="${item.code}"
                        data-name="${item.name}"
                        data-unit="${item.unit}"
                        data-current-stock="${currentStock}">
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
      document.getElementById('itemTableContainer').innerHTML = renderTable(items);

      // 필터 이벤트 등록
      const filterInput = document.getElementById('itemNameFilter');
      filterInput.addEventListener('input', (e) => {
        const filterText = e.target.value.toLowerCase();
        const filteredItems = items.filter(item => {
          const itemName = (item.name || '').toLowerCase();
          return itemName.includes(filterText);
        });
        document.getElementById('itemTableContainer').innerHTML = renderTable(filteredItems);

        // 필터링 후 선택 버튼 이벤트 재등록
        attachSelectButtons();
      });

      // 선택 버튼 이벤트 등록 함수
      const attachSelectButtons = () => {
        document.querySelectorAll('.select-item').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const code = e.target.dataset.code;
            const name = e.target.dataset.name;
            const unit = e.target.dataset.unit;
            const currentStock = e.target.dataset.currentStock;

            // 셀에 값 설정
            cell.setValue(code);

            // 같은 행의 다른 필드도 채우기
            const row = cell.getRow();
            if (name) {
              row.getCell('stock_name').setValue(name);
            }
            if (unit) {
              row.getCell('unit').setValue(unit);
            }

            closeModal();
          });
        });
      };

      // 초기 선택 버튼 이벤트 등록
      attachSelectButtons();

    } catch (error) {
      console.error('품목 목록 조회 실패:', error);
      document.getElementById('itemTableContainer').innerHTML = `
        <div class="text-center py-4 text-red-600 dark:text-red-400">
          품목 목록을 불러오는데 실패했습니다.
        </div>
      `;
    }
  }
}