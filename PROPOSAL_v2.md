# AnimFlow DSL v2 - 간결한 문법 제안

> **Version**: 2.0 (2025-11-26)
> **목표**: Mermaid처럼 직관적이고, YAML의 가독성을 유지하면서 최소한의 문법으로 표현

---

## 1. 설계 원칙

| 원칙 | 설명 |
|------|------|
| **Less is More** | 필수 속성만 요구, 나머지는 스마트 기본값 |
| **화살표 문법** | `A --> B` 형태로 엣지 정의 |
| **인라인 스타일** | `#color`, `@icon` 등 단축 문법 |
| **자연어 친화** | `after 1s`, `if hit` 등 읽기 쉬운 표현 |
| **암묵적 ID** | label에서 자동 생성 가능 |

---

## 2. 문법 비교: v1 vs v2

### 2.1 노드 정의

**v1 (복잡)**
```yaml
nodes:
  - id: client
    type: box
    label: "Client"
    position: { x: 100, y: 150 }
    style:
      color: "#3b82f6"
      shape: rounded-rect
      width: 120
      height: 60
```

**v2 (간결)**
```yaml
nodes:
  client: Client #3b82f6 @100,150
  backend: Go Backend #3b82f6 @250,150
  cache: Gocache (L1) #f59e0b @400,150
```

