# 재고현황 API 요구사항

## 1. 재고현황 조회 API

### Endpoint
```
POST /api/real-stock/status
```

### Request Parameters (Query String)
```
GET /api/real-stock/status?ITEM_GRP_CD=&ITEM_CD=&ITEM_NM=
```
또는
```
POST /api/real-stock/status
```

### Request Body (POST 방식)
```json
{
  "ITEM_GRP_CD": "",  // 카테고리 코드 (선택)
  "ITEM_CD": "",      // 품목코드 (선택)
  "ITEM_NM": ""       // 품목명 (선택)
}
```

**참고**: CommonTable에서 자동으로 `data-filter` 속성을 가진 입력 필드의 `data-name` 값을 파라미터 키로 사용합니다.

### Response
```json
[
  {
    "stock_code": "ITEM001",
    "stock_name": "품목명",
    "category": "카테고리명",
    "unit": "EA",
    "quantity": 100,            // 현재고 (입고수량 - 출고수량)
    "inbound_count": 5,         // 입고 건수
    "outbound_count": 3         // 출고 건수
  }
]
```

### 쿼리 로직
```sql
-- real_stock 테이블 기준으로 집계
SELECT
  rb.code AS stock_code,
  rb.name AS stock_name,
  rb.category,
  rb.unit,
  COALESCE(SUM(CASE WHEN rs.io_type = 'IN' OR rs.io_type IS NULL THEN rs.quantity ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN rs.io_type = 'OUT' THEN rs.quantity ELSE 0 END), 0) AS quantity,
  COUNT(DISTINCT CASE WHEN rs.io_type = 'IN' OR rs.io_type IS NULL THEN rs.id END) AS inbound_count,
  COUNT(DISTINCT CASE WHEN rs.io_type = 'OUT' THEN rs.id END) AS outbound_count
FROM stock_base rb
LEFT JOIN real_stock rs ON rb.code = rs.stock_code
WHERE rb.isActive = true
  AND (COALESCE(:ITEM_GRP_CD, '') = '' OR rb.category = :ITEM_GRP_CD)
  AND (COALESCE(:ITEM_CD, '') = '' OR rb.code LIKE CONCAT('%', :ITEM_CD, '%'))
  AND (COALESCE(:ITEM_NM, '') = '' OR rb.name LIKE CONCAT('%', :ITEM_NM, '%'))
GROUP BY rb.code, rb.name, rb.category, rb.unit
ORDER BY rb.name
```

**중요**:
- `quantity` 필드명 사용 (total_quantity 아님)
- 필터 파라미터: `ITEM_GRP_CD`, `ITEM_CD`, `ITEM_NM`
- 빈 문자열('')도 파라미터로 전달될 수 있으므로 COALESCE 처리 필요

---

## 2. 품목별 입출고 이력 조회 API

### Endpoint
```
GET /api/real-stock/history/{stock_code}
```

### Path Parameters
- `stock_code`: 품목코드 (예: "ITEM001")

### 요청 예시
```
GET /api/real-stock/history/ITEM001
```

### Response
```json
[
  {
    "id": 1,
    "inbound_no": "IB202501001",    // 입고번호 (입고인 경우)
    "stock_code": "ITEM001",
    "stock_name": "품목명",
    "io_type": "IN",                 // "IN" 또는 "OUT" 또는 null (null인 경우 입고)
    "io_date": "2025-01-15",         // 출고일자 (출고인 경우)
    "inbound_date": "2025-01-10",    // 입고일자 (입고인 경우)
    "preparation_date": "2025-01-09",// 조제일자
    "quantity": 50,
    "unit": "EA",
    "expiry_date": "2025-07-10",     // 유통기한 (입고인 경우)
    "remark": "비고"
  }
]
```

### 에러 응답
```json
{
  "error": "품목을 찾을 수 없습니다.",
  "stock_code": "ITEM001"
}
```

### 쿼리 로직
```sql
-- real_stock 테이블에서 해당 품목의 모든 입출고 이력 조회
SELECT
  rs.*,
  rb.name as stock_name
FROM real_stock rs
JOIN stock_base rb ON rs.stock_code = rb.code
WHERE rs.stock_code = :stock_code
ORDER BY
  COALESCE(rs.io_date, rs.inbound_date) DESC,
  rs.id DESC
```

**중요 참고사항**:
- `io_type`이 NULL이거나 'IN'인 경우 입고로 간주
- `io_type`이 'OUT'인 경우 출고로 간주
- 입고 데이터: `inbound_date`, `preparation_date`, `expiry_date` 사용
- 출고 데이터: `io_date` 사용
- 날짜 정렬: 최신순 (내림차순)

---

## DB 스키마 참고

### real_stock 테이블 구조 (예상)
```sql
CREATE TABLE real_stock (
  id INT PRIMARY KEY AUTO_INCREMENT,
  inbound_no VARCHAR(50),           -- 입고번호 (입고 시에만 존재)
  stock_code VARCHAR(50) NOT NULL,  -- 품목코드
  io_type VARCHAR(10),               -- 'IN', 'OUT' 또는 NULL (NULL은 입고를 의미)
  io_date DATE,                      -- 출고일자 (출고 시에만 사용)
  inbound_date DATE,                 -- 입고일자 (입고 시에만 사용)
  preparation_date DATE,             -- 조제일자
  quantity DECIMAL(10,2) NOT NULL,   -- 수량
  unit VARCHAR(20),                  -- 단위
  expiry_date DATE,                  -- 유통기한 (입고 시에만)
  remark TEXT,                       -- 비고
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (stock_code) REFERENCES stock_base(code)
);
```

### 데이터 흐름
1. **입고등록 시**: `handstock` 테이블과 `real_stock` 테이블에 동시에 INSERT
   - `io_type`: NULL 또는 'IN'
   - `inbound_no`: 입고번호
   - `inbound_date`: 입고일자
   - `expiry_date`: 유통기한

2. **출고등록 시**: `real_stock` 테이블에만 INSERT
   - `io_type`: 'OUT'
   - `io_date`: 출고일자
   - `inbound_no`: 연결된 입고번호 (어떤 LOT에서 출고되었는지)

---

## 참고사항

1. **재고 계산**:
   - 현재고 = (입고 수량 합계) - (출고 수량 합계)
   - real_stock 테이블에서 io_type으로 구분하여 계산

2. **LOT 관리**:
   - handstock: 입고 LOT 정보 (입고번호별 상세 정보)
   - real_stock: 실제 재고 이동 내역 (입고/출고 모두 포함)

3. **정렬**:
   - 재고현황: 품목명(name) 기준 오름차순
   - 입출고 이력: 일자 기준 최신순
