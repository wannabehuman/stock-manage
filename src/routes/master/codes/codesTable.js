import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';
import { CodesTable2 } from './codesTable2.js';
// 코드 그룹(대분류) 테이블 클래스 (CommonTable 상속)
export class CodesTable extends CommonTable {
  constructor() {
    super();
    // console.log('CodesTable constructor called');

    // 테이블 필드 설정
    const tableFields = [
      { field: "grp_code", title: "그룹코드", width: 120, editor: "input",
        validation: [{ type: 'required' }] },
      { field: "grp_name", title: "그룹명", width: 150, editor: "input",
        validation: [{ type: 'required' }] },
      { field: "description", title: "설명", width: 180, editor: "input" },
      { field: "use_yn", title: "사용", width: 80, editor: "select",
        editorParams: { values: { 'Y': '사용', 'N': '미사용' } },
        formatter: (cell) => {
          const value = cell.getValue();
          return value === 'Y' ? '사용' : '미사용';
        }
      },
      { field: "sort_order", title: "순서", width: 70, editor: "number", hozAlign: "right" },
      { field: "Del_Check", title: "삭제", frozen: true, width: 60,
        formatter: (cell) => {
          return '🗑️';
        }
      },
    ];

    // 테이블 설정
    // console.log('Setting table fields:', tableFields);
    this.setFields(tableFields);
    // console.log('Setting table selector: codesTable');
    this.setTbSelectorId('codesTable');
    this.setUniCD(['grp_code']); // 고유키 설정
    this.setTableName('코드그룹');
    this.setTableBuilt(); // 테이블 생성 시 자동 데이터 로드
    this.setCtbSetting({
      selectableRows: 1,
      selectable: true,
    })
    this.codesTable2 = new CodesTable2();
    this.codesTable2.init();
    
    // console.log('Table configuration completed');

    // AJAX 설정
    this.setAjaxUrl('/api/code-group');
    
    // 필터 셀렉터 설정
    this.setFilterSelector('[data-filter]');

    // 소분류 테이블 연결
    this.setLinkedTables([this.codesTable2]);
  }

  // 기본 데이터 생성
  getDefaultRowData() {
    return {
      grp_code: '',
      grp_name: '',
      description: '',
      use_yn: 'Y',
      sort_order: 0
    };
  }

  // 행 추가
  addRow() {
    // console.log('CodesTable addRow called');
    const defaultData = this.getDefaultRowData();
    super.addRow(defaultData);
    // console.log('CodesTable addRow completed');
  }
  addRow2() {
    // console.log('CodesTable addRow called');
    // const defaultData = this.getDefaultRowData();

    this.codesTable2.addRow();
    // console.log('CodesTable addRow completed');
  }
  // 데이터 저장
  saveData() {
    this.putData();
  }

  // 검색 실행
  search() {
    this.getMainList();
  }
}