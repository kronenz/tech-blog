<!--
  Sync Impact Report
  ==================
  Version Change: 2.0.0 → 2.1.0 (MINOR - New authoring features added)

  Rationale: 브라우저 기반 마크다운 편집기와 Gemini AI 통합 기능 추가.
  기존 원칙의 확장과 새로운 기능 섹션 추가로 MINOR 버전 증가.

  Modified Principles:
  - VII. LLM-Assisted Authoring: Claude API → Gemini AI API로 변경, DSL 문법 참조 기능 추가
  - Development Workflow: Phase 구조에 Browser Editor 관련 단계 추가

  Added Sections:
  - X. Browser-Based Authoring (새로운 원칙 - 브라우저 편집기 기능)
  - Feature Specs: 010-browser-editor, 011-gemini-animflow-gen, 012-ai-draft-assistant

  Removed Sections: None

  Templates Requiring Updates:
  - .specify/templates/plan-template.md ✅ (compatible, no changes needed)
  - .specify/templates/spec-template.md ✅ (compatible, no changes needed)
  - .specify/templates/tasks-template.md ✅ (compatible, no changes needed)

  Follow-up TODOs:
  - Create specs/010-browser-editor/ directory
  - Create specs/011-gemini-animflow-gen/ directory
  - Create specs/012-ai-draft-assistant/ directory
-->

# Interactive Tech Blog Platform Constitution

## Project Vision

> **"텍스트 중심 기술 블로그" → "AI 기반 인터랙티브 기술 스토리텔링 플랫폼"**

이 프로젝트는 AnimFlow 라이브러리(`@animflow/core`)를 활용하여 차세대 기술 블로그 플랫폼을 구축한다.
기존의 정적인 기술 문서와 다이어그램을 넘어, 독자가 직접 탐색하고 이해할 수 있는
인터랙티브 시각화 경험을 제공하는 것을 목표로 한다.

**핵심 차별화**: AI(Gemini)를 활용한 저작 도구로 기술 콘텐츠 제작의 진입 장벽을 낮추고,
브라우저 기반 실시간 편집 환경에서 마크다운과 AnimFlow를 자연스럽게 통합한다.

**4-Layer 아키텍처:**
1. **Authoring Layer (저자용)**: Browser Editor + Gemini AI 기반 YAML 자동 생성
2. **AI Assistant Layer (AI)**: Gemini API - DSL 문법 참조, 초안 작성, 태그 자동 지정
3. **Visualization Layer (AnimFlow)**: 시간축 기반 애니메이션, 조건 분기, 시나리오 시스템
4. **Reader Experience Layer (독자용)**: 글-다이어그램 동기화, 시나리오 전환, Q&A 패널

## Core Principles

### I. Declarative-First (DSL 중심)

모든 다이어그램은 선언적 DSL(AnimFlow DSL)로 정의되어야 한다.

**규칙:**
- 다이어그램 정의는 반드시 MDX 내 `\`\`\`animflow` 블록 또는 `.animflow.yaml` 파일을 사용해야 한다
- 직접적인 Canvas/SVG JavaScript 코드 대신 DSL 파서를 통한 렌더링을 우선시해야 한다
- 빌드 타임에 animflow 코드블록을 JSON으로 변환하여 클라이언트로 전달해야 한다

**근거:** 선언적 정의는 비개발자 접근성, 재사용성, 유지보수성을 높이며 기술 시각화의 표준화에 기여한다.

### II. Interactive Visualization (인터랙티브 시각화)

모든 기술 다이어그램은 정적이 아닌 동적 인터랙션을 제공해야 한다.

**규칙:**
- 모든 다이어그램은 최소 1개 이상의 시나리오(scenario)를 포함해야 한다
- 사용자 제어 요소(시작, 리셋, 속도 조절)를 기본 제공해야 한다
- 시나리오별 통계(stats) 및 로그(logging) 패널을 지원해야 한다
- 애니메이션 진행 시 flow number를 표시하여 순서를 명확히 해야 한다
- Step-by-step 재생 모드와 타임라인 내비게이션을 지원해야 한다

**근거:** 인터랙티브 시각화는 복잡한 기술 개념의 이해도를 높이고, 사용자가 직접 시나리오를 탐색하며 학습할 수 있게 한다.

### III. Scenario-Driven Animation (시나리오 기반 애니메이션)

