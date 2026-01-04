import React from 'react';
import { 
  Code2, Download, Save, Upload, Play, Settings, 
  FolderOpen, ChevronDown, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EditorHeaderProps {
  totalBlocks: number;
  onExportAll: () => void;
  onImport: () => void;
  onValidateAll: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  totalBlocks,
  onExportAll,
  onImport,
  onValidateAll,
}) => {
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              TP Editor
            </h1>
            <p className="text-xs text-muted-foreground -mt-0.5">
              Langage TechPlatform v2.0
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-border mx-2" />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="w-4 h-4 text-primary" />
          <span>{totalBlocks} blocs</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onValidateAll}
          className="text-muted-foreground hover:text-foreground"
        >
          <Play className="w-4 h-4 mr-2" />
          Valider
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <FolderOpen className="w-4 h-4 mr-2" />
              Fichier
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onImport}>
              <Upload className="w-4 h-4 mr-2" />
              Importer .tp
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportAll}>
              <Download className="w-4 h-4 mr-2" />
              Exporter tout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="default"
          size="sm"
          onClick={onExportAll}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>
    </header>
  );
};

export default EditorHeader;
