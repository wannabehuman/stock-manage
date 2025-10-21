/**
  * @ Overview 
  * @ History 2025-10-07 이원기 최초작성
*/

import { SingleTon } from './singleTon.js';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import axios from 'axios';

// 유틸리티 함수들
function uniqid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 알림 함수들 (Svelte 환경에 맞게 수정)
function kuls_alert(message) {
  alert(message);
}

function kuls_success(message) {
  alert(message);
}

function kuls_confirm(title, message, callback) {
  if (confirm(message)) {
    callback();
  }
}

function kuls_warning(message) {
  console.warn(message);
}

// daou 유틸리티 함수들 대체
const daou = {
  validateCell: (cell, rules) => {
    const value = cell.getValue();
    const field = cell.getField();
    
    for (let rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!value || String(value).trim() === '') {
            return { valid: false, message: `${field}는 필수 입력 항목입니다.` };
          }
          break;
        case 'length':
          const strValue = String(value || '');
          if (rule.params?.min && strValue.length < rule.params.min) {
            return { valid: false, message: `${field}는 최소 ${rule.params.min}자 이상 입력해주세요.` };
          }
          if (rule.params?.max && strValue.length > rule.params.max) {
            return { valid: false, message: `${field}는 최대 ${rule.params.max}자까지 입력 가능합니다.` };
          }
          break;
        case 'number':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            return { valid: false, message: `${field}는 숫자만 입력 가능합니다.` };
          }
          if (rule.params?.min && numValue < rule.params.min) {
            return { valid: false, message: `${field}는 ${rule.params.min} 이상이어야 합니다.` };
          }
          if (rule.params?.max && numValue > rule.params.max) {
            return { valid: false, message: `${field}는 ${rule.params.max} 이하여야 합니다.` };
          }
          break;
      }
    }
    return { valid: true };
  },
  
  applyValidationError: (cell, message) => {
    const cellElement = cell.getElement();
    cellElement.style.backgroundColor = '#ffebee';
    cellElement.style.border = '1px solid #f44336';
    cellElement.title = message;
  },
  
  removeValidationError: (cell) => {
    const cellElement = cell.getElement();
    cellElement.style.backgroundColor = '';
    cellElement.style.border = '';
    cellElement.title = '';
  },
  
  getExcel: (title, fields, addData) => {
    // 엑셀 다운로드 기능 (간단 구현)
    console.log('Excel download:', title, fields, addData);
  }
};

// tb_common_functions 대체
const tb_common_functions = {
  formatterTrashIcon: (cell) => {
    return '<i class="fa fa-trash" style="color: red; cursor: pointer;"></i>';
  }
};

// TableStyler 클래스 간단 구현
class TableStyler {
  constructor(table, selector) {
    this.table = table;
    this.selector = selector;
  }
}

/**
 * @class CommonTable
 * @classdesc 테이블 관리를 위한 공통 클래스
 */
export class CommonTable{
  constructor(){
    this._single         = SingleTon.getInstance(); //변수관리 싱글톤 객체

    this._tblList         = false;
    this.loading          = false;
    this._fields;
    this._tableSelector   = '';
    this._cTbSetting      = {};  //추가 및 수정하고 싶은 타블레이터 세팅이 있으면 사용.
    this._ajaxUrl        = './index.ajax.php';

    this._getMode         = '';
    this._putMode         = '';
    this._filterSelector  = '';
    this._filterData      = {};

    this._event           = [];
    this._cellEvent       = {'click':[],'edited':[]};

    this.CDs              = [];
    this.unicId           = "";
    this._name            = '<setTableName(테이블명)>';

    this.firstCheck       = 0;
    this.lastCheck        = 0;
    this.getSuccess       = (data)=>{this.setData(data)};
    this.putSuccess       = ()=>{this._single.resetData('saveData');this.getMainList()};
    this.putError         = (res)=>{};
    this.breakPoint       = false; // 쓰로틀링 사용시 변수
    this.setTable2SingleTon();

    this.noEditList = []   // cell중에 rowSTATUS를 U로 바꾸고 싶지 않으면 추가할것
    this.loadingOverlay = null; // 커스텀 로딩 오버레이

    this.setCellEvent();
    this.CommonRowEvent();
    // validation 규칙과 에러를 담아놓을 새로운 Map 객체 만들어줌.
    this._validationRules = {};
    this._validationErrors = new Map();
  }

  setOptions({fields,tableSelector,cTbSetting,ajaxUrl,getMode,putMode,filterSelector,CDs}){
    this.setFields(fields ? fields : this._fields);

    this._tableSelector  = tableSelector  ? tableSelector  : this._tableSelector ;
    this._cTbSetting     = cTbSetting     ? cTbSetting     : this._cTbSetting ;
    this._ajaxUrl        = ajaxUrl        ? ajaxUrl        : this._ajaxUrl ;
    this._getMode        = getMode        ? getMode        : this._getMode ;
    this._putMode        = putMode        ? putMode        : this._putMode ;
    this._filterSelector = filterSelector ? filterSelector : this._filterSelector ;
    this.CDs             = CDs            ? CDs            : this.CDs ;
  }
  
  setTable2SingleTon(){
    this._single.setSourceTable(this);
  }

// #region [변수 세팅]
  // (필수) 타블레이터 컬럼 등록
  setFields(fields){
    // validation 규칙을 먼저 추출
    this._originalFields = [...fields]; // 원본 fields 보존
      
    // fields에서 validation 규칙 추출하여 _validationRules에 설정
    this.extractValidationFromFields(fields);

    // Tabulator로 전달할 fields에서 validation 속성 제거 >>> 이거 안하면 개발자 도구 콘솔창에 Tabulator가 겁나 뭐라함. 에러는 아닌데 거슬려서 수정한 부분임.
    this._fields = fields.map(field => {
      const { validation, ...fieldWithoutValidation } = field;
      
      // select 필드인 경우 headerSort를 false로 설정
      if (fieldWithoutValidation.field === 'select' || fieldWithoutValidation.field === 'Del_Check') {
        fieldWithoutValidation.headerSort = false;
      }
      
      return fieldWithoutValidation;
    });

    this._fields.push({field:'unicId', mutator:(value, data)=> uniqid(), visible:false});
  }

  // row status를 u로 안바꾸고 싶은 셀 (params: filed값)
  setNoEditCell(cell){
    this.noEditList.push(cell)
  }

  // (필수) 타블레이터 객체를 생성할 엘레멘트 아이디 등록
  setTbSelectorId(tableSelector){
    this._tableSelector = tableSelector;
  }
  /**
   * @memberof CommonTable
   * @method getTbSelector
   * @description 테이블 선택자를 반환하는 메서드
   * @returns {string} 테이블 선택자
   * @searchable
   */
  getTbSelector(){
    return this._tableSelector;
  }

  // 타블레이터 세팅변경 원할시 사용
  setCtbSetting(cTbSetting){
    this._cTbSetting = {...this._cTbSetting, ...cTbSetting};
  }
  
  /**
   * @memberof CommonTable
   * @method setAjaxUrl
   * @description ajaxUrl 변수를 등록하는 메서드
   * @param {string} ajaxUrl - ajaxUrl 변수
   * @searchable
   */
  setAjaxUrl(ajaxUrl){
    this._ajaxUrl = ajaxUrl;
  }
  /**
   * @memberof CommonTable
   * @method setGetMode
   * @description getMode 변수를 등록하는 메서드
   * @param {string} mode - getMode 변수
   * @searchable
   */
  setGetMode(mode){
    this._getMode = mode;
  }
  /**
   * @memberof CommonTable
   * @method setPutMode
   * @description putMode 변수를 등록하는 메서드
   * @param {string} mode - putMode 변수
   * @searchable
   */
  setPutMode(mode){
    this._putMode = mode;
  }
  // #endregion

