/**
 * @ Overview: CommonTable을 상속받는 팝업(모달) 테이블 클래스
 * @ History: 2025-01-02 / Claude / CommonTable 기반 모달 테이블 클래스 생성
 */

import { CommonTable } from './commonTable.js';

export class CommonPop extends CommonTable {
  constructor() {
    super();
    console.log('CommonPop constructor called');
    
    // 모달 관련 설정
    this.modalSettings = {
      title: '팝업 테이블',
      size: 'xl', // xs, sm, md, lg, xl
      showSearch: true,
      showPagination: true,
      selectionMode: 'single', // single, multiple, none
      maxHeight: '500px'
    };
    
    // 선택된 데이터
    this.selectedData = null;
    this.selectedRows = [];
    
    // 콜백 함수들
    this.onSelect = null;
    this.onConfirm = null;
    this.onCancel = null;
    
    // 검색 관련
    this.searchTerm = '';
    this.searchFields = []; // 검색할 필드 목록
    
    // 페이지네이션
    this.currentPage = 1;
    this.pageSize = 10;
    this.totalCount = 0;
  }

  /**
   * 모달 설정을 업데이트하는 메서드
   */
  setModalSettings(settings) {
    this.modalSettings = { ...this.modalSettings, ...settings };
  }

  /**
   * 선택 모드 설정
   */
  setSelectionMode(mode) {
    this.modalSettings.selectionMode = mode;
    
    // 테이블 설정 업데이트
    if (this._tabulator) {
      if (mode === 'multiple') {
        this._tabulator.setData(this._tabulator.getData().map(row => ({
          ...row,
          _selected: false
        })));
      }
    }
  }

  /**
   * 검색 필드 설정
   */
  setSearchFields(fields) {
    this.searchFields = fields;
  }

  /**
   * 검색 실행
   */
  performSearch(term) {
    this.searchTerm = term;
    
    if (!term || !this.searchFields.length) {
      this.clearSearch();
      return;
    }

    // 클라이언트 사이드 검색
    if (this._tabulator) {
      this._tabulator.setFilter((data) => {
        return this.searchFields.some(field => {
          const value = data[field];
          return value && value.toString().toLowerCase().includes(term.toLowerCase());
        });
      });
    }
  }

  /**
   * 검색 초기화
   */
  clearSearch() {
    this.searchTerm = '';
    if (this._tabulator) {
      this._tabulator.clearFilter();
    }
  }

  /**
   * 행 선택 처리
   */
  selectRow(row) {
    const rowData = row.getData();
    
    if (this.modalSettings.selectionMode === 'single') {
      // 단일 선택
      this.selectedData = rowData;
      this.selectedRows = [row];
      
      // 다른 행들의 선택 해제
      this._tabulator.getRows().forEach(r => {
        if (r !== row) {
          r.deselect();
        }
      });
      
      row.select();
      
    } else if (this.modalSettings.selectionMode === 'multiple') {
      // 다중 선택
      const isSelected = this.selectedRows.includes(row);
      
      if (isSelected) {
        // 선택 해제
        this.selectedRows = this.selectedRows.filter(r => r !== row);
        row.deselect();
      } else {
        // 선택 추가
        this.selectedRows.push(row);
        row.select();
      }
      
      this.selectedData = this.selectedRows.map(r => r.getData());
    }

    // 선택 콜백 실행
    if (this.onSelect) {
      this.onSelect(this.selectedData, this.selectedRows);
    }
  }

  /**
   * 선택 초기화
   */
  clearSelection() {
    this.selectedData = null;
    this.selectedRows = [];
    
    if (this._tabulator) {
      this._tabulator.deselectRow();
    }
  }

  /**
   * 확인 버튼 클릭 처리
   */
  confirm() {
    if (this.onConfirm) {
      this.onConfirm(this.selectedData, this.selectedRows);
    }
  }

  /**
   * 취소 버튼 클릭 처리
   */
  cancel() {
    this.clearSelection();
    if (this.onCancel) {
      this.onCancel();
    }
  }

  /**
   * 더블클릭으로 즉시 선택
   */
  onRowDoubleClick(row) {
    this.selectRow(row);
    this.confirm();
  }

  /**
   * 테이블 초기화 오버라이드
   */
  async init() {
    // 모달용 테이블 설정 추가
    const modalTableSettings = {
      height: this.modalSettings.maxHeight,
      layout: "fitColumns",
      pagination: this.modalSettings.showPagination,
      paginationSize: this.pageSize,
      paginationSizeSelector: [5, 10, 20, 50],
      selectable: this.modalSettings.selectionMode !== 'none',
      selectableRangeMode: this.modalSettings.selectionMode === 'multiple' ? 'click' : false,
      responsiveLayout: "hide",
      placeholder: "데이터가 없습니다.",
    };

    // 기존 설정과 병합
    this.setCtbSetting(modalTableSettings);

    // 부모 클래스의 init 호출
    await super.init();

    // 행 클릭 이벤트 설정
    if (this._tabulator) {
      this._tabulator.on("rowClick", (e, row) => {
        if (this.modalSettings.selectionMode !== 'none') {
          this.selectRow(row);
        }
      });

      this._tabulator.on("rowDblClick", (e, row) => {
        if (this.modalSettings.selectionMode !== 'none') {
          this.onRowDoubleClick(row);
        }
      });
    }

    console.log('CommonPop table initialized');
  }

  /**
   * 페이지 변경
   */
  setPage(page) {
    this.currentPage = page;
    if (this._tabulator) {
      this._tabulator.setPage(page);
    }
  }

  /**
   * 페이지 크기 변경
   */
  setPageSize(size) {
    this.pageSize = size;
    if (this._tabulator) {
      this._tabulator.setPageSize(size);
    }
  }

  /**
   * 데이터 설정 오버라이드
   */
  setData(data) {
    // 선택 모드가 multiple인 경우 _selected 필드 추가
    if (this.modalSettings.selectionMode === 'multiple') {
      data = data.map(row => ({
        ...row,
        _selected: false
      }));
    }

    if (this._tabulator) {
      this._tabulator.setData(data);
    }
    
    this.totalCount = data.length;
  }

  /**
   * 콜백 함수 설정
   */
  setCallbacks({ onSelect, onConfirm, onCancel }) {
    if (onSelect) this.onSelect = onSelect;
    if (onConfirm) this.onConfirm = onConfirm;
    if (onCancel) this.onCancel = onCancel;
  }

  /**
   * 모달 타이틀 설정
   */
  setTitle(title) {
    this.modalSettings.title = title;
  }

  /**
   * 선택된 데이터 반환
   */
  getSelectedData() {
    return this.selectedData;
  }

  /**
   * 선택된 행들 반환
   */
  getSelectedRows() {
    return this.selectedRows;
  }

  /**
   * 검색어 반환
   */
  getSearchTerm() {
    return this.searchTerm;
  }

  /**
   * 현재 페이지 정보 반환
   */
  getPageInfo() {
    return {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalCount: this.totalCount,
      totalPages: Math.ceil(this.totalCount / this.pageSize)
    };
  }
}