**v2 문법 설명:**
```
id: label #color @x,y
```
- `id:` - 노드 ID (필수)
- `label` - 표시 텍스트
- `#color` - 색상 (선택, 기본: #3b82f6)
- `@x,y` - 위치 (선택, 자동 배치 가능)

### 2.2 엣지 정의

**v1 (복잡)**
```yaml
edges:
  - id: e1
    from: client
    to: go-backend
    label: "① Token"
    style:
      color: "#adb5bd"
      lineType: solid
      animated: false
```

**v2 (간결)**
```yaml
flow:
  client --> backend: ① Token
  backend --> cache: ② Check
  cache -.-> keycloak: ③ Miss  # 점선
  cache ==> backend: ④ Hit    # 굵은선
```

**v2 화살표 문법:**
```
source --> target: label
```
| 화살표 | 의미 |
|--------|------|
| `-->` | 실선 |
| `-.->` | 점선 |
| `==>` | 굵은 실선 (강조) |
| `<-->` | 양방향 |

### 2.3 시나리오 정의

**v1 (복잡)**
```yaml
scenarios:
  - id: cache-hit
    name: "전체 캐시 히트"
    init:
      jwtCacheHit: true
    steps:
      - action: highlight
        nodes: [client, go-backend]
        edge: e1
        label: "HTTP Request"
        duration: 1000
        log: { message: "요청 시작", type: "info" }

      - action: animate-edge
        edge: e2
        style: { color: "#10b981", glow: true }
        label: "✓ Cache Hit!"
        duration: 800
        log: { message: "캐시 히트!", type: "success" }
```

**v2 (간결)**
```yaml
scenarios:
  cache-hit: 전체 캐시 히트
    set hit = true

    [client -> backend] "HTTP Request" | 요청 시작
    wait 1s
    [backend -> cache] "② Check" #10b981 glow | 캐시 확인 중

    if hit:
      [cache => backend] "✓ Hit!" #10b981 | success: 캐시 히트!
      stat jwt-time = 0.1
    else:
      [cache -> keycloak] "✗ Miss" #ef4444 | warning: 캐시 미스
```

**v2 시나리오 문법:**
```
scenario-id: 시나리오 이름
  set variable = value           # 변수 설정
  [from -> to] "label" #color    # 애니메이션
  wait 1s                        # 대기
  if condition:                  # 조건부
    ...
  stat stat-id = value           # 통계 업데이트
```

### 2.4 조건부 / 랜덤

**v1 (복잡)**
```yaml
init:
  jwtCacheHit: { $random: { probability: 0.8 } }
steps:
  - action: conditional
    condition: { $var: jwtCacheHit }
    then:
      - action: animate-edge
        edge: e2
        style: { color: "#10b981" }
    else:
      - action: animate-edge
        edge: e2
        style: { color: "#ef4444" }
```

**v2 (간결)**
```yaml
scenarios:
  random: 랜덤 시뮬레이션
    set hit = random(0.8)        # 80% 확률로 true
    set latency = random(1, 10)  # 1~10 사이 랜덤

    if hit:
      [cache => backend] "Hit!" #10b981
    else:
      [cache -> keycloak] "Miss" #ef4444
```

---

## 3. 완전한 예시: v1 vs v2

### v1 (기존 - 178줄)
```yaml
version: "1.0"
metadata:
  title: "캐싱 플로우"

canvas:
  width: 1400
  height: 800
  background: "#f8f9fa"
  sections:
    - id: auth-layer
      label: "인증 레이어"
      bounds: { y: 0, height: 380 }

nodes:
  - id: client
    type: box
    label: "Client"
    position: { x: 100, y: 150 }
    style:
      color: "#3b82f6"
  - id: backend
    type: box
    label: "Go Backend"
    position: { x: 250, y: 150 }
    style:
      color: "#3b82f6"
  - id: cache
    type: box
    label: "Gocache"
    position: { x: 400, y: 150 }
    style:
      color: "#f59e0b"

edges:
  - id: e1
    from: client
    to: backend
    label: "Request"
  - id: e2
    from: backend
    to: cache
    label: "Check"

scenarios:
  - id: demo
    steps:
      - action: highlight
        nodes: [client, backend]
        duration: 1000
      - action: animate-edge
        edge: e2
        style: { color: "#10b981" }

controls:
  scenarios:
    type: button-group
    options:
      - { id: demo, label: "Demo" }
```

### v2 (신규 - 42줄)
```yaml
title: 캐싱 플로우
size: 1400x800

# 레이어 구분 (선택적)
layers:
  auth: 인증 레이어 | 0-380
  authz: 인가 레이어 | 380-800

# 노드 - 한 줄에 하나씩
nodes:
  client: Client #3b82f6 @100,150
  backend: Go Backend #3b82f6 @250,150
  cache: Gocache (L1) #f59e0b @400,150
  keycloak: Keycloak #ec4899 @600,150

# 연결 - 화살표 문법
flow:
  client --> backend: ① Request
  backend --> cache: ② Check
  cache -.-> keycloak: (on miss)

# 시나리오 - 들여쓰기로 스텝 구분
scenarios:
  cache-hit: 캐시 히트
    [client -> backend] "Request" | 요청 시작
    [backend -> cache] "Check" | 캐시 확인
    [cache => backend] "Hit!" #10b981 glow | success: 캐시 히트!

  random: 랜덤 시뮬레이션
    set hit = random(0.8)
    [client -> backend] "Request"
    if hit:
      [cache => backend] "Hit!" #10b981
    else:
      [cache -> keycloak] "Miss" #ef4444

# 통계 (자동 생성)
stats: [jwt-time ms, opa-time ms, hit-rate %]

# 컨트롤 (자동 생성)
controls: [start, reset, speed]
```

**결과: 178줄 → 42줄 (76% 감소)**

---

## 4. v2 문법 명세

### 4.1 기본 구조

```yaml
title: 다이어그램 제목          # 필수
size: 1200x800                  # 선택 (기본: 1200x800)

nodes:                          # 필수
  id: Label #color @x,y

flow:                           # 선택
  a --> b: label

scenarios:                      # 선택
  scenario-id: 이름
    스텝들...

stats: [stat-id unit, ...]      # 선택
controls: [start, reset, ...]   # 선택 (기본: 자동 생성)
```

### 4.2 노드 문법

```
id: Label #color @x,y [options]
```

| 요소 | 필수 | 설명 | 예시 |
|------|------|------|------|
| `id:` | O | 고유 식별자 | `client:` |
| `Label` | O | 표시 텍스트 | `Go Backend` |
| `#color` | X | 색상 코드 | `#3b82f6` |
| `@x,y` | X | 위치 좌표 | `@100,150` |
| `[options]` | X | 추가 옵션 | `[icon:db]` |

**줄바꿈 레이블:**
```yaml
cache: |
  Gocache
  (L1 Cache)
```

### 4.3 엣지 문법

```
source ARROW target: label #color [options]
```

| 화살표 | 선 스타일 | 용도 |
|--------|-----------|------|
| `-->` | 실선 | 기본 연결 |
| `-.->` | 점선 | 선택적/비동기 |
| `==>` | 굵은선 | 강조/성공 |
| `x-->` | 실선+X | 실패/차단 |
| `<-->` | 양방향 | 상호 통신 |

### 4.4 시나리오 문법

```yaml
scenario-id: 시나리오 이름
  # 변수 설정
  set varname = value
  set hit = random(0.8)      # 80% true
  set delay = random(1, 10)  # 1~10 랜덤

  # 애니메이션 스텝
  [from -> to] "label" #color options | log-type: message

  # 대기
  wait 500ms
  wait 1s

  # 조건부
  if condition:
    스텝들...
  else:
    스텝들...

  # 통계 업데이트
  stat stat-id = value

  # 다른 시나리오 호출
  goto other-scenario
```

**스텝 옵션:**
| 옵션 | 설명 |
|------|------|
| `glow` | 발광 효과 |
| `pulse` | 깜빡임 효과 |
| `slow` | 느린 애니메이션 |
| `fast` | 빠른 애니메이션 |

**로그 타입:**
| 타입 | 표시 |
|------|------|
| `info:` | 파란색 정보 |
| `success:` | 초록색 성공 |
| `warning:` | 주황색 경고 |
| `error:` | 빨간색 에러 |

### 4.5 통계 및 컨트롤

```yaml
# 통계 패널 - 간단 문법
stats: [jwt-time ms, opa-time ms, hit-rate %]

# 통계 패널 - 상세 문법
stats:
  jwt-time: JWT 검증 시간 | ms | 0.00
  opa-time: OPA 평가 시간 | ms
  hit-rate: 캐시 히트율 | %

# 컨트롤 - 간단 문법 (자동 생성)
controls: [start, reset, speed]

# 컨트롤 - 상세 문법
controls:
  scenarios: [cache-hit: ✅ 캐시, cache-miss: ❌ 미스, random: 🎲 랜덤]
  speed: [slow: 느림, normal: 보통, fast: 빠름]
```

---

## 5. 고급 기능

### 5.1 그룹핑

```yaml
nodes:
  # 그룹 정의
  auth-group: [인증 레이어] #f0f0f0
    client: Client @100,150
    backend: Backend @250,150

  cache-group: [캐시 레이어] #fff0f0
    l1: L1 Cache @400,150
    l2: L2 Cache @400,300
```

### 5.2 병렬 실행

```yaml
scenarios:
  parallel-demo: 병렬 처리
    # 동시에 실행
    parallel:
      [backend -> cache1] "Check L1"
      [backend -> cache2] "Check L2"

    # 모두 완료 후 다음 진행
    [backend => client] "Response"
```

### 5.3 반복

```yaml
scenarios:
  retry-demo: 재시도 로직
    repeat 3:
      [client -> server] "Request"
      if success:
        break
      wait 1s
```

### 5.4 템플릿/재사용

```yaml
# 공통 애니메이션 정의
templates:
  cache-check: |
    [backend -> cache] "Check" | 캐시 확인 중
    wait 500ms

scenarios:
  demo: 데모
    use cache-check  # 템플릿 사용
    [cache => backend] "Hit!"
```

---

## 6. 마이그레이션 가이드

### 기존 HTML → v2 DSL 변환

**JavaScript 노드 정의:**
```javascript
const nodes = {
    client: { x: 100, y: 150, label: 'Client', color: '#3b82f6' },
    goBackend: { x: 250, y: 150, label: 'Go Backend', color: '#3b82f6' },
};
```

**v2 DSL:**
```yaml
nodes:
  client: Client #3b82f6 @100,150
  backend: Go Backend #3b82f6 @250,150
```

**JavaScript 애니메이션:**
```javascript
await animateStep(nodes.client, nodes.goBackend, '#3b82f6', 'Request', 'info');
await sleep(1000);
await animateStep(nodes.goBackend, nodes.cache, '#10b981', 'Cache Hit!', 'success');
```

**v2 DSL:**
```yaml
[client -> backend] "Request" | info: 요청 시작
wait 1s
[backend -> cache] "Cache Hit!" #10b981 | success: 캐시 히트!
```

---

## 7. 파서 구현 고려사항

### 7.1 토크나이저 규칙

```javascript
// 노드 파싱 정규식
const nodePattern = /^(\w+):\s*(.+?)\s*(#[0-9a-fA-F]{6})?\s*(@\d+,\d+)?$/;

// 엣지 파싱 정규식
const edgePattern = /^(\w+)\s*(-->|-.->|==>|<-->)\s*(\w+):\s*(.+)$/;

// 스텝 파싱 정규식
const stepPattern = /^\[(\w+)\s*(->|=>)\s*(\w+)\]\s*"(.+?)"\s*(#\w+)?\s*(\w+)?\s*\|\s*(.+)?$/;
```

### 7.2 AST 구조

```typescript
interface AnimFlowAST {
  title: string;
  size: { width: number; height: number };
  nodes: Map<string, Node>;
  edges: Edge[];
  scenarios: Map<string, Scenario>;
  stats: Stat[];
  controls: Control[];
}

interface Node {
  id: string;
  label: string;
  color?: string;
  position?: { x: number; y: number };
}

interface Scenario {
  id: string;
  name: string;
  steps: Step[];
}

type Step =
  | { type: 'animate'; from: string; to: string; label: string; style?: Style }
  | { type: 'wait'; duration: number }
  | { type: 'condition'; condition: string; then: Step[]; else?: Step[] }
  | { type: 'stat'; id: string; value: number | string }
  | { type: 'goto'; scenario: string };
```

---

## 8. 결론

### v1 vs v2 비교

| 항목 | v1 | v2 |
|------|----|----|
| 코드 줄 수 | 178줄 | 42줄 |
| 학습 곡선 | 중간 | 낮음 |
| 가독성 | 중간 | 높음 |
| 표현력 | 높음 | 높음 |
| JSON Schema 검증 | 용이 | 커스텀 파서 필요 |
| IDE 자동완성 | YAML 기본 | 커스텀 LSP 필요 |

### 권장 접근 방식

```
1. v2를 기본 문법으로 채택 (사용자 친화적)
2. v2 → v1 변환기 제공 (내부적으로 v1 AST 사용)
3. 파워 유저를 위해 v1도 지원 유지
```

### 비전

```
"YAML의 구조 + Mermaid의 간결함 + 애니메이션의 역동성"
```

---

*AnimFlow DSL v2 제안서*
*작성일: 2025-11-26*
