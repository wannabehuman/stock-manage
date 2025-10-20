import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';

// 현재고 조회 테이블 클래스
export class CurrentStockTable extends CommonTable {
  constructor() {
    super();

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
    ];

    this.setFields(tableFields);
    this.setTbSelectorId('currentStockTable');
    this.setTableName('현재고조회');

    // 품명 기준 정렬 설정
    this.setCtbSetting({
      initialSort: [
        { column: "stock_name", dir: "asc" }
      ]
    });

    // AJAX 설정
    this.setAjaxUrl('/api/inbound/current');

    // 필터 셀렉터 설정
    this.setFilterSelector('[data-filter]');
  }

  // 검색 실행
  search() {
    this.getMainList();
  }
}
