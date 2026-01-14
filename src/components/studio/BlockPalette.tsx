// BlockPalette.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Database, Zap, Layout, Globe, Server, 
  Code, Package, GitMerge, Activity, Puzzle, Settings2,
  Radio, History, TrendingUp, AlertCircle, Layers,
  Star, Clock, Pin, PinOff, X, Blocks
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { BLOCK_CATEGORIES, BLOCK_TYPES, BlockCategoryId, BlockTypeInterface } from '@/lib/blocks/block-definitions';
import { useStudioStore } from '@/stores/studioStore';
import { useDrag } from 'react-dnd';
import { toast } from '@/components/ui/sonner';

const ITEM_TYPE = 'BLOCK_TYPE';

const categoryIcons: Record<BlockCategoryId, React.ElementType> = {
  DATA: Database,
  LOGIC: Zap,
  UI: Layout,
  API: Globe,
  INFRASTRUCTURE: Server,
  GENERATION: Code,
  CICD: GitMerge,
  ARCHITECTURE: Layers,
  OTHER: Package,
};

const categoryColors: Record<BlockCategoryId, string> = {
  DATA: 'success',
  LOGIC: 'primary',
  UI: 'secondary',
  API: 'accent',
  INFRASTRUCTURE: 'warning',
  GENERATION: 'info',
  CICD: 'danger',
  ARCHITECTURE: 'purple',
  OTHER: 'muted',
};

// Extend BlockType for new features
interface ExtendedBlockType extends BlockTypeInterface {
  isNew?: boolean;
  usageCount?: number;
}

