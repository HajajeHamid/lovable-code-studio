import React from 'react';
import { X, Plus, Database, Server, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TPFile, FILE_TYPES } from '@/lib/tpBlocks';

interface FileTabsProps {
  files: TPFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCloseFile: (fileId: string) => void;
  onNewFile: () => void;
}

const FileIcon = ({ type }: { type: 'database' | 'backend' | 'frontend' }) => {
  const icons = {
    database: Database,
    backend: Server,
    frontend: Globe,
  };
  const Icon = icons[type];
  return <Icon className="w-3.5 h-3.5" />;
};

const FileTabs: React.FC<FileTabsProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCloseFile,
  onNewFile,
}) => {
  return (
    <div className="h-10 bg-muted/30 border-b border-border flex items-center overflow-x-auto editor-scrollbar">
      <div className="flex items-center gap-0.5 px-1">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          const colorClasses = {
            database: 'text-block-data',
            backend: 'text-block-backend',
            frontend: 'text-block-frontend',
          };

          return (
            <div
              key={file.id}
              className={cn(
                'group flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer transition-all',
                'border border-transparent',
                isActive
                  ? 'bg-card border-border border-b-card text-foreground'
                  : 'hover:bg-card/50 text-muted-foreground hover:text-foreground'
              )}
              onClick={() => onSelectFile(file.id)}
            >
              <span className={colorClasses[file.type]}>
                <FileIcon type={file.type} />
              </span>
              <span className="text-sm font-medium whitespace-nowrap">
                {file.name}
              </span>
              {file.modified && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseFile(file.id);
                }}
                className={cn(
                  'w-4 h-4 rounded flex items-center justify-center',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  'hover:bg-destructive/20 hover:text-destructive'
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={onNewFile}
          className="flex items-center justify-center w-7 h-7 rounded hover:bg-card/50 text-muted-foreground hover:text-foreground transition-colors ml-1"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FileTabs;
