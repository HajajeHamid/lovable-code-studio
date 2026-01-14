// StudioLayout.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Blocks, Code2, Eye, Download, Upload,
  Zap, PanelLeftClose, PanelLeft, FileCode,
  AlertCircle, CheckCircle, Activity, Play, ShieldCheck,
  GitBranch, FolderTree, Undo2, Redo2, Bot, Plus,
  MessageSquare, Settings, History
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudioStore } from '@/stores/studioStore';
import { BlockPalette } from './BlockPalette';
import { BlockCanvas } from './BlockCanvas';
import { ProjectStructureTab } from './ProjectStructureTab';
import { RelationsTreeTab } from './RelationsTreeTab';
import { BlockTypeEditor } from './BlockTypeEditor';
import { AIChatPanel } from './AIChatPanel';
import { TPFileImportButton } from './TPFileImportButton';
import { cn } from '@/lib/utils';
import { parseTP } from '@/lib/tp-parser';
import { generateTPCode } from '@/lib/blocks';
import Editor from '@monaco-editor/react';
import { toast } from '@/components/ui/sonner';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHotkeys } from 'react-hotkeys-hook';
const useProcessedStore = () => {
  const store = useStudioStore();

  return {
    activeTab: store.activeTab,
    setActiveTab: store.setActiveTab,
    sidebarOpen: store.sidebarOpen,
    toggleSidebar: store.toggleSidebar,
    tpCode: store.tpCode,
    setTPCode: store.setTPCode,
    parseResult: store.parseResult,
    setParseResult: store.setParseResult,
    blocks: store.blocks || [],
    undo: store.undo,
    redo: store.redo,
    canUndo: store.historyIndex > 0,
    canRedo: store.historyIndex < store.history.length - 1,
    historyIndex: store.historyIndex,
    historyLength: store.history.length,
  };
};
export function StudioLayout() {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    toggleSidebar,
    tpCode,
    setTPCode,
    blocks,
    parseResult,
    setParseResult,
    undo,
    redo,
    canUndo,
    canRedo,
    historyIndex,
    historyLength,
  } = useProcessedStore();
  
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Keyboard shortcuts for undo/redo
  useHotkeys('ctrl+z, cmd+z', () => {
    if (canUndo) {
      undo();
      toast.info('Action annulée');
    }
  }, [canUndo, undo]);

  useHotkeys('ctrl+shift+z, cmd+shift+z, ctrl+y, cmd+y', () => {
    if (canRedo) {
      redo();
      toast.info('Action rétablie');
    }
  }, [canRedo, redo]);

  // Sync blocks to TP code
  /*
  useEffect(() => {
    const subscription = useStudioStore.subscribe((state) => {
      useStudioStore.setState({
        canUndo: state.historyIndex > 0,
        canRedo: state.historyIndex < state.history.length - 1,
      });
    });

    return () => {
      //subscription.unsubscribe();
    };
  }, [useStudioStore.subscribe, useStudioStore.setState]);
  */
  useEffect(() => {
    const code = generateTPCode(blocks);
    if (code !== tpCode) {
      setTPCode(code);
    }
  }, [blocks, tpCode, setTPCode]);

  // Parse TP code when changed
  useEffect(() => {
    if (!tpCode?.trim()) {
      setParseResult(null);
      return;
    }

    const timeout = setTimeout(() => {
      try {
        const result = parseTP(tpCode);
        setParseResult(result);
        if (result.errors.length > 0) {
          toast.error('Erreurs de parsing détectées', {
            description: `${result.errors.length} erreur(s) trouvée(s). Vérifiez l'onglet Analyse.`,
          });
        } else if (result.warnings.length > 0) {
          toast.warning('Avertissements détectés', {
            description: `${result.warnings.length} avertissement(s). Consultez l'onglet Analyse.`,
          });
        }
      } catch (error) {
        console.error('Parsing error:', error);
        setParseResult(null);
        toast.error('Erreur de parsing', {
          description: 'Impossible de parser le code TP.',
        });
      }
    }, 300); // Debounce

    return () => clearTimeout(timeout);
  }, [tpCode, setParseResult]);

  const handleExport = () => {
    if (!tpCode?.trim()) {
      toast.error('Rien à exporter', {
        description: 'Le code TP est vide.',
      });
      return;
    }

    try {
      const blob = new Blob([tpCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${Date.now()}.tp`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export réussi', {
        description: 'Fichier .tp téléchargé.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur d\'export', {
        description: 'Impossible d\'exporter le fichier.',
      });
    }
  };

  const handleValidate = () => {
    setIsValidating(true);
    try {
      if (parseResult && parseResult.errors.length > 0) {
        toast.error(`${parseResult.errors.length} erreur(s) détectée(s)`, {
          description: parseResult.errors[0]?.message || 'Vérifiez l\'onglet Analyse.',
        });
        setActiveTab('analysis');
      } else if (parseResult && parseResult.warnings.length > 0) {
        toast.warning(`${parseResult.warnings.length} avertissement(s)`, {
          description: 'Le projet est valide avec des avertissements.',
        });
      } else {
        toast.success('Validation réussie !', {
          description: 'Aucune erreur détectée. Prêt à générer.',
        });
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    try {
      if (errorCount > 0) {
        toast.error('Impossible de générer', {
          description: 'Corrigez les erreurs avant de générer le projet.',
        });
        setActiveTab('analysis');
        return;
      }
      
      toast.success('Génération en cours...', {
        description: 'La structure du projet sera bientôt disponible.',
      });
      setActiveTab('preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const errorCount = parseResult?.errors?.length ?? 0;
  const warningCount = parseResult?.warnings?.length ?? 0;
  const stats = parseResult?.statistics;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-background overflow-hidden" >
        {/* Header Toolbar */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card/50 backdrop-blur-sm z-10 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{sidebarOpen ? 'Fermer palette' : 'Ouvrir palette'}</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex items-center">
            <TabsList variant="underline">
              <TabsTrigger value="canvas">
                <Blocks className="w-4 h-4 mr-2" />
                Canvas
                {blocks.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {blocks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code2 className="w-4 h-4 mr-2" />
                Code TP
              </TabsTrigger>
              <TabsTrigger value="structure">
                <FolderTree className="w-4 h-4 mr-2" />
                Structure
              </TabsTrigger>
              <TabsTrigger value="relations">
                <GitBranch className="w-4 h-4 mr-2" />
                Relations
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <Activity className="w-4 h-4 mr-2" />
                Analyse
                {errorCount > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">{errorCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex-1" />

          {/* Undo/Redo Buttons */}
          <div className="flex items-center gap-1 mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    if (canUndo) {
                      undo();
                      toast.info('Action annulée');
                    }
                  }}
                  disabled={!canUndo}
                  className="h-8 w-8"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Annuler (Ctrl+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    if (canRedo) {
                      redo();
                      toast.info('Action rétablie');
                    }
                  }}
                  disabled={!canRedo}
                  className="h-8 w-8"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rétablir (Ctrl+Shift+Z)</TooltipContent>
            </Tooltip>
            {historyLength > 0 && (
              <Badge variant="outline" className="ml-1 text-xs">
                {historyIndex + 1}/{historyLength}
              </Badge>
            )}
          </div>

          {/* Block Type Editor */}
          <BlockTypeEditor onSave={(blockType) => {
            toast.success(`Type de bloc "${blockType.label}" créé`);
          }} />

          <div className="flex-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleValidate}
                disabled={isValidating || !tpCode?.trim()}
                className="gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Valider
              </Button>
            </TooltipTrigger>
            <TooltipContent>Valider le projet</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating || errorCount > 0 || blocks.length === 0}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Générer
              </Button>
            </TooltipTrigger>
            <TooltipContent>Générer le projet</TooltipContent>
          </Tooltip>

          <TPFileImportButton />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleExport}
                disabled={!tpCode?.trim()}
              >
                <Download className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {tpCode?.trim() ? 'Exporter .tp' : 'Rien à exporter'}
            </TooltipContent>
          </Tooltip>

          {/* AI Chat Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showAIPanel ? "default" : "outline"} 
                size="icon"
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={cn(showAIPanel && "bg-primary")}
              >
                <Bot className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Assistant AI (Ollama)</TooltipContent>
          </Tooltip>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Palette */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-r border-border bg-card/50 backdrop-blur-sm overflow-hidden shrink-0"
              >
                <BlockPalette />
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Tabs Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} className="h-full">
              <TabsContent value="canvas" className="h-full m-0">
                <BlockCanvas />
              </TabsContent>

              <TabsContent value="code" className="h-full m-0">
                <div className="h-full relative">
                  <Editor
                    height="100%"
                    language="typescript"
                    theme="vs-dark"
                    value={tpCode}
                    onChange={(value) => setTPCode(value || '')}
                    options={{
                      minimap: { enabled: true },
                      scrollbar: { vertical: 'auto', horizontal: 'auto' },
                      fontSize: 14,
                      tabSize: 2,
                      wordWrap: 'on',
                      readOnly: false,
                      automaticLayout: true,
                      formatOnPaste: true,
                      formatOnType: true,
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                      bracketPairColorization: { enabled: true },
                    }}
                    loading={
                      <div className="flex items-center justify-center h-full">
                        <div className="text-muted-foreground">Chargement de l'éditeur...</div>
                      </div>
                    }
                  />
                  
                  {/* Code Stats Overlay */}
                  {tpCode && (
                    <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm border rounded-md px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                      {tpCode.split('\n').length} lignes • {tpCode.length} caractères
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Structure Tab */}
              <TabsContent value="structure" className="h-full m-0">
                <ProjectStructureTab />
              </TabsContent>

              {/* Relations Tab */}
              <TabsContent value="relations" className="h-full m-0">
                <RelationsTreeTab />
              </TabsContent>

              <TabsContent value="analysis" className="h-full m-0 overflow-auto">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    {parseResult ? (
                      <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 border rounded-lg bg-card">
                            <div className="text-sm text-muted-foreground mb-1">Blocs totaux</div>
                            <div className="text-2xl font-bold">{blocks.length}</div>
                          </div>
                          <div className="p-4 border rounded-lg bg-card">
                            <div className="text-sm text-muted-foreground mb-1">Lignes de code TP</div>
                            <div className="text-2xl font-bold">{tpCode.split('\n').length}</div>
                          </div>
                          <div className="p-4 border rounded-lg bg-card">
                            <div className="text-sm text-muted-foreground mb-1">Temps de parsing</div>
                            <div className="text-2xl font-bold">{stats?.parseTime || 0}ms</div>
                          </div>
                          <div className="p-4 border rounded-lg bg-card">
                            <div className="text-sm text-muted-foreground mb-1">Statut</div>
                            <div className="flex items-center gap-2 mt-1">
                              {errorCount === 0 ? (
                                <>
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <span className="font-semibold text-green-500">Valide</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-5 h-5 text-destructive" />
                                  <span className="font-semibold text-destructive">Erreurs</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Errors & Warnings */}
                        {errorCount > 0 && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{errorCount} Erreur(s)</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc pl-4 space-y-1 mt-2">
                                {parseResult.errors.map((err, i) => (
                                  <li key={i} className="text-sm">
                                    <span className="font-mono text-xs bg-destructive/10 px-1 py-0.5 rounded">
                                      Ligne {err.location.start.line}:{err.location.start.column}
                                    </span>
                                    {' '}{err.message}
                                    {err.suggestion && (
                                      <div className="text-xs text-muted-foreground mt-1 ml-4">
                                        💡 Suggestion: {err.suggestion}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        {warningCount > 0 && (
                          <Alert variant="warning">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{warningCount} Avertissement(s)</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc pl-4 space-y-1 mt-2">
                                {parseResult.warnings.map((warn, i) => (
                                  <li key={i} className="text-sm">
                                    <span className="font-mono text-xs bg-warning/10 px-1 py-0.5 rounded">
                                      Ligne {warn.location.start.line}:{warn.location.start.column}
                                    </span>
                                    {' '}{warn.message}
                                  </li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        {errorCount === 0 && warningCount === 0 && (
                          <Alert variant="success">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Analyse réussie</AlertTitle>
                            <AlertDescription>
                              Aucun problème détecté dans le code TP. Votre projet est prêt à être généré ! 🎉
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Additional Stats */}
                        {stats && (
                          <div className="mt-6 p-4 border rounded-lg bg-card">
                            <h3 className="font-medium mb-4">Statistiques détaillées</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {stats.modules > 0 && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Modules:</span>
                                  <span className="ml-2 font-semibold">{stats.modules}</span>
                                </div>
                              )}
                              {stats.models > 0 && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Modèles:</span>
                                  <span className="ml-2 font-semibold">{stats.models}</span>
                                </div>
                              )}
                              {stats.components > 0 && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Composants:</span>
                                  <span className="ml-2 font-semibold">{stats.components}</span>
                                </div>
                              )}
                              {stats.pages > 0 && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Pages:</span>
                                  <span className="ml-2 font-semibold">{stats.pages}</span>
                                </div>
                              )}
                              {stats.apis > 0 && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">APIs:</span>
                                  <span className="ml-2 font-semibold">{stats.apis}</span>
                                </div>
                              )}
                              {stats.microservices > 0 && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Microservices:</span>
                                  <span className="ml-2 font-semibold">{stats.microservices}</span>
                                </div>
                              )}
                              {stats.totalTokens > 0 && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Tokens:</span>
                                  <span className="ml-2 font-semibold">{stats.totalTokens}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Graph or Tree View Placeholder */}
                        <div className="mt-6 p-4 border rounded-lg bg-card">
                          <h3 className="font-medium mb-2">Graph des dépendances</h3>
                          <p className="text-sm text-muted-foreground">
                            Placeholder pour un graph visuel des blocs/relations (utiliser React Flow ou similaire).
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Activity className="w-16 h-16 text-muted-foreground/50 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Aucune analyse disponible</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Écrivez du code TP dans l'onglet "Code TP" ou ajoutez des blocs sur le Canvas pour commencer l'analyse.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* AI Chat Panel */}
        <AnimatePresence>
          {showAIPanel && <AIChatPanel />}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}