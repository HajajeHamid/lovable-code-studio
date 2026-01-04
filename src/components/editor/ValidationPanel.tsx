import React from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, XCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ValidationResult } from '@/lib/tpBlocks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface ValidationPanelProps {
  result: ValidationResult | null;
  onClose: () => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ result, onClose }) => {
  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-success to-success/50';
    if (score >= 70) return 'from-warning to-warning/50';
    return 'from-destructive to-destructive/50';
  };

  return (
    <div className="border-t border-border bg-card">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            result.valid ? 'bg-success/20' : 'bg-warning/20'
          )}>
            {result.valid ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-warning" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Résultat de validation</h3>
            <p className="text-xs text-muted-foreground">
              {result.errors.length} erreur(s) · {result.warnings.length} avertissement(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={cn('text-2xl font-bold', getScoreColor(result.score))}>
              {result.score}%
            </div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
          <div className="w-32">
            <Progress 
              value={result.score} 
              className="h-2"
            />
          </div>
        </div>
      </div>

      <ScrollArea className="max-h-48">
        <div className="p-4 space-y-4">
          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Erreurs
              </h4>
              {result.errors.map((error, idx) => (
                <div 
                  key={idx}
                  className="text-sm text-muted-foreground bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2"
                >
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-warning flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Avertissements
              </h4>
              {result.warnings.map((warning, idx) => (
                <div 
                  key={idx}
                  className="text-sm text-muted-foreground bg-warning/10 border border-warning/20 rounded-md px-3 py-2"
                >
                  {warning}
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-info flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Suggestions
              </h4>
              {result.suggestions.map((suggestion, idx) => (
                <div 
                  key={idx}
                  className="text-sm text-muted-foreground bg-info/10 border border-info/20 rounded-md px-3 py-2"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}

          {/* Success message */}
          {result.valid && result.errors.length === 0 && result.warnings.length === 0 && (
            <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-md px-4 py-3">
              <TrendingUp className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-success">Excellent !</p>
                <p className="text-sm text-muted-foreground">
                  Votre fichier est prêt pour la génération de code.
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ValidationPanel;
