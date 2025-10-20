import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';

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
      { field: "stock_code", title: "품목코드", width: 150, frozen: true },
      { field: "stock_name", title: "품목명", width: 200, frozen: true },
      { field: "category", title: "카테고리", width: 150 },
      { field: "unit", title: "단위", width: 100, hozAlign: "center" },
      { field: "current_quantity", title: "현재고", width: 120, hozAlign: "right",
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
      { field: "safety_stock", title: "안전재고", width: 120, hozAlign: "right",
        formatter: (cell) => {
          const value = cell.getValue();
          return value ? Number(value).toLocaleString() : '0';
        }
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
    ];

    this.setFields(tableFields);
    this.setTbSelectorId('stockStatusTable');
    this.setTableName('재고현황');
    this.setTableBuilt();
    // 품명 기준 정렬 설정
    this.setCtbSetting({
      initialSort: [
        { column: "stock_name", dir: "asc" }
      ]
    });

    // AJAX 설정
    this.setAjaxUrl('/api/real-stock/status');

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

    // 모달 HTML 생성
    const modalHTML = `
      <div id="stockHistoryModal" class="fixed inset-0 z-50 overflow-y-auto" style="background-color: rgba(0,0,0,0.5);">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">재고 입출고 이력</h3>
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

            <div class="flex-1 overflow-auto p-6">
              <div id="stockHistoryTableContainer">
                <div class="text-center py-8">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                  <p class="mt-2 text-gray-600 dark:text-gray-400">이력을 불러오는 중...</p>
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
      // 입출고 이력 가져오기
      const response = await fetch(`/api/real-stock/history/${stockCode}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
      }

      const history = await response.json();

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
          const isInbound = item.inbound_no && !item.io_type;
          const isOutbound = item.io_type === 'OUT';
          const typeText = isInbound ? '입고' : '출고';
          const typeClass = isInbound
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';

          const date = isInbound
            ? (item.inbound_date ? new Date(item.inbound_date).toISOString().split('T')[0] : '')
            : (item.io_date ? new Date(item.io_date).toISOString().split('T')[0] : '');

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
              <td class="px-4 py-3">${item.unit || ''}</td>
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
}
