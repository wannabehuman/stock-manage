/**
 * Tabulator용 기초코드 Select Editor 모듈
 * 기초코드 그룹(GRP_CODE)별 상세코드를 select box로 표시
 */

// 코드 데이터 캐시
const codeCache = {};

/**
 * 기초코드 조회 (캐시 사용)
 * @param {string} grpCode - 그룹코드 (예: HERBAR_KIND, UNIT)
 * @returns {Promise<Array>} 코드 목록
 */
async function fetchCodeData(grpCode) {
  // 캐시에 있으면 캐시 반환
  if (codeCache[grpCode]) {
    return codeCache[grpCode];
  }

  try {
    const response = await fetch(`/api/code-detail/${grpCode}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch code data for ${grpCode}`);
    }

    const data = await response.json();

    // 활성화된 코드만 필터링
    const activeCodes = data.filter(item => item.is_active !== false);

    // 캐시에 저장
    codeCache[grpCode] = activeCodes;

    return activeCodes;
  } catch (error) {
    console.error('Error fetching code data:', error);
    return [];
  }
}

/**
 * 기초코드 Select Editor 생성 함수 (Tabulator 기본 드롭다운 사용)
 * @param {string} grpCode - 그룹코드 (예: HERBER_KIND, UNIT)
 * @returns {Function} Tabulator editor 함수
 */
export function createCodeEditor(grpCode) {
  return function(cell, onRendered, success, cancel, editorParams) {
    // Select 엘리먼트 생성
    const select = document.createElement('select');
    select.style.width = '100%';
    select.style.padding = '4px';
    select.style.boxSizing = 'border-box';

    // 현재 값
    const currentValue = cell.getValue();

    // 빈 옵션 추가
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.text = '선택하세요';
    select.appendChild(emptyOption);

    // 캐시에 데이터가 있으면 즉시 사용
    if (codeCache[grpCode]) {
      codeCache[grpCode].forEach(code => {
        const option = document.createElement('option');
        option.value = code.code;
        option.text = code.code_name; // 코드명만 표시

        if (code.code === currentValue) {
          option.selected = true;
        }

        select.appendChild(option);
      });
    } else {
      // 로딩 옵션 추가
      const loadingOption = document.createElement('option');
      loadingOption.text = '로딩 중...';
      select.appendChild(loadingOption);

      // 비동기로 코드 데이터 가져오기
      fetchCodeData(grpCode).then(codes => {
        // 로딩 옵션 제거
        if (loadingOption.parentNode) {
          select.removeChild(loadingOption);
        }

        // 코드 옵션 추가
        codes.forEach(code => {
          const option = document.createElement('option');
          option.value = code.code;
          option.text = code.code_name; // 코드명만 표시

          if (code.code === currentValue) {
            option.selected = true;
          }

          select.appendChild(option);
        });

        // 현재 값이 없으면 빈 옵션 선택
        if (!currentValue) {
          emptyOption.selected = true;
        }
      }).catch(error => {
        console.error('Error loading code options:', error);
        if (loadingOption.parentNode) {
          select.removeChild(loadingOption);
        }
        const errorOption = document.createElement('option');
        errorOption.text = '로드 실패';
        select.appendChild(errorOption);
      });
    }

    // 포커스 이벤트
    onRendered(() => {
      select.focus();
      select.style.height = '100%';
    });

    // 값 변경 이벤트
    select.addEventListener('change', () => {
      success(select.value);
    });

    // 블러 이벤트 (취소)
    select.addEventListener('blur', () => {
      cancel();
    });

    return select;
  };
}

/**
 * 기초코드 캐시 초기화
 * @param {string} grpCode - 초기화할 그룹코드 (없으면 전체 초기화)
 */
export function clearCodeCache(grpCode = null) {
  if (grpCode) {
    delete codeCache[grpCode];
  } else {
    Object.keys(codeCache).forEach(key => delete codeCache[key]);
  }
}

/**
 * 기초코드 목록을 select values 형식으로 반환
 * Tabulator의 editor: "list" 사용 시 editorParams.values에 사용
 * @param {string} grpCode - 그룹코드
 * @param {boolean} showCode - 코드도 함께 표시할지 여부 (기본: false)
 * @returns {Promise<Object>} {code: "code_name"} 형태의 객체
 */
export async function getCodeValues(grpCode, showCode = false) {
  const codes = await fetchCodeData(grpCode);
  const values = { "": "선택하세요" };

  codes.forEach(code => {
    values[code.code] = showCode ? `${code.code} - ${code.code_name}` : code.code_name;
  });

  return values;
}

/**
 * 기초코드 formatter (코드 -> 코드명으로 표시)
 * @param {string} grpCode - 그룹코드
 * @param {boolean} showCode - 코드도 함께 표시할지 여부 (기본: false, 코드명만 표시)
 * @returns {Function} Tabulator formatter 함수
 */
export function createCodeFormatter(grpCode, showCode = false) {
  return function(cell) {
    const value = cell.getValue();
    if (!value) return '';

    // 캐시에 데이터가 있으면 즉시 반환
    if (codeCache[grpCode]) {
      const code = codeCache[grpCode].find(c => c.code === value);
      if (code) {
        return showCode ? `${code.code} - ${code.code_name}` : code.code_name;
      }
    }

    // 캐시에 없으면 비동기로 가져와서 셀 업데이트
    fetchCodeData(grpCode).then(codes => {
      const code = codes.find(c => c.code === value);
      if (code) {
        const displayValue = showCode ? `${code.code} - ${code.code_name}` : code.code_name;
        // 셀 값을 다시 렌더링
        const cellElement = cell.getElement();
        if (cellElement) {
          cellElement.textContent = displayValue;
        }
      }
    });

    // 일단 원본 값 반환
    return value;
  };
}
