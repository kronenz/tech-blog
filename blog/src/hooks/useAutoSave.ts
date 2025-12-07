/**
 * useAutoSave Hook - 자동 저장 로직
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Document } from '../types/editor';
import { saveDocument, saveRecoveryBackup } from '../services/storage';

export interface UseAutoSaveOptions {
  /** 자동 저장 간격 (ms) */
  interval?: number;
  /** 자동 저장 활성화 여부 */
  enabled?: boolean;
  /** 복구 백업 간격 (ms) */
  recoveryInterval?: number;
}

export interface UseAutoSaveReturn {
  /** 마지막 저장 시간 */
  lastSavedAt: number | null;
  /** 저장 중 여부 */
  isSaving: boolean;
  /** 수동 저장 트리거 */
  saveNow: () => void;
}

export function useAutoSave(
  document: Document,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const {
    interval = 1000,
    enabled = true,
    recoveryInterval = 5000,
  } = options;

  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>(document.content);

  // 저장 함수
  const performSave = useCallback(() => {
    if (!enabled) return;

    setIsSaving(true);
    try {
      saveDocument({
        ...document,
        savedAt: Date.now(),
        isDirty: false,
      });
      setLastSavedAt(Date.now());
      lastContentRef.current = document.content;
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [document, enabled]);

  // 복구 백업 저장
  const performRecoveryBackup = useCallback(() => {
    if (!enabled) return;

    try {
      saveRecoveryBackup(document);
    } catch (error) {
      console.error('Recovery backup failed:', error);
    }
  }, [document, enabled]);

  // Debounced 자동 저장
  useEffect(() => {
    if (!enabled) return;

    // 내용이 변경되지 않았으면 저장하지 않음
    if (document.content === lastContentRef.current && !document.isDirty) {
      return;
    }

    // 이전 타이머 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 새 타이머 설정
    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, interval);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [document.content, document.isDirty, interval, enabled, performSave]);

  // 주기적 복구 백업
  useEffect(() => {
    if (!enabled) return;

    recoveryTimeoutRef.current = setInterval(() => {
      performRecoveryBackup();
    }, recoveryInterval);

    return () => {
      if (recoveryTimeoutRef.current) {
        clearInterval(recoveryTimeoutRef.current);
      }
    };
  }, [enabled, recoveryInterval, performRecoveryBackup]);

  // 수동 저장
  const saveNow = useCallback(() => {
    // 대기 중인 자동 저장 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    performSave();
  }, [performSave]);

  return {
    lastSavedAt,
    isSaving,
    saveNow,
  };
}

export default useAutoSave;