  /**
   * @memberof CommonTable
   * @method setFilterSelector
   * @description (필수) filterSelector 변수를 등록하는 메서드 검색을 위한 선택자
   * @param {string} selector - filterSelector 변수
   * @searchable
   */
  setFilterSelector(selector){
    this._filterSelector = selector;
  }

  /**
   * @memberof CommonTable
   * @method setFilterData
   * @description filterData 변수를 등록하는 메서드 검색을 위한 데이터 주로 팝업 조회 시 해당 ROW의 데이터를 통하여 작업 시 사용
   * @param {object} data - filterData 변수
   * @searchable
   */
  setFilterData(filterData){
    this._filterData = filterData;
  }

  /**
   * @memberof CommonTable
   * @method dateChecker
   * @description dateChecker 변수를 등록하는 메서드 날짜 타입인 태그가 2개일때(시작일 및 종료일 input이 두개라고 가정) 
   * 시작일이 종료일보다 앞설 수 없도록 체크하는 함수
   * @returns {boolean} 체크 결과
   * @searchable
   */
  dateChecker(){
    const filterSelector = this._filterSelector;
    let dateCheck = true;
    const ST_DT = document.querySelector(filterSelector + '[data-name="ST_DT"]');
    const ED_DT = document.querySelector(filterSelector + '[data-name="ED_DT"]');

    if (ST_DT && ED_DT) {
      //우선되는 date 타입 value
      const startDate = new Date(ST_DT.value);
      // 뒤에 입력된 date 타입 value
      const endDate = new Date(ED_DT.value);
      
      if (startDate > endDate) {
        kuls_alert('시작일이 종료일보다 앞설 수 없습니다.');
        dateCheck = false;
      }
    }
    return dateCheck;
  }

  /**
   * @memberof CommonTable
   * @method setDynamicFields
   * @description setDynamicFields 변수를 등록하는 메서드
   * @param {array} newFields - newFields 변수
   * @searchable
   */
  setDynamicFields(newFields) {
    this.setFields(newFields);
    this._tblList.setColumns([]);  // 모든 컬럼 제거
    this._tblList.setColumns(this._fields);  // 새 컬럼 설정
  }

  /**
   * @memberof CommonTable
   * @method setGetFilter
   * @description setGetFilter 변수를 등록하는 메서드
   * @returns {boolean} 체크 결과
   * @searchable
   */
  setGetFilter(){
    const filterSelector = this._single.getData('filterSelector');
    let validate = true;
    if(filterSelector){
      document.querySelectorAll(filterSelector).forEach(d=>{
        this._filterData[d.dataset.name] = d.value
      });  
      validate = this.dateChecker();
    }
    return validate ? this._filterData : false;
  }


  /**
   * @memberof CommonTable
   * @method setData
   * @description 테이블 데이터를 세팅하는 메서드드
   * @param {object} data - 테이블 데이터
   * @searchable
   */
  setData(data){
    this._tblList?.setData(data);
    (this._tblList && this.sortNum) ? this._tblList.setSort([{column:this.sortNum, dir:'asc'}]) : false;
  }

  /**
   * @memberof CommonTable
   * @method setUniCD
   * @description (필수) 테이블 내의 고유키를 등록하는 메서드 !!!!(unicId는 절대 추가해서는 안됩니다. 행중복이 발생할 수 있습니다.)!!!!
   * @param {array} keys - 고유키 배열
   * @searchable
   */
  setUniCD(keys){
    this.CDs = keys;
  }

  /**
   * @memberof CommonTable
   * @method setTableName
   * @description (필수) 테이블 이름을 등록하는 메서드
   * @param {string} name - 테이블 이름
   * @searchable
   */
  setTableName(name){
    this._name = name;
  }

// #endregion

  /**
   * @memberof CommonTable
   * @method init
   * @description 테이블 초기화 및 정의 메서드
   * @searchable
   */
  init(){
    console.log('CommonTable init called');
    console.log('Table selector:', this._tableSelector);
    console.log('Fields:', this._fields);
    
    // DOM 요소 존재 확인
    const element = document.getElementById(this._tableSelector);
    console.log('DOM element found:', element);
    if (!element) {
      console.error('Table element not found:', this._tableSelector);
      return;
    }

    const tableSetting = {
      layout: "fitColumns",
      height: "100%",
      placeholder: "등록된 내용이 존재하지 않습니다.",
      columns: this._fields,
      movableColumns: true,
      // selectableRows: 1,
      // selectable: true,

      // 반응형 설정
      responsiveLayout: "hide",
      responsiveLayoutCollapseStartOpen: false,
      
      // 컬럼 기본 설정
      columnDefaults: {
        headerHozAlign: "center",
        vertAlign: "middle", 
        hozAlign: "center",
        headerSortTristate: true,
        resizable: "header",
        headerFilter: false, // 기본적으로 헤더 필터 비활성화
        
        // 툴팁 설정
        tooltip: function(e, cell, onRendered) {
          const data = cell.getRow().getData();
          if (data.RS_CODE === false) {
            return `오류: ${data.RS_MSG || '알 수 없는 오류'}`;
          }
          // 셀 내용이 길 경우 툴팁으로 전체 내용 표시
          const cellValue = cell.getValue();
          if (cellValue && String(cellValue).length > 20) {
            return String(cellValue);
          }
          return false;
        },
      },

      // 페이지네이션 설정 - 비활성화 (footer 숨김)
      pagination: false,
      // paginationMode: "local",
      // paginationSize: 50,
      // paginationSizeSelector: [25, 50, 100, 200],
      // paginationCounter: "rows",
      
      // 정렬 아이콘 개선
      headerSortElement: `
        <div class="flex flex-col ml-1">
          <div class="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-transparent border-b-gray-400 dark:border-b-gray-500 -mb-0.5"></div>
          <div class="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-transparent border-t-gray-400 dark:border-t-gray-500"></div>
        </div>
      `,
      rowFormatter: function (row) {

        // 행 값에 따른 row 클래스 추가
        console.log('Row formatter called for:', row._row.data);
        const element = row.getElement();

        element.classList.remove("row-dl");
        element.classList.remove("row-er");
        element.classList.remove("row-ud");
        element.classList.remove("row-ad");

        // 기본 스타일 초기화
        element.style.backgroundColor = '';

        if( row._row.data.ROW_STATUS === "D" ){
          console.log('Adding row-dl class');
          element.classList.add("row-dl");
        }
        if( row._row.data.ROW_STATUS === 'U'){
          console.log('Adding row-ud class');
          element.classList.add('row-ud')
        }
        if( row._row.data.ROW_STATUS === 'I'){
          console.log('Adding row-ad class');
          element.classList.add('row-ad');
        }
        if( row._row.data.RS_CODE === false){
          console.log('Adding row-er class');
          element.classList.add('row-er');
          // 직접 인라인 스타일 적용 (다크모드 확인)
          const isDarkMode = document.documentElement.classList.contains('dark');
          element.style.backgroundColor = isDarkMode
            ? 'rgba(127, 29, 29, 0.3)'  // dark: red-900/30
            : 'rgb(254, 242, 242)';      // light: red-50
        }
      },
      ...this._cTbSetting,
    }

    console.log('Creating Tabulator with selector:', '#'+this._tableSelector);
    console.log('Table settings:', tableSetting);
    
    this._tblList = new Tabulator('#'+this._tableSelector, tableSetting);
    console.log('Tabulator created:', this._tblList);

    this.setTableEvent();
    console.log('Table events set');
  }

  /**
   * @memberof CommonTable
   * @method setActiveCell
   * @description 활성화 셀을 설정하는 메서드 (정확한 동작을 잘 모르겠음)
   * @param {string} field - 활성화 셀 필드
   * @searchable
   */
  setActiveCell(field){
    this._activeCell = field;
  }

  /**
   * @memberof CommonTable
   * @method destroy
   * @description 테이블 삭제 (이벤트도 다 삭제)
   * @searchable
   */
  destroy(){
    if(this._tblList){
      this._event.forEach(ev=>{
        this.off(ev)
      })
      this._tblList.destroy();
      this._tblList = undefined;
    }
  }

