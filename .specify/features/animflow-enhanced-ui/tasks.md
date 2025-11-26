# AnimFlow Enhanced UI - Implementation Tasks

## Phase 1: Layout System Foundation

### 1.1 Schema Extensions
- [ ] **[SCHEMA]** `animflow.schema.json`에 `layout` 정의 추가
  - `header`: title, subtitle, style
  - `legend`: enabled, position, items
  - `footer`: text, style
  - `slots`: position, components 배열
- [ ] **[TYPES]** `src/types/layout.ts` 생성
  - `LayoutConfig`, `HeaderConfig`, `LegendConfig`, `FooterConfig` 인터페이스
  - `SlotPosition` 타입 ('top' | 'main' | 'bottom')
- [ ] **[TYPES]** `src/types/index.ts`에 layout 타입 export 추가

### 1.2 Layout Manager
- [ ] **[UI]** `src/ui/layout-manager.ts` 생성
  - `LayoutManager` 클래스 구현
  - 컨테이너 DOM 구조 생성 (slots 기반)
  - 컴포넌트 레지스트리 패턴 구현
  - `registerComponent(slot, component)` 메서드
  - `render()` 메서드
  - `destroy()` 메서드
- [ ] **[UI]** 기본 CSS 스타일 정의 (인라인)

### 1.3 Header Panel
- [ ] **[UI]** `src/ui/header-panel.ts` 생성
  - `HeaderPanel` 클래스 구현
  - 타이틀/서브타이틀 렌더링
  - 커스텀 스타일 지원 (background, color)
  - gradient 배경 지원

### 1.4 Legend Panel
- [ ] **[UI]** `src/ui/legend-panel.ts` 생성
  - `LegendPanel` 클래스 구현
  - 색상-레이블 쌍 렌더링
  - 위치 옵션 (top/bottom)
  - 동적 항목 추가/제거

### 1.5 Footer Panel
- [ ] **[UI]** `src/ui/footer-panel.ts` 생성
  - `FooterPanel` 클래스 구현
  - 텍스트 렌더링
  - 커스텀 스타일 지원

### 1.6 Integration
- [ ] **[CORE]** `AnimFlow` 클래스에 `LayoutManager` 통합
  - `options.layout` 처리
  - 레이아웃 초기화 순서 정의
- [ ] **[UI]** `src/ui/index.ts`에 새 컴포넌트 export 추가

---

## Phase 2: Scenario Presets System

### 2.1 Schema Extensions
- [ ] **[SCHEMA]** `animflow.schema.json`에 `presets` 정의 추가
  - `id`, `name`, `description`, `default`, `variables`
  - `extends` (상속 지원)
- [ ] **[TYPES]** `src/types/preset.ts` 생성
  - `PresetConfig` 인터페이스
  - `PresetVariables` 타입

### 2.2 Preset Store
- [ ] **[ENGINE]** `src/engine/preset-store.ts` 생성
  - `PresetStore` 클래스 구현
  - 프리셋 로드 및 캐싱
  - 상속 처리 (`extends`)
  - `getPreset(id)` 메서드
  - `getVariables(presetId)` 메서드
  - `listPresets()` 메서드

### 2.3 Preset Selector UI
- [ ] **[UI]** `src/ui/preset-selector.ts` 생성
  - `PresetSelector` 클래스 구현
  - 버튼 그룹 스타일 렌더링
  - 활성 프리셋 시각적 표시
  - 클릭 이벤트 핸들링
  - `onPresetChange` 콜백
- [ ] **[UI]** 버튼 hover/active 애니메이션
- [ ] **[A11Y]** 키보드 네비게이션 (Tab, Enter, Arrow keys)
- [ ] **[A11Y]** ARIA 레이블 추가

### 2.4 ScenarioRunner Integration
- [ ] **[ENGINE]** `ScenarioRunner`에 프리셋 지원 추가
  - `runWithPreset(scenarioId, presetId)` 메서드
  - 프리셋 변수를 VariableStore에 주입
- [ ] **[ENGINE]** VariableStore에 bulk set 메서드 추가
  - `setVariables(variables: Record<string, VariableValue>)`

### 2.5 ControlBar Enhancement
- [ ] **[UI]** `ControlBar`에 `PresetSelector` 통합
  - `showPresets` 옵션 추가
  - 프리셋 변경 시 이벤트 발생
- [ ] **[CORE]** `AnimFlow`에 `setPreset(presetId)` 메서드 추가

---

## Phase 3: Enhanced Stats Panel

### 3.1 Schema Extensions
- [ ] **[SCHEMA]** `stats` 정의 확장
  - `layout`: 'grid' | 'inline' | 'cards'
  - `columns`: number
  - `highlightOnChange`: boolean
  - `compute`: expression
- [ ] **[TYPES]** `src/types/stat.ts` 확장
  - `StatsLayoutConfig` 인터페이스
  - `ComputedStatConfig` 인터페이스

### 3.2 Stats Value Animation
- [ ] **[UTIL]** `src/utils/animate-value.ts` 생성
  - `animateValue(from, to, duration, callback)` 함수
  - easing 함수 지원 (linear, easeOut, easeInOut)
