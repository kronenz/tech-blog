# Implementation Plan: AI-Powered Markdown Editor

**Branch**: `003-ai-markdown-editor` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ai-markdown-editor/spec.md`

## Summary

브라우저 기반 마크다운 편집기를 구현한다. 핵심 기능은 실시간 마크다운 렌더링, Gemini AI를 통한 AnimFlow YAML 자동 생성, AI 초안 작성 및 태그 자동 지정이다. 기존 Astro + MDX 블로그 플랫폼에 통합되며, 클라이언트 사이드에서 동작한다.

## Technical Context

**Language/Version**: TypeScript 5.3+
**Primary Dependencies**: React 18+, @animflow/core, @google/genai (Gemini SDK - GA)
**Editor Framework**: @uiw/react-codemirror (CodeMirror 6)
**Markdown Rendering**: react-markdown + remark-gfm + rehype-highlight
**Storage**: Browser LocalStorage (클라이언트 사이드 전용)
**Testing**: Vitest (단위), Playwright (E2E)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Astro + React 컴포넌트)
**Performance Goals**: 50ms 편집 응답, 5초 AI 응답, 60fps 애니메이션
**Constraints**: < 100ms 입력 지연, 10,000자+ 문서 지원
**Scale/Scope**: 단일 사용자, 단일 문서 편집

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Declarative-First | ✅ PASS | AnimFlow YAML로 다이어그램 정의 |
| II. Interactive Visualization | ✅ PASS | 실시간 다이어그램 미리보기 제공 |
| III. Scenario-Driven | ✅ PASS | AI가 시나리오 포함 YAML 생성 |
| IV. Platform Architecture | ✅ PASS | Astro + React, 4-Layer 준수 |
| V. Content-First | ✅ PASS | 실제 블로그 작성 환경 제공 |
| VI. Open Standard | ✅ PASS | AnimFlow DSL 스펙 준수 |
| VII. LLM-Assisted | ✅ PASS | Gemini AI로 YAML 자동 생성 |
| VIII. Reader Experience | N/A | 저자용 기능 (독자 경험은 별도) |
| IX. Community | N/A | MVP에서 제외 |
| X. Browser-Based Authoring | ✅ PASS | 핵심 구현 대상 |

**Result**: ✅ All applicable gates PASSED

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-markdown-editor/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # Internal API contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
blog/
├── src/
│   ├── components/
│   │   ├── editor/                    # 편집기 컴포넌트
│   │   │   ├── MarkdownEditor.tsx     # 메인 편집기 컴포넌트
│   │   │   ├── EditorPanel.tsx        # 편집 영역
│   │   │   ├── PreviewPanel.tsx       # 미리보기 영역
│   │   │   ├── AnimFlowPreview.tsx    # AnimFlow 다이어그램 미리보기
│   │   │   ├── ToolBar.tsx            # 도구 모음
│   │   │   └── SettingsModal.tsx      # API Key 설정 모달
│   │   └── ai/                        # AI 관련 컴포넌트
│   │       ├── AnimFlowGenerator.tsx  # AnimFlow YAML 생성 UI
│   │       ├── DraftGenerator.tsx     # 초안 생성 UI
│   │       └── TagSuggester.tsx       # 태그 추천 UI
│   ├── services/
│   │   ├── gemini.ts                  # Gemini API 래퍼
│   │   ├── storage.ts                 # LocalStorage 관리
│   │   ├── animflow-validator.ts      # YAML 문법 검증
│   │   └── mdx-exporter.ts            # MDX 내보내기
│   ├── hooks/
│   │   ├── useEditor.ts               # 편집기 상태 관리
│   │   ├── useGemini.ts               # AI 호출 훅
│   │   └── useAutoSave.ts             # 자동 저장 훅
│   ├── pages/
│   │   └── editor.astro               # 편집기 페이지
│   └── styles/
│       └── editor.css                 # 편집기 스타일
├── public/
│   └── docs/
│       └── animflow-dsl-spec.md       # AI 컨텍스트용 DSL 문서
└── tests/
    ├── unit/
    │   ├── gemini.test.ts
    │   ├── validator.test.ts
    │   └── storage.test.ts
    └── e2e/
        └── editor.spec.ts
```

**Structure Decision**: Astro + React 하이브리드 구조. 편집기는 React 컴포넌트로 구현하고, Astro 페이지에서 `client:only="react"`로 로드. AI 서비스는 클라이언트 사이드에서 직접 Gemini API 호출.