  /**
   * @memberof CommonTable
   * @method on
   * @description 충돌을 최소화하기 위해 putEvent를 사용할것 (이벤트를 추가하는 메서드. 상속 받은 테이블 객체에서 이벤트를 추가해서 사용하는 것이 가능함)
   * @param {string} event - 이벤트 이름
   * @param {function} handler - 이벤트 핸들러
   * @searchable
   */
  on(event, handler) {
    this._tblList.on(event, handler);
  }

  /**
   * @memberof CommonTable
   * @method off
   * @description 이벤트를 삭제하는 메서드 (필요할진 모르겠으나 우선 추가해둠)
   * @param {object} event - 이벤트 객체
   * @searchable
   */
  off(event) {
    this._tblList.off(event.trigger, event.callBack);
  }

  /**
   * @memberof CommonTable
   * @method setTableEvent
   * @description 테이블 이벤트를 설정하는 메서드.
   * @searchable
   */
  setTableEvent(){
    // for문 돌려서 선언된 이벤트 등록
    this._event.forEach(ev=>{
      this.on(ev.trigger, ev.callBack);
    })
  }
  // #region [이벤트 추가]
  // cellClick 또는 cellEdited 이벤트 추가로 등록 시 공통에서 정의 및 선언된 이벤트가 덮어써질 수 있음. cell에 대한 이벤트 추가는 별도로 적용시켜줄것. 
  // ex) setCellEventList
  /**
   * @memberof CommonTable
   * @method putEvent
   * @description 이벤트를 추가하는 메서드
   * @param {object} event - 이벤트 객체
   * @searchable
   */
  putEvent(event){
    this._event = this._event.filter(ev => ev.trigger !== event.trigger);
    this._event.push(event);
  }
  // #endregion
  
  /**
   * @memberof CommonTable
   * @method setLinkedTablesCt
   * @description 연동된 테이블 커스텀 함수
   * @param {array} LinkTables - 연동된 테이블 배열
   * @example
   * setLinkedTablesCt([{table1, active, deactive}, {table2, active, deactive}, {table3, active, deactive}])
   * @searchable
   */
  setLinkedTablesCt(LinkTables){

    // 싱글톤 객체에 링크된 테이블 등록
    LinkTables.forEach(tbInfo=>{
      this._single.setLinkTable(this, tbInfo.table);
      this._single.delSourceTable(tbInfo.table);

      // 메인 테이블 행을 활성화하면 실행할 서브테이블의 함수
      tbInfo.table.active = tbInfo.active;
      // 메인 테이블 행을 비활성화하면 실행할 서브테이블의 함수
      tbInfo.table.deactive = tbInfo.deactive;
    });

    this.putEvent({
      trigger : 'rowSelected',
      callBack : (row)=>{
        this._single.setDataObject('activedRow', this._tableSelector, row.getData()); // 통으로 넘겨도 되지만 코드만 넘기는걸 추천
        
        LinkTables.forEach(tbInfo=>{
          tbInfo.active(tbInfo.table);
        });
      }
    })



  }

  // 타뷸레이터 row Formatter  / row EditorParams 설정 함수
  setFormatEditList(columns, fieldMappings) {
    Object.keys(fieldMappings).forEach((field) => {
      // 테이블에 fieldMappings변수와 같은 field 값을 가진 컬럼이 있는지 확인
      const column = columns.find((col) => col.field === field);
      if (column) {
        // 있으면 row의 formatter / editorParams 지정함
        column.formatter = function (cell) {
          const value = cell.getValue();
          return fieldMappings[field]?.[value] || value;
        };
        column.editorParams = { values: fieldMappings[field] || {} };
      }
    });
  }

  // 행클릭 -> 연동된 테이블 getmainList
  setLinkedTables(LinkTables){
    const linkTablesInfo = LinkTables.map(t => {
      return {
        table   : t, 
        // 메인행 활성화 -> 서브 테이블 조회
        active  : (t)=>{t.getMainList()}, 
        // 메인행 비활성화 -> 서브 테이블 초기화
        deactive: (t)=>{t.setData([])}
      }
    })
    this.setLinkedTablesCt(linkTablesInfo);
  }

  /**
   * @memberof CommonTable
   * @method setTableBuilt
   * @description 테이블 생성 후 데이터가 로드되길 원한다면 사용. 보통 사용되는 편임
   * @searchable
   */
  setTableBuilt(bool){
    
    this.putEvent({
      trigger : 'tableBuilt',
      callBack : ()=>{
        this.getMainList();
      }
    })
  }

  /**
   * @memberof CommonTable
   * @method setCellEventList
   * @description cell 이벤트 추가
   * @param {string} event - 이벤트 이름
   * @param {string} field - 이벤트 필드
   * @param {function} callBack - 이벤트 콜백
   * @searchable
   */
  setCellEventList(event, field, callBack){
    if(!this._cellEvent[event]){
      this._cellEvent[event] = []
    }
    const target = this._cellEvent[event].find(cv => cv.field === field);
    if(target){
      target.callBack = callBack;
      return true;
    }
    this._cellEvent[event].push({field, callBack});
  }

  /**
   * @memberof CommonTable
   * @method setCellMove2Page
   * @description 페이지 이동 cell 세팅
   * @param {string} field - 이벤트 필드
   * @param {string} add - 이동할 페이지 주소
   * @searchable
   */
  setCellMove2Page(field, add){
    const callBack = () => {
      location.href = add;
    };
    this.setCellEventList('click', field, callBack)
  }

  /**
   * @memberof CommonTable
   * @method setCellEvent
   * @description 셀 이벤트 등록
   * @searchable
   */
  setCellEvent(){
    // 기본 셀 이벤트 등록
    this.CommonCellEvent();
    
    // 셀클릭
    this.putEvent({
      trigger : 'cellClick',
      callBack : (e, cell)=>{
        const cField = cell.getField();
        this._cellEvent['click'].forEach(cv => {
          if( cField === cv.field) {
            cv.callBack(e,cell);
          }
        });
      }
    })

    // 셀수정
    this.putEvent({
      trigger : 'cellEdited',
      callBack : (cell)=>{
        // Validation 체크 실행
        const validationResult = this.validateCell(cell);
        
        // Validation 실패 시 경고 표시 (선택사항)
        if (!validationResult.valid) {
          // 셀 수정이 동작했을 시점에 validation 체크 통과 못했을 때. 알림을 띄워주고 싶거나 하면 여기 넣으면 됨
          // kuls_warning(validationResult.message); // 필요시 활성화
        }
        const oldValue = cell.getOldValue();
        const newValue = cell.getValue();
  
        // 값이 실제로 바뀐 경우만 처리
        if (oldValue === newValue || (!oldValue && !newValue)) {
          return; // 무시
        }
        // 셀 수정시 ROW_STATUS : U (원래 있던거)
        this.cellEdited(cell);
        // 셀 에디트 이벤트 추가
        const cField = cell.getField();
        this._cellEvent['edited'].forEach(cv => {
          if( cField === cv.field) {
            cv.callBack(cell);
          }
        })
      }
    })




    // this.putEvent({
    //   trigger : 'cellEdited',
    //   callBack : (cell)=>{
    //     // 셀 수정시 ROW_STATUS : U
    //     this.cellEdited(cell);

    //     // 셀 에디트 이벤트 추가
    //     const cField = cell.getField();
    //     this._cellEvent['edited'].forEach(cv => {
    //       if( cField === cv.field) {
    //         cv.callBack(cell);
    //       }
    //     })
    //   }
    // })
  }

