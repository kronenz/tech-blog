/**
 * SettingsModal - 편집기 설정 모달
 * API Key 설정, 테마, 폰트 크기 등 설정 관리
 */

import React, { useState, useCallback } from 'react';
import type { EditorSettings } from '../../types/editor';

export interface SettingsModalProps {
  /** 열림 상태 */
  isOpen: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 현재 설정 */
  settings: EditorSettings;
  /** 설정 업데이트 핸들러 */
  onUpdateSettings: (updates: Partial<EditorSettings>) => void;
  /** API Key 설정 핸들러 */
  onSetApiKey: (key: string | null) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onSetApiKey,
}: SettingsModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // API Key 저장
  const handleSaveApiKey = useCallback(() => {
    const trimmedKey = apiKeyInput.trim();

    if (!trimmedKey) {
      onSetApiKey(null);
      setApiKeyError(null);
      return;
    }

    // 기본 형식 검증 (Gemini API Key는 보통 'AI'로 시작)
    if (trimmedKey.length < 30) {
      setApiKeyError('API Key가 너무 짧습니다. 올바른 키인지 확인해주세요.');
      return;
    }

    onSetApiKey(trimmedKey);
    setApiKeyError(null);
  }, [apiKeyInput, onSetApiKey]);

  // API Key 삭제
  const handleClearApiKey = useCallback(() => {
    setApiKeyInput('');
    onSetApiKey(null);
    setApiKeyError(null);
  }, [onSetApiKey]);

  // 테마 변경
  const handleThemeChange = useCallback(
    (theme: 'light' | 'dark' | 'system') => {
      onUpdateSettings({ theme });
    },
    [onUpdateSettings]
  );

  // 폰트 크기 변경
  const handleFontSizeChange = useCallback(
    (fontSize: number) => {
      onUpdateSettings({ fontSize });
    },
    [onUpdateSettings]
  );

  // 자동 저장 간격 변경
  const handleAutoSaveIntervalChange = useCallback(
    (interval: number) => {
      onUpdateSettings({ autoSaveInterval: interval });
    },
    [onUpdateSettings]
  );

  // AnimFlow 자동 렌더링 토글
  const handleAutoRenderToggle = useCallback(() => {
    onUpdateSettings({ autoRenderAnimFlow: !settings.autoRenderAnimFlow });
  }, [settings.autoRenderAnimFlow, onUpdateSettings]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>설정</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.content}>
          {/* Gemini API Key 섹션 */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Gemini API Key</h3>
            <p style={styles.description}>
              AI 기능(YAML 생성, 초안 작성, 태그 추천)을 사용하려면 Gemini API Key가 필요합니다.
              <br />
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                Google AI Studio에서 무료로 발급받기 →
              </a>
            </p>

            <div style={styles.inputGroup}>
              <div style={styles.inputWrapper}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="API Key 입력..."
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={styles.toggleBtn}
                >
                  {showApiKey ? '숨기기' : '보기'}
                </button>
              </div>
              <div style={styles.buttonGroup}>
                <button onClick={handleSaveApiKey} style={styles.saveBtn}>
                  저장
                </button>
                <button onClick={handleClearApiKey} style={styles.clearBtn}>
                  삭제
                </button>
              </div>
            </div>

            {apiKeyError && <p style={styles.error}>{apiKeyError}</p>}

            {settings.geminiApiKey && (
              <p style={styles.success}>
                ✓ API Key가 설정되어 있습니다
              </p>
            )}

            <div style={styles.warning}>
              ⚠️ API Key는 브라우저 로컬 스토리지에 저장됩니다.
              공용 컴퓨터에서는 사용 후 반드시 삭제하세요.
            </div>
          </section>

          {/* 에디터 설정 섹션 */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>에디터 설정</h3>

            <div style={styles.settingRow}>
              <label style={styles.label}>테마</label>
              <select
                value={settings.theme}
                onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
                style={styles.select}
              >
                <option value="system">시스템 설정</option>
                <option value="light">라이트</option>
                <option value="dark">다크</option>
              </select>
            </div>

            <div style={styles.settingRow}>
              <label style={styles.label}>폰트 크기</label>
              <select
                value={settings.fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                style={styles.select}
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
              </select>
            </div>

            <div style={styles.settingRow}>
              <label style={styles.label}>자동 저장 간격</label>
              <select
                value={settings.autoSaveInterval}
                onChange={(e) => handleAutoSaveIntervalChange(Number(e.target.value))}
                style={styles.select}
              >
                <option value={500}>0.5초</option>
                <option value={1000}>1초</option>
                <option value={2000}>2초</option>
                <option value={5000}>5초</option>
                <option value={10000}>10초</option>
              </select>
            </div>

            <div style={styles.settingRow}>
              <label style={styles.label}>AnimFlow 자동 렌더링</label>
              <button
                onClick={handleAutoRenderToggle}
                style={{
                  ...styles.toggleSwitch,
                  backgroundColor: settings.autoRenderAnimFlow ? '#3b82f6' : '#e5e7eb',
                }}
              >
                <span
                  style={{
                    ...styles.toggleKnob,
                    transform: settings.autoRenderAnimFlow
                      ? 'translateX(20px)'
                      : 'translateX(0)',
                  }}
                />
              </button>
            </div>
          </section>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.doneBtn}>
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#111827',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.25rem',
  },
  content: {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
  },
  section: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    margin: '0 0 0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#374151',
  },
  description: {
    margin: '0 0 1rem',
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: 1.5,
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  inputWrapper: {
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
  },
  toggleBtn: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#f9fafb',
    fontSize: '0.75rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  saveBtn: {
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  clearBtn: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#6b7280',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  error: {
    margin: '0.5rem 0 0',
    fontSize: '0.75rem',
    color: '#dc2626',
  },
  success: {
    margin: '0.5rem 0 0',
    fontSize: '0.75rem',
    color: '#059669',
  },
  warning: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#92400e',
    lineHeight: 1.4,
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f3f4f6',
  },
  label: {
    fontSize: '0.875rem',
    color: '#374151',
  },
  select: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer',
    minWidth: '120px',
  },
  toggleSwitch: {
    position: 'relative',
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    padding: 0,
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  doneBtn: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

export default SettingsModal;
