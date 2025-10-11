import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';

// 일별 입고 이력 테이블 클래스
export class InboundDailyTable extends CommonTable {
  constructor() {
    super();

    // 기본 필드 (품목코드, 품목명)
    const baseFields = [
      { field: "stock_code", title: "품목코드", width: 150, frozen: true },
      { field: "stock_name", title: "품목명", width: 200, frozen: true },
    ];

    this.setFields(baseFields);
    this.setTbSelectorId('inboundDailyTable');
    this.setTableName('일별입고이력');

    // AJAX 설정
    this.setAjaxUrl('/api/inbound/daily');

    // 필터 셀렉터 설정
    this.setFilterSelector('[data-filter]');
  }

  /**
   * 년월에 따라 동적으로 일자 컬럼 생성
   * @param {number} year 년도
   * @param {number} month 월 (1-12)
   */
  setDailyColumns(year, month) {
    // 해당 월의 마지막 날 계산
    const lastDay = new Date(year, month, 0).getDate();

    // 기본 필드 (품목코드, 품목명)
    const baseFields = [
      { field: "stock_code", title: "품목코드", width: 150, frozen: true },
      { field: "stock_name", title: "품목명", width: 200, frozen: true },
    ];

    // 일자별 필드 생성 (1일 ~ 마지막날)
    const dayFields = [];
    for (let day = 1; day <= lastDay; day++) {
      dayFields.push({
        field: `day_${day}`,
        title: `${day}일`,
        width: 60,
        hozAlign: "right",
        formatter: (cell) => {
          const value = cell.getValue();
          return value === 0 || value === null ? '' : value;
        }
      });
    }

    // 전체 필드 설정
    const allFields = [...baseFields, ...dayFields];
    this.setDynamicFields(allFields);
  }

  /**
   * 년월로 데이터 조회
   * @param {number} year 년도
   * @param {number} month 월 (1-12)
   */
  async loadData(year, month) {
    try {
      // 컬럼 재설정
      this.setDailyColumns(year, month);

      // 데이터 조회
      const response = await fetch(`/api/inbound/daily?year=${year}&month=${month}`);
      const data = await response.json();

      // 데이터 설정
      this.setData(data);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      alert('데이터 조회에 실패했습니다.');
    }
  }
}
