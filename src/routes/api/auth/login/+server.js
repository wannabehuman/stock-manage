import { json } from '@sveltejs/kit';
// import { getUser } from '$lib/server/userStore.js';

export async function POST({ request }) {
const users = JSON.parse(localStorage.getItem('users')) || [];

  try {
    const { username, password } = await request.json();

    // 입력 검증
    if (!username || !password) {
      return json(
        { success: false, message: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 찾기
    const user =  users.find(user => user.username === username);
    if (!user) {
      return json(
        { success: false, message: '사용자명 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 확인 (실제로는 해시 비교를 사용해야 합니다)
    if (user.password !== password) {
      return json(
        { success: false, message: '사용자명 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 승인 여부 확인
    if (!user.approved) {
      return json(
        { success: false, message: '관리자 승인 대기 중입니다.' },
        { status: 403 }
      );
    }

    // 로그인 성공 - JWT 토큰 생성 (여기서는 간단하게 username을 토큰으로 사용)
    // 실제로는 jwt.sign()을 사용해야 합니다
    const accessToken = username;

    return json({
      success: true,
      accessToken,
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: '로그인 성공'
    });

  } catch (error) {
    console.error('Login error:', error);
    return json(
      { success: false, message: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
