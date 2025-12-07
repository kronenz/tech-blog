# AnimFlow DSL Specification

Version: 1.0

AnimFlow DSL은 인터랙티브 애니메이션 다이어그램을 정의하기 위한 YAML 기반 언어입니다.

## 기본 구조

```yaml
version: "1.0"
metadata:
  title: "다이어그램 제목"
  description: "설명"

canvas:
  width: 1200
  height: 800

nodes:
  - id: node-id
    label: "Node Label"
    position: { x: 100, y: 100 }

edges:
  - id: edge-id
    from: node-id-1
    to: node-id-2

scenarios:
  - id: main
    name: "메인 시나리오"
    steps:
      - action: highlight
        nodes: [node-id]
```

## 필수 필드

1. **version**: DSL 버전 (현재 "1.0")
2. **nodes**: 최소 1개 이상의 노드 배열

## Node (노드)

다이어그램의 개별 구성 요소입니다.

### 필수 필드
- `id`: 고유 식별자 (소문자, 숫자, 하이픈만 허용, 소문자로 시작)
- `label`: 표시 텍스트 (`\n`으로 줄바꿈)
- `position`: x, y 좌표 객체

### 선택 필드
- `type`: 노드 유형 (기본: "box")
  - `box`: 사각형
  - `circle`: 원
  - `database`: 데이터베이스 아이콘
  - `icon`: 아이콘
  - `group`: 그룹
- `section`: 소속 섹션 ID
- `style`: 스타일 객체
  - `color`: 색상 (hex 코드, 예: "#3b82f6")
  - `shape`: 도형 (`rect`, `rounded-rect`, `circle`, `diamond`)
  - `width`: 너비 (기본: 120)
  - `height`: 높이 (기본: 60)

### 예시
```yaml
nodes:
  - id: client
    type: box
    label: "Client"
    position: { x: 100, y: 200 }
    style:
      color: "#3b82f6"
      shape: rounded-rect

  - id: database
    type: database
    label: "MySQL\nDatabase"
    position: { x: 500, y: 200 }
```

## Edge (엣지)

두 노드 간의 연결선입니다.

### 필수 필드
- `id`: 고유 식별자
- `from`: 출발 노드 ID
- `to`: 도착 노드 ID

### 선택 필드
- `label`: 엣지 라벨 텍스트
- `style`: 스타일 객체
  - `color`: 선 색상
  - `lineType`: `solid`, `dashed`, `dotted`
  - `lineWidth`: 선 두께 (기본: 3)
  - `animated`: 애니메이션 여부

### 예시
```yaml
edges:
  - id: client-to-server
    from: client
    to: server
    label: "HTTP Request"
    style:
      color: "#10b981"
      lineType: solid
```

## Scenario (시나리오)

애니메이션 시퀀스를 정의합니다.

### 필수 필드
- `id`: 고유 식별자
- `steps`: 실행할 스텝 배열

### 선택 필드
- `name`: 표시 이름
- `description`: 설명
- `init`: 변수 초기화

### 예시
```yaml
scenarios:
  - id: request-flow
    name: "요청 흐름"
    steps:
      - action: highlight
        nodes: [client]
        duration: 1000
      - action: animate-edge
        edge: client-to-server
        duration: 800
```

## Step Actions (스텝 액션)

### highlight
노드나 엣지를 강조합니다.
```yaml
- action: highlight
  nodes: [node-id-1, node-id-2]
  edges: [edge-id]
  style:
    color: "#ef4444"
    glow: true
  duration: 1000
```

### animate-edge
엣지를 따라 애니메이션을 실행합니다.
```yaml
- action: animate-edge
  edge: edge-id
  label: "데이터 전송"
  duration: 800
```

### delay
지정된 시간만큼 대기합니다.
```yaml
- action: delay
  duration: 500
```

### log
로그 패널에 메시지를 출력합니다.
```yaml
- action: log
  log:
    message: "요청 처리 완료"
    type: success  # info, success, warning, error
```

### reset
다이어그램을 초기 상태로 리셋합니다.
```yaml
- action: reset
```

### parallel
여러 스텝을 동시에 실행합니다.
```yaml
- action: parallel
  steps:
    - action: highlight
      nodes: [node-1]
    - action: highlight
      nodes: [node-2]
```

### conditional
조건에 따라 다른 스텝을 실행합니다.
```yaml
- action: conditional
  condition: { $var: "cache-hit" }
  then:
    - action: highlight
      nodes: [cache]
  else:
    - action: highlight
      nodes: [database]
```

