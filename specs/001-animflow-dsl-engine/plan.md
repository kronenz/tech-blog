# Implementation Plan: AnimFlow DSL Engine

**Branch**: `001-animflow-dsl-engine` | **Date**: 2025-11-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-animflow-dsl-engine/spec.md`

## Summary

AnimFlow DSL Engine은 선언적 YAML/JSON 기반의 다이어그램 정의 언어(DSL) 파서, Canvas 2D 렌더러, 시나리오 기반 애니메이션 엔진을 구현한다. 콘텐츠 작성자가 코드 없이 인터랙티브 다이어그램을 생성할 수 있도록 하며, 기존 `caching-flow-diagram.html` 프로토타입의 모든 기능을 DSL로 재현하는 것이 목표이다.

## Technical Context

**Language/Version**: TypeScript 5.3+
**Primary Dependencies**: js-yaml (YAML 파싱), ajv (JSON Schema 검증), vite (빌드)
**Storage**: N/A (클라이언트 사이드 전용, 브라우저 메모리)
**Testing**: Vitest (단위/통합 테스트)
**Target Platform**: 모던 브라우저 (Chrome, Firefox, Safari, Edge 최신 2개 버전)
**Project Type**: Monorepo (npm workspaces) - 패키지 구조
**Performance Goals**: 초기 렌더링 < 100ms, 애니메이션 60fps, 번들 크기 < 50KB (gzipped)
**Constraints**: Canvas 2D API 사용, 순수 클라이언트 사이드, 외부 서버 의존성 없음
**Scale/Scope**: 최대 100개 노드, 200개 엣지, 5개 시나리오 지원

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Declarative-First | ✅ PASS | DSL 파서가 핵심 기능, `.animflow.yaml` 형식 사용 |
| II. Interactive Visualization | ✅ PASS | 시나리오, 컨트롤, 통계/로그 패널 지원 |
| III. Scenario-Driven Animation | ✅ PASS | 변수, 조건 분기, goto 지원 |
| IV. Component Modularity | ✅ PASS | `@animflow/core` 패키지 분리, 렌더러 독립 |
| V. Blog-First Validation | ✅ PASS | `caching-flow-diagram.html` DSL 마이그레이션 포함 |
| VI. Open Standard | ✅ PASS | JSON Schema, Semantic Versioning 적용 |

**Technical Standards Compliance**:
- 렌더러: Canvas 2D (기본) ✅
- 파서: js-yaml, ajv ✅
- 성능: < 100ms 렌더링, 60fps 목표 ✅

## Project Structure

### Documentation (this feature)

```text
specs/001-animflow-dsl-engine/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (JSON Schema)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/
├── core/                      # @animflow/core
│   ├── src/
│   │   ├── parser/            # DSL 파서 (YAML/JSON)
│   │   │   ├── index.ts
│   │   │   ├── yaml-parser.ts
│   │   │   └── validator.ts
│   │   ├── model/             # 내부 데이터 모델
│   │   │   ├── diagram.ts
│   │   │   ├── node.ts
│   │   │   ├── edge.ts
│   │   │   ├── scenario.ts
│   │   │   └── step.ts
│   │   ├── engine/            # 시나리오 실행 엔진
│   │   │   ├── scenario-runner.ts
│   │   │   ├── variable-store.ts
│   │   │   ├── expression-evaluator.ts
│   │   │   └── action-executor.ts
│   │   ├── renderer/          # Canvas 2D 렌더러
│   │   │   ├── canvas-renderer.ts
│   │   │   ├── node-renderer.ts
│   │   │   ├── edge-renderer.ts
│   │   │   └── animation-manager.ts
│   │   ├── ui/                # UI 컴포넌트 (Vanilla JS)
│   │   │   ├── controls.ts
│   │   │   ├── stats-panel.ts
│   │   │   └── log-panel.ts
│   │   └── index.ts           # Public API
│   ├── schema/                # JSON Schema 정의
│   │   └── animflow.schema.json
│   ├── package.json
│   └── tsconfig.json
│
├── playground/                # 데모/테스트 사이트
│   ├── src/
│   │   └── main.ts
│   ├── public/
│   │   └── diagrams/          # 샘플 다이어그램
│   │       └── caching-flow.animflow.yaml
│   ├── index.html
│   └── package.json
│
└── docs/                      # 문서 (선택적)
    └── dsl-reference.md

tests/
├── unit/
│   ├── parser.test.ts
│   ├── validator.test.ts
│   └── scenario-runner.test.ts
├── integration/
│   └── full-diagram.test.ts
└── fixtures/
    ├── valid/
    └── invalid/
```

**Structure Decision**: Monorepo 구조 채택. `@animflow/core` 패키지로 파서, 렌더러, 시나리오 엔진을 단일 패키지에 통합 (MVP 단계). 향후 `@animflow/renderer`, `@animflow/react` 등으로 분리 가능.

## Complexity Tracking

> Constitution Check 통과 - 복잡성 정당화 불필요
