import { CommonTable } from '../../../lib/components/commonTabulator/commonTable.js';

// 코드 상세(소분류) 테이블 클래스 (CommonTable 상속)
export class CodesTable2 extends CommonTable {
  constructor() {
    super();
    console.log('CodesTable2 constructor called');

    // 테이블 필드 설정
    const tableFields = [
      { field: "grp_code", title: "그룹코드", width: 100 },
      { field: "code", title: "코드", width: 100, editor: "input",
        validation: [{ type: 'required' }] },
      { field: "code_name", title: "코드명", width: 150, editor: "input",
        validation: [{ type: 'required' }] },
      { field: "code_value", title: "코드값", width: 100, editor: "input" },
      { field: "description", title: "설명", width: 150, editor: "input" },
      { field: "use_yn", title: "사용", width: 80, editor: "select",
        editorParams: { values: { 'Y': '사용', 'N': '미사용' } },
        formatter: (cell) => {
          const value = cell.getValue();
          return value === 'Y' ? '사용' : '미사용';
        },
        visible: false
      },
      // { field: "sort_order", title: "순서", width: 70, editor: "number", hozAlign: "right" },
      { field: "Del_Check", title: "삭제", frozen: true, width: 60,
        formatter: (cell) => {
          return '🗑️';
        }
      },
    ];

    // 테이블 설정
    console.log('Setting table fields:', tableFields);
    this.setFields(tableFields);
    console.log('Setting table selector: codesTable2');
    this.setTbSelectorId('codesTable2');
    this.setUniCD(['grp_code', 'code']); // 복합키 설정 - grp_code + code
    this.setTableName('코드상세');
    console.log('Table configuration completed');

    // AJAX 설정
    this.setAjaxUrl('/api/code-detail');

    // getMode 설정 - 대분류 grp_code를 URL에 추가하여 GET /api/code-detail/:grp_code 호출
    this.setGetMode('grp_code');

    // 필터 셀렉터 설정
    this.setFilterSelector('[data-filter]');

    console.log('CodesTable2 configuration complete - will call GET /api/code-detail/:grp_code when row selected');
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