/**
 * MDX Exporter Service
 * 마크다운 문서를 MDX 파일로 내보내기 및 다운로드
 */

import type { Document } from '../types/editor';

/**
 * Frontmatter 생성 옵션
 */
export interface FrontmatterOptions {
  /** 문서 제목 */
  title: string;
  /** 문서 설명 (선택) */
  description?: string;
  /** 태그 목록 */
  tags?: string[];
  /** 발행일 (기본: 현재 날짜) */
  publishedAt?: Date;
  /** 초안 여부 */
  draft?: boolean;
  /** 저자 */
  author?: string;
}

/**
 * Frontmatter YAML 문자열 생성
 * @param options - Frontmatter 옵션
 * @returns YAML frontmatter 문자열 (--- 구분자 포함)
 */
export function generateFrontmatter(options: FrontmatterOptions): string {
  const {
    title,
    description,
    tags = [],
    publishedAt = new Date(),
    draft = false,
    author,
  } = options;

  const lines: string[] = ['---'];

  // 제목 (따옴표로 감싸 특수문자 처리)
  lines.push(`title: "${escapeYamlString(title)}"`);

  // 설명 (있는 경우)
  if (description) {
    lines.push(`description: "${escapeYamlString(description)}"`);
  }

  // 발행일 (ISO 날짜 형식)
  lines.push(`publishedAt: ${formatDate(publishedAt)}`);

  // 태그 (배열 형식)
  if (tags.length > 0) {
    lines.push('tags:');
    tags.forEach((tag) => {
      lines.push(`  - "${escapeYamlString(tag)}"`);
    });
  }

  // 초안 여부
  if (draft) {
    lines.push('draft: true');
  }

  // 저자 (있는 경우)
  if (author) {
    lines.push(`author: "${escapeYamlString(author)}"`);
  }

  lines.push('---');

  return lines.join('\n');
}

/**
 * 문서를 MDX 형식 문자열로 변환
 * @param document - 문서 객체
 * @param options - Frontmatter 추가 옵션
 * @returns MDX 문자열
 */
export function exportToMdx(
  document: Document,
  options?: Partial<FrontmatterOptions>
): string {
  // 제목 추출 (첫 번째 # 제목 또는 기본값)
  const titleMatch = document.content.match(/^#\s+(.+)$/m);
  const title = options?.title || titleMatch?.[1] || 'Untitled';

  // 설명 추출 (첫 번째 단락 또는 없음)
  const descriptionMatch = document.content.match(/^(?!#)(.{10,150})/m);
  const description = options?.description || descriptionMatch?.[1]?.trim();

  // Frontmatter 생성
  const frontmatter = generateFrontmatter({
    title,
    description,
    tags: document.tags,
    publishedAt: options?.publishedAt || new Date(),
    draft: options?.draft,
    author: options?.author,
  });

  // 본문 정리 (첫 번째 제목이 중복되면 제거)
  let content = document.content;
  if (titleMatch && !options?.title) {
    // 첫 제목 줄과 그 다음 빈 줄 제거 (frontmatter에 제목이 있으므로)
    content = content.replace(/^#\s+.+\n\n?/, '');
  }

  return `${frontmatter}\n\n${content.trim()}\n`;
}

/**
 * MDX 파일 다운로드
 * @param document - 문서 객체
 * @param filename - 파일 이름 (확장자 제외)
 * @param options - Frontmatter 추가 옵션
 */
export function downloadMdx(
  document: Document,
  filename?: string,
  options?: Partial<FrontmatterOptions>
): void {
  const mdxContent = exportToMdx(document, options);

  // 파일 이름 결정 (slug 형식)
  const safeFilename = filename
    ? toSlug(filename)
    : toSlug(document.title) || `document-${Date.now()}`;

  // Blob 생성 및 다운로드
  const blob = new Blob([mdxContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = window.document.createElement('a');
  link.href = url;
  link.download = `${safeFilename}.mdx`;
  link.style.display = 'none';

  window.document.body.appendChild(link);
  link.click();

  // 정리
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 문자열을 slug 형식으로 변환
 * @param str - 원본 문자열
 * @returns slug 문자열
 */
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[가-힣]+/g, (match) => {
      // 한글은 그대로 유지 (URL 인코딩됨)
      return match;
    })
    .replace(/[^\w가-힣\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속 하이픈 정리
    .replace(/^-|-$/g, ''); // 시작/끝 하이픈 제거
}

/**
 * YAML 문자열 이스케이프
 * @param str - 원본 문자열
 * @returns 이스케이프된 문자열
 */
function escapeYamlString(str: string): string {
  return str
    .replace(/\\/g, '\\\\') // 백슬래시
    .replace(/"/g, '\\"') // 따옴표
    .replace(/\n/g, '\\n'); // 줄바꿈
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 * @param date - Date 객체
 * @returns 포맷된 날짜 문자열
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * MDX 문자열을 클립보드에 복사
 * @param document - 문서 객체
 * @param options - Frontmatter 추가 옵션
 * @returns 복사 성공 여부
 */
export async function copyMdxToClipboard(
  document: Document,
  options?: Partial<FrontmatterOptions>
): Promise<boolean> {
  try {
    const mdxContent = exportToMdx(document, options);
    await navigator.clipboard.writeText(mdxContent);
    return true;
  } catch {
    return false;
  }
}
