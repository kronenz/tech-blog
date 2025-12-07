/**
 * Storage Service - LocalStorage 관리
 */

import type { Document, EditorSettings, StorageInfo } from '../types/editor';
import { DEFAULT_SETTINGS, createNewDocument } from '../types/editor';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  DOCUMENT: 'editor:document',
  SETTINGS: 'editor:settings',
  RECOVERY: 'editor:recovery',
} as const;

// ============================================================================
// Settings API
// ============================================================================

/**
 * 설정 저장
 */
export function saveSettings(settings: EditorSettings): void {
  try {
    const data = JSON.stringify({
      ...settings,
      updatedAt: Date.now(),
    });
    localStorage.setItem(STORAGE_KEYS.SETTINGS, data);
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

/**
 * 설정 로드 (없으면 기본값 반환)
 */
export function loadSettings(): EditorSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      return { ...DEFAULT_SETTINGS };
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * 설정 초기화
 */
export function resetSettings(): EditorSettings {
  const settings = { ...DEFAULT_SETTINGS, updatedAt: Date.now() };
  saveSettings(settings);
  return settings;
}

// ============================================================================
// Document API
// ============================================================================

/**
 * 문서 저장
 */
export function saveDocument(document: Document): void {
  try {
    const data = JSON.stringify({
      ...document,
      savedAt: Date.now(),
      isDirty: false,
    });
    localStorage.setItem(STORAGE_KEYS.DOCUMENT, data);
  } catch (error) {
    console.error('Failed to save document:', error);
    throw error;
  }
}

/**
 * 문서 로드 (없으면 null 반환)
 */
export function loadDocument(): Document | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENT);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load document:', error);
    return null;
  }
}

/**
 * 문서 삭제
 */
export function clearDocument(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DOCUMENT);
  } catch (error) {
    console.error('Failed to clear document:', error);
  }
}

// ============================================================================
// Recovery API
// ============================================================================

/**
 * 복구용 백업 저장
 */
export function saveRecoveryBackup(document: Document): void {
  try {
    const data = JSON.stringify({
      ...document,
      savedAt: Date.now(),
    });
    localStorage.setItem(STORAGE_KEYS.RECOVERY, data);
  } catch (error) {
    console.error('Failed to save recovery backup:', error);
  }
}

/**
 * 복구용 백업 로드
 */
export function loadRecoveryBackup(): Document | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECOVERY);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load recovery backup:', error);
    return null;
  }
}

/**
 * 복구용 백업 삭제
 */
export function clearRecoveryBackup(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.RECOVERY);
  } catch (error) {
    console.error('Failed to clear recovery backup:', error);
  }
}

// ============================================================================
// Storage Info API
// ============================================================================

/**
 * LocalStorage 용량 정보 조회
 */
export function getStorageInfo(): StorageInfo {
  const quota = 5 * 1024 * 1024; // 5MB (일반적인 LocalStorage 한도)
  const warningThreshold = 4 * 1024 * 1024; // 4MB

  let used = 0;
  try {
    for (const key of Object.keys(localStorage)) {
      const value = localStorage.getItem(key);
      if (value) {
        used += key.length + value.length;
      }
    }
    // UTF-16 인코딩 고려 (각 문자 2바이트)
    used *= 2;
  } catch (error) {
    console.error('Failed to calculate storage usage:', error);
  }

  return {
    used,
    quota,
    available: Math.max(0, quota - used),
    warningThreshold,
  };
}

/**
 * 용량 경고 필요 여부 확인
 */
export function isStorageWarning(): boolean {
  const info = getStorageInfo();
  return info.used >= info.warningThreshold;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * 문서 또는 새 문서 로드
 */
export function loadOrCreateDocument(): Document {
  const saved = loadDocument();
  if (saved) {
    return saved;
  }

  const newDoc = createNewDocument();
  saveDocument(newDoc);
  return newDoc;
}
