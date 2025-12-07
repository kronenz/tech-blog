/**
 * PreviewPanel - 마크다운 미리보기 패널
 */

import React, { useMemo, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { Components } from 'react-markdown';
import { AnimFlowPreview } from './AnimFlowPreview';
import { validateAnimFlowYaml, formatValidationErrors } from '../../services/animflow-validator';

interface PreviewPanelProps {
  /** 마크다운 내용 */
  markdown: string;
  /** AnimFlow 블록 렌더링 여부 */
  renderAnimFlow?: boolean;
}

// AnimFlow 블록 컴포넌트 (검증 및 렌더링)
function AnimFlowBlock({ yaml }: { yaml: string }) {
  const [showYaml, setShowYaml] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  // YAML 유효성 검증
  const validation = useMemo(() => validateAnimFlowYaml(yaml), [yaml]);

  const handleError = useCallback((error: string) => {
    setRenderError(error);
  }, []);

  const toggleYaml = useCallback(() => {
    setShowYaml((prev) => !prev);
  }, []);

  return (
    <div className="animflow-block" style={styles.animflowBlock}>
      <div className="animflow-block-header" style={styles.animflowHeader}>
        <span style={styles.animflowTitle}>
          AnimFlow Diagram
          {!validation.isValid && (
            <span style={styles.errorBadge}>오류</span>
          )}
        </span>
        <button
          onClick={toggleYaml}
          style={styles.toggleYamlBtn}
        >
          {showYaml ? 'YAML 숨기기' : 'YAML 보기'}
        </button>
      </div>

      {/* 검증 오류 표시 */}
      {!validation.isValid && (
        <div className="animflow-validation-error" style={styles.validationError}>
          <div style={styles.errorTitle}>유효성 검증 실패</div>
          <pre style={styles.errorList}>
            {formatValidationErrors(validation.errors)}
          </pre>
        </div>
      )}

      {/* 렌더링 오류 표시 */}
      {renderError && validation.isValid && (
        <div className="animflow-render-error" style={styles.renderError}>
          <div style={styles.errorTitle}>렌더링 오류</div>
          <pre style={styles.errorMessage}>{renderError}</pre>
        </div>
      )}

      {/* YAML 코드 표시 */}
      {showYaml && (
        <div className="animflow-yaml" style={styles.yamlContainer}>
          <pre style={styles.yamlCode}>{yaml}</pre>
        </div>
      )}

      {/* AnimFlow 미리보기 - 검증 통과 시에만 렌더링 */}
      {validation.isValid && !renderError && (
        <div className="animflow-preview-wrapper" style={styles.previewWrapper}>
          <AnimFlowPreview
            yaml={yaml}
            height={300}
            onError={handleError}
          />
        </div>
      )}

      {/* 검증 실패 시 YAML만 표시 */}
      {!validation.isValid && !showYaml && (
        <div className="animflow-fallback" style={styles.fallback}>
          <pre style={styles.fallbackCode}>{yaml}</pre>
        </div>
      )}
    </div>
  );
}

export function PreviewPanel({
  markdown: content,
  renderAnimFlow = true,
}: PreviewPanelProps) {
  // AnimFlow 블록을 위한 커스텀 코드 블록 렌더러
  const components: Components = useMemo(
    () => ({
      code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';
        const codeContent = String(children).replace(/\n$/, '');

        // AnimFlow 블록인 경우
        if (language === 'animflow' && renderAnimFlow) {
          return <AnimFlowBlock yaml={codeContent} />;
        }

        // 일반 코드 블록
        const isInline = !match;
        if (isInline) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }

        return (
          <pre className={className}>
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        );
      },
    }),
    [renderAnimFlow]
  );

  return (
    <div className="preview-panel">
      <div className="preview-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  animflowBlock: {
    margin: '1rem 0',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  animflowHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #e5e7eb',
  },
  animflowTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  errorBadge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #fecaca',
  },
  toggleYamlBtn: {
    padding: '0.375rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: '#fff',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  validationError: {
    padding: '0.75rem 1rem',
    backgroundColor: '#fef2f2',
    borderBottom: '1px solid #fecaca',
  },
  renderError: {
    padding: '0.75rem 1rem',
    backgroundColor: '#fff7ed',
    borderBottom: '1px solid #fed7aa',
  },
  errorTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#dc2626',
    marginBottom: '0.5rem',
  },
  errorList: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#991b1b',
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
  },
  errorMessage: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#9a3412',
    whiteSpace: 'pre-wrap',
  },
  yamlContainer: {
    borderBottom: '1px solid #e5e7eb',
    maxHeight: '200px',
    overflow: 'auto',
  },
  yamlCode: {
    margin: 0,
    padding: '0.75rem 1rem',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
  },
  previewWrapper: {
    padding: '0.5rem',
  },
  fallback: {
    maxHeight: '150px',
    overflow: 'auto',
  },
  fallbackCode: {
    margin: 0,
    padding: '0.75rem 1rem',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
  },
};

export default PreviewPanel;
