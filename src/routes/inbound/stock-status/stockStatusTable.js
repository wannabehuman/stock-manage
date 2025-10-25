import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';
import { createCodeFormatter, fetchCodeData } from '../../../lib/components/commonTabulator/codeEditor.js';

// 재고현황 테이블 클래스
export class StockStatusTable extends CommonTable {
  constructor() {
    super();

    // 검색 필터 데이터
    this.searchData = {
      itemGrpCode: '',
      itemCode: '',
      itemName: ''
    };

    // 테이블 필드 설정
    const tableFields = [
      { field: "stock_code", title: "품목코드", width: 150 },
      { field: "stock_name", title: "품목명", width: 200 },
      { field: "current_quantity", title: "현재고", width: 120, hozAlign: "right",
        formatter: (cell) => {
          const value = cell.getValue();
          return value ? Number(value).toLocaleString() : '0';
        }
      },
      { field: "unit", title: "단위", width: 100, hozAlign: "center",
        formatter: createCodeFormatter('UNIT')
      },
      { field: "safety_stock", title: "안전재고", width: 120, hozAlign: "right",
        formatter: (cell) => {
          const value = cell.getValue();
          return value ? Number(value).toLocaleString() : '0';
        }
      },
      { field: "inbound_count", title: "입고건수", width: 100, hozAlign: "right",
        formatter: (cell) => {
          const value = cell.getValue();
          return value ? Number(value).toLocaleString() : '0';
        }
      },
      { field: "outbound_count", title: "출고건수", width: 100, hozAlign: "right",
        formatter: (cell) => {
          const value = cell.getValue();
          return value ? Number(value).toLocaleString() : '0';
        }
      },
      { field: "category", title: "카테고리", width: 150,
        formatter: createCodeFormatter('HERBER_KIND')
      },

      { field: "history", title: "이력", width: 80, hozAlign: "center", headerSort: false,
        formatter: (cell) => {
          return '<button class="stock-history-btn px-2 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="입출고 이력 보기">📋</button>';
        },
        cellClick: (e, cell) => {
          const rowData = cell.getRow().getData();
          this.openStockHistoryModal(rowData);
        }
      },

      { field: "inbound_action", title: "입고", width: 80, hozAlign: "center", headerSort: false,
        formatter: (cell) => {
          return '<button class="inbound-btn px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" title="입고하기">입고</button>';
        },
        cellClick: (e, cell) => {
          const rowData = cell.getRow().getData();
          this.openInboundModal(rowData);
        }
      },

      { field: "outbound_action", title: "출고", width: 80, hozAlign: "center", headerSort: false,
        formatter: (cell) => {
          return '<button class="outbound-btn px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600" title="출고하기">출고</button>';
        },
        cellClick: (e, cell) => {
          const rowData = cell.getRow().getData();
          this.openOutboundModal(rowData);
        }
      },
    ];

    this.setFields(tableFields);
    this.setTbSelectorId('stockStatusTable');
    this.setTableName('재고현황');

    // 품명 기준 정렬 설정 및 레이아웃
    this.setCtbSetting({
      layout: "fitData", // 컬럼 너비 유지하고 가로 스크롤 생성
      height: "100%", // 명시적 높이 설정
      initialSort: [
        { column: "stock_name", dir: "asc" }
      ]
    });

    this.setTableBuilt();

    // AJAX 설정
    this.setAjaxUrl('/api/real-stock/status');

    // 필터 셀렉터 설정 (사용하지 않지만 호환성 유지)
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

  // 검색 필터 데이터 설정 (오버라이드)
  setGetFilter() {
    // searchData를 filterData로 직접 반환
    this._filterData = {
      itemGrpCode: this.searchData.itemGrpCode || '',
      itemCode: this.searchData.itemCode || '',
      itemName: this.searchData.itemName || ''
    };
    return this._filterData;
  }

  // 품목 검색 모달 열기
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

  // 재고 이력 모달 열기
  async openStockHistoryModal(stockData) {
    // 모달이 이미 열려있으면 무시
    if (document.getElementById('stockHistoryModal')) {
      return;
    }

    const stockCode = stockData.stock_code;
    const stockName = stockData.stock_name;

    // 모달 HTML 생성 (고정 크기: 1200px x 700px)
    const modalHTML = `
      <div id="stockHistoryModal" class="fixed inset-0 z-50 flex items-center justify-center" style="background-color: rgba(0,0,0,0.5);">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl" style="width: 1200px; height: 700px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column;">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">재고 입출고 이력 (전체)</h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  품목코드: ${stockCode} | 품목명: ${stockName}
                </p>
              </div>
              <button id="closeStockHistoryModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-auto p-6" style="min-height: 0;">
            <div id="stockHistoryTableContainer">
              <div class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                <p class="mt-2 text-gray-600 dark:text-gray-400">이력을 불러오는 중...</p>
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
      const modal = document.getElementById('stockHistoryModal');
      if (modal) {
        modal.remove();
      }
    };

    document.getElementById('closeStockHistoryModal').addEventListener('click', closeModal);
    document.getElementById('stockHistoryModal').addEventListener('click', (e) => {
      if (e.target.id === 'stockHistoryModal') {
        closeModal();
      }
    });

    try {
      // 단위 코드 데이터 가져오기
      const unitCodes = await fetchCodeData('UNIT');
      const unitMap = {};
      unitCodes.forEach(code => {
        unitMap[code.code] = code.code_name;
      });

      // 입출고 이력 가져오기
      const response = await fetch(`/api/real-stock/history/${stockCode}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const history = data.history || [];

      // 날짜 기준 최신순 정렬
      history.sort((a, b) => {
        const dateA = new Date(a.io_date || a.inbound_date);
        const dateB = new Date(b.io_date || b.inbound_date);
        return dateB - dateA; // 최신순
      });

      // 테이블 HTML 생성
      let tableHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
              <tr>
                <th class="px-4 py-3">구분</th>
                <th class="px-4 py-3">입고번호</th>
                <th class="px-4 py-3">일자</th>
                <th class="px-4 py-3">조제일자</th>
                <th class="px-4 py-3">수량</th>
                <th class="px-4 py-3">단위</th>
                <th class="px-4 py-3">유통기한</th>
                <th class="px-4 py-3">비고</th>
              </tr>
            </thead>
            <tbody>
      `;

      if (history.length === 0) {
        tableHTML += `
          <tr>
            <td colspan="8" class="px-4 py-8 text-center text-gray-500">
              입출고 이력이 없습니다.
            </td>
          </tr>
        `;
      } else {
        history.forEach(item => {
          // 백엔드 응답: io_type = 'IN' (입고) 또는 'OUT' (출고)
          const isInbound = item.io_type === 'IN';
          const typeText = isInbound ? '입고' : '출고';
          const typeClass = isInbound
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';

          // 날짜: io_date 우선, 없으면 inbound_date 사용
          const date = item.io_date
            ? new Date(item.io_date).toISOString().split('T')[0]
            : (item.inbound_date ? new Date(item.inbound_date).toISOString().split('T')[0] : '');

          const prepDate = item.preparation_date
            ? new Date(item.preparation_date).toISOString().split('T')[0]
            : '';

          const expiryDate = item.expiry_date
            ? new Date(item.expiry_date).toISOString().split('T')[0]
            : '';

          const quantity = Number(item.quantity) || 0;
          const quantityClass = isInbound ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400';

          tableHTML += `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs font-medium rounded ${typeClass}">
                  ${typeText}
                </span>
              </td>
              <td class="px-4 py-3">${item.inbound_no || '-'}</td>
              <td class="px-4 py-3">${date}</td>
              <td class="px-4 py-3">${prepDate || '-'}</td>
              <td class="px-4 py-3 text-right font-semibold ${quantityClass}">
                ${isInbound ? '+' : '-'}${quantity.toLocaleString()}
              </td>
              <td class="px-4 py-3">${unitMap[item.unit] || item.unit || ''}</td>
              <td class="px-4 py-3">${expiryDate || '-'}</td>
              <td class="px-4 py-3">${item.remark || '-'}</td>
            </tr>
          `;
        });
      }

      tableHTML += '</tbody></table></div>';

      // 테이블 표시
      document.getElementById('stockHistoryTableContainer').innerHTML = tableHTML;

    } catch (error) {
      console.error('재고 이력 조회 실패:', error);
      document.getElementById('stockHistoryTableContainer').innerHTML = `
        <div class="text-center py-8">
          <div class="text-red-600 dark:text-red-400 mb-4">
            <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="font-semibold">재고 이력을 불러오는데 실패했습니다.</p>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-4 rounded">
            <p class="mb-2"><strong>에러 내용:</strong></p>
            <p class="text-left font-mono text-xs">${error.message}</p>
            <p class="mt-4 text-yellow-600 dark:text-yellow-400">
              ⚠️ 백엔드 API가 아직 구현되지 않았을 수 있습니다.
            </p>
            <p class="mt-2 text-left">
              <strong>필요한 API:</strong><br/>
              <code class="bg-white dark:bg-gray-800 px-2 py-1 rounded">GET /api/real-stock/history/${stockCode}</code>
            </p>
          </div>
        </div>
      `;
    }
  }

  // 입고 모달 열기
  async openInboundModal(stockData) {
    const stockCode = stockData.stock_code;
    const stockName = stockData.stock_name;

    // Tabulator가 로드되었는지 확인
    if (typeof window.Tabulator === 'undefined') {
      alert('Tabulator 라이브러리를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // 모달 HTML 생성
    const modalHTML = `
      <div id="inboundModal" class="fixed inset-0 z-50 flex items-center justify-center" style="background-color: rgba(0,0,0,0.5);">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl" style="width: 1400px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column;">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">입고 등록</h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  품목코드: ${stockCode} | 품목명: ${stockName}
                </p>
              </div>
              <button id="closeInboundModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-auto p-6" style="min-height: 0;">
            <div class="mb-4 flex justify-between items-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                ✏️ 행을 추가하고 입고 정보를 입력한 후 저장 버튼을 클릭하세요.
              </p>
              <div class="flex gap-2">
                <button id="addInboundRow" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">+ 행 추가</button>
                <button id="saveInbound" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">💾 저장</button>
              </div>
            </div>
            <div id="inboundModalTable" style="height: 500px;"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 닫기 버튼 이벤트
    const closeModal = () => {
      const modal = document.getElementById('inboundModal');
      if (modal) modal.remove();
    };

    document.getElementById('closeInboundModal').addEventListener('click', closeModal);

    // Tabulator 테이블 생성
    const table = new window.Tabulator("#inboundModalTable", {
      height: "100%",
      layout: "fitDataStretch",
      data: [],
      columns: [
        { field: "stock_code", title: "품목코드", width: 120, editor: false },
        { field: "stock_name", title: "품목명", width: 150, editor: false },
        { field: "inbound_date", title: "입고일자", width: 120, editor: "date", validator: "required" },
        { field: "preparation_date", title: "조제일자", width: 120, editor: "date" },
        { field: "quantity", title: "수량", width: 100, editor: "number", hozAlign: "right", validator: "required" },
        { field: "unit", title: "단위", width: 100, editor: "input" },
        { field: "remark", title: "비고", editor: "input" },
        { field: "actions", title: "삭제", width: 80, hozAlign: "center", headerSort: false,
          formatter: () => '<button class="delete-row px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">삭제</button>',
          cellClick: (_e, cell) => {
            cell.getRow().delete();
          }
        }
      ]
    });

    // 행 추가 버튼
    document.getElementById('addInboundRow').addEventListener('click', () => {
      const today = new Date().toISOString().split('T')[0];
      table.addRow({
        stock_code: stockCode,
        stock_name: stockName,
        inbound_date: today,
        quantity: 0,
        unit: stockData.unit || '',
        rowStatus: 'I'
      });
    });

    // 저장 버튼
    document.getElementById('saveInbound').addEventListener('click', async () => {
      const data = table.getData();
      if (data.length === 0) {
        alert('입고할 데이터를 추가해주세요.');
        return;
      }

      try {
        const response = await fetch('/api/inbound/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          alert('입고 등록이 완료되었습니다.');
          closeModal();
          this.getMainList(); // 재고현황 새로고침
        } else {
          throw new Error('저장 실패');
        }
      } catch (error) {
        console.error('입고 저장 실패:', error);
        alert('입고 등록에 실패했습니다.');
      }
    });
  }

  // 출고 모달 열기
  async openOutboundModal(stockData) {
    const stockCode = stockData.stock_code;
    const stockName = stockData.stock_name;
    const currentQty = stockData.current_quantity || 0;

    // Tabulator가 로드되었는지 확인
    if (typeof window.Tabulator === 'undefined') {
      alert('Tabulator 라이브러리를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // 해당 품목의 입고 lot 목록 가져오기
    let inboundLots = [];
    try {
      const response = await fetch(`/api/inbound/stock/${stockCode}`);
      if (response.ok) {
        inboundLots = await response.json();
        // 수량이 0보다 큰 lot만 필터링
        inboundLots = inboundLots.filter(lot => lot.quantity > 0);
      }
    } catch (error) {
      console.error('입고 lot 조회 실패:', error);
    }

    // 모달 HTML 생성
    const modalHTML = `
      <div id="outboundModal" class="fixed inset-0 z-50 flex items-center justify-center" style="background-color: rgba(0,0,0,0.5);">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl" style="width: 1400px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column;">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">출고 등록</h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  품목코드: ${stockCode} | 품목명: ${stockName} | 현재고: ${Number(currentQty).toLocaleString()}
                </p>
              </div>
              <button id="closeOutboundModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-auto p-6" style="min-height: 0;">
            <div class="mb-4 flex justify-between items-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                ✏️ 행을 추가하고 출고 정보를 입력한 후 저장 버튼을 클릭하세요.
              </p>
              <div class="flex gap-2">
                <button id="addOutboundRow" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">+ 행 추가</button>
                <button id="saveOutbound" class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">💾 저장</button>
              </div>
            </div>
            <div id="outboundModalTable" style="height: 500px;"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 닫기 버튼 이벤트
    const closeModal = () => {
      const modal = document.getElementById('outboundModal');
      if (modal) modal.remove();
    };

    document.getElementById('closeOutboundModal').addEventListener('click', closeModal);

    // Tabulator 테이블 생성
    const table = new window.Tabulator("#outboundModalTable", {
      height: "100%",
      layout: "fitDataStretch",
      data: [],
      columns: [
        { field: "inbound_no", title: "입고번호", width: 130, editor: "list", editorParams: {
          values: inboundLots.map(lot => lot.inbound_no),
          listOnEmpty: true
        }, validator: "required" },
        { field: "stock_code", title: "품목코드", width: 120, editor: false },
        { field: "stock_name", title: "품목명", width: 150, editor: false },
        { field: "io_date", title: "출고일자", width: 120, editor: "date", validator: "required" },
        { field: "quantity", title: "수량", width: 100, editor: "number", hozAlign: "right", validator: "required" },
        { field: "unit", title: "단위", width: 100, editor: "input" },
        { field: "remark", title: "비고", editor: "input" },
        { field: "actions", title: "삭제", width: 80, hozAlign: "center", headerSort: false,
          formatter: () => '<button class="delete-row px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">삭제</button>',
          cellClick: (_e, cell) => {
            cell.getRow().delete();
          }
        }
      ]
    });

    // 행 추가 버튼
    document.getElementById('addOutboundRow').addEventListener('click', () => {
      const today = new Date().toISOString().split('T')[0];
      const defaultInboundNo = inboundLots.length > 0 ? inboundLots[0].inbound_no : '';

      table.addRow({
        inbound_no: defaultInboundNo,
        stock_code: stockCode,
        stock_name: stockName,
        io_date: today,
        quantity: 0,
        unit: stockData.unit || '',
        rowStatus: 'I'
      });
    });

    // 저장 버튼
    document.getElementById('saveOutbound').addEventListener('click', async () => {
      const data = table.getData();
      if (data.length === 0) {
        alert('출고할 데이터를 추가해주세요.');
        return;
      }

      // 출고 수량 검증
      for (const row of data) {
        if (row.quantity > currentQty) {
          alert(`출고 수량(${row.quantity})이 현재고(${currentQty})를 초과할 수 없습니다.`);
          return;
        }
      }

      try {
        const response = await fetch('/api/outbound/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          alert('출고 등록이 완료되었습니다.');
          closeModal();
          this.getMainList(); // 재고현황 새로고침
        } else {
          throw new Error('저장 실패');
        }
      } catch (error) {
        console.error('출고 저장 실패:', error);
        alert('출고 등록에 실패했습니다.');
      }
    });
  }
}
