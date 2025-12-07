# Research: AI-Powered Markdown Editor

**Input**: Feature specification from `specs/003-ai-markdown-editor/spec.md`
**Date**: 2025-12-07

## Executive Summary

브라우저 기반 마크다운 편집기 구현을 위한 기술 조사 결과를 정리한다. 핵심 기술 스택은 React + CodeMirror 6 + `@google/genai` SDK 조합이며, 기존 AnimFlowEmbed 컴포넌트와의 통합을 고려한 설계가 필요하다.

## 1. Gemini SDK 조사

### 1.1 SDK 선택: `@google/genai` (신규 통합 SDK)

**중요**: 기존 `@google/generative-ai` SDK는 **2025년 8월 31일 지원 종료 예정**이므로 신규 SDK 사용 필수.

| 항목 | `@google/generative-ai` (deprecated) | `@google/genai` (권장) |
|------|--------------------------------------|------------------------|
| 상태 | Deprecated | GA (Generally Available) |
| 최신 버전 | 0.21.0 | 1.31.0 |
| Gemini 2.0+ | 미지원 | 지원 |
| 지원 종료 | 2025-08-31 | 활성 유지 |

### 1.2 기본 사용법

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Why is the sky blue?',
});
console.log(response.text);
```

### 1.3 보안 고려사항

- **클라이언트 사이드 API Key 노출 주의**: 프로덕션에서는 서버 사이드 프록시 권장
- 본 프로젝트는 **개인 블로그 저작 도구**이므로 사용자 본인의 API Key 사용 (클라이언트 사이드 허용)
- LocalStorage에 API Key 저장 시 경고 문구 표시

### 1.4 SDK 서브모듈

| 모듈 | 용도 | 본 프로젝트 활용 |
|------|------|------------------|
| `ai.models` | 텍스트/이미지 생성 | AnimFlow YAML 생성, 초안 작성 |
| `ai.caches` | 프롬프트 캐싱 | DSL 문법 문서 캐싱 (비용 절감) |
| `ai.chats` | 다중 턴 대화 | 향후 Q&A 기능에 활용 가능 |

**Sources**:
- [Google Gen AI SDK - npm](https://www.npmjs.com/package/@google/genai)
- [googleapis/js-genai - GitHub](https://github.com/googleapis/js-genai)
- [Deprecated SDK Notice](https://github.com/google-gemini/deprecated-generative-ai-js)

---

## 2. 마크다운 편집기 조사

### 2.1 에디터 라이브러리 비교

| 라이브러리 | 장점 | 단점 | 권장도 |
|-----------|------|------|--------|
| `@uiw/react-codemirror` | 경량, React Hook 지원, 테마 커스터마이징, TypeScript 지원 | Monaco 대비 기능 적음 | ⭐⭐⭐⭐⭐ |
| `@uiw/react-monacoeditor` | VS Code 동일 기능, 강력한 자동완성 | 번들 크기 큼 (~2MB) | ⭐⭐⭐ |
| `@uiw/react-markdown-editor` | 올인원 솔루션 | 커스터마이징 제한 | ⭐⭐⭐⭐ |

### 2.2 권장: CodeMirror 6 (`@uiw/react-codemirror`)

**선택 근거**:
1. **번들 크기**: Monaco (~2MB) vs CodeMirror (~200KB) - 블로그 성능 우선
2. **React 통합**: React 18+ Hook 완벽 지원
3. **YAML 지원**: `@codemirror/lang-yaml` 확장으로 AnimFlow YAML 하이라이팅
4. **마크다운 지원**: `@codemirror/lang-markdown` 내장

### 2.3 마크다운 렌더링

| 라이브러리 | 용도 | 선택 |
|-----------|------|------|
| `react-markdown` | 마크다운 → React 컴포넌트 | ✅ |
| `remark-gfm` | GitHub Flavored Markdown | ✅ |
| `rehype-highlight` | 코드 구문 하이라이팅 | ✅ |
| `rehype-raw` | HTML 태그 허용 | 검토 필요 |

### 2.4 실시간 미리보기 패턴

```
┌──────────────────────────────────────────────────────────┐
│                    Split View Layout                      │
├──────────────────────┬───────────────────────────────────┤
│   Editor Panel       │      Preview Panel                 │
│   (CodeMirror)       │      (react-markdown)              │
│                      │                                    │
│   - onChange 이벤트  │      - debounce 적용 (50ms)       │
│   - YAML 감지        │      - AnimFlowEmbed 렌더링       │
│                      │                                    │
└──────────────────────┴───────────────────────────────────┘
```

**Sources**:
- [@uiw/react-codemirror - GitHub](https://github.com/uiwjs/react-codemirror)
- [@uiw/react-markdown-editor - GitHub](https://github.com/uiwjs/react-markdown-editor)
- [MarkdownLiveEditor - GitHub](https://github.com/BaseMax/MarkdownLiveEditor)

---

## 3. 기존 코드베이스 분석

### 3.1 AnimFlowEmbed 컴포넌트

**위치**: `blog/src/components/AnimFlowEmbed.tsx`

**주요 특징**:
- React 컴포넌트로 구현됨
- `@animflow/core` 동적 임포트 (번들 최적화)
- YAML 문자열을 props로 받아 렌더링
- 시나리오 선택, 재생 속도 조절 지원

**편집기 통합 방안**:
```typescript
// 기존 AnimFlowEmbed 재사용
<AnimFlowPreview
  yaml={extractedYaml}
  height={300}
