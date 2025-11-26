# Tasks: AnimFlow DSL Engine

**Input**: Design documents from `/specs/001-animflow-dsl-engine/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Test tasks are NOT included unless explicitly requested. Tests can be added incrementally.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md monorepo structure:
- **Core package**: `packages/core/src/`
- **Playground**: `packages/playground/`
- **Tests**: `tests/`
- **Schema**: `packages/core/schema/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, monorepo structure, and build tooling

- [x] T001 Initialize npm workspaces monorepo with root package.json
- [x] T002 Create packages/core directory structure per plan.md
- [x] T003 [P] Initialize packages/core/package.json with name "@animflow/core"
- [x] T004 [P] Initialize packages/playground/package.json with name "@animflow/playground"
- [x] T005 [P] Configure TypeScript 5.3+ in packages/core/tsconfig.json
- [x] T006 [P] Configure TypeScript for playground in packages/playground/tsconfig.json
- [x] T007 Install core dependencies: js-yaml, ajv in packages/core
- [x] T008 [P] Install dev dependencies: typescript, vite, vitest in root
- [x] T009 Configure Vite build for library output (ESM, UMD, types) in packages/core/vite.config.ts
- [x] T010 [P] Configure Vite dev server for playground in packages/playground/vite.config.ts
- [x] T011 [P] Configure Vitest in vitest.config.ts at repo root
- [x] T012 Copy animflow.schema.json from specs/001-animflow-dsl-engine/contracts/ to packages/core/schema/

**Checkpoint**: Run `npm install` and `npm run build` successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Define TypeScript types for Diagram entity in packages/core/src/types/diagram.ts
- [x] T014 [P] Define TypeScript types for Node and NodeStyle in packages/core/src/types/node.ts
- [x] T015 [P] Define TypeScript types for Edge and EdgeStyle in packages/core/src/types/edge.ts
- [x] T016 [P] Define TypeScript types for Point, Bounds, Canvas in packages/core/src/types/canvas.ts
- [x] T017 [P] Define TypeScript types for Expression variants in packages/core/src/types/expression.ts
- [x] T018 Create barrel export for all types in packages/core/src/types/index.ts
- [x] T019 Implement YAML parser wrapper using js-yaml in packages/core/src/parser/yaml-parser.ts
- [x] T020 Implement JSON Schema validator using ajv in packages/core/src/parser/validator.ts
- [x] T021 Implement unified Parser class (YAML/JSON + validation) in packages/core/src/parser/index.ts
- [x] T022 Create custom AnimFlowError class hierarchy in packages/core/src/errors.ts
- [x] T023 Create barrel export for public API in packages/core/src/index.ts

**Checkpoint**: Foundation ready - `Parser.parse(yamlString)` returns typed Diagram or throws detailed errors

---

## Phase 3: User Story 1 - DSL 기반 다이어그램 렌더링 (Priority: P1) 🎯 MVP

**Goal**: Content authors can define diagram structure (nodes, edges, styles) in YAML and see it rendered visually

**Independent Test**: Load a YAML file in browser → nodes and edges are displayed at correct positions

### Implementation for User Story 1

- [x] T024 [P] [US1] Create Node model class in packages/core/src/model/node.ts
- [x] T025 [P] [US1] Create Edge model class in packages/core/src/model/edge.ts
- [x] T026 [P] [US1] Create Section model class in packages/core/src/model/section.ts
- [x] T027 [US1] Create Diagram model class (aggregates nodes, edges, sections) in packages/core/src/model/diagram.ts
- [x] T028 [US1] Create model barrel export in packages/core/src/model/index.ts
- [x] T029 [US1] Implement CanvasRenderer main class in packages/core/src/renderer/canvas-renderer.ts
- [x] T030 [P] [US1] Implement NodeRenderer (box, circle, database shapes) in packages/core/src/renderer/node-renderer.ts
- [x] T031 [P] [US1] Implement EdgeRenderer (solid, dashed, dotted, arrows) in packages/core/src/renderer/edge-renderer.ts
- [x] T032 [US1] Implement SectionRenderer (background regions) in packages/core/src/renderer/section-renderer.ts
- [x] T033 [US1] Implement LabelRenderer for node/edge text in packages/core/src/renderer/label-renderer.ts
- [x] T034 [US1] Create renderer barrel export in packages/core/src/renderer/index.ts
- [x] T035 [US1] Implement AnimFlow main class (parse + render integration) in packages/core/src/animflow.ts
- [x] T036 [US1] Update public API exports in packages/core/src/index.ts
- [x] T037 [US1] Create playground HTML with canvas container in packages/playground/index.html
- [x] T038 [US1] Create playground main.ts loading sample YAML in packages/playground/src/main.ts
- [x] T039 [US1] Create sample caching-flow.animflow.yaml (static only) in packages/playground/public/diagrams/caching-flow.animflow.yaml

