# Internal API Contracts: AI-Powered Markdown Editor

**Input**: spec.md, data-model.md
**Date**: 2025-12-07

## Overview

클라이언트 사이드 편집기의 내부 API 계약을 정의한다. 외부 API는 Gemini API만 사용하며, 나머지는 모두 React 훅과 서비스 함수로 구현된다.

---

## 1. Storage Service

### 1.1 Settings API

```typescript
// blog/src/services/storage.ts

/**
 * 설정 저장
 */
function saveSettings(settings: EditorSettings): void;

/**
 * 설정 로드 (없으면 기본값 반환)
 */
function loadSettings(): EditorSettings;

/**
 * 설정 초기화
 */
function resetSettings(): EditorSettings;
```

### 1.2 Document API

```typescript
/**
 * 문서 저장
 */
function saveDocument(document: Document): void;

/**
 * 문서 로드 (없으면 null 반환)
 */
function loadDocument(): Document | null;

/**
 * 문서 삭제
 */
function clearDocument(): void;

/**
 * 복구용 백업 저장
 */
function saveRecoveryBackup(document: Document): void;

/**
 * 복구용 백업 로드
 */
function loadRecoveryBackup(): Document | null;

/**
 * 복구용 백업 삭제
 */
function clearRecoveryBackup(): void;
```

### 1.3 Storage Info API

```typescript
/**
 * LocalStorage 용량 정보 조회
 */
function getStorageInfo(): StorageInfo;

/**
 * 용량 경고 필요 여부 확인
 */
function isStorageWarning(): boolean;
```

---

## 2. Gemini Service

### 2.1 Configuration

```typescript
// blog/src/services/gemini.ts

/**
 * Gemini 클라이언트 초기화
 * @throws Error if API key is invalid
 */
function initializeGemini(apiKey: string): void;

/**
 * API Key 유효성 검증 (간단한 API 호출로 확인)
 */
async function validateApiKey(apiKey: string): Promise<boolean>;
```

### 2.2 AnimFlow YAML Generation

```typescript
/**
 * 자연어 설명을 AnimFlow YAML로 변환
 *
 * @param description - 사용자가 입력한 자연어 설명
 * @param dslSpec - AnimFlow DSL 문법 문서 (컨텍스트)
 * @returns 생성된 YAML 코드
 *
 * @example
 * const yaml = await generateAnimFlowYaml(
 *   "클라이언트가 서버에 요청하고, 캐시 확인 후 DB 조회",
 *   dslSpecContent
 * );
 */
async function generateAnimFlowYaml(
  description: string,
  dslSpec: string
): Promise<AIResponse<string>>;
```

**프롬프트 템플릿**:
```typescript
const ANIMFLOW_GENERATION_PROMPT = `
You are an expert in AnimFlow DSL. Generate valid AnimFlow YAML based on the user's description.

## AnimFlow DSL Specification
{dslSpec}

## User Description
{description}

## Requirements
1. Output ONLY valid YAML code, no explanations
2. Follow the DSL specification exactly
3. Include at least one scenario
4. Use meaningful node and edge IDs
5. Add appropriate animations for data flow

## Output
`;
```

### 2.3 Draft Writing

```typescript
/**
 * 주제/키워드로 블로그 초안 생성
 *
 * @param topic - 주제 또는 키워드
 * @param instructions - 추가 지침 (선택)
 * @returns 생성된 마크다운 초안
 */
async function generateDraft(
  topic: string,
  instructions?: string
): Promise<AIResponse<Draft>>;
```

**프롬프트 템플릿**:
```typescript
const DRAFT_WRITING_PROMPT = `
You are a technical blog writer. Write a draft blog post in Korean.

## Topic
{topic}

## Additional Instructions
{instructions}

