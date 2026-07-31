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

  // Resolve base theme mapping
  const currentTheme = editorTheme || (theme === 'dark' ? 'vs-dark' : 'light');
  const selectedTheme = currentTheme === 'vs-dark' ? 'pastebin-white' : 'pastebin-cream';

  const handleEditorWillMount = (monaco: any) => {
    // Custom premium white theme
    monaco.editor.defineTheme('pastebin-white', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
        { token: 'keyword', foreground: '2563eb', fontStyle: 'bold' },
        { token: 'string', foreground: '0284c7' },
        { token: 'number', foreground: 'd97706' },
        { token: 'type', foreground: '059669' },
      ],
      colors: {
        'editor.background': '#ffffff', // Pure White
        'editor.foreground': '#334155',
        'editor.lineHighlightBackground': '#f1f5f990',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#2563eb',
        'editorGutter.background': '#ffffff',
      },
    });

    // Custom premium cream theme (sepia/ivory warm feel)
    monaco.editor.defineTheme('pastebin-cream', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8a99ad', fontStyle: 'italic' },
        { token: 'keyword', foreground: '1d4ed8', fontStyle: 'bold' },
        { token: 'string', foreground: '0891b2' },
        { token: 'number', foreground: 'b45309' },
        { token: 'type', foreground: '047857' },
      ],
      colors: {
        'editor.background': '#faf6eb', // Premium Ivory Cream
        'editor.foreground': '#334155',
        'editor.lineHighlightBackground': '#f4eedb',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#2563eb',
        'editorGutter.background': '#faf6eb',
      },
    });
  };

  const wrapperClass =
    selectedTheme === 'pastebin-cream'
      ? 'bg-[#faf6eb] border-slate-200'
      : 'bg-[#ffffff] border-slate-200';

  return (
    <div className={`w-full border overflow-hidden shadow-inner ${wrapperClass}`}>
      <Editor
        height="400px"
        language={language}
        value={value}
        onChange={onChange}
        theme={selectedTheme}
        beforeMount={handleEditorWillMount}
        onMount={onMount}
        loading={
          <div className="flex h-[400px] w-full items-center justify-center font-mono text-xs text-slate-400">
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