**Checkpoint**: User Story 1 complete - load YAML, see static diagram with nodes, edges, sections, labels

---

## Phase 4: User Story 2 - 시나리오 기반 애니메이션 실행 (Priority: P2)

**Goal**: Authors can define scenarios (step-by-step animation sequences) in YAML, users click "Start" to see nodes/edges highlight in order

**Independent Test**: Load YAML with scenario, click Start → nodes/edges highlight sequentially

### Implementation for User Story 2

- [x] T040 [P] [US2] Define Scenario and Step types in packages/core/src/types/scenario.ts
- [x] T041 [P] [US2] Define ActionType enum and action-specific types in packages/core/src/types/action.ts
- [x] T042 [US2] Update types barrel export in packages/core/src/types/index.ts
- [x] T043 [P] [US2] Create Scenario model class in packages/core/src/model/scenario.ts
- [x] T044 [P] [US2] Create Step model class in packages/core/src/model/step.ts
- [x] T045 [US2] Update Diagram model to include scenarios in packages/core/src/model/diagram.ts
- [x] T046 [US2] Implement AnimationManager (highlight, glow effects) in packages/core/src/renderer/animation-manager.ts
- [x] T047 [US2] Update CanvasRenderer to support animation states in packages/core/src/renderer/canvas-renderer.ts
- [x] T048 [US2] Implement ActionExecutor for highlight/animate-edge/delay/reset in packages/core/src/engine/action-executor.ts
- [x] T049 [US2] Implement ScenarioRunner (async step execution) in packages/core/src/engine/scenario-runner.ts
- [x] T050 [US2] Create engine barrel export in packages/core/src/engine/index.ts
- [x] T051 [US2] Add scenario execution methods to AnimFlow class in packages/core/src/animflow.ts
- [x] T052 [US2] Implement basic ControlBar UI (Start/Reset buttons) in packages/core/src/ui/control-bar.ts
- [x] T053 [US2] Create UI barrel export in packages/core/src/ui/index.ts
- [x] T054 [US2] Update playground to include scenario with steps in packages/playground/public/diagrams/caching-flow.animflow.yaml
- [x] T055 [US2] Update playground main.ts to wire up controls in packages/playground/src/main.ts

**Checkpoint**: User Story 2 complete - Start button triggers sequential animation, Reset returns to initial state

---

## Phase 5: User Story 3 - 조건부 분기 및 변수 시스템 (Priority: P3)

**Goal**: Authors can define variables and conditional branches (if/else) to express scenarios like cache hit/miss in one file, with random values for simulation

**Independent Test**: Run scenario with conditions → different paths execute based on variable values or random outcomes

### Implementation for User Story 3

- [x] T056 [P] [US3] Define Variable type in packages/core/src/types/variable.ts
- [x] T057 [US3] Update types barrel export in packages/core/src/types/index.ts
- [x] T058 [US3] Implement VariableStore (get/set runtime variables) in packages/core/src/engine/variable-store.ts
- [x] T059 [US3] Implement ExpressionEvaluator ($var, $random, $add, $eq, etc.) in packages/core/src/engine/expression-evaluator.ts
- [x] T060 [US3] Update ActionExecutor for 'conditional' action in packages/core/src/engine/action-executor.ts
- [x] T061 [US3] Update ActionExecutor for 'goto' action in packages/core/src/engine/action-executor.ts
- [x] T062 [US3] Add goto chain depth limit (max 10) to ScenarioRunner in packages/core/src/engine/scenario-runner.ts
- [x] T063 [US3] Add max step execution limit (1000) to ScenarioRunner in packages/core/src/engine/scenario-runner.ts
- [x] T064 [US3] Update Diagram model to include variables in packages/core/src/model/diagram.ts
- [x] T065 [US3] Add init block processing to ScenarioRunner in packages/core/src/engine/scenario-runner.ts
- [x] T066 [US3] Update playground YAML with variables, conditions, goto in packages/playground/public/diagrams/caching-flow.animflow.yaml

