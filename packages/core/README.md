# @animflow/core

AnimFlow DSL Engine - 선언적 다이어그램 시각화 및 애니메이션 라이브러리

## 설치

```bash
npm install @animflow/core
```

## 빠른 시작

```typescript
import { AnimFlow } from '@animflow/core';

const animflow = new AnimFlow({
  container: '#diagram',
  source: yamlContent,
  format: 'yaml',
  showControls: true,
  enableLayout: true,
});

await animflow.render();
```

## API Reference

### AnimFlow 클래스

메인 진입점 클래스입니다.

#### 생성자 옵션

```typescript
interface AnimFlowOptions {
  container: HTMLElement | string;  // 대상 컨테이너
  source?: string;                  // YAML/JSON 소스
  format?: 'yaml' | 'json';         // 소스 포맷
  autoRender?: boolean;             // 자동 렌더링 (기본: true)
  pixelRatio?: number;              // 디바이스 픽셀 비율
  showControls?: boolean;           // 컨트롤바 표시
  defaultScenario?: string;         // 기본 시나리오 ID
  enableLayout?: boolean;           // 레이아웃 시스템 활성화
}
```

#### 메서드

```typescript
// 다이어그램 로드
loadSource(source: string, format?: 'yaml' | 'json'): void
async loadUrl(url: string, format?: 'yaml' | 'json'): Promise<void>

// 렌더링
async render(): Promise<void>
reset(): void

// 시나리오 실행
async runScenario(scenarioId: string): Promise<void>
async runScenarioWithPreset(scenarioId: string, presetId: string): Promise<void>
stopScenario(): void

// 프리셋 관리
setPreset(presetId: string): void
getPresets(): Array<{ id: string; name: string; description?: string; isDefault: boolean }>
getActivePresetId(): string | null

// 속도 제어
setSpeed(multiplier: number): void

// 상태 조회
getScenarioState(): ScenarioState  // 'idle' | 'running' | 'paused' | 'completed'
getScenarios(): Array<{ id: string; name: string; description?: string }>
getDiagram(): Diagram | null
getConfig(): DiagramConfig | null

// 이벤트
on<T>(event: AnimFlowEvent, handler: (payload: T) => void): void
off<T>(event: AnimFlowEvent, handler: (payload: T) => void): void

// 정리
destroy(): void
```

#### 이벤트

```typescript
type AnimFlowEvent =
  | 'render'           // 다이어그램 렌더링 완료
  | 'error'            // 에러 발생
  | 'scenario:start'   // 시나리오 시작
  | 'scenario:end'     // 시나리오 종료
  | 'scenario:step'    // 스텝 실행
  | 'state:change'     // 상태 변경
  | 'preset:change';   // 프리셋 변경

// 이벤트 리스너 예시
animflow.on('scenario:start', ({ scenarioId }) => {
  console.log(`시나리오 시작: ${scenarioId}`);
});

animflow.on('preset:change', ({ presetId }) => {
  console.log(`프리셋 변경: ${presetId}`);
});
```

---

## YAML 스키마 가이드

### 기본 구조

```yaml
version: "1.0"

metadata:
  title: "다이어그램 제목"
  description: "설명"

canvas:
  width: 1100
  height: 600
  background: "#f8fafc"

nodes:
  - id: node1
    label: "노드 1"
    position: { x: 100, y: 100 }

edges:
  - id: edge1
    from: node1
    to: node2

scenarios:
  - id: main
    name: "메인 시나리오"
    steps:
      - action: highlight
        nodes: [node1]
```

### Layout 설정

레이아웃 시스템은 Header, Legend, Footer 패널을 제공합니다.

```yaml
layout:
  header:
    title: "다이어그램 제목"
    subtitle: "부제목"
    style:
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
      color: "#ffffff"
      padding: "30px"

  legend:
    enabled: true
    title: "범례"
    items:
      - color: "#0ea5e9"
        label: "요청"
      - color: "#22c55e"
        label: "성공"
      - color: "#ef4444"
        label: "실패"

  footer:
    text: "푸터 텍스트"
    style:
      background: "#212529"
      color: "#adb5bd"
```

### Presets 설정

프리셋은 시나리오 실행 전에 변수를 미리 설정합니다.

```yaml
presets:
  - id: random
    name: "Random"
    description: "70% 확률"
    default: true
    variables:
      cacheHitProbability: 0.7

  - id: no-cache
    name: "No Cache"
    description: "캐시 없음"
    variables:
      cacheHitProbability: 0

  - id: full-cache
    name: "Full Cache"
    description: "전체 캐시"
    extends: random  # 상속 지원
    variables:
      cacheHitProbability: 1
```

