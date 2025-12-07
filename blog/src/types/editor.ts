/**
 * Editor Types - AI-Powered Markdown Editor
 */

// ============================================================================
// Document Types
// ============================================================================

/**
 * 편집 중인 문서
 */
export interface Document {
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

/**
 * 새 문서 생성 헬퍼
 */
export function createNewDocument(): Document {
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

// ============================================================================
// Editor Settings Types
// ============================================================================

/**
 * 편집기 설정
 */
export interface EditorSettings {
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

/**
 * 기본 설정값
 */
export const DEFAULT_SETTINGS: EditorSettings = {
  geminiApiKey: null,
  autoSaveInterval: 1000,
  theme: 'system',
  fontSize: 14,
  showPreview: true,
  autoRenderAnimFlow: true,
  updatedAt: Date.now(),
};

// ============================================================================
// AnimFlow Types
// ============================================================================

/**
 * AnimFlow 블록 (문서 파싱 시 추출)
 */
export interface AnimFlowBlock {
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
export interface ValidationResult {
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
export interface ValidationError {
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

// ============================================================================
// AI Types
// ============================================================================

/**
 * AI 요청 타입
 */
export type AIRequestType =
  | 'animflow-generation'
  | 'draft-writing'
  | 'tag-suggestion';

/**
 * AI 응답
 */
export interface AIResponse<T> {
  /** 성공 여부 */
  success: boolean;
  /** 응답 데이터 */
  data?: T;
  /** 오류 메시지 */
  error?: string;
  /** 처리 시간 (ms) */
  duration: number;
}

/**
 * AI 생성 초안
 */
export interface Draft {
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

// ============================================================================
// Editor State Types
// ============================================================================

/**
 * 커서 위치
 */
export interface CursorPosition {
  line: number;
  column: number;
}

/**
 * 선택 영역
 */
export interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
}

/**
 * AI 작업 상태
 */
export interface AIStatus {
  /** AI 작업 진행 중 여부 */
  isLoading: boolean;
  /** 현재 작업 타입 */
  currentTask: AIRequestType | null;
  /** 진행률 (0-100, 선택) */
  progress?: number;
  /** 취소 가능 여부 */
  cancellable: boolean;
}

/**
 * 사이드 패널 타입
 */
export type SidePanelType =
  | 'none'
  | 'settings'
  | 'ai-animflow'
  | 'ai-draft'
  | 'ai-tags';

// ============================================================================
// MDX Export Types
// ============================================================================

/**
 * MDX 파일 frontmatter
 */
export interface MDXFrontmatter {
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

// ============================================================================
// Storage Types
// ============================================================================

/**
 * LocalStorage 용량 정보
 */
export interface StorageInfo {
  /** 사용 중인 용량 (bytes) */
  used: number;
  /** 최대 용량 (bytes, 일반적으로 5MB) */
  quota: number;
  /** 남은 용량 (bytes) */
  available: number;
  /** 경고 임계값 (bytes, 4MB) */
  warningThreshold: number;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * 에디터 에러 코드
 */
export enum EditorErrorCode {
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

/**
 * 에디터 에러
 */
export interface EditorError {
  code: EditorErrorCode;
  message: string;
  details?: unknown;
}
