# Data Model: AI-Powered Markdown Editor

**Input**: spec.md, research.md
**Date**: 2025-12-07

## Overview

클라이언트 사이드 전용 편집기의 데이터 모델을 정의한다. 모든 데이터는 브라우저 LocalStorage에 저장되며, 서버 통신 없이 동작한다.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        LocalStorage                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐     1:N     ┌─────────────────────┐       │
│  │   EditorSettings │◄───────────│      Document        │       │
│  └─────────────────┘             └─────────────────────┘       │
│                                           │                      │
│                                           │ 1:N                  │
│                                           ▼                      │
│                                  ┌─────────────────────┐       │
│                                  │   AnimFlowBlock     │       │
│                                  └─────────────────────┘       │
│                                                                  │
│  ┌─────────────────┐                                           │
│  │     Draft       │  (AI 생성 - 임시 저장)                    │
│  └─────────────────┘                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## TypeScript Interfaces

### EditorSettings

사용자 설정을 저장하는 엔티티.

```typescript
/**
 * 편집기 설정 (LocalStorage 키: 'editor:settings')
 */
interface EditorSettings {
  /** Gemini API Key (사용자 입력) */
  geminiApiKey: string | null;

  /** 자동 저장 간격 (밀리초, 기본값: 1000) */
  autoSaveInterval: number;

  /** 테마 설정 */
  theme: 'light' | 'dark' | 'system';

  /** 에디터 폰트 크기 (px) */
  fontSize: number;

  /** 미리보기 패널 표시 여부 */
  showPreview: boolean;

  /** AnimFlow 미리보기 자동 렌더링 */
  autoRenderAnimFlow: boolean;

  /** 마지막 수정 시간 */
  updatedAt: number;
}
```

**기본값**:
```typescript
const DEFAULT_SETTINGS: EditorSettings = {
  geminiApiKey: null,
  autoSaveInterval: 1000,
  theme: 'system',
  fontSize: 14,
  showPreview: true,
  autoRenderAnimFlow: true,
  updatedAt: Date.now(),
};
```

---

### Document

편집 중인 문서를 나타내는 엔티티.

```typescript
/**
 * 문서 (LocalStorage 키: 'editor:document')
 */
interface Document {
  /** 고유 식별자 (UUID) */
  id: string;

  /** 문서 제목 */
  title: string;

  /** 마크다운 본문 (AnimFlow YAML 블록 포함) */
  content: string;

  /** 문서 설명 (frontmatter용) */
  description: string;

  /** 태그 목록 */
  tags: string[];

  /** 문서 생성 시간 */
  createdAt: number;

  /** 마지막 수정 시간 */
  updatedAt: number;

  /** 마지막 저장 시간 (자동 저장) */
  savedAt: number;

  /** 저장되지 않은 변경사항 존재 여부 */
  isDirty: boolean;
}
```

**새 문서 생성**:
```typescript
const createNewDocument = (): Document => ({
  id: crypto.randomUUID(),
  title: 'Untitled',
  content: '',
  description: '',
  tags: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  savedAt: Date.now(),
  isDirty: false,
});
```

---

### AnimFlowBlock

문서 내 AnimFlow YAML 블록을 나타내는 엔티티.

```typescript
/**
 * AnimFlow 블록 (문서 파싱 시 추출)
 */
interface AnimFlowBlock {
  /** 블록 고유 식별자 */
  id: string;

  /** 블록 시작 라인 번호 (1-based) */
  startLine: number;

  /** 블록 종료 라인 번호 (1-based) */
  endLine: number;

  /** YAML 원본 코드 */
  yaml: string;

  /** 검증 상태 */
  validation: ValidationResult;
}

/**
 * YAML 검증 결과
 */
interface ValidationResult {
  /** 검증 성공 여부 */
  isValid: boolean;

  /** 오류 목록 */
  errors: ValidationError[];

  /** 경고 목록 */
  warnings: ValidationError[];
}

/**
 * 검증 오류/경고
 */
interface ValidationError {
  /** 오류 발생 라인 (블록 내 상대 라인) */
  line: number;

  /** 오류 발생 컬럼 */
  column: number;

  /** 오류 메시지 */
  message: string;

  /** 심각도 */
  severity: 'error' | 'warning';

  /** 수정 제안 (선택) */
  suggestion?: string;
}
```

---

### Draft

AI가 생성한 초안을 나타내는 엔티티.

```typescript
/**
 * AI 생성 초안 (메모리 내 임시 저장)
 */
interface Draft {
  /** 초안 고유 식별자 */
  id: string;

  /** 생성된 마크다운 본문 */
  content: string;

  /** 추천된 태그 목록 */
  suggestedTags: string[];

  /** 생성에 사용된 프롬프트 */
  prompt: string;

  /** 생성 시간 */
  createdAt: number;

  /** AI 모델 정보 */
  model: string;
}
```

---

### AIRequest / AIResponse

AI API 호출을 위한 인터페이스.