애니메이션은 시나리오 단위로 구성되며, 조건부 분기와 변수 시스템을 지원해야 한다.

**규칙:**
- 각 시나리오는 독립적으로 실행 가능해야 한다
- 변수 시스템을 통한 런타임 상태 관리를 지원해야 한다
- 조건부 분기(`if/else`)와 랜덤 값을 지원해야 한다
- Preset 시스템을 통해 시나리오 파라미터(정상/장애/지연 등)를 쉽게 전환할 수 있어야 한다

**근거:** 실제 시스템 동작(캐시 히트/미스, 성공/실패 등)을 현실적으로 시뮬레이션하기 위해 조건 분기가 필수적이다.

### IV. Platform Architecture (플랫폼 아키텍처)

블로그 플랫폼은 AnimFlow 코어를 활용하되, 4-Layer 아키텍처로 구성되어야 한다.

**규칙:**
- `@animflow/core`는 외부 라이브러리로 취급하고, 플랫폼 코드와 분리해야 한다
- 블로그 플랫폼은 Astro + MDX를 기반으로 SSG(Static Site Generation)를 사용해야 한다
- Authoring, AI Assistant, Visualization, Reader Experience 각 레이어는 독립적으로 개발/테스트 가능해야 한다
- AnimFlow 컴포넌트는 Astro 컴포넌트로 래핑하여 사용해야 한다

**근거:** 모듈화된 아키텍처는 플랫폼 확장과 유지보수를 용이하게 하고, AnimFlow 업데이트와 독립적인 개발을 가능하게 한다.

### V. Content-First Development (콘텐츠 우선 개발)

모든 플랫폼 기능은 실제 기술 블로그 콘텐츠 작성 경험을 통해 검증되어야 한다.

**규칙:**
- 새로운 기능 추가 시, 해당 기능을 사용하는 블로그 포스트를 함께 작성해야 한다
- 기존 HTML 프로토타입은 MDX + AnimFlow DSL로 마이그레이션하여 검증해야 한다
- 저자가 UI에서 노드/에지를 직접 편집하고 미리보기할 수 있어야 한다
- 문서 템플릿(서비스 디자인 리뷰, Postmortem 등)에 AnimFlow 섹션을 기본 포함해야 한다

**근거:** "Eat Your Own Dog Food" 원칙에 따라, 실제 사용을 통해 플랫폼의 실용성을 검증한다.

### VI. Open Standard (오픈 표준)

AnimFlow DSL과 플랫폼은 오픈소스이며, 표준 스펙 문서와 JSON Schema를 제공해야 한다.

**규칙:**
- DSL 스펙은 버전 관리되며, Semantic Versioning을 따라야 한다
- JSON Schema를 제공하여 에디터 자동완성 및 검증을 지원해야 한다
- 모든 코드는 MIT 또는 Apache 2.0 라이선스로 공개해야 한다

**근거:** 오픈 표준은 커뮤니티 채택을 촉진하고, 기술 시각화 생태계 발전에 기여한다.

### VII. LLM-Assisted Authoring (LLM 기반 저작 지원)

Gemini AI를 활용하여 기술 글에서 AnimFlow YAML을 자동 생성하고, 작성 생산성을 높여야 한다.

**규칙:**
- 기술 글 본문에서 엔티티, 관계, 타임라인을 자동 추출해야 한다
- Gemini AI가 AnimFlow DSL 공식 문법 문서를 참조하여 정확한 YAML을 생성해야 한다
- 자연어 설명(예: "클라이언트가 서버에 요청하고, 캐시 확인 후 DB 조회")을 AnimFlow YAML로 변환해야 한다
- **Consistency Checker**: 글 내용과 다이어그램 간 불일치를 감지하고 리포트해야 한다
- Reusable AnimFlow Snippets 라이브러리를 제공해야 한다

**근거:** LLM 지원은 기술 시각화 제작의 진입 장벽을 낮추고, 글-다이어그램 일관성을 보장한다.

### VIII. Reader Experience First (독자 경험 우선)

독자가 기술 콘텐츠를 쉽게 이해하고 탐색할 수 있는 경험을 최우선으로 설계해야 한다.

