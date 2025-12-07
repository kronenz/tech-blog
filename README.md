# AnimFlow

**Declarative Animated Diagram DSL Engine**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@animflow/core.svg)](https://www.npmjs.com/package/@animflow/core)

AnimFlow는 YAML 기반의 선언적 DSL을 사용하여 애니메이션 다이어그램을 생성하는 라이브러리입니다. 복잡한 시스템 아키텍처, 데이터 흐름, 상태 머신 등을 인터랙티브하게 시각화할 수 있습니다.

**[Live Demo](https://tech-blog-woad-ten.vercel.app/posts/animflow-demo)** | [Documentation](#documentation) | [Examples](#examples)

![AnimFlow Demo](https://tech-blog-woad-ten.vercel.app/og-image.png)

## Features

- **Declarative YAML DSL**: 코드 대신 YAML로 다이어그램 정의
- **Built-in Animation**: 노드 하이라이트, 엣지 애니메이션, 시나리오 기반 흐름
- **Multiple Scenarios**: 하나의 다이어그램에서 여러 시나리오 시뮬레이션
- **Playback Controls**: 재생, 일시정지, 속도 조절, 스텝 이동
- **Framework Agnostic**: Vanilla JS, React, Vue, Astro 등과 호환
- **Canvas Rendering**: 고성능 Canvas 기반 렌더링

## Quick Start

### Installation

```bash
npm install @animflow/core
```

### Basic Usage

```typescript
import { AnimFlow } from '@animflow/core';

const animflow = new AnimFlow({
  container: document.getElementById('diagram'),
  source: `
version: "1.0"
nodes:
  - id: client
    type: box
    label: Client
    position: { x: 100, y: 200 }
  - id: server
    type: box
    label: Server
    position: { x: 350, y: 200 }
  - id: database
    type: database
    label: Database
    position: { x: 600, y: 200 }
edges:
  - id: e1
    from: client
    to: server
    label: Request
  - id: e2
    from: server
    to: database
    label: Query
scenarios:
  - id: request-flow
    name: Request Flow
    steps:
      - action: highlight
        nodes: [client]
        style:
          color: "#3b82f6"
        duration: 500
      - action: animate-edge
        edge: e1
        label: "GET /api/users"
        duration: 800
      - action: highlight
        nodes: [server]
        style:
          color: "#10b981"
        duration: 500
`,
  format: 'yaml',
  autoRender: true,
});

// Play animation
animflow.play();
```

### React Integration

```tsx
import { useEffect, useRef } from 'react';
import { AnimFlow } from '@animflow/core';

function DiagramViewer({ yaml }: { yaml: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animflowRef = useRef<AnimFlow | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    animflowRef.current = new AnimFlow({
      container: containerRef.current,
      source: yaml,
      format: 'yaml',
      autoRender: true,
    });

    return () => {
      animflowRef.current?.destroy();
    };
  }, [yaml]);

  return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />;
}
```

## DSL Specification

### Node Types

| Type | Description |
|------|-------------|
| `box` | 일반적인 사각형 노드 |
| `database` | 데이터베이스를 나타내는 원통형 노드 |

### Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `highlight` | 노드 하이라이트 | `nodes`, `style`, `duration` |
| `animate-edge` | 엣지 애니메이션 | `edge`, `label`, `duration` |

### Identifier Rules

모든 ID는 다음 패턴을 따라야 합니다: `^[a-z][a-z0-9-]*$`
- 소문자로 시작
- 소문자, 숫자, 하이픈만 허용

## Examples

### Cache System Flow

```yaml
version: "1.0"
nodes:
  - id: client
    type: box
    label: Client
    position: { x: 100, y: 200 }
  - id: cache
    type: database
    label: Redis Cache
    position: { x: 350, y: 200 }
  - id: db
    type: database
    label: Database
    position: { x: 600, y: 200 }
edges:
  - id: e1
    from: client
    to: cache
    label: GET
  - id: e2
    from: cache
    to: db
    label: Query
scenarios:
  - id: cache-hit
    name: Cache Hit
    steps:
      - action: animate-edge
        edge: e1
        label: "GET user:123"
        duration: 800
      - action: highlight
        nodes: [cache]
        style:
          color: "#4ade80"
        duration: 500
```

**More Examples:**
- [State Machine Pattern](https://tech-blog-woad-ten.vercel.app/posts/animflow-state-machine)
- [JavaScript Event Loop](https://tech-blog-woad-ten.vercel.app/posts/animflow-event-loop)
- [REST API Flow](https://tech-blog-woad-ten.vercel.app/posts/animflow-api-flow)
- [Prometheus HA with Thanos](https://tech-blog-woad-ten.vercel.app/posts/prometheus-ha-thanos-kubernetes)

## Project Structure

```
animflow/
├── packages/
│   ├── core/                 # @animflow/core - Main library
│   │   ├── src/
│   │   │   ├── parser/       # YAML/JSON parser
│   │   │   ├── renderer/     # Canvas renderer
│   │   │   ├── animator/     # Animation engine
│   │   │   └── schema/       # JSON Schema validation
│   │   └── package.json
│   └── playground/           # Development playground
├── blog/                     # Example blog using AnimFlow
│   ├── src/
│   │   ├── components/       # Astro/React components
│   │   └── content/posts/    # MDX posts with AnimFlow diagrams
│   └── package.json
├── tests/                    # Test suites
└── package.json              # Root workspace
```

## Documentation

### API Reference

#### `AnimFlow` Class

```typescript
interface AnimFlowOptions {
  container: HTMLElement;       // Container element
  source: string;               // YAML or JSON source
  format: 'yaml' | 'json';      // Source format
  autoRender?: boolean;         // Auto render on init (default: true)
  showControls?: boolean;       // Show built-in controls (default: false)
  showProgress?: boolean;       // Show progress indicator (default: true)
}

class AnimFlow {
  constructor(options: AnimFlowOptions);

  play(): void;                 // Start animation
  pause(): void;                // Pause animation
  stop(): void;                 // Stop and reset
  reset(): void;                // Reset to initial state

  setScenario(id: string): void;      // Switch scenario
  setSpeed(speed: number): void;      // Set playback speed (0.5x - 2x)

  getScenarios(): Scenario[];         // Get available scenarios
  getCurrentScenario(): string | null; // Get current scenario ID

  destroy(): void;              // Cleanup
}
```

### Blog Integration (Astro + MDX)

AnimFlow는 기술 블로그에서 복잡한 개념을 시각화하는 데 이상적입니다. [blog/](./blog/) 디렉토리에서 Astro + MDX 기반의 실제 사용 예시를 확인하세요.

```mdx
---
title: "Understanding Cache Systems"
---

import AnimFlowEmbed from '../../components/AnimFlowEmbed.astro';

<AnimFlowEmbed
  id="cache-demo"
  title="Cache Lookup Flow"
  height={400}
  yaml={`version: "1.0"
nodes:
  - id: client
    type: box
    label: Client
    ...
`}
/>
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup

```bash
# Clone repository
git clone https://github.com/kronenz/tech-blog.git
cd tech-blog

# Install dependencies
npm install

# Build core library
npm run build -w @animflow/core

# Start blog dev server
npm run dev -w blog
```

### Scripts

```bash
# Build
npm run build                  # Build core library

# Development
npm run dev                    # Start playground
npm run dev -w blog            # Start blog dev server

# Testing
npm run test                   # Run tests
npm run test:run               # Run tests once

# Type checking
npm run typecheck              # TypeScript type check
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Mermaid.js and D3.js
- Built with Vite, TypeScript, and Canvas API

---

**[View Live Demo](https://tech-blog-woad-ten.vercel.app/posts/animflow-demo)** | **[Report Bug](https://github.com/kronenz/tech-blog/issues)** | **[Request Feature](https://github.com/kronenz/tech-blog/issues)**
