// ProjectStructureTab.tsx - Visualisation de la structure du projet généré
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FolderOpen, File, FileCode, FileJson, FileText, 
  ChevronRight, ChevronDown, Eye, Copy, Check, AlertCircle,
  Database, Layout, Server, Code2
} from 'lucide-react';
import { useStudioStore } from '@/stores/studioStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Editor from '@monaco-editor/react';
import { toast } from '@/components/ui/sonner';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  extension?: string;
  content?: string;
  children?: FileNode[];
  blockSource?: string;
  status?: 'generated' | 'pending' | 'error';
}

const getFileIcon = (extension?: string) => {
  switch (extension) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode className="w-4 h-4 text-blue-500" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-500" />;
    case 'sql':
      return <Database className="w-4 h-4 text-green-500" />;
    case 'css':
    case 'scss':
      return <Layout className="w-4 h-4 text-pink-500" />;
    case 'md':
      return <FileText className="w-4 h-4 text-gray-500" />;
    default:
      return <File className="w-4 h-4 text-muted-foreground" />;
  }
};

interface TreeItemProps {
  node: FileNode;
  depth?: number;
  onSelect: (node: FileNode) => void;
  selectedPath: string | null;
}

function TreeItem({ node, depth = 0, onSelect, selectedPath }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isSelected = selectedPath === node.path;
  const hasChildren = node.type === 'folder' && node.children && node.children.length > 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
          isSelected && "bg-primary/10 text-primary",
          depth > 0 && `ml-${depth * 4}`
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (node.type === 'folder') {
            setIsOpen(!isOpen);
          } else {
            onSelect(node);
          }
        }}
      >
        {node.type === 'folder' ? (
          <>
            {hasChildren ? (
              isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : <span className="w-4" />}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-yellow-500" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-500" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            {getFileIcon(node.extension)}
          </>
        )}
        <span className="text-sm truncate flex-1">{node.name}</span>
        
        {node.status && (
          <Badge 
            variant={node.status === 'generated' ? 'success' : node.status === 'error' ? 'destructive' : 'secondary'}
            className="text-[10px] px-1.5"
          >
            {node.status === 'generated' ? '✓' : node.status === 'error' ? '!' : '...'}
          </Badge>
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {node.children!.map((child, i) => (
              <TreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                onSelect={onSelect}
                selectedPath={selectedPath}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProjectStructureTab() {
  const { blocks, parseResult } = useStudioStore();
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate file structure from blocks
  const fileStructure = useMemo<FileNode>(() => {
    const root: FileNode = {
      name: 'projet',
      type: 'folder',
      path: '/',
      children: []
    };

    // Source folder
    const src: FileNode = {
      name: 'src',
      type: 'folder',
      path: '/src',
      children: []
    };

    // Models folder
    const models: FileNode = {
      name: 'models',
      type: 'folder',
      path: '/src/models',
      children: []
    };

    // Components folder
    const components: FileNode = {
      name: 'components',
      type: 'folder',
      path: '/src/components',
      children: []
    };

    // API folder
    const api: FileNode = {
      name: 'api',
      type: 'folder',
      path: '/src/api',
      children: []
    };

    // Pages folder
    const pages: FileNode = {
      name: 'pages',
      type: 'folder',
      path: '/src/pages',
      children: []
    };

    // Database folder
    const database: FileNode = {
      name: 'database',
      type: 'folder',
      path: '/src/database',
      children: []
    };

    // Process blocks
    blocks.forEach(block => {
      const name = block.values?.name || block.name || block.typeId;
      
      switch (block.typeId) {
        case 'model':
        case 'dataJson':
          models.children!.push({
            name: `${name}.ts`,
            type: 'file',
            path: `/src/models/${name}.ts`,
            extension: 'ts',
            status: 'generated',
            blockSource: block.id,
            content: generateModelContent(block)
          });
          break;
        case 'component':
          components.children!.push({
            name: `${name}.tsx`,
            type: 'file',
            path: `/src/components/${name}.tsx`,
            extension: 'tsx',
            status: 'generated',
            blockSource: block.id,
            content: generateComponentContent(block)
          });
          break;
        case 'page':
          pages.children!.push({
            name: `${name}.tsx`,
            type: 'file',
            path: `/src/pages/${name}.tsx`,
            extension: 'tsx',
            status: 'generated',
            blockSource: block.id,
            content: generatePageContent(block)
          });
          break;
        case 'api':
        case 'endpoint':
          api.children!.push({
            name: `${name}.ts`,
            type: 'file',
            path: `/src/api/${name}.ts`,
            extension: 'ts',
            status: 'generated',
            blockSource: block.id,
            content: generateApiContent(block)
          });
          break;
        case 'enum':
          models.children!.push({
            name: `${name}.enum.ts`,
            type: 'file',
            path: `/src/models/${name}.enum.ts`,
            extension: 'ts',
            status: 'generated',
            blockSource: block.id,
            content: generateEnumContent(block)
          });
          break;
      }

      // Process children recursively
      if (block.children) {
        block.children.forEach(child => {
          // Handle nested blocks
        });
      }
    });

    // Add index files
    if (models.children!.length > 0) {
      models.children!.unshift({
        name: 'index.ts',
        type: 'file',
        path: '/src/models/index.ts',
        extension: 'ts',
        status: 'generated',
        content: models.children!.filter(f => f.name !== 'index.ts').map(f => 
          `export * from './${f.name.replace('.ts', '')}';`
        ).join('\n')
      });
    }

    // Build structure
    if (models.children!.length > 0) src.children!.push(models);
    if (components.children!.length > 0) src.children!.push(components);
    if (pages.children!.length > 0) src.children!.push(pages);
    if (api.children!.length > 0) src.children!.push(api);
    if (database.children!.length > 0) src.children!.push(database);

    // Add config files
    root.children!.push(src);
    root.children!.push({
      name: 'package.json',
      type: 'file',
      path: '/package.json',
      extension: 'json',
      status: 'generated',
      content: JSON.stringify({
        name: 'generated-project',
        version: '1.0.0',
        dependencies: {}
      }, null, 2)
    });
    root.children!.push({
      name: 'tsconfig.json',
      type: 'file',
      path: '/tsconfig.json',
      extension: 'json',
      status: 'generated',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          strict: true
        }
      }, null, 2)
    });

    return root;
  }, [blocks]);

  const handleCopy = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      toast.success('Copié !');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalFiles = useMemo(() => {
    const count = (node: FileNode): number => {
      if (node.type === 'file') return 1;
      return (node.children || []).reduce((sum, child) => sum + count(child), 0);
    };
    return count(fileStructure);
  }, [fileStructure]);

  return (
    <div className="h-full flex">
      {/* File tree */}
      <div className="w-72 border-r flex flex-col">
        <div className="p-3 border-b bg-card/50">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Structure du Projet</h3>
            <Badge variant="secondary" className="text-xs">
              {totalFiles} fichiers
            </Badge>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            <TreeItem
              node={fileStructure}
              onSelect={setSelectedFile}
              selectedPath={selectedFile?.path || null}
            />
          </div>
        </ScrollArea>
      </div>

      {/* File preview */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="p-3 border-b bg-card/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile.extension)}
                <span className="font-medium text-sm">{selectedFile.path}</span>
                {selectedFile.status && (
                  <Badge 
                    variant={selectedFile.status === 'generated' ? 'success' : 'secondary'}
                    className="text-xs"
                  >
                    {selectedFile.status === 'generated' ? 'Généré' : 'En attente'}
                  </Badge>
                )}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copier le contenu</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language={selectedFile.extension === 'json' ? 'json' : 'typescript'}
                theme="vs-dark"
                value={selectedFile.content || '// Contenu non disponible'}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Sélectionnez un fichier</p>
              <p className="text-sm">Cliquez sur un fichier pour voir son contenu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for content generation
function generateModelContent(block: any): string {
  const name = block.values?.name || block.name || 'Model';
  const fields = block.values?.fields || [];
  
  let content = `// ${name} - Generated from TP Block\n\n`;
  content += `export interface ${name} {\n`;
  
  if (Array.isArray(fields)) {
    fields.forEach((field: any) => {
      const fieldName = field.name || 'field';
      const fieldType = field.dataType || field.type || 'string';
      const optional = !field.isRequired ? '?' : '';
      content += `  ${fieldName}${optional}: ${mapType(fieldType)};\n`;
    });
  }
  
  content += `}\n`;
  return content;
}

function generateComponentContent(block: any): string {
  const name = block.values?.name || block.name || 'Component';
  
  return `// ${name} Component - Generated from TP Block
import React from 'react';

interface ${name}Props {
  // Props will be generated based on block configuration
}

export function ${name}({ }: ${name}Props) {
  return (
    <div className="${name.toLowerCase()}">
      <h2>${name}</h2>
      {/* Component content */}
    </div>
  );
}

export default ${name};
`;
}

function generatePageContent(block: any): string {
  const name = block.values?.name || block.name || 'Page';
  const path = block.values?.path || `/${name.toLowerCase()}`;
  
  return `// ${name} Page - Generated from TP Block
import React from 'react';

interface ${name}PageProps {
  // Props
}

export function ${name}Page({ }: ${name}PageProps) {
  return (
    <div className="page ${name.toLowerCase()}-page">
      <h1>${name}</h1>
      {/* Page content - route: ${path} */}
    </div>
  );
}

export default ${name}Page;
`;
}

function generateApiContent(block: any): string {
  const name = block.values?.name || block.name || 'api';
  const endpoints = block.values?.endpoints || [];
  
  let content = `// ${name} API - Generated from TP Block
import { Router } from 'express';

const router = Router();

`;

  if (Array.isArray(endpoints)) {
    endpoints.forEach((ep: any) => {
      const method = (ep.method || 'GET').toLowerCase();
      const path = ep.path || '/';
      content += `router.${method}('${path}', async (req, res) => {
  // Handler for ${method.toUpperCase()} ${path}
  res.json({ success: true });
});

`;
    });
  }

  content += `export default router;\n`;
  return content;
}

function generateEnumContent(block: any): string {
  const name = block.values?.name || block.name || 'Enum';
  const values = block.values?.values || [];
  
  let content = `// ${name} Enum - Generated from TP Block\n\n`;
  content += `export enum ${name} {\n`;
  
  if (Array.isArray(values)) {
    values.forEach((val: any) => {
      const valueName = val.name || val;
      const valueVal = val.value || valueName;
      content += `  ${valueName} = '${valueVal}',\n`;
    });
  }
  
  content += `}\n`;
  return content;
}

function mapType(type: string): string {
  const typeMap: Record<string, string> = {
    'String': 'string',
    'Int': 'number',
    'Float': 'number',
    'Decimal': 'number',
    'Boolean': 'boolean',
    'DateTime': 'Date',
    'Json': 'Record<string, any>',
    'Bytes': 'Buffer',
  };
  return typeMap[type] || type.toLowerCase();
}
