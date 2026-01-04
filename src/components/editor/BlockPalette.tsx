import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  TPBlock, 
  BlockCategory, 
  BLOCK_CATEGORIES,
  getBlocksByCategory 
} from '@/lib/tpBlocks';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BlockPaletteProps {
  fileType: 'database' | 'backend' | 'frontend';
  onAddBlock: (type: string, block: TPBlock) => void;
}

const BlockPalette: React.FC<BlockPaletteProps> = ({ fileType, onAddBlock }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<BlockCategory>>(
    new Set(['data', 'backend', 'frontend', 'directives'])
  );

  const blocksByCategory = useMemo(() => getBlocksByCategory(fileType), [fileType]);

  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return blocksByCategory;

    const query = searchQuery.toLowerCase();
    const filtered: Record<BlockCategory, Record<string, TPBlock>> = {
      data: {},
      backend: {},
      frontend: {},
      architecture: {},
      integration: {},
      business: {},
      testing: {},
      infrastructure: {},
      directives: {},
    };

    Object.entries(blocksByCategory).forEach(([category, blocks]) => {
      Object.entries(blocks).forEach(([key, block]) => {
        if (
          key.toLowerCase().includes(query) ||
          block.desc.toLowerCase().includes(query)
        ) {
          filtered[category as BlockCategory][key] = block;
        }
      });
    });

    return filtered;
  }, [blocksByCategory, searchQuery]);

  const toggleCategory = (category: BlockCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getCategoryCount = (category: BlockCategory) => {
    return Object.keys(filteredBlocks[category]).length;
  };

  const colorMap: Record<string, string> = {
    'block-data': 'bg-block-data/20 text-block-data border-block-data/30',
    'block-backend': 'bg-block-backend/20 text-block-backend border-block-backend/30',
    'block-frontend': 'bg-block-frontend/20 text-block-frontend border-block-frontend/30',
    'block-architecture': 'bg-block-architecture/20 text-block-architecture border-block-architecture/30',
    'block-integration': 'bg-block-integration/20 text-block-integration border-block-integration/30',
    'block-business': 'bg-block-business/20 text-block-business border-block-business/30',
    'block-testing': 'bg-block-testing/20 text-block-testing border-block-testing/30',
    'block-infra': 'bg-block-infra/20 text-block-infra border-block-infra/30',
    'block-directive': 'bg-block-directive/20 text-block-directive border-block-directive/30',
  };

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un bloc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-input border-border text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {(Object.keys(BLOCK_CATEGORIES) as BlockCategory[]).map((categoryKey) => {
            const category = BLOCK_CATEGORIES[categoryKey];
            const blocks = filteredBlocks[categoryKey];
            const count = getCategoryCount(categoryKey);
            const isExpanded = expandedCategories.has(categoryKey);
            const Icon = category.icon;

            if (count === 0) return null;

            return (
              <div key={categoryKey} className="mb-2">
                <button
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    )}
                    <Icon className={cn('w-4 h-4', `text-${category.color.replace('block-', 'block-')}`)} />
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {count}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-1 ml-4 space-y-1">
                    {Object.entries(blocks).map(([type, block]) => {
                      const BlockIcon = block.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => onAddBlock(type, block)}
                          className={cn(
                            'w-full group flex items-center gap-2 px-2 py-2 rounded-md transition-all',
                            'border border-dashed',
                            'hover:border-solid',
                            colorMap[block.color] || 'bg-muted/50 text-foreground border-border'
                          )}
                        >
                          <BlockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-xs font-mono font-semibold truncate">
                              {type}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {block.desc}
                            </div>
                          </div>
                          <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BlockPalette;
