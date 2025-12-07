# Data Model: Interactive Tech Blog Platform

**Feature**: 002-blog-platform
**Date**: 2025-12-07

## Overview

파일 기반 콘텐츠 시스템으로, 데이터베이스 없이 MDX 파일과 frontmatter를 통해 콘텐츠를 관리한다. Astro Content Collections와 Zod 스키마를 사용하여 타입 안전성을 보장한다.

## Core Entities

### 1. Post (블로그 포스트)

MDX 파일의 frontmatter와 본문으로 구성된 블로그 포스트.

**Location**: `blog/src/content/posts/*.mdx`

```typescript
// blog/src/content/config.ts
import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Required fields
    title: z.string().min(1).max(100),
    pubDate: z.coerce.date(),

    // Optional fields
    description: z.string().max(200).optional(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),

    // Hero image (optional)
    heroImage: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),

    // AnimFlow metadata (auto-detected from content)
    hasAnimFlow: z.boolean().default(false),
  }),
});

export const collections = {
  posts: postsCollection,
};
```

**Example Frontmatter**:
```yaml
---
title: "캐시 시스템 동작 원리"
pubDate: 2025-12-07
description: "Redis 캐시의 동작 원리를 AnimFlow로 시각화합니다"
tags: ["redis", "cache", "backend"]
draft: false
hasAnimFlow: true
---
```

**Derived Fields** (런타임 계산):
- `slug`: 파일명에서 자동 생성
- `readingTime`: 본문 길이 기반 계산
- `animflowCount`: 포스트 내 animflow 블록 수

---

### 2. AnimFlow Block (인라인 다이어그램)

MDX 본문 내 `animflow` 코드블록으로 정의된 인터랙티브 다이어그램.

**Location**: MDX 파일 본문 내 코드블록

```typescript
// Remark 플러그인에서 파싱되는 구조
interface AnimFlowBlock {
  // 코드블록 메타데이터
  id?: string;           // 선택적 식별자 (```animflow id="cache-flow")
  title?: string;        // 다이어그램 제목
  height?: number;       // 캔버스 높이 (기본: 400)

  // YAML 콘텐츠 (파싱 전)
  rawYaml: string;

  // 파싱 결과 (@animflow/core 타입)
  diagram?: Diagram;     // 파싱 성공 시
  parseError?: string;   // 파싱 실패 시 에러 메시지
}
```

**Example Usage in MDX**:
````markdown
아래 다이어그램은 캐시 조회 과정을 보여줍니다:

```animflow title="Cache Lookup Flow" height="500"
metadata:
  title: Cache Lookup

nodes:
  - id: client
    type: actor
    label: Client
    position: { x: 100, y: 200 }
  - id: cache
    type: database
    label: Redis Cache
    position: { x: 300, y: 200 }

edges:
  - id: e1
    from: client
    to: cache
    label: GET key

scenarios:
  - id: cache-hit
    name: Cache Hit
    steps:
      - action: animate-edge
        edge: e1
        label: "GET user:123"
```
````

---

### 3. Tag (포스트 분류 태그)

포스트 frontmatter의 tags 배열에서 추출되는 분류 태그.

```typescript
// 런타임에 계산되는 태그 정보
interface TagInfo {
  name: string;        // 태그 이름 (lowercase)
  count: number;       // 해당 태그를 가진 포스트 수
  posts: Post[];       // 해당 태그의 포스트 목록
}
```

**Tag Aggregation** (빌드 타임):
```typescript
// blog/src/utils/tags.ts
export async function getAllTags(): Promise<TagInfo[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);

  const tagMap = new Map<string, Post[]>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const normalizedTag = tag.toLowerCase();
      if (!tagMap.has(normalizedTag)) {
        tagMap.set(normalizedTag, []);
      }
      tagMap.get(normalizedTag)!.push(post);
    }
  }

  return Array.from(tagMap.entries())
    .map(([name, posts]) => ({ name, count: posts.length, posts }))
    .sort((a, b) => b.count - a.count);
}
```

---

### 4. SiteConfig (사이트 설정)

전역 사이트 설정으로, 하드코딩 또는 환경변수로 관리.

```typescript
// blog/src/config.ts
export const siteConfig = {
  title: 'Tech Blog',
  description: 'Interactive technical blog with AnimFlow diagrams',
  author: {
    name: 'Author Name',
    avatar: '/avatar.png',
    bio: 'Software Engineer',
    social: {
      github: 'https://github.com/username',
      twitter: 'https://twitter.com/username',
    },
  },
  postsPerPage: 10,
  defaultTheme: 'system' as 'light' | 'dark' | 'system',
};
```

---

## Relationships

```
┌─────────────────────────────────────────────────────────┐
│                     SiteConfig                          │
│  (1 per site - global settings)                         │
└─────────────────────────────────────────────────────────┘
                            │
                            │ configures
                            ▼
┌─────────────────────────────────────────────────────────┐
│                        Post                             │
│  (MDX file = 1 post)                                    │
│  - frontmatter (title, date, tags, etc.)               │
│  - content (MDX body with components)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ AnimFlow 1  │  │ AnimFlow 2  │  │    ...      │    │
│  │ (inline)    │  │ (inline)    │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│       0..n animflow blocks per post                     │
└─────────────────────────────────────────────────────────┘
                            │
                            │ has many
                            ▼
┌─────────────────────────────────────────────────────────┐
│                        Tag                              │
│  (aggregated at build time)                             │
│  - many-to-many with Post                               │
└─────────────────────────────────────────────────────────┘
```

---

## Validation Rules

### Post Validation
- `title`: 필수, 1-100자
- `pubDate`: 필수, 유효한 날짜 형식
- `description`: 선택, 최대 200자
- `tags`: 선택, 문자열 배열
- `draft`: 기본값 false (true인 경우 프로덕션 빌드에서 제외)

### AnimFlow Block Validation
- YAML 구문 유효성 (js-yaml 파싱)
- @animflow/core 스키마 준수 (ajv 검증)
- 파싱 실패 시 에러 UI 표시, 페이지 전체는 정상 렌더링

### Tag Validation
- 대소문자 무시 (lowercase 정규화)
- 특수문자 허용 (kebab-case 권장)

---

## State Transitions

### Post Lifecycle
```
Draft → Published → Updated → Archived (optional)
         ↑                        │
         └────────────────────────┘
              (unpublish)
```

- **Draft** (`draft: true`): 개발 모드에서만 표시
- **Published** (`draft: false`): 프로덕션 빌드에 포함
- **Updated**: `updatedDate` 필드 추가/수정
- **Archived**: 파일 삭제 또는 별도 폴더 이동 (선택적)

### AnimFlow State (런타임)
```
Loading → Ready → Playing → Paused → Completed
    │       │         │         │
    └───────┴─────────┴─────────┴── Error (parse/render failure)
```

---

## File Structure

```
blog/src/content/
├── config.ts                # Collection schema definitions
└── posts/
    ├── 2025-12-07-cache-system.mdx
    ├── 2025-12-08-event-sourcing.mdx
    └── ...
```

**Naming Convention**: `YYYY-MM-DD-slug.mdx` (날짜 prefix로 정렬 용이)
