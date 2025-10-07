import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';

// 기초코드 테이블 클래스 (CommonTable 상속)
export class CodesTable extends CommonTable {
  constructor() {
    super();
    console.log('CodesTable constructor called');
    
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
      { field: "ITEM_CD", title: "품목코드", width: 120, editor: "input", 
        validation: [{ type: 'required' }] },
      { field: "ITEM_NM", title: "품목명", width: 200, editor: "input",
        validation: [{ type: 'required' }] },
      { field: "INBOUND_QTY", title: "입고수량", width: 100, editor: "number", hozAlign: "right",
        validation: [{ type: 'required' }, { type: 'number', params: { min: 1 } }] },
      { field: "UNIT_PRICE", title: "단가", width: 100, editor: "number", hozAlign: "right",
        validation: [{ type: 'number', params: { min: 0 } }] },
      { field: "TOTAL_AMT", title: "총금액", width: 120, hozAlign: "right", 
        mutator: (value, data) => (data.INBOUND_QTY || 0) * (data.UNIT_PRICE || 0) },
      { field: "SUPPLIER_CD", title: "공급업체코드", width: 120, editor: "input" },
      { field: "SUPPLIER_NM", title: "공급업체명", width: 150, editor: "input" },
      { field: "EXPIRE_DT", title: "유통기한", width: 120, editor: "date" },
      { field: "LOT_NO", title: "LOT번호", width: 120, editor: "input" },
      { field: "LOCATION_CD", title: "저장위치", width: 100, editor: "input" },
      { field: "Del_Check", title: "삭제", frozen: true,    width: 30, 
        formatter: (cell) => {
          // return '<i class="fas fa-trash text-red-500 cursor-pointer"></i>';
        },
        cellClick: (e, cell) => {
          const row = cell.getRow();
          row.delete();
        }
      },
    ];
    
    // 테이블 설정
    console.log('Setting table fields:', tableFields);
    this.setFields(tableFields);
    console.log('Setting table selector: codesTable');
    this.setTbSelectorId('codesTable');
    this.setUniCD(['CODE_GRP', 'CODE_CD']); // 고유키 설정
    this.setTableName('기초코드관리');
    console.log('Table configuration completed');
    
    // AJAX 설정 (실제 API 엔드포인트로 변경 필요)
    this.setAjaxUrl('/api/master/codes');
    this.setGetMode('getCodesList');
    this.setPutMode('saveCodes');
    
    // 필터 셀렉터 설정
    this.setFilterSelector('[data-filter]');
    
    // 셀 수정 시 총금액 자동 계산
    this.setCellEventList('edited', 'INBOUND_QTY', (cell) => {
      this.calculateTotal(cell.getRow());
    });
    
    this.setCellEventList('edited', 'UNIT_PRICE', (cell) => {
      this.calculateTotal(cell.getRow());
    });
  }
  
  // 총금액 계산
  calculateTotal(row) {
    const data = row.getData();
    const qty = parseFloat(data.OUTBOUND_QTY) || 0;
    const price = parseFloat(data.UNIT_PRICE) || 0;
    const total = qty * price;
    
    row.getCell('TOTAL_AMT').setValue(total);
  }
  
  // // 기본 입고 데이터 생성
  // getDefaultRowData() {
  //   return {
  //     ITEM_CD: '',
  //     ITEM_NM: '',
  //      OUTBOUND_QTY: 1,
  //     UNIT_PRICE: 0,
  //     TOTAL_AMT: 0,
  //     SUPPLIER_CD: '',
  //     SUPPLIER_NM: '',
  //     EXPIRE_DT: '',
  //     LOT_NO: '',
  //     LOCATION_CD: 'A-01',
  //     REMARK: '',
  //     INBOUND_DT: new Date().toISOString().split('T')[0] // 오늘 날짜
  //   };
  // }
  
  // 행 추가
  addRow() {
    console.log('CodesTable addRow called');
    // const defaultData = this.getDefaultRowData();
    super.addRow();
    console.log('CodesTable addRow completed');
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
    // this.getMainList();
  }
}