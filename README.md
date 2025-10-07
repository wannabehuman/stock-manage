# 재고관리시스템 (Stock Management System)

SvelteKit과 Tabulator를 활용한 웹 기반 재고관리 시스템입니다.

## 🚀 기술 스택

### Frontend Framework
- **SvelteKit v5** - 최신 버전의 Svelte 프레임워크
- **Svelte v5** - 반응형 UI 프레임워크
- **Vite v5** - 빠른 빌드 도구

### UI Components & Styling
- **Flowbite Svelte v0.46** - UI 컴포넌트 라이브러리
- **Flowbite Svelte Icons v3** - 아이콘 세트
- **Tailwind CSS v3** - 유틸리티 기반 CSS 프레임워크
- **PostCSS v8** - CSS 전처리기

### Data Grid
- **Tabulator Tables v6.3** - 강력한 테이블 라이브러리

### HTTP Client
- **Axios v1.12** - Promise 기반 HTTP 클라이언트

## 📦 주요 기능

### 입고 관리
- 입고 등록 (`/inbound/register`)
- 입고 이력 조회 (`/inbound/history`)
- 입고 현황 (`/inbound/current`)

### 출고 관리
- 출고 등록 (`/outbound/register`)
- 출고 이력 조회 (`/outbound/history`)

### 마스터 데이터 관리
- 품목 마스터 (`/master/items`)
- 코드 마스터 (`/master/codes`)

### 사용자 관리
- 사용자 관리 (`/users/management`)
- 계정 정보 (`/users/account`)
- 로그인/로그아웃

## 🏗️ 프로젝트 구조

```
stock-manage/
├── src/
│   ├── lib/
│   │   └── components/
│   │       ├── commonTabulator/    # 공통 테이블 컴포넌트
│   │       │   ├── commonTable.js  # CommonTable 클래스
│   │       │   ├── singleTon.js    # SingleTon 패턴 구현
│   │       │   └── tabulator.js    # Tabulator 설정
│   │       ├── forms/              # 폼 컴포넌트
│   │       └── modals/             # 모달 컴포넌트
│   ├── routes/
│   │   ├── inbound/                # 입고 관리
│   │   ├── outbound/               # 출고 관리
│   │   ├── master/                 # 마스터 데이터
│   │   ├── users/                  # 사용자 관리
│   │   └── +layout.svelte          # 레이아웃
│   └── app.css                     # 전역 스타일
├── static/                         # 정적 파일
├── package.json
├── vite.config.js
├── svelte.config.js
└── tailwind.config.js
```

## 💾 데이터 저장 로직

### 저장 흐름

```javascript
// 1. 사용자가 저장 버튼 클릭
<Button on:click={() => inboundTable?.saveData()}>저장</Button>

// 2. saveData() 메서드 호출
saveData() {
  this.putData();
}

// 3. putData()에서 확인 메시지 후 save() 실행
putData() {
  this.confirmSave(this.save);
}

// 4. save() 메서드에서 실제 저장 처리
async save() {
  // SingleTon에서 저장할 데이터 수집
  let tbData = this._single.getSaveData();


  // Axios로 POST 요청
  const response = await axios.post(this._ajaxUrl, {
    mode: this._putMode,  // 'saveInbound', 'saveOutbound' 등
    ...tbData
  });

  // 저장 성공 시 데이터 새로고침
  if(response.data.code) {
    this.putSuccess();
    kuls_success('저장되었습니다.');
  }
}
```

### 데이터 상태 관리

- **ROW_STATUS**: 행 상태를 추적
  - `I` (Insert): 신규 추가 행
  - `U` (Update): 수정된 행
  - `D` (Delete): 삭제 표시된 행

- **unicId**: 각 행의 고유 식별자 (타임스탬프 + 랜덤)

- **SingleTon 패턴**: 전역 데이터 상태 관리
  - `setTableData()`: 테이블 데이터 등록
  - `getSaveData()`: 저장할 데이터 수집
  - `resetData()`: 저장 후 데이터 초기화

### Validation

```javascript
// 필드별 Validation 규칙 설정
const tableFields = [
  {
    field: "ITEM_CD",
    title: "품목코드",
    editor: "input",
  },
  {
    field: "INBOUND_QTY",
    title: "입고수량",
    editor: "number",
  }
];

// 저장 전 자동 Validation 체크
// - required: 필수 입력
// - number: 숫자 형식 및 범위
// - length: 문자열 길이
```

### API 엔드포인트 설정

```javascript
// 각 테이블마다 설정 가능
this.setAjaxUrl('/api/inbound');      // API URL
this.setGetMode('getInboundList');    // 조회 모드
this.setPutMode('saveInbound');       // 저장 모드
```

## 🔐 인증

- **LocalStorage 기반**: 사용자 정보를 브라우저 로컬스토리지에 저장
- **라우트 가드**: `+layout.svelte`에서 인증 체크
- **공개 라우트**: `/login`, `/logout`

```javascript
// LocalStorage에 사용자 정보 저장
localStorage.setItem('user', JSON.stringify(userData));

// 인증 체크
const userStr = localStorage.getItem('user');
if (userStr) {
  currentUser = JSON.parse(userStr);
  isAuthenticated = true;
}
```

## 🎨 테마

- **다크모드 지원**: `dark:` prefix를 사용한 Tailwind 다크모드
- **반응형 디자인**: 모바일/태블릿/데스크톱 대응
- **커스텀 스타일링**: Tabulator 테이블에 Tailwind 스타일 적용

## 🛠️ 개발 환경 설정

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:5173 에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

### 프리뷰

```bash
npm run preview
```

## 📝 주요 클래스

### CommonTable

테이블 관리를 위한 기본 클래스로, 모든 테이블은 이 클래스를 상속받습니다.

**주요 메서드:**
- `init()`: 테이블 초기화
- `addRow()`: 행 추가
- `getMainList()`: 데이터 조회
- `save()`: 데이터 저장

**설정 메서드:**
- `setFields()`: 테이블 컬럼 정의
- `setTbSelectorId()`: 테이블 DOM ID 설정
- `setUniCD()`: 고유키 설정
- `setAjaxUrl()`: API 엔드포인트 설정
- `setCellEventList()`: 셀 이벤트 등록

### InboundRegisterTable 예시

```javascript
export class InboundRegisterTable extends CommonTable {
  constructor() {
    super();

    // 테이블 필드 설정
    const tableFields = [
      { field: "ITEM_CD", title: "품목코드", editor: "input" },
      { field: "ITEM_NM", title: "품목명", editor: "input" },
      { field: "INBOUND_QTY", title: "입고수량", editor: "number" },
      // ...
    ];

    this.setFields(tableFields);
    this.setTbSelectorId('inboundTable');
    this.setUniCD(['ITEM_CD', 'LOT_NO']);
    this.setAjaxUrl('/api/inbound');
  }

  saveData() {
    this.putData();
  }
}
```

## 🔄 데이터 흐름

```
┌─────────────┐
│   UI 입력   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Svelte 컴포넌트 │
└──────┬──────────┘
       │
       ▼
┌──────────────────┐
│  Table 클래스    │ (InboundRegisterTable 등)
│  - addRow()      │
│  - cellEdited()  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  SingleTon       │ (전역 데이터 관리)
│  - setTableData()│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  save()          │ (저장 버튼 클릭)
│  - validation    │
│  - axios.post()  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Backend API     │
└──────────────────┘
```

## 📄 라이센스

Private

## 👤 작성자

- 2025-10-07 이원기 
