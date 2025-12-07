/**
 * EditorPanel - CodeMirror 기반 마크다운 편집기
 */

import React, { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';

interface EditorPanelProps {
  /** 마크다운 내용 */
  value: string;
  /** 변경 콜백 */
  onChange: (value: string) => void;
  /** 폰트 크기 (px) */
  fontSize?: number;
  /** 읽기 전용 모드 */
  readOnly?: boolean;
}

export function EditorPanel({
  value,
  onChange,
  fontSize = 14,
  readOnly = false,
}: EditorPanelProps) {
  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  return (
    <div className="editor-panel">
      <CodeMirror
        value={value}
        height="100%"
        extensions={[
          markdown({
            base: markdownLanguage,
            codeLanguages: languages,
          }),
        ]}
        onChange={handleChange}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: true,
        }}
        style={{
          fontSize: `${fontSize}px`,
          height: '100%',
        }}
      />
    </div>
  );
}

export default EditorPanel;