**Checkpoint**: User Story 3 complete - conditional paths work, random values vary execution, goto navigates between scenarios

---

## Phase 6: User Story 4 - 사용자 컨트롤 UI (Priority: P4)

**Goal**: Users interact via scenario selection buttons, speed control, start/reset buttons. Controls are declaratively defined in YAML

**Independent Test**: Load YAML with controls → buttons and speed selector appear and work

### Implementation for User Story 4

- [x] T067 [P] [US4] Define Controls, ControlGroup, SpeedControl, Button types in packages/core/src/types/controls.ts
- [x] T068 [US4] Update types barrel export in packages/core/src/types/index.ts
- [x] T069 [US4] Update Diagram model to include controls in packages/core/src/model/diagram.ts
- [x] T070 [US4] Implement ScenarioSelector UI (button group for scenarios) in packages/core/src/ui/scenario-selector.ts
- [x] T071 [US4] Implement SpeedSelector UI (dropdown/slider) in packages/core/src/ui/speed-selector.ts
- [x] T072 [US4] Update ControlBar to render from YAML controls definition in packages/core/src/ui/control-bar.ts
- [x] T073 [US4] Add setSpeed(multiplier) method to ScenarioRunner in packages/core/src/engine/scenario-runner.ts
- [x] T074 [US4] Update AnimFlow class to handle control events in packages/core/src/animflow.ts
- [x] T075 [US4] Add default scenario selection (default: true) logic in packages/core/src/ui/scenario-selector.ts
- [x] T076 [US4] Update playground YAML with full controls definition in packages/playground/public/diagrams/caching-flow.animflow.yaml
- [x] T077 [US4] Add CSS for control components in packages/core/src/ui/styles.css

**Checkpoint**: User Story 4 complete - full control panel renders from YAML, speed affects animation duration

---

## Phase 7: User Story 5 - 통계 및 로그 패널 (Priority: P5)

**Goal**: Users see real-time statistics (response time, cache hit rate) and system logs during animation. Enhances educational value

**Independent Test**: Run scenario with stats and logs → panel displays updated values and timestamped messages

### Implementation for User Story 5

- [x] T078 [P] [US5] Define Stat type in packages/core/src/types/stat.ts
- [x] T079 [P] [US5] Define LoggingConfig and LogMessage types in packages/core/src/types/logging.ts
- [x] T080 [US5] Update types barrel export in packages/core/src/types/index.ts
- [x] T081 [US5] Update Diagram model to include stats and logging in packages/core/src/model/diagram.ts
- [x] T082 [US5] Implement StatStore (manage stat values) in packages/core/src/engine/stat-store.ts
- [x] T083 [US5] Update ActionExecutor for 'update-stat' action in packages/core/src/engine/action-executor.ts
- [x] T084 [US5] Update ActionExecutor for 'log' action in packages/core/src/engine/action-executor.ts
- [x] T085 [US5] Implement StatsPanel UI component in packages/core/src/ui/stats-panel.ts
- [x] T086 [US5] Implement LogPanel UI component (with maxEntries limit) in packages/core/src/ui/log-panel.ts
- [x] T087 [US5] Add timestamp formatting to LogPanel in packages/core/src/ui/log-panel.ts
- [x] T088 [US5] Update AnimFlow class to wire stats/log panels in packages/core/src/animflow.ts
- [x] T089 [US5] Add CSS for stats and log panels in packages/core/src/ui/styles.css
- [x] T090 [US5] Update playground YAML with stats and logging sections in packages/playground/public/diagrams/caching-flow.animflow.yaml

