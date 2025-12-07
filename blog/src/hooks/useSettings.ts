/**
 * useSettings Hook - 편집기 설정 관리
 */

import { useState, useCallback, useEffect } from 'react';
import type { EditorSettings } from '../types/editor';
import { DEFAULT_SETTINGS } from '../types/editor';
import { loadSettings, saveSettings, resetSettings as resetStorageSettings } from '../services/storage';

export interface UseSettingsReturn {
  /** 현재 설정 */
  settings: EditorSettings;
  /** 설정 업데이트 */
  updateSettings: (updates: Partial<EditorSettings>) => void;
  /** 설정 초기화 */
  resetSettings: () => void;
  /** API Key 설정 */
  setApiKey: (key: string | null) => void;
  /** API Key 설정 여부 */
  hasApiKey: boolean;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<EditorSettings>(() => {
    // SSR 환경에서는 기본값 사용
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }
    return loadSettings();
  });

  // 클라이언트 사이드에서 설정 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loaded = loadSettings();
      setSettings(loaded);
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<EditorSettings>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        ...updates,
        updatedAt: Date.now(),
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const resetSettingsHandler = useCallback(() => {
    const reset = resetStorageSettings();
    setSettings(reset);
  }, []);

  const setApiKey = useCallback((key: string | null) => {
    updateSettings({ geminiApiKey: key });
  }, [updateSettings]);

  const hasApiKey = Boolean(settings.geminiApiKey);

  return {
    settings,
    updateSettings,
    resetSettings: resetSettingsHandler,
    setApiKey,
    hasApiKey,
  };
}