/>
```

### 3.2 remark-animflow 플러그인

**위치**: `blog/src/plugins/remark-animflow.ts`

- MDX 내 `\`\`\`animflow` 블록 감지
- JSON으로 변환하여 클라이언트 전달
- 편집기에서도 동일한 감지 로직 재사용 가능

### 3.3 기존 프로젝트 구조

```
blog/src/
├── components/
│   └── AnimFlowEmbed.tsx    # 재사용 대상
├── plugins/
│   └── remark-animflow.ts   # 로직 참조 가능
├── content/
│   └── config.ts            # 콘텐츠 스키마
└── pages/                   # editor.astro 추가 예정
```

---

## 4. AnimFlow YAML 검증

### 4.1 검증 전략

| 단계 | 도구 | 설명 |
|------|------|------|
| 1. YAML 파싱 | `js-yaml` | 기본 문법 오류 검출 |
| 2. 스키마 검증 | `ajv` + JSON Schema | AnimFlow DSL 스키마 적용 |
| 3. 런타임 검증 | `@animflow/core` | 실제 렌더링 시 오류 검출 |

### 4.2 오류 표시 UI

```typescript
interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}
```

---

## 5. LocalStorage 저장 전략

### 5.1 저장 항목

| 키 | 데이터 | 설명 |
|----|--------|------|
| `editor:document` | Document JSON | 현재 편집 중인 문서 |
| `editor:settings` | Settings JSON | API Key, 테마 등 |
| `editor:autosave` | 타임스탬프 | 마지막 자동 저장 시간 |

### 5.2 자동 저장 로직

```typescript
// debounce 1초 적용
const useAutoSave = (content: string) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('editor:document', JSON.stringify({
        content,
        savedAt: Date.now(),
      }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [content]);
};
```

---

## 6. 성능 최적화 전략

### 6.1 50ms 렌더링 목표 달성

| 전략 | 설명 |
|------|------|
| Debounce | 입력 후 50ms 대기 후 렌더링 |
| 가상화 | 10,000자+ 문서에서 visible 영역만 렌더링 |
| Web Worker | 마크다운 파싱을 별도 스레드에서 처리 (선택) |
| Memoization | React.memo, useMemo로 불필요한 리렌더링 방지 |

### 6.2 AnimFlow 렌더링 최적화

- YAML 변경 시에만 AnimFlowEmbed 리렌더링
- 미리보기 토글로 렌더링 부하 제어

---

## 7. 리스크 및 완화 방안

| 리스크 | 영향 | 완화 방안 |
|--------|------|-----------|
| Gemini API Rate Limit | AI 기능 중단 | 로컬 캐싱, 재시도 로직 |
| 대용량 문서 성능 저하 | UX 저하 | 가상화, 지연 렌더링 |
| YAML 문법 오류 | 다이어그램 표시 불가 | 실시간 검증, 폴백 UI |
| LocalStorage 용량 한계 | 저장 실패 | 압축, 용량 경고 |

---

## 8. 결정 사항 요약

| 항목 | 결정 | 근거 |
|------|------|------|
| Gemini SDK | `@google/genai` | 신규 통합 SDK, GA 상태 |
| 에디터 | `@uiw/react-codemirror` | 경량, React Hook 지원 |
| 마크다운 렌더링 | `react-markdown` + `remark-gfm` | 표준 솔루션 |
| 스키마 검증 | `ajv` | 기존 프로젝트에서 사용 중 |
| AnimFlow 미리보기 | 기존 AnimFlowEmbed 재사용 | 코드 중복 방지 |

---

## 9. 다음 단계

1. **Phase 1**: data-model.md 작성 (TypeScript 인터페이스 정의)
2. **Phase 1**: contracts/api.md 작성 (내부 API 계약)
3. **Phase 1**: quickstart.md 작성 (개발 시작 가이드)
