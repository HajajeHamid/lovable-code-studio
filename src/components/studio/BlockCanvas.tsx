// BlockCanvas.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Blocks, Sparkles, ZoomIn, ZoomOut, Image as ImageIcon, 
  RotateCcw, RotateCw, Trash2, Bot, RefreshCw,
  GripVertical
} from 'lucide-react';
import { useStudioStore } from '@/stores/studioStore';
import { BlockCard } from './BlockCard';
import { generateTPCode, getBlockType } from '@/lib/blocks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import html2canvas from 'html2canvas';
import { toast } from '@/components/ui/sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useDrop } from 'react-dnd';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const ITEM_TYPE = 'BLOCK_TYPE';
const useProcessedStore = () => {
  const store = useStudioStore();

  return {
    blocks: store.blocks || [],
    selectBlock: store.selectBlock,
    setTPCode: store.setTPCode,
    addBlock: store.addBlock,
    moveBlock: store.moveBlock,
    removeBlock: store.removeBlock,
    undo: store.undo,
    redo: store.redo,
    canUndo: store.canUndo,
    canRedo: store.canRedo,
    findBlockRecursive: store.findBlockRecursive,
  };
};
export function BlockCanvas() {
  const { 
    blocks, 
    selectBlock, 
    setTPCode, 
    addBlock, 
    moveBlock, 
    removeBlock,
    undo, 
    redo, 
    canUndo, 
    canRedo,
    findBlockRecursive
  } = useProcessedStore();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAIInput, setShowAIInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Sync blocks to TP code
  useEffect(() => {
    const code = generateTPCode(blocks);
    setTPCode(code);
  }, [blocks, setTPCode]);

  // Drop target for new blocks from palette
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { typeId: string }) => {
      addBlock(item.typeId);
      toast.success('Bloc ajouté', {
        description: `Le bloc a été ajouté au canvas.`,
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // Parse parent IDs from droppableIds (e.g., 'root' or 'children-blockId')
    const sourceParentId = source.droppableId === 'root' ? undefined : source.droppableId.split('-')[1];
    const destParentId = destination.droppableId === 'root' ? undefined : destination.droppableId.split('-')[1];

    // Optional: Validate if move is allowed (based on block types)
    const blockToMove = findBlockRecursive(draggableId, blocks);
    if (!blockToMove) return;

    const destBlockType = destParentId ? getBlockType(findBlockRecursive(destParentId, blocks)?.typeId || '') : null;
    if (destBlockType && destBlockType.allowedChildren && !destBlockType.allowedChildren.includes(blockToMove.typeId)) {
      toast.error('Déplacement non autorisé', { description: `Ce bloc ne peut pas être enfant de ${destBlockType?.label}.` });
      return;
    }

    // If same list, reorder within parent
    if (source.droppableId === destination.droppableId) {
      moveBlock(draggableId, sourceParentId, destination.index);
    } else {
      // Move to new parent
      moveBlock(draggableId, destParentId, destination.index);
    }

    toast.info('Bloc déplacé', { description: 'L\'ordre a été mis à jour.' });
  };

  const handleExportImage = async () => {
    if (!canvasRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `canvas-export-${Date.now()}.png`;
      a.click();
      
      toast.success('Export réussi', {
        description: 'Image du canvas téléchargée.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur d\'export', {
        description: 'Impossible d\'exporter l\'image.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAll = () => {
    blocks.forEach(block => removeBlock(block.id));
    toast.success('Canvas effacé', {
      description: 'Tous les blocs ont été supprimés.',
    });
  };

  const handleAICall = () => {
    // Placeholder for AI integration
    const prompt = aiPrompt.toLowerCase().trim();
    
    if (!prompt) {
      toast.error('Prompt vide', {
        description: 'Veuillez entrer une description.',
      });
      return;
    }

    // Simple keyword matching for demo
    if (prompt.includes('model') || prompt.includes('modèle')) {
      addBlock('model');
      toast.success('Suggestion AI appliquée', {
        description: 'Modèle ajouté via AI.',
      });
    } else if (prompt.includes('api')) {
      addBlock('api');
      toast.success('Suggestion AI appliquée', {
        description: 'API ajoutée via AI.',
      });
    } else if (prompt.includes('page')) {
      addBlock('page');
      toast.success('Suggestion AI appliquée', {
        description: 'Page ajoutée via AI.',
      });
    } else {
      toast.info('AI Suggestion', {
        description: 'Fonctionnalité AI en développement. Essayez: "ajouter un modèle", "créer une API", ou "nouvelle page".',
      });
    }
    
    setAiPrompt('');
    setShowAIInput(false);
  };

  return (
    <div 
      ref={drop}
      className={cn(
        "flex-1 h-full overflow-hidden p-6 bg-dots relative",
        isOver && "bg-muted/50 ring-2 ring-primary ring-inset"
      )}
      onClick={() => selectBlock(null)}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={2}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        panning={{ disabled: zoomLevel === 1 }}
        onZoom={(ref) => setZoomLevel(ref.state.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <div className="h-full flex flex-col">
            {/* Toolbar */}
            <motion.div 
              className="absolute top-4 right-4 flex gap-2 z-20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => zoomIn(0.2)}
                    disabled={zoomLevel >= 2}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Agrandir</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => zoomOut(0.2)}
                    disabled={zoomLevel <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Réduire</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => resetTransform()}
                    disabled={zoomLevel === 1}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Réinitialiser</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleExportImage}
                    disabled={isExporting || blocks.length === 0}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Exporter en image</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setShowAIInput(!showAIInput)}
                  >
                    <Bot className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Suggestion AI</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={undo} disabled={!canUndo}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Annuler (Ctrl+Z)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={redo} disabled={!canRedo}>
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rétablir (Ctrl+Y)</TooltipContent>
              </Tooltip>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" disabled={blocks.length === 0}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Effacer le canvas ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action supprimera tous les blocs. Elle est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll}>Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>

            {/* Zoom Level Indicator */}
            {zoomLevel !== 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 left-4 z-20 bg-card border rounded-md px-3 py-1.5 text-sm font-medium shadow-sm"
              >
                Zoom: {Math.round(zoomLevel * 100)}%
              </motion.div>
            )}

            {/* AI Prompt Input */}
            <AnimatePresence>
              {showAIInput && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-20 left-4 right-4 z-20 bg-card p-4 rounded-lg shadow-lg border max-w-2xl mx-auto"
                >
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Décrivez ce que vous voulez ajouter (ex: Ajouter un model User, créer une API REST, nouvelle page de login)"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAICall()}
                      className="flex-1"
                      autoFocus
                    />
                    <Button onClick={handleAICall} disabled={!aiPrompt.trim()}>
                      <Bot className="w-4 h-4 mr-2" /> Suggérer
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Astuce: Essayez "modèle", "api", ou "page" pour des suggestions rapides
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <TransformComponent wrapperClass="flex-1 w-full h-full">
              <div ref={canvasRef} className="min-h-full p-4">
                {blocks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 shadow-md">
                      <Blocks className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">Canvas Vide</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Glissez des blocs depuis la palette ou cliquez pour ajouter. Construisez votre projet de A à Z !
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      Astuce: Utilisez AI pour suggestions intelligentes
                    </div>
                  </motion.div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="root" type="BLOCK">
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          className={cn(
                            "max-w-4xl mx-auto space-y-4 transition-colors min-h-[400px]",
                            snapshot.isDraggingOver && "bg-muted/20 rounded-lg p-4"
                          )}
                          {...provided.droppableProps}
                        >
                          
                          <AnimatePresence>
                            {blocks.map((block, index) => (
                              <Draggable key={block.id} draggableId={block.id} index={index}>
                                {(provided, snapshot) => (
                                  <motion.div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      opacity: snapshot.isDragging ? 0.7 : 1,
                                    }}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative group"
                                  >
                                    {/* Poignée visible au survol ou toujours */}
                                    <div
                                      {...provided.dragHandleProps}
                                      className="absolute -left-9 top-3 opacity-0 group-hover:opacity-70 transition-opacity cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="w-5 h-5 text-muted-foreground" />
                                    </div>

                                    <BlockCard block={block} index={index} depth={0} />
                                  </motion.div>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
    </div>
  );
}