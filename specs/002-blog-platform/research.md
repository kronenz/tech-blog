# Research: Interactive Tech Blog Platform

**Feature**: 002-blog-platform
**Date**: 2025-12-07
**Status**: Complete

## Research Areas

### 1. Astro + MDX Integration

**Decision**: Use `@astrojs/mdx` with custom component mapping via Astro's `components` prop

**Rationale**:
- Astro's official MDX integration is the most direct approach
- MDX allows mixing Markdown content with React/Astro components seamlessly
- Custom components mapped at render time for AnimFlow injection
- Built-in TypeScript support and Astro ecosystem integration

**Alternatives Considered**:
- Markdown-only with separate import statements (less ergonomic)
- `next-mdx-remote` pattern (adds unnecessary server-client split for SSG)
- Manual MDX compilation (premature optimization, adds complexity)

---

### 2. Custom Code Block Processing (animflow blocks)

**Decision**: Two-layer approach - Remark plugin for AST transformation + custom Astro component for rendering

**Rationale**:
- **Remark plugin** transforms code blocks with `animflow` language tag into custom JSX nodes during markdown parsing
- Preserves ability to pass component props and metadata
- Custom Astro component receives parsed props and renders interactive component
- Clean separation of concerns: parsing logic vs rendering logic

**Recommended Plugin Chain**:
1. Custom Remark Plugin: Identifies `animflow` code blocks, transforms to MDX JSX
2. rehype-mdx-code-props (Optional): Interprets metadata as JSX props
3. Custom Astro Component: Receives data, renders with `client:only`

**Alternatives Considered**:
- Rehype-only approach (metadata lost in HTML transformation)
- Building custom Astro parser (reinventing the wheel, less maintainable)

---

### 3. Canvas Components in Astro/SSG

**Decision**: Use `client:only="react"` directive for Canvas components with Islands architecture

**Rationale**:
- Canvas elements require browser APIs (no server-side DOM equivalent)
- `client:only` skips server rendering entirely, avoiding hydration errors
- Islands architecture keeps most of page static HTML (fast) while isolating Canvas to interactive islands
- Matches Astro's zero-JavaScript-by-default philosophy

**Implementation Pattern**:
```astro
---
import AnimFlowCanvas from '../components/AnimFlowCanvas';
---

<AnimFlowCanvas client:only="react" dslCode={props.code} />
```

**Alternatives Considered**:
- `client:load` (would try to server-render Canvas - fails)
- `client:visible` (acceptable for below-fold Canvas, but less ideal)
- Full client rendering SPA (loses SSG benefits)

---

### 4. Astro Content Collections

**Decision**: Use Content Collections with Zod schema validation for blog posts

**Rationale**:
- Content Collections provide type-safe queries with full TypeScript support
- Zod schemas validate frontmatter structure at build time
- Integrates seamlessly with MDX content
- Enables scalable content organization as blog grows

**Schema Structure**:
```typescript
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string().optional(),
    tags: z.array(z.string()),
  }),
});
```

**Alternatives Considered**:
- File-based imports from `glob()` (no validation, less type safety)
- Database-backed collections (overengineered for blog content)

---

### 5. Performance Architecture

**Decision**: SSG-first with Islands for interactive Canvas components + code splitting

**Strategy**:
1. **Build-time**: Static HTML generation for all content
2. **Bundle-level**: AnimFlow library only included on pages using animflow blocks
3. **Component-level**: Canvas components use `client:only` for selective hydration
4. **Runtime**: Lazy load AnimFlow on demand via dynamic imports

**Performance Targets**:
- Static pages: ~5-15 KB HTML (zero JS if no interactive components)
- AnimFlow pages: ~30-50 KB additional JS
- LCP: <1.2s for static content, <3s for AnimFlow pages
- FID: <100ms for interactive Canvas

**Alternatives Considered**:
- Full SSR with Next.js (slower build times, unnecessary for blog)
- Client-side rendering SPA (loses search engine benefits)
- No Islands optimization (wastes bandwidth on unnecessary JavaScript)

---

## Tech Stack Summary

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Astro | 4.x+ |
| Language | TypeScript | 5.3+ |
| MDX | @astrojs/mdx | latest |
| Content | astro:content | built-in |
| Validation | Zod | latest |
| Canvas Library | @animflow/core | 0.1.0 |
| React (Islands) | React | 18+ |
| Syntax Highlight | Shiki | built-in |
| Bundler | Vite | built-in |

---

## Key Decisions Summary

| Aspect | Decision | Impact |
|--------|----------|--------|
| SSG vs SSR | SSG-first | ~90% less JS |
| MDX Integration | @astrojs/mdx | Native, zero overhead |
| Code Blocks | Remark plugin | Build-time transformation |
| Canvas Rendering | client:only Islands | ~30-50KB JS on AnimFlow pages |
| Content | Content Collections | Type-safe, validated |
| Bundle | Auto + dynamic imports | ~50-60% reduction possible |

---

## References

- [Astro MDX Integration Guide](https://docs.astro.build/en/guides/integrations-guide/mdx/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/)
- [Remark Plugin Architecture](https://github.com/remarkjs/remark)
- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/)
