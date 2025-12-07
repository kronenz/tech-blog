/**
 * Gemini AI Service
 * @google/genai SDK를 사용한 AI 기능 구현
 */

import { GoogleGenAI } from '@google/genai';
import type { AIResponse, EditorErrorCode } from '../types/editor';

// DSL 스펙 문서 (AI 컨텍스트용)
const ANIMFLOW_DSL_CONTEXT = `
AnimFlow DSL은 인터랙티브 애니메이션 다이어그램을 정의하기 위한 YAML 기반 언어입니다.

## 필수 필드
1. version: DSL 버전 (현재 "1.0")
2. nodes: 최소 1개 이상의 노드 배열

## Node (노드)
필수 필드:
- id: 고유 식별자 (소문자, 숫자, 하이픈만 허용, 소문자로 시작)
- label: 표시 텍스트
- position: { x: number, y: number } 좌표

선택 필드:
- type: box | circle | database | icon | group (기본: box)
- style: { color: "#hex", shape: "rounded-rect", width: 120, height: 60 }

## Edge (엣지)
필수 필드:
- id: 고유 식별자
- from: 출발 노드 ID
- to: 도착 노드 ID

선택 필드:
- label: 엣지 라벨 텍스트
- style: { color: "#hex", lineType: "solid" | "dashed" | "dotted" }

## Scenario (시나리오)
필수 필드:
- id: 고유 식별자
- steps: 실행할 스텝 배열

## Step Actions
- highlight: 노드/엣지 강조 { action: "highlight", nodes: ["id"], duration: 1000 }
- animate-edge: 엣지 애니메이션 { action: "animate-edge", edge: "id", duration: 800 }
- delay: 대기 { action: "delay", duration: 500 }
- log: 로그 { action: "log", log: { message: "text", type: "info" | "success" | "warning" | "error" } }
- reset: 초기화 { action: "reset" }
- parallel: 병렬 실행 { action: "parallel", steps: [...] }

## 중요 규칙
1. 모든 ID는 소문자, 숫자, 하이픈만 허용 (소문자로 시작)
2. 엣지의 from/to는 존재하는 노드 ID를 참조해야 함
3. position의 x, y 값은 0 이상
4. duration은 0보다 큰 숫자 (밀리초)
`;

let aiInstance: GoogleGenAI | null = null;

/**
 * Gemini AI 클라이언트 초기화
 * @param apiKey - Gemini API Key
 */
export function initializeGemini(apiKey: string): GoogleGenAI {
  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
}

/**
 * Gemini AI 클라이언트 가져오기
 * @throws Error if not initialized
 */
export function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    throw new Error('Gemini AI not initialized. Call initializeGemini first.');
  }
  return aiInstance;
}

/**
 * Gemini AI 초기화 여부 확인
 */
export function isGeminiInitialized(): boolean {
  return aiInstance !== null;
}

/**
 * 자연어 설명에서 AnimFlow YAML 생성
 * @param description - 다이어그램에 대한 자연어 설명
 * @param apiKey - Gemini API Key (선택, 없으면 초기화된 클라이언트 사용)
 * @returns AI 응답 (YAML 또는 에러)
 */
export async function generateAnimFlowYaml(
  description: string,
  apiKey?: string
): Promise<AIResponse> {
  try {
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : getGeminiClient();

    const prompt = `
You are an expert at creating AnimFlow DSL YAML diagrams. Based on the following description, generate a valid AnimFlow YAML that visualizes the described flow or concept.

${ANIMFLOW_DSL_CONTEXT}

## User Description
${description}

## Requirements
1. Generate ONLY valid YAML code, no markdown code blocks or explanations
2. Include version: "1.0"
3. Create appropriate nodes with descriptive labels
4. Add edges to show relationships/flow
5. Include at least one scenario with animation steps
6. Use meaningful IDs (lowercase, hyphens)
7. Position nodes logically (left-to-right or top-to-bottom flow)
8. Add highlight and animate-edge actions in scenario steps
9. Include log actions to explain each step

Generate the AnimFlow YAML:
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '';

    // YAML 코드 블록 제거 (AI가 실수로 추가할 경우)
    let yaml = text;
    if (yaml.startsWith('```yaml')) {
      yaml = yaml.slice(7);
    } else if (yaml.startsWith('```')) {
      yaml = yaml.slice(3);
    }
    if (yaml.endsWith('```')) {
      yaml = yaml.slice(0, -3);
    }
    yaml = yaml.trim();

    return {
      success: true,
      content: yaml,
      model: 'gemini-2.0-flash',
      timestamp: Date.now(),
    };
  } catch (error) {
    const err = error as Error;
    let errorCode: EditorErrorCode = 'AI_REQUEST_FAILED';

    if (err.message?.includes('API key')) {
      errorCode = 'API_KEY_INVALID';
    } else if (err.message?.includes('rate limit') || err.message?.includes('quota')) {
      errorCode = 'AI_RATE_LIMITED';
    }

    return {
      success: false,
      error: err.message || 'Unknown error',
      errorCode,
      timestamp: Date.now(),
    };
  }
}

