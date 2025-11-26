# AnimFlow Enhanced UI Feature Spec

## Overview

AnimFlow DSL Engine의 UI/UX를 개선하여 참조 HTML(`caching-flow-diagram.html`)과 동등한 수준의 인터랙티브 경험을 제공합니다.

## Problem Statement

현재 AnimFlow 구현은 핵심 렌더링과 시나리오 실행 기능은 갖추었으나, 사용자 경험을 위한 UI 컴포넌트들이 부족합니다:

1. **레이아웃 부재**: Header, Legend, Footer 등 기본 레이아웃 요소 없음
2. **통계 시각화 미흡**: Stats Panel 타입만 정의되고 실제 렌더링 및 업데이트 로직 부재
3. **시나리오 선택 UX 부족**: 프리셋 시나리오 버튼 그룹 UI 없음
4. **성능 비교 부재**: 시나리오별 성능 비교 패널 없음

## Goals

1. 완전한 레이아웃 시스템 구현 (Header, Legend, Stats, Logs, Footer)
2. 실시간 통계 업데이트 및 애니메이션
3. 시나리오 프리셋 버튼 그룹 UI
4. 성능 비교 패널
5. YAML/JSON에서 모든 UI 요소 선언적 정의 가능

## Non-Goals

- 모바일 반응형 레이아웃 (향후 별도 feature)
- 다크 모드 지원 (향후 별도 feature)
- 다국어 지원 (향후 별도 feature)

## Proposed Solution

### 1. Layout System

새로운 `LayoutManager` 클래스를 추가하여 전체 레이아웃을 관리합니다.

```yaml
# YAML 스키마 확장
layout:
  header:
    title: "LDAP + Keycloak + OPA 멀티 레이어 캐싱 플로우"
    subtitle: "인터랙티브 인증/인가 시스템 아키텍처 시뮬레이터"
    style:
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
      color: "#ffffff"

  legend:
    enabled: true
    position: "top"  # top | bottom | left | right
    items:
      - color: "#10b981"
        label: "캐시 히트 (Cache Hit)"
      - color: "#ef4444"
        label: "캐시 미스 (Cache Miss)"
      - color: "#3b82f6"
        label: "일반 요청"
      - color: "#f59e0b"
        label: "캐시 저장"

  footer:
    text: "© 2025 AnimFlow DSL Engine"
    style:
      background: "#212529"
      color: "#adb5bd"
```

### 2. Scenario Presets

시나리오 프리셋 시스템을 추가합니다.

```yaml
scenarios:
  presets:
    - id: random
      name: "🎲 랜덤"
      description: "실제 환경 시뮬레이션 (80% 캐시 히트율)"
      default: true
      variables:
        jwtCacheHit: { "$random-bool": 0.8 }
        infinispanHit: { "$random-bool": 0.7 }
        gocachePolicyHit: { "$random-bool": 0.85 }
        redisHit: { "$random-bool": 0.5 }

    - id: no-cache
      name: "❌ 캐시 없음"
      description: "모든 요청이 원본 소스로 이동"
      variables:
        jwtCacheHit: false
        infinispanHit: false
        gocachePolicyHit: false
        redisHit: false

    - id: partial-cache
      name: "⚡ 부분 캐시"
      description: "L2 캐시 활용"
      variables:
        jwtCacheHit: false
        infinispanHit: true
        gocachePolicyHit: false
        redisHit: true

    - id: full-cache
      name: "✅ 전체 캐시"
      description: "최적 성능"
      variables:
        jwtCacheHit: true
        infinispanHit: true
        gocachePolicyHit: true
        redisHit: true
```

### 3. Enhanced Stats Panel

통계 패널을 확장하여 실시간 업데이트와 애니메이션을 지원합니다.

```yaml
stats:
  layout: "grid"  # grid | inline | cards
  columns: 4
  items:
    - id: jwt-time
      label: "JWT 검증 시간"
      unit: "ms"
      format: "number"
      initialValue: "-"
      highlightOnChange: true

    - id: opa-time
      label: "OPA 평가 시간"
      unit: "ms"
      format: "number"
      initialValue: "-"
      highlightOnChange: true

    - id: total-time
      label: "총 응답 시간"
      unit: "ms"
      format: "number"
      compute: { "$add": [{ "$var": "jwt-time" }, { "$var": "opa-time" }, 1.85] }
      highlightOnChange: true

    - id: hit-rate
      label: "캐시 히트율"
      unit: "%"
      format: "percentage"
      highlightOnChange: true
```

### 4. Performance Comparison Panel

시나리오별 성능 비교 패널을 추가합니다.

```yaml
comparison:
  enabled: true
  title: "📊 시나리오별 성능 비교"
  items:
    - preset: no-cache
      label: "❌ 캐시 없음"
      value: "~25ms"
      description: "기준선 (0% 개선)"
      color: "#ef4444"

    - preset: partial-cache
      label: "⚡ 부분 캐시"
      value: "~3-10ms"
      description: "40-88% 개선"
      color: "#f59e0b"

    - preset: full-cache
      label: "✅ 전체 캐시"
      value: "~2ms"
      description: "92% 개선"
      color: "#10b981"

    - preset: random
      label: "🎲 랜덤"
      value: "~2-15ms"
      description: "실제 환경 시뮬레이션"
      color: "#667eea"
```

