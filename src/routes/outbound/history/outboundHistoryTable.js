import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';

// 출고이력 테이블 클래스 (CommonTable 상속)
export class OutboundHistoryTable extends CommonTable {
  constructor() {
    super();

    // 검색 필터 데이터
    this.searchData = {
      month: new Date().toISOString().substring(0, 7), // YYYY-MM 형식, 현재 월로 초기화
      itemCode: '',
      itemName: ''
    };

    // 초기 필드 설정 (현재 월의 일수로 시작)
    const initialDays = this.getDaysInMonth(this.searchData.month);
    const tableFields = this.generateDayColumns(initialDays);

    // 테이블 설정
    this.setFields(tableFields);
    this.setTbSelectorId('outboundHistoryTable');
    this.setUniCD(['stock_code']); // 고유키 설정 (품목코드)
    this.setTableName('출고이력조회');

    // Tabulator 설정 변경 (가로 스크롤 활성화, 품명 기준 정렬)
    this.setCtbSetting({
      layout: "fitData", // fitColumns 대신 fitData 사용
      layoutColumnsOnNewData: true,
      responsiveLayout: false, // 반응형 레이아웃 비활성화 - 모든 컬럼 표시
      initialSort: [
        { column: "item_name", dir: "asc" }
      ]
    });

    // AJAX 설정
    this.setAjaxUrl('/api/outbound/history');

    // 필터 셀렉터 설정
    this.setFilterSelector('[data-filter]');
    this.setTableBuilt();
  }

  // 해당 월의 일수를 계산
  getDaysInMonth(yearMonth) {
    if (!yearMonth) {
      return 31; // 기본값
    }
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    return daysInMonth;
  }

  // 일별 컬럼 동적 생성
  generateDayColumns(daysInMonth) {
    console.log(`generateDayColumns called with daysInMonth=${daysInMonth}`);
    const fields = [
      // {
      //   field: "stock_code",
      //   title: "품목코드",
      //   width: 150,
      //   hozAlign: "center"
      // },
      {
        field: "item_name",
        title: "품목명",
        width: 90,
        hozAlign: "left"
      },
    ];

    // 일자 컬럼 추가
    for (let day = 1; day <= daysInMonth; day++) {
      fields.push({
        field: `day_${String(day).padStart(2, '0')}`,
        title: `${day}`,
        width: 50,
        // minWidth: 45,
        hozAlign: "right",
        // headerHozAlign: "center",
        formatter: (cell) => this.formatQuantity(cell),
      });
    }

    // console.log(`Generated ${fields.length - 2} day columns (from day 1 to day ${daysInMonth})`);

    // 합계 컬럼
    fields.push({
      field: "total_qty",
      title: "합계",
      width: 100,
      hozAlign: "right",
      formatter: (cell) => this.formatQuantity(cell),
      cssClass: "font-semibold"
    });

    console.log(`Total fields: ${fields.length} (2 fixed + ${daysInMonth} days + 1 total)`);
    return fields;
  }

  // 수량 포맷팅 (0이면 빈 문자열, 아니면 숫자 표시)
  formatQuantity(cell) {
    const value = cell.getValue();
    if (!value || value === 0) return '';
    return value.toLocaleString();
  }

  // 검색 데이터 업데이트
  updateSearchData(field, value) {
    this.searchData[field] = value;
  }

  // 검색 데이터 가져오기
  getSearchData() {
    return this.searchData;
  }

  // 검색 데이터를 필터로 반환
  setGetFilter() {
    return {
      month: this.searchData.month,
      itemCode: this.searchData.itemCode,
      itemName: this.searchData.itemName
    };
  }

  // 검색 실행
  search() {
    // 선택된 월에 따라 테이블 컬럼 재생성
    const daysInMonth = this.getDaysInMonth(this.searchData.month);
    console.log('Days in month:', daysInMonth);

    const newFields = this.generateDayColumns(daysInMonth);
    console.log('Generated fields:', newFields.length, 'columns');

    // 필드 업데이트
    this.setFields(newFields);

    if (this._tblList) {
      // 기존 테이블 완전히 파괴
      this._tblList.destroy();

      // 테이블 재생성
      this.init();

      // 테이블이 재생성된 후 데이터 로드
      setTimeout(() => {

        this.getMainList();
      }, 100);
    }
  }
}