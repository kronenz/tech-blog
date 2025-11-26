<!--
  Sync Impact Report
  ==================
  Version Change: 0.0.0 → 1.0.0 (Initial ratification)

  Modified Principles: N/A (Initial version)

  Added Sections:
  - Core Principles (6 principles)
  - Technical Standards
  - Development Workflow
  - Governance

  Removed Sections: N/A (Initial version)

  Templates Requiring Updates:
  - .specify/templates/plan-template.md ✅ (already generic, compatible)
  - .specify/templates/spec-template.md ✅ (already generic, compatible)
  - .specify/templates/tasks-template.md ✅ (already generic, compatible)

  Follow-up TODOs: None
-->

# AnimFlow Tech Blog Constitution

## Core Principles

### I. Declarative-First (DSL 중심)

모든 다이어그램은 선언적 DSL(AnimFlow DSL)로 정의되어야 한다.

**규칙:**
- 다이어그램 정의는 반드시 `.animflow.yaml` 또는 `.animflow.json` 형식을 사용해야 한다
- 직접적인 Canvas/SVG JavaScript 코드 대신 DSL 파서를 통한 렌더링을 우선시해야 한다
- DSL v2 간결 문법을 기본으로 채택하고, 복잡한 시나리오에서만 v1 상세 문법을 허용한다

**근거:** 선언적 정의는 비개발자 접근성, 재사용성, 유지보수성을 높이며 기술 시각화의 표준화에 기여한다.

### II. Interactive Visualization (인터랙티브 시각화)

모든 기술 다이어그램은 정적이 아닌 동적 인터랙션을 제공해야 한다.

**규칙:**
- 모든 다이어그램은 최소 1개 이상의 시나리오(scenario)를 포함해야 한다
- 사용자 제어 요소(시작, 리셋, 속도 조절)를 기본 제공해야 한다
- 시나리오별 통계(stats) 및 로그(logging) 패널을 지원해야 한다

**근거:** 인터랙티브 시각화는 복잡한 기술 개념의 이해도를 높이고, 사용자가 직접 시나리오를 탐색하며 학습할 수 있게 한다.

### III. Scenario-Driven Animation (시나리오 기반 애니메이션)

애니메이션은 시나리오 단위로 구성되며, 조건부 분기와 변수 시스템을 지원해야 한다.

**규칙:**
- 각 시나리오는 독립적으로 실행 가능해야 한다
- 변수 시스템(`set variable = value`)을 통한 런타임 상태 관리를 지원해야 한다
- 조건부 분기(`if/else`)와 랜덤 값(`random(probability)`)을 지원해야 한다
- 시나리오 간 이동(`goto`)을 통한 복잡한 플로우 표현이 가능해야 한다

**근거:** 실제 시스템 동작(캐시 히트/미스, 성공/실패 등)을 현실적으로 시뮬레이션하기 위해 조건 분기가 필수적이다.

### IV. Component Modularity (컴포넌트 모듈화)

AnimFlow 엔진은 독립적이고 재사용 가능한 패키지로 구성되어야 한다.

**규칙:**
- 코어 엔진(`@animflow/core`)은 렌더러나 UI 프레임워크에 의존하지 않아야 한다
- 렌더러(`@animflow/renderer`)는 Canvas, SVG, WebGL 옵션을 독립적으로 제공해야 한다
- 프레임워크 통합(`@animflow/react`, `@animflow/astro`)은 코어에 의존하되 상호 의존하지 않아야 한다
- 각 패키지는 독립적으로 버전 관리되어야 한다

**근거:** 모듈화된 아키텍처는 다양한 환경(Astro, Next.js, Vanilla JS)에서의 통합을 용이하게 하고, 유지보수 및 확장성을 높인다.

### V. Blog-First Validation (블로그 우선 검증)

모든 AnimFlow 기능은 실제 블로그 콘텐츠를 통해 먼저 검증되어야 한다.

**규칙:**
- 새로운 DSL 기능 추가 시, 해당 기능을 사용하는 블로그 포스트를 함께 작성해야 한다
- 기존 HTML 프로토타입(`caching-flow-diagram.html` 등)은 DSL로 마이그레이션하여 검증해야 한다
- 사용자 피드백 수집을 위해 블로그에 배포된 다이어그램을 우선시해야 한다

