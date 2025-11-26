# Data Model: AnimFlow DSL Engine

**Feature**: 001-animflow-dsl-engine
**Date**: 2025-11-26

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Diagram                                     │
│  - version: string                                                       │
│  - metadata: Metadata                                                    │
│  - canvas: CanvasConfig                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  1:N → nodes: Node[]                                                    │
│  1:N → edges: Edge[]                                                    │
│  1:N → scenarios: Scenario[]                                            │
│  1:N → variables: Variable[]                                            │
│  1:1 → controls: Controls                                               │
│  1:N → stats: Stat[]                                                    │
│  1:1 → logging: LoggingConfig                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│        Node         │     │        Edge         │
│  - id: string (PK)  │     │  - id: string (PK)  │
│  - type: NodeType   │◀────│  - from: string (FK)│
│  - label: string    │     │  - to: string (FK)  │
│  - position: Point  │     │  - label: string    │
│  - section?: string │     │  - style: EdgeStyle │
│  - style: NodeStyle │     └─────────────────────┘
└─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            Scenario                                      │
│  - id: string (PK)                                                       │
│  - name: string                                                          │
│  - description?: string                                                  │
│  - init: Record<string, Expression>                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  1:N → steps: Step[]                                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                              Step                                        │
│  - action: ActionType                                                    │
│  - nodes?: string[]                                                      │
│  - edges?: string[]                                                      │
│  - edge?: string                                                         │
│  - style?: AnimationStyle                                                │
│  - label?: string                                                        │
│  - duration?: number | Expression                                        │
│  - log?: LogMessage                                                      │
│  - stats?: Record<string, number>                                        │
│  - condition?: Expression (for conditional)                              │
│  - then?: Step[] (for conditional)                                       │
│  - else?: Step[] (for conditional)                                       │
│  - scenario?: string (for goto)                                          │
│  - steps?: Step[] (for parallel)                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Entities

### Diagram (Root Entity)

전체 AnimFlow 다이어그램의 최상위 컨테이너.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | ✅ | DSL 버전 (예: "1.0") |
| metadata | Metadata | ❌ | 제목, 작성자, 설명, 태그 |
| canvas | CanvasConfig | ❌ | 캔버스 크기, 배경색, 섹션 |
| nodes | Node[] | ✅ | 노드 목록 (최소 1개) |
| edges | Edge[] | ❌ | 엣지 목록 |
| variables | Variable[] | ❌ | 전역 변수 정의 |
| scenarios | Scenario[] | ❌ | 애니메이션 시나리오 목록 |
| controls | Controls | ❌ | UI 컨트롤 설정 |
| stats | Stat[] | ❌ | 통계 패널 정의 |
| logging | LoggingConfig | ❌ | 로그 패널 설정 |

### Node

다이어그램의 개별 구성 요소 (박스, 원 등).

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | ✅ | - | 고유 식별자 (lowercase, alphanumeric, hyphen) |
| type | NodeType | ❌ | "box" | 노드 유형 |
| label | string | ✅ | - | 표시 텍스트 (\n으로 줄바꿈) |
| position | Point | ✅ | - | x, y 좌표 |
| section | string | ❌ | - | 소속 섹션 ID |
| style | NodeStyle | ❌ | {} | 스타일 속성 |

**NodeType Enum**: `box` | `circle` | `database` | `icon` | `group`

### Edge

두 노드 간의 연결선.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | ✅ | - | 고유 식별자 |
| from | string | ✅ | - | 출발 노드 ID |
| to | string | ✅ | - | 도착 노드 ID |
| label | string | ❌ | - | 엣지 라벨 텍스트 |
| style | EdgeStyle | ❌ | {} | 스타일 속성 |

### Scenario

애니메이션 시퀀스 정의.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | 고유 식별자 |
| name | string | ❌ | 표시 이름 |
| description | string | ❌ | 설명 |
| init | Record<string, Expression> | ❌ | 시작 시 변수 초기화 |
| steps | Step[] | ✅ | 실행할 스텝 목록 |

### Step

시나리오 내 개별 애니메이션 액션.

| Field | Type | Required | Applicable Actions | Description |
|-------|------|----------|-------------------|-------------|
| action | ActionType | ✅ | all | 액션 유형 |
| nodes | string[] | ❌ | highlight | 대상 노드 ID 목록 |
| edges | string[] | ❌ | highlight | 대상 엣지 ID 목록 |
| edge | string | ❌ | animate-edge | 대상 엣지 ID |
| style | AnimationStyle | ❌ | highlight, animate-edge | 애니메이션 스타일 |
| label | string | ❌ | highlight, animate-edge | 표시 라벨 |
| duration | number \| Expression | ❌ | all | 지속 시간 (ms), 기본 1000 |
| log | LogMessage | ❌ | all | 로그 패널에 표시할 메시지 |
| stats | Record<string, number> | ❌ | all | 통계 값 업데이트 |
| condition | Expression | ❌ | conditional | 조건 표현식 |
| then | Step[] | ❌ | conditional | 조건 참일 때 스텝 |
| else | Step[] | ❌ | conditional | 조건 거짓일 때 스텝 |
| scenario | string | ❌ | goto | 이동할 시나리오 ID |
| steps | Step[] | ❌ | parallel | 병렬 실행할 스텝 목록 |

**ActionType Enum**: `highlight` | `animate-edge` | `update-stat` | `log` | `delay` | `conditional` | `goto` | `parallel` | `reset`

## Supporting Types

