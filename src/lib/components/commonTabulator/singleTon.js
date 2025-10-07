/**
 * SingleTon 클래스 - 테이블 상태 관리용 싱글톤 패턴 구현
 * 
 * 주요 기능:
 * - 페이지 전역에서 테이블 데이터 상태 공유
 * - 메인/서브 테이블 간 연동 관리
 * - 테이블 수정/추가 데이터 임시 저장
 * - 활성화된 행(activeRow) 상태 관리
 */
export class SingleTon {
    /**
     * 프라이빗 데이터 저장소
     * @private
     * @type {Object}
     */
    #data;
  
    /**
     * SingleTon 생성자
     * 이미 인스턴스가 존재하면 기존 인스턴스 반환 (싱글톤 패턴)
     */
    constructor() {
      this.#data = {};
  
      if (SingleTon.instance) {
        return SingleTon.instance;
      }
      SingleTon.instance = this;
    }
  
    /**
     * SingleTon 인스턴스 가져오기 (정적 메서드)
     * @returns {SingleTon} SingleTon 인스턴스
     */
    static getInstance(){
  
      if (!SingleTon.instance) {
        SingleTon.instance = new SingleTon();
      }
      return SingleTon.instance;
    }
  
    /**
     * 기본 데이터 설정
     * @param {string} field - 데이터 필드명
     * @param {*} value - 설정할 값
     */
    setData(field, value){
      this.#data[field] = value;
    }
    
  
  // #region [데이터 세터]
  
    /**
     * 객체 형태의 데이터 설정
     * 구조: {field : {subField : [], subField : [], subField : [] }}
     * @param {string} field - 메인 필드명
     * @param {string} subField - 서브 필드명
     * @param {*} value - 설정할 값
     */
    setDataObject(field, subField, value){
      if(!this.#data[field]){
        this.#data[field] = {};
      }
      this.#data[field][subField] = value;
    }
  
    /**
     * 배열 형태의 데이터 설정
     * 구조: {field : []}
     * @param {string} field - 필드명
     * @param {*} value - 배열에 추가할 값
     */
    setDataList(field, value){
      if(!this.#data[field]){
        this.#data[field] = [];
      }
      this.#data[field].push(value);
    }
  
    /**
     * 테이블 간 연동 관계 설정
     * 구조: {LinkTables : [{mainTable: table1, subTables : []}, {mainTable: table2, subTables : []} ]}
     * @param {Object} table - 메인 테이블 객체
     * @param {Object} value - 연동될 서브 테이블 객체
     */
    setLinkTable(table, value){
      if(!this.#data['LinkTables']){
        this.#data['LinkTables'] = [];
        this.#data['LinkTables'] = [];
      }
      // 이미 링크된 메인테이블이 있으면 해당 객체의 subTables에 추가, 없으면 새로 생성
      const mainTable = this.#data['LinkTables'].find(lt => lt.mainTable === table)
      if(mainTable?.subTables.find(st => st === value)){
        return; // 이미 연동된 경우 종료
      }
  
      if(mainTable){
        mainTable.subTables.push(value) // 기존 메인테이블에 서브테이블 추가
      }else{
        this.#data['LinkTables'].push({'mainTable' : table, 'subTables' : [value]}) // 새로운 연동 관계 생성
      }
  
    }
  
    /**
     * 두 객체의 고유 키(CDs) 비교
     * @param {Object} obj1 - 비교할 첫 번째 객체
     * @param {Object} obj2 - 비교할 두 번째 객체
     * @param {Array} CDs - 비교할 고유 키 배열
     * @returns {boolean} 모든 고유 키가 일치하면 true, 하나라도 다르면 false
     */
    compareCD(obj1, obj2, CDs){
      let isSame = false;
      for(let cd of CDs){
        if(obj1[cd] === obj2[cd]){
          isSame = true
        }else{
          isSame = false;
          break;
        }
      }
      return isSame;
    }
  