**Checkpoint**: User Story 5 complete - stats panel shows values, log panel shows timestamped messages, oldest logs removed when exceeding limit

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T091 Validate all edge/node ID references in Validator in packages/core/src/parser/validator.ts
- [x] T092 [P] Add edge case: duplicate node ID detection in packages/core/src/parser/validator.ts
- [x] T093 [P] Add edge case: empty scenario handling in packages/core/src/engine/scenario-runner.ts
- [x] T094 [P] Add edge case: invalid YAML format (non-YAML input) in packages/core/src/parser/yaml-parser.ts
- [x] T095 Implement 'parallel' action for concurrent step execution in packages/core/src/engine/action-executor.ts
- [x] T096 [P] Implement 'diamond' shape in NodeRenderer in packages/core/src/renderer/node-renderer.ts
- [x] T097 Add event emitter for scenario lifecycle (start, step, end, error) in packages/core/src/animflow.ts
- [x] T098 [P] Add keyboard shortcuts (Space=start/pause, R=reset) in packages/core/src/ui/control-bar.ts
- [x] T099 Ensure 60fps animation performance with dirty flag optimization in packages/core/src/renderer/canvas-renderer.ts
- [x] T100 Bundle size optimization: ensure < 50KB gzipped in packages/core/vite.config.ts
- [x] T101 Run quickstart.md validation: follow steps and verify working demo
- [x] T102 Migrate full caching-flow-diagram.html features to AnimFlow DSL in packages/playground/public/diagrams/caching-flow.animflow.yaml

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (P1) must complete before US2 (P2) - renderer needed for animations
  - US2 (P2) should complete before US3 (P3) - scenario engine needed for conditions
  - US3, US4, US5 can proceed partially in parallel after US2
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Setup → Foundational → US1 (Renderer) → US2 (Scenario Engine) → US3 (Conditions)
                                                              ↘ US4 (Controls)
                                                              ↘ US5 (Stats/Logs)
                                        → Polish
```

- **User Story 1 (P1)**: Foundation only - no story dependencies
- **User Story 2 (P2)**: Depends on US1 (needs renderer for animation display)
- **User Story 3 (P3)**: Depends on US2 (needs scenario engine for conditions)
- **User Story 4 (P4)**: Depends on US2 (needs scenario engine for control actions)
- **User Story 5 (P5)**: Depends on US2 (needs scenario engine for stat/log actions)

### Within Each User Story

- Types before models
- Models before services/engine
- Engine before UI
- All components before integration
- Story complete before checkpoint

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T011)
- All Foundational type tasks marked [P] can run in parallel (T014-T017)
- Within US1: Node/Edge/Section models can run in parallel (T024-T026), Node/Edge renderers can run in parallel (T030-T031)
- Within US2: Scenario/Step types can run in parallel (T040-T041), models can run in parallel (T043-T044)
- US3, US4, US5 can be worked on partially in parallel after US2 core is done
- All Polish tasks marked [P] can run in parallel (T092-T094, T096, T098)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all type definitions together:
Task: T014 "Define TypeScript types for Node and NodeStyle in packages/core/src/types/node.ts"
Task: T015 "Define TypeScript types for Edge and EdgeStyle in packages/core/src/types/edge.ts"
Task: T016 "Define TypeScript types for Point, Bounds, Canvas in packages/core/src/types/canvas.ts"
Task: T017 "Define TypeScript types for Expression variants in packages/core/src/types/expression.ts"
```

## Parallel Example: User Story 1 Models

```bash
# Launch all models together:
Task: T024 "Create Node model class in packages/core/src/model/node.ts"
Task: T025 "Create Edge model class in packages/core/src/model/edge.ts"
Task: T026 "Create Section model class in packages/core/src/model/section.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T012)
2. Complete Phase 2: Foundational (T013-T023)
3. Complete Phase 3: User Story 1 (T024-T039)
4. **STOP and VALIDATE**: Load YAML, see static diagram
5. Deploy playground demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Parser works, types defined
2. Add User Story 1 → Static diagram renders → Demo available
3. Add User Story 2 → Animations work → Demo enhanced
4. Add User Story 3 → Conditions/variables work → Caching simulation possible
5. Add User Story 4 → Full control panel → User experience complete
6. Add User Story 5 → Stats/logs → Educational value maximized
7. Each story adds value without breaking previous stories

### Full Feature Validation

After Phase 8 completion:
- Run T101: Follow quickstart.md steps
- Run T102: Verify caching-flow-diagram.html parity with AnimFlow DSL version
- Check SC-005: All original prototype features work in DSL version

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable (after dependencies)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total estimated tasks: 102
- Tests can be added incrementally as TDD approach if requested
