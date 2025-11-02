import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';
import { createCodeFormatter, fetchCodeData } from '../../../lib/components/commonTabulator/codeEditor.js';
import { TabulatorModal } from '../../../lib/components/commonTabulator/TabulatorModal.js';

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
          const element = cell.getElement();
          element.style.backgroundColor = "#FFE5CC";
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

      // 품목 선택 함수
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
            <tr class="item-row bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
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

      // 필터 이벤트 등록
      const filterInput = document.getElementById('searchItemNameFilter');
      filterInput.addEventListener('input', (e) => {
        const filterText = e.target.value.toLowerCase();
        const filteredItems = items.filter(item => {
          const itemName = (item.name || '').toLowerCase();
          return itemName.includes(filterText);
        });
        document.getElementById('searchItemTableContainer').innerHTML = renderTable(filteredItems);

        // 필터링 후 이벤트 재등록
        attachEventListeners();
      });

      // 이벤트 리스너 등록 함수
      const attachEventListeners = () => {
        // 선택 버튼 클릭 이벤트
        document.querySelectorAll('.select-search-item').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 행 더블클릭 이벤트와 충돌 방지
            const code = e.target.dataset.code;
            const name = e.target.dataset.name;
            selectItem(code, name);
          });
        });

        // 행 더블클릭 이벤트
        document.querySelectorAll('.item-row').forEach(row => {
          row.addEventListener('dblclick', (e) => {
            const code = e.currentTarget.dataset.code;
            const name = e.currentTarget.dataset.name;
            selectItem(code, name);
          });
        });
      };

      // 초기 이벤트 등록
      attachEventListeners();

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

    // 코드 데이터 미리 로드 (429 에러 방지)
    await fetchCodeData('UNIT');

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
      console.log('입출고 이력 API 호출:', `/api/real-stock/history/${stockCode}`);
      const response = await fetch(`/api/real-stock/history/${stockCode}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('입출고 이력 API 응답 상태:', response.status);
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('입출고 이력 데이터:', data);
      const history = data.history || [];
      console.log('입출고 이력 개수:', history.length);

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
                <th class="px-4 py-3">등록자</th>
                <th class="px-4 py-3">수정자</th>
                <th class="px-4 py-3">비고</th>
              </tr>
            </thead>
            <tbody>
      `;

      if (history.length === 0) {
        tableHTML += `
          <tr>
            <td colspan="10" class="px-4 py-8 text-center text-gray-500">
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
              <td class="px-4 py-3">${item.created_by_name || '-'}</td>
              <td class="px-4 py-3">${item.updated_by_name || '-'}</td>
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

  // 입고 모달 컬럼 정의
  _getInboundModalColumns() {
    return [
      { field: "inbound_no", title: "입고번호", width: 120, editor: false },
      { field: "stock_code", title: "품목코드", width: 120, editor: false },
      { field: "stock_name", title: "품목명", width: 150, editor: false },
      {
        field: "inbound_date",
        title: "입고일자",
        width: 120,
        editor: "date",
        validator: "required",
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        },
        cellEdited: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.ROW_STATUS !== 'I') {
            cell.getRow().update({ ROW_STATUS: 'U' });
          }
        }
      },
      {
        field: "preparation_date",
        title: "조제일자",
        width: 120,
        editor: "date",
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        },
        cellEdited: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.ROW_STATUS !== 'I') {
            cell.getRow().update({ ROW_STATUS: 'U' });
          }
        }
      },
      {
        field: "quantity",
        title: "수량",
        width: 100,
        editor: "number",
        hozAlign: "right",
        validator: "required",
        formatter: (cell) => {
          const value = cell.getValue();
          return value ? Number(value).toLocaleString() : '0';
        },
        cellEdited: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.ROW_STATUS !== 'I') {
            cell.getRow().update({ ROW_STATUS: 'U' });
          }
        }
      },
      {
        field: "unit",
        title: "단위",
        width: 100,
        editor: "input",
        cellEdited: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.ROW_STATUS !== 'I') {
            cell.getRow().update({ ROW_STATUS: 'U' });
          }
        }
      },
      {
        field: "remark",
        title: "비고",
        editor: "input",
        cellEdited: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.ROW_STATUS !== 'I') {
            cell.getRow().update({ ROW_STATUS: 'U' });
          }
        }
      },
      { field: "created_by_name", title: "등록자", width: 100, editor: false },
      { field: "updated_by_name", title: "수정자", width: 100, editor: false },
      {
        field: "actions",
        title: "삭제",
        width: 80,
        hozAlign: "center",
        headerSort: false,
        formatter: () => '<button class="delete-row px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">삭제</button>',
        cellClick: (_e, cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.ROW_STATUS !== 'I') {
            cell.getRow().update({ ROW_STATUS: 'D' });
          } else {
            cell.getRow().delete();
          }
        }
      }
    ];
  }

  // 입고 모달 열기
  async openInboundModal(stockData) {
    console.log('입고 모달 열기 시작:', stockData);
    const stockCode = stockData.stock_code;
    const stockName = stockData.stock_name;

    // 코드 데이터 미리 로드 (429 에러 방지)
    await Promise.all([
      fetchCodeData('HERBER_KIND'),
      fetchCodeData('UNIT')
    ]);

    // TabulatorModal 생성 (CommonTable 기반 - getMainList로 자동 조회)
    const modal = new TabulatorModal({
      modalId: 'inboundModal',
      title: '입고 등록',
      subtitle: `품목코드: ${stockCode} | 품목명: ${stockName}`,
      width: '1400px',
      tableHeight: '500px',
      columns: this._getInboundModalColumns(),
      placeholder: "입고 데이터가 없습니다. '+ 행 추가' 버튼을 눌러 입고 데이터를 추가하세요.",
      addButtonText: '+ 행 추가',
      saveButtonText: '💾 저장',
      ajaxUrl: '/api/inbound', // CommonTable이 사용할 API URL
      filterData: {
        ITEM_CD: stockCode,  // 백엔드 API 스펙에 맞춰 ITEM_CD 사용
        ST_DT: '',           // 빈 값으로 전달
        ED_DT: '',           // 빈 값으로 전달
        ITEM_NM: ''          // 빈 값으로 전달
      },
      refreshOnSave: true, // 저장 후 자동 리프레시 활성화
      onSaveSuccess: () => {
        // 저장 성공 후 메인 테이블 리프레시
        this.getMainList();
        modal.close();
      },
      onAddRow: (table, modalInstance) => {
        // 행 추가 시 기본값 설정 - CommonTable의 addRow 사용
        const today = new Date().toISOString().split('T')[0];
        modalInstance.addRow({
          stock_code: stockCode,
          stock_name: stockName,
          inbound_date: today,
          preparation_date: today,
          quantity: 0,
          unit: stockData.unit || ''
          // ROW_STATUS와 unicId는 addRow에서 자동 추가됨
        });
      },
      onClose: () => {
        console.log('입고 모달 닫힘');
      }
    });

    await modal.open();
  }

  // 출고 모달 컬럼 정의
  _getOutboundModalColumns() {
    return [
      { field: "inbound_no", title: "입고번호", width: 120, editor: false },
      { field: "stock_code", title: "품목코드", width: 120, editor: false },
      { field: "stock_name", title: "품목명", width: 150, editor: false },
      {
        field: "inbound_date",
        title: "입고일자",
        width: 120,
        editor: false,
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
        editor: false,
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        }
      },
      {
        field: "inbound_quantity",
        title: "입고수량",
        width: 100,
        hozAlign: "right",
        editor: false,
        formatter: (cell) => {
          const value = cell.getValue();
          return value ? Number(value).toLocaleString() : '0';
        }
      },
      {
        field: "outbound_quantity",
        title: "출고수량",
        width: 100,
        hozAlign: "right",
        editor: false,
        formatter: (cell) => {
          const value = cell.getValue();
          return value ? Number(value).toLocaleString() : '0';
        }
      },
      {
        field: "new_outbound_quantity",
        title: "신규출고수량",
        width: 120,
        editor: "number",
        hozAlign: "right",
        editorParams: { min: 0, step: 1, selectContents: true },
        formatter: (cell) => {
          const value = cell.getValue();
          return value ? Number(value).toLocaleString() : '';
        },
        cellEdited: (cell) => {
          const rowData = cell.getRow().getData();
          const newOutboundQty = Number(cell.getValue()) || 0;
          const inboundQty = Number(rowData.inbound_quantity) || 0;

   

          // 출고 수량이 남은 재고 수량을 초과하는지 확인
          if (newOutboundQty > inboundQty) {
            alert(`출고 수량(${newOutboundQty})이 남은 재고 수량(${inboundQty})을 초과할 수 없습니다.`);
            cell.setValue(0);
            return;
          }

          // ROW_STATUS 설정
          if (newOutboundQty > 0) {
            if (!rowData.ROW_STATUS || rowData.ROW_STATUS === '') {
              cell.getRow().update({ ROW_STATUS: 'I' });
            }
          }
        }
      },
      {
        field: "io_date",
        title: "출고일자",
        width: 120,
        editor: "date",
        formatter: (cell) => {
          const value = cell.getValue();
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return value;
          return date.toISOString().split('T')[0];
        },
        cellEdited: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.new_outbound_quantity > 0) {
            if (!rowData.ROW_STATUS || rowData.ROW_STATUS === '') {
              cell.getRow().update({ ROW_STATUS: 'I' });
            }
          }
        }
      },
      { field: "unit", title: "단위", width: 80, editor: false },
      {
        field: "remark",
        title: "비고",
        width: 200,
        editor: "input",
        cellEdited: (cell) => {
          const rowData = cell.getRow().getData();
          if (rowData.new_outbound_quantity > 0) {
            if (!rowData.ROW_STATUS || rowData.ROW_STATUS === '') {
              cell.getRow().update({ ROW_STATUS: 'I' });
            }
          }
        }
      }
    ];
  }

  // 출고 모달 열기
  async openOutboundModal(stockData) {
    console.log('출고 모달 열기 시작:', stockData);
    const stockCode = stockData.stock_code;
    const stockName = stockData.stock_name;
    const currentQty = stockData.current_quantity || 0;

    // 코드 데이터 미리 로드 (429 에러 방지)
    await Promise.all([
      fetchCodeData('HERBER_KIND'),
      fetchCodeData('UNIT')
    ]);

    // 입고 LOT 목록 조회
    let inboundLots = [];
    try {
      console.log('입고 LOT 목록 조회 중...');
      const response = await fetch(`/api/inbound/stock/${stockCode}`);
      console.log('LOT API 응답 상태:', response.status);
      if (response.ok) {
        inboundLots = await response.json();
        console.log('조회된 입고 LOT (전체):', inboundLots);
      }
    } catch (error) {
      console.error('입고 lot 조회 실패:', error);
    }

    // 입고 데이터를 출고용 데이터로 변환
    const today = new Date().toISOString().split('T')[0];
    const outboundData = inboundLots.map(lot => {
      console.log('입고 LOT 데이터:', lot);
      return {
        inbound_no: lot.inbound_no,
        stock_code: stockCode,
        stock_name: stockName,
        inbound_date: lot.inbound_date,
        preparation_date: lot.preparation_date,
        inbound_quantity: lot.inbound_quantity || 0, // 원본 입고 수량
        outbound_quantity: lot.outbound_quantity || 0, // 기존 출고 수량 합계
        new_outbound_quantity: 0, // 새로 출고할 수량
        io_date: today,
        unit: lot.unit || stockData.unit || '',
        remark: lot.remark || '',
        ROW_STATUS: '' // 초기에는 빈 값, 출고 수량 입력 시 'I'로 설정
      };
    });

    console.log('출고 모달 데이터:', outboundData);

    // TabulatorModal 생성
    const modal = new TabulatorModal({
      modalId: 'outboundModal',
      title: '출고 등록',
      subtitle: `품목코드: ${stockCode} | 품목명: ${stockName} | 현재고: ${Number(currentQty).toLocaleString()}`,
      width: '1400px',
      tableHeight: '500px',
      columns: this._getOutboundModalColumns(),
      placeholder: "출고 가능한 재고가 없습니다.",
      showAddButton: false, // 행 추가 버튼 숨김
      saveButtonText: '💾 저장',
      data: outboundData, // 입고 데이터를 초기 데이터로 설정
      onClose: () => {
        console.log('출고 모달 닫힘');
      }
    });

    await modal.open();

    // 커스텀 저장 로직 설정
    const saveBtn = document.getElementById('outboundModal_save');
    if (saveBtn) {
      // 기존 이벤트 제거하고 새로운 이벤트 등록
      const newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

      newSaveBtn.addEventListener('click', async () => {
        // 저장 확인
        if (!confirm('출고 등록을 진행하시겠습니까?')) {
          return;
        }

        // 테이블에서 모든 데이터 가져오기
        const allData = modal._tblList.getData();

        // 신규 출고 수량이 입력된 행만 필터링
        const outboundRecords = allData.filter(row => {
          return Number(row.new_outbound_quantity) > 0;
        });

        if (outboundRecords.length === 0) {
          alert('출고 수량을 입력해주세요.');
          return;
        }

        // 출고 데이터 형식으로 변환
        const saveData = outboundRecords.map(row => ({
          inbound_no: row.inbound_no,
          stock_code: row.stock_code,
          io_date: row.io_date,
          quantity: row.new_outbound_quantity,
          unit: row.unit,
          remark: row.remark,
          ROW_STATUS: 'I'
        }));

        console.log('저장할 출고 데이터:', saveData);

        try {
          const response = await fetch('/api/outbound', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: saveData })
          });

          if (!response.ok) {
            throw new Error('출고 등록 실패');
          }

          alert('출고 등록이 완료되었습니다.');
          this.getMainList();
          modal.close();
        } catch (error) {
          console.error('출고 등록 실패:', error);
          alert('출고 등록 중 오류가 발생했습니다.');
        }
      });
    }
  }

  /**
   * 엑셀 다운로드
   */
  exportToExcel() {
    // 현재 검색 조건 가져오기
    const searchData = this.getSearchData();

    // 쿼리 파라미터 생성
    const params = new URLSearchParams();
    if (searchData.itemGrpCode) params.append('itemGrpCode', searchData.itemGrpCode);
    if (searchData.itemCode) params.append('itemCode', searchData.itemCode);
    if (searchData.itemName) params.append('itemName', searchData.itemName);

    // API 호출하여 파일 다운로드
    const url = `/api/real-stock/export-excel${params.toString() ? '?' + params.toString() : ''}`;

    // 새 창으로 다운로드 (브라우저가 자동으로 파일 다운로드 처리)
    window.open(url, '_blank');

    console.log('엑셀 다운로드 요청:', url);
  }
}