    /**
     * 테이블별 수정/추가 데이터 저장 (가장 중요한 메서드)
     * 데이터 구조: {saveData : {tableSelector : [{activeRow : _row, tdata : [_row, _row, _row]}, ...]}}
     * 
     * @param {string} tableSelector - 테이블 셀렉터 ID
     * @param {Object} row - 저장할 행 데이터
     * @param {Object} mainTable - 메인 테이블 객체
     * @param {Array} CDs - 고유 키 배열
     */
    setTableData(tableSelector, row, mainTable, CDs){
  
      // saveData 초기화
      if(!this.#data['saveData']){
        this.#data['saveData'] = {};
      };
      if(!this.#data['saveData'][tableSelector]){
        this.#data['saveData'][tableSelector] = [];
      };
  
      // 메인 테이블 셀렉터 결정
      let mainTableSelector = mainTable._tableSelector;
      if(mainTableSelector === undefined){
        mainTableSelector = true;
      }
      
      // 현재 또는 마지막에 선택된 메인 테이블 행
      const activeRow = this.getData('activedRow', mainTableSelector);
  
      // 현재 선택된 메인 행에 대응하는 저장 데이터 찾기
      const targetData = this.#data['saveData'][tableSelector].find(d => {
        // 메인테이블은 activeRow가 없으므로 false 반환
        if(!d.activeRow){
          return false;
        }
  
        // unicId로 비교 또는 고유 키로 비교
        if(activeRow.unicId){
          return d.activeRow.unicId === activeRow.unicId;
        }
  
        return this.compareCD(d.activeRow, activeRow, mainTable.CDs);
      });
  
      // 이미 선택된 메인 행에 대한 데이터가 있는 경우
      if(targetData){
        if(!targetData['tdata']){
          targetData['tdata'] = [];
        }
  
        // 동일한 데이터가 이미 있는지 확인
        const isExist = targetData['tdata'].find(v=> {
          if(row.unicId){
            return row.unicId === v.unicId;
          }else{
            return this.compareCD(v, row, CDs)
          }
        } )
  
        // 중복되지 않은 경우에만 추가
        if(!isExist){
          targetData.tdata.push(row);
        }
  
  
      }else{
        // 처음 선택된 메인 행이거나 메인테이블 데이터인 경우
        if(activeRow){
          // 서브 테이블 데이터인 경우
          this.#data['saveData'][tableSelector].push({activeRow, 'tdata' : [row]});
        }else{
          // 메인테이블 데이터인 경우
          if(this.#data['saveData'][tableSelector].length > 0){
            // 기존 데이터가 있는 경우 중복 검사 후 추가
            const isExist = this.#data['saveData'][tableSelector][0]['tdata'].find(td => {
              if(row.unicId){
                return row.unicId === td.unicId;
              }else{
                return this.compareCD(td, row, CDs);
              }
            });
  
            if(!isExist){
              this.#data['saveData'][tableSelector][0]['tdata'].push(row)
            }
          }else{
            // 처음 데이터인 경우
            this.#data['saveData'][tableSelector].push({'tdata' : [row]})
          }
        }
      }
    }
    /**
     * 테이블 데이터 삭제
     * @param {string} tableSelector - 테이블 셀렉터 ID
     * @param {string} unicId - 삭제할 행의 고유 ID
     * @param {Object} mainTable - 메인 테이블 객체
     */
    delTableData(tableSelector, unicId, mainTable){
      console.log(tableSelector, unicId, mainTable)
      const targetData = this.#data['saveData'][tableSelector]
      targetData.forEach(td => {
        td.tdata = td.tdata.filter(r => r.unicId !== unicId)
      })
    }
    
    /**
     * 저장 데이터 업데이트
     * @param {string} tableSelector - 테이블 셀렉터 ID
     * @param {string} unicId - 업데이트할 행의 고유 ID
     * @param {Object} updateData - 업데이트할 데이터
     */
    updateSveData(tableSelector, unicId, updateData){
      const targetData = this.#data['saveData'][tableSelector];
      targetData.forEach(t => {
  
        t.tdata = t.tdata.map(td => {
          return td.unicId === unicId ? {...td, ...updateData} : td
        });
  
      })
  
    }
  
    /**
     * 소스 테이블 등록
     * @param {Object} table - 등록할 테이블 객체
     */
    setSourceTable(table){
      this.setDataList('SourceTable', table);
      this.setDataList('SourceTable', table);
    }
  
  // #endregion
  
  // #region [데이터 게터]
  
    /**
     * 수정/추가된 데이터 조회 (가장 많이 사용되는 메서드)
     * 데이터 구조: {saveData : {tableSelector : [{activeRow : _row, tdata : [_row, _row, _row]}, ...]}}
     * 
     * @param {string} tableSelector - 테이블 셀렉터 ID (선택적)
     * @param {string} mainTableSelector - 메인 테이블 셀렉터 ID (선택적)
     * @returns {Array|Object} tableSelector가 있으면 해당 테이블 데이터 배열, 없으면 전체 데이터 객체
     */
    getSaveData(tableSelector, mainTableSelector){
      
      if(tableSelector){
        // 특정 테이블의 데이터만 조회
        if(!this.#data['saveData']){
          return [];
        }
        if(!this.#data['saveData'][tableSelector]){
          return false;
        }
        
        // 메인테이블에서 현재 선택된 행
        const activeRow = this.getData('activedRow', mainTableSelector);
  
        // 선택된 메인 행에 대응하는 서브 테이블 데이터 배열
        const saveData = this.#data['saveData'][tableSelector].find(rd => rd.activeRow === activeRow)?.tdata || [];
        
        return saveData;
  
      }else{
        // 모든 테이블의 데이터 조회 (저장 시 사용)
  
        if(!this.#data['saveData']){
          return {};
        }
  
        const saveData = this.#data['saveData'];
        const result = {};
        
        // 테이블별로 데이터 가공
        Object.keys(saveData).forEach(table => {
          result[table] = [];
          const mainTable = this.findMainTable(table);
          const mainCds = mainTable.CDs;
          
          // 각 테이블의 데이터를 전개하여 저장 가능한 형태로 변환
          (saveData[table]??[]).forEach(tr => {
            tr.tdata.forEach(t=> {
              if(t.ROW_STATUS){ // 수정/추가/삭제 상태인 데이터만 처리
                let pushActive = {};
                // 메인 테이블의 고유 키 값들을 복사
                (mainCds??[]).forEach(cd => {
                  pushActive[cd] = tr.activeRow[cd];
                })
                // 메인 테이블 키 + 서브 테이블 데이터 병합
                result[table].push({...pushActive, ...t});
              }
            })
          } )
        });
  
        return result;
      }
      
    }
  
    /**
     * 일반 데이터 조회
     * @param {string} field - 조회할 메인 필드명 (선택적)
     * @param {string} subField - 조회할 서브 필드명 (선택적)
     * @returns {*} field가 없으면 전체 데이터, subField가 없으면 해당 필드 데이터, 둘 다 있으면 서브 필드 데이터
     */
    getData(field, subField){
  
      if(!field){
        return this.#data; // 전체 데이터 반환
      }
      if(!this.#data[field]){
        return undefined; // 해당 필드 없음
      }
      if(!subField){
        return this.#data[field]; // 메인 필드 데이터 반환
      }
      return this.#data[field][subField]; // 서브 필드 데이터 반환
    }
  
  // #endregion
  
  // #region [데이터 필터]
  
    /**
     * 연동된 테이블들 중에서 메인 테이블 찾기
     * @param {string} value - 서브 테이블의 tableSelector
     * @returns {Object|boolean} 메인 테이블 객체 또는 링크되지 않은 경우 true
     */
    findMainTable(value) {
      // 링크된 테이블 목록 조회
      const sTable = this.#data['LinkTables'] ? this.#data['LinkTables'] : [];
  
      // 주어진 서브 테이블을 포함하는 메인 테이블 찾기
      const mainTable = sTable.find(td => {
        return td.subTables.find(std => std._tableSelector === value)
      })
  
      // 링크 관계가 없으면 단독 테이블이므로 true 반환
      if (!mainTable) {
        return true;
      }
      
      return mainTable.mainTable;
      return mainTable.mainTable;
    }
  // #endregion
  
  // #region [데이터 초기화]
    /**
     * 데이터 초기화
     * @param {string} field - 초기화할 메인 필드명 (선택적)
     * @param {string} subField - 초기화할 서브 필드명 (선택적)
     * @returns {Object|undefined} 초기화된 데이터
     */
    resetData(field, subField){
      if(!field){
        return this.#data = {}; // 전체 데이터 초기화
      }
      if(field && this.#data[field]){
  
        if(subField){
          return this.#data[field][subField] = undefined; // 서브 필드 초기화
        }
        
        return this.#data[field] = undefined; // 메인 필드 초기화
      }
  
    }
  
    /**
     * 소스 테이블 삭제
     * @param {Object} table - 삭제할 테이블 객체
     */
    delSourceTable(table){
      this.#data['SourceTable'] = this.#data['SourceTable'].filter(t=> t !== table);
    }
  // #endregion
  }