### Comparison 설정

성능 비교 패널을 표시합니다.

```yaml
comparison:
  enabled: true
  title: "성능 비교"
  items:
    - preset: no-cache
      label: "캐시 없음"
      value: "~500ms"
      description: "매 요청마다 인증 필요"
      color: "#ef4444"

    - preset: full-cache
      label: "전체 캐시"
      value: "~10ms"
      description: "모든 요청이 캐시에서 처리"
      color: "#10b981"
```

### Node 설정

```yaml
nodes:
  - id: client
    label: "클라이언트"
    position:
      x: 150
      y: 80
    section: client-section  # 섹션 연결
    style:
      color: "#0ea5e9"
      shape: rounded-rect    # rect | rounded-rect | circle | diamond
      width: 140
      height: 70
```

### Edge 설정

```yaml
edges:
  - id: client-to-server
    from: client
    to: server
    label: "API 요청"
    style:
      color: "#64748b"
      lineType: solid        # solid | dashed | dotted
      lineWidth: 2
```

### Section 설정

```yaml
canvas:
  sections:
    - id: client-section
      label: "클라이언트 레이어"
      bounds:
        y: 0
        height: 150
      style:
        background: "#f0f9ff"
        labelColor: "#0369a1"
```

### Scenario 액션

#### highlight

노드를 강조 표시합니다.

```yaml
- action: highlight
  nodes: [node1, node2]
  style:
    color: "#0ea5e9"
    glow: true
  duration: 800
```

#### animate-edge

엣지에 애니메이션을 적용합니다.

```yaml
- action: animate-edge
  edge: client-to-server
  label: "데이터 전송"
  style:
    color: "#0ea5e9"
  duration: 1000
```

#### delay

대기 시간을 설정합니다.

```yaml
- action: delay
  duration: 500
```

#### reset

다이어그램을 초기 상태로 리셋합니다.

```yaml
- action: reset
```

#### conditional

조건부 분기를 실행합니다.

```yaml
- action: conditional
  condition: { "$var": "cacheHit" }
  then:
    - action: highlight
      nodes: [cache]
  else:
    - action: goto
      scenario: cache-miss-flow
```

#### goto

다른 시나리오로 이동합니다.

```yaml
- action: goto
  scenario: sub-scenario-id
```

#### parallel

여러 액션을 동시에 실행합니다.

```yaml
- action: parallel
  steps:
    - action: highlight
      nodes: [node1]
    - action: animate-edge
      edge: edge1
```

### 변수와 표현식

#### 변수 초기화

```yaml
scenarios:
  - id: main
    init:
      cacheHit: { "$random-bool": 0.7 }  # 70% 확률로 true
      counter: 0
      name: "test"
```

#### 표현식 타입

```yaml
# 변수 참조
{ "$var": "variableName" }

# 랜덤 불린 (확률)
{ "$random-bool": 0.7 }

# 랜덤 숫자 (범위)
{ "$random": { "min": 1, "max": 100 } }

# 산술 연산
{ "$add": [{ "$var": "a" }, { "$var": "b" }] }
{ "$multiply": [{ "$var": "a" }, 2] }
{ "$subtract": [10, { "$var": "a" }] }

# 비교 연산
{ "$eq": [{ "$var": "a" }, 5] }
{ "$gt": [{ "$var": "a" }, 10] }

# 논리 연산
{ "$and": [{ "$var": "a" }, { "$var": "b" }] }
{ "$or": [{ "$var": "a" }, { "$var": "b" }] }

# 조건부
{ "$if": { "condition": { "$var": "flag" }, "then": "yes", "else": "no" } }
```

---

## UI 컴포넌트 직접 사용

AnimFlow 외부에서 개별 컴포넌트를 직접 사용할 수 있습니다.

### LayoutManager

슬롯 기반 레이아웃 시스템입니다.

```typescript
import { LayoutManager, HeaderPanel, FooterPanel } from '@animflow/core';

const layout = new LayoutManager({
  container: document.getElementById('app'),
  config: layoutConfig,
});

// 컴포넌트 등록
const header = new HeaderPanel({ config: { title: '제목' } });
layout.registerComponent('top', header);

// 슬롯 조회
const mainSlot = layout.getMainSlot();
mainSlot.appendChild(canvas);

// 정리
layout.destroy();
```

### PresetSelector

프리셋 선택 버튼 그룹입니다.

```typescript
import { PresetSelector } from '@animflow/core';

const selector = new PresetSelector({
  presets: [
    { id: 'preset1', name: '프리셋 1', isDefault: true },
    { id: 'preset2', name: '프리셋 2' },
  ],
  activePresetId: 'preset1',
  onPresetChange: (presetId) => {
    console.log('선택된 프리셋:', presetId);
  },
});

container.appendChild(selector.render());

// 프리셋 변경
selector.setActivePreset('preset2');
```

