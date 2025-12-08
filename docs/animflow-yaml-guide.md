# AnimFlow YAML 작성 가이드

> AI 및 개발자를 위한 AnimFlow DSL YAML 작성 규칙

## MDX 템플릿 리터럴에서의 YAML 작성

MDX/Astro에서 AnimFlow를 사용할 때, **템플릿 리터럴 내부의 YAML은 반드시 첫 번째 줄부터 들여쓰기 없이 시작**해야 합니다.

### 올바른 예시

```jsx
<AnimFlowEmbed
  id="example"
  title="예제 다이어그램"
  height={400}
  yaml={`
version: "1.0"
metadata:
  title: "API 요청 흐름"
nodes:
  - id: client
    type: box
    label: "Client"
    position: { x: 100, y: 150 }
    style:
      color: "#3b82f6"
  - id: server
    type: box
    label: "Server"
    position: { x: 300, y: 150 }
    style:
      color: "#10b981"
edges:
  - id: e1
    from: client
    to: server
    label: "Request"
scenarios:
  - id: flow
    name: "요청 흐름"
    steps:
      - action: highlight
        nodes: [client]
        log:
          message: "클라이언트 요청"
          type: info
        duration: 1000
      - action: animate-edge
        edge: e1
        duration: 500
logging:
  enabled: true
  maxEntries: 5
`}
/>
```

### 잘못된 예시 (들여쓰기 문제)

```jsx
// WRONG: 템플릿 리터럴 내 추가 들여쓰기
<AnimFlowEmbed
  yaml={`
    version: "1.0"        // <- 이 들여쓰기가 문제!
    metadata:
      title: "..."
  `}
/>
```

## YAML 구조

### 1. 루트 레벨 키

모든 루트 키는 들여쓰기 없이 작성:

```yaml
version: "1.0"          # 필수
metadata:               # 선택
canvas:                 # 선택
nodes:                  # 필수
edges:                  # 선택
scenarios:              # 선택
logging:                # 선택
```

### 2. 노드 정의

```yaml
nodes:
  - id: unique-id           # 필수: 고유 식별자
    type: box               # 필수: box, database, circle
    label: "표시 텍스트"      # 선택: 노드에 표시될 텍스트
    position:               # 필수: 캔버스 내 위치
      x: 100
      y: 150
    style:                  # 선택: 스타일링
      color: "#3b82f6"      # hex 색상
```

**노드 타입:**
- `box`: 일반 사각형 (서비스, 컴포넌트)
- `database`: 데이터베이스 모양
- `circle`: 원형 노드

### 3. 엣지 정의

```yaml
edges:
  - id: edge-id             # 필수: 고유 식별자
    from: source-node-id    # 필수: 출발 노드 ID
    to: target-node-id      # 필수: 도착 노드 ID
    label: "연결 설명"        # 선택: 엣지 라벨
    style:                  # 선택: 스타일링
      lineType: solid       # solid, dashed, dotted
```

### 4. 시나리오 정의

```yaml
scenarios:
  - id: scenario-id         # 필수: 고유 식별자
    name: "시나리오 이름"     # 필수: 드롭다운에 표시
    steps:                  # 필수: 애니메이션 단계
      - action: highlight
        nodes: [node-id]
        log:
          message: "로그 메시지"
          type: info        # info, success, warning, error
        duration: 1000
      - action: animate-edge
        edge: edge-id
        label: "전송 중"
        duration: 500
```

### 5. 캔버스 설정 (섹션 포함)

```yaml
canvas:
  width: 1000
  height: 450
  sections:
    - id: section-id
      label: "섹션 이름"
      bounds:
        y: 0
        height: 100
      style:
        background: "rgba(59, 130, 246, 0.1)"  # rgba 지원
```

**색상 형식:**
- `background`: hex (`#RRGGBB`), rgb, rgba 모두 지원
- `color`: hex 형식만 지원 (`#RRGGBB` 또는 `#RGB`)

### 6. 로깅 설정

```yaml
logging:
  enabled: true
  maxEntries: 5
  position: bottom-right    # 선택
  timestampFormat: "HH:mm:ss" # 선택
```

## 액션 타입

### highlight

노드를 강조 표시:

```yaml
- action: highlight
  nodes: [node-id-1, node-id-2]  # 배열로 여러 노드 지정 가능
  style:
    color: "#22c55e"             # 강조 색상 (선택)
  log:
    message: "설명 메시지"
    type: success
  duration: 1000
```

