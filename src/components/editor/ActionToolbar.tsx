import React from 'react';
import { 
  CheckCircle, GitBranch, Rocket, Terminal, TestTube,
  Play, Download, Zap, Settings, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ActionToolbarProps {
  onValidate: () => void;
  onValidateRelations: () => void;
  onGenerate: () => void;
  onExport: () => void;
  hasBlocks: boolean;
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onValidate,
  onValidateRelations,
  onGenerate,
  onExport,
  hasBlocks,
}) => {
  const actions = [
    {
      id: 'validate',
      label: 'Valider Format',
      icon: CheckCircle,
      onClick: onValidate,
      color: 'text-success hover:bg-success/10',
      tooltip: 'Valider la syntaxe de tous les blocs',
    },
    {
      id: 'relations',
      label: 'Valider Relations',
      icon: GitBranch,
      onClick: onValidateRelations,
      color: 'text-info hover:bg-info/10',
      tooltip: 'Vérifier les liens entre fichiers TP',
    },
    {
      id: 'generate',
      label: 'Générer',
      icon: Rocket,
      onClick: onGenerate,
      color: 'text-primary hover:bg-primary/10',
      tooltip: 'Générer les projets backend et frontend',
      primary: true,
    },
    {
      id: 'export',
      label: 'Exporter',
      icon: Download,
      onClick: onExport,
      color: 'text-muted-foreground hover:bg-muted',
      tooltip: 'Exporter les fichiers .tp',
    },
  ];

  return (
    <div className="flex items-center gap-1 p-2 bg-card/50 border-b border-border">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <Button
                variant={action.primary ? 'default' : 'ghost'}
                size="sm"
                onClick={action.onClick}
                disabled={!hasBlocks}
                className={cn(
                  'gap-2',
                  !action.primary && action.color
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{action.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{action.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default ActionToolbar;
