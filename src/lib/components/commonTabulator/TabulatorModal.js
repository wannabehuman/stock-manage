/**
 * @ Overview: CommonTable 기반 Tabulator 모달 컴포넌트
 * @ History: 2025-10-25 / Claude / CommonTable 상속으로 리팩토링
 */

import { CommonTable } from './commonTable.js';

export class TabulatorModal extends CommonTable {
  constructor(options = {}) {
    super();

    // 모달 고유 속성
    this.modalId = options.modalId || `tabulatorModal_${Date.now()}`;
    this.title = options.title || '데이터 관리';
    this.subtitle = options.subtitle || '';
    this.width = options.width || '1400px';
    this.tableHeight = options.tableHeight || '500px';
    this.placeholder = options.placeholder || '데이터가 없습니다.';

    // 버튼 설정
    this.showAddButton = options.showAddButton !== false;
    this.showSaveButton = options.showSaveButton !== false;
    this.addButtonText = options.addButtonText || '+ 행 추가';
    this.saveButtonText = options.saveButtonText || '💾 저장';

    // 콜백 함수
    this.onAddRow = options.onAddRow || null;
    this.onClose = options.onClose || null;

    // 모달 DOM 참조
    this.modal = null;

    // CommonTable 설정
    this.setFields(options.columns || []);
    this.setTbSelectorId(`${this.modalId}_table`);
    this.setTableName(options.title || '모달 테이블');

    // Tabulator 설정
    this.setCtbSetting({
      height: this.tableHeight,
      layout: "fitDataStretch",
      placeholder: this.placeholder,
      data: options.data || []
    });

    // AJAX URL 설정 (옵션으로 제공 가능)
    if (options.ajaxUrl) {
      this.setAjaxUrl(options.ajaxUrl);
    }

    // 필터 데이터 설정 (특정 품목만 조회하기 위함)
    this.modalFilterData = options.filterData || null;

    // 저장 성공 시 콜백 오버라이드 (모달을 닫지 않고 데이터만 리프레시)
    this.putSuccess = () => {
      this._single.resetData('saveData');
      alert('저장되었습니다.');
      // 모달은 닫지 않고 데이터 리프레시 (필요시 getMainList 호출)
      if (options.refreshOnSave !== false) {
        this.getMainList();
      }
      // 부모 콜백 호출 (재고현황 테이블 리프레시 등)
      if (options.onSaveSuccess) {
        options.onSaveSuccess();
      }
    };
  }

  /**
   * 필터 데이터 반환 (CommonTable의 setGetFilter 오버라이드)
   * 모달 전용 필터가 있으면 우선 사용
   */
  setGetFilter() {
    // 모달 전용 필터가 있으면 사용
    if (this.modalFilterData) {
      return this.modalFilterData;
    }

    // 없으면 부모 클래스의 기본 동작 수행
    const filterSelector = this._single.getData('filterSelector');
    let validate = true;
    if (filterSelector) {
      document.querySelectorAll(filterSelector).forEach(d => {
        this._filterData[d.dataset.name] = d.value;
      });
      validate = this.dateChecker();
    }
    return validate ? this._filterData : false;
  }

  /**
   * 모달 HTML 생성
   */
  _createModalHTML() {
    return `
      <div id="${this.modalId}" class="fixed inset-0 z-50 flex items-center justify-center" style="background-color: rgba(0,0,0,0.5);">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl" style="width: ${this.width}; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column;">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${this.title}</h3>
                ${this.subtitle ? `<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">${this.subtitle}</p>` : ''}
              </div>
              <button id="${this.modalId}_close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-auto p-6" style="min-height: 0;">
            <div class="mb-4 flex justify-between items-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                ✏️ 행을 추가하고 정보를 입력한 후 저장 버튼을 클릭하세요.
              </p>
              <div class="flex gap-2">
                ${this.showAddButton ? `<button id="${this.modalId}_addRow" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">${this.addButtonText}</button>` : ''}
                ${this.showSaveButton ? `<button id="${this.modalId}_save" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">${this.saveButtonText}</button>` : ''}
              </div>
            </div>
            <div id="${this.modalId}_table"></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 모달 열기
   */
  async open() {
    // 이미 열려있으면 무시
    if (document.getElementById(this.modalId)) {
      return;
    }

    // 모달 HTML 추가
    document.body.insertAdjacentHTML('beforeend', this._createModalHTML());
    this.modal = document.getElementById(this.modalId);

    // 닫기 버튼 이벤트
    const closeBtn = document.getElementById(`${this.modalId}_close`);
    closeBtn.addEventListener('click', () => this.close());

    // 모달 배경 클릭 시 닫기
    this.modal.addEventListener('click', (e) => {
      if (e.target.id === this.modalId) {
        this.close();
      }
    });

    // DOM 렌더링 대기
    await new Promise(resolve => setTimeout(resolve, 50));

    // CommonTable의 init() 메서드로 테이블 생성
    this.setTableBuilt(); // 테이블 자동 빌드 활성화
    this.init();

    // 데이터 자동 로드 (ajaxUrl이 설정되어 있으면)
    if (this._ajaxUrl && this._ajaxUrl !== './index.ajax.php') {
      this.getMainList();
    }

    // 행 추가 버튼 이벤트
    if (this.showAddButton) {
      const addBtn = document.getElementById(`${this.modalId}_addRow`);
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          if (this.onAddRow) {
            // 커스텀 콜백이 있으면 사용 (table, modalInstance 전달)
            this.onAddRow(this._tblList, this);
          } else {
            // 기본 동작: CommonTable의 addRow 사용
            this.addRow();
          }
        });
      }
    }

    // 저장 버튼 이벤트
    if (this.showSaveButton) {
      const saveBtn = document.getElementById(`${this.modalId}_save`);
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          // CommonTable의 saveData 메서드 사용
          this.saveData();
        });
      }
    }

    return this._tblList;
  }

  /**
   * 저장 메서드 (CommonTable의 putData 호출)
   */
  saveData() {
    this.putData();
  }

  /**
   * 모달 닫기
   */
  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      this._tblList = null;
    }

    if (this.onClose) {
      this.onClose();
    }
  }

  /**
   * 테이블 인스턴스 반환
   */
  getTable() {
    return this._tblList;
  }

  /**
   * 데이터 가져오기
   */
  getData() {
    return this._tblList ? this._tblList.getData() : [];
  }

  /**
   * 데이터 설정
   */
  setData(data) {
    if (this._tblList) {
      this._tblList.setData(data);
    }
  }
}