### goto
다른 시나리오로 이동합니다.
```yaml
- action: goto
  scenario: another-scenario-id
```

## Canvas (캔버스)

다이어그램 캔버스 설정입니다.

```yaml
canvas:
  width: 1200
  height: 800
  background: "#ffffff"
  sections:
    - id: frontend
      label: "Frontend"
      bounds: { y: 0, height: 300 }
      style:
        background: "rgba(59, 130, 246, 0.1)"
    - id: backend
      label: "Backend"
      bounds: { y: 300, height: 500 }
```

## Variables (변수)

시나리오에서 사용할 변수를 정의합니다.

```yaml
variables:
  - name: cache-hit
    type: boolean
    default: false
  - name: latency
    type: number
    default: 100
```

## Expressions (표현식)

동적 값을 위한 표현식입니다.

- `{ $var: "variable-name" }`: 변수 참조
- `{ $random: { probability: 0.5 } }`: 랜덤 boolean
- `{ $random: { min: 10, max: 100 } }`: 랜덤 숫자
- `{ $add: [a, b] }`: 덧셈
- `{ $multiply: [a, b] }`: 곱셈
- `{ $if: { condition: ..., then: ..., else: ... } }`: 조건

## Stats (통계)

통계 패널을 정의합니다.

```yaml
stats:
  - id: request-count
    label: "요청 수"
    unit: "건"
  - id: avg-latency
    label: "평균 지연"
    unit: "ms"
    format: "0.00"
```

스텝에서 통계 업데이트:
```yaml
- action: highlight
  nodes: [server]
  stats:
    request-count: 1
    avg-latency: 150
```

## Logging (로깅)

로그 패널 설정입니다.

```yaml
logging:
  enabled: true
  maxEntries: 20
  timestampFormat: "HH:mm:ss"
```

## Controls (컨트롤)

UI 컨트롤 설정입니다.

```yaml
controls:
  scenarios:
    position: top-right
  speed:
    min: 0.5
    max: 2.0
    default: 1.0
  buttons:
    - type: play
    - type: reset
```

## 완전한 예시

```yaml
version: "1.0"
metadata:
  title: "API 요청 흐름"
  description: "클라이언트-서버 통신 시각화"

canvas:
  width: 1000
  height: 600

nodes:
  - id: client
    type: box
    label: "Client"
    position: { x: 100, y: 250 }
    style:
      color: "#3b82f6"

  - id: server
    type: box
    label: "API Server"
    position: { x: 400, y: 250 }
    style:
      color: "#10b981"

  - id: database
    type: database
    label: "Database"
    position: { x: 700, y: 250 }

edges:
  - id: req
    from: client
    to: server
    label: "Request"

  - id: query
    from: server
    to: database
    label: "Query"

  - id: result
    from: database
    to: server
    label: "Result"

  - id: res
    from: server
    to: client
    label: "Response"

scenarios:
  - id: main
    name: "API 요청"
    steps:
      - action: highlight
        nodes: [client]
        log:
          message: "클라이언트에서 요청 시작"
          type: info
        duration: 1000

      - action: animate-edge
        edge: req
        label: "GET /api/data"
        duration: 800

      - action: highlight
        nodes: [server]
        log:
          message: "서버에서 요청 처리"
          type: info
        duration: 500

      - action: animate-edge
        edge: query
        label: "SELECT * FROM data"
        duration: 600

      - action: highlight
        nodes: [database]
        log:
          message: "데이터베이스 쿼리 실행"
          type: info
        duration: 800

      - action: animate-edge
        edge: result
        duration: 600

      - action: animate-edge
        edge: res
        label: "200 OK"
        duration: 800

      - action: highlight
        nodes: [client]
        log:
          message: "응답 수신 완료"
          type: success
        duration: 1000

logging:
  enabled: true
  maxEntries: 10
```

## 주의사항

1. 모든 ID는 고유해야 합니다
2. ID는 소문자, 숫자, 하이픈만 허용됩니다
3. ID는 소문자로 시작해야 합니다
4. 엣지의 from/to는 존재하는 노드 ID를 참조해야 합니다
5. goto 액션의 scenario는 존재하는 시나리오 ID를 참조해야 합니다
6. position의 x, y 값은 0 이상이어야 합니다
7. duration은 0보다 커야 합니다
