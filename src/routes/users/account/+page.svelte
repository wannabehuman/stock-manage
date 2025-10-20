<script>
  import { Card, Breadcrumb, BreadcrumbItem, Label, Input, Button, Modal, Avatar, Fileupload } from 'flowbite-svelte';
  import { HomeSolid, UserSolid, LockSolid} from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';

  // 현재 사용자 정보
  let userInfo = {
    name: "",
    email: "",
    // birthDate: "1989-03-15",
    avatar: ""
  };

  // 비밀번호 변경용 데이터
  let passwordData = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  };

  let showPasswordModal = false;
  let showAvatarModal = false;
  let selectedFile = null;
  let previewUrl = null;

  // localStorage에서 사용자 정보 불러오기
  onMount(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userInfo.name = user.name || "김관리자";
        userInfo.email = user.email || "admin@stockmanage.com";
        // userInfo.birthDate = user.birthDate || "1989-03-15";
        // 저장된 아바타가 있으면 불러오기
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
          userInfo.avatar = savedAvatar;
        }
      }
    }
  });

  function updateProfile() {
    // localStorage에 사용자 정보 업데이트
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.name = userInfo.name;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
    alert("계정 정보가 성공적으로 업데이트되었습니다.");
  }

  function openPasswordModal() {
    showPasswordModal = true;
  }

  function closePasswordModal() {
    showPasswordModal = false;
    // 비밀번호 필드 초기화
    passwordData.currentPassword = "";
    passwordData.newPassword = "";
    passwordData.confirmPassword = "";
  }

  async function updatePassword() {
    // 비밀번호 확인
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("새 비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    try {
      // 현재 로그인한 사용자 정보 가져오기
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
        return;
      }
      const user = JSON.parse(userStr);

      // 백엔드 API 호출
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          userId: user.id || user.username,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        closePasswordModal();
      } else {
        alert(result.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  }

  function openAvatarModal() {
    showAvatarModal = true;
    selectedFile = null;
    previewUrl = null;
  }

  function closeAvatarModal() {
    showAvatarModal = false;
    selectedFile = null;
    previewUrl = null;
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        alert('파일 크기는 5MB를 초과할 수 없습니다.');
        return;
      }

      selectedFile = file;

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function uploadAvatar() {
    if (!previewUrl) {
      alert('이미지를 선택해주세요.');
      return;
    }

    // localStorage에 아바타 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('userAvatar', previewUrl);
      userInfo.avatar = previewUrl;

      // 커스텀 이벤트 발생시켜 Sidebar 업데이트
      window.dispatchEvent(new Event('avatarUpdated'));
    }

    alert('프로필 사진이 성공적으로 변경되었습니다.');
    closeAvatarModal();
  }
</script>

<svelte:head>
  <title>계정관리 - 재고관리시스템</title>
</svelte:head>

<div class="page-container">
<div class="breadcrumb-container">
  <Breadcrumb class="breadcrumb-responsive">
    <BreadcrumbItem href="/" home class="whitespace-nowrap">
      <div class="flex items-center">
        <HomeSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        홈
      </div>
    </BreadcrumbItem>
    <BreadcrumbItem class="whitespace-nowrap">
      <div class="flex items-center">
        <UserSolid class="w-4 h-4 mr-2 flex-shrink-0" />
        계정관리
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
</div>

<div class="flex justify-center items-center min-h-[60vh]">
  <div class="max-w-2xl w-full">
    <Card class="card-responsive card-compact">
    <div class="card-header">
      <h2 class="card-title">계정 정보</h2>
    </div>
    <div class="card-content">

    <!-- 프로필 사진 섹션 -->
    <div class="flex items-center justify-center mb-6">
      <div class="relative">
        <Avatar src={userInfo.avatar} size="xl" class="ring-4 ring-blue-500" />
        <button
          on:click={openAvatarModal}
          class="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-all"
          title="프로필 사진 변경"
        >
          <!-- <CameraSolid class="w-4 h-4" /> -->
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <Label for="name" class="mb-2">이름</Label>
        <Input 
          id="name" 
          bind:value={userInfo.name} 
          placeholder="이름을 입력하세요"
        />
      </div>
      
      <div>
        <Label for="email" class="mb-2">이메일</Label>
        <Input 
          id="email" 
          type="email"
          bind:value={userInfo.email} 
          placeholder="이메일을 입력하세요"
        />
      </div>
    </div>
    
    <!-- 버튼들 -->
    <div class="mt-6 flex gap-3 justify-end">
      <Button 
        color="purple" 
        on:click={openPasswordModal}
        class="px-6 py-2"
      >
        <LockSolid class="w-4 h-4 mr-2" />
        비밀번호 변경
      </Button>
      
      <Button 
        color="blue" 
        on:click={updateProfile}
        class="px-6 py-2"
      >
        <UserSolid class="w-4 h-4 mr-2" />
        정보 저장
      </Button>
    </div>
    </div>
    </Card>
  </div>
</div>
</div>

<!-- 비밀번호 변경 모달 -->
<Modal title="비밀번호 변경" bind:open={showPasswordModal} size="sm">
  <div class="space-y-4">
    <div>
      <Label for="modalCurrentPassword" class="mb-2">현재 비밀번호</Label>
      <Input
        id="modalCurrentPassword"
        type="password"
        bind:value={passwordData.currentPassword}
        placeholder="현재 비밀번호를 입력하세요"
      />
    </div>

    <div>
      <Label for="modalNewPassword" class="mb-2">새 비밀번호</Label>
      <Input
        id="modalNewPassword"
        type="password"
        bind:value={passwordData.newPassword}
        placeholder="새 비밀번호를 입력하세요"
      />
    </div>

    <div>
      <Label for="modalConfirmPassword" class="mb-2">새 비밀번호 확인</Label>
      <Input
        id="modalConfirmPassword"
        type="password"
        bind:value={passwordData.confirmPassword}
        placeholder="새 비밀번호를 다시 입력하세요"
      />
    </div>
  </div>

  <svelte:fragment slot="footer">
    <Button color="alternative" on:click={closePasswordModal}>
      취소
    </Button>
    <Button color="blue" on:click={updatePassword}>
      비밀번호 변경
    </Button>
  </svelte:fragment>
</Modal>

<!-- 프로필 사진 변경 모달 -->
<Modal title="프로필 사진 변경" bind:open={showAvatarModal} size="sm">
  <div class="space-y-4">
    <!-- 현재 프로필 사진 또는 미리보기 -->
    <div class="flex justify-center">
      <Avatar src={previewUrl || userInfo.avatar} size="xl" class="ring-4 ring-blue-500" />
    </div>

    <!-- 파일 선택 -->
    <div>
      <Label for="avatar-upload" class="mb-2">이미지 파일 선택</Label>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        on:change={handleFileChange}
        class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        PNG, JPG, GIF (최대 5MB)
      </p>
    </div>

    {#if previewUrl}
      <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p class="text-sm text-blue-700 dark:text-blue-400">
          ✓ 이미지가 선택되었습니다. '저장' 버튼을 눌러 변경을 완료하세요.
        </p>
      </div>
    {/if}
  </div>

  <svelte:fragment slot="footer">
    <Button color="alternative" on:click={closeAvatarModal}>
      취소
    </Button>
    <Button color="blue" on:click={uploadAvatar} disabled={!previewUrl}>
      저장
    </Button>
  </svelte:fragment>
</Modal>