  /**
   * @memberof CommonTable
   * @method CommonCellEvent
   * @description 기본 cellclick 이벤트 세팅
   * @searchable
   */
  CommonCellEvent(){

    // select 컬럼 헤더 클릭 시 전체 선택/해제
    this.putEvent({
      trigger: 'headerClick',
      callBack: (e, column) => {
        if (column.getField() === 'select') {
          const allRows = this._tblList.getRows();
          const selectedRows = allRows.filter(row => row.getData().select === 'Y');
          
          // 전체 선택 또는 전체 해제 토글
          if (selectedRows.length === allRows.length) {
            // 모든 행이 선택되어 있으면 전체 해제
            allRows.forEach(row => {
              row.getCell('select').setValue('N');
            });
          } else {
            // 일부 또는 아무것도 선택되지 않았으면 전체 선택
            allRows.forEach(row => {
              row.getCell('select').setValue('Y');
            });
          }
        }
        if(column.getField() === 'Del_Check'){
          const allRows = this._tblList.getRows();
          const selectedRows = allRows.filter(row => row.getData().Del_Check === 'Y');
          
          // 전체 선택 또는 전체 해제 토글
          if (selectedRows.length === allRows.length) {
            // 모든 행이 선택되어 있으면 전체 해제
            allRows.forEach(row => {
              row.getCell('Del_Check').setValue('N');
            });
          } else {
            // 일부 또는 아무것도 선택되지 않았으면 전체 선택
            allRows.forEach(row => {
              row.getCell('Del_Check').setValue('Y');
            });
          }
        }
      }
    });

    // select [체크박스 (다중선택 가능)]
    this.setCellEventList('click', 'select', (e,cell)=>{
      cell.setValue(cell.getValue() === "Y" ? "N" : "Y");
      if(e.shiftKey){
        this.lastCheck = cell.getRow().getPosition();

        // firstCheck 와 lastCheck 사이의 행 상태값 'Y'로 바꿔주기
        for(let i = this.firstCheck; i <= this.lastCheck; i++){
          const row = this._tblList.getRowFromPosition(i);
          if(row){
            row.getCell('select').setValue('Y');
          }
        }
      }else{
        this.firstCheck = cell.getRow().getPosition();
      }
    });

    // select [체크박스 (다중선택 불가능)]
    this.setCellEventList('click', 'radioSelect', (e,cell)=>{
      cell.setValue(cell.getValue() === "Y" ? "N" : "Y");
      const cRow = cell.getRow();

      this._tblList.getRows().forEach(row=>{
        const rval = row.getData()['radioSelect'];
        if(row !== cRow && rval === 'Y'){
          row.getCell('radioSelect').setValue('N');
        }
      })

    });

    // DEL_CHECK 삭제버튼]
    this.setCellEventList('click', 'Del_Check', (e,cell)=>{
      console.log(cell);
      if(cell.getRow().getData().ROW_STATUS === 'I'){
        console.log('삭제 버튼 클릭');
        // 저장 데이터에서 해당 행 제거
        const mainTable = this._single.findMainTable(this._tableSelector);
        this._single.delTableData(this._tableSelector, cell.getRow().getData().unicId, mainTable);
        cell.getRow().delete();
        return;
      }
      const currentValue = cell.getValue() || 'N';
      console.log(cell.getValue());
      cell.setValue(currentValue === 'Y' ? 'N' : 'Y');
    });

  }

  /**
   * @memberof CommonTable
   * @method CommonRowEvent
   * @description 기본 row 이벤트 (행 업데이트, 행 추가)
   * @searchable
   */
  CommonRowEvent(){
    // 셀수정
    this.putEvent({
      trigger : 'rowUpdated',
      callBack : (row)=>{
        const mainTable = this._single.findMainTable(this._tableSelector);
        this._single.setTableData(this._tableSelector, row.getData(),  mainTable, this.CDs);
      }
    })

  }

  /**
   * @memberof CommonTable
   * @method addRow
   * @description 행 추가
   * @param {object} data - 추가할 데이터
   * @param {function} err - 오류 처리 함수
   * @searchable
   */
  addRow(data={}, err = ()=>{}){
    if(this.loading){ return;}
    const mainTable = this._single.findMainTable(this._tableSelector);
    // console.log(mainTable);
    let addRowObj = {...data, ROW_STATUS : 'I', unicId :uniqid(), RS_CODE: undefined, RS_MSG: undefined};
    // console.log('Adding row with data:', addRowObj);
    // 메인테이블이 아닐때
    if(mainTable !== true){
      const mainActiveRow = this._single.getData('activedRow', mainTable._tableSelector)
      
      // if(mainActiveRow[mainTable.CDs] === undefined || mainActiveRow[mainTable.CDs] === null){
      //   return kuls_alert('메인 코드를 확인해주세요.');
      // }
      // 선택된 행이 없을때
      if(!mainActiveRow){
        //TODO - 운영에 올리면 주석 삭제.
        return err();
      }
      
      
      const mainCDdata = mainTable.CDs?.reduce((acc, key) => {
        acc[key] = mainActiveRow[key];
        return acc;
      }, {});

      // 선택된 행의 정보도 같이 넣어준다.
      addRowObj = {...mainCDdata, ...addRowObj };
      console.log('Adding row with data:', addRowObj);
    };
    
    
    // 행추가
    this._tblList.addRow(addRowObj,true);
    this._single.setTableData(this._tableSelector, addRowObj,  mainTable, this.CDs);

  }

  
  /**
   * @memberof CommonTable
   * @method addDownRow
   * @description 행 추가
   * @param {object} data - 추가할 데이터,밑으로 추가
   * @param {function} err - 오류 처리 함수
   * @searchable
   */
  addDownRow(data={}, err = ()=>{}){
    if(this.loading){ return;}
    const mainTable = this._single.findMainTable(this._tableSelector);
    let addRowObj = {...data, ROW_STATUS : 'I', unicId :uniqid(), RS_CODE: undefined, RS_MSG: undefined};
    // 메인테이블이 아닐때
    if(mainTable !== true){
      const mainActiveRow = this._single.getData('activedRow', mainTable._tableSelector)
      
      // 선택된 행이 없을때
      if(!mainActiveRow){
        //TODO - 운영에 올리면 주석 삭제.
        return err();
      }
      
      
      const mainCDdata = mainTable.CDs?.reduce((acc, key) => {
        acc[key] = mainActiveRow[key];
        return acc;
      }, {});

      // 선택된 행의 정보도 같이 넣어준다.
      addRowObj = {...mainCDdata, ...addRowObj };
    };
    
    
    // 행추가
    this._tblList.addRow(addRowObj).then(row=>{
      this._tblList.scrollToRow(row, 'top', true);
    });
    this._single.setTableData(this._tableSelector, addRowObj,  mainTable, this.CDs);

  }

  /**
   * @memberof CommonTable
   * @method cellEdited
   * @description 셀 수정 함수. DelCheck 셀 클릭시 삭제 상태 변경. 및 셀 값 변경 시 row 상태값 변경됨.
   * @param {object} cell - 셀 객체
   */
  cellEdited(cell){
    const row = cell.getRow();
    // const rowData = row.getData();
    // const updatedData = { [cell.getField()]: cell.getValue() };
    const noSelectableList = [this._activeCell, 'select', 'radioSelect', ...this.noEditList];
    const selectable = noSelectableList.find(cl=> cl === cell.getField());

    if(!selectable){
      if(cell.getField() === 'Del_Check'){
        const status = row.getData().ROW_STATUS === 'D' ? undefined : "D";
        row.update( { ROW_STATUS : status } );
      }
      else if(!row.getData().ROW_STATUS){
        row.update( { ROW_STATUS :'U' } )
      }
      else if(row.getData().ROW_STATUS === 'I' && row.getData().RS_CODE === false){
        this._single.updateSveData(this._tableSelector, rowData.unicId, updatedData);
      }
      //셀 수정 시 해당 행의 데이터 업데이트
      // this._single.updateSveData(this._tableSelector, rowData.unicId, updatedData);
      const mainTable = this._single.findMainTable(this._tableSelector);
      // 메인 테이블의 CDs 필드가 변경된 경우 서브 테이블 업데이트
      if(this.CDs && this.CDs.includes(cell.getField()) && mainTable === true){
        this.updateLinkedTablesMainKeys(row);
      }
    }
  }