## Complexity Tracking

> No constitution violations requiring justification.

---

## Phase 0: Research Summary

**Document**: [research.md](./research.md)

### Key Decisions

| 항목 | 결정 | 근거 |
|------|------|------|
| Gemini SDK | `@google/genai` | 신규 통합 SDK, GA 상태, 기존 SDK 2025-08 지원 종료 |
| 에디터 | `@uiw/react-codemirror` | 경량 (~200KB vs Monaco ~2MB), React Hook 지원 |
| 마크다운 렌더링 | `react-markdown` + `remark-gfm` | 표준 솔루션, GFM 지원 |
| AnimFlow 미리보기 | 기존 AnimFlowEmbed 재사용 | 코드 중복 방지, 검증된 컴포넌트 |

### Identified Risks

| 리스크 | 영향 | 완화 방안 |
|--------|------|-----------|
| Gemini API Rate Limit | AI 기능 중단 | 로컬 캐싱, 재시도 로직 |
| 대용량 문서 성능 저하 | UX 저하 | Debounce, 가상화 |
| LocalStorage 용량 한계 | 저장 실패 | 압축, 용량 경고 UI |

---

## Phase 1: Design Summary

### Data Model

**Document**: [data-model.md](./data-model.md)

핵심 엔티티:
- `EditorSettings`: API Key, 테마, 자동 저장 설정
- `Document`: 편집 중인 문서 (제목, 본문, 태그)
- `AnimFlowBlock`: 문서 내 AnimFlow YAML 블록
- `Draft`: AI 생성 초안

LocalStorage 키:
- `editor:settings` - 사용자 설정
- `editor:document` - 현재 문서
- `editor:recovery` - 복구용 백업

### API Contracts

**Document**: [contracts/api.md](./contracts/api.md)

서비스 레이어:
- `storage.ts`: LocalStorage CRUD
- `gemini.ts`: Gemini API 래퍼 (YAML 생성, 초안 작성, 태그 추천)
- `animflow-validator.ts`: YAML 파싱 및 스키마 검증
- `mdx-exporter.ts`: MDX 파일 내보내기

React Hooks:
- `useEditor`: 편집기 상태 관리
- `useGemini`: AI 호출 래퍼
- `useAutoSave`: 자동 저장 로직
- `useSettings`: 설정 관리

### Quickstart

**Document**: [quickstart.md](./quickstart.md)

핵심 의존성 설치:
```bash
npm install @uiw/react-codemirror @codemirror/lang-markdown @codemirror/lang-yaml
npm install react-markdown remark-gfm rehype-highlight
npm install @google/genai js-yaml zod uuid
```

---

## Implementation Phases

### Phase 1: Core Editor (US1 - P1)

**목표**: 실시간 마크다운 편집 및 미리보기

- [ ] editor.astro 페이지 생성
- [ ] MarkdownEditor 메인 컴포넌트
- [ ] EditorPanel (CodeMirror 통합)
- [ ] PreviewPanel (react-markdown 통합)
- [ ] useEditor 훅
- [ ] useAutoSave 훅
- [ ] storage.ts 서비스

### Phase 2: AnimFlow Integration (US2 - P2)

**목표**: AI AnimFlow YAML 생성

- [ ] animflow-validator.ts 서비스
- [ ] AnimFlowPreview 컴포넌트
- [ ] gemini.ts 서비스
- [ ] useGemini 훅
- [ ] AnimFlowGenerator UI 컴포넌트
- [ ] SettingsModal (API Key 입력)

### Phase 3: AI Authoring (US3, US4 - P3, P4)

**목표**: AI 초안 작성 및 태그 추천

- [ ] DraftGenerator 컴포넌트
- [ ] TagSuggester 컴포넌트
- [ ] 프롬프트 템플릿 최적화

### Phase 4: Save & Export (US5 - P5)

**목표**: MDX 내보내기

- [ ] mdx-exporter.ts 서비스
- [ ] ToolBar 컴포넌트 (저장/내보내기 버튼)
- [ ] 페이지 이탈 경고

### Phase 5: Polish

**목표**: 안정화 및 최적화

- [ ] 에러 핸들링 강화
- [ ] 키보드 단축키
- [ ] 성능 최적화 (debounce 튜닝)
- [ ] E2E 테스트

---

## Next Steps

`/speckit.tasks` 명령으로 상세 태스크 목록 생성
