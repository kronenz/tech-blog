# AnimFlow Tech Blog

**Live Demo: [https://tech-blog-woad-ten.vercel.app](https://tech-blog-woad-ten.vercel.app)**

이 블로그는 AnimFlow를 활용한 실제 사용 예시를 보여주는 기술 블로그입니다. Astro + MDX로 구축되어 있으며, AnimFlow 다이어그램을 블로그 포스트에 자연스럽게 통합하는 방법을 보여줍니다.

## Features

- **Astro 5.x** - 정적 사이트 생성
- **MDX** - 마크다운에서 컴포넌트 사용
- **AnimFlow Integration** - 인터랙티브 다이어그램
- **Dark/Light Theme** - 테마 전환
- **Responsive Design** - 모바일 최적화
- **Vercel Deployment** - 자동 배포

## Posts with AnimFlow

| Post | Description |
|------|-------------|
| [AnimFlow Demo](https://tech-blog-woad-ten.vercel.app/posts/animflow-demo) | 기본 사용법 및 Cache Flow 예시 |
| [State Machine Pattern](https://tech-blog-woad-ten.vercel.app/posts/animflow-state-machine) | 상태 머신 시각화 |
| [JavaScript Event Loop](https://tech-blog-woad-ten.vercel.app/posts/animflow-event-loop) | 이벤트 루프 동작 원리 |
| [REST API Flow](https://tech-blog-woad-ten.vercel.app/posts/animflow-api-flow) | API 요청 흐름 |
| [Prometheus HA with Thanos](https://tech-blog-woad-ten.vercel.app/posts/prometheus-ha-thanos-kubernetes) | Kubernetes 모니터링 아키텍처 |

## Usage

### Development

```bash
# From repository root
npm install
npm run build -w @animflow/core
npm run dev -w blog
```

### Build

```bash
npm run build -w blog
```

### Preview Production Build

```bash
npm run preview -w blog
```

## Adding AnimFlow to Posts

### 1. Create MDX Post

```mdx
---
title: "My Post Title"
pubDate: 2024-01-01
description: "Post description"
tags: ["animflow", "tutorial"]
---

import AnimFlowEmbed from '../../components/AnimFlowEmbed.astro';

# My Post

Content here...

<AnimFlowEmbed
  id="my-diagram"
  title="My Diagram"
  height={400}
  yaml={`version: "1.0"
nodes:
  - id: client
    type: box
    label: Client
    position: { x: 100, y: 200 }
  - id: server
    type: box
    label: Server
    position: { x: 400, y: 200 }
edges:
  - id: e1
    from: client
    to: server
    label: Request
scenarios:
  - id: main
    name: Main Flow
    steps:
      - action: highlight
        nodes: [client]
        style:
          color: "#3b82f6"
        duration: 500
      - action: animate-edge
        edge: e1
        duration: 800`}
/>
```

### 2. AnimFlowEmbed Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the diagram |
| `title` | string | Display title |
| `height` | number | Container height in pixels |
| `yaml` | string | AnimFlow YAML source |

### 3. DSL Quick Reference

#### Node Types
- `box` - Rectangle node
- `database` - Database cylinder

#### Actions
- `highlight` - Highlight nodes
- `animate-edge` - Animate along edge

#### ID Rules
- Lowercase only: `^[a-z][a-z0-9-]*$`
- Example: `cache-hit` (valid), `cacheHit` (invalid)

## Project Structure

```
blog/
├── src/
│   ├── components/
│   │   ├── AnimFlowEmbed.astro   # AnimFlow wrapper
│   │   ├── AnimFlowEmbed.tsx     # React implementation
│   │   ├── PostCard.astro        # Post list card
│   │   └── Header.astro          # Navigation
│   ├── content/
│   │   ├── config.ts             # Content collections
│   │   └── posts/                # MDX posts
│   ├── layouts/
│   │   ├── Layout.astro          # Base layout
│   │   └── PostLayout.astro      # Post layout
│   ├── pages/
│   │   ├── index.astro           # Homepage
│   │   └── posts/[...slug].astro # Post pages
│   └── styles/
│       └── global.css            # Global styles
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## AnimFlowEmbed Component

The blog uses a custom `AnimFlowEmbed` component that:

1. **Lazy loads** AnimFlow core library for performance
2. **Provides controls** - Play, Pause, Reset, Speed, Scenario selector
3. **Shows progress** - Step indicator during animations
4. **Handles errors** - Displays validation errors gracefully

## Deployment

The blog is deployed to Vercel automatically on push to `master` branch.

### Vercel Configuration

```json
{
  "buildCommand": "cd .. && npm install && npm run build -w @animflow/core && cd blog && npm run build",
  "outputDirectory": "dist",
  "framework": "astro"
}
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](../LICENSE)
