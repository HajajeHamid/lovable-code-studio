import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  ChevronRight,
  ChevronDown,
  Download,
  Trash2,
  Copy,
  Eye,
  Package
} from 'lucide-react';
import { useChatDevStore } from '../../stores/chatdevStore';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

export default function FileExplorer() {
  const { generatedFiles, projectSpec } = useChatDevStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'preview'>('tree');

  // Construire l'arbre de fichiers
  const fileTree = useMemo(() => {
    const root: FileNode = {
      name: projectSpec?.name || 'project',
      path: '/',
      type: 'folder',
      children: [],
    };

    const files = Array.from(generatedFiles.entries());
    
    for (const [path, content] of files) {
      const parts = path.split('/').filter(Boolean);
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        const fullPath = '/' + parts.slice(0, i + 1).join('/');

        if (isFile) {
          current.children = current.children || [];
          current.children.push({
            name: part,
            path: fullPath,
            type: 'file',
            content,
          });
        } else {
          current.children = current.children || [];
          let folder = current.children.find(c => c.name === part && c.type === 'folder');
          if (!folder) {
            folder = {
              name: part,
              path: fullPath,
              type: 'folder',
              children: [],
            };
            current.children.push(folder);
          }
          current = folder;
        }
      }
    }

    // Trier: dossiers d'abord, puis fichiers
    const sortChildren = (node: FileNode) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortChildren);
      }
    };
    sortChildren(root);

    return root;
  }, [generatedFiles, projectSpec]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleExportAll = () => {
    const files = Array.from(generatedFiles.entries());
    const content = files
      .map(([path, content]) => `// ========== ${path} ==========\n${content}`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectSpec?.name || 'project'}-export.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyFile = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    const icons: Record<string, React.ReactNode> = {
      ts: <FileCode className="w-4 h-4 text-blue-400" />,
      tsx: <FileCode className="w-4 h-4 text-blue-400" />,
      js: <FileCode className="w-4 h-4 text-yellow-400" />,
      jsx: <FileCode className="w-4 h-4 text-yellow-400" />,
      py: <FileCode className="w-4 h-4 text-green-400" />,
      json: <FileJson className="w-4 h-4 text-orange-400" />,
      md: <FileText className="w-4 h-4 text-gray-400" />,
    };
    return icons[ext || ''] || <FileText className="w-4 h-4 text-gray-400" />;
  };

  const selectedContent = selectedFile ? generatedFiles.get(selectedFile.slice(1)) : null;

  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Fichiers Générés</h3>
          <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-400">
            {generatedFiles.size}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'tree' ? 'preview' : 'tree')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'preview' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-700 text-gray-400'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportAll}
            disabled={generatedFiles.size === 0}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree */}
        <div className={`${viewMode === 'preview' && selectedFile ? 'w-1/3' : 'w-full'} border-r border-gray-700 overflow-auto p-2`}>
          {generatedFiles.size === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun fichier généré</p>
              <p className="text-sm mt-1">Utilisez le chat pour générer du code</p>
            </div>
          ) : (
            <FileTreeNode
              node={fileTree}
              level={0}
              expandedFolders={expandedFolders}
              selectedFile={selectedFile}
              onToggleFolder={toggleFolder}
              onSelectFile={(path) => {
                setSelectedFile(path);
                setViewMode('preview');
              }}
              getFileIcon={getFileIcon}
            />
          )}
        </div>

        {/* File Preview */}
        {viewMode === 'preview' && selectedFile && selectedContent && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
              <span className="text-sm text-gray-300 font-mono truncate">
                {selectedFile}
              </span>
              <button
                onClick={() => handleCopyFile(selectedContent)}
                className="p-1.5 hover:bg-gray-700 rounded"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-950">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                <code>{selectedContent}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant récursif pour l'arbre
function FileTreeNode({
  node,
  level,
  expandedFolders,
  selectedFile,
  onToggleFolder,
  onSelectFile,
  getFileIcon,
}: {
  node: FileNode;
  level: number;
  expandedFolders: Set<string>;
  selectedFile: string | null;
  onToggleFolder: (path: string) => void;
  onSelectFile: (path: string) => void;
  getFileIcon: (name: string) => React.ReactNode;
}) {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedFile === node.path;
  const paddingLeft = level * 16;

  if (node.type === 'folder') {
    return (
      <div>
        <div
          className="flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-gray-800/50 transition-colors"
          style={{ paddingLeft }}
          onClick={() => onToggleFolder(node.path)}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-yellow-400" />
          ) : (
            <Folder className="w-4 h-4 text-yellow-400" />
          )}
          <span className="text-sm text-gray-300">{node.name}</span>
        </div>

        <AnimatePresence>
          {isExpanded && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {node.children.map((child) => (
                <FileTreeNode
                  key={child.path}
                  node={child}
                  level={level + 1}
                  expandedFolders={expandedFolders}
                  selectedFile={selectedFile}
                  onToggleFolder={onToggleFolder}
                  onSelectFile={onSelectFile}
                  getFileIcon={getFileIcon}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-600/20 text-blue-300' : 'hover:bg-gray-800/50 text-gray-400'
      }`}
      style={{ paddingLeft: paddingLeft + 16 }}
      onClick={() => onSelectFile(node.path)}
    >
      {getFileIcon(node.name)}
      <span className="text-sm truncate">{node.name}</span>
    </div>
  );
}