**근거:** "Eat Your Own Dog Food" 원칙에 따라, 실제 사용을 통해 DSL의 실용성과 표현력을 검증한다.

### VI. Open Standard (오픈 표준)

AnimFlow DSL은 오픈소스이며, 표준 스펙 문서와 JSON Schema를 제공해야 한다.

**규칙:**
- DSL 스펙은 버전 관리되며, Semantic Versioning을 따라야 한다
- JSON Schema를 제공하여 에디터 자동완성 및 검증을 지원해야 한다
- 모든 코드는 MIT 또는 Apache 2.0 라이선스로 공개해야 한다
- 커뮤니티 기여를 위한 Contributing Guide를 제공해야 한다

**근거:** 오픈 표준은 커뮤니티 채택을 촉진하고, 기술 시각화 생태계 발전에 기여한다.

## Technical Standards

**플랫폼 기술:**
- 블로그: Astro + MDX
- 렌더러: Canvas 2D (기본), SVG (접근성), WebGL (고성능, 선택적)
- 파서: js-yaml, ajv (JSON Schema 검증)
- 에디터: Monaco Editor (선택적)
- 애니메이션: Web Animations API 또는 GSAP

**DSL 문법 표준:**
- 기본 문법: AnimFlow DSL v2 (간결 문법)
- 폴백: AnimFlow DSL v1 (상세 YAML 문법)
- v2 → v1 내부 변환을 통해 양 문법 호환성 유지

**파일 규약:**
- 다이어그램 정의: `*.animflow.yaml` 또는 `*.animflow.json`
- 스펙 문서: `/specs/[feature]/` 디렉토리 구조
- 블로그 콘텐츠: `/content/posts/` 디렉토리

**성능 기준:**
- 초기 렌더링: < 100ms
- 애니메이션 프레임: 60fps 유지
- 번들 크기: `@animflow/core` < 50KB (gzipped)

## Development Workflow

**Phase 기반 개발:**
1. **Phase 1 (Foundation)**: DSL 스펙 정의, 파서, 기본 렌더러
2. **Phase 2 (Core Engine)**: 노드/엣지 확장, 시나리오 엔진, UI 컴포넌트
3. **Phase 3 (Tooling)**: Monaco 에디터, CLI, 실시간 프리뷰
4. **Phase 4 (Blog Platform)**: Astro 블로그, MDX 통합, 콘텐츠 제작
5. **Phase 5 (Ecosystem)**: 플러그인 시스템, 테마, 커뮤니티 갤러리

**코드 리뷰 요구사항:**
- 모든 PR은 DSL 스펙 준수 여부를 검증해야 한다
- 새로운 DSL 기능은 반드시 테스트 케이스와 예제를 포함해야 한다
- 블로그 콘텐츠 변경은 렌더링 결과 스크린샷을 첨부해야 한다

**테스트 전략:**
- DSL 파서: 단위 테스트 (유효/무효 YAML 케이스)
- 렌더러: 시각적 회귀 테스트 (선택적)
- 시나리오 엔진: 통합 테스트 (시나리오 실행 결과 검증)

## Governance

**헌법 적용:**
- 이 헌법은 모든 코드 리뷰, 설계 결정, PR에서 준수되어야 한다
- 헌법 위반이 의심되는 경우, 복잡성 정당화(Complexity Justification)를 문서화해야 한다

**수정 절차:**
1. 수정 제안을 Issue로 등록
2. 영향 범위 분석 및 문서화
3. 마이그레이션 계획 수립 (필요 시)
4. PR을 통한 헌법 수정 및 승인
5. 관련 템플릿 동기화 업데이트

**버전 관리:**
- MAJOR: 원칙 삭제 또는 호환성 파괴 변경
- MINOR: 새로운 원칙/섹션 추가 또는 확장
- PATCH: 문구 수정, 명확화, 오타 수정

**Version**: 1.0.0 | **Ratified**: 2025-11-26 | **Last Amended**: 2025-11-26
