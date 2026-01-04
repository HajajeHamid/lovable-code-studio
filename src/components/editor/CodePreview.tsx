import React, { useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TPFile, generateTPCode } from '@/lib/tpBlocks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CodePreviewProps {
  file: TPFile;
}

// Simple syntax highlighter for TP code
const highlightTPCode = (code: string): React.ReactNode[] => {
  const lines = code.split('\n');
  
  return lines.map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Comments
    const commentMatch = line.match(/\/\/.*/);
    if (commentMatch) {
      const commentStart = line.indexOf('//');
      if (commentStart > 0) {
        parts.push(
          <span key={`pre-${lineIndex}`}>
            {highlightLine(line.substring(0, commentStart))}
          </span>
        );
      }
      parts.push(
        <span key={`comment-${lineIndex}`} className="text-syntax-comment italic">
          {commentMatch[0]}
        </span>
      );
      return (
        <div key={lineIndex} className="leading-relaxed">
          {parts.length > 0 ? parts : <span>&nbsp;</span>}
        </div>
      );
    }

    return (
      <div key={lineIndex} className="leading-relaxed">
        {line ? highlightLine(line) : <span>&nbsp;</span>}
      </div>
    );
  });
};

const highlightLine = (line: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Decorators (@Something)
  const decoratorRegex = /@\w+/g;
  let lastIndex = 0;
  let match;

  while ((match = decoratorRegex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++}>
          {highlightNonDecorator(remaining.substring(lastIndex, match.index))}
        </span>
      );
    }
    parts.push(
      <span key={key++} className="text-syntax-decorator font-semibold">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < remaining.length) {
    parts.push(
      <span key={key++}>
        {highlightNonDecorator(remaining.substring(lastIndex))}
      </span>
    );
  }

  return parts;
};

const highlightNonDecorator = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Split and highlight
  const regex = /(".*?"|'.*?'|\b\d+\b|\b(true|false|null)\b|\b(for|if|else|return|extends)\b|[{}[\]:,])/g;
  let lastIndex = 0;
  let match;
  
  const temp = text;
  while ((match = regex.exec(temp)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{temp.substring(lastIndex, match.index)}</span>);
    }

    const token = match[0];
    if (token.startsWith('"') || token.startsWith("'")) {
      parts.push(
        <span key={key++} className="text-syntax-string">
          {token}
        </span>
      );
    } else if (/^\d+$/.test(token)) {
      parts.push(
        <span key={key++} className="text-syntax-number">
          {token}
        </span>
      );
    } else if (['true', 'false', 'null'].includes(token)) {
      parts.push(
        <span key={key++} className="text-syntax-keyword">
          {token}
        </span>
      );
    } else if (['for', 'if', 'else', 'return', 'extends'].includes(token)) {
      parts.push(
        <span key={key++} className="text-syntax-keyword font-semibold">
          {token}
        </span>
      );
    } else if (['{', '}', '[', ']', ':', ','].includes(token)) {
      parts.push(
        <span key={key++} className="text-syntax-bracket">
          {token}
        </span>
      );
    } else {
      parts.push(<span key={key++}>{token}</span>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < temp.length) {
    parts.push(<span key={key++}>{temp.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
};

const CodePreview: React.FC<CodePreviewProps> = ({ file }) => {
  const [copied, setCopied] = React.useState(false);
  
  const code = useMemo(() => generateTPCode(file), [file]);
  const highlightedCode = useMemo(() => highlightTPCode(code), [code]);
  const lineCount = code.split('\n').length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-muted/30 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <span className="text-sm text-muted-foreground font-mono">
            {file.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {lineCount} lignes
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1 text-success" />
              Copié
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copier
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex">
          {/* Line numbers */}
          <div className="flex-shrink-0 py-4 pr-4 pl-4 text-right select-none border-r border-border/50 bg-muted/20">
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground font-mono leading-relaxed"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code */}
          <pre className="flex-1 py-4 px-4 overflow-x-auto">
            <code className="text-sm font-mono text-foreground">
              {highlightedCode}
            </code>
          </pre>
        </div>
      </ScrollArea>
    </div>
  );
};

export default CodePreview;
