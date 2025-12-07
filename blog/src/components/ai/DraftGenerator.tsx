/**
 * DraftGenerator - AI 기반 블로그 초안 생성기
 * 주제를 입력하면 AI가 마크다운 형식의 초안을 생성
 */

import React, { useState, useCallback } from 'react';
import { useGemini } from '../../hooks/useGemini';

export interface DraftGeneratorProps {
  /** API Key */
  apiKey: string | null;
  /** 생성된 초안 삽입 핸들러 */
  onInsert: (content: string) => void;
  /** 닫기 핸들러 */
  onClose: () => void;
}

export function DraftGenerator({ apiKey, onInsert, onClose }: DraftGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const { isLoading, error, generateBlogDraft, cancel } = useGemini(apiKey);

  // 초안 생성
  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;

    setGeneratedDraft(null);

    // 추가 컨텍스트가 있으면 주제에 포함
    const fullTopic = additionalContext.trim()
      ? `${topic}\n\n추가 요청 사항:\n${additionalContext}`
      : topic;

    const response = await generateBlogDraft(fullTopic);

    if (response.success && response.content) {
      setGeneratedDraft(response.content);
    }
  }, [topic, additionalContext, generateBlogDraft]);

  // 초안 삽입
  const handleInsert = useCallback(() => {
    if (!generatedDraft) return;
    onInsert(generatedDraft);
    onClose();
  }, [generatedDraft, onInsert, onClose]);

  // 초안 복사
  const handleCopy = useCallback(() => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
  }, [generatedDraft]);

  // 취소
  const handleCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  // 다시 생성
  const handleRegenerate = useCallback(() => {
    setGeneratedDraft(null);
    handleGenerate();
  }, [handleGenerate]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>블로그 초안 생성</h2>
        <button style={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      <div style={styles.content}>
        {/* 주제 입력 */}
        <div style={styles.inputSection}>
          <label style={styles.label}>블로그 주제</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: Kubernetes Pod 네트워킹 원리"
            style={styles.input}
            disabled={isLoading}
          />
        </div>

        {/* 추가 컨텍스트 입력 */}
        <div style={styles.inputSection}>
          <label style={styles.label}>추가 요청 사항 (선택)</label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="예: 초보자도 이해할 수 있게 설명해주세요. 코드 예제를 포함해주세요."
            style={styles.textarea}
            rows={3}
            disabled={isLoading}
          />
          <p style={styles.hint}>
            글의 톤, 길이, 특별히 포함할 내용 등을 요청할 수 있습니다.
          </p>
        </div>

        {/* API Key 경고 */}
        {!apiKey && (
          <div style={styles.warning}>
            ⚠️ AI 기능을 사용하려면 설정에서 Gemini API Key를 먼저 설정해주세요.
          </div>
        )}

        {/* 생성 버튼 */}
        <div style={styles.actions}>
          {isLoading ? (
            <button onClick={handleCancel} style={styles.cancelBtn}>
              취소
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              style={styles.generateBtn}
              disabled={!topic.trim() || !apiKey}
            >
              초안 생성하기
            </button>
          )}
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <span>블로그 초안 생성 중... (약 10초 소요)</span>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div style={styles.error}>
            <strong>오류:</strong> {error}
          </div>
        )}

        {/* 생성된 초안 */}
        {generatedDraft && (
          <div style={styles.resultSection}>
            <div style={styles.resultHeader}>
              <h3 style={styles.resultTitle}>생성된 초안</h3>
              <div style={styles.resultActions}>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  style={styles.toggleBtn}
                >
                  {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
                </button>
                <button onClick={handleCopy} style={styles.copyBtn}>
                  복사
                </button>
                <button onClick={handleRegenerate} style={styles.regenerateBtn}>
                  다시 생성
                </button>
              </div>
            </div>

            {/* 초안 미리보기 */}
            {showPreview && (
              <div style={styles.previewContainer}>
                <pre style={styles.draftPreview}>{generatedDraft}</pre>
              </div>
            )}

            {/* 삽입 버튼 */}
            <div style={styles.insertActions}>
              <button onClick={handleInsert} style={styles.insertBtn}>
                편집기에 삽입
              </button>
              <span style={styles.insertHint}>
                초안을 편집기에 삽입한 후 수정할 수 있습니다
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '800px',
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
  inputSection: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
  hint: {
    margin: '0.5rem 0 0',
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  warning: {
    padding: '0.75rem',
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#92400e',
    marginBottom: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  generateBtn: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #dc2626',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#dc2626',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #e5e7eb',
    borderTopColor: '#8b5cf6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#dc2626',
    marginBottom: '1rem',
  },
  resultSection: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1rem',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  resultTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#374151',
  },
  resultActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  toggleBtn: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: '#fff',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  copyBtn: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: '#fff',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  regenerateBtn: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #8b5cf6',
    borderRadius: '4px',
    backgroundColor: '#f5f3ff',
    color: '#8b5cf6',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  previewContainer: {
    maxHeight: '400px',
    overflow: 'auto',
    marginBottom: '1rem',
  },
  draftPreview: {
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    margin: 0,
    color: '#374151',
  },
  insertActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  insertBtn: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#059669',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  insertHint: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
};

export default DraftGenerator;
