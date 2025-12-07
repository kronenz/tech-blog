/**
 * AnimFlowGenerator - AI 기반 AnimFlow YAML 생성기
 * 자연어 설명으로 AnimFlow 다이어그램 생성
 */

import React, { useState, useCallback } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { validateAnimFlowYaml, formatValidationErrors } from '../../services/animflow-validator';
import { AnimFlowPreview } from '../editor/AnimFlowPreview';

export interface AnimFlowGeneratorProps {
  /** API Key */
  apiKey: string | null;
  /** 생성된 YAML 삽입 핸들러 */
  onInsert: (yaml: string) => void;
  /** 닫기 핸들러 */
  onClose: () => void;
}

export function AnimFlowGenerator({ apiKey, onInsert, onClose }: AnimFlowGeneratorProps) {
  const [description, setDescription] = useState('');
  const [generatedYaml, setGeneratedYaml] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(true);

  const { isLoading, error, generateAnimFlow, cancel } = useGemini(apiKey);

  // YAML 생성
  const handleGenerate = useCallback(async () => {
    if (!description.trim()) return;

    setGeneratedYaml(null);
    setValidationErrors([]);

    const response = await generateAnimFlow(description);

    if (response.success && response.content) {
      setGeneratedYaml(response.content);

      // 유효성 검증
      const validation = validateAnimFlowYaml(response.content);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
      }
    }
  }, [description, generateAnimFlow]);

  // YAML 삽입
  const handleInsert = useCallback(() => {
    if (!generatedYaml) return;

    // animflow 코드 블록으로 감싸서 삽입
    const markdownBlock = `\`\`\`animflow\n${generatedYaml}\n\`\`\``;
    onInsert(markdownBlock);
    onClose();
  }, [generatedYaml, onInsert, onClose]);

  // YAML 복사
  const handleCopy = useCallback(() => {
    if (!generatedYaml) return;
    navigator.clipboard.writeText(generatedYaml);
  }, [generatedYaml]);

  // 취소
  const handleCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  // 다시 생성
  const handleRegenerate = useCallback(() => {
    setGeneratedYaml(null);
    setValidationErrors([]);
    handleGenerate();
  }, [handleGenerate]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>AnimFlow 생성</h2>
        <button style={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      <div style={styles.content}>
        {/* 설명 입력 */}
        <div style={styles.inputSection}>
          <label style={styles.label}>다이어그램 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 클라이언트가 서버에 API 요청을 보내고, 서버가 캐시를 확인한 후 DB를 조회하여 응답을 반환하는 흐름"
            style={styles.textarea}
            rows={4}
            disabled={isLoading}
          />
          <p style={styles.hint}>
            다이어그램에 표시할 요소(노드)와 흐름(엣지)을 자연어로 설명해주세요.
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
              disabled={!description.trim() || !apiKey}
            >
              생성하기
            </button>
          )}
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <span>AnimFlow YAML 생성 중...</span>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div style={styles.error}>
            <strong>오류:</strong> {error}
          </div>
        )}

        {/* 생성된 YAML */}
        {generatedYaml && (
          <div style={styles.resultSection}>
            <div style={styles.resultHeader}>
              <h3 style={styles.resultTitle}>생성된 YAML</h3>
              <div style={styles.resultActions}>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  style={styles.previewToggle}
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

            {/* 검증 오류 */}
            {validationErrors.length > 0 && (
              <div style={styles.validationError}>
                <strong>검증 오류:</strong>
                <pre style={styles.errorList}>
                  {formatValidationErrors(validationErrors)}
                </pre>
              </div>
            )}

            {/* YAML 코드 */}
            <pre style={styles.yamlCode}>{generatedYaml}</pre>

            {/* 미리보기 */}
            {showPreview && validationErrors.length === 0 && (
              <div style={styles.previewContainer}>
                <AnimFlowPreview yaml={generatedYaml} height={300} />
              </div>
            )}

            {/* 삽입 버튼 */}
            <div style={styles.insertActions}>
              <button
                onClick={handleInsert}
                style={styles.insertBtn}
                disabled={validationErrors.length > 0}
              >
                편집기에 삽입
              </button>
              {validationErrors.length > 0 && (
                <span style={styles.insertWarning}>
                  검증 오류가 있어 삽입이 제한됩니다
                </span>
              )}
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
    backgroundColor: '#3b82f6',
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
    borderTopColor: '#3b82f6',
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
  previewToggle: {
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
    border: '1px solid #3b82f6',
    borderRadius: '4px',
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  validationError: {
    padding: '0.75rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    marginBottom: '0.75rem',
  },
  errorList: {
    margin: '0.5rem 0 0',
    fontSize: '0.75rem',
    color: '#dc2626',
    whiteSpace: 'pre-wrap',
  },
  yamlCode: {
    padding: '1rem',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    borderRadius: '6px',
    fontSize: '0.75rem',
    overflow: 'auto',
    maxHeight: '200px',
    fontFamily: 'monospace',
    margin: 0,
  },
  previewContainer: {
    marginTop: '1rem',
  },
  insertActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
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
  insertWarning: {
    fontSize: '0.75rem',
    color: '#dc2626',
  },
};

export default AnimFlowGenerator;
