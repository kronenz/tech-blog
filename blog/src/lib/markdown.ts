/**
 * Markdown Rendering Utility
 * marked 라이브러리를 사용하여 Markdown을 HTML로 변환
 */
import { marked } from 'marked';

// marked 설정
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // 줄바꿈을 <br>로 변환
});

/**
 * Markdown을 HTML로 변환
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const html = await marked.parse(markdown);
  return html;
}

/**
 * 동기 버전 (간단한 변환용)
 */
export function renderMarkdownSync(markdown: string): string {
  return marked.parse(markdown) as string;
}
