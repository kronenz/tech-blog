# Implementation Plan: Interactive Tech Blog Platform

**Branch**: `002-blog-platform` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-blog-platform/spec.md`

## Summary

Astro + MDX 기반의 인터랙티브 기술 블로그 플랫폼 구축. @animflow/core 라이브러리를 활용하여 MDX 콘텐츠 내에 인터랙티브 다이어그램을 임베드하고, SSG(Static Site Generation) 방식으로 배포한다. Islands 아키텍처를 통해 정적 콘텐츠와 인터랙티브 Canvas 컴포넌트를 효율적으로 분리한다.

## Technical Context

**Language/Version**: TypeScript 5.3+, Astro 4.x+
**Primary Dependencies**: Astro, @astrojs/mdx, @astrojs/react, @animflow/core, Zod
**Storage**: File-based (MDX content collections, no database)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), SSG deployment
**Project Type**: Web application (Astro static site)
**Performance Goals**: LCP <3s, AnimFlow render <100ms, 60fps animations
**Constraints**: Zero JS for static pages, <50KB additional JS for AnimFlow pages
**Scale/Scope**: 단일 저자 블로그, 초기 10-50개 포스트

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Declarative-First | PASS | MDX 내 `animflow` 코드블록으로 DSL 정의 |
| II. Interactive Visualization | PASS | AnimFlow 컴포넌트로 인터랙티브 다이어그램 제공 |
| III. Scenario-Driven Animation | PASS | @animflow/core 시나리오 시스템 활용 |
| IV. Platform Architecture | PASS | Astro + MDX 기반, @animflow/core 분리 |
| V. Content-First Development | PASS | 블로그 포스트 작성 경험 중심 설계 |
| VI. Open Standard | PASS | Astro 오픈소스 생태계, MIT 라이선스 |
| VII. LLM-Assisted Authoring | DEFER | 이 스펙 범위 외 (004-llm-yaml-generation) |
| VIII. Reader Experience First | PARTIAL | P1에서 기본 인터랙션, 고급 기능은 후속 스펙 |
| IX. Community & Collaboration | DEFER | 이 스펙 범위 외 (008-community-features) |

**Gate Status**: PASS - 핵심 원칙 준수, 고급 기능은 후속 스펙으로 분리

## Project Structure

### Documentation (this feature)

```text
specs/002-blog-platform/
├── plan.md              # This file
├── research.md          # Phase 0 output (complete)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
# Astro Blog Platform Structure
blog/                           # New Astro project (alongside packages/)
├── astro.config.mjs            # Astro configuration
├── package.json
├── tsconfig.json
├── src/
│   ├── components/
│   │   ├── AnimFlowEmbed.astro    # AnimFlow wrapper component
│   │   ├── AnimFlowEmbed.tsx      # React client component
│   │   ├── PostCard.astro         # Post list card
│   │   ├── TagList.astro          # Tag display/filter
│   │   ├── Header.astro           # Site header
│   │   ├── Footer.astro           # Site footer
│   │   └── ThemeToggle.astro      # Dark/light mode toggle
│   ├── layouts/
│   │   ├── BaseLayout.astro       # Base HTML layout
│   │   └── PostLayout.astro       # Blog post layout
│   ├── pages/
│   │   ├── index.astro            # Home page (post list)
│   │   ├── posts/
│   │   │   └── [...slug].astro    # Dynamic post pages
│   │   └── tags/
│   │       └── [tag].astro        # Tag filter pages
│   ├── content/
│   │   ├── config.ts              # Content collection config
│   │   └── posts/                 # MDX blog posts
│   │       └── *.mdx
│   ├── plugins/
│   │   └── remark-animflow.ts     # Custom remark plugin
│   └── styles/
│       ├── global.css             # Global styles
│       └── theme.css              # Theme variables
├── public/
│   └── favicon.svg
└── tests/
    ├── e2e/                       # Playwright E2E tests
    └── unit/                      # Vitest unit tests

# Existing AnimFlow packages (unchanged)
packages/
├── core/                          # @animflow/core library
└── playground/                    # Development playground
```

**Structure Decision**: Astro 프로젝트를 `blog/` 디렉토리에 신규 생성. 기존 `packages/` 구조와 분리하여 독립적인 배포 및 개발 가능. monorepo 내에서 `@animflow/core`를 workspace dependency로 참조.

## Complexity Tracking

> No constitution violations requiring justification.

## Implementation Phases

### Phase 1: Project Setup
- Astro 프로젝트 초기화 (`blog/`)
- MDX, React 통합 설정
- @animflow/core workspace 연결
- 기본 레이아웃 및 스타일 구성

### Phase 2: Content System
- Content Collections 설정 (Zod 스키마)
- 포스트 목록 페이지 구현
- 포스트 상세 페이지 구현
- 코드 블록 구문 강조 (Shiki)

### Phase 3: AnimFlow Integration
- remark-animflow 플러그인 개발
- AnimFlowEmbed 컴포넌트 구현 (client:only)
- 에러 바운더리 및 폴백 UI
- 예제 포스트 작성

### Phase 4: Navigation & UX
- 태그 필터링 페이지
- 반응형 레이아웃
- 다크/라이트 테마 토글
- 성능 최적화

## Key Technical Decisions

1. **Islands Architecture**: Canvas 컴포넌트만 클라이언트 사이드 렌더링 (`client:only="react"`)
2. **Remark Plugin**: 빌드 타임에 animflow 코드블록을 React 컴포넌트로 변환
3. **Content Collections**: Type-safe frontmatter 검증 및 쿼리
4. **Workspace Reference**: `@animflow/core` 패키지를 npm workspace로 참조