  /**
   * @memberof CommonTable
   * @method updateLinkedTablesMainKeys
   * @description 메인 테이블의 CDs 필드 변경 시 연동된 서브 테이블의 메인키를 업데이트
   * @param {object} row - 변경된 메인 테이블의 행 객체
   */
  updateLinkedTablesMainKeys(row){
    // const mainRowData = row.getData();
    console.log(this._single.getData('LinkTables')[0].subTables);
    const subCDs = this._single.getData('LinkTables')[0].subTables[0].CDs;
    
    this._single.getData('LinkTables')[0].subTables[0]._tblList.getRows().forEach(r => {
      const mainRowData = row.getData();
      const updateData = {};
  
      // 메인 테이블의 모든 CDs를 서브 행에 업데이트
      this.CDs.forEach(key => {
        updateData[key] = mainRowData[key];
      });
  
      r.update(updateData);
    });
  }

  /**
   * @memberof CommonTable
   * @method getSelectData
   * @description 선택 데이터 가져오기
   * @returns {array} 선택 데이터
   */
  getSelectData(){
    return this._tblList.getData().filter(d=>d.select === 'Y' || d.radioSelect === 'Y');
  }
  /**
   * @memberof CommonTable
   * @method getSelectData
   * @description 선택 데이터 가져오기
   * @returns {array} 선택 데이터
   */
  getSelectRows(){
    return this._tblList.getRows().filter(d=>d.getData().select === 'Y' || d.getData().radioSelect === 'Y');
  }
  deselectRow(position){
    this._tblList.deselectRow(position);
  }
  /**
   * @memberof CommonTable
   * @method getData
   * @description 테이블 데이터 가져오기
   * @returns {array} 테이블 데이터
   */
  getData(){
    return this._tblList.getData()
  }

  /**
   * @memberof CommonTable
   * @method getActiveData
   * @description 싱글톤 객체에 존재하는 로우 데이터 가져오기
   * @returns {object} 활성화 로우 데이터
   */
  getActiveData(){
    return this._tblList.getSelectedRows().map(r=>r.getData());
  }

  /**
   * @memberof CommonTable
   * @method getActiveRows
   * @description 테이블에 존재하는 활성화 로우 가져오기
   * @returns {array} 활성화 로우 객체
   */
  getActiveRows(){
 
    return this._tblList.getSelectedRows();
  }

  /**
   * @memberof CommonTable
   * @method showLoadingOverlay
   * @description 로딩 오버레이 표시
   */
  showLoadingOverlay() {
    // 이미 오버레이가 있으면 제거
    this.hideLoadingOverlay();

    // 테이블 요소 찾기
    const tableElement = this._tblList?.element;
    if (!tableElement) return;

    // 오버레이 HTML 생성
    const overlay = document.createElement('div');
    overlay.className = 'tabulator-loading-overlay';
    overlay.innerHTML = `
      <div class="loading-spinner-container">
        <div class="loading-spinner">
          <svg class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="loading-text">데이터를 불러오는 중...</p>
      </div>
    `;

    // 스타일 추가
    const style = document.createElement('style');
    if (!document.getElementById('tabulator-loading-styles')) {
      style.id = 'tabulator-loading-styles';
      style.textContent = `
        .tabulator-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }
        .dark .tabulator-loading-overlay {
          background: rgba(31, 41, 55, 0.9);
        }
        .loading-spinner-container {
          text-align: center;
        }
        .loading-spinner {
          margin: 0 auto 1rem;
          display: flex;
          justify-content: center;
        }
        .loading-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4B5563;
          margin-top: 0.5rem;
        }
        .dark .loading-text {
          color: #D1D5DB;
        }
      `;
      document.head.appendChild(style);
    }

    // 테이블의 부모 요소에 position: relative 추가
    const tableParent = tableElement.parentElement;
    if (tableParent) {
      const currentPosition = window.getComputedStyle(tableParent).position;
      if (currentPosition === 'static') {
        tableParent.style.position = 'relative';
      }
      tableParent.appendChild(overlay);
      this.loadingOverlay = overlay;
    }
  }

  /**
   * @memberof CommonTable
   * @method hideLoadingOverlay
   * @description 로딩 오버레이 숨기기
   */
  hideLoadingOverlay() {
    if (this.loadingOverlay && this.loadingOverlay.parentNode) {
      this.loadingOverlay.parentNode.removeChild(this.loadingOverlay);
      this.loadingOverlay = null;
    }
  }

  /**
   * @memberof CommonTable
   * @method getMainList
   * @description 메인 테이블 조회
   * @returns {boolean} 조회 성공 여부
   */
  async getMainList(){
    
    this._single.setData('filterSelector', this._filterSelector)
    
    const filterData = this.setGetFilter();
    
    if(!filterData){return false;}
    
    if(this.breakPoint){
      return;
    }    
    this.breakPoint = true;
    // 메인테이블 및 활성 행
    const mainTable = this._single.findMainTable(this._tableSelector) === true ? {CDs : []} : this._single.findMainTable(this._tableSelector);
    const mainActiveRow = this._single.getData('activedRow', mainTable._tableSelector)
    
    // 필터 전처리
    const selectFilter = mainActiveRow ? mainTable.CDs?.reduce((acc, key) => {
      acc[key] = mainActiveRow[key];
      return acc;
    }, {}) : {};

    // 해당 행에 기본키의 값이 특정값으로 포함된것만 필터링하기
    const saveData = this._single.getData('saveData', this._tableSelector) || [];

    // (unicId까지 동일한)엑티브행에 해당하는 서브테이블의 행값 찾기
    let tbData = saveData.find(rd => {
      return ((JSON.stringify(rd.activeRow) === JSON.stringify(mainActiveRow)) || !rd.activeRow)
    })
    
    // unicId로 못찾을경우 CDs(기본키)로 찾기
    if(!tbData && mainTable !== true){
      tbData = saveData.find(rd=>{
        let istrue = false;
        for( let [key, value] of Object.entries(selectFilter)){
          istrue = rd.activeRow[key] === value;
          if(!istrue){break;}
        }
        return istrue;
      })
    }


    let talert = window.setTimeout(()=> {
      this.showLoadingOverlay();
      this.loading = true;
    }, 300);

    let response;
    try {
      // URL 구성
      let requestUrl = this._ajaxUrl;

      // 메인 테이블인 경우
      if(mainTable === true){
        // getMode가 있으면 URL에 추가
        if(this._getMode && this._getMode.trim() !== ''){
          requestUrl += `/${this._getMode}`;
        }
        response = await axios.get(requestUrl, {
          params: filterData  // axios params 사용
        });
      }
      // 서브 테이블인 경우
      else{
        // getMode가 있으면 선택된 메인 행의 해당 필드값을 URL에 추가
        if(this._getMode && this._getMode.trim() !== '' && selectFilter[this._getMode]){
          requestUrl += `/${selectFilter[this._getMode]}`;
        }
        response = await axios.get(requestUrl, {
          params: filterData  // axios params 사용
        });
      }

      this.breakPoint = false;
      // 데이터 합치기
      // UDATE할 행 제거 : res.data에서 this.CDs에 속한 고유키의 값이 tbData에 값과 같은 게 있다면 제외할것
      let originData = response.data || [];
      
      if(!tbData){return this.getSuccess(originData);}

      // 두 데이터를 비교해서 고유키가 같은 데이터는 삭제(수정데이터만)
      for(let tb of tbData['tdata']){
        originData = originData.filter(odata=>{
          let isSame = false;
          this.CDs.forEach(cd => {
            if((tb[cd] !== odata[cd])){
              isSame = true;
            }
          })
          return isSame;
        })
      }

      // 업데이트 및 추가할 데이터 합해주기.
      const finData = [...originData, ...tbData['tdata']];
      
      this.getSuccess(finData);
    } catch (error) {
      this.breakPoint = false;  
      const errorMessage = error.response?.data?.mesg || error.message || '데이터 조회 중 오류가 발생했습니다.';
      // kuls_alert(errorMessage);
    } finally {
      this.breakPoint = false;
      window.clearTimeout(talert);
      this.hideLoadingOverlay();
      this.loading = false;
    }

  }
    
