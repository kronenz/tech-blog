/**
 * PublishModal - 포스트 발행 모달
 */
import React, { useState, useCallback, useEffect } from 'react';
import { publishPost, checkSlugAvailability, generateSlug } from '../../services/posts-api';

export interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  currentTags: string[];
  onPublished?: (slug: string) => void;
}

export function PublishModal({
  isOpen,
  onClose,
  content,
  currentTags,
  onPublished,
}: PublishModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>(currentTags);
  const [tagInput, setTagInput] = useState('');

  const [isSlugValid, setIsSlugValid] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  // 태그 동기화
  useEffect(() => {
    if (isOpen) {
      setTags(currentTags);
    }
  }, [isOpen, currentTags]);

  // 제목에서 자동 slug 생성
  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = generateSlug(title);
      if (generatedSlug) {
        setSlug(generatedSlug);
      }
    }
  }, [title]);

  // Slug 유효성 검사 (debounced)
  useEffect(() => {
    if (!slug) {
      setIsSlugValid(null);
      return;
    }

    // slug 형식 검사
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setIsSlugValid(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      const result = await checkSlugAvailability(slug);
      setIsChecking(false);

      if (result.success && result.data) {
        setIsSlugValid(result.data.available);
      } else {
        setIsSlugValid(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  // 태그 추가
  const handleAddTag = useCallback(() => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags((prev) => [...prev, trimmedTag]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  // 태그 제거
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  // Enter 키로 태그 추가
  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag]
  );

  // 발행
  const handlePublish = useCallback(async () => {
    // 유효성 검사
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!slug.trim()) {
      setError('Slug를 입력해주세요.');
      return;
    }
    if (!isSlugValid) {
      setError('유효한 Slug를 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setError('내용이 비어있습니다.');
      return;
    }

    setIsPublishing(true);
    setError(null);

    const result = await publishPost({
      title: title.trim(),
      slug: slug.trim(),
      content: content,
      description: description.trim(),
      tags,
    });

    setIsPublishing(false);

    if (result.success && result.data) {
      setSuccess(true);
      setPublishedSlug(result.data.slug);
      if (onPublished) {
        onPublished(result.data.slug);
      }
    } else {
      setError(result.error || '발행에 실패했습니다.');
    }
  }, [title, slug, description, tags, content, isSlugValid, onPublished]);

  // 모달 닫기 시 상태 초기화
  const handleClose = useCallback(() => {
    setTitle('');
    setSlug('');
    setDescription('');
    setTagInput('');
    setIsSlugValid(null);
    setError(null);
    setSuccess(false);
    setPublishedSlug(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {success ? '발행 완료!' : '포스트 발행'}
          </h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <p style={{ marginBottom: '1rem', color: '#059669' }}>
                포스트가 성공적으로 발행되었습니다!
              </p>
              <a
                href={`/p/${publishedSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                포스트 보기 →
              </a>
            </div>
          ) : (
            <>
              {error && (
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '0.375rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                  }}
                >
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">제목 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="포스트 제목을 입력하세요"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Slug *
                  {isChecking && (
                    <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                      확인 중...
                    </span>
                  )}
                  {!isChecking && isSlugValid === true && (
                    <span style={{ marginLeft: '0.5rem', color: '#059669' }}>
                      ✓ 사용 가능
                    </span>
                  )}
                  {!isChecking && isSlugValid === false && (
                    <span style={{ marginLeft: '0.5rem', color: '#dc2626' }}>
                      ✗ 사용 불가
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="url-friendly-slug"
                />
                <p className="form-hint">
                  영문 소문자, 숫자, 하이픈만 사용 가능합니다.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">설명</label>
                <textarea
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="포스트에 대한 간단한 설명"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">태그</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="태그 입력 후 Enter"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="toolbar-btn"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    추가
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="tag-list" style={{ marginTop: '0.5rem' }}>
                    {tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                        <button
                          className="tag-remove"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  marginTop: '1.5rem',
                }}
              >
                <button className="toolbar-btn" onClick={handleClose}>
                  취소
                </button>
                <button
                  className="toolbar-btn primary"
                  onClick={handlePublish}
                  disabled={isPublishing || !title || !slug || !isSlugValid}
                >
                  {isPublishing ? '발행 중...' : '발행하기'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublishModal;
