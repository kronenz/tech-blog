/**
 * useEditor Hook - 편집기 상태 관리
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Document, AnimFlowBlock, ValidationResult } from '../types/editor';
import { createNewDocument } from '../types/editor';
import { loadDocument, saveDocument, loadOrCreateDocument } from '../services/storage';

// AnimFlow 블록 추출 정규식
const ANIMFLOW_BLOCK_REGEX = /```animflow\n([\s\S]*?)```/g;

export interface UseEditorReturn {
  /** 현재 문서 */
  document: Document;
  /** 문서 업데이트 */
  updateDocument: (updates: Partial<Document>) => void;
  /** 본문 업데이트 */
  updateContent: (content: string) => void;
  /** 제목 업데이트 */
  updateTitle: (title: string) => void;
  /** 설명 업데이트 */
  updateDescription: (description: string) => void;
  /** 태그 추가 */
  addTag: (tag: string) => void;
  /** 태그 제거 */
  removeTag: (tag: string) => void;
  /** 태그 설정 */
  setTags: (tags: string[]) => void;
  /** 저장되지 않은 변경사항 존재 여부 */
  isDirty: boolean;
  /** 수동 저장 */
  save: () => void;
  /** 새 문서 생성 */
  newDocument: () => void;
  /** 문서 복구 */
  restoreDocument: (doc: Document) => void;
  /** AnimFlow 블록 목록 */
  animflowBlocks: AnimFlowBlock[];
  /** 커서 위치에 텍스트 삽입 (현재는 끝에 추가) */
  insertText: (text: string) => void;
  /** 커서 위치에 텍스트 삽입 (insertText alias) */
  insertAtCursor: (text: string) => void;
}

/**
 * AnimFlow 블록 추출
 */
function extractAnimFlowBlocks(content: string): AnimFlowBlock[] {
  const blocks: AnimFlowBlock[] = [];
  let blockId = 0;

  // 정규식 인덱스 초기화
  ANIMFLOW_BLOCK_REGEX.lastIndex = 0;

  let match;
  while ((match = ANIMFLOW_BLOCK_REGEX.exec(content)) !== null) {
    const yamlContent = match[1];
    const startIndex = match.index;

    // 라인 번호 계산
    const beforeMatch = content.substring(0, startIndex);
    const startLine = beforeMatch.split('\n').length;
    const endLine = startLine + yamlContent.split('\n').length;

    blocks.push({
      id: `animflow-${blockId++}`,
      startLine,
      endLine,
      yaml: yamlContent,
      validation: validateYaml(yamlContent),
    });
  }

  return blocks;
}

/**
 * 간단한 YAML 검증 (상세 검증은 animflow-validator 서비스에서)
 */
function validateYaml(yaml: string): ValidationResult {
  // 기본적인 검증만 수행
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  if (!yaml.trim()) {
    errors.push({
      line: 1,
      column: 1,
      message: 'Empty AnimFlow block',
      severity: 'error',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function useEditor(): UseEditorReturn {
  const [document, setDocument] = useState<Document>(() => {
    // SSR 환경에서는 새 문서 생성
    if (typeof window === 'undefined') {
      return createNewDocument();
    }
    return loadOrCreateDocument();
  });

  const [isDirty, setIsDirty] = useState(false);

  // 클라이언트 사이드에서 문서 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loaded = loadOrCreateDocument();
      setDocument(loaded);
      setIsDirty(false);
    }
  }, []);

  // AnimFlow 블록 추출 (메모이제이션)
  const animflowBlocks = useMemo(() => {
    return extractAnimFlowBlocks(document.content);
  }, [document.content]);

  const updateDocument = useCallback((updates: Partial<Document>) => {
    setDocument((prev) => ({
      ...prev,
      ...updates,
      updatedAt: Date.now(),
    }));
    setIsDirty(true);
  }, []);

  const updateContent = useCallback(
    (content: string) => {
      updateDocument({ content });
    },
    [updateDocument]
  );

  const updateTitle = useCallback(
    (title: string) => {
      updateDocument({ title });
    },
    [updateDocument]
  );

  const updateDescription = useCallback(
    (description: string) => {
      updateDocument({ description });
    },
    [updateDocument]
  );

  const addTag = useCallback(
    (tag: string) => {
      const normalizedTag = tag.toLowerCase().trim();
      if (!normalizedTag) return;

      setDocument((prev) => {
        if (prev.tags.includes(normalizedTag)) return prev;
        return {
          ...prev,
          tags: [...prev.tags, normalizedTag],
          updatedAt: Date.now(),
        };
      });
      setIsDirty(true);
    },
    []
  );

  const removeTag = useCallback((tag: string) => {
    setDocument((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
      updatedAt: Date.now(),
    }));
    setIsDirty(true);
  }, []);

  const setTags = useCallback((tags: string[]) => {
    setDocument((prev) => ({
      ...prev,
      tags: tags.map((t) => t.toLowerCase().trim()).filter(Boolean),
      updatedAt: Date.now(),
    }));
    setIsDirty(true);
  }, []);

  const save = useCallback(() => {
    const updated = {
      ...document,
      savedAt: Date.now(),
      isDirty: false,
    };
    saveDocument(updated);
    setDocument(updated);
    setIsDirty(false);
  }, [document]);

  const newDocument = useCallback(() => {
    const newDoc = createNewDocument();
    saveDocument(newDoc);
    setDocument(newDoc);
    setIsDirty(false);
  }, []);

  const restoreDocument = useCallback((doc: Document) => {
    setDocument(doc);
    setIsDirty(true);
  }, []);

  const insertText = useCallback(
    (text: string) => {
      // 현재는 끝에 추가 (커서 위치 기능은 나중에 구현)
      const newContent = document.content + (document.content ? '\n\n' : '') + text;
      updateContent(newContent);
    },
    [document.content, updateContent]
  );

  return {
    document,
    updateDocument,
    updateContent,
    updateTitle,
    updateDescription,
    addTag,
    removeTag,
    setTags,
    isDirty,
    save,
    newDocument,
    restoreDocument,
    animflowBlocks,
    insertText,
    insertAtCursor: insertText, // alias for insertText
  };
}

export default useEditor;