### 5. Enhanced Control Bar

컨트롤 바를 확장하여 시나리오 프리셋 버튼 그룹을 지원합니다.

```yaml
controls:
  showDefaults: true

  presetSelector:
    enabled: true
    style: "button-group"  # button-group | dropdown | tabs
    position: "inline"  # inline | separate-row

  speed:
    default: 1
    options:
      - label: "느림"
        value: 0.5
      - label: "보통"
        value: 1
        default: true
      - label: "빠름"
        value: 2
      - label: "매우 빠름"
        value: 4
```

## Technical Design

### New Components

1. **LayoutManager** (`src/ui/layout-manager.ts`)
   - 전체 레이아웃 생성 및 관리
   - Header, Legend, Canvas, Stats, Logs, Footer 영역 배치

2. **HeaderPanel** (`src/ui/header-panel.ts`)
   - 타이틀, 서브타이틀 렌더링
   - 커스텀 스타일 지원

3. **LegendPanel** (`src/ui/legend-panel.ts`)
   - 색상 범례 렌더링
   - 동적 항목 추가/제거

4. **PresetSelector** (`src/ui/preset-selector.ts`)
   - 시나리오 프리셋 버튼 그룹
   - 활성 프리셋 상태 관리

5. **ComparisonPanel** (`src/ui/comparison-panel.ts`)
   - 시나리오별 성능 비교 카드
   - 현재 프리셋 하이라이트

6. **FooterPanel** (`src/ui/footer-panel.ts`)
   - 푸터 텍스트 렌더링

### Schema Extensions

`animflow.schema.json`에 다음 정의 추가:

- `layout` 정의
- `presets` 정의 (scenarios 하위)
- `comparison` 정의
- `presetSelector` 정의 (controls 하위)

### Integration Points

1. **AnimFlow 클래스**
   - `LayoutManager` 인스턴스 생성
   - 프리셋 변경 시 변수 초기화
   - 이벤트 연결

2. **ScenarioRunner**
   - 프리셋 변수 주입 지원
   - `runPreset(presetId)` 메서드 추가

3. **StatsPanel**
   - `highlightOnChange` 애니메이션 구현
   - `compute` 표현식 평가 지원

## User Stories

### US1: 레이아웃 시스템
**As a** 다이어그램 제작자
**I want to** YAML에서 Header, Legend, Footer를 정의할 수 있길
**So that** 완성도 높은 인터랙티브 다이어그램을 만들 수 있다

**Acceptance Criteria:**
- [ ] Header에 타이틀/서브타이틀 표시
- [ ] Legend에 색상별 의미 표시
- [ ] Footer에 저작권 정보 표시
- [ ] 각 요소의 스타일 커스터마이징 가능

### US2: 시나리오 프리셋
**As a** 사용자
**I want to** 버튼 클릭으로 다양한 시나리오를 선택할 수 있길
**So that** 다양한 상황에서의 동작을 비교할 수 있다

**Acceptance Criteria:**
- [ ] 프리셋 버튼 그룹 UI 표시
- [ ] 버튼 클릭 시 해당 프리셋 변수로 시나리오 실행
- [ ] 활성 프리셋 시각적 표시

### US3: 실시간 통계
**As a** 사용자
**I want to** 시뮬레이션 중 실시간으로 통계를 볼 수 있길
**So that** 각 단계의 성능을 이해할 수 있다

**Acceptance Criteria:**
- [ ] 통계 카드 UI 표시
- [ ] 값 변경 시 하이라이트 애니메이션
- [ ] 계산된 통계 (총 시간 등) 자동 업데이트

### US4: 성능 비교 패널
**As a** 사용자
**I want to** 각 시나리오의 예상 성능을 한눈에 비교할 수 있길
**So that** 캐싱의 효과를 이해할 수 있다

**Acceptance Criteria:**
- [ ] 시나리오별 성능 카드 표시
- [ ] 현재 선택된 프리셋 하이라이트
- [ ] 성능 개선율 표시

## Open Questions

1. **레이아웃 영역 순서**: Header → Controls → Legend → Canvas → Stats → Comparison → Logs → Footer가 적절한가?
2. **프리셋 vs 일반 시나리오**: 프리셋은 시나리오의 서브셋인가, 별도 개념인가?
3. **통계 업데이트 방식**: step 액션에서 직접 업데이트 vs 별도 `update-stat` 액션?

## Dependencies

- Phase 1-8 AnimFlow DSL Engine 구현 완료 ✅
- JSON Schema 확장
- TypeScript 타입 정의 확장

## Timeline Estimate

- Phase 1 (Layout System): 레이아웃 매니저 및 기본 패널들
- Phase 2 (Presets): 시나리오 프리셋 시스템
- Phase 3 (Stats Enhancement): 통계 패널 강화
- Phase 4 (Comparison): 성능 비교 패널
- Phase 5 (Polish): 스타일링 및 애니메이션 개선
