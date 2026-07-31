import Editor from '@monaco-editor/react';
import { useTheme } from '../theme-provider.js';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const { theme } = useTheme();

  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-950">
      <Editor
        height="400px"
        language={language}
        value={value}
        onChange={onChange}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        loading={
          <div className="flex h-[400px] w-full items-center justify-center bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-400">
            Loading Monaco Editor...
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
        }}
      />
    </div>
  );
}
