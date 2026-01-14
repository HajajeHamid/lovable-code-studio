// RelationsTreeTab.tsx - Visualisation des liaisons entre blocs
import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, Link, AlertTriangle, CheckCircle, XCircle,
  ZoomIn, ZoomOut, Maximize2, Filter, Search, RefreshCw,
  ArrowRight, Circle, Square
} from 'lucide-react';
import { useStudioStore } from '@/stores/studioStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { getBlockType, BlockInstance } from '@/lib/blocks/block-definitions';

interface RelationNode {
  id: string;
  name: string;
  typeId: string;
  label: string;
  color: string;
  relations: {
    targetId: string;
    targetName: string;
    type: 'reference' | 'parent' | 'child' | 'dependency';
    label?: string;
  }[];
  isOrphan: boolean;
  hasErrors: boolean;
}

interface GraphStats {
  totalNodes: number;
  totalRelations: number;
  orphanNodes: number;
  errorNodes: number;
  connectedComponents: number;
}

export function RelationsTreeTab() {
  const { blocks, selectBlock, selectedBlockId } = useStudioStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showOrphansOnly, setShowOrphansOnly] = useState(false);

  // Build relation graph
  const { nodes, stats, orphans, errors } = useMemo(() => {
    const nodeMap = new Map<string, RelationNode>();
    const allBlockIds = new Set<string>();
    const referencedIds = new Set<string>();

    // First pass: create all nodes
    const processBlock = (block: BlockInstance, parentId?: string) => {
      allBlockIds.add(block.id);
      const blockType = getBlockType(block.typeId);
      
      const node: RelationNode = {
        id: block.id,
        name: block.values?.name || block.name || block.id.slice(0, 8),
        typeId: block.typeId,
        label: blockType?.label || block.typeId,
        color: blockType?.color || 'muted',
        relations: [],
        isOrphan: false,
        hasErrors: false,
      };

      // Add parent relation
      if (parentId) {
        node.relations.push({
          targetId: parentId,
          targetName: '',
          type: 'parent',
          label: 'parent de'
        });
        referencedIds.add(block.id);
        referencedIds.add(parentId);
      }

      // Process children
      if (block.children) {
        block.children.forEach(child => {
          node.relations.push({
            targetId: child.id,
            targetName: child.values?.name || child.name || child.id.slice(0, 8),
            type: 'child',
            label: 'contient'
          });
          referencedIds.add(child.id);
          processBlock(child, block.id);
        });
      }

      // Find references in values
      Object.entries(block.values || {}).forEach(([key, value]) => {
        if (typeof value === 'string' && allBlockIds.has(value)) {
          node.relations.push({
            targetId: value,
            targetName: '',
            type: 'reference',
            label: key
          });
          referencedIds.add(value);
        }
        if (Array.isArray(value)) {
          value.forEach((v: any) => {
            if (typeof v === 'string' && allBlockIds.has(v)) {
              node.relations.push({
                targetId: v,
                targetName: '',
                type: 'reference',
                label: key
              });
              referencedIds.add(v);
            }
          });
        }
      });

      nodeMap.set(block.id, node);
    };

    blocks.forEach(block => processBlock(block));

    // Second pass: find orphans and validate
    const orphanList: RelationNode[] = [];
    const errorList: RelationNode[] = [];

    nodeMap.forEach(node => {
      // Check if orphan (root level blocks without references to them)
      const hasIncomingRelations = Array.from(nodeMap.values()).some(n => 
        n.relations.some(r => r.targetId === node.id)
      );
      
      if (!hasIncomingRelations && node.relations.filter(r => r.type !== 'child').length === 0) {
        const parentBlock = blocks.find(b => b.id === node.id);
        // Only mark as orphan if it's a non-root block or has no children
        if (parentBlock && !blocks.some(b => b.id === parentBlock.id)) {
          node.isOrphan = true;
          orphanList.push(node);
        }
      }

      // Check for broken references
      node.relations.forEach(rel => {
        if (!nodeMap.has(rel.targetId)) {
          node.hasErrors = true;
          if (!errorList.includes(node)) {
            errorList.push(node);
          }
        } else {
          rel.targetName = nodeMap.get(rel.targetId)?.name || '';
        }
      });
    });

    // Calculate connected components
    const visited = new Set<string>();
    let components = 0;
    
    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      const node = nodeMap.get(nodeId);
      node?.relations.forEach(r => dfs(r.targetId));
    };

    nodeMap.forEach((_, id) => {
      if (!visited.has(id)) {
        dfs(id);
        components++;
      }
    });

    const totalRelations = Array.from(nodeMap.values()).reduce(
      (sum, n) => sum + n.relations.length, 0
    );

    return {
      nodes: Array.from(nodeMap.values()),
      stats: {
        totalNodes: nodeMap.size,
        totalRelations,
        orphanNodes: orphanList.length,
        errorNodes: errorList.length,
        connectedComponents: components,
      } as GraphStats,
      orphans: orphanList,
      errors: errorList,
    };
  }, [blocks]);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    let result = nodes;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.name.toLowerCase().includes(q) || 
        n.label.toLowerCase().includes(q) ||
        n.typeId.toLowerCase().includes(q)
      );
    }
    
    if (filterType) {
      result = result.filter(n => n.typeId === filterType);
    }
    
    if (showOrphansOnly) {
      result = result.filter(n => n.isOrphan);
    }
    
    return result;
  }, [nodes, searchQuery, filterType, showOrphansOnly]);

  const blockTypes = useMemo(() => {
    return [...new Set(nodes.map(n => n.typeId))];
  }, [nodes]);

  const handleNodeClick = useCallback((nodeId: string) => {
    selectBlock(nodeId);
  }, [selectBlock]);

  return (
    <div className="h-full flex flex-col">
      {/* Header with stats */}
      <div className="p-4 border-b bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Arbre des Relations</h3>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{stats.totalNodes} nœuds</Badge>
            <Badge variant="secondary">{stats.totalRelations} liens</Badge>
            {stats.orphanNodes > 0 && (
              <Badge variant="warning">{stats.orphanNodes} orphelins</Badge>
            )}
            {stats.errorNodes > 0 && (
              <Badge variant="destructive">{stats.errorNodes} erreurs</Badge>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un nœud..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showOrphansOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowOrphansOnly(!showOrphansOnly)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Orphelins
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(stats.orphanNodes > 0 || stats.errorNodes > 0) && (
        <div className="p-4 space-y-2 border-b">
          {stats.errorNodes > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Liaisons cassées</AlertTitle>
              <AlertDescription>
                {stats.errorNodes} bloc(s) ont des références vers des éléments inexistants.
              </AlertDescription>
            </Alert>
          )}
          {stats.orphanNodes > 0 && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Blocs orphelins</AlertTitle>
              <AlertDescription>
                {stats.orphanNodes} bloc(s) ne sont pas connectés au reste du projet.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Node list */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {filteredNodes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Aucun nœud trouvé</p>
                <p className="text-sm">Ajoutez des blocs pour voir le graphe des relations</p>
              </div>
            ) : (
              filteredNodes.map(node => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer",
                    selectedBlockId === node.id && "ring-2 ring-primary",
                    node.isOrphan && "border-yellow-500/50",
                    node.hasErrors && "border-destructive/50"
                  )}
                  onClick={() => handleNodeClick(node.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        `bg-${node.color}`
                      )} style={{ backgroundColor: `hsl(var(--${node.color}))` }} />
                      <span className="font-medium">{node.name}</span>
                      <Badge variant="outline" className="text-xs">{node.label}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {node.isOrphan && (
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>Bloc orphelin</TooltipContent>
                        </Tooltip>
                      )}
                      {node.hasErrors && (
                        <Tooltip>
                          <TooltipTrigger>
                            <XCircle className="w-4 h-4 text-destructive" />
                          </TooltipTrigger>
                          <TooltipContent>Référence cassée</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  {node.relations.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {node.relations.slice(0, 5).map((rel, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ArrowRight className="w-3 h-3" />
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{rel.label || rel.type}</span>
                          <span>{rel.targetName || rel.targetId.slice(0, 8)}</span>
                        </div>
                      ))}
                      {node.relations.length > 5 && (
                        <p className="text-xs text-muted-foreground pl-5">
                          +{node.relations.length - 5} autres relations
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="w-56 border-l p-4 bg-card/30">
          <h4 className="font-medium text-sm mb-4">Légende</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Circle className="w-3 h-3 text-green-500 fill-green-500" />
              <span>Bloc connecté</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Circle className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span>Bloc orphelin</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Circle className="w-3 h-3 text-red-500 fill-red-500" />
              <span>Erreur de liaison</span>
            </div>
            
            <div className="border-t pt-3 mt-3">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">Types de relations</h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  <span>parent/enfant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link className="w-3 h-3" />
                  <span>référence</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 mt-3">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">Statistiques</h5>
              <div className="space-y-1 text-xs">
                <p>Composantes: {stats.connectedComponents}</p>
                <p>Densité: {stats.totalNodes > 0 ? 
                  ((stats.totalRelations / (stats.totalNodes * (stats.totalNodes - 1))) * 100).toFixed(1) 
                  : 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
