/**
 * MarkdownEditor - AI 기반 마크다운 편집기 메인 컴포넌트
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { EditorPanel } from './EditorPanel';
import { PreviewPanel } from './PreviewPanel';
import { SettingsModal } from './SettingsModal';
import { PublishModal } from './PublishModal';
import { AnimFlowGenerator } from '../ai/AnimFlowGenerator';
import { DraftGenerator } from '../ai/DraftGenerator';
import { TagSuggester } from '../ai/TagSuggester';
import { useEditor } from '../../hooks/useEditor';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useSettings } from '../../hooks/useSettings';
import { downloadMdx } from '../../services/mdx-exporter';
import { loadRecoveryBackup, clearRecoveryBackup, saveRecoveryBackup, isStorageWarning, getStorageInfo } from '../../services/storage';

// Debounce 유틸리티
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export interface MarkdownEditorProps {
  /** 초기 문서 내용 (선택) */
  initialContent?: string;
}

export function MarkdownEditor({ initialContent }: MarkdownEditorProps) {
  const { settings, updateSettings, setApiKey, hasApiKey } = useSettings();
  const {
    document,
    updateContent,
    isDirty,
    insertAtCursor,
    addTag,
    removeTag,
    restoreDocument,
  } = useEditor();

  const { lastSavedAt, isSaving, saveNow } = useAutoSave(document, {
    interval: settings.autoSaveInterval,
    enabled: true,
  });

  // 미리보기 표시 상태 (settings에서 가져오거나 로컬 상태)
  const [showPreview, setShowPreview] = useState(settings.showPreview);

  // 모달 상태
  const [showSettings, setShowSettings] = useState(false);
  const [showAnimFlowGenerator, setShowAnimFlowGenerator] = useState(false);
  const [showDraftGenerator, setShowDraftGenerator] = useState(false);
  const [showTagSuggester, setShowTagSuggester] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // 복구 배너 표시
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const [recoveryDocument, setRecoveryDocument] = useState<typeof document | null>(null);

  // 용량 경고 표시
  const [showStorageWarning, setShowStorageWarning] = useState(false);

  // 문서 복구 확인 (페이지 로드 시)
  useEffect(() => {
    const backup = loadRecoveryBackup();
    if (backup && backup.content && backup.content !== document.content) {
      setRecoveryDocument(backup);
      setShowRecoveryBanner(true);
    }
  }, []);

  // 복구 수락
  const handleRestoreRecovery = useCallback(() => {
    if (recoveryDocument && restoreDocument) {
      restoreDocument(recoveryDocument);
      clearRecoveryBackup();
      setShowRecoveryBanner(false);
      setRecoveryDocument(null);
    }
  }, [recoveryDocument, restoreDocument]);

  // 복구 거부
  const handleDismissRecovery = useCallback(() => {
    clearRecoveryBackup();
    setShowRecoveryBanner(false);
    setRecoveryDocument(null);
  }, []);

  // 주기적 복구 백업 (30초마다)
  useEffect(() => {
    if (!isDirty) return;

    const backupInterval = setInterval(() => {
      saveRecoveryBackup(document);
    }, 30000);

    return () => clearInterval(backupInterval);
  }, [document, isDirty]);

  // 저장 후 용량 경고 체크
  useEffect(() => {
    if (lastSavedAt && isStorageWarning()) {
      setShowStorageWarning(true);
    }
  }, [lastSavedAt]);

  // beforeunload 경고 (저장하지 않은 변경사항이 있을 때)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // 복구 백업 저장
        saveRecoveryBackup(document);
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, document]);

  // 50ms debounce로 미리보기 업데이트 (성능 최적화)
  const debouncedContent = useDebounce(document.content, 50);

  // 저장 상태 텍스트
  const saveStatusText = useMemo(() => {
    if (isSaving) return 'Saving...';
    if (!isDirty && lastSavedAt) {
      const date = new Date(lastSavedAt);
      return `Saved at ${date.toLocaleTimeString()}`;
    }
    if (isDirty) return 'Unsaved changes';
    return '';
  }, [isSaving, isDirty, lastSavedAt]);

  // 미리보기 토글
  const togglePreview = useCallback(() => {
    setShowPreview((prev) => !prev);
  }, []);

  // 수동 저장
  const handleSave = useCallback(() => {
    saveNow();
  }, [saveNow]);

  // MDX 내보내기
  const handleExport = useCallback(() => {
    downloadMdx(document);
  }, [document]);

  // 설정 모달 토글
  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  // AnimFlow 생성기 토글
  const toggleAnimFlowGenerator = useCallback(() => {
    setShowAnimFlowGenerator((prev) => !prev);
  }, []);

  // 초안 생성기 토글
  const toggleDraftGenerator = useCallback(() => {
    setShowDraftGenerator((prev) => !prev);
  }, []);

  // 태그 추천기 토글
  const toggleTagSuggester = useCallback(() => {
    setShowTagSuggester((prev) => !prev);
  }, []);

  // 발행 모달 토글
  const togglePublishModal = useCallback(() => {
    setShowPublishModal((prev) => !prev);
  }, []);

  // 발행 완료 핸들러
  const handlePublished = useCallback((slug: string) => {
    console.log(`Post published: /p/${slug}`);
    // 발행 후 추가 작업 (예: 로컬 스토리지 클리어 등)
  }, []);

  // AnimFlow YAML 삽입
  const handleInsertAnimFlow = useCallback(
    (yaml: string) => {
      insertAtCursor(yaml);
    },
    [insertAtCursor]
  );

  // 키보드 단축키
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: 저장
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl/Cmd + Shift + P: 미리보기 토글
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        togglePreview();
      }
      // Ctrl/Cmd + Shift + E: 내보내기
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        handleExport();
      }
      // Ctrl/Cmd + ,: 설정
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        toggleSettings();
      }
      // Escape: 모달 닫기
      if (e.key === 'Escape') {
        if (showPublishModal) {
          setShowPublishModal(false);
        } else if (showAnimFlowGenerator) {
          setShowAnimFlowGenerator(false);
        } else if (showDraftGenerator) {
          setShowDraftGenerator(false);
        } else if (showTagSuggester) {
          setShowTagSuggester(false);
        } else if (showSettings) {
          setShowSettings(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleExport, togglePreview, toggleSettings, showAnimFlowGenerator, showDraftGenerator, showTagSuggester, showSettings, showPublishModal]);

  return (
    <div className="markdown-editor">
      {/* 복구 배너 */}
      {showRecoveryBanner && recoveryDocument && (
        <div className="recovery-banner" style={recoveryBannerStyle}>
          <span>저장되지 않은 이전 작업을 복구하시겠습니까?</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleRestoreRecovery} style={recoveryBtnStyle}>
              복구
            </button>
            <button onClick={handleDismissRecovery} style={recoveryDismissStyle}>
              무시
            </button>
          </div>
        </div>
      )}

      {/* 용량 경고 배너 */}
      {showStorageWarning && (
        <div className="storage-warning-banner" style={storageWarningStyle}>
          <span>
            저장 공간이 부족합니다. MDX로 내보내기 후 새 문서를 시작하세요.
            (사용량: {Math.round(getStorageInfo().used / 1024)}KB / {Math.round(getStorageInfo().quota / 1024)}KB)
          </span>
          <button onClick={() => setShowStorageWarning(false)} style={recoveryDismissStyle}>
            확인
          </button>
        </div>
      )}

      {/* 심플 툴바 */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button
            className="toolbar-btn"
            onClick={handleSave}
            disabled={!isDirty}
            title="Save (Ctrl+S)"
          >
            Save
          </button>
          <button
            className="toolbar-btn"
            onClick={handleExport}
            title="Export as MDX (Ctrl+Shift+E)"
          >
            Export
          </button>
          <button
            className="toolbar-btn primary"
            onClick={togglePublishModal}
            title="Publish to Blog"
          >
            Publish
          </button>
          <span className="toolbar-divider" />
          <button
            className="toolbar-btn"
            onClick={togglePreview}
            title="Toggle Preview (Ctrl+Shift+P)"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        <div className="toolbar-center">
          <span className="save-status">{saveStatusText}</span>
        </div>

        <div className="toolbar-right">
          {/* AI 태그 추천 */}
          <button
            className="toolbar-btn toolbar-btn-ai"
            onClick={toggleTagSuggester}
            title="Suggest Tags (AI)"
          >
            Tags
          </button>
          {/* AI 초안 생성 */}
          <button
            className="toolbar-btn toolbar-btn-ai"
            onClick={toggleDraftGenerator}
            title="Generate Draft (AI)"
          >
            Draft
          </button>
          {/* AI AnimFlow 생성 */}
          <button
            className="toolbar-btn toolbar-btn-ai"
            onClick={toggleAnimFlowGenerator}
            title="Generate AnimFlow (AI)"
          >
            AnimFlow
          </button>
          <span className="toolbar-divider" />
          {/* 설정 */}
          <button
            className="toolbar-btn"
            onClick={toggleSettings}
            title="Settings (Ctrl+,)"
          >
            Settings
            {!hasApiKey && <span className="api-key-warning">!</span>}
          </button>
        </div>
      </div>

      {/* 편집 영역 */}
      <div className="editor-content">
        <EditorPanel
          value={document.content}
          onChange={updateContent}
          fontSize={settings.fontSize}
        />

        {showPreview && (
          <PreviewPanel
            markdown={debouncedContent}
            renderAnimFlow={settings.autoRenderAnimFlow}
          />
        )}
      </div>

      {/* 설정 모달 */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onSetApiKey={setApiKey}
      />

      {/* AnimFlow 생성기 모달 */}
      {showAnimFlowGenerator && (
        <div className="modal-overlay" onClick={() => setShowAnimFlowGenerator(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <AnimFlowGenerator
              apiKey={settings.geminiApiKey}
              onInsert={handleInsertAnimFlow}
              onClose={() => setShowAnimFlowGenerator(false)}
            />
          </div>
        </div>
      )}

      {/* 초안 생성기 모달 */}
      {showDraftGenerator && (
        <div className="modal-overlay" onClick={() => setShowDraftGenerator(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <DraftGenerator
              apiKey={settings.geminiApiKey}
              onInsert={insertAtCursor}
              onClose={() => setShowDraftGenerator(false)}
            />
          </div>
        </div>
      )}

      {/* 태그 추천기 모달 */}
      {showTagSuggester && (
        <div className="modal-overlay" onClick={() => setShowTagSuggester(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <TagSuggester
              apiKey={settings.geminiApiKey}
              content={document.content}
              currentTags={document.tags}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              onClose={() => setShowTagSuggester(false)}
            />
          </div>
        </div>
      )}

      {/* 발행 모달 */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        content={document.content}
        currentTags={document.tags}
        onPublished={handlePublished}
      />
    </div>
  );
}

// Recovery banner styles
const recoveryBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.75rem 1rem',
  backgroundColor: '#fef3c7',
  borderBottom: '1px solid #fcd34d',
  fontSize: '0.875rem',
  color: '#92400e',
};

const recoveryBtnStyle: React.CSSProperties = {
  padding: '0.375rem 0.75rem',
  backgroundColor: '#059669',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontSize: '0.75rem',
  cursor: 'pointer',
};

const recoveryDismissStyle: React.CSSProperties = {
  padding: '0.375rem 0.75rem',
  backgroundColor: 'transparent',
  color: '#92400e',
  border: '1px solid #d97706',
  borderRadius: '4px',
  fontSize: '0.75rem',
  cursor: 'pointer',
};

const storageWarningStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.75rem 1rem',
  backgroundColor: '#fee2e2',
  borderBottom: '1px solid #fca5a5',
  fontSize: '0.875rem',
  color: '#991b1b',
};

export default MarkdownEditor;
