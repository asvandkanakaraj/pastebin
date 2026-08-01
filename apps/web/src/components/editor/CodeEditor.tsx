import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  editorTheme?: 'vs-dark' | 'light';
  lineNumbers?: 'on' | 'off';
  tabSize?: number;
  height?: string;
  onMount?: (editor: any, monaco: any) => void;
}

export function CodeEditor({
  value,
  onChange,
  language,
  editorTheme,
  lineNumbers = 'on',
  tabSize = 2,
  height,
  onMount,
}: CodeEditorProps) {
  // Resolve base theme mapping
  const currentTheme = editorTheme || 'vs-dark';
  const selectedTheme = currentTheme === 'light' ? 'pastebin-light' : 'pastebin-dark';

  const handleEditorWillMount = (monaco: any) => {
    // Custom premium dark theme matching the mockup
    monaco.editor.defineTheme('pastebin-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '3b82f6', fontStyle: 'bold' },
        { token: 'string', foreground: '38bdf8' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'type', foreground: '10b981' },
      ],
      colors: {
        'editor.background': '#0f172a', // Deep Slate-900
        'editor.foreground': '#cbd5e1',
        'editor.lineHighlightBackground': '#1e293b60',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editorGutter.background': '#0f172a',
      },
    });

    // Custom premium light theme matching the mockup
    monaco.editor.defineTheme('pastebin-light', {
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
  };

  const wrapperClass =
    selectedTheme === 'pastebin-light'
      ? 'bg-[#ffffff] border-slate-200'
      : 'bg-[#0f172a] border-slate-800';

  return (
    <div
      className={`w-full border overflow-hidden shadow-inner flex-1 flex flex-col ${wrapperClass}`}
    >
      <Editor
        height={height || '400px'}
        language={language}
        value={value}
        onChange={onChange}
        theme={selectedTheme}
        beforeMount={handleEditorWillMount}
        onMount={onMount}
        loading={
          <div
            style={{ height: height || '400px' }}
            className="flex w-full items-center justify-center font-mono text-xs text-slate-400"
          >
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
