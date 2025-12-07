# Feature Specification: Interactive Tech Blog Platform

**Feature Branch**: `002-blog-platform`
**Created**: 2025-12-07
**Status**: Draft
**Input**: User description: "Astro + MDX 기반 인터랙티브 기술 블로그 플랫폼 구축"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 기술 블로그 포스트 작성 및 발행 (Priority: P1)

저자가 MDX 파일로 기술 블로그 포스트를 작성하고, AnimFlow 다이어그램을 포함하여 발행할 수 있다.

**Why this priority**: 블로그 플랫폼의 핵심 기능으로, 이것 없이는 어떤 콘텐츠도 제공할 수 없다.

**Independent Test**: MDX 파일 작성 → 빌드 → 브라우저에서 포스트 확인으로 전체 흐름 테스트 가능

**Acceptance Scenarios**:

1. **Given** MDX 파일이 `/content/posts/` 디렉토리에 있을 때, **When** 블로그를 빌드하면, **Then** 해당 포스트가 정적 HTML 페이지로 생성된다
2. **Given** MDX 파일에 frontmatter(title, date, tags)가 있을 때, **When** 포스트 페이지를 열면, **Then** 제목, 날짜, 태그가 올바르게 표시된다
3. **Given** MDX 파일에 코드 블록이 포함되어 있을 때, **When** 포스트를 보면, **Then** 구문 강조가 적용된 코드가 표시된다

---

### User Story 2 - AnimFlow 다이어그램 임베드 및 렌더링 (Priority: P1)

저자가 MDX 파일 내에 AnimFlow 다이어그램을 임베드하고, 독자가 인터랙티브하게 다이어그램을 탐색할 수 있다.

**Why this priority**: 플랫폼의 핵심 차별점으로, 일반 블로그와 구분되는 가장 중요한 기능이다.

**Independent Test**: MDX 내 animflow 블록 작성 → 빌드 → 브라우저에서 애니메이션 재생 테스트

**Acceptance Scenarios**:

