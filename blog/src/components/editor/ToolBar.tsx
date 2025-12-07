/**
 * ToolBar - 편집기 툴바 컴포넌트
 * 저장, 내보내기, 미리보기 토글, 설정 등의 액션 버튼
 */

import React from 'react';

export interface ToolBarProps {
  /** 저장 핸들러 */
  onSave: () => void;
  /** 저장 가능 여부 (unsaved changes) */
  canSave: boolean;
  /** 저장 상태 텍스트 */
  saveStatusText: string;
  /** MDX 내보내기 핸들러 */
  onExport: () => void;
  /** 미리보기 토글 핸들러 */
  onTogglePreview: () => void;
  /** 미리보기 표시 여부 */
  showPreview: boolean;
  /** 설정 모달 열기 핸들러 */
  onOpenSettings: () => void;
  /** API 키 설정 여부 */
  hasApiKey: boolean;
  /** AI 기능 핸들러들 */
  onOpenTagSuggester?: () => void;
  onOpenDraftGenerator?: () => void;
  onOpenAnimFlowGenerator?: () => void;
}

export function ToolBar({
  onSave,
  canSave,
  saveStatusText,
  onExport,
  onTogglePreview,
  showPreview,
  onOpenSettings,
  hasApiKey,
  onOpenTagSuggester,
  onOpenDraftGenerator,
  onOpenAnimFlowGenerator,
}: ToolBarProps) {
  return (
    <div className="editor-toolbar" style={styles.toolbar}>
      {/* 왼쪽: 저장 및 미리보기 */}
      <div className="toolbar-left" style={styles.section}>
        <button
          className="toolbar-btn"
          style={{
            ...styles.btn,
            ...(canSave ? {} : styles.btnDisabled),
          }}
          onClick={onSave}
          disabled={!canSave}
          title="Save (Ctrl+S)"
        >
          Save
        </button>
        <button
          className="toolbar-btn"
          style={styles.btn}
          onClick={onExport}
          title="Export as MDX (Ctrl+Shift+E)"
        >
          Export
        </button>
        <span style={styles.divider} />
        <button
          className="toolbar-btn"
          style={styles.btn}
          onClick={onTogglePreview}
          title="Toggle Preview (Ctrl+Shift+P)"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* 중앙: 저장 상태 */}
      <div className="toolbar-center" style={styles.center}>
        <span style={styles.saveStatus}>{saveStatusText}</span>
      </div>

      {/* 오른쪽: AI 기능 및 설정 */}
      <div className="toolbar-right" style={styles.section}>
        {/* AI 태그 추천 */}
        {onOpenTagSuggester && (
          <button
            className="toolbar-btn toolbar-btn-ai"
            style={styles.btnAi}
            onClick={onOpenTagSuggester}
            title="Suggest Tags (AI)"
          >
            Tags
          </button>
        )}
        {/* AI 초안 생성 */}
        {onOpenDraftGenerator && (
          <button
            className="toolbar-btn toolbar-btn-ai"
            style={styles.btnAi}
            onClick={onOpenDraftGenerator}
            title="Generate Draft (AI)"
          >
            Draft
          </button>
        )}
        {/* AI AnimFlow 생성 */}
        {onOpenAnimFlowGenerator && (
          <button
            className="toolbar-btn toolbar-btn-ai"
            style={styles.btnAi}
            onClick={onOpenAnimFlowGenerator}
            title="Generate AnimFlow (AI)"
          >
            AnimFlow
          </button>
        )}
        <span style={styles.divider} />
        {/* 설정 */}
        <button
          className="toolbar-btn"
          style={styles.btn}
          onClick={onOpenSettings}
          title="Settings (Ctrl+,)"
        >
          Settings
          {!hasApiKey && <span style={styles.apiKeyWarning}>!</span>}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 1rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    flexShrink: 0,
  },
  section: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  center: {
    flex: 1,
    textAlign: 'center',
  },
  btn: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  btnAi: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #86efac',
    borderRadius: '6px',
    backgroundColor: '#f0fdf4',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#166534',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  divider: {
    width: '1px',
    height: '1.5rem',
    backgroundColor: '#e2e8f0',
    margin: '0 0.25rem',
  },
  saveStatus: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  apiKeyWarning: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1rem',
    height: '1rem',
    marginLeft: '0.25rem',
    backgroundColor: '#fef3c7',
    color: '#d97706',
    borderRadius: '50%',
    fontSize: '0.625rem',
    fontWeight: 700,
  },
};

export default ToolBar;