### animate-edge

엣지에 애니메이션 효과:

```yaml
- action: animate-edge
  edge: edge-id
  label: "데이터 전송"           # 애니메이션 중 표시될 라벨
  duration: 500
```

### parallel

여러 액션을 동시 실행:

```yaml
- action: parallel
  steps:
    - action: highlight
      nodes: [node-a]
      duration: 500
    - action: highlight
      nodes: [node-b]
      duration: 500
```

### log

로그만 출력 (노드 변경 없음):

```yaml
- action: log
  log:
    message: "처리 완료"
    type: success
```

## 스타일 가이드

### 권장 색상 팔레트

```yaml
# 프론트엔드/UI
color: "#3b82f6"   # Blue
color: "#61dafb"   # React Blue

# 백엔드/서버
color: "#10b981"   # Green
color: "#68a063"   # Node.js Green

# 데이터베이스
color: "#336791"   # PostgreSQL Blue
color: "#dc382d"   # Redis Red
color: "#00758f"   # MySQL Blue

# 경고/에러
color: "#f59e0b"   # Warning Yellow
color: "#ef4444"   # Error Red

# 특수 기능
color: "#8b5cf6"   # Purple
color: "#000000"   # Black (Kafka 등)
```

### 선 스타일 용도

```yaml
lineType: solid    # 일반 요청/연결
lineType: dashed   # 응답/반환
lineType: dotted   # 비동기/옵션
```

## 완전한 예제

```yaml
version: "1.0"
metadata:
  title: "REST API 요청 흐름"
canvas:
  width: 900
  height: 400
nodes:
  - id: browser
    type: box
    label: "Browser"
    position: { x: 80, y: 180 }
    style:
      color: "#61dafb"
  - id: api
    type: box
    label: "API Server"
    position: { x: 280, y: 180 }
    style:
      color: "#68a063"
  - id: db
    type: database
    label: "PostgreSQL"
    position: { x: 480, y: 180 }
    style:
      color: "#336791"
edges:
  - id: req
    from: browser
    to: api
  - id: query
    from: api
    to: db
  - id: result
    from: db
    to: api
    style:
      lineType: dashed
  - id: res
    from: api
    to: browser
    style:
      lineType: dashed
scenarios:
  - id: get-data
    name: "GET /api/data"
    steps:
      - action: highlight
        nodes: [browser]
        log:
          message: "사용자 요청 시작"
          type: info
        duration: 800
      - action: animate-edge
        edge: req
        label: "GET /api/data"
        duration: 500
      - action: highlight
        nodes: [api]
        log:
          message: "API: 요청 처리"
          type: info
        duration: 600
      - action: animate-edge
        edge: query
        label: "SELECT * FROM data"
        duration: 500
      - action: highlight
        nodes: [db]
        log:
          message: "DB: 쿼리 실행 (15ms)"
          type: info
        duration: 800
      - action: animate-edge
        edge: result
        label: "결과 반환"
        duration: 400
      - action: animate-edge
        edge: res
        label: "200 OK"
        duration: 400
      - action: highlight
        nodes: [browser]
        log:
          message: "응답 완료!"
          type: success
        duration: 1000
logging:
  enabled: true
  maxEntries: 6
```

## 트러블슈팅

### 1. YAML 파싱 에러

**증상:** `bad indentation of a mapping entry`

**원인:** 템플릿 리터럴 내에서 잘못된 들여쓰기

**해결:**
- 첫 줄부터 들여쓰기 없이 시작
- 일관된 2칸 스페이스 들여쓰기 사용

### 2. 유효성 검사 에러

**증상:** `Unknown property: xxx`

**원인:** 스키마에 정의되지 않은 속성 사용

**해결:** 이 문서의 허용된 속성만 사용

### 3. 색상 형식 에러

**증상:** `Value does not match pattern`

**원인:** 지원되지 않는 색상 형식

**해결:**
- 노드/엣지 `color`: hex만 사용 (`#RRGGBB`)
- 섹션 `background`: hex, rgb, rgba 모두 가능

## 참고

- JSON Schema: `packages/core/schema/animflow.schema.json`
- YAML 파서: `packages/core/src/parser/yaml-parser.ts`
- React 컴포넌트: `blog/src/components/AnimFlowEmbed.tsx`
