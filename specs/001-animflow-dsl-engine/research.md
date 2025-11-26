# Research: AnimFlow DSL Engine

**Feature**: 001-animflow-dsl-engine
**Date**: 2025-11-26
**Status**: Complete

## 1. YAML 파싱 라이브러리 선택

### Decision: js-yaml

**Rationale**:
- npm에서 가장 널리 사용되는 YAML 파서 (주간 4천만+ 다운로드)
- TypeScript 타입 지원 (@types/js-yaml)
- 브라우저 호환성 우수 (번들 크기 ~50KB)
- YAML 1.1 및 1.2 스펙 지원

**Alternatives Considered**:
| 라이브러리 | 장점 | 단점 | 결정 |
|-----------|------|------|------|
| js-yaml | 성숙, 안정적, 널리 사용 | 에러 메시지가 상세하지 않음 | ✅ 선택 |
| yaml | 더 나은 에러 메시지, 스트리밍 | 번들 크기 더 큼 (~100KB) | ❌ 제외 |
| yamljs | 간단 | 유지보수 부족, 타입 미지원 | ❌ 제외 |

**Error Handling Strategy**:
- js-yaml의 YAMLException을 캐치하여 줄/열 정보 추출
- 커스텀 에러 클래스로 래핑하여 상세 메시지 제공

## 2. JSON Schema 검증 라이브러리 선택

### Decision: ajv

**Rationale**:
- 가장 빠른 JSON Schema 검증기
- Draft-07 스키마 지원 (AnimFlow 스키마에 사용)
- 상세한 에러 메시지 (ajv-errors 플러그인 사용 시)
- TypeScript 타입 추론 지원

**Alternatives Considered**:
| 라이브러리 | 장점 | 단점 | 결정 |
|-----------|------|------|------|
| ajv | 최고 성능, 기능 풍부 | 설정 복잡 | ✅ 선택 |
| zod | TypeScript 네이티브, 간결 | JSON Schema 호환 아님 | ❌ 제외 |
| joi | 읽기 쉬운 API | 브라우저 번들 크기 큼 | ❌ 제외 |

**Schema Design**:
- JSON Schema Draft-07 사용
- `$ref`로 재사용 가능한 정의 분리
- `additionalProperties: false`로 오타 방지

## 3. Canvas 2D 렌더링 패턴

### Decision: Class-based Renderer with RequestAnimationFrame

**Rationale**:
- 기존 `caching-flow-diagram.html` 프로토타입과 유사한 구조
- 상태 관리가 명확한 클래스 기반 설계
- requestAnimationFrame으로 60fps 보장

**Architecture**:
```
CanvasRenderer
├── NodeRenderer (노드 렌더링)
├── EdgeRenderer (엣지/화살표 렌더링)
└── AnimationManager (하이라이트, 글로우 효과)
```

**Rendering Strategy**:
1. 정적 다이어그램: 캔버스 클리어 → 섹션 → 엣지 → 노드 순서로 렌더링
2. 애니메이션: requestAnimationFrame 루프에서 하이라이트 상태만 업데이트
3. 최적화: 변경된 요소만 다시 그리기 (더티 플래그)

## 4. 시나리오 엔진 설계

### Decision: Async/Await 기반 순차 실행

**Rationale**:
- `await sleep(duration)` 패턴으로 타이밍 제어 명확
- 조건부 분기 구현 용이
- 기존 프로토타입 코드와 유사하여 검증 용이

**Engine Components**:
| 컴포넌트 | 책임 |
|----------|------|
| ScenarioRunner | 스텝 순차 실행, 중단/리셋 처리 |
| VariableStore | 변수 저장, 랜덤 값 생성 |
| ExpressionEvaluator | `$var`, `$random`, `$add` 등 표현식 평가 |
| ActionExecutor | 액션 타입별 실행 (highlight, animate-edge 등) |

**Infinite Loop Prevention**:
- 최대 스텝 실행 횟수: 1000 (기본값)
- goto 체인 깊이 제한: 10

## 5. UI 컴포넌트 접근 방식

### Decision: Vanilla JavaScript + CSS

**Rationale**:
- 프레임워크 의존성 제거로 번들 크기 최소화
- 어떤 프레임워크와도 통합 가능
- 기존 프로토타입 스타일 재사용 가능

**Component Structure**:
| 컴포넌트 | 역할 |
|----------|------|
| ControlBar | 시작/리셋 버튼, 시나리오 선택, 속도 조절 |
| StatsPanel | 통계 값 실시간 표시 |
| LogPanel | 로그 메시지 타임라인 표시 |

**Styling**:
- CSS-in-JS 또는 별도 CSS 파일
- CSS 변수로 테마 커스터마이징 지원

## 6. 빌드 및 번들링

### Decision: Vite + Rollup

**Rationale**:
- 빠른 개발 서버 (HMR)
- ES 모듈 기본 지원
- 라이브러리 빌드 최적화 (외부 의존성 exclude)
- TypeScript 네이티브 지원

**Build Outputs**:
- `dist/animflow.esm.js` - ES 모듈 (트리셰이킹 가능)
- `dist/animflow.umd.js` - 브라우저 직접 사용
- `dist/animflow.d.ts` - TypeScript 타입

## 7. 테스트 전략

### Decision: Vitest

**Rationale**:
- Vite와 동일한 설정 공유
- Jest 호환 API
- 빠른 실행 속도

**Test Categories**:
| 카테고리 | 대상 | 커버리지 목표 |
|----------|------|---------------|
| Unit | Parser, Validator, ExpressionEvaluator | 90%+ |
| Integration | ScenarioRunner, 전체 파이프라인 | 70%+ |
| E2E | Playground에서 전체 시나리오 실행 | 주요 시나리오 |

**Fixtures**:
- `tests/fixtures/valid/` - 유효한 YAML 샘플
- `tests/fixtures/invalid/` - 각 에러 타입별 샘플

## 8. 기존 프로토타입 마이그레이션

### Decision: DSL 정의 + 검증 테스트

**Approach**:
1. `caching-flow-diagram.html`의 JavaScript를 분석
2. 동일한 다이어그램을 `.animflow.yaml`로 작성
3. 렌더링 결과가 시각적으로 동일한지 검증
4. 모든 시나리오(캐시 히트/미스/랜덤)가 동작하는지 확인

**Migration Checklist**:
- [x] 노드 9개 정의 (client, goBackend, gocache, keycloak, infinispan, ldap, gocache2, redis, opa)
- [x] 엣지 7개 정의
- [x] 시나리오 4개 (random, no-cache, partial-cache, full-cache)
- [x] 통계 4개 (jwt-time, opa-time, total-time, hit-rate)
- [x] 로그 패널

## Summary of Decisions

| Area | Decision | Key Reason |
|------|----------|------------|
| YAML Parser | js-yaml | 안정성, 번들 크기 |
| Schema Validation | ajv | 성능, 에러 상세도 |
| Rendering | Canvas 2D + Classes | 기존 프로토타입 호환 |
| Scenario Engine | Async/Await | 명확한 타이밍 제어 |
| UI | Vanilla JS | 프레임워크 독립성 |
| Build | Vite + Rollup | 개발 경험, 최적화 |
| Testing | Vitest | 속도, Vite 통합 |
