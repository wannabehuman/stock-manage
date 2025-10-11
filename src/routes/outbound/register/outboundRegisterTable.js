import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';

// 입고등록 테이블 클래스 (CommonTable 상속)
export class OutboundRegisterTable extends CommonTable {
  constructor() {
    super();
    console.log('OutboundRegisterTable constructor called');
    
    // 검색 필터 데이터
    this.searchData = {
      startDate: '',
      endDate: '',
      itemCode: '',
      itemName: ''
    };
    
    // 테이블 필드 설정
    const tableFields = [
      { field: "select", title: "선택", width: 60, formatter: "tickCross", editor: true, headerSort: false },
      { field: "inbound_no", title: "입고번호", width: 120, editor: false },
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
      { field: "inbound_date", title: "입고일자", width: 120, editor: false,
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        }
      },
      { field: "preparation_date", title: "조제일자", width: 120, editor: false,
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        }
      },
      { field: "io_date", title: "출고일자", width: 120, editor: "date",
        validation: [{ type: 'required' }],
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        }
      },
      { field: "quantity", title: "수량", width: 100, editor: "number", hozAlign: "right",
        validation: [{ type: 'required' }, { type: 'number', params: { min: 0 } }] },
      { field: "unit", title: "단위", width: 80, editor: "input" },
      { field: "remark", title: "비고", width: 200, editor: "input" },
      { field: "Del_Check", title: "삭제", frozen: true, width: 30,
        formatter: (cell) => {
          return '🗑️';
        }
      },
    ];
    
    // 테이블 설정
    console.log('Setting table fields:', tableFields);
    this.setFields(tableFields);
    console.log('Setting table selector: outboundTable');
    this.setTbSelectorId('outboundTable');
    this.setUniCD(['id']); // 고유키 설정
    this.setTableName('출고등록');
    this.setTableBuilt(); // 테이블 생성 시 자동 데이터 로드
    console.log('Table configuration completed');

    // AJAX 설정
    this.setAjaxUrl('/api/outbound');

    // 필터 셀렉터 설정
    this.setFilterSelector('[data-filter]');
  }
  
  // 기본 출고 데이터 생성
  getDefaultRowData() {
    const today = new Date().toISOString().split('T')[0];
    return {
      inbound_no: '',
      stock_code: '',
      io_date: today,
      quantity: 0,
      unit: 'EA',
      remark: ''
    };
  }

  // 행 추가
  addRow() {
    console.log('OutboundRegisterTable addRow called');
    const defaultData = this.getDefaultRowData();
    super.addRow(defaultData);
    console.log('OutboundRegisterTable addRow completed');
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

      const items = await response.json();

      // 테이블 HTML 생성
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

      items.forEach(item => {
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

      // 테이블 표시
      document.getElementById('searchItemTableContainer').innerHTML = tableHTML;

      // 선택 버튼 이벤트
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
      // 입고된 재고 목록 가져오기 (handstock 테이블)
      const response = await fetch('/api/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const items = await response.json();

      // 재고가 있는 것만 필터링
      const availableItems = items.filter(item => item.quantity > 0);

      // 테이블 HTML 생성
      let tableHTML = `
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
            <tr>
              <th class="px-4 py-3">입고번호</th>
              <th class="px-4 py-3">품목코드</th>
              <th class="px-4 py-3">품목명</th>
              <th class="px-4 py-3">입고일자</th>
              <th class="px-4 py-3">조제일자</th>
              <th class="px-4 py-3">재고수량</th>
              <th class="px-4 py-3">단위</th>
              <th class="px-4 py-3">선택</th>
            </tr>
          </thead>
          <tbody>
      `;

      if (availableItems.length === 0) {
        tableHTML += `
          <tr>
            <td colspan="8" class="px-4 py-8 text-center text-gray-500">
              출고 가능한 재고가 없습니다.
            </td>
          </tr>
        `;
      } else {
        availableItems.forEach(item => {
          const inboundDate = item.inbound_date ? new Date(item.inbound_date).toISOString().split('T')[0] : '';
          const prepDate = item.preparation_date ? new Date(item.preparation_date).toISOString().split('T')[0] : '';

          tableHTML += `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td class="px-4 py-3">${item.inbound_no || ''}</td>
              <td class="px-4 py-3">${item.stock_code || ''}</td>
              <td class="px-4 py-3">${item.stock_name || ''}</td>
              <td class="px-4 py-3">${inboundDate}</td>
              <td class="px-4 py-3">${prepDate}</td>
              <td class="px-4 py-3 text-right">${item.quantity || 0}</td>
              <td class="px-4 py-3">${item.unit || ''}</td>
              <td class="px-4 py-3">
                <button class="select-item px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        data-inbound-no="${item.inbound_no || ''}"
                        data-code="${item.stock_code}"
                        data-name="${item.stock_name || ''}"
                        data-inbound-date="${inboundDate}"
                        data-prep-date="${prepDate}"
                        data-quantity="${item.quantity}"
                        data-unit="${item.unit}">
                  선택
                </button>
              </td>
            </tr>
          `;
        });
      }

      tableHTML += '</tbody></table>';

      // 테이블 표시
      document.getElementById('itemTableContainer').innerHTML = tableHTML;

      // 선택 버튼 이벤트
      document.querySelectorAll('.select-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const inboundNo = e.target.dataset.inboundNo;
          const code = e.target.dataset.code;
          const name = e.target.dataset.name;
          const inboundDate = e.target.dataset.inboundDate;
          const prepDate = e.target.dataset.prepDate;
          const maxQuantity = e.target.dataset.quantity;
          const unit = e.target.dataset.unit;

          // 셀에 값 설정
          cell.setValue(code);

          // 같은 행의 다른 필드도 채우기
          const row = cell.getRow();
          if (inboundNo) {
            row.getCell('inbound_no').setValue(inboundNo);
          }
          if (name) {
            row.getCell('stock_name').setValue(name);
          }
          if (inboundDate) {
            row.getCell('inbound_date').setValue(inboundDate);
          }
          if (prepDate) {
            row.getCell('preparation_date').setValue(prepDate);
          }
          if (unit) {
            row.getCell('unit').setValue(unit);
          }

          closeModal();
        });
      });

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