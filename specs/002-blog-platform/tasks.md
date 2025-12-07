# Tasks: Interactive Tech Blog Platform

**Input**: Design documents from `/specs/002-blog-platform/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: Not explicitly requested in spec - tests omitted. Add if needed later.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Astro blog**: `blog/src/` for source, `blog/` for config files
- **Existing packages**: `packages/core/` for @animflow/core

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Astro project initialization and workspace configuration

- [x] T001 Create Astro project in blog/ directory with `npm create astro@latest blog -- --template minimal --typescript strict --git false`
- [x] T002 Update root package.json to add blog/ to workspaces array
- [x] T003 Install @astrojs/mdx and @astrojs/react integrations in blog/
- [x] T004 Configure astro.config.mjs with MDX and React integrations in blog/astro.config.mjs
- [x] T005 [P] Add @animflow/core as workspace dependency in blog/package.json
- [x] T006 [P] Configure TypeScript settings in blog/tsconfig.json

**Checkpoint**: Astro dev server starts with `npm run dev -w blog`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create base HTML layout in blog/src/layouts/BaseLayout.astro with head, meta tags, body structure
- [x] T008 Create global CSS variables and base styles in blog/src/styles/global.css
- [x] T009 Create site configuration in blog/src/config.ts with title, description, author info
- [x] T010 [P] Create Header component in blog/src/components/Header.astro
- [x] T011 [P] Create Footer component in blog/src/components/Footer.astro
- [x] T012 Setup Content Collections config with Post schema in blog/src/content/config.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 기술 블로그 포스트 작성 및 발행 (Priority: P1)

**Goal**: 저자가 MDX 파일로 기술 블로그 포스트를 작성하고 발행할 수 있다

**Independent Test**: MDX 파일 작성 → `npm run build -w blog` → 브라우저에서 포스트 확인

### Implementation for User Story 1

- [x] T013 [US1] Create PostLayout for blog posts in blog/src/layouts/PostLayout.astro
- [x] T014 [US1] Create dynamic post page route in blog/src/pages/posts/[...slug].astro
- [x] T015 [US1] Configure Shiki syntax highlighting for code blocks in blog/astro.config.mjs
- [x] T016 [US1] Create sample MDX post without AnimFlow in blog/src/content/posts/hello-world.mdx
- [x] T017 [US1] Add frontmatter display (title, date, tags) to PostLayout in blog/src/layouts/PostLayout.astro
- [x] T018 [US1] Verify build generates static HTML with `npm run build -w blog`

**Checkpoint**: User Story 1 complete - MDX posts render with syntax highlighting

---

## Phase 4: User Story 2 - AnimFlow 다이어그램 임베드 및 렌더링 (Priority: P1)

**Goal**: 저자가 MDX 파일 내에 AnimFlow 다이어그램을 임베드하고, 독자가 인터랙티브하게 탐색할 수 있다

**Independent Test**: MDX 내 animflow 블록 작성 → 빌드 → 브라우저에서 애니메이션 재생

### Implementation for User Story 2

- [x] T019 [US2] Create remark-animflow plugin to parse animflow code blocks in blog/src/plugins/remark-animflow.ts
- [x] T020 [US2] Register remark-animflow plugin in astro.config.mjs markdown config
- [x] T021 [US2] Create AnimFlowEmbed React component with client:only in blog/src/components/AnimFlowEmbed.tsx
- [x] T022 [US2] Create AnimFlowEmbed Astro wrapper component in blog/src/components/AnimFlowEmbed.astro
- [x] T023 [US2] Implement error boundary for AnimFlow parse errors in blog/src/components/AnimFlowEmbed.tsx (inline error handling)
- [x] T024 [US2] Create sample MDX post with AnimFlow diagram in blog/src/content/posts/animflow-demo.mdx
- [x] T025 [US2] Verify AnimFlow controls (play, pause, reset, speed) work in browser

**Checkpoint**: User Story 2 complete - AnimFlow diagrams render and animate in posts

---

## Phase 5: User Story 3 - 블로그 홈페이지 및 포스트 목록 (Priority: P2)

**Goal**: 독자가 블로그 홈페이지에서 최신 포스트 목록을 보고, 원하는 포스트로 이동할 수 있다

**Independent Test**: 홈페이지 접속 → 포스트 목록 확인 → 포스트 클릭으로 이동

### Implementation for User Story 3

- [x] T026 [US3] Create PostCard component for post list in blog/src/components/PostCard.astro
- [x] T027 [US3] Create homepage with post list query in blog/src/pages/index.astro
- [x] T028 [US3] Implement date sorting (newest first) in homepage query
- [x] T029 [US3] Add reading time calculation utility in blog/src/utils/readingTime.ts
- [x] T030 [US3] Display post metadata (title, description, date, tags) in PostCard
- [x] T031 [US3] Verify post list links navigate to correct post pages

**Checkpoint**: User Story 3 complete - Homepage shows post list with navigation

---

## Phase 6: User Story 4 - 태그 기반 포스트 필터링 (Priority: P3)

**Goal**: 독자가 태그를 클릭하여 관련 포스트만 필터링해서 볼 수 있다

**Independent Test**: 태그 클릭 → 필터링된 포스트 목록 확인

### Implementation for User Story 4

- [x] T032 [US4] Create tag utilities (inline in tag pages) in blog/src/pages/tags/
- [x] T033 [US4] Create TagList component in blog/src/pages/tags/index.astro
- [x] T034 [US4] Create dynamic tag page route in blog/src/pages/tags/[tag].astro
- [x] T035 [US4] Add tag count display to tag pages
- [x] T036 [US4] Add clickable tags to PostCard and PostLayout components

**Checkpoint**: User Story 4 complete - Tag filtering works across the site

---

## Phase 7: User Story 5 - 반응형 레이아웃 및 다크 모드 (Priority: P3)

**Goal**: 독자가 다양한 디바이스에서 블로그를 편리하게 읽고, 선호하는 테마를 선택할 수 있다

**Independent Test**: 다양한 화면 크기에서 레이아웃 확인, 테마 토글 테스트

### Implementation for User Story 5

- [x] T037 [US5] Add responsive CSS with mobile breakpoints in blog/src/styles/global.css
- [x] T038 [US5] Create theme CSS variables for light/dark modes in blog/src/styles/global.css (10 theme presets)
- [x] T039 [US5] Create ThemeToggle component in blog/src/components/ThemeToggle.astro
- [x] T040 [US5] Implement theme persistence with localStorage in ThemeToggle
- [x] T041 [US5] Add system preference detection (prefers-color-scheme) for default theme
- [x] T042 [US5] Verify responsive layout on mobile (320px) to desktop (1920px) viewports
- [x] T042b [US5] Create ThemeSelector modal with 10 color themes in blog/src/components/ThemeSelector.astro
- [x] T042c [US5] Create LayoutSelector modal with 7 layout presets in blog/src/components/LayoutSelector.astro

**Checkpoint**: User Story 5 complete - Responsive design and theme toggle work

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories

- [x] T043 Add favicon and site icons in blog/public/
- [x] T044 [P] Add meta tags for SEO (og:title, og:description, og:image) in BaseLayout
- [x] T045 [P] Optimize AnimFlow bundle size with dynamic imports
- [x] T046 Verify production build passes with `npm run build -w blog`
- [x] T047 Run quickstart.md validation checklist
- [x] T048 Create additional sample posts demonstrating various AnimFlow features

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2), can parallel with US1
- **User Story 3 (Phase 5)**: Depends on US1 (needs PostLayout) or can start in parallel
- **User Story 4 (Phase 6)**: Depends on US3 (needs PostCard component)
- **User Story 5 (Phase 7)**: Depends on Foundational, can parallel with US1-4
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1: Setup
    │
    ▼
Phase 2: Foundational
    │
    ├──────────────────┬──────────────────┐
    ▼                  ▼                  ▼
Phase 3: US1       Phase 4: US2      Phase 7: US5
(Blog Posts)       (AnimFlow)        (Responsive/Theme)
    │                  │
    └────────┬─────────┘
             ▼
      Phase 5: US3
      (Post List)
             │
             ▼
      Phase 6: US4
      (Tag Filter)
             │
             ▼
      Phase 8: Polish
```