### ComparisonPanel

성능 비교 카드 패널입니다.

```typescript
import { ComparisonPanel } from '@animflow/core';

const comparison = new ComparisonPanel({
  config: {
    title: '성능 비교',
    items: [
      { preset: 'fast', label: '빠름', value: '10ms', color: '#22c55e' },
      { preset: 'slow', label: '느림', value: '500ms', color: '#ef4444' },
    ],
  },
  activePresetId: 'fast',
  onPresetClick: (presetId) => {
    console.log('클릭된 프리셋:', presetId);
  },
});

container.appendChild(comparison.render());
```

### StatsPanel

통계 표시 패널입니다.

```typescript
import { StatsPanel } from '@animflow/core';

const stats = new StatsPanel({
  container: document.getElementById('stats'),
  title: '통계',
  layout: 'cards',  // 'list' | 'grid' | 'cards'
  columns: 2,
  animateValues: true,
  highlightOnChange: true,
  stats: [
    { id: 'requests', label: '요청 수', value: 0, format: 'number' },
    { id: 'hitRate', label: '적중률', value: 0, format: 'percentage' },
  ],
});

// 값 업데이트 (애니메이션 적용)
stats.updateStat('requests', 150);
stats.updateStat('hitRate', 85.5);

// 레이아웃 변경
stats.setLayout('grid', 3);
```

### HeaderPanel, LegendPanel, FooterPanel

레이아웃 패널 컴포넌트입니다.

```typescript
import { HeaderPanel, LegendPanel, FooterPanel } from '@animflow/core';

// 헤더
const header = new HeaderPanel({
  config: {
    title: '제목',
    subtitle: '부제목',
    style: { background: '#1e3c72', color: '#fff' },
  },
});

// 범례
const legend = new LegendPanel({
  config: {
    title: '범례',
    items: [
      { color: '#22c55e', label: '성공' },
      { color: '#ef4444', label: '실패' },
    ],
  },
});

// 푸터
const footer = new FooterPanel({
  config: {
    text: '푸터 텍스트',
    style: { background: '#212529' },
  },
});

// LayoutComponent 인터페이스
container.appendChild(header.render());
legend.addItem({ color: '#0ea5e9', label: '진행 중' });
footer.setText('새 푸터 텍스트');
```

---

## 유틸리티

### animateValue

숫자 값 애니메이션 유틸리티입니다.

```typescript
import { animateValue } from '@animflow/core';

const cancel = animateValue({
  from: 0,
  to: 100,
  duration: 1000,
  easing: 'easeOut',  // 'linear' | 'easeOut' | 'easeInOut' | 'easeOutBack'
  onUpdate: (value) => {
    element.textContent = Math.round(value).toString();
  },
  onComplete: () => {
    console.log('애니메이션 완료');
  },
});

// 취소
cancel();
```

---

## 전체 예제

```typescript
import { AnimFlow } from '@animflow/core';

async function createDiagram() {
  // YAML 로드
  const response = await fetch('/diagram.yaml');
  const source = await response.text();

  // AnimFlow 인스턴스 생성
  const animflow = new AnimFlow({
    container: '#diagram-container',
    source,
    format: 'yaml',
    showControls: true,
    enableLayout: true,
    defaultScenario: 'main',
  });

  // 렌더링
  await animflow.render();

  // 이벤트 리스너 등록
  animflow.on('scenario:start', ({ scenarioId }) => {
    console.log(`시나리오 시작: ${scenarioId}`);
  });

  animflow.on('preset:change', ({ presetId }) => {
    console.log(`프리셋 변경: ${presetId}`);
  });

  // 프리셋 목록 조회
  console.log('사용 가능한 프리셋:', animflow.getPresets());

  // 프리셋 변경
  animflow.setPreset('full-cache');

  // 시나리오 실행
  await animflow.runScenario('main');

  // 정리
  // animflow.destroy();
}

createDiagram();
```

---

## 타입 정의

주요 타입들은 `@animflow/core`에서 직접 import할 수 있습니다:

```typescript
import type {
  // 다이어그램
  DiagramConfig,
  NodeConfig,
  EdgeConfig,
  ScenarioConfig,

  // 레이아웃
  LayoutConfig,
  HeaderConfig,
  LegendConfig,
  FooterConfig,

  // 프리셋
  PresetConfig,
  PresetVariables,

  // 비교
  ComparisonConfig,
  ComparisonItemConfig,

  // 상태
  ScenarioState,
  StatState,
} from '@animflow/core';
```