```typescript
/**
 * AI 요청 타입
 */
type AIRequestType =
  | 'animflow-generation'  // 자연어 → AnimFlow YAML
  | 'draft-writing'        // 주제 → 블로그 초안
  | 'tag-suggestion';      // 본문 → 태그 추천

/**
 * AnimFlow YAML 생성 요청
 */
interface AnimFlowGenerationRequest {
  type: 'animflow-generation';
  /** 자연어 설명 */
  description: string;
  /** AnimFlow DSL 문법 문서 (컨텍스트) */
  dslSpec: string;
}

/**
 * 블로그 초안 생성 요청
 */
interface DraftWritingRequest {
  type: 'draft-writing';
  /** 주제 또는 키워드 */
  topic: string;
  /** 추가 지침 (선택) */
  instructions?: string;
}

/**
 * 태그 추천 요청
 */
interface TagSuggestionRequest {
  type: 'tag-suggestion';
  /** 분석할 본문 */
  content: string;
  /** 최대 추천 태그 수 */
  maxTags: number;
}

/**
 * AI 응답
 */
interface AIResponse<T> {
  /** 성공 여부 */
  success: boolean;
  /** 응답 데이터 */
  data?: T;
  /** 오류 메시지 */
  error?: string;
  /** 처리 시간 (ms) */
  duration: number;
}
```

---

### EditorState

편집기 UI 상태를 나타내는 인터페이스.

```typescript
/**
 * 편집기 UI 상태 (React Context)
 */
interface EditorState {
  /** 현재 문서 */
  document: Document;

  /** 추출된 AnimFlow 블록 목록 */
  animflowBlocks: AnimFlowBlock[];

  /** 현재 커서 위치 */
  cursor: CursorPosition;

  /** 현재 선택 영역 */
  selection: SelectionRange | null;

  /** AI 작업 상태 */
  aiStatus: AIStatus;

  /** 사이드 패널 표시 상태 */
  sidePanel: 'none' | 'settings' | 'ai-animflow' | 'ai-draft' | 'ai-tags';
}

interface CursorPosition {
  line: number;
  column: number;
}

interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
}

interface AIStatus {
  /** AI 작업 진행 중 여부 */
  isLoading: boolean;
  /** 현재 작업 타입 */
  currentTask: AIRequestType | null;
  /** 진행률 (0-100, 선택) */
  progress?: number;
  /** 취소 가능 여부 */
  cancellable: boolean;
}
```

---

## LocalStorage 스키마

### 저장소 키 규약

| 키 | 타입 | 설명 |
|----|------|------|
| `editor:settings` | `EditorSettings` | 사용자 설정 |
| `editor:document` | `Document` | 현재 편집 중인 문서 |
| `editor:recovery` | `Document` | 복구용 백업 (충돌 방지) |

### 저장소 용량 관리

```typescript
/**
 * LocalStorage 용량 정보
 */
interface StorageInfo {
  /** 사용 중인 용량 (bytes) */
  used: number;
  /** 최대 용량 (bytes, 일반적으로 5MB) */
  quota: number;
  /** 남은 용량 (bytes) */
  available: number;
  /** 경고 임계값 (bytes, 4MB) */
  warningThreshold: number;
}
```

---

## MDX Export 스키마

### Frontmatter 구조

```typescript
/**
 * MDX 파일 frontmatter
 */
interface MDXFrontmatter {
  /** 문서 제목 */
  title: string;
  /** 발행일 (ISO 8601) */
  pubDate: string;
  /** 문서 설명 */
  description: string;
  /** 태그 목록 */
  tags: string[];
  /** 초안 여부 */
  draft: boolean;
  /** 대표 이미지 (선택) */
  heroImage?: string;
}
```

### MDX 파일 예시

```mdx
---
title: "Kubernetes Pod 네트워킹 원리"
pubDate: "2025-12-07"
description: "Pod 간 통신이 어떻게 이루어지는지 AnimFlow로 시각화합니다."
tags: ["kubernetes", "networking", "cni"]
draft: false
---

# Pod 네트워킹 개요

...본문...

\`\`\`animflow
diagram:
  title: Pod Networking Flow
  nodes:
    - id: pod1
      label: Pod A
...
\`\`\`
```

---

## 데이터 흐름

```
┌────────────────────────────────────────────────────────────────────────┐
│                           User Interaction                              │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EditorState (React Context)                      │
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │
│  │  document   │    │ animflowBlocks│   │  aiStatus   │               │
│  └─────────────┘    └─────────────┘    └─────────────┘               │
└────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  LocalStorage   │  │   Validator     │  │   Gemini API    │
│  (persistence)  │  │   (js-yaml+ajv) │  │   (@google/genai)│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 주의사항

1. **API Key 보안**: `geminiApiKey`는 사용자 본인의 키이므로 LocalStorage 저장 허용하되, 경고 문구 표시
2. **용량 관리**: 대용량 문서(10,000자+) 저장 시 압축 고려
3. **복구 메커니즘**: 브라우저 충돌 대비 `editor:recovery` 키에 주기적 백업
4. **타입 검증**: Zod 스키마로 LocalStorage 데이터 검증 (손상 방지)
