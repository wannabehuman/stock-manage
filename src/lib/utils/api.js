/**
 * API 호출을 위한 유틸리티 함수
 * - 자동 JWT 토큰 추가
 * - 401 에러 시 자동 로그아웃 처리
 */

/**
 * fetch wrapper - 토큰 자동 추가 및 401 에러 처리
 * @param {string} url - API endpoint URL
 * @param {object} options - fetch options
 * @returns {Promise<Response>}
 */
export async function fetchWithAuth(url, options = {}) {
  // 기본 헤더 설정
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // JWT 토큰 추가
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // fetch 요청 실행
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // 401 Unauthorized 에러 처리
    if (response.status === 401) {
      // 로컬 스토리지 및 세션 스토리지에서 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');

      // 사용자에게 메시지 표시
      alert('토큰이 만료되어 자동 로그아웃 되었습니다. 다시 로그인 해주세요.');

      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';

      // 에러 throw
      throw new Error('Token expired - Auto logout');
    }

    return response;
  } catch (error) {
    // fetch 자체가 실패한 경우 (네트워크 오류 등)
    throw error;
  }
}

/**
 * JSON 응답을 자동으로 파싱하는 fetch wrapper
 * @param {string} url - API endpoint URL
 * @param {object} options - fetch options
 * @returns {Promise<any>} - 파싱된 JSON 데이터
 */
export async function fetchJSON(url, options = {}) {
  const response = await fetchWithAuth(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * GET 요청
 */
export async function apiGet(url) {
  return fetchJSON(url, { method: 'GET' });
}

/**
 * POST 요청
 */
export async function apiPost(url, data) {
  return fetchJSON(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * PUT 요청
 */
export async function apiPut(url, data) {
  return fetchJSON(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * DELETE 요청
 */
export async function apiDelete(url) {
  return fetchJSON(url, { method: 'DELETE' });
}