/**
 * 주제에서 블로그 초안 생성
 * @param topic - 블로그 주제
 * @param apiKey - Gemini API Key (선택)
 * @returns AI 응답 (마크다운 또는 에러)
 */
export async function generateDraft(
  topic: string,
  apiKey?: string
): Promise<AIResponse> {
  try {
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : getGeminiClient();

    const prompt = `
You are a technical blog writer specializing in software engineering and technology topics.
Write a comprehensive blog post draft in Korean markdown format about the following topic.

## Topic
${topic}

## Requirements
1. Write in Korean (한국어)
2. Use proper markdown formatting
3. Include:
   - 제목 (H1)
   - 개요/소개
   - 본문 (여러 섹션, H2/H3 사용)
   - 코드 예제 (관련 있는 경우)
   - 결론
4. Make it informative and engaging
5. Include places where an AnimFlow diagram would be helpful, marked with:
   <!-- AnimFlow: [간단한 다이어그램 설명] -->
6. Target length: 800-1500 words

Write the blog post draft:
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '';

    return {
      success: true,
      content: text,
      model: 'gemini-2.0-flash',
      timestamp: Date.now(),
    };
  } catch (error) {
    const err = error as Error;
    let errorCode: EditorErrorCode = 'AI_REQUEST_FAILED';

    if (err.message?.includes('API key')) {
      errorCode = 'API_KEY_INVALID';
    } else if (err.message?.includes('rate limit') || err.message?.includes('quota')) {
      errorCode = 'AI_RATE_LIMITED';
    }

    return {
      success: false,
      error: err.message || 'Unknown error',
      errorCode,
      timestamp: Date.now(),
    };
  }
}

/**
 * 콘텐츠에서 관련 태그 추천
 * @param content - 블로그 콘텐츠
 * @param apiKey - Gemini API Key (선택)
 * @returns AI 응답 (태그 배열 또는 에러)
 */
export async function suggestTags(
  content: string,
  apiKey?: string
): Promise<AIResponse> {
  try {
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : getGeminiClient();

    const prompt = `
Analyze the following technical blog content and suggest 3-5 relevant tags.
Tags should be:
1. Lowercase
2. Single words or hyphenated phrases (e.g., "kubernetes", "api-design")
3. Relevant to the main topics discussed
4. Common technical terms that readers might search for

## Content
${content.slice(0, 3000)} ${content.length > 3000 ? '...(truncated)' : ''}

## Response Format
Return ONLY a JSON array of tag strings, nothing else. Example:
["javascript", "react", "web-development", "frontend"]

Suggested tags:
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '';

    // JSON 배열 파싱
    let tags: string[] = [];
    try {
      // JSON 코드 블록 제거
      let jsonText = text;
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }
      jsonText = jsonText.trim();

      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        tags = parsed.map((t) => String(t).toLowerCase().trim()).filter(Boolean);
      }
    } catch {
      // JSON 파싱 실패 시 텍스트에서 태그 추출 시도
      const matches = text.match(/["']([^"']+)["']/g);
      if (matches) {
        tags = matches.map((m) => m.replace(/["']/g, '').toLowerCase().trim());
      }
    }

    return {
      success: true,
      content: tags.slice(0, 5).join(', '),
      tags: tags.slice(0, 5),
      model: 'gemini-2.0-flash',
      timestamp: Date.now(),
    };
  } catch (error) {
    const err = error as Error;
    let errorCode: EditorErrorCode = 'AI_REQUEST_FAILED';

    if (err.message?.includes('API key')) {
      errorCode = 'API_KEY_INVALID';
    } else if (err.message?.includes('rate limit') || err.message?.includes('quota')) {
      errorCode = 'AI_RATE_LIMITED';
    }

    return {
      success: false,
      error: err.message || 'Unknown error',
      errorCode,
      timestamp: Date.now(),
    };
  }
}

/**
 * Gemini AI 클라이언트 정리 (로그아웃 시 등)
 */
export function cleanupGemini(): void {
  aiInstance = null;
}
