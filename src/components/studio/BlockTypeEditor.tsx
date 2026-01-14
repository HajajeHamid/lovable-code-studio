// BlockTypeEditor.tsx - Éditeur pour créer de nouveaux types de blocs
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Save, X, Code, Eye, Settings,
  GripVertical, ChevronDown, ChevronRight, Copy,
  AlertCircle, CheckCircle, Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import Editor from '@monaco-editor/react';
import { BlockTypeInterface, FieldConfig, BLOCK_CATEGORIES, BlockCategoryId } from '@/lib/blocks/block-definitions';

interface FieldEditorProps {
  field: Partial<FieldConfig>;
  index: number;
  onChange: (index: number, field: Partial<FieldConfig>) => void;
  onRemove: (index: number) => void;
}

function FieldEditor({ field, index, onChange, onRemove }: FieldEditorProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border rounded-lg bg-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
        <span className="font-medium flex-1">{field.label || field.id || `Champ ${index + 1}`}</span>
        <Badge variant="outline" className="text-xs">{field.type || 'text'}</Badge>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemove(index)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 mt-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID (unique)</Label>
                <Input
                  value={field.id || ''}
                  onChange={(e) => onChange(index, { ...field, id: e.target.value })}
                  placeholder="fieldId"
                />
              </div>
              <div className="space-y-2">
                <Label>Label (affiché)</Label>
                <Input
                  value={field.label || ''}
                  onChange={(e) => onChange(index, { ...field, label: e.target.value })}
                  placeholder="Label du champ"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={field.type || 'text'}
                  onValueChange={(val: any) => onChange(index, { ...field, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texte</SelectItem>
                    <SelectItem value="number">Nombre</SelectItem>
                    <SelectItem value="boolean">Booléen</SelectItem>
                    <SelectItem value="select">Sélection</SelectItem>
                    <SelectItem value="multiselect">Multi-sélection</SelectItem>
                    <SelectItem value="array">Tableau</SelectItem>
                    <SelectItem value="object">Objet</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="relation">Relation</SelectItem>
                    <SelectItem value="enum-values">Valeurs Enum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Placeholder</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => onChange(index, { ...field, placeholder: e.target.value })}
                  placeholder="Texte d'aide..."
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.required || false}
                  onCheckedChange={(checked) => onChange(index, { ...field, required: checked })}
                />
                <Label>Requis</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.unique || false}
                  onCheckedChange={(checked) => onChange(index, { ...field, unique: checked })}
                />
                <Label>Unique</Label>
              </div>
            </div>

            {(field.type === 'select' || field.type === 'multiselect') && (
              <div className="space-y-2">
                <Label>Options (une par ligne: label|value)</Label>
                <Textarea
                  value={field.options?.map(o => `${o.label}|${o.value}`).join('\n') || ''}
                  onChange={(e) => {
                    const options = e.target.value.split('\n').filter(Boolean).map(line => {
                      const [label, value] = line.split('|');
                      return { label: label.trim(), value: (value || label).trim() };
                    });
                    onChange(index, { ...field, options });
                  }}
                  placeholder="Option 1|value1&#10;Option 2|value2"
                  rows={4}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Valeur par défaut</Label>
              <Input
                value={typeof field.defaultValue === 'string' ? field.defaultValue : JSON.stringify(field.defaultValue) || ''}
                onChange={(e) => onChange(index, { ...field, defaultValue: e.target.value })}
                placeholder="Valeur par défaut"
              />
            </div>

            <div className="space-y-2">
              <Label>Texte d'aide</Label>
              <Input
                value={field.helpText || ''}
                onChange={(e) => onChange(index, { ...field, helpText: e.target.value })}
                placeholder="Information complémentaire pour l'utilisateur"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface BlockTypeEditorProps {
  onSave?: (blockType: BlockTypeInterface) => void;
  initialData?: Partial<BlockTypeInterface>;
}

export function BlockTypeEditor({ onSave, initialData }: BlockTypeEditorProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'fields' | 'validation' | 'code'>('config');
  const [isOpen, setIsOpen] = useState(false);
  
  const [blockType, setBlockType] = useState<Partial<BlockTypeInterface>>({
    id: '',
    name: '',
    label: '',
    category: 'OTHER',
    color: 'primary',
    icon: 'Blocks',
    description: '',
    template: '',
    fields: [],
    canHaveChildren: false,
    allowedChildren: [],
    ...initialData
  });

  const [validationCode, setValidationCode] = useState<string>(`// Fonction de validation personnalisée
// Retourne un tableau d'erreurs ou un tableau vide si valide
function validate(values, context) {
  const errors = [];
  
  // Exemple: vérifier un champ requis
  // if (!values.name) {
  //   errors.push({ field: 'name', message: 'Le nom est requis' });
  // }
  
  return errors;
}`);

  const [generatorCode, setGeneratorCode] = useState<string>(`// Générateur de code TP
// Convertit les valeurs du bloc en code TP
function generate(block, indent = 0) {
  const spaces = '  '.repeat(indent);
  const name = block.values?.name || 'unnamed';
  
  let code = \`\${spaces}@${blockType.name || 'Block'} \${name} {\n\`;
  
  // Ajouter les propriétés
  Object.entries(block.values || {}).forEach(([key, value]) => {
    if (key !== 'name' && value !== undefined) {
      code += \`\${spaces}  \${key}: \${JSON.stringify(value)}\n\`;
    }
  });
  
  code += \`\${spaces}}\`;
  return code;
}`);

  const handleFieldChange = useCallback((index: number, field: Partial<FieldConfig>) => {
    setBlockType(prev => ({
      ...prev,
      fields: prev.fields?.map((f, i) => i === index ? field as FieldConfig : f)
    }));
  }, []);

  const handleAddField = useCallback(() => {
    const newField: FieldConfig = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Nouveau champ',
      required: false,
    };
    setBlockType(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }));
  }, []);

  const handleRemoveField = useCallback((index: number) => {
    setBlockType(prev => ({
      ...prev,
      fields: prev.fields?.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSave = () => {
    // Validate
    if (!blockType.id || !blockType.name || !blockType.label) {
      toast.error('Champs requis manquants', {
        description: 'ID, Nom et Label sont obligatoires.',
      });
      return;
    }

    // Create full block type
    const fullBlockType: BlockTypeInterface = {
      id: (blockType.id || 'custom_block') as any,
      name: blockType.name || 'CustomBlock',
      label: blockType.label || 'Custom Block',
      category: blockType.category as BlockCategoryId || 'OTHER',
      color: blockType.color as any || 'primary',
      icon: blockType.icon || 'Blocks',
      description: blockType.description || '',
      template: blockType.template || '',
      fields: blockType.fields as FieldConfig[] || [],
      canHaveChildren: blockType.canHaveChildren || false,
      allowedChildren: blockType.allowedChildren,
    };

    onSave?.(fullBlockType);
    toast.success('Type de bloc sauvegardé', {
      description: `Le bloc "${blockType.label}" a été créé.`,
    });
    setIsOpen(false);
  };

  const generatePreview = () => {
    return JSON.stringify(blockType, null, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau Type de Bloc
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Créer un nouveau type de bloc
          </DialogTitle>
          <DialogDescription>
            Définissez la structure, les champs et la validation de votre nouveau bloc.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="fields">
              Champs
              {blockType.fields && blockType.fields.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">{blockType.fields.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="code">Code Généré</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="config" className="h-full m-0 overflow-auto p-4">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ID (unique, snake_case)</Label>
                    <Input
                      value={blockType.id || ''}
                      onChange={(e) => setBlockType(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '_') as any }))}
                      placeholder="mon_bloc"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom technique</Label>
                    <Input
                      value={blockType.name || ''}
                      onChange={(e) => setBlockType(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="MonBloc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label (affiché)</Label>
                    <Input
                      value={blockType.label || ''}
                      onChange={(e) => setBlockType(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="Mon Bloc"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={blockType.category || 'OTHER'}
                      onValueChange={(val: BlockCategoryId) => setBlockType(prev => ({ ...prev, category: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BLOCK_CATEGORIES).map(([id, cat]) => (
                          <SelectItem key={id} value={id}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Couleur</Label>
                    <Select
                      value={blockType.color || 'primary'}
                      onValueChange={(val: any) => setBlockType(prev => ({ ...prev, color: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="danger">Danger</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="accent">Accent</SelectItem>
                        <SelectItem value="muted">Muted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Icône</Label>
                    <Input
                      value={blockType.icon || ''}
                      onChange={(e) => setBlockType(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="Blocks"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={blockType.description || ''}
                    onChange={(e) => setBlockType(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du bloc pour l'utilisateur..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={blockType.canHaveChildren || false}
                    onCheckedChange={(checked) => setBlockType(prev => ({ ...prev, canHaveChildren: checked }))}
                  />
                  <Label>Peut contenir des blocs enfants</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fields" className="h-full m-0 overflow-hidden flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Définissez les champs que l'utilisateur pourra remplir
                </p>
                <Button size="sm" onClick={handleAddField}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un champ
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {blockType.fields?.map((field, index) => (
                      <FieldEditor
                        key={field.id || index}
                        field={field}
                        index={index}
                        onChange={handleFieldChange}
                        onRemove={handleRemoveField}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {(!blockType.fields || blockType.fields.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun champ défini</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={handleAddField}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter le premier champ
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="validation" className="h-full m-0 p-4">
              <div className="h-full flex flex-col gap-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Fonction de validation</AlertTitle>
                  <AlertDescription>
                    Écrivez une fonction JavaScript pour valider les valeurs du bloc.
                  </AlertDescription>
                </Alert>
                <div className="flex-1 border rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    language="javascript"
                    theme="vs-dark"
                    value={validationCode}
                    onChange={(v) => setValidationCode(v || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="h-full m-0 p-4">
              <div className="h-full flex flex-col gap-4">
                <Alert>
                  <Code className="h-4 w-4" />
                  <AlertTitle>Générateur de code TP</AlertTitle>
                  <AlertDescription>
                    Définissez comment ce bloc sera converti en code TP.
                  </AlertDescription>
                </Alert>
                <div className="flex-1 border rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    language="javascript"
                    theme="vs-dark"
                    value={generatorCode}
                    onChange={(v) => setGeneratorCode(v || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder le bloc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
