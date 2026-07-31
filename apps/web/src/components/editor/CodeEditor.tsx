import Editor from '@monaco-editor/react';
import { useTheme } from '../theme-provider.js';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  editorTheme?: 'vs-dark' | 'light';
  lineNumbers?: 'on' | 'off';
  tabSize?: number;
  onMount?: (editor: any, monaco: any) => void;
}

export function CodeEditor({
  value,
  onChange,
  language,
  editorTheme,
  lineNumbers = 'on',
  tabSize = 2,
  onMount,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const selectedTheme = editorTheme || (theme === 'dark' ? 'vs-dark' : 'light');

  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-950">
      <Editor
        height="400px"
        language={language}
        value={value}
        onChange={onChange}
        theme={selectedTheme}
        onMount={onMount}
        loading={
          <div className="flex h-[400px] w-full items-center justify-center bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-400">
            Loading Monaco Editor...
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: lineNumbers,
          tabSize: tabSize,
          insertSpaces: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
        }}
      />
    </div>
  );
}
