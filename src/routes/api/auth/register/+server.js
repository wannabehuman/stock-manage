import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  try {
    const { username, name, email, password } = await request.json();

    // 입력 검증
    if (!username || username.length < 4) {
      return json(
        { success: false, message: '아이디는 4자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    if (!name || name.length < 2) {
      return json(
        { success: false, message: '이름은 2자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(
        { success: false, message: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return json(
        { success: false, message: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 중복 사용자 확인
    if (users.has(username)) {
      return json(
        { success: false, message: '이미 사용 중인 아이디입니다.' },
        { status: 409 }
      );
    }

    // 이메일 중복 확인
    for (const [, user] of users) {
      if (user.email === email) {
        return json(
          { success: false, message: '이미 사용 중인 이메일입니다.' },
          { status: 409 }
        );
      }
    }

    // 새 사용자 생성 (승인 대기 상태)
    users.set(username, {
      username,
      name,
      email,
      password, // 실제로는 해시해서 저장해야 합니다
      role: 'user',
      approved: false, // 관리자 승인 대기
      createdAt: new Date().toISOString()
    });

    return json({
      success: true,
      message: '회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return json(
      { success: false, message: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
