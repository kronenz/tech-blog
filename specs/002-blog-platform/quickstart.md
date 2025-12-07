# Quickstart: Interactive Tech Blog Platform

**Feature**: 002-blog-platform
**Date**: 2025-12-07

## Prerequisites

- Node.js 18+
- npm 9+ (workspace support)
- @animflow/core built locally

## Quick Setup

```bash
# 1. Navigate to repository root
cd /path/to/tech-blog

# 2. Create blog directory and initialize Astro
npm create astro@latest blog -- --template minimal --typescript strict --git false

# 3. Add to workspace
# Edit root package.json:
# "workspaces": ["packages/*", "blog"]

# 4. Install dependencies from root
npm install

# 5. Add integrations
cd blog
npx astro add mdx react

# 6. Link local @animflow/core
npm install @animflow/core@*
```

## Development

```bash
# From repository root
npm run dev -w blog

# Or from blog directory
cd blog && npm run dev
```

Open http://localhost:4321 to view the blog.

## Create Your First Post

```bash
# Create content directory
mkdir -p blog/src/content/posts

# Create content config
cat > blog/src/content/config.ts << 'EOF'
import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts: postsCollection };
EOF
```

Create a sample post at `blog/src/content/posts/hello-world.mdx`:

```mdx
---
title: "Hello World"
pubDate: 2025-12-07
description: "My first blog post with AnimFlow"
tags: ["intro", "animflow"]
---

# Hello World

This is my first post with an interactive diagram:

\`\`\`animflow
metadata:
  title: Hello AnimFlow

nodes:
  - id: start
    type: process
    label: Start
    position: { x: 100, y: 100 }
  - id: end
    type: process
    label: End
    position: { x: 300, y: 100 }

edges:
  - id: e1
    from: start
    to: end
    label: Flow

scenarios:
  - id: main
    name: Main Flow
    steps:
      - action: animate-edge
        edge: e1
        duration: 1000
\`\`\`

The diagram above demonstrates a simple flow.
```

## Build for Production

```bash
# From repository root
npm run build -w blog

# Preview production build
npm run preview -w blog
```

## Project Structure After Setup

```
tech-blog/
├── package.json              # Root workspace
├── packages/
│   ├── core/                 # @animflow/core
│   └── playground/           # Development playground
└── blog/                     # Astro blog (NEW)
    ├── astro.config.mjs
    ├── package.json
    ├── src/
    │   ├── components/
    │   ├── content/
    │   │   ├── config.ts
    │   │   └── posts/
    │   ├── layouts/
    │   ├── pages/
    │   └── plugins/
    └── public/
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev -w blog` | Start dev server |
| `npm run build -w blog` | Build for production |
| `npm run preview -w blog` | Preview production build |
| `npm run build -w @animflow/core` | Rebuild AnimFlow core |

## Verification Checklist

- [ ] Dev server starts without errors
- [ ] Homepage displays post list
- [ ] Post page renders MDX content
- [ ] AnimFlow diagrams render in browser
- [ ] Play/pause controls work
- [ ] Production build completes
- [ ] Built site loads correctly

## Troubleshooting

### AnimFlow not rendering
- Ensure @animflow/core is built: `npm run build -w @animflow/core`
- Check browser console for errors
- Verify client:only directive is used for Canvas components

### Content not appearing
- Check frontmatter YAML syntax
- Ensure `draft: false` for production builds
- Verify file is in `src/content/posts/` with `.mdx` extension

### Type errors
- Run `npm run typecheck` to check types
- Ensure content config matches frontmatter schema