## Requirements
1. Use Markdown format
2. Include appropriate headings (##, ###)
3. Add code examples where relevant
4. Suggest places for AnimFlow diagrams with placeholder: <!-- AnimFlow: [description] -->
5. Write in technical but accessible style
6. Target length: 1000-2000 words

## Output
`;
```

### 2.4 Tag Suggestion

```typescript
/**
 * 본문 분석하여 태그 추천
 *
 * @param content - 분석할 마크다운 본문
 * @param maxTags - 최대 추천 태그 수 (기본값: 5)
 * @returns 추천된 태그 목록
 */
async function suggestTags(
  content: string,
  maxTags?: number
): Promise<AIResponse<string[]>>;
```

**프롬프트 템플릿**:
```typescript
const TAG_SUGGESTION_PROMPT = `
Analyze the following technical blog post and suggest relevant tags.

## Content
{content}

## Requirements
1. Suggest up to {maxTags} tags
2. Use lowercase, hyphenated format (e.g., "kubernetes", "api-design")
3. Focus on technologies, concepts, and topics mentioned
4. Prioritize specificity over generality
5. Output as JSON array: ["tag1", "tag2", ...]

## Output
`;
```

### 2.5 Request Cancellation

```typescript
/**
 * 진행 중인 AI 요청 취소
 */
function cancelCurrentRequest(): void;
```

---

## 3. AnimFlow Validator Service

### 3.1 Validation API

```typescript
// blog/src/services/animflow-validator.ts

/**
 * AnimFlow YAML 검증
 *
 * @param yaml - 검증할 YAML 코드
 * @returns 검증 결과
 */
function validateAnimFlowYaml(yaml: string): ValidationResult;

/**
 * YAML 파싱만 수행 (문법 검사)
 */
function parseYaml(yaml: string): { success: boolean; data?: unknown; error?: string };

/**
 * JSON Schema 검증 수행
 */
function validateSchema(data: unknown): ValidationResult;
```

### 3.2 Block Extraction API

```typescript
/**
 * 마크다운에서 AnimFlow 블록 추출
 *
 * @param markdown - 마크다운 본문
 * @returns 추출된 AnimFlow 블록 목록
 */
function extractAnimFlowBlocks(markdown: string): AnimFlowBlock[];
```

---

## 4. MDX Exporter Service

### 4.1 Export API

```typescript
// blog/src/services/mdx-exporter.ts

/**
 * Document를 MDX 파일 내용으로 변환
 *
 * @param document - 내보낼 문서
 * @returns MDX 파일 문자열
 */
function exportToMdx(document: Document): string;

/**
 * MDX 파일 다운로드 트리거
 *
 * @param document - 내보낼 문서
 * @param filename - 파일명 (확장자 제외)
 */
function downloadMdx(document: Document, filename?: string): void;
```

### 4.2 Frontmatter Generation

```typescript
/**
 * Document에서 frontmatter 생성
 */
function generateFrontmatter(document: Document): MDXFrontmatter;

/**
 * Frontmatter를 YAML 문자열로 변환
 */
function serializeFrontmatter(frontmatter: MDXFrontmatter): string;
```

---

## 5. React Hooks

### 5.1 useEditor Hook

```typescript
// blog/src/hooks/useEditor.ts

interface UseEditorReturn {
  /** 현재 문서 */
  document: Document;

  /** 문서 업데이트 */
  updateDocument: (updates: Partial<Document>) => void;

  /** 본문 업데이트 */
  updateContent: (content: string) => void;

  /** 저장되지 않은 변경사항 존재 여부 */
  isDirty: boolean;

  /** 수동 저장 */
  save: () => void;

  /** 새 문서 생성 */
  newDocument: () => void;

  /** AnimFlow 블록 목록 */
  animflowBlocks: AnimFlowBlock[];
}

function useEditor(): UseEditorReturn;
```

### 5.2 useGemini Hook

```typescript
// blog/src/hooks/useGemini.ts

interface UseGeminiReturn {
  /** API Key 설정 여부 */
  isConfigured: boolean;

  /** 로딩 상태 */
  isLoading: boolean;

  /** 현재 작업 */
  currentTask: AIRequestType | null;

  /** AnimFlow YAML 생성 */
  generateAnimFlow: (description: string) => Promise<AIResponse<string>>;

  /** 초안 생성 */
  generateDraft: (topic: string) => Promise<AIResponse<Draft>>;

  /** 태그 추천 */
  suggestTags: (content: string) => Promise<AIResponse<string[]>>;

  /** 현재 요청 취소 */
  cancel: () => void;
}

function useGemini(): UseGeminiReturn;
```

### 5.3 useAutoSave Hook

```typescript
// blog/src/hooks/useAutoSave.ts

interface UseAutoSaveOptions {
  /** 자동 저장 간격 (ms) */
  interval?: number;

  /** 자동 저장 활성화 여부 */
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  /** 마지막 저장 시간 */
  lastSavedAt: number | null;

  /** 저장 중 여부 */
  isSaving: boolean;

  /** 수동 저장 트리거 */
  saveNow: () => void;
}

function useAutoSave(
  content: string,
  options?: UseAutoSaveOptions
): UseAutoSaveReturn;
```

### 5.4 useSettings Hook

```typescript
// blog/src/hooks/useSettings.ts

interface UseSettingsReturn {
  /** 현재 설정 */
  settings: EditorSettings;

  /** 설정 업데이트 */
  updateSettings: (updates: Partial<EditorSettings>) => void;

  /** 설정 초기화 */
  resetSettings: () => void;

  /** API Key 설정 */
  setApiKey: (key: string | null) => void;
}

function useSettings(): UseSettingsReturn;
```

---

## 6. Component Props Interfaces

### 6.1 MarkdownEditor

```typescript
// blog/src/components/editor/MarkdownEditor.tsx

interface MarkdownEditorProps {
  /** 초기 문서 (선택) */
  initialDocument?: Document;

  /** 저장 콜백 (선택) */
  onSave?: (document: Document) => void;

  /** 내보내기 콜백 (선택) */
  onExport?: (mdxContent: string) => void;
}
```

### 6.2 EditorPanel

```typescript
// blog/src/components/editor/EditorPanel.tsx

interface EditorPanelProps {
  /** 마크다운 내용 */
  value: string;

  /** 변경 콜백 */
  onChange: (value: string) => void;

  /** 폰트 크기 */
  fontSize?: number;

  /** AnimFlow 블록 목록 (하이라이팅용) */
  animflowBlocks?: AnimFlowBlock[];
}
```

### 6.3 PreviewPanel

```typescript
// blog/src/components/editor/PreviewPanel.tsx

interface PreviewPanelProps {
  /** 마크다운 내용 */
  markdown: string;

  /** AnimFlow 블록 목록 */
  animflowBlocks: AnimFlowBlock[];

  /** AnimFlow 자동 렌더링 여부 */
  autoRenderAnimFlow?: boolean;
}
```

### 6.4 AnimFlowPreview

```typescript
// blog/src/components/editor/AnimFlowPreview.tsx

interface AnimFlowPreviewProps {
  /** YAML 코드 */
  yaml: string;

  /** 높이 (px) */
  height?: number;

  /** 검증 결과 */
  validation?: ValidationResult;

  /** 오류 발생 시 콜백 */
  onError?: (error: string) => void;
}
```

### 6.5 SettingsModal

```typescript
// blog/src/components/editor/SettingsModal.tsx

interface SettingsModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;

  /** 닫기 콜백 */
  onClose: () => void;
}
```

### 6.6 AnimFlowGenerator

```typescript
// blog/src/components/ai/AnimFlowGenerator.tsx

interface AnimFlowGeneratorProps {
  /** 생성된 YAML 삽입 콜백 */
  onInsert: (yaml: string) => void;

  /** 닫기 콜백 */
  onClose: () => void;
}
```

### 6.7 DraftGenerator

```typescript
// blog/src/components/ai/DraftGenerator.tsx

interface DraftGeneratorProps {
  /** 생성된 초안 삽입 콜백 */
  onInsert: (content: string) => void;

  /** 닫기 콜백 */
  onClose: () => void;
}
```

### 6.8 TagSuggester

```typescript
// blog/src/components/ai/TagSuggester.tsx

interface TagSuggesterProps {
  /** 현재 본문 */
  content: string;

  /** 현재 태그 목록 */
  currentTags: string[];

  /** 태그 추가 콜백 */
  onAddTag: (tag: string) => void;

  /** 태그 제거 콜백 */
  onRemoveTag: (tag: string) => void;
}
```

---

## 7. Error Handling

### 7.1 Error Types

```typescript
enum EditorErrorCode {
  // Storage errors
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_READ_ERROR = 'STORAGE_READ_ERROR',
  STORAGE_WRITE_ERROR = 'STORAGE_WRITE_ERROR',

  // Validation errors
  YAML_PARSE_ERROR = 'YAML_PARSE_ERROR',
  SCHEMA_VALIDATION_ERROR = 'SCHEMA_VALIDATION_ERROR',

  // AI errors
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_KEY_INVALID = 'API_KEY_INVALID',
  AI_REQUEST_FAILED = 'AI_REQUEST_FAILED',
  AI_REQUEST_CANCELLED = 'AI_REQUEST_CANCELLED',
  AI_RATE_LIMITED = 'AI_RATE_LIMITED',

  // Export errors
  EXPORT_FAILED = 'EXPORT_FAILED',
}

interface EditorError {
  code: EditorErrorCode;
  message: string;
  details?: unknown;
}
```

### 7.2 Error Handling Pattern

```typescript
try {
  const result = await generateAnimFlowYaml(description, dslSpec);
  if (!result.success) {
    handleError({ code: EditorErrorCode.AI_REQUEST_FAILED, message: result.error! });
  }
} catch (error) {
  handleError({
    code: EditorErrorCode.AI_REQUEST_FAILED,
    message: 'Network error',
    details: error,
  });
}
```

---

## 8. Event Handling

### 8.1 Keyboard Shortcuts

| 단축키 | 동작 |
|--------|------|
| `Ctrl/Cmd + S` | 저장 |
| `Ctrl/Cmd + Shift + E` | MDX 내보내기 |
| `Ctrl/Cmd + Shift + P` | 미리보기 토글 |
| `Ctrl/Cmd + ,` | 설정 열기 |
| `Escape` | 모달/패널 닫기 |

### 8.2 Page Unload Warning

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '저장되지 않은 변경사항이 있습니다.';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);
```
