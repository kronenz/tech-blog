# Quickstart: AnimFlow DSL Engine

**Feature**: 001-animflow-dsl-engine
**Date**: 2025-11-26

## Prerequisites

- Node.js 18+
- npm 9+
- Modern browser (Chrome, Firefox, Safari, Edge)

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd tech-blog

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Setup

```bash
# Initialize monorepo (if starting from scratch)
npm init -y
npm install -D typescript vite vitest

# Create workspace structure
mkdir -p packages/core/src packages/playground/src
```

## Basic Usage

### 1. Create a Diagram Definition

Create `caching-flow.animflow.yaml`:

```yaml
version: "1.0"

metadata:
  title: "Caching Flow Diagram"
  description: "Simple cache hit/miss demonstration"

canvas:
  width: 800
  height: 400
  background: "#f8f9fa"

nodes:
  - id: client
    label: "Client"
    position: { x: 100, y: 180 }
    style:
      color: "#3b82f6"
      shape: rounded-rect

  - id: cache
    label: "Cache"
    position: { x: 350, y: 180 }
    style:
      color: "#10b981"
      shape: rounded-rect

  - id: database
    label: "Database"
    position: { x: 600, y: 180 }
    style:
      color: "#6366f1"
      shape: rounded-rect

edges:
  - id: client-cache
    from: client
    to: cache
    label: "Request"
    style:
      color: "#adb5bd"

  - id: cache-db
    from: cache
    to: database
    label: "Query"
    style:
      color: "#adb5bd"
      lineType: dashed

variables:
  - type: boolean
    default: false

scenarios:
  - id: cache-hit
    name: "Cache Hit"
    steps:
      - action: highlight
        nodes: [client]
        style: { color: "#3b82f6", glow: true }
        duration: 500

      - action: animate-edge
        edge: client-cache
        style: { color: "#3b82f6" }
        label: "GET /data"
        duration: 800

      - action: highlight
        nodes: [cache]
        style: { color: "#10b981", glow: true }
        log:
          message: "Cache HIT - returning cached data"
          type: success
        duration: 600

      - action: reset

  - id: cache-miss
    name: "Cache Miss"
    steps:
      - action: highlight
        nodes: [client]
        style: { color: "#3b82f6", glow: true }
        duration: 500

      - action: animate-edge
        edge: client-cache
        style: { color: "#3b82f6" }
        label: "GET /data"
        duration: 800

      - action: highlight
        nodes: [cache]
        style: { color: "#ef4444", glow: true }
        log:
          message: "Cache MISS - fetching from database"
          type: warning
        duration: 600

      - action: animate-edge
        edge: cache-db
        style: { color: "#6366f1" }
        label: "SELECT"
        duration: 1000

      - action: highlight
        nodes: [database]
        style: { color: "#6366f1", glow: true }
        log:
          message: "Database query executed"
          type: info
        duration: 800

      - action: reset

controls:
  scenarios:
    type: button-group
    options:
      - id: cache-hit
        label: "Cache Hit"
        default: true
      - id: cache-miss
        label: "Cache Miss"
  speed:
    type: select
    label: "Speed"
    options:
      - value: 0.5
        label: "0.5x"
      - value: 1
        label: "1x"
        default: true
      - value: 2
        label: "2x"
  buttons:
    - id: start
      label: "▶ Start"
      action: start
    - id: reset
      label: "↺ Reset"
      action: reset

logging:
  enabled: true
  maxEntries: 10
  timestampFormat: "HH:mm:ss"
```

### 2. Render the Diagram

```typescript
import { AnimFlow } from '@animflow/core';

// Load and parse the diagram
const response = await fetch('/diagrams/caching-flow.animflow.yaml');
const yamlContent = await response.text();

// Initialize AnimFlow
const animflow = new AnimFlow({
  container: document.getElementById('diagram-container'),
  source: yamlContent,
  format: 'yaml'
});

// Render the diagram
await animflow.render();

// Start a scenario
animflow.runScenario('cache-hit');
```

### 3. HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>AnimFlow Demo</title>
  <style>
    #diagram-container {
      width: 800px;
      height: 600px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div id="diagram-container"></div>
  <script type="module" src="/main.ts"></script>
</body>
</html>
```

## API Reference

### AnimFlow Class

```typescript
class AnimFlow {
  constructor(options: AnimFlowOptions);

  // Rendering
  render(): Promise<void>;

  // Scenario control
  runScenario(scenarioId: string): Promise<void>;
  pause(): void;
  resume(): void;
  reset(): void;

  // Speed control
  setSpeed(multiplier: number): void;

  // Events
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;

  // Cleanup
  destroy(): void;
}
```

### AnimFlowOptions

```typescript
interface AnimFlowOptions {
  container: HTMLElement;      // Target DOM element
  source: string;              // YAML/JSON content
  format: 'yaml' | 'json';     // Source format
  autoRender?: boolean;        // Auto-render on init (default: false)
  defaultScenario?: string;    // Auto-run scenario on render
}
```

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `render` | `{ diagram }` | Diagram rendered |
| `scenario:start` | `{ scenarioId }` | Scenario started |
| `scenario:step` | `{ scenarioId, stepIndex, step }` | Step executed |
| `scenario:end` | `{ scenarioId }` | Scenario completed |
| `error` | `{ error }` | Error occurred |

## Common Patterns

### Conditional Animation

```yaml
steps:
  - action: conditional
    condition: { $random: { probability: 0.7 } }
    then:
      - action: highlight
        nodes: [cache]
        log:
          message: "Cache hit!"
          type: success
    else:
      - action: highlight
        nodes: [database]
        log:
          message: "Cache miss - fetching from DB"
          type: warning
```

### Parallel Animations

```yaml
steps:
  - action: parallel
    steps:
      - action: animate-edge
        edge: edge-1
        duration: 1000
      - action: animate-edge
        edge: edge-2
        duration: 1000
```

### Using Variables

```yaml
variables:
  - type: number
    default: 0

scenarios:
  - id: demo
    init:
      requestCount: 0
    steps:
      - action: update-stat
        stats:
          requests: { $add: [{ $var: "requestCount" }, 1] }
```

## Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid YAML syntax` | YAML parsing failed | Check indentation and quotes |
| `Unknown node: xxx` | Edge references undefined node | Verify node ID exists |
| `Scenario not found` | Invalid scenario ID | Check scenario ID spelling |
| `Canvas not found` | Container element missing | Ensure container exists in DOM |

### Validation

Enable verbose validation for debugging:

```typescript
const animflow = new AnimFlow({
  container: document.getElementById('diagram'),
  source: yamlContent,
  format: 'yaml',
  debug: true  // Enables verbose error messages
});
```

## Next Steps

1. **Review Schema**: See [contracts/animflow.schema.json](./contracts/animflow.schema.json) for full DSL specification
2. **Data Model**: See [data-model.md](./data-model.md) for entity relationships
3. **Research**: See [research.md](./research.md) for technology decisions
4. **Tasks**: Run `/speckit.tasks` to generate implementation tasks
