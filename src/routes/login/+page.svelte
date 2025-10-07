<script>
  import { Card, Button, Input, Label, Alert, Checkbox, Modal } from 'flowbite-svelte';
  import { UserSolid, LockSolid, EyeSolid, EyeSlashSolid, EnvelopeSolid } from 'flowbite-svelte-icons';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // 로그인 폼 데이터
  let loginData = {
    username: '',
    password: '',
    rememberMe: false
  };

  // 회원가입 폼 데이터
  let signupData = {
    userId: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: ''
  };

  // 상태 관리
  let loading = false;
  let showPassword = false;
  let errorMessage = '';
  let validationErrors = {};
  let signupModal = false;
  let signupLoading = false;
  let signupErrorMessage = '';
  let signupValidationErrors = {};
  let showSignupPassword = false;
  let showSignupPasswordConfirm = false;

  // 로그인 시도 함수
  async function handleLogin() {
    // 유효성 검사 초기화
    errorMessage = '';
    validationErrors = {};
    
    // 기본 유효성 검사
    if (!loginData.username) {
      validationErrors.username = '사용자명을 입력해주세요.';
    }
    if (!loginData.password) {
      validationErrors.password = '비밀번호를 입력해주세요.';
    }

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    loading = true;

    try {
      // 실제 API 호출 대신 시뮬레이션
      await simulateLogin(loginData.username, loginData.password);
      
      // 로그인 성공 시 세션 저장 (실제로는 JWT 토큰 등 사용)
      localStorage.setItem('user', JSON.stringify({
        username: loginData.username,
        role: loginData.username === 'admin' ? 'admin' : 'user',
        loginTime: new Date().toISOString()
      }));

      if (loginData.rememberMe) {
        localStorage.setItem('rememberUser', loginData.username);
      } else {
        localStorage.removeItem('rememberUser');
      }

      // 대시보드로 이동
      goto('/');
      
    } catch (error) {
      errorMessage = error.message;
    } finally {
      loading = false;
    }
  }

  // 로그인 시뮬레이션 함수
  async function simulateLogin(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 간단한 로그인 검증 (실제로는 서버 API 호출)
        if (username === 'admin' && password === 'admin123') {
          resolve({ success: true, role: 'admin' });
        } else if (username === 'user' && password === 'user123') {
          resolve({ success: true, role: 'user' });
        } else {
          reject(new Error('사용자명 또는 비밀번호가 올바르지 않습니다.'));
        }
      }, 1000);
    });
  }

  // 비밀번호 표시/숨김 토글
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  // 엔터키 로그인
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }

  // 회원가입 모달 열기
  function openSignupModal() {
    signupModal = true;
    signupErrorMessage = '';
    signupValidationErrors = {};
    signupData = {
      userId: '',
      username: '',
      email: '',
      password: '',
      passwordConfirm: ''
    };
  }

  // 회원가입 처리
  async function handleSignup() {
    signupErrorMessage = '';
    signupValidationErrors = {};

    // 유효성 검사
    if (!signupData.userId || signupData.userId.length < 4) {
      signupValidationErrors.userId = '아이디는 4자 이상이어야 합니다.';
    }
    if (!signupData.username || signupData.username.length < 2) {
      signupValidationErrors.username = '이름은 2자 이상이어야 합니다.';
    }
    if (!signupData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      signupValidationErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }
    if (!signupData.password || signupData.password.length < 6) {
      signupValidationErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }
    if (signupData.password !== signupData.passwordConfirm) {
      signupValidationErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    if (Object.keys(signupValidationErrors).length > 0) {
      return;
    }

    signupLoading = true;

    try {
      // 회원가입 시뮬레이션
      await simulateSignup(signupData);

      // 성공 시 자동 로그인
      loginData.username = signupData.userId;
      loginData.password = signupData.password;

      signupModal = false;
      await handleLogin();

    } catch (error) {
      signupErrorMessage = error.message;
    } finally {
      signupLoading = false;
    }
  }

  // 회원가입 시뮬레이션
  async function simulateSignup(data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 중복 체크 (실제로는 서버에서 처리)
        const existingUsers = ['admin', 'user'];
        if (existingUsers.includes(data.userId)) {
          reject(new Error('이미 존재하는 아이디입니다.'));
        } else {
          resolve({ success: true });
        }
      }, 1000);
    });
  }

  // 회원가입 비밀번호 토글
  function toggleSignupPassword() {
    showSignupPassword = !showSignupPassword;
  }

  function toggleSignupPasswordConfirm() {
    showSignupPasswordConfirm = !showSignupPasswordConfirm;
  }

  // 기억된 사용자명 로드
  onMount(() => {
    const rememberedUser = localStorage.getItem('rememberUser');
    if (rememberedUser) {
      loginData.username = rememberedUser;
      loginData.rememberMe = true;
    }
  });