export function BlockPalette() {
  const { addBlock, sidebarOpen } = useStudioStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMode, setActiveMode] = useState<'all' | 'favorites' | 'recent'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [pinnedCategories, setPinnedCategories] = useState<BlockCategoryId[]>([]);
  const [blockUsages, setBlockUsages] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage with error handling
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('blockFavorites');
      const storedRecent = localStorage.getItem('blockRecent');
      const storedPinned = localStorage.getItem('pinnedCategories');
      const storedUsages = localStorage.getItem('blockUsages');

      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      if (storedRecent) setRecent(JSON.parse(storedRecent));
      if (storedPinned) setPinnedCategories(JSON.parse(storedPinned));
      if (storedUsages) setBlockUsages(JSON.parse(storedUsages));
    } catch (error) {
      console.error('Error loading palette preferences:', error);
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger vos préférences.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage with error handling
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('blockFavorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    }
  }, [favorites, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('blockRecent', JSON.stringify(recent));
      } catch (error) {
        console.error('Error saving recent:', error);
      }
    }
  }, [recent, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('pinnedCategories', JSON.stringify(pinnedCategories));
      } catch (error) {
        console.error('Error saving pinned categories:', error);
      }
    }
  }, [pinnedCategories, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('blockUsages', JSON.stringify(blockUsages));
      } catch (error) {
        console.error('Error saving usages:', error);
      }
    }
  }, [blockUsages, isLoading]);

  // Function to track usage
  const trackUsage = (blockId: string) => {
    setBlockUsages(prev => ({ ...prev, [blockId]: (prev[blockId] || 0) + 1 }));
    setRecent(prev => [blockId, ...prev.filter(id => id !== blockId)].slice(0, 10));
  };

  // Filtered and extended blocks
  const extendedBlocks: ExtendedBlockType[] = useMemo(() => {
    return BLOCK_TYPES.map(b => ({
      ...b,
      isNew: ['cqrs', 'eventsourcing', 'realtime', 'cicdgen', 'websocketgen'].includes(b.id),
      usageCount: blockUsages[b.id] || 0,
    }));
  }, [blockUsages]);

  const filteredBlocks = useMemo(() => {
    let blocks = extendedBlocks;

    if (activeMode === 'favorites') {
      blocks = blocks.filter(b => favorites.includes(b.id));
    } else if (activeMode === 'recent') {
      blocks = blocks
        .filter(b => recent.includes(b.id))
        .sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      blocks = blocks.filter(block =>
        block.label.toLowerCase().includes(q) ||
        block.description.toLowerCase().includes(q) ||
        block.name.toLowerCase().includes(q) ||
        block.id.toLowerCase().includes(q)
      );
    }

    return blocks;
  }, [extendedBlocks, activeMode, favorites, recent, searchQuery]);

  // Group by category, with pinned first
  const blocksByCategory = useMemo(() => {
    const result: Record<BlockCategoryId, ExtendedBlockType[]> = {} as any;
    Object.keys(BLOCK_CATEGORIES).forEach((catId) => {
      result[catId as BlockCategoryId] = [];
    });

    filteredBlocks.forEach(block => {
      const catId = block.category as BlockCategoryId;
      if (result[catId]) {
        result[catId].push(block);
      }
    });

    return result;
  }, [filteredBlocks]);

  const sortedCategories = useMemo(() => {
    return Object.keys(blocksByCategory)
      .filter(catId => blocksByCategory[catId as BlockCategoryId].length > 0)
      .sort((a, b) => {
        const pinnedA = pinnedCategories.includes(a as BlockCategoryId) ? -1 : 0;
        const pinnedB = pinnedCategories.includes(b as BlockCategoryId) ? -1 : 0;
        return pinnedB - pinnedA || a.localeCompare(b);
      }) as BlockCategoryId[];
  }, [blocksByCategory, pinnedCategories]);

  const toggleFavorite = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(blockId) 
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    );
  };

  const togglePinCategory = (catId: BlockCategoryId) => {
    setPinnedCategories(prev => 
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  return (
    <TooltipProvider>
      <motion.aside
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="border-r border-border bg-card flex-shrink-0 overflow-hidden"
      >
        <div className="p-3 border-b flex items-center gap-2">
          <Blocks className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Palette de Blocs</h3>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setActiveMode(v as any)}>
          <div className="px-3 py-2 flex items-center gap-2 border-b">
            <Input 
              placeholder="Rechercher un bloc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 flex-1"
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchQuery('')}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <TabsList className="w-full justify-around border-b">
            <TabsTrigger value="all" className="flex-1">Tous</TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1">Favoris</TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">Récent</TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <AnimatePresence>
            {sortedCategories.map((catId) => {
              const category = BLOCK_CATEGORIES[catId];
              const Icon = categoryIcons[catId];
              const color = categoryColors[catId];
              const isPinned = pinnedCategories.includes(catId);

              return (
                <motion.div
                  key={catId}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 py-4 border-b last:border-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${color}`} />
                      <h4 className="font-medium text-sm">{category.label}</h4>
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {blocksByCategory[catId].length}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => togglePinCategory(catId)}
                    >
                      {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {blocksByCategory[catId]
                      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
                      .map((block, index) => {
                        const [{ isDragging }, drag] = useDrag({
                          type: ITEM_TYPE,
                          item: { typeId: block.id },
                          collect: (monitor) => ({
                            isDragging: monitor.isDragging(),
                          }),
                          end: (item, monitor) => {
                            if (monitor.didDrop()) {
                              addBlock(block.id);
                              trackUsage(block.id);
                              toast.success('Bloc ajouté', {
                                description: 'Le bloc a été ajouté au canvas.',
                              });
                            }
                          },
                        });

                        const isFavorite = favorites.includes(block.id);

                        return (
                          <Tooltip key={block.id}>
                            <TooltipTrigger asChild>
                              <motion.div
                                ref={drag}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                onClick={() => {
                                  addBlock(block.id);
                                  trackUsage(block.id);
                                  toast.success('Bloc ajouté');
                                }}
                                className={cn(
                                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors group text-left",
                                  isDragging && "opacity-50 cursor-grabbing"
                                )}
                              >
                                <div className={cn(
                                  "w-9 h-9 rounded-md flex items-center justify-center text-sm font-medium shrink-0 relative",
                                  `bg-${block.color}/15 text-${block.color}`
                                )}>
                                  {block.label.charAt(0).toUpperCase()}
                                  {block.isNew && (
                                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] px-1 py-0 font-bold bg-gradient-to-r from-primary to-primary/70">
                                      NEW
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                    {block.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {block.description}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {block.usageCount && block.usageCount > 0 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                      <Clock className="w-3 h-3 mr-0.5" /> {block.usageCount}
                                    </Badge>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => toggleFavorite(block.id, e)}
                                  >
                                    <Star className={cn(
                                      "w-3.5 h-3.5 transition-all",
                                      isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                                    )} />
                                  </Button>
                                  <Plus className="w-4 h-4 text-primary" />
                                </div>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-md p-3">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold shrink-0",
                                  `bg-${block.color}/20 text-${block.color}`
                                )}>
                                  {block.label.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold">{block.label}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{block.description}</p>
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {block.isNew && (
                                      <Badge variant="default" className="text-xs">
                                        Nouveau !
                                      </Badge>
                                    )}
                                    {block.usageCount && block.usageCount > 5 && (
                                      <Badge variant="secondary" className="text-xs">
                                        Populaire
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {category.label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredBlocks.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground px-4"
            >
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">Aucun bloc trouvé</p>
              <p className="text-sm">
                {searchQuery 
                  ? "Essayez un autre terme ou vérifiez l'orthographe" 
                  : activeMode === 'favorites' 
                    ? "Ajoutez des blocs à vos favoris en cliquant sur l'étoile"
                    : "Utilisez des blocs pour en voir l'historique"
                }
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Effacer la recherche
                </Button>
              )}
            </motion.div>
          )}

          {isLoading && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm">Chargement...</p>
            </div>
          )}
        </ScrollArea>
      </motion.aside>
    </TooltipProvider>
  );
}