  /**
   * @memberof CommonTable
   * @method save
   * @description 테이블 데이터를 저장하는 메서드
   * @returns {boolean} 저장 성공 여부
   * @searchable
   */
  save = async ()=>{
    if(this.breakPoint){
      return;
    }    

    this.breakPoint = true;

    let tbData = this._single.getSaveData();

    if (!tbData || Object.keys(tbData).length === 0) {
      kuls_alert('저장할 데이터가 없습니다.'); 
      this.breakPoint = false;
      return false;
    }
    //tabulator에서 validation
    const validationResult = this.validateSaveData();
    if (!validationResult.valid) {
      this.breakPoint = false;
      this.showValidationErrors(validationResult);
      return false;
    }
    //입력 폼에 error-border가 있는지 확인
    if(document.querySelector('.error-border')){
      this.breakPoint = false;
      kuls_alert('입력값을 확인해주세요.');
      return false;
    }
    // 저장 중 로딩 표시
    this.showLoadingOverlay();

    try {
      const response = await axios.post(this._ajaxUrl, {
        // mode: this._putMode,
        ...tbData
      });
      if(response.data.every(d=>d.code === true)){
        this.breakPoint = false;
        this._single.resetData('saveData');
        this.putSuccess();
        // kuls_success('저장되었습니다.')
      } else {
        this.breakPoint = false;
        this.putError(response.data);
        kuls_alert(response.data[0].message);

      }
    } catch (error) {
      this.breakPoint = false;
      const errorMessage = error.response?.data?.message || error.message || '저장 중 오류가 발생했습니다.';
      console.log(errorMessage)
      // kuls_alert(errorMessage);
    } finally {
      // 로딩 숨기기
      this.hideLoadingOverlay();
    }

  }
  /**
   * @memberof CommonTable
   * @method showValidationErrors
   * @description validation 에러 메시지를 표시하는 메서드
   * @private
   */
  showValidationErrors(validationResult) {
    let errorMsg = '<strong>다음 항목들을 확인해주세요:</strong><br/><br/>';
    let errorCount = 0;
    
    validationResult.errors.forEach((err) => {
      const rowNumber = err.rowIndex !== undefined ? err.rowIndex + 1 : 1;
      errorCount += err.errors.length;
      
      errorMsg += `<strong>${rowNumber}번째 행:</strong><br/>`;
      err.errors.forEach(e => {
        errorMsg += `&nbsp;&nbsp;• ${e.message}<br/>`;
      });
      errorMsg += '<br/>';
    });
    
    errorMsg = `<strong>총 ${errorCount}개의 입력 오류가 발견되었습니다.</strong><br/><br/>${errorMsg}`;
    errorMsg += '<span style="color: #666;">모든 필수 항목을 올바르게 입력한 후 다시 저장해주세요.</span>';
    
    kuls_alert(errorMsg);
  }

  /**
   * @memberof CommonTable
   * @method handleSaveError
   * @description 저장 에러를 처리하는 메서드
   * @private
   */
  handleSaveError(res) {
    const rows = this._tblList.getRows();
    
    for(let row of rows){
      const rowData = row.getData();
      const errData = res.data?.find(item => item.unicId === rowData.unicId);
      if(errData){
        row.update({
          RS_CODE: errData.RS_CODE,
          RS_MSG: errData.RS_MSG
        });
      }else{
        row.update({
          RS_CODE: "",
          RS_MSG: ""
        });
      }
    }
  }

  putData(){

    // 저장 시 에러처리
    this.putError = (res)=>{

      const rows = this._tblList.getRows();

      // 에러가 있는 행 업데이트
      // if (!res.data || !Array.isArray(res.data)) { return false; }

      // console.log(res)

      for(let row of rows){
        const rowData = row.getData();
        // console.log(res);
        const errData = res.find(item => item.data.unicId === rowData.unicId);
        if(errData){
          row.update({
            RS_CODE: errData.code,
            RS_MSG: errData.message
          })
          console.log(row);
        }else{
          row.update({
            RS_CODE: "",
            RS_MSG: ""
          });
        }
      }

    };
 
    this.confirmSave(this.save);
    this.breakPoint = false;
  }
  updateError(errorData) {
    const mainTable = this._single.findMainTable(this._tableSelector);
    const rows = this._tblList.getRows();
    
    for (let row of rows) {
      const rowData = row.getData();
      const errData = errorData.data.find(item => item.unicId === rowData.unicId);

      if (errData) {
        row.update({
          RS_CODE: errData.code,
          RS_MSG: errData.message
        });
      }else if(row.getData()['RS_CODE']) {
        row.update({
          RS_CODE: "",
          RS_MSG: ""
        })
      }
    }

    if(mainTable !== true){
      errorData.data.forEach(err => {
        if(err.table === this._tableSelector){
          this._single.updateSveData(this._tableSelector, err.unicId, {RS_CODE: err.RS_CODE, RS_MSG: err.RS_MSG})
        }
      })
    }
  }

  // cell click -> 공통 팝업 열기
  // Tb_MC2200.tbPop(itPopView,   'ITEM_CD',     {'ITEM_CD':'ITEM_CD', 'ITEM_NM':'ITEM_NM'} );
  tbPop(popup, field, upField, onlyIsert=false, rule = (rowdata)=>{ return false } ){
    if(field instanceof Array){
      field.forEach(f=>{
        this.setCellEventList('click', f, (e,cell)=>{
          const rowData = cell.getData();
    
          if(onlyIsert&&rowData.ROW_STATUS !== 'I'){return};
          if(rule(rowData)){return};
    
          popup.open({
            searchOpt: {},
            row : cell.getRow(),
            opt : upField,
          });
        });
      })
    }else{
      this.setCellEventList('click', field, (e,cell)=>{
        const rowData = cell.getData();
  
        if(onlyIsert&&rowData.ROW_STATUS !== 'I'){return};
        if(rule(rowData)){return};
  
        popup.open({
          searchOpt: {},
          row : cell.getRow(),
          opt : upField,
        });
      });
    }

  }

  // 첫데이터, 마지막 데이터 가져오기
  getSideData(){
    const fullData   = this.getData();
    const fullLength = fullData.length;
    this.firstData   = fullData[0];
    this.lastData    = fullData[fullLength-1];
  }
  
