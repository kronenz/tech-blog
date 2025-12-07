# Turso SSR Integration Specification

## Overview

Astro SSR 모드로 전환하고 Turso(libSQL)를 데이터베이스로 사용하여 에디터에서 작성한 포스트를 동적으로 발행할 수 있도록 한다.

## Goals

1. **동적 콘텐츠 발행**: 에디터에서 작성 → DB 저장 → 즉시 블로그에 반영
2. **하이브리드 렌더링**: 정적 페이지(홈, about)와 동적 페이지(posts) 혼용
3. **Edge 최적화**: Turso의 글로벌 복제로 빠른 응답
4. **기존 MDX 호환**: 기존 content collection MDX 파일도 계속 지원

## Non-Goals

- 사용자 인증 (향후 별도 기능으로)
- 댓글 시스템
- 이미지 업로드 (외부 링크 사용)

## User Stories

### US1: 에디터에서 포스트 발행 (P1)
저자가 에디터에서 "Publish" 버튼을 클릭하면 포스트가 DB에 저장되고 즉시 블로그에서 볼 수 있다.

**Acceptance Criteria:**
- Publish 버튼 클릭 시 포스트가 Turso DB에 저장됨
- 저장 후 포스트 URL로 리다이렉트
- 중복 slug 시 에러 메시지 표시

### US2: DB 포스트 조회 (P1)
방문자가 `/posts/[slug]` URL로 접근하면 DB에서 포스트를 조회하여 렌더링한다.

**Acceptance Criteria:**
- DB에 있는 포스트는 SSR로 렌더링
- MDX content collection 포스트도 여전히 동작
- 존재하지 않는 slug는 404 페이지

### US3: 포스트 목록 조회 (P2)
홈페이지와 포스트 목록에서 DB 포스트와 MDX 포스트를 통합하여 표시한다.

**Acceptance Criteria:**
- DB 포스트 + MDX 포스트 통합 목록
- 발행일 기준 정렬
- 태그 필터링 지원

### US4: 포스트 수정 (P2)
저자가 기존 포스트를 수정하고 "Update" 버튼을 클릭하면 DB가 업데이트된다.

**Acceptance Criteria:**
- 에디터에서 기존 포스트 불러오기
- Update 시 DB 업데이트
- 수정 시간 기록

### US5: 포스트 삭제/비공개 (P3)
저자가 포스트를 삭제하거나 비공개로 전환할 수 있다.

**Acceptance Criteria:**
- 삭제 시 soft delete (is_deleted 플래그)
- 비공개 시 published = false
- 비공개 포스트는 목록에서 숨김

## Technical Design

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Static     │    │  SSR        │    │  API        │     │
│  │  (/, /about)│    │  (/posts/*) │    │  (/api/*)   │     │
│  └─────────────┘    └──────┬──────┘    └──────┬──────┘     │
│                            │                   │            │
│                            └───────┬───────────┘            │
│                                    │                        │
│                            ┌───────▼───────┐                │
│                            │  Turso Client │                │
│                            └───────┬───────┘                │
└────────────────────────────────────┼────────────────────────┘
                                     │
                             ┌───────▼───────┐
                             │   Turso DB    │
                             │   (libSQL)    │
                             │  Global Edge  │
                             └───────────────┘
```

### Database Schema

```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  tags TEXT, -- JSON array
  published BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  published_at TEXT
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(published, is_deleted);
CREATE INDEX idx_posts_published_at ON posts(published_at);
```

### API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/posts | 포스트 목록 조회 |
| GET | /api/posts/[slug] | 단일 포스트 조회 |
| POST | /api/posts | 포스트 생성 |
| PUT | /api/posts/[slug] | 포스트 수정 |
| DELETE | /api/posts/[slug] | 포스트 삭제 |

### Page Rendering Strategy

| Page | Mode | Reason |
|------|------|--------|
| / | Static (prerender) | 변경 드묾, 성능 우선 |
| /about | Static | 정적 콘텐츠 |
| /posts/[slug] | SSR | 동적 콘텐츠 |
| /editor | SSR | 발행 기능 |
| /tags/[tag] | SSR | 동적 필터링 |

## Dependencies

- `@libsql/client`: Turso DB 클라이언트
- Astro SSR adapter 변경: `@astrojs/vercel` (serverless mode)

## Environment Variables

```
TURSO_DATABASE_URL=libsql://[db-name]-[org].turso.io
TURSO_AUTH_TOKEN=eyJ...
```

## Migration Plan

1. Turso DB 생성 및 스키마 적용
2. Astro hybrid 모드 전환
3. DB 클라이언트 설정
4. API routes 구현
5. 포스트 페이지 SSR 전환
6. 에디터에 Publish 기능 추가
7. 포스트 목록 통합

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Turso 서비스 장애 | Fallback으로 MDX 포스트만 표시 |
| Cold start 지연 | Edge runtime 사용, keep-alive |
| 데이터 유실 | 정기 백업, soft delete |
