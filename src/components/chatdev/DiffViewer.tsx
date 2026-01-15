import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Check, 
  X, 
  Copy, 
  Download,
  FileCode,
  Plus,
  Minus
} from 'lucide-react';
import { Diff } from '../../stores/chatdevStore';
import { useChatDevStore } from '../../stores/chatdevStore';

interface DiffViewerProps {
  diffs: Diff[];
  onApprove?: (file: string) => void;
  onReject?: (file: string) => void;
}

export default function DiffViewer({ diffs, onApprove, onReject }: DiffViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const { addGeneratedFile } = useChatDevStore();

  const toggleFile = (file: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(file)) {
      newExpanded.delete(file);
    } else {
      newExpanded.add(file);
    }
    setExpandedFiles(newExpanded);
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  const handleApprove = (diff: Diff) => {
    addGeneratedFile(diff.file, diff.modified);
    onApprove?.(diff.file);
  };

  const getLanguageColor = (lang?: string): string => {
    const colors: Record<string, string> = {
      typescript: 'text-blue-400',
      javascript: 'text-yellow-400',
      python: 'text-green-400',
      json: 'text-orange-400',
      html: 'text-red-400',
      css: 'text-purple-400',
      sql: 'text-cyan-400',
    };
    return colors[lang || ''] || 'text-gray-400';
  };

  return (
    <div className="space-y-2">
      {diffs.map((diff) => (
        <div
          key={diff.file}
          className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
            onClick={() => toggleFile(diff.file)}
          >
            <div className="flex items-center gap-2">
              {expandedFiles.has(diff.file) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <FileCode className={`w-4 h-4 ${getLanguageColor(diff.language)}`} />
              <span className="text-sm text-gray-200 font-mono">{diff.file}</span>
              {diff.original ? (
                <span className="text-xs px-1.5 py-0.5 bg-yellow-600/20 text-yellow-300 rounded">
                  Modifié
                </span>
              ) : (
                <span className="text-xs px-1.5 py-0.5 bg-green-600/20 text-green-300 rounded">
                  Nouveau
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Status indicator */}
              {diff.status === 'approved' && (
                <Check className="w-4 h-4 text-green-400" />
              )}
              {diff.status === 'rejected' && (
                <X className="w-4 h-4 text-red-400" />
              )}

              {/* Actions */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(diff.modified);
                }}
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="Copier"
              >
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              </button>
              
              {diff.status === 'pending' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(diff);
                    }}
                    className="p-1.5 hover:bg-green-600/20 rounded transition-colors"
                    title="Approuver"
                  >
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject?.(diff.file);
                    }}
                    className="p-1.5 hover:bg-red-600/20 rounded transition-colors"
                    title="Rejeter"
                  >
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {expandedFiles.has(diff.file) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-700 overflow-hidden"
              >
                {diff.original ? (
                  <SideBySideDiff original={diff.original} modified={diff.modified} />
                ) : (
                  <div className="p-4 max-h-80 overflow-auto">
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                      <code>{diff.modified}</code>
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// Diff côte à côte simplifié
function SideBySideDiff({ original, modified }: { original: string; modified: string }) {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  const maxLines = Math.max(originalLines.length, modifiedLines.length);

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-700 max-h-80 overflow-auto">
      {/* Original */}
      <div className="p-2 bg-red-900/10">
        <div className="text-xs text-red-400 mb-2 font-medium">Original</div>
        <pre className="text-xs font-mono">
          {originalLines.map((line, i) => (
            <div
              key={i}
              className={`px-2 py-0.5 ${
                line !== modifiedLines[i] ? 'bg-red-900/30 text-red-300' : 'text-gray-400'
              }`}
            >
              <span className="text-gray-600 mr-2 select-none">{i + 1}</span>
              {line || ' '}
            </div>
          ))}
        </pre>
      </div>

      {/* Modified */}
      <div className="p-2 bg-green-900/10">
        <div className="text-xs text-green-400 mb-2 font-medium">Modifié</div>
        <pre className="text-xs font-mono">
          {modifiedLines.map((line, i) => (
            <div
              key={i}
              className={`px-2 py-0.5 ${
                line !== originalLines[i] ? 'bg-green-900/30 text-green-300' : 'text-gray-400'
              }`}
            >
              <span className="text-gray-600 mr-2 select-none">{i + 1}</span>
              {line || ' '}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