</script>

<svelte:head>
  <title>로그인 - 재고관리시스템</title>
</svelte:head>

<!-- 로그인 페이지 전용 레이아웃 -->
<div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
  <div class="w-full max-w-sm">
    <!-- 로고/제목 영역 -->
    <div class="text-center mb-8">
      <div class="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
        <span class="text-2xl text-white font-bold">📦</span>
      </div>
      <h1 class="text-3xl font-bold text-white mb-2">재고관리시스템</h1>
      <p class="text-gray-400">계정에 로그인하여 시스템을 이용하세요</p>
    </div>

    <!-- 로그인 카드 -->
    <Card class="shadow-2xl border-0 bg-gray-800 border-gray-700">
      <form on:submit|preventDefault={handleLogin} class="space-y-6">
          <!-- 에러 메시지 -->
          {#if errorMessage}
            <Alert color="red" class="mb-4">
              <span class="font-medium">로그인 실패:</span> {errorMessage}
            </Alert>
          {/if}

          <!-- 사용자명 입력 -->
          <div>
            <Label for="username" class="mb-2 flex items-center text-gray-300">
              <UserSolid class="w-4 h-4 mr-2 text-gray-400" />
              사용자명
            </Label>
            <Input
              id="username"
              type="text"
              bind:value={loginData.username}
              placeholder="사용자명을 입력하세요"
              required
              disabled={loading}
              class={`bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.username ? 'border-red-500' : ''}`}
              on:keypress={handleKeyPress}
            />
            {#if validationErrors.username}
              <p class="mt-1 text-sm text-red-500">{validationErrors.username}</p>
            {/if}
          </div>

          <!-- 비밀번호 입력 -->
          <div>
            <Label for="password" class="mb-2 flex items-center text-gray-300">
              <LockSolid class="w-4 h-4 mr-2 text-gray-400" />
              비밀번호
            </Label>
            <div class="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                bind:value={loginData.password}
                placeholder="비밀번호를 입력하세요"
                required
                disabled={loading}
                class={`bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                on:keypress={handleKeyPress}
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                on:click={togglePasswordVisibility}
                disabled={loading}
              >
                {#if showPassword}
                  <EyeSlashSolid class="w-5 h-5 text-gray-400 hover:text-gray-600" />
                {:else}
                  <EyeSolid class="w-5 h-5 text-gray-400 hover:text-gray-600" />
                {/if}
              </button>
            </div>
            {#if validationErrors.password}
              <p class="mt-1 text-sm text-red-500">{validationErrors.password}</p>
            {/if}
          </div>

          <!-- 로그인 유지 옵션 -->
          <div class="flex items-center">
            <Checkbox
              id="rememberMe"
              bind:checked={loginData.rememberMe}
              disabled={loading}
            />
            <Label for="rememberMe" class="ml-2 text-sm font-medium text-gray-300">
              사용자명 기억하기
            </Label>
          </div>

          <!-- 로그인 버튼 -->
          <Button
            type="submit"
            disabled={loading}
            color="blue"
            class="w-full"
            size="lg"
          >
            {#if loading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              로그인 중...
            {:else}
              로그인
            {/if}
          </Button>
        </form>

        <!-- 추가 정보 -->
        <div class="mt-6 pt-6 border-t border-gray-600">
          <div class="bg-gray-700 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-blue-300 mb-3">
              테스트 계정
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-300">관리자:</span>
                <span class="font-mono text-blue-400 bg-gray-600 px-2 py-1 rounded text-xs">admin / admin123</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-300">일반사용자:</span>
                <span class="font-mono text-green-400 bg-gray-600 px-2 py-1 rounded text-xs">user / user123</span>
              </div>
            </div>
          </div>
        </div>
    </Card>

    <!-- 회원가입 링크 -->
    <div class="text-center mt-6">
      <p class="text-sm text-gray-400">
        계정이 없으신가요?
        <button
          type="button"
          on:click={openSignupModal}
          class="text-blue-400 hover:text-blue-300 font-medium ml-1"
        >
          회원가입
        </button>
      </p>
    </div>

    <!-- 하단 정보 -->
    <div class="text-center mt-8">
      <p class="text-sm text-gray-400">
        © 2024 재고관리시스템. All rights reserved.
      </p>
    </div>
  </div>
</div>

<!-- 회원가입 모달 -->
<Modal bind:open={signupModal} size="md" class="bg-gray-800">
  <form on:submit|preventDefault={handleSignup} class="space-y-4">
    <h3 class="text-xl font-semibold text-white mb-4">회원가입</h3>

    <!-- 에러 메시지 -->
    {#if signupErrorMessage}
      <Alert color="red" class="mb-4">
        <span class="font-medium">회원가입 실패:</span> {signupErrorMessage}
      </Alert>
    {/if}

    <!-- 아이디 -->
    <div>
      <Label for="signup-userid" class="mb-2 flex items-center text-gray-300">
        <UserSolid class="w-4 h-4 mr-2 text-gray-400" />
        아이디
      </Label>
      <Input
        id="signup-userid"
        type="text"
        bind:value={signupData.userId}
        placeholder="아이디 (4자 이상)"
        required
        disabled={signupLoading}
        class={`bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${signupValidationErrors.userId ? 'border-red-500' : ''}`}
      />
      {#if signupValidationErrors.userId}
        <p class="mt-1 text-sm text-red-500">{signupValidationErrors.userId}</p>
      {/if}
    </div>

    <!-- 이름 -->
    <div>
      <Label for="signup-username" class="mb-2 flex items-center text-gray-300">
        <UserSolid class="w-4 h-4 mr-2 text-gray-400" />
        이름
      </Label>
      <Input
        id="signup-username"
        type="text"
        bind:value={signupData.username}
        placeholder="이름 (2자 이상)"
        required
        disabled={signupLoading}
        class={`bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${signupValidationErrors.username ? 'border-red-500' : ''}`}
      />
      {#if signupValidationErrors.username}
        <p class="mt-1 text-sm text-red-500">{signupValidationErrors.username}</p>
      {/if}
    </div>

    <!-- 이메일 -->
    <div>
      <Label for="signup-email" class="mb-2 flex items-center text-gray-300">
        <EnvelopeSolid class="w-4 h-4 mr-2 text-gray-400" />
        이메일
      </Label>
      <Input
        id="signup-email"
        type="email"
        bind:value={signupData.email}
        placeholder="example@email.com"
        required
        disabled={signupLoading}
        class={`bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${signupValidationErrors.email ? 'border-red-500' : ''}`}
      />
      {#if signupValidationErrors.email}
        <p class="mt-1 text-sm text-red-500">{signupValidationErrors.email}</p>
      {/if}
    </div>

    <!-- 비밀번호 -->
    <div>
      <Label for="signup-password" class="mb-2 flex items-center text-gray-300">
        <LockSolid class="w-4 h-4 mr-2 text-gray-400" />
        비밀번호
      </Label>
      <div class="relative">
        <Input
          id="signup-password"
          type={showSignupPassword ? 'text' : 'password'}
          bind:value={signupData.password}
          placeholder="비밀번호 (6자 이상)"
          required
          disabled={signupLoading}
          class={`bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 pr-10 ${signupValidationErrors.password ? 'border-red-500' : ''}`}
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
          on:click={toggleSignupPassword}
          disabled={signupLoading}
        >
          {#if showSignupPassword}
            <EyeSlashSolid class="w-5 h-5 text-gray-400 hover:text-gray-600" />
          {:else}
            <EyeSolid class="w-5 h-5 text-gray-400 hover:text-gray-600" />
          {/if}
        </button>
      </div>
      {#if signupValidationErrors.password}
        <p class="mt-1 text-sm text-red-500">{signupValidationErrors.password}</p>
      {/if}
    </div>

    <!-- 비밀번호 확인 -->
    <div>
      <Label for="signup-password-confirm" class="mb-2 flex items-center text-gray-300">
        <LockSolid class="w-4 h-4 mr-2 text-gray-400" />
        비밀번호 확인
      </Label>
      <div class="relative">
        <Input
          id="signup-password-confirm"
          type={showSignupPasswordConfirm ? 'text' : 'password'}
          bind:value={signupData.passwordConfirm}
          placeholder="비밀번호 확인"
          required
          disabled={signupLoading}
          class={`bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 pr-10 ${signupValidationErrors.passwordConfirm ? 'border-red-500' : ''}`}
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
          on:click={toggleSignupPasswordConfirm}
          disabled={signupLoading}
        >
          {#if showSignupPasswordConfirm}
            <EyeSlashSolid class="w-5 h-5 text-gray-400 hover:text-gray-600" />
          {:else}
            <EyeSolid class="w-5 h-5 text-gray-400 hover:text-gray-600" />
          {/if}
        </button>
      </div>
      {#if signupValidationErrors.passwordConfirm}
        <p class="mt-1 text-sm text-red-500">{signupValidationErrors.passwordConfirm}</p>
      {/if}
    </div>

    <!-- 버튼 -->
    <div class="flex gap-3 pt-4">
      <Button
        type="button"
        color="alternative"
        class="w-full"
        on:click={() => signupModal = false}
        disabled={signupLoading}
      >
        취소
      </Button>
      <Button
        type="submit"
        color="blue"
        class="w-full"
        disabled={signupLoading}
      >
        {#if signupLoading}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          가입 중...
        {:else}
          회원가입
        {/if}
      </Button>
    </div>
  </form>
</Modal>

