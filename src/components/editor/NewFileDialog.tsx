import React from 'react';
import { Database, Server, Globe, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface NewFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFile: (type: 'database' | 'backend' | 'frontend') => void;
}

const fileTypes = [
  {
    id: 'database' as const,
    label: 'Data & Structure',
    description: 'Modèles de données, énumérations, relations',
    icon: Database,
    filename: 'database.tp',
    color: 'block-data',
  },
  {
    id: 'backend' as const,
    label: 'Backend',
    description: 'APIs, microservices, logique métier',
    icon: Server,
    filename: 'generate_backend.tp',
    color: 'block-backend',
  },
  {
    id: 'frontend' as const,
    label: 'Frontend',
    description: 'Pages, composants, stores, hooks',
    icon: Globe,
    filename: 'generate_frontend.tp',
    color: 'block-frontend',
  },
];

const NewFileDialog: React.FC<NewFileDialogProps> = ({
  open,
  onOpenChange,
  onCreateFile,
}) => {
  const [selectedType, setSelectedType] = React.useState<'database' | 'backend' | 'frontend' | null>(null);

  const handleCreate = () => {
    if (selectedType) {
      onCreateFile(selectedType);
      setSelectedType(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Nouveau fichier TP
          </DialogTitle>
          <DialogDescription>
            Choisissez le type de fichier à créer
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {fileTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                  <code className="text-xs text-primary mt-1 inline-block">
                    {type.filename}
                  </code>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={!selectedType}>
            Créer le fichier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewFileDialog;