### Metadata

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ❌ | 다이어그램 제목 |
| author | string | ❌ | 작성자 |
| description | string | ❌ | 설명 |
| tags | string[] | ❌ | 태그 목록 |

### CanvasConfig

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| width | number | ❌ | 1200 | 캔버스 너비 (px) |
| height | number | ❌ | 800 | 캔버스 높이 (px) |
| background | string | ❌ | "#ffffff" | 배경색 (hex) |
| sections | Section[] | ❌ | [] | 캔버스 영역 구분 |

### Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | 섹션 식별자 |
| label | string | ❌ | 표시 라벨 |
| bounds | Bounds | ✅ | y, height 영역 |
| style | SectionStyle | ❌ | 배경색, 라벨 색상 |

### Point

| Field | Type | Required |
|-------|------|----------|
| x | number | ✅ |
| y | number | ✅ |

### NodeStyle

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| color | string | "#3b82f6" | 테두리/채움 색상 |
| shape | ShapeType | "rounded-rect" | 도형 모양 |
| width | number | 120 | 너비 |
| height | number | 60 | 높이 |
| icon | string | - | 아이콘 이름 (icon 타입) |

**ShapeType Enum**: `rect` | `rounded-rect` | `circle` | `diamond`

### EdgeStyle

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| color | string | "#adb5bd" | 선 색상 |
| lineType | LineType | "solid" | 선 유형 |
| lineWidth | number | 3 | 선 두께 |
| animated | boolean | false | 애니메이션 여부 |

**LineType Enum**: `solid` | `dashed` | `dotted`

### AnimationStyle

| Field | Type | Description |
|-------|------|-------------|
| color | string | 하이라이트 색상 |
| glow | boolean | 발광 효과 |

### LogMessage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | ✅ | 로그 메시지 |
| type | LogType | ❌ | 로그 유형 (기본: "info") |

**LogType Enum**: `info` | `success` | `warning` | `error`

### Variable

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | 변수 이름 |
| type | VariableType | ✅ | 변수 타입 |
| default | any | ❌ | 기본값 |

**VariableType Enum**: `boolean` | `number` | `string`

### Expression

DSL 내 표현식 (런타임 평가).

```typescript
type Expression =
  | { $var: string }                           // 변수 참조
  | { $random: { probability: number } }       // 랜덤 boolean
  | { $random: { min: number, max: number } }  // 랜덤 number
  | { $add: (number | Expression)[] }          // 덧셈
  | { $multiply: (number | Expression)[] }     // 곱셈
  | { $subtract: [number | Expression, number | Expression] }
  | { $if: { condition: Expression, then: any, else: any } }
  | { $eq: [any, any] }                        // 동등 비교
  | { $gt: [number, number] }                  // 크다
  | { $and: Expression[] }                     // 논리 AND
  | { $or: Expression[] }                      // 논리 OR
  | number | string | boolean;                 // 리터럴
```

### Controls

| Field | Type | Description |
|-------|------|-------------|
| scenarios | ControlGroup | 시나리오 선택 버튼 그룹 |
| speed | SpeedControl | 속도 조절 UI |
| buttons | Button[] | 추가 버튼 (시작, 리셋) |

### Stat

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | 통계 ID |
| label | string | ✅ | 표시 라벨 |
| unit | string | ❌ | 단위 (예: "ms", "%") |
| format | string | ❌ | 숫자 포맷 (예: "0.00") |
| compute | Expression | ❌ | 계산식 |

### LoggingConfig

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| enabled | boolean | true | 로그 패널 활성화 |
| maxEntries | number | 20 | 최대 표시 항목 수 |
| timestampFormat | string | "HH:mm:ss" | 타임스탬프 형식 |
| styles | LogStyles | {} | 로그 타입별 스타일 |

## Validation Rules

### Cross-Field Validations

1. **Edge Reference Integrity**: 모든 `edge.from`과 `edge.to`는 존재하는 `node.id`를 참조해야 함
2. **Node ID Uniqueness**: 모든 `node.id`는 고유해야 함
3. **Edge ID Uniqueness**: 모든 `edge.id`는 고유해야 함
4. **Scenario ID Uniqueness**: 모든 `scenario.id`는 고유해야 함
5. **Section Reference**: `node.section`이 있으면 해당 `section.id`가 존재해야 함
6. **Goto Reference**: `step.scenario`는 존재하는 `scenario.id`를 참조해야 함
7. **Stat Reference**: `step.stats`의 키는 정의된 `stat.id`와 일치해야 함

### Value Constraints

1. **Position**: x, y ≥ 0
2. **Canvas Size**: width, height > 0
3. **Duration**: duration > 0
4. **Color**: 유효한 hex 색상 코드 (#RRGGBB 또는 #RGB)
5. **Probability**: 0 ≤ probability ≤ 1
6. **ID Format**: `/^[a-z][a-z0-9-]*$/`

## State Transitions

### Scenario Execution States

```
IDLE → RUNNING → PAUSED → RUNNING → COMPLETED
         ↓         ↓
       RESET     RESET
         ↓         ↓
        IDLE     IDLE
```

| State | Description |
|-------|-------------|
| IDLE | 초기 상태, 시나리오 미실행 |
| RUNNING | 스텝 순차 실행 중 |
| PAUSED | 일시 정지 (향후 기능) |
| COMPLETED | 모든 스텝 완료 |

### Variable Lifecycle

1. **Initialization**: 시나리오 `init` 블록에서 변수 초기화
2. **Update**: 스텝 내 표현식으로 값 변경 가능 (향후)
3. **Reset**: 시나리오 재시작 시 `init` 값으로 리셋
