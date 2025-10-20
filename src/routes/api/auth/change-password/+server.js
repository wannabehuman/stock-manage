import { json } from '@sveltejs/kit';
// import { getUser, changePassword } from '$lib/server/userStore.js';
export async function POST({ request }) {
const users = JSON.parse(localStorage.getItem('users')) || [];

  try {
    const { currentPassword, newPassword } = await request.json();

    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json(
        { success: false, message: '인증 토큰이 없습니다.' },
        { status: 401 }
      );
    }

    // 간단한 토큰 검증 (실제로는 JWT 검증을 사용해야 합니다)
    const token = authHeader.substring(7);

    // 여기서는 토큰이 username이라고 가정
    const username = token;

    const user = users.find(user => user.username === username);
    if (!user) {
      return json(
        { success: false, message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 비밀번호 확인
    if (user.password !== currentPassword) {
      return json(
        { success: false, message: '현재 비밀번호가 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 새 비밀번호 유효성 검사
    if (!newPassword || newPassword.length < 6) {
      return json(
        { success: false, message: '새 비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 변경
    const success = user.password = newPassword;

    if (!success) {
      return json(
        { success: false, message: '비밀번호 변경에 실패했습니다.' },
        { status: 500 }
      );
    }

    return json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (error) {
    console.error('Password change error:', error);
    return json(
      { success: false, message: '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