**규칙:**
- **글-다이어그램 동기화**: 다이어그램 타임라인 단계와 글 단락이 자동 스크롤로 연동되어야 한다
- **코드-다이어그램 하이라이트**: 코드 블록 호버 시 관련 노드/에지가 하이라이트되어야 한다
- **시나리오 전환 UI**: 드롭다운/버튼으로 시나리오를 쉽게 전환할 수 있어야 한다
- **Time-travel 뷰**: 슬라이더로 시간을 이동하며 시스템 상태를 재현할 수 있어야 한다
- **문맥 Q&A**: 독자가 특정 단계에서 질문하면 LLM이 컨텍스트를 참조하여 답변해야 한다
- **난이도 모드**: Beginner/Advanced 모드로 복잡도를 조절할 수 있어야 한다

**근거:** 기술 블로그의 핵심 가치는 독자의 이해도 향상이며, 인터랙티브 기능은 이를 극대화한다.

### IX. Community & Collaboration (커뮤니티 및 협업)

독자와 저자 간의 협업과 커뮤니티 참여를 활성화해야 한다.

**규칙:**
- **Forkable AnimFlow**: 독자가 다이어그램을 Fork하여 자신의 버전으로 수정/공유할 수 있어야 한다
- **구조적 댓글**: 특정 노드/에지/타임라인 단계에 직접 댓글을 달 수 있어야 한다
- **버전 비교 뷰**: Before/After AnimFlow를 나란히 두고 변경 사항을 비교할 수 있어야 한다
- **검색 + 다이어그램 인덱스**: 블로그 전체에서 특정 주제의 AnimFlow를 검색하고 썸네일로 볼 수 있어야 한다
- **학습 경로**: 여러 글/AnimFlow를 순서대로 엮어 미니 코스 형태로 제공할 수 있어야 한다

**근거:** 커뮤니티 참여는 콘텐츠 품질 향상과 플랫폼 성장의 핵심 동력이다.

### X. Browser-Based Authoring (브라우저 기반 저작 환경)

저자가 브라우저에서 직접 마크다운과 AnimFlow를 작성하고, 실시간으로 결과를 확인할 수 있어야 한다.

**규칙:**
- **실시간 마크다운 렌더링**: 마크다운 입력 시 즉시 렌더링된 결과를 미리보기로 제공해야 한다
- **AnimFlow 실시간 미리보기**: AnimFlow YAML 작성 시 즉시 다이어그램 미리보기를 제공해야 한다
- **Gemini AI 연동**: Gemini API Key를 통해 자연어 → AnimFlow YAML 변환을 지원해야 한다
- **DSL 문법 참조**: AI가 AnimFlow 공식 DSL 문법 문서를 컨텍스트로 참조하여 정확한 문법의 YAML을 생성해야 한다
- **AI 초안 작성**: 주제/키워드 입력 시 AI가 블로그 글 초안을 생성해야 한다
- **자동 태그 지정**: 글 내용을 분석하여 관련 태그를 자동으로 추천해야 한다
- **문법 검증**: AnimFlow YAML의 문법 오류를 실시간으로 감지하고 수정 제안을 해야 한다
- **저장 및 내보내기**: 작성한 콘텐츠를 MDX 파일로 저장/내보내기할 수 있어야 한다

**근거:** 브라우저 기반 편집 환경은 개발 환경 설정 없이 누구나 쉽게 콘텐츠를 제작할 수 있게 하며,
AI 지원은 AnimFlow DSL 학습 곡선을 크게 낮춘다.

## Technical Standards