### Parallel Opportunities

- **Phase 1**: T005, T006 can run in parallel
- **Phase 2**: T010, T011 can run in parallel
- **Phase 3-4**: US1 and US2 can be developed in parallel after Foundational
- **Phase 5-7**: US3, US4, US5 have some parallel opportunities
- **Phase 8**: T044, T045 can run in parallel

---

## Parallel Example: User Story 1 & 2

```bash
# After Phase 2 (Foundational) is complete, launch in parallel:
Task: "Create PostLayout for blog posts in blog/src/layouts/PostLayout.astro" (US1)
Task: "Create remark-animflow plugin in blog/src/plugins/remark-animflow.ts" (US2)

# These work on different files with no dependencies
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Blog Posts)
4. Complete Phase 4: User Story 2 (AnimFlow Integration)
5. **STOP and VALIDATE**: Test US1 + US2 together
6. Deploy MVP with basic blog + AnimFlow support

### Incremental Delivery

1. Setup + Foundational → Blog skeleton ready
2. Add US1 (Blog Posts) → Can publish MDX content
3. Add US2 (AnimFlow) → Interactive diagrams work (MVP!)
4. Add US3 (Post List) → Homepage with navigation
5. Add US4 (Tags) → Content discoverability
6. Add US5 (Responsive/Theme) → Better UX
7. Polish → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 are both P1 priority - implement together for MVP
- US3 depends on having PostLayout from US1
- US4 builds on US3's PostCard component
- US5 is independent and can be parallelized with other stories
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
