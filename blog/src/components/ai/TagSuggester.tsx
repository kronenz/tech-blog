/**
 * TagSuggester - AI 기반 태그 추천기
 * 글 내용을 분석하여 관련 태그를 추천
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useGemini } from '../../hooks/useGemini';

export interface TagSuggesterProps {
  /** API Key */
  apiKey: string | null;
  /** 분석할 콘텐츠 */
  content: string;
  /** 현재 태그 목록 */
  currentTags: string[];
  /** 태그 추가 핸들러 */
  onAddTag: (tag: string) => void;
  /** 태그 제거 핸들러 */
  onRemoveTag: (tag: string) => void;
  /** 닫기 핸들러 */
  onClose: () => void;
}

export function TagSuggester({
  apiKey,
  content,
  currentTags,
  onAddTag,
  onRemoveTag,
  onClose,
}: TagSuggesterProps) {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(currentTags));

  const { isLoading, error, suggestTagsForContent, cancel } = useGemini(apiKey);

  // 태그 추천 실행
  const handleSuggest = useCallback(async () => {
    if (!content.trim()) return;

    setSuggestedTags([]);

    const response = await suggestTagsForContent(content);

    if (response.success && response.tags) {
      setSuggestedTags(response.tags);
    }
  }, [content, suggestTagsForContent]);

  // 컴포넌트 마운트 시 자동으로 태그 추천
  useEffect(() => {
    if (content.length >= 100) {
      handleSuggest();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 태그 선택/해제
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
        onRemoveTag(tag);
      } else {
        next.add(tag);
        onAddTag(tag);
      }
      return next;
    });
  }, [onAddTag, onRemoveTag]);

  // 모든 추천 태그 추가
  const handleAddAll = useCallback(() => {
    suggestedTags.forEach((tag) => {
      if (!selectedTags.has(tag)) {
        setSelectedTags((prev) => new Set(prev).add(tag));
        onAddTag(tag);
      }
    });
  }, [suggestedTags, selectedTags, onAddTag]);

  // 취소
  const handleCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  const contentLength = content.length;
  const isContentTooShort = contentLength < 100;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>태그 추천</h2>
        <button style={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      <div style={styles.content}>
        {/* 콘텐츠 길이 표시 */}
        <div style={styles.info}>
          <span>
            콘텐츠 길이: <strong>{contentLength}</strong>자
            {isContentTooShort && (
              <span style={styles.warning}> (최소 100자 이상 권장)</span>
            )}
          </span>
        </div>

        {/* API Key 경고 */}
        {!apiKey && (
          <div style={styles.warningBox}>
            ⚠️ AI 기능을 사용하려면 설정에서 Gemini API Key를 먼저 설정해주세요.
          </div>
        )}

        {/* 추천 버튼 */}
        <div style={styles.actions}>
          {isLoading ? (
            <button onClick={handleCancel} style={styles.cancelBtn}>
              취소
            </button>
          ) : (
            <button
              onClick={handleSuggest}
              style={styles.suggestBtn}
              disabled={isContentTooShort || !apiKey}
            >
              태그 추천받기
            </button>
          )}
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <span>태그 분석 중...</span>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div style={styles.error}>
            <strong>오류:</strong> {error}
          </div>
        )}

        {/* 현재 태그 */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>현재 태그</h3>
          {currentTags.length > 0 ? (
            <div style={styles.tagList}>
              {currentTags.map((tag) => (
                <span key={tag} style={styles.tag}>
                  {tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    style={styles.tagRemove}
                    title="태그 제거"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>아직 추가된 태그가 없습니다.</p>
          )}
        </div>

        {/* 추천 태그 */}
        {suggestedTags.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>추천 태그</h3>
              <button onClick={handleAddAll} style={styles.addAllBtn}>
                모두 추가
              </button>
            </div>
            <div style={styles.tagList}>
              {suggestedTags.map((tag) => {
                const isSelected = selectedTags.has(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      ...styles.suggestedTag,
                      ...(isSelected ? styles.suggestedTagSelected : {}),
                    }}
                  >
                    {tag}
                    {isSelected && <span style={styles.checkmark}>✓</span>}
                  </button>
                );
              })}
            </div>
            <p style={styles.hint}>
              태그를 클릭하여 추가하거나 제거할 수 있습니다.
            </p>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <button onClick={onClose} style={styles.doneBtn}>
          완료
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
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
  info: {
    marginBottom: '1rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  warning: {
    color: '#f59e0b',
  },
  warningBox: {
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
  suggestBtn: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#0ea5e9',
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
    borderTopColor: '#0ea5e9',
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
  section: {
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151',
  },
  addAllBtn: {
    padding: '0.25rem 0.5rem',
    border: '1px solid #0ea5e9',
    borderRadius: '4px',
    backgroundColor: '#f0f9ff',
    color: '#0ea5e9',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.75rem',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  tagRemove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    padding: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.7,
    fontSize: '0.75rem',
  },
  suggestedTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.75rem',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    color: '#374151',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  suggestedTagSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    color: '#166534',
  },
  checkmark: {
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  emptyText: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  hint: {
    margin: '0.5rem 0 0',
    fontSize: '0.75rem',
    color: '#9ca3af',
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

export default TagSuggester;