  // 행 이동 세팅
  // 순번 자동 변경
  setMovableRow({numField, DelCheck=false}){
    this.sortNum = numField;

    // 행 움직임추가
    this.setCtbSetting({
      movableRows: true,
      rowHeader:{headerSort:false, resizable: false, minWidth:30, width:30, rowHandle:true, formatter:"handle"}
    });

    if(DelCheck){

      // 삭제컬럼 추가
      this._fields = [...this._fields,
        { field: "Del_Check", visible: false, mutator: (value,data)=>data.Del},
        { field: "Del",       title: "삭제",     width: 40, formatter: tb_common_functions.formatterTrashIcon, frozen:true, mutateLink: ['Del_Check']}
      ];

      // DEL 삭제버튼 (삭제시에 공순을 재배치하기 위한 삭제버튼 )
      this.setCellEventList('click', 'Del', (e,cell)=>{
        const crow  = cell.getRow();
        const cData = cell.getData();
        const SEQ  = cData[numField];
        const cval = cell.getValue();
        const rows = cell.getTable().getRows();
        const cPos = cell.getRow().getPosition();

        this.getSideData();
        const firstNum = this.firstData[numField] -1;
    
        // 삭제할 행의 numFiled 값
        let cnt = Number(SEQ);
    
        let result = true;
        let newCnt = 0;
        let delCnt = 0;
        if(cell.getData().ROW_STATUS === 'I'){
          // 저장 데이터에서 해당 행 제거
          const mainTable = this._single.findMainTable(this._tableSelector);
          this._single.delTableData(this._tableSelector, cData.unicId, mainTable);
          crow.delete();
    
          result = false;
          delCnt--;
        }
    
        for(const [idx, row] of rows.entries()) {
          // 이전에 삭제한 행
          if((row !== crow) && (row.getData()['Del'] === 'Y')){
            delCnt++;
            continue;
          }
          
          // 이전 행은 무시
          if(idx < cPos-1){continue;}
          
          // 현재 행 이후부터 numFiled 재정의
          if(row === crow){
            // 현재행 (체크해제 | 체크)
            newCnt = (row.getData()['Del'] === 'Y') ? (cPos + firstNum - delCnt) : cnt;
          }else{
            let rPos = row.getPosition();
            newCnt = rPos + firstNum - delCnt;
            if(cval !== 'Y'){newCnt--;};
          }
          row.getCell(numField).setValue(newCnt);

        }
    
        return result ? cell.setValue(cval === 'Y' ? 'N' : 'Y') : result;
      });
    };

    // ROW 이동 시작
    this.putEvent({
      trigger: "rowMoving", 
      callBack: (moveRow)=>{
        // 움직이는 행 포지션 세팅
        this.beforePos = moveRow.getPosition();
        // 첫행 데이터 세팅
        this.getSideData();
      }
    });

    // ROW 이동완료 numField순서 변경
    this.putEvent({
      trigger: "rowMoved", 
      callBack: (moveRow)=>{

        if(moveRow.getData()['Del'] === 'Y'){return false};
        
        const firstNum = this.firstData[numField];
  
        let newCnt = Number(moveRow.getData()[numField]);
        const toPos = moveRow.getPosition();
        const rows = this._tblList.getRows();

        if(this.beforePos<toPos){
          // 행을 아래로 움직였을때
          for(const [idx, row] of rows.entries()) {
            // const rPos = row.getPosition();
            // if(rPos<this.beforePos || toPos<rPos){continue;}
            
            // 현재행 이전행은 무시
            // 체크행의 포지션 = idx+firstNum
            const isDel = row.getData()['Del'];
            if(idx+firstNum < newCnt){continue;}
            if(isDel === 'Y'){continue;}
            
            // 현재행 이후부터 numFiled 재정의
            row.getCell(numField).setValue(newCnt);
            newCnt++;
          }
        }else{
          // 행을 위로 움직였을때
          let delCnt = 0;
          for(const [idx, row] of rows.entries()) {

            const isDel = row.getData()['Del'];

            if(isDel === 'Y'){ delCnt++; continue; }
            if((idx+1 < toPos) || ( this.beforePos < idx )){continue;}

            newCnt = idx+firstNum-delCnt;
    
            // 현재행 이후부터 numFiled 재정의
            row.getCell(numField).setValue(newCnt);
          }
        }
      }
    })
  }

  // #region [테이블 스타일 저장]
  setTableStyler(){
    // 테이블이 초기화된 후에 TableStyler 인스턴스 생성
    this.putEvent({
      trigger: 'tableBuilding',
      callBack: () => {
        this._tableStyler = new TableStyler(this._tblList, this._tableSelector);
      }
    });
  }
  // #endregion

  // #region [조회필터 추가]
  addFilter({field, operator, value}){
    this._tblList.addFilter(field, operator, value);
  }
  // #endregion