1. **Given** MDX 파일에 \`\`\`animflow 코드블록이 있을 때, **When** 포스트 페이지를 열면, **Then** AnimFlow 다이어그램이 Canvas에 렌더링된다
2. **Given** AnimFlow 다이어그램이 로드되었을 때, **When** 재생 버튼을 클릭하면, **Then** 시나리오 애니메이션이 실행된다
3. **Given** 애니메이션이 진행 중일 때, **When** 속도 조절 슬라이더를 움직이면, **Then** 애니메이션 속도가 즉시 변경된다

---

### User Story 3 - 블로그 홈페이지 및 포스트 목록 (Priority: P2)

독자가 블로그 홈페이지에서 최신 포스트 목록을 보고, 원하는 포스트로 이동할 수 있다.

**Why this priority**: 콘텐츠 탐색의 기본 진입점으로, 독자 경험에 필수적이다.

**Independent Test**: 홈페이지 접속 → 포스트 목록 확인 → 포스트 클릭으로 이동 테스트

**Acceptance Scenarios**:

1. **Given** 여러 포스트가 존재할 때, **When** 홈페이지에 접속하면, **Then** 최신 포스트 순으로 목록이 표시된다
2. **Given** 포스트 목록이 표시될 때, **When** 포스트 카드를 클릭하면, **Then** 해당 포스트 상세 페이지로 이동한다
3. **Given** 포스트 목록이 표시될 때, **Then** 각 포스트의 제목, 요약, 작성일, 태그가 표시된다

---

### User Story 4 - 태그 기반 포스트 필터링 (Priority: P3)

독자가 태그를 클릭하여 관련 포스트만 필터링해서 볼 수 있다.

**Why this priority**: 콘텐츠가 많아졌을 때 탐색 효율을 높이는 부가 기능이다.

**Independent Test**: 태그 클릭 → 필터링된 포스트 목록 확인

**Acceptance Scenarios**:

1. **Given** 포스트에 태그가 지정되어 있을 때, **When** 태그를 클릭하면, **Then** 해당 태그가 있는 포스트만 표시된다
2. **Given** 태그 페이지에 있을 때, **Then** 해당 태그의 포스트 수가 표시된다

---

### User Story 5 - 반응형 레이아웃 및 다크 모드 (Priority: P3)

독자가 다양한 디바이스에서 블로그를 편리하게 읽고, 선호하는 테마를 선택할 수 있다.

**Why this priority**: 사용자 경험 향상을 위한 부가 기능이다.

**Independent Test**: 다양한 화면 크기에서 레이아웃 확인, 테마 토글 테스트

**Acceptance Scenarios**:

1. **Given** 모바일 디바이스에서 접속할 때, **Then** 콘텐츠가 화면에 맞게 조정되어 표시된다
2. **Given** 다크 모드 토글이 있을 때, **When** 토글을 클릭하면, **Then** 전체 테마가 다크/라이트로 전환된다

---

### Edge Cases

- 잘못된 AnimFlow YAML 구문이 포함된 경우: 에러 메시지를 표시하고 나머지 콘텐츠는 정상 렌더링
- frontmatter가 누락된 MDX 파일: 빌드 경고를 표시하고 기본값으로 대체
- AnimFlow 시나리오가 없는 다이어그램: 정적 다이어그램으로 표시
- 매우 긴 포스트: 스크롤 성능 저하 없이 렌더링
- 이미지나 미디어가 로드되지 않는 경우: placeholder 또는 대체 텍스트 표시

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 시스템은 `/content/posts/` 디렉토리의 MDX 파일을 파싱하여 블로그 포스트로 변환해야 한다
- **FR-002**: 시스템은 MDX 내 \`\`\`animflow 코드블록을 파싱하여 AnimFlow 컴포넌트로 렌더링해야 한다
- **FR-003**: 시스템은 포스트 frontmatter에서 title, date, tags, description을 추출해야 한다
- **FR-004**: 시스템은 정적 사이트 생성(SSG) 방식으로 빌드되어야 한다
- **FR-005**: 사용자는 AnimFlow 다이어그램을 재생, 일시정지, 리셋할 수 있어야 한다
- **FR-006**: 사용자는 AnimFlow 애니메이션 속도를 조절할 수 있어야 한다
- **FR-007**: 시스템은 포스트 목록을 최신순으로 정렬하여 표시해야 한다
- **FR-008**: 시스템은 태그별 포스트 필터링을 지원해야 한다
- **FR-009**: 시스템은 코드 블록에 구문 강조를 적용해야 한다
- **FR-010**: 시스템은 반응형 레이아웃을 제공해야 한다
- **FR-011**: 시스템은 라이트/다크 테마 전환을 지원해야 한다
- **FR-012**: AnimFlow YAML 파싱 오류 시 사용자에게 명확한 에러 메시지를 표시해야 한다

### Key Entities

- **Post**: 블로그 포스트 (title, slug, date, tags, description, content, animflows)
- **AnimFlow Diagram**: 인터랙티브 다이어그램 (nodes, edges, scenarios, presets)
- **Tag**: 포스트 분류 태그 (name, post count)
- **Author**: 저자 정보 (name, avatar, bio) - 선택적

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 블로그 홈페이지가 3초 이내에 로드된다 (LCP 기준)
- **SC-002**: AnimFlow 다이어그램이 100ms 이내에 초기 렌더링된다
- **SC-003**: 애니메이션이 60fps를 유지하며 부드럽게 재생된다
- **SC-004**: 모든 포스트가 빌드 시 정적 HTML로 생성된다
- **SC-005**: 10개 이상의 포스트가 있어도 목록 페이지 로드 시간이 2초를 초과하지 않는다
- **SC-006**: 모바일(320px 이상)부터 데스크톱(1920px)까지 모든 화면 크기에서 콘텐츠가 정상 표시된다
- **SC-007**: 잘못된 AnimFlow 구문이 있어도 페이지 전체가 crash되지 않고 에러 메시지가 표시된다

## Assumptions

- @animflow/core 라이브러리가 이미 개발되어 npm 패키지로 사용 가능하다
- 저자는 MDX 문법과 AnimFlow DSL에 대한 기본 지식이 있다
- 초기 버전에서는 단일 저자 블로그로 운영된다 (다중 저자 지원은 향후 기능)
- 댓글 시스템은 이 spec의 범위에 포함되지 않는다 (별도 feature로 구현)
- SEO 최적화는 기본적인 메타 태그 수준으로 제한한다
