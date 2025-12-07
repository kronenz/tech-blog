# Quickstart: AI-Powered Markdown Editor

**Date**: 2025-12-07
**Prerequisites**: Node.js 18+, npm, Gemini API Key

## 1. Environment Setup

### 1.1 Install Dependencies

```bash
cd blog

# 편집기 핵심 의존성
npm install @uiw/react-codemirror @codemirror/lang-markdown @codemirror/lang-yaml

# 마크다운 렌더링
npm install react-markdown remark-gfm rehype-highlight

# AI 연동
npm install @google/genai

# 유틸리티
npm install js-yaml zod uuid
```

### 1.2 Type Definitions

```bash
npm install -D @types/js-yaml @types/uuid
```

---

## 2. Create Editor Page

### 2.1 Astro Page

```astro
---
// blog/src/pages/editor.astro
import Layout from '../layouts/Layout.astro';
import MarkdownEditor from '../components/editor/MarkdownEditor';
---

<Layout title="AI Markdown Editor">
  <main class="editor-page">
    <MarkdownEditor client:only="react" />
  </main>
</Layout>

<style>
  .editor-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
```

---

## 3. Create Core Components

### 3.1 MarkdownEditor (Main Component)

```typescript
// blog/src/components/editor/MarkdownEditor.tsx
import React, { useState, useCallback } from 'react';
import { EditorPanel } from './EditorPanel';
import { PreviewPanel } from './PreviewPanel';
import { ToolBar } from './ToolBar';
import { useEditor } from '../../hooks/useEditor';
import { useAutoSave } from '../../hooks/useAutoSave';

export default function MarkdownEditor() {
  const { document, updateContent, animflowBlocks, isDirty, save } = useEditor();
  const { lastSavedAt } = useAutoSave(document.content, { enabled: true });

  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="markdown-editor">
      <ToolBar
        isDirty={isDirty}
        lastSavedAt={lastSavedAt}
        onSave={save}
        onTogglePreview={() => setShowPreview(!showPreview)}
      />

      <div className="editor-content">
        <EditorPanel
          value={document.content}
          onChange={updateContent}
          animflowBlocks={animflowBlocks}
        />

        {showPreview && (
          <PreviewPanel
            markdown={document.content}
            animflowBlocks={animflowBlocks}
          />
        )}
      </div>
    </div>
  );
}
```

### 3.2 EditorPanel (CodeMirror)

```typescript
// blog/src/components/editor/EditorPanel.tsx
import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';

interface EditorPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export function EditorPanel({ value, onChange }: EditorPanelProps) {
  return (
    <div className="editor-panel">
      <CodeMirror
        value={value}
        height="100%"
        extensions={[markdown()]}
        onChange={onChange}
        theme="light"
      />
    </div>
  );
}
```

### 3.3 PreviewPanel (react-markdown)

```typescript
// blog/src/components/editor/PreviewPanel.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { AnimFlowPreview } from './AnimFlowPreview';
import type { AnimFlowBlock } from '../../types/editor';

interface PreviewPanelProps {
  markdown: string;
  animflowBlocks: AnimFlowBlock[];
}

export function PreviewPanel({ markdown, animflowBlocks }: PreviewPanelProps) {
  return (
    <div className="preview-panel">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-animflow/.exec(className || '');
            if (match) {
              const yaml = String(children).replace(/\n$/, '');
              return <AnimFlowPreview yaml={yaml} />;
            }
            return <code className={className} {...props}>{children}</code>;
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
```

---

## 4. Create Hooks

### 4.1 useEditor Hook

```typescript
// blog/src/hooks/useEditor.ts
import { useState, useCallback, useEffect } from 'react';
import { loadDocument, saveDocument } from '../services/storage';
import { extractAnimFlowBlocks } from '../services/animflow-validator';
import type { Document, AnimFlowBlock } from '../types/editor';

export function useEditor() {
  const [document, setDocument] = useState<Document>(() =>
    loadDocument() ?? createNewDocument()
  );
  const [animflowBlocks, setAnimflowBlocks] = useState<AnimFlowBlock[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const updateContent = useCallback((content: string) => {
    setDocument(prev => ({
      ...prev,
      content,
      updatedAt: Date.now(),
    }));
    setIsDirty(true);

    // Extract AnimFlow blocks
    const blocks = extractAnimFlowBlocks(content);
    setAnimflowBlocks(blocks);
  }, []);

  const save = useCallback(() => {
    const updated = { ...document, savedAt: Date.now(), isDirty: false };
    saveDocument(updated);
    setDocument(updated);
    setIsDirty(false);
  }, [document]);

  return {
    document,
    updateContent,
    animflowBlocks,
    isDirty,
    save,
  };
}

function createNewDocument(): Document {
  return {
    id: crypto.randomUUID(),
    title: 'Untitled',
    content: '',
    description: '',
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    savedAt: Date.now(),
    isDirty: false,
  };
}
```

### 4.2 useAutoSave Hook

```typescript
// blog/src/hooks/useAutoSave.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { saveDocument, loadDocument } from '../services/storage';

interface UseAutoSaveOptions {
  interval?: number;
  enabled?: boolean;
}

export function useAutoSave(content: string, options: UseAutoSaveOptions = {}) {
  const { interval = 1000, enabled = true } = options;
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const doc = loadDocument();
      if (doc && doc.content !== content) {
        setIsSaving(true);
        saveDocument({ ...doc, content, savedAt: Date.now() });
        setLastSavedAt(Date.now());
        setIsSaving(false);
      }
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, interval, enabled]);

  return { lastSavedAt, isSaving };
}
```

---

## 5. Create Services

### 5.1 Storage Service