- [ ] **[UI]** `StatsPanel` 값 업데이트 시 애니메이션 적용
  - 숫자 카운트업 효과
  - 플래시 하이라이트 효과

### 3.3 Computed Stats
- [ ] **[ENGINE]** `StatStore`에 computed stat 지원 추가
  - `registerComputed(statId, expression)` 메서드
  - 의존 stat 변경 시 자동 재계산
- [ ] **[ENGINE]** ExpressionEvaluator에 `$divide` 연산자 추가

### 3.4 Stats Panel Layout
- [ ] **[UI]** `StatsPanel` 레이아웃 옵션 구현
  - Grid 레이아웃 (columns 설정 가능)
  - Card 스타일 (그림자, 라운드)
- [ ] **[UI]** 반응형 그리드 (auto-fit)

### 3.5 Update Batching
- [ ] **[UTIL]** `src/utils/update-batcher.ts` 생성
  - `UIUpdateBatcher` 클래스 구현
  - requestAnimationFrame 기반 배치 업데이트
- [ ] **[UI]** `StatsPanel`에 배치 업데이트 적용

---

## Phase 4: Performance Comparison Panel

### 4.1 Schema Extensions
- [ ] **[SCHEMA]** `animflow.schema.json`에 `comparison` 정의 추가
  - `enabled`, `title`
  - `items`: preset, label, value, description, color
- [ ] **[TYPES]** `src/types/comparison.ts` 생성
  - `ComparisonConfig`, `ComparisonItemConfig` 인터페이스

### 4.2 Comparison Panel UI
- [ ] **[UI]** `src/ui/comparison-panel.ts` 생성
  - `ComparisonPanel` 클래스 구현
  - 카드 그리드 레이아웃
  - 색상 강조 좌측 보더
  - 값/설명 텍스트 렌더링
- [ ] **[UI]** 현재 프리셋 하이라이트 효과
- [ ] **[UI]** hover 애니메이션

### 4.3 Integration
- [ ] **[UI]** `LayoutManager`에 `ComparisonPanel` 등록
- [ ] **[CORE]** 프리셋 변경 시 하이라이트 업데이트

---

## Phase 5: Polish & Accessibility

### 5.1 Animation Improvements
- [ ] **[UI]** 컴포넌트 등장 애니메이션 (fade-in)
- [ ] **[UI]** 버튼 ripple 효과
- [ ] **[UI]** 통계 카드 업데이트 pulse 효과

### 5.2 Accessibility
- [ ] **[A11Y]** 모든 인터랙티브 요소에 ARIA 레이블
- [ ] **[A11Y]** focus visible 스타일
- [ ] **[A11Y]** 스크린 리더 지원 테스트
- [ ] **[A11Y]** 고대비 모드 색상 검증

### 5.3 Documentation
- [ ] **[DOCS]** YAML 스키마 문서 업데이트
- [ ] **[DOCS]** 컴포넌트 API 문서
- [ ] **[DOCS]** 예제 YAML 파일 업데이트

### 5.4 Testing
- [ ] **[TEST]** LayoutManager 단위 테스트
- [ ] **[TEST]** PresetStore 단위 테스트
- [ ] **[TEST]** StatsPanel 애니메이션 테스트
- [ ] **[TEST]** 통합 테스트 (전체 플로우)

### 5.5 Demo Update
- [ ] **[DEMO]** `caching-flow.animflow.yaml` 업데이트
  - layout 설정 추가
  - presets 정의 추가
  - comparison 설정 추가
  - 향상된 stats 설정

---

## Task Dependencies

```
Phase 1.1 (Schema) ─┬─> Phase 1.2 (LayoutManager) ─┬─> Phase 1.6 (Integration)
                    ├─> Phase 1.3 (Header)         │
                    ├─> Phase 1.4 (Legend)         │
                    └─> Phase 1.5 (Footer) ────────┘

Phase 2.1 (Schema) ─┬─> Phase 2.2 (PresetStore) ──> Phase 2.4 (Runner)
                    └─> Phase 2.3 (Selector) ─────> Phase 2.5 (ControlBar)

Phase 3.1 (Schema) ─┬─> Phase 3.2 (Animation)
                    ├─> Phase 3.3 (Computed) ─────> Phase 3.4 (Layout)
                    └─> Phase 3.5 (Batching) ─────┘

Phase 4.1 (Schema) ──> Phase 4.2 (Panel) ─────────> Phase 4.3 (Integration)

All Phases ─────────────────────────────────────────> Phase 5 (Polish)
```

---

## Estimates

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1 | 10 | Medium |
| Phase 2 | 11 | Medium-High |
| Phase 3 | 9 | Medium |
| Phase 4 | 5 | Low |
| Phase 5 | 12 | Low-Medium |
| **Total** | **47** | |

---

## Priority Order

1. **P0 (Critical)**: Phase 1.1-1.2, Phase 2.1-2.3
2. **P1 (High)**: Phase 1.3-1.6, Phase 2.4-2.5, Phase 3.1-3.4
3. **P2 (Medium)**: Phase 4.1-4.3, Phase 3.5
4. **P3 (Low)**: Phase 5.1-5.5