**Four-Layer Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                  Reader Experience Layer                     │
│  (글-다이어그램 동기화, Q&A 패널, 시나리오 전환 UI)         │
├─────────────────────────────────────────────────────────────┤
│                   Visualization Layer                        │
│  (@animflow/core - 시나리오 엔진, Canvas 렌더러, UI 컴포넌트)│
├─────────────────────────────────────────────────────────────┤
│                    AI Assistant Layer                        │
│  (Gemini API - DSL 문법 참조, 초안 생성, 태그 추천)         │
├─────────────────────────────────────────────────────────────┤
│                    Authoring Layer                           │
│  (Browser Editor, MDX, 실시간 미리보기, 문법 검증)          │
└─────────────────────────────────────────────────────────────┘
```

**플랫폼 기술:**
- 블로그 프레임워크: Astro + MDX
- 브라우저 편집기: React + Monaco Editor (또는 CodeMirror)
- AnimFlow 통합: @animflow/core (Canvas 2D 기반)
- 파서: js-yaml, ajv (JSON Schema 검증)
- AI 연동: Gemini API (클라이언트 사이드, 사용자 API Key)
- 배포: SSG (Static Site Generation)

**파일 규약:**
- 블로그 콘텐츠: `/content/posts/*.mdx`
- AnimFlow 정의: MDX 내 `\`\`\`animflow` 블록
- DSL 문법 참조: `/docs/animflow-dsl-spec.md` (AI 컨텍스트용)
- 스펙 문서: `/specs/[###-feature-name]/` 디렉토리 구조

**성능 기준:**
- 페이지 로드: < 3초 (LCP)
- AnimFlow 초기 렌더링: < 100ms
- 애니메이션 프레임: 60fps 유지
- 편집기 입력 반응: < 50ms
- AI 응답 시간: < 5초 (자연어 → YAML 변환)

## Development Workflow

**Feature Specs 구조:**

```
specs/
├── 001-animflow-dsl-engine/     # 완료: AnimFlow 코어 엔진
├── 002-blog-platform/           # 완료: Astro + MDX 블로그 기반
├── 003-mdx-animflow-embed/      # 신규: MDX 내 AnimFlow 블록 파싱
├── 004-llm-yaml-generation/     # 신규: 글 → YAML 자동 생성
├── 005-reader-sync/             # 신규: 글-다이어그램 동기화
├── 006-scenario-ui/             # 신규: 시나리오 전환 UI
├── 007-qa-panel/                # 신규: 문맥 Q&A 패널
├── 008-community-features/      # 신규: Fork, 댓글, 검색
├── 009-learning-path/           # 신규: 학습 경로 기능
├── 010-browser-editor/          # 신규: 브라우저 기반 마크다운 편집기
├── 011-gemini-animflow-gen/     # 신규: Gemini AI AnimFlow YAML 생성
└── 012-ai-draft-assistant/      # 신규: AI 초안 작성 및 태그 자동 지정
```

**Phase 기반 개발:**
1. **Phase 1 (Blog Foundation)**: Astro + MDX 블로그 기본 구조, AnimFlow 통합 ✅
2. **Phase 2 (Browser Editor)**: 마크다운 편집기 UI, 실시간 미리보기, 문법 검증
3. **Phase 3 (AI Integration)**: Gemini API 연동, DSL 문법 참조 시스템, 자연어→YAML
4. **Phase 4 (AI Authoring)**: AI 초안 작성, 태그 자동 지정, Consistency Checker
5. **Phase 5 (Reader Experience)**: 글-다이어그램 동기화, 시나리오 전환 UI
6. **Phase 6 (Advanced UX)**: Time-travel 뷰, Q&A 패널, 난이도 모드
7. **Phase 7 (Community)**: Fork, 구조적 댓글, 검색/인덱스, 학습 경로
8. **Phase 8 (Polish)**: 성능 최적화, SEO, 접근성

**코드 리뷰 요구사항:**
- 모든 PR은 실제 블로그 포스트에서의 동작을 검증해야 한다
- 새로운 기능은 반드시 예제 콘텐츠를 포함해야 한다
- UI 변경은 스크린샷 또는 데모 영상을 첨부해야 한다
- AI 기능은 다양한 입력에 대한 출력 품질을 검증해야 한다

**테스트 전략:**
- MDX 파싱: 단위 테스트
- AnimFlow 통합: E2E 테스트 (Playwright)
- 독자 경험: 시각적 회귀 테스트
- AI 출력 검증: 스냅샷 테스트 + 문법 검증 테스트

## Governance

**헌법 적용:**
- 이 헌법은 모든 코드 리뷰, 설계 결정, PR에서 준수되어야 한다
- 헌법 위반이 의심되는 경우, 복잡성 정당화를 문서화해야 한다

**수정 절차:**
1. 수정 제안을 Issue로 등록
2. 영향 범위 분석 및 문서화
3. 마이그레이션 계획 수립 (필요 시)
4. PR을 통한 헌법 수정 및 승인
5. 관련 템플릿 동기화 업데이트

**버전 관리:**
- MAJOR: 프로젝트 범위 재정의 또는 원칙 삭제/호환성 파괴 변경
- MINOR: 새로운 원칙/섹션 추가 또는 확장
- PATCH: 문구 수정, 명확화, 오타 수정

**Version**: 2.1.0 | **Ratified**: 2025-11-26 | **Last Amended**: 2025-12-07
