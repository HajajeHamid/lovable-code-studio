import React, { useState, useCallback, useMemo } from 'react';
import { FileCode, Eye, Code, Zap, Database, Server, Globe, Rocket, GitBranch, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  TPFile, 
  TPBlock, 
  BlockInstance,
  TP_BLOCKS_LIBRARY,
  createBlockInstance,
  generateTPCode,
  validateTPFile,
  ValidationResult,
  FILE_TYPES
} from '@/lib/tpBlocks';
import EditorHeader from './EditorHeader';
import FileTabs from './FileTabs';
import BlockPalette from './BlockPalette';
import BlockEditor from './BlockEditor';
import CodePreview from './CodePreview';
import ValidationPanel from './ValidationPanel';
import NewFileDialog from './NewFileDialog';
import GenerationPanel from './GenerationPanel';
import ActionToolbar from './ActionToolbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createDefaultFile = (type: 'database' | 'backend' | 'frontend', suffix = ''): TPFile => ({
  id: generateFileId(),
  name: FILE_TYPES[type].extension.replace('.tp', `${suffix}.tp`),
  type,
  blocks: [],
  modified: false,
});

const TPEditor: React.FC = () => {
  // Files state
  const [files, setFiles] = useState<TPFile[]>([
    createDefaultFile('database'),
    createDefaultFile('backend'),
    createDefaultFile('frontend'),
  ]);
  const [activeFileId, setActiveFileId] = useState(files[0].id);
  
  // UI state
  const [viewMode, setViewMode] = useState<'blocks' | 'preview'>('blocks');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showGenerationPanel, setShowGenerationPanel] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Get active file
  const activeFile = useMemo(
    () => files.find(f => f.id === activeFileId) || files[0],
    [files, activeFileId]
  );

  // Total blocks count
  const totalBlocks = useMemo(
    () => files.reduce((acc, file) => acc + file.blocks.length, 0),
    [files]
  );

  // File operations
  const handleSelectFile = useCallback((fileId: string) => {
    setActiveFileId(fileId);
    setValidationResult(null);
  }, []);

  const handleCloseFile = useCallback((fileId: string) => {
    if (files.length <= 1) {
      toast.error('Impossible de fermer le dernier fichier');
      return;
    }
    
    const fileIndex = files.findIndex(f => f.id === fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
    
    if (activeFileId === fileId) {
      const newIndex = Math.max(0, fileIndex - 1);
      setActiveFileId(files[newIndex === fileIndex ? 0 : newIndex].id);
    }
  }, [files, activeFileId]);

  const handleNewFile = useCallback(() => {
    setShowNewFileDialog(true);
  }, []);

  const handleCreateFile = useCallback((type: 'database' | 'backend' | 'frontend') => {
    const existingCount = files.filter(f => f.type === type).length;
    const suffix = existingCount > 0 ? `_${existingCount + 1}` : '';
    const newFile = createDefaultFile(type, suffix);
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    toast.success(`Fichier ${newFile.name} créé`);
  }, [files]);

  // Block operations
  const handleAddBlock = useCallback((type: string, blockDef: TPBlock) => {
    const newBlock = createBlockInstance(type, blockDef);
    
    setFiles(prev => prev.map(file => 
      file.id === activeFileId 
        ? { ...file, blocks: [...file.blocks, newBlock], modified: true }
        : file
    ));
    
    toast.success(`Bloc ${type} ajouté`);
  }, [activeFileId]);

  const handleUpdateBlockParam = useCallback((blockId: string, param: string, value: string) => {
    setFiles(prev => prev.map(file => 
      file.id === activeFileId 
        ? {
            ...file,
            blocks: file.blocks.map(block =>
              block.id === blockId
                ? { ...block, params: { ...block.params, [param]: value } }
                : block
            ),
            modified: true,
          }
        : file
    ));
  }, [activeFileId]);

  const handleRemoveBlock = useCallback((blockId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === activeFileId 
        ? { ...file, blocks: file.blocks.filter(b => b.id !== blockId), modified: true }
        : file
    ));
    toast.info('Bloc supprimé');
  }, [activeFileId]);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    const block = activeFile.blocks.find(b => b.id === blockId);
    if (!block) return;

    const duplicated: BlockInstance = {
      ...block,
      id: `${block.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      params: { ...block.params },
    };

    setFiles(prev => prev.map(file => 
      file.id === activeFileId 
        ? { ...file, blocks: [...file.blocks, duplicated], modified: true }
        : file
    ));
    toast.success('Bloc dupliqué');
  }, [activeFile, activeFileId]);

  const handleToggleBlockCollapse = useCallback((blockId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === activeFileId 
        ? {
            ...file,
            blocks: file.blocks.map(block =>
              block.id === blockId
                ? { ...block, collapsed: !block.collapsed }
                : block
            ),
          }
        : file
    ));
  }, [activeFileId]);

  // Export operations
  const handleExportFile = useCallback((file: TPFile) => {
    const code = generateTPCode(file);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${file.name} exporté`);
  }, []);

  const handleExportAll = useCallback(() => {
    files.forEach(file => {
      if (file.blocks.length > 0) {
        handleExportFile(file);
      }
    });
  }, [files, handleExportFile]);

  // Import operation
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // For now, just create a new file
        toast.info('Importation en cours de développement');
      }
    };
    input.click();
  }, []);

  // Validation
  const handleValidateFile = useCallback(() => {
    const result = validateTPFile(activeFile);
    setValidationResult(result);
    
    if (result.valid && result.warnings.length === 0) {
      toast.success('Validation réussie !');
    } else if (result.errors.length > 0) {
      toast.error(`${result.errors.length} erreur(s) détectée(s)`);
    } else {
      toast.warning(`${result.warnings.length} avertissement(s)`);
    }
  }, [activeFile]);

  const handleValidateAll = useCallback(() => {
    let totalErrors = 0;
    let totalWarnings = 0;

    files.forEach(file => {
      const result = validateTPFile(file);
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    });

    if (totalErrors === 0 && totalWarnings === 0) {
      toast.success('Tous les fichiers sont valides !');
    } else {
      toast.warning(`${totalErrors} erreur(s), ${totalWarnings} avertissement(s) au total`);
    }
  }, [files]);

  // Validate relations between files
  const handleValidateRelations = useCallback(() => {
    const issues: string[] = [];
    
    const databaseFile = files.find(f => f.type === 'database');
    const backendFile = files.find(f => f.type === 'backend');
    const frontendFile = files.find(f => f.type === 'frontend');
    
    const dataModels = databaseFile?.blocks.filter(b => b.type === '@DataModel').map(b => b.params.name) || [];
    
    if (backendFile && dataModels.length > 0) {
      const backendContent = JSON.stringify(backendFile.blocks);
      dataModels.forEach(model => {
        if (model && !backendContent.includes(model)) {
          issues.push(`Modèle "${model}" non utilisé dans le backend`);
        }
      });
    }
    
    if (frontendFile && dataModels.length > 0) {
      const frontendContent = JSON.stringify(frontendFile.blocks);
      dataModels.forEach(model => {
        if (model && !frontendContent.includes(model)) {
          issues.push(`Modèle "${model}" non référencé dans le frontend`);
        }
      });
    }
    
    if (issues.length === 0) {
      toast.success('Toutes les relations sont valides !');
    } else {
      toast.warning(`${issues.length} problème(s) de relation détecté(s)`);
    }
  }, [files]);

  // Open generation panel
  const handleOpenGeneration = useCallback(() => {
    setShowGenerationPanel(true);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <EditorHeader
        totalBlocks={totalBlocks}
        onExportAll={handleExportAll}
        onImport={handleImport}
        onValidateAll={handleValidateAll}
      />

      <FileTabs
        files={files}
        activeFileId={activeFileId}
        onSelectFile={handleSelectFile}
        onCloseFile={handleCloseFile}
        onNewFile={handleNewFile}
      />

      {/* Action Toolbar - NEW */}
      <ActionToolbar
        onValidate={handleValidateFile}
        onValidateRelations={handleValidateRelations}
        onGenerate={handleOpenGeneration}
        onExport={handleExportAll}
        hasBlocks={totalBlocks > 0}
      />

      <div className="flex-1 flex overflow-hidden">
        <BlockPalette
          fileType={activeFile.type}
          onAddBlock={handleAddBlock}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/30">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                activeFile.type === 'database' && 'bg-block-data/20 text-block-data',
                activeFile.type === 'backend' && 'bg-block-backend/20 text-block-backend',
                activeFile.type === 'frontend' && 'bg-block-frontend/20 text-block-frontend'
              )}>
                {activeFile.type === 'database' && <Database className="w-4 h-4" />}
                {activeFile.type === 'backend' && <Server className="w-4 h-4" />}
                {activeFile.type === 'frontend' && <Globe className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{activeFile.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {activeFile.blocks.length} bloc(s) · {FILE_TYPES[activeFile.type].label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'blocks' | 'preview')}>
                <TabsList className="h-8">
                  <TabsTrigger value="blocks" className="text-xs px-3">
                    <FileCode className="w-3.5 h-3.5 mr-1.5" />
                    Blocs
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs px-3">
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Aperçu
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                size="sm"
                onClick={handleValidateFile}
                className="text-xs gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Valider
              </Button>

              <Button
                variant="glow"
                size="sm"
                onClick={handleOpenGeneration}
                className="text-xs gap-1.5"
              >
                <Rocket className="w-3.5 h-3.5" />
                Générer
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'blocks' ? (
              <ScrollArea className="h-full">
                <div className="p-4">
                  {activeFile.blocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                        <FileCode className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Fichier vide
                      </h3>
                      <p className="text-muted-foreground max-w-sm mb-4">
                        Commencez par ajouter des blocs depuis la palette à gauche pour construire votre fichier TP.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const firstBlock = Object.entries(TP_BLOCKS_LIBRARY).find(
                              ([_, block]) => block.fileTypes.includes(activeFile.type)
                            );
                            if (firstBlock) {
                              handleAddBlock(firstBlock[0], firstBlock[1]);
                            }
                          }}
                        >
                          Ajouter un bloc
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-4xl">
                      {activeFile.blocks.map((block, index) => (
                        <BlockEditor
                          key={block.id}
                          block={block}
                          index={index}
                          onUpdateParam={handleUpdateBlockParam}
                          onRemove={handleRemoveBlock}
                          onDuplicate={handleDuplicateBlock}
                          onToggleCollapse={handleToggleBlockCollapse}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-full p-4">
                <CodePreview file={activeFile} />
              </div>
            )}
          </div>

          {/* Validation panel */}
          {validationResult && (
            <ValidationPanel
              result={validationResult}
              onClose={() => setValidationResult(null)}
            />
          )}
        </main>
      </div>

      <NewFileDialog
        open={showNewFileDialog}
        onOpenChange={setShowNewFileDialog}
        onCreateFile={handleCreateFile}
      />

      {/* Generation Panel - NEW */}
      {showGenerationPanel && (
        <GenerationPanel
          files={files}
          onClose={() => setShowGenerationPanel(false)}
        />
      )}
    </div>
  );
};

export default TPEditor;
