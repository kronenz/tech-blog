# Tasks: AI-Powered Markdown Editor

**Input**: Design documents from `/specs/003-ai-markdown-editor/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `blog/` (Astro + React)
- **Components**: `blog/src/components/`
- **Services**: `blog/src/services/`
- **Hooks**: `blog/src/hooks/`
- **Types**: `blog/src/types/`
- **Pages**: `blog/src/pages/`
- **Styles**: `blog/src/styles/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install editor dependencies: @uiw/react-codemirror, @codemirror/lang-markdown, @codemirror/lang-yaml in blog/package.json
- [x] T002 [P] Install markdown rendering dependencies: react-markdown, remark-gfm, rehype-highlight in blog/package.json
- [x] T003 [P] Install AI dependencies: @google/genai in blog/package.json
- [x] T004 [P] Install utility dependencies: js-yaml, zod, uuid in blog/package.json
- [x] T005 Create type definitions file in blog/src/types/editor.ts with Document, EditorSettings, AnimFlowBlock, ValidationResult, AIResponse interfaces
- [x] T006 [P] Create editor directory structure: blog/src/components/editor/ and blog/src/components/ai/
- [x] T007 [P] Create services directory structure: blog/src/services/ and blog/src/hooks/

**Checkpoint**: Dependencies installed, directory structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Implement storage service with saveSettings, loadSettings, saveDocument, loadDocument functions in blog/src/services/storage.ts
- [x] T009 [P] Implement useSettings hook with settings state management in blog/src/hooks/useSettings.ts
- [x] T010 Create editor.astro page with basic layout and React mount point in blog/src/pages/editor.astro
- [x] T011 [P] Create editor.css with split-view layout styles in blog/src/styles/editor.css

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Real-time Markdown Editing (Priority: P1)

**Goal**: 저자가 브라우저에서 마크다운을 작성하면 실시간으로 렌더링된 결과를 확인할 수 있다

**Independent Test**: 마크다운 입력 후 50ms 이내에 미리보기에서 결과 확인. 코드 블록 구문 하이라이팅 적용 확인.

### Implementation for User Story 1

- [x] T012 [P] [US1] Implement EditorPanel component with CodeMirror integration in blog/src/components/editor/EditorPanel.tsx
- [x] T013 [P] [US1] Implement PreviewPanel component with react-markdown in blog/src/components/editor/PreviewPanel.tsx
- [x] T014 [US1] Implement useEditor hook with document state and content update in blog/src/hooks/useEditor.ts
- [x] T015 [US1] Implement useAutoSave hook with debounced save logic in blog/src/hooks/useAutoSave.ts
- [x] T016 [US1] Implement MarkdownEditor main component with split view layout in blog/src/components/editor/MarkdownEditor.tsx
- [x] T017 [US1] Add debounced preview update (50ms) in MarkdownEditor component
- [x] T018 [US1] Integrate MarkdownEditor into editor.astro page with client:only="react" directive

**Checkpoint**: At this point, User Story 1 should be fully functional - real-time markdown editing works independently

---

## Phase 4: User Story 2 - AI AnimFlow YAML Generation (Priority: P2)

**Goal**: 저자가 자연어로 다이어그램을 설명하면 AI가 AnimFlow YAML을 생성하고 미리보기를 제공한다

**Independent Test**: 자연어 설명 입력 후 5초 이내에 유효한 YAML 생성 및 다이어그램 렌더링 확인.

### Implementation for User Story 2

- [x] T019 [P] [US2] Implement animflow-validator service with extractAnimFlowBlocks, validateAnimFlowYaml functions in blog/src/services/animflow-validator.ts
- [x] T020 [P] [US2] Create AnimFlow DSL spec document for AI context in blog/public/docs/animflow-dsl-spec.md
- [x] T021 [US2] Implement gemini service with initializeGemini, generateAnimFlowYaml functions in blog/src/services/gemini.ts
- [x] T022 [US2] Implement useGemini hook with loading state and generateAnimFlow method in blog/src/hooks/useGemini.ts
- [x] T023 [US2] Implement AnimFlowPreview component using existing AnimFlowEmbed in blog/src/components/editor/AnimFlowPreview.tsx
- [x] T024 [US2] Implement SettingsModal component with API key input and validation in blog/src/components/editor/SettingsModal.tsx
- [x] T025 [US2] Implement AnimFlowGenerator component with natural language input and YAML preview in blog/src/components/ai/AnimFlowGenerator.tsx
- [x] T026 [US2] Update PreviewPanel to render AnimFlow blocks using AnimFlowPreview component
- [x] T027 [US2] Add AnimFlow validation error display with line highlighting in PreviewPanel
- [x] T028 [US2] Integrate AnimFlowGenerator and SettingsModal into MarkdownEditor with toolbar buttons

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - AI Draft Writing (Priority: P3)

**Goal**: 저자가 주제를 입력하면 AI가 블로그 초안을 생성하여 편집기에 삽입할 수 있다

**Independent Test**: 주제 입력 후 10초 이내에 마크다운 초안 생성 및 커서 위치에 삽입 확인.

### Implementation for User Story 3