```typescript
// blog/src/services/storage.ts
import type { Document, EditorSettings } from '../types/editor';

const KEYS = {
  DOCUMENT: 'editor:document',
  SETTINGS: 'editor:settings',
  RECOVERY: 'editor:recovery',
};

export function saveDocument(document: Document): void {
  localStorage.setItem(KEYS.DOCUMENT, JSON.stringify(document));
}

export function loadDocument(): Document | null {
  const data = localStorage.getItem(KEYS.DOCUMENT);
  return data ? JSON.parse(data) : null;
}

export function saveSettings(settings: EditorSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadSettings(): EditorSettings {
  const data = localStorage.getItem(KEYS.SETTINGS);
  return data ? JSON.parse(data) : getDefaultSettings();
}

function getDefaultSettings(): EditorSettings {
  return {
    geminiApiKey: null,
    autoSaveInterval: 1000,
    theme: 'system',
    fontSize: 14,
    showPreview: true,
    autoRenderAnimFlow: true,
    updatedAt: Date.now(),
  };
}
```

### 5.2 Gemini Service

```typescript
// blog/src/services/gemini.ts
import { GoogleGenAI } from '@google/genai';
import type { AIResponse } from '../types/editor';

let ai: GoogleGenAI | null = null;

export function initializeGemini(apiKey: string): void {
  ai = new GoogleGenAI({ apiKey });
}

export async function generateAnimFlowYaml(
  description: string,
  dslSpec: string
): Promise<AIResponse<string>> {
  if (!ai) {
    return { success: false, error: 'API Key not configured', duration: 0 };
  }

  const startTime = Date.now();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
You are an expert in AnimFlow DSL. Generate valid AnimFlow YAML based on the user's description.

## AnimFlow DSL Specification
${dslSpec}

## User Description
${description}

## Requirements
1. Output ONLY valid YAML code, no explanations
2. Follow the DSL specification exactly
3. Include at least one scenario
4. Use meaningful node and edge IDs

## Output
`,
    });

    return {
      success: true,
      data: response.text || '',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    };
  }
}
```

### 5.3 AnimFlow Validator Service

```typescript
// blog/src/services/animflow-validator.ts
import * as yaml from 'js-yaml';
import type { AnimFlowBlock, ValidationResult } from '../types/editor';

const ANIMFLOW_BLOCK_REGEX = /```animflow\n([\s\S]*?)```/g;

export function extractAnimFlowBlocks(markdown: string): AnimFlowBlock[] {
  const blocks: AnimFlowBlock[] = [];
  const lines = markdown.split('\n');

  let match;
  let blockId = 0;
  ANIMFLOW_BLOCK_REGEX.lastIndex = 0;

  while ((match = ANIMFLOW_BLOCK_REGEX.exec(markdown)) !== null) {
    const yamlContent = match[1];
    const startIndex = match.index;
    const startLine = markdown.substring(0, startIndex).split('\n').length;
    const endLine = startLine + yamlContent.split('\n').length;

    blocks.push({
      id: `animflow-${blockId++}`,
      startLine,
      endLine,
      yaml: yamlContent,
      validation: validateAnimFlowYaml(yamlContent),
    });
  }

  return blocks;
}

export function validateAnimFlowYaml(yamlContent: string): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  try {
    const parsed = yaml.load(yamlContent);

    // Basic structure validation
    if (!parsed || typeof parsed !== 'object') {
      errors.push({
        line: 1,
        column: 1,
        message: 'Invalid YAML: must be an object',
        severity: 'error',
      });
    }

    // Check for required fields
    const obj = parsed as Record<string, unknown>;
    if (!obj.diagram) {
      errors.push({
        line: 1,
        column: 1,
        message: "Missing required field: 'diagram'",
        severity: 'error',
        suggestion: "Add 'diagram:' at the top level",
      });
    }

  } catch (e) {
    const yamlError = e as yaml.YAMLException;
    errors.push({
      line: yamlError.mark?.line ?? 1,
      column: yamlError.mark?.column ?? 1,
      message: yamlError.message,
      severity: 'error',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

## 6. Create Type Definitions

```typescript
// blog/src/types/editor.ts

export interface Document {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  savedAt: number;
  isDirty: boolean;
}

export interface EditorSettings {
  geminiApiKey: string | null;
  autoSaveInterval: number;
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  showPreview: boolean;
  autoRenderAnimFlow: boolean;
  updatedAt: number;
}

export interface AnimFlowBlock {
  id: string;
  startLine: number;
  endLine: number;
  yaml: string;
  validation: ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
}
```

---

## 7. Verify Installation

### 7.1 Start Development Server

```bash
npm run dev -w blog
```

### 7.2 Access Editor

Open browser and navigate to:
```
http://localhost:4321/editor
```

### 7.3 Expected Behavior

1. **Editor loads** with split view (editor + preview)
2. **Typing markdown** updates preview in real-time
3. **AnimFlow blocks** render as diagrams in preview
4. **Auto-save** triggers after 1 second of inactivity

---

## 8. Troubleshooting

### 8.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot find module '@uiw/react-codemirror'" | Dependencies not installed | Run `npm install` in blog directory |
| Preview not updating | Debounce too long | Check interval setting |
| AnimFlow not rendering | YAML syntax error | Check validation errors in console |
| API Key error | Key not configured | Open settings and enter valid key |

### 8.2 Debug Commands

```bash
# Check installed packages
npm ls @uiw/react-codemirror @google/genai

# Clear build cache
rm -rf blog/.astro blog/dist

# Restart dev server
npm run dev -w blog
```

---

## 9. Next Steps

After completing this quickstart:

1. Run `/speckit.tasks` to generate detailed implementation tasks
2. Implement ToolBar component with save/export buttons
3. Add SettingsModal for API key configuration
4. Implement AI generation components
