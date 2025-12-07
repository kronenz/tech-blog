/**
 * AnimFlowPreview - 편집기용 AnimFlow 미리보기 컴포넌트
 * 기존 AnimFlowEmbed의 경량 버전
 */

import React, { useEffect, useRef, useState, memo } from 'react';

// Dynamic import for AnimFlow
// @ts-ignore - @animflow/core types not built yet
const loadAnimFlow = () => import('@animflow/core').then((mod) => mod.AnimFlow);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimFlowInstance = any;

export interface AnimFlowPreviewProps {
  /** AnimFlow YAML 코드 */
  yaml: string;
  /** 높이 (기본: 300px) */
  height?: number;
  /** 에러 콜백 */
  onError?: (error: string) => void;
  /** 로드 완료 콜백 */
  onLoad?: () => void;
}

interface PreviewState {
  status: 'loading' | 'ready' | 'error';
  error?: string;
}

function AnimFlowPreviewComponent({
  yaml,
  height = 300,
  onError,
  onLoad,
}: AnimFlowPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animflowRef = useRef<AnimFlowInstance>(null);
  const [state, setState] = useState<PreviewState>({ status: 'loading' });

  useEffect(() => {
    if (!containerRef.current || !yaml.trim()) {
      setState({ status: 'error', error: 'Empty YAML content' });
      return;
    }

    // Clear container
    containerRef.current.innerHTML = '';
    let isMounted = true;

    loadAnimFlow()
      .then((AnimFlow) => {
        if (!isMounted || !containerRef.current) return;

        try {
          // AnimFlow 인스턴스 생성
          const animflow = new AnimFlow({
            container: containerRef.current,
            source: yaml.trim(),
            format: 'yaml',
            autoRender: true,
            showControls: false,
            showProgress: false,
          });

          animflowRef.current = animflow;
          setState({ status: 'ready' });
          onLoad?.();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error('AnimFlow preview error:', err);
          setState({ status: 'error', error: errorMessage });
          onError?.(errorMessage);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        const errorMessage = 'Failed to load AnimFlow library';
        console.error('Failed to load AnimFlow:', err);
        setState({ status: 'error', error: errorMessage });
        onError?.(errorMessage);
      });

    return () => {
      isMounted = false;
      animflowRef.current?.destroy();
      animflowRef.current = null;
    };
  }, [yaml, onError, onLoad]);

  if (state.status === 'error') {
    return (
      <div className="animflow-preview-error" style={styles.error}>
        <div style={styles.errorIcon}>⚠</div>
        <div style={styles.errorTitle}>AnimFlow 렌더링 실패</div>
        <pre style={styles.errorMessage}>{state.error}</pre>
      </div>
    );
  }

  return (
    <div className="animflow-preview" style={styles.container}>
      {state.status === 'loading' && (
        <div style={styles.loading}>
          <div style={styles.spinner} />
          <span>AnimFlow 로딩 중...</span>
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          ...styles.canvas,
          height: `${height}px`,
          opacity: state.status === 'ready' ? 1 : 0.5,
        }}
      />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const AnimFlowPreview = memo(AnimFlowPreviewComponent, (prev, next) => {
  // Only re-render if yaml changes
  return prev.yaml === next.yaml && prev.height === next.height;
});

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
    border: '1px solid #e9ecef',
  },
  canvas: {
    width: '100%',
    position: 'relative',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#6c757d',
    fontSize: '0.875rem',
    zIndex: 10,
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid #e9ecef',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fff5f5',
    border: '1px solid #feb2b2',
    borderRadius: '8px',
  },
  errorIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
  },
  errorTitle: {
    fontWeight: 600,
    color: '#c53030',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
  },
  errorMessage: {
    fontSize: '0.75rem',
    color: '#666',
    backgroundColor: '#fff',
    padding: '0.5rem',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '100px',
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
};

// Add CSS animation for spinner via style tag
if (typeof document !== 'undefined') {
  const styleId = 'animflow-preview-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

export default AnimFlowPreview;