- [x] T029 [US3] Add generateDraft function to gemini service in blog/src/services/gemini.ts
- [x] T030 [US3] Add generateDraft method to useGemini hook in blog/src/hooks/useGemini.ts
- [x] T031 [US3] Implement DraftGenerator component with topic input and preview in blog/src/components/ai/DraftGenerator.tsx
- [x] T032 [US3] Add draft insertion at cursor position functionality in useEditor hook
- [x] T033 [US3] Integrate DraftGenerator into MarkdownEditor with toolbar button

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Auto Tag Suggestion (Priority: P4)

**Goal**: 저자가 글을 작성하면 AI가 관련 태그를 자동으로 추천한다

**Independent Test**: 500자 이상의 글 작성 후 태그 추천 버튼 클릭 시 3초 이내에 관련 태그 표시 확인.

### Implementation for User Story 4

- [x] T034 [US4] Add suggestTags function to gemini service in blog/src/services/gemini.ts
- [x] T035 [US4] Add suggestTags method to useGemini hook in blog/src/hooks/useGemini.ts
- [x] T036 [US4] Implement TagSuggester component with tag chips and add/remove functionality in blog/src/components/ai/TagSuggester.tsx
- [x] T037 [US4] Add tags management to Document state in useEditor hook
- [x] T038 [US4] Integrate TagSuggester into MarkdownEditor with toolbar access

**Checkpoint**: All user stories 1-4 should now be independently functional

---

## Phase 7: User Story 5 - Save and Export (Priority: P5)

**Goal**: 저자가 작성한 콘텐츠를 MDX 파일로 저장하고 내보낼 수 있다

**Independent Test**: 저장 버튼 클릭 시 LocalStorage 저장 확인, MDX 내보내기 시 frontmatter 포함된 파일 다운로드 확인.

### Implementation for User Story 5

- [x] T039 [P] [US5] Implement mdx-exporter service with exportToMdx, downloadMdx, generateFrontmatter functions in blog/src/services/mdx-exporter.ts
- [x] T040 [US5] Implement ToolBar component with save, export, preview toggle, settings buttons in blog/src/components/editor/ToolBar.tsx
- [x] T041 [US5] Add recovery backup mechanism to storage service in blog/src/services/storage.ts
- [x] T042 [US5] Add beforeunload warning for unsaved changes in MarkdownEditor component
- [x] T043 [US5] Add document restoration on page load in MarkdownEditor component
- [x] T044 [US5] Integrate ToolBar into MarkdownEditor with all action handlers

**Checkpoint**: All user stories 1-5 should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T045 [P] Add keyboard shortcuts (Ctrl+S save, Ctrl+Shift+E export, Ctrl+Shift+P preview toggle) in MarkdownEditor
- [x] T046 [P] Add loading indicators and cancel buttons for all AI operations in AI components
- [x] T047 [P] Add error handling UI with user-friendly messages for all error codes in MarkdownEditor
- [x] T048 Add API key missing warning when AI features are accessed without key
- [x] T049 [P] Add storage quota warning when LocalStorage is near capacity
- [x] T050 Performance optimization: debounce tuning for 50ms preview update target
- [x] T051 Add dark mode support based on system preference in editor.css

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Phase 2 completion
  - User stories can proceed in priority order (P1 → P2 → P3 → P4 → P5)
  - Or in parallel if multiple developers available
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (needs PreviewPanel to show AnimFlow)
- **User Story 3 (P3)**: Depends on US2 (needs Gemini service infrastructure)
- **User Story 4 (P4)**: Depends on US2 (needs Gemini service infrastructure)
- **User Story 5 (P5)**: Depends on US1 (needs Document state and ToolBar integration)

### Within Each User Story

- Models/Types before services
- Services before hooks
- Hooks before components
- Components before integration
- Core implementation before polish

### Parallel Opportunities

All Setup tasks marked [P] can run in parallel:
- T002, T003, T004 (dependency installation)
- T006, T007 (directory creation)

Within User Story 1:
- T012, T013 (EditorPanel and PreviewPanel)

Within User Story 2:
- T019, T020 (validator and DSL spec)

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks first:
Task: "T012 [P] [US1] Implement EditorPanel component"
Task: "T013 [P] [US1] Implement PreviewPanel component"

# Then sequential tasks:
Task: "T014 [US1] Implement useEditor hook"
Task: "T015 [US1] Implement useAutoSave hook"
Task: "T016 [US1] Implement MarkdownEditor main component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test real-time markdown editing independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → AI AnimFlow generation works
4. Add User Story 3 → Test independently → AI draft writing works
5. Add User Story 4 → Test independently → Tag suggestion works
6. Add User Story 5 → Test independently → Save/Export works
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Phase 2:

- Developer A: User Story 1 (core editing)
- Developer B: User Story 2 dependencies (validator, gemini service)
- After US1 complete: Developer A → User Story 5 (save/export)
- After US2 infra complete: Developer B → User Story 3 & 4 (AI features)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- spec.md does NOT request tests - test tasks are omitted

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 51 |
| Setup Phase | 7 tasks |
| Foundational Phase | 4 tasks |
| User Story 1 (P1) | 7 tasks |
| User Story 2 (P2) | 10 tasks |
| User Story 3 (P3) | 5 tasks |
| User Story 4 (P4) | 5 tasks |
| User Story 5 (P5) | 6 tasks |
| Polish Phase | 7 tasks |
| Parallel Opportunities | 18 tasks marked [P] |
| Suggested MVP | Phase 1-3 (User Story 1 only) = 18 tasks |
