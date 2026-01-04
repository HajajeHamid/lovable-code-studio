import React, { useState } from 'react';
import { 
  ChevronDown, ChevronRight, Trash2, Copy, GripVertical,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockInstance, TP_BLOCKS_LIBRARY } from '@/lib/tpBlocks';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BlockEditorProps {
  block: BlockInstance;
  index: number;
  onUpdateParam: (blockId: string, param: string, value: string) => void;
  onRemove: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onToggleCollapse: (blockId: string) => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  block,
  index,
  onUpdateParam,
  onRemove,
  onDuplicate,
  onToggleCollapse,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = block.icon;

  const colorMap: Record<string, { border: string; bg: string; text: string; accent: string }> = {
    'block-data': { 
      border: 'border-block-data/40', 
      bg: 'bg-block-data/10', 
      text: 'text-block-data',
      accent: 'bg-block-data'
    },
    'block-backend': { 
      border: 'border-block-backend/40', 
      bg: 'bg-block-backend/10', 
      text: 'text-block-backend',
      accent: 'bg-block-backend'
    },
    'block-frontend': { 
      border: 'border-block-frontend/40', 
      bg: 'bg-block-frontend/10', 
      text: 'text-block-frontend',
      accent: 'bg-block-frontend'
    },
    'block-architecture': { 
      border: 'border-block-architecture/40', 
      bg: 'bg-block-architecture/10', 
      text: 'text-block-architecture',
      accent: 'bg-block-architecture'
    },
    'block-integration': { 
      border: 'border-block-integration/40', 
      bg: 'bg-block-integration/10', 
      text: 'text-block-integration',
      accent: 'bg-block-integration'
    },
    'block-business': { 
      border: 'border-block-business/40', 
      bg: 'bg-block-business/10', 
      text: 'text-block-business',
      accent: 'bg-block-business'
    },
    'block-testing': { 
      border: 'border-block-testing/40', 
      bg: 'bg-block-testing/10', 
      text: 'text-block-testing',
      accent: 'bg-block-testing'
    },
    'block-infra': { 
      border: 'border-block-infra/40', 
      bg: 'bg-block-infra/10', 
      text: 'text-block-infra',
      accent: 'bg-block-infra'
    },
    'block-directive': { 
      border: 'border-block-directive/40', 
      bg: 'bg-block-directive/10', 
      text: 'text-block-directive',
      accent: 'bg-block-directive'
    },
  };

  const colors = colorMap[block.color] || colorMap['block-data'];
  const emptyParams = Object.entries(block.params).filter(([_, v]) => !v.trim());

  return (
    <div
      className={cn(
        'rounded-lg border-2 transition-all duration-200 overflow-hidden animate-slide-in',
        colors.border,
        isHovered && 'shadow-block',
        !block.collapsed && colors.bg
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors',
          block.collapsed ? 'bg-card hover:bg-muted/50' : colors.bg
        )}
        onClick={() => onToggleCollapse(block.id)}
      >
        <div className={cn('w-1 h-8 rounded-full', colors.accent)} />
        
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={cn(
            'w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold',
            colors.bg, colors.text
          )}>
            {index + 1}
          </span>
          
          <Icon className={cn('w-4 h-4', colors.text)} />
          
          <span className={cn('font-mono text-sm font-semibold', colors.text)}>
            {block.type}
          </span>
          
          <span className="text-xs text-muted-foreground truncate hidden md:block">
            {block.desc}
          </span>

          {emptyParams.length > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <span className="flex items-center gap-1 text-warning">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-xs">{emptyParams.length}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{emptyParams.length} paramètre(s) à compléter</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(block.id);
                }}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dupliquer</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(block.id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Supprimer</TooltipContent>
          </Tooltip>

          {block.collapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Content */}
      {!block.collapsed && (
        <div className="px-4 py-3 border-t border-border/50 space-y-3 bg-card/50">
          {Object.keys(block.params).map((param) => {
            const isMultiline = ['fields', 'content', 'endpoints', 'commands', 'queries', 
              'states', 'transitions', 'props', 'state', 'actions', 'events',
              'metrics', 'alerts', 'components', 'features', 'policies'].includes(param);
            
            return (
              <div key={param}>
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
                  <span className={cn('font-mono', !block.params[param] && 'text-warning')}>
                    {param}
                  </span>
                  {!block.params[param] && (
                    <span className="text-[10px] text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                      requis
                    </span>
                  )}
                </label>
                <Textarea
                  value={block.params[param]}
                  onChange={(e) => onUpdateParam(block.id, param, e.target.value)}
                  placeholder={`Entrez ${param}...`}
                  className={cn(
                    'font-mono text-sm bg-input border-border resize-none',
                    'focus:ring-2 focus:ring-primary/50 focus:border-primary'
                  )}
                  rows={isMultiline ? 4 : 1}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BlockEditor;