  // #region [엔터키 이벤트]
  enterKey(attr=true){
    if(attr){
      document.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter'){
          this.getMainList();
        }
      });  
    }
  }
  // #endregion

  // #region [삭제데이터가 있는지 확인]
  isDelData(){
    const delData = this._tblList.getData().filter(d => d.Del_Check === 'Y');
    return delData.length > 0;
  }
  // #endregion
  
  // #region [저장 확인 메세지]
  confirmSave(save, isdel){
    const del = isdel ? isdel : this.isDelData()
    if(del){
      kuls_confirm('삭제', '삭제될 데이터가 선택되었습니다. 삭제하시겠습니까?', ()=>{

        kuls_confirm('저장', '저장하시겠습니까?', ()=>save());
      })
    }else{
      kuls_confirm('저장', '저장하시겠습니까?', ()=>save());
    }
  }
  // #endregion

  // #region [엑셀 양식 다운로드]
  getExcelForm(title,exceptFields,addData){
    const excludeFields = Array.isArray(exceptFields) ? exceptFields : [exceptFields];
    const fields = this._fields.filter(field => ![...excludeFields, 'USE_FLG', 'Del_Check', 'pop', 'Del'].includes(field.field));
    return daou.getExcel(title,fields,addData);
  }
  // #endregion

  // #region [엑셀 업로드]
  getExcelUpload(file,addTextFields={}) {
    if (!file || !(file instanceof Blob)) {
      console.error('유효한 파일이 아닙니다.');
      return;
    }

    const fields = this._fields;
    const reader = new FileReader();
    
    reader.onload = async (e) => { 
      const data = new Uint8Array(e.target.result);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);
      
      workbook.worksheets.forEach((worksheet) => {
        // 헤더 정보 가져오기
        const headers = [];
        worksheet.getRow(1).eachCell((cell) => {
          headers.push(cell.value);
        });
        
        // 헤더와 테이블 필드 매핑
        const fieldMapping = {};
        headers.forEach((header, index) => {
          // 테이블의 필드 중에서 title이 일치하는 필드 찾기
          const matchedField = fields.find(field => field.title === header);
          if (matchedField) {
            fieldMapping[index] = matchedField.field;
          }
        });
        
        // 데이터 행 처리
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) { // 첫 번째 행(헤더) 제외
            // 빈 행인지 확인 (매핑된 필드만 체크)
            let hasData = false;
            console.log(`Row ${rowNumber} check:`, fieldMapping);
            Object.keys(fieldMapping).forEach(excelIndex => {
              const cellValue = row.getCell(parseInt(excelIndex) + 1).value;
              console.log(`  Cell ${parseInt(excelIndex) + 1}:`, cellValue, typeof cellValue);
              if (cellValue !== null && cellValue !== undefined && String(cellValue).trim() !== '') {
                hasData = true;
              }
            });
            console.log(`Row ${rowNumber} hasData:`, hasData);

            // 빈 행이면 건너뛰기
            if (!hasData) {
              console.log(`Skipping empty row ${rowNumber}`);
              return;
            }

            const rowToAdd = {
              ROW_STATUS: 'I',
              unicId: uniqid()
            };

            // 매핑된 필드에 따라 데이터 추가
            Object.entries(fieldMapping).forEach(([excelIndex, fieldName]) => {
              let cellValue = row.getCell(parseInt(excelIndex) + 1).value;

              // 날짜 필드인 경우 YYYY-MM-DD 포맷으로 변환
              if (fieldName.includes('_DT') && cellValue instanceof Date) {
                cellValue = cellValue.getFullYear() + '-' +
                           String(cellValue.getMonth() + 1).padStart(2, '0') + '-' +
                           String(cellValue.getDate()).padStart(2, '0');
              }

              rowToAdd[fieldName] = cellValue;
            });
            if(addTextFields){
              Object.entries(addTextFields).forEach(([fieldName, value]) => {
                rowToAdd[fieldName] = value;
              });
            }
            this.addRow(rowToAdd);
          }
        });
      });
    };
    
    reader.readAsArrayBuffer(file);
  }
  // #endregion
  /**
   * @memberof CommonTable
   * @method extractValidationFromFields
   * @description fields 배열에서 validation 속성을 추출하여 _validationRules에 설정하는 메서드
   * @private
   * @searchable
   */
  extractValidationFromFields(fields = null) {
    this._validationRules = {};
    
    const fieldsToProcess = fields || this._originalFields || this._fields;
    fieldsToProcess.forEach(field => {
      if (field.validation && Array.isArray(field.validation)) {
        this._validationRules[field.field] = field.validation;
      }
    });
  }

  /**
   * @memberof CommonTable
   * @method setValidationRules
   * @description 필드별 validation 규칙을 설정하는 메서드 (기존 방식과 호환성 유지)
   * @param {object} rules - 필드별 validation 규칙 객체
   * @example
   * setValidationRules({
   *   'ITEM_CD': [
   *     { type: 'required' },
   *     { type: 'length', params: { min: 3, max: 10 } }
   *   ],
   *   'PRICE': [
   *     { type: 'required' },
   *     { type: 'number', params: { min: 0 } }
   *   ]
   * })
   * @searchable
   */
  setValidationRules(rules) {
    this._validationRules = { ...this._validationRules, ...rules };
  }

  /**
   * @memberof CommonTable
   * @method setFieldValidation
   * @description 특정 필드의 validation 규칙을 설정하는 메서드
   * @param {string} field - 필드명
   * @param {array} rules - validation 규칙 배열
   * @searchable
   */
  setFieldValidation(field, rules) {
    this._validationRules[field] = rules;
  }

  /**
   * @memberof CommonTable
   * @method validateCell
   * @description 특정 셀의 validation을 체크하는 메서드
   * @param {object} cell - 셀 객체
   * @returns {object} validation 결과
   * @searchable
   */
  validateCell(cell) {
    const field = cell.getField();
    const rules = this._validationRules[field];
    
    if (!rules) {
      return { valid: true };
    }

    const result = daou.validateCell(cell, rules);
    
    // 안전한 행 번호 가져오기
    let rowIndex = 0;
    try {
      const row = cell.getRow();
      const tableIndex = row.getIndex();
      if (tableIndex !== undefined && !isNaN(tableIndex)) {
        rowIndex = tableIndex;
      } else {
        // 대안: 테이블에서 행의 위치 찾기
        const allRows = this._tblList.getRows();
        rowIndex = allRows.indexOf(row);
        if (rowIndex === -1) rowIndex = 0;
      }
    } catch (e) {
      rowIndex = 0;
    }
    
    const cellKey = `${rowIndex}-${field}`;
    
    if (!result.valid) {
      this._validationErrors.set(cellKey, result.message);
      daou.applyValidationError(cell, result.message);
    } else {
      this._validationErrors.delete(cellKey);
      daou.removeValidationError(cell);
    }
    
    return result;
  }

  /**
   * @memberof CommonTable
   * @method validateRow
   * @description 특정 행의 모든 셀에 대해 validation을 체크하는 메서드
   * @param {object} row - 행 객체
   * @returns {object} validation 결과
   * @searchable
   */
  validateRow(row) {
    const errors = [];
    
    Object.keys(this._validationRules).forEach(field => {
      const cell = row.getCell(field);
      if (cell) {
        const result = this.validateCell(cell);
        if (!result.valid) {
          errors.push({ field, message: result.message });
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * @memberof CommonTable
   * @method validateTable
   * @description 전체 테이블의 validation을 체크하는 메서드
   * @returns {object} validation 결과
   * @searchable
   */
  validateTable() {
    const allErrors = [];
    
    this._tblList.getRows().forEach((row, index) => {
      const rowResult = this.validateRow(row);
      if (!rowResult.valid) {
        // row.getIndex()가 NaN을 반환할 수 있으므로 안전한 방법 사용
        let rowIndex = index;
        try {
          const tableIndex = row.getIndex();
          if (tableIndex !== undefined && !isNaN(tableIndex)) {
            rowIndex = tableIndex;
          }
        } catch (e) {
          // row.getIndex() 실패 시 forEach의 index 사용
          rowIndex = index;
        }
        
        allErrors.push({
          rowIndex: rowIndex,
          errors: rowResult.errors,
          rowData: row.getData() // 디버깅용 데이터 추가
        });
      }
    });
    
    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * @memberof CommonTable
   * @method validateSaveData
   * @description 저장될 데이터만 validation을 체크하는 메서드 (ROW_STATUS가 있는 행들만)
   * @returns {object} validation 결과
   * @searchable
   */
  validateSaveData() {
    const allErrors = [];
    
    // 저장될 데이터 가져오기
    const saveData = this._single.getSaveData();
    const currentTableData = saveData[this._tableSelector] || [];
    
    // 현재 테이블의 모든 행 중에서 저장될 행들 찾기
    this._tblList.getRows().forEach((row, index) => {
      const rowData = row.getData();
      
      // ROW_STATUS가 있는 행들만 (저장될 데이터)
      if (!rowData.ROW_STATUS && rowData.ROW_STATUS == 'D') {
        return;
      }
      
      // 실제로 저장될 데이터인지 확인
      const willBeSaved = currentTableData.some(saveRow => 
        saveRow.unicId === rowData.unicId
      );
      
      if (!willBeSaved) {
        return;
      }
      
      // validation 체크
      const rowResult = this.validateRow(row);
      if (!rowResult.valid) {
        let rowIndex = index;
        try {
          const tableIndex = row.getIndex();
          if (tableIndex !== undefined && !isNaN(tableIndex)) {
            rowIndex = tableIndex;
          }
        } catch (e) {
          rowIndex = index;
        }
        
        allErrors.push({
          rowIndex: rowIndex,
          errors: rowResult.errors,
          rowData: rowData
        });
      }
    });
    
    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * @memberof CommonTable
   * @method clearValidationErrors
   * @description 모든 validation 에러를 제거하는 메서드
   * @searchable
   */
  clearValidationErrors() {
    this._validationErrors.clear();
    
    this._tblList.getRows().forEach(row => {
      Object.keys(this._validationRules).forEach(field => {
        const cell = row.getCell(field);
        if (cell) {
          daou.removeValidationError(cell);
        }
      });
    });
  }

  /**
   * @memberof CommonTable
   * @method getValidationErrors
   * @description 현재 validation 에러들을 반환하는 메서드
   * @returns {Map} validation 에러 맵
   * @searchable
   */
  getValidationErrors() {
    return this._validationErrors;
  }

  /**
   * @memberof CommonTable
   * @method hasValidationErrors
   * @description validation 에러가 있는지 확인하는 메서드
   * @returns {boolean} 에러 존재 여부
   * @searchable
   */
  hasValidationErrors() {
    return this._validationErrors.size > 0;
  }

  /**
   * @memberof CommonTable
   * @method restoreValidationStyles
   * @description clipboard/rangeSelection 작업 후 validation 스타일을 복원하는 메서드
   * @searchable
   */
  restoreValidationStyles() {
    if (this._validationErrors.size === 0) return;

    // 에러 맵 정리를 위한 배열
    const keysToDelete = [];

    this._validationErrors.forEach((message, cellKey) => {
      const [rowIndexStr, fieldName] = cellKey.split('-');
      const rowIndex = parseInt(rowIndexStr);
      
      if (isNaN(rowIndex)) {
        keysToDelete.push(cellKey);
        return;
      }

      try {
        // 여러 방법으로 행 찾기 시도
        let row = null;
        
        // 방법 1: getRow로 직접 찾기
        try {
          row = this._tblList.getRow(rowIndex);
        } catch (e) {
          // getRow 실패 시 방법 2: 모든 행에서 찾기
          const allRows = this._tblList.getRows();
          row = allRows[rowIndex];
        }

        if (row) {
          const cell = row.getCell(fieldName);
          if (cell) {
            // validation 에러 스타일 다시 적용
            daou.applyValidationError(cell, message);
          } else {
            keysToDelete.push(cellKey);
          }
        } else {
          keysToDelete.push(cellKey);
        }
      } catch (error) {
        // 행이 삭제되었거나 존재하지 않는 경우 에러 맵에서 제거 예정
        keysToDelete.push(cellKey);
      }
    });

    // 유효하지 않은 키들 제거
    keysToDelete.forEach(key => {
      this._validationErrors.delete(key);
    });
  }
  
}