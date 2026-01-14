// BlockCard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Trash2, GripVertical, Lock, Unlock, Plus, Edit2, Save, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { BlockInstance, BlockFieldDefinition, getBlockType } from '../../lib/blocks/block-definitions';
import { useStudioStore } from '../../stores/studioStore';
import { cn } from '../../lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const ITEM_TYPE = 'BLOCK';

interface BlockCardProps {
  block: BlockInstance;
  depth?: number;
  index?: number;
  parentId?: string;
}

export function BlockCard({ block, depth = 0, index, parentId }: BlockCardProps) {
  const { selectedBlockId, selectBlock, updateBlock, removeBlock, addBlock, moveBlock } = useStudioStore();
  const blockType = useMemo(() => getBlockType(block.typeId), [block.typeId]);
  const isSelected = selectedBlockId === block.id;
  const [editingField, setEditingField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  if (!blockType) return null;

  const validateField = (fieldId: string, value: any) => {
    const field = blockType.fields.find(f => f.id === fieldId);
    if (!field) return null;

    if (field.validation?.required && !value) return field.validation.message || 'Champ requis';
    if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) return field.validation.message;
    if (field.validation?.minLength && (value?.length || 0) < field.validation.minLength) return field.validation.message;
    if (field.validation?.maxLength && (value?.length || 0) > field.validation.maxLength) return field.validation.message;
    if (field.validation?.min && (value || 0) < field.validation.min) return field.validation.message;
    if (field.validation?.max && (value || 0) > field.validation.max) return field.validation.message;

    if (field.customValidator) {
      const ctx = { ...block.values, type: blockType };
      return field.customValidator(value, ctx);
    }

    return null;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    const error = validateField(fieldId, value);
    setErrors(prev => ({ ...prev, [fieldId]: error || '' }));
    if (!error) {
      updateBlock(block.id, { [fieldId]: value });
      setEditingField(null);
    }
  };

  const toggleCollapse = () => updateBlock(block.id, { collapsed: !block.collapsed });
  const toggleLock = () => updateBlock(block.id, { locked: !block.locked });
  const handleRemove = () => removeBlock(block.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "block-card p-4 rounded-lg border bg-card",
        isSelected && "ring-2 ring-primary border-primary",
        depth > 0 && `ml-${depth * 4}`
      )}
      onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline"
            className={cn(
              "text-xs font-medium",
              `bg-${blockType.color}/10 text-${blockType.color} border-${blockType.color}/20`
            )}
          >
            {blockType.label}
          </Badge>
          
          <span className="text-sm font-medium truncate max-w-xs">
            {block.name || block.values.name || block.id.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-7 w-7">
                {block.collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{block.collapsed ? 'Déployer' : 'Réduire'}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleLock} className="h-7 w-7">
                {block.locked ? <Lock className="w-4 h-4 text-warning" /> : <Unlock className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{block.locked ? 'Déverrouiller' : 'Verrouiller'}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleRemove} className="h-7 w-7 text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Supprimer</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Fields */}
      {!block.collapsed && !block.locked && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          {blockType.fields.map(field => (
            <div key={field.id} className="space-y-1">
              <Label className="text-sm font-medium flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              <FieldRenderer 
                block={block}
                field={field}
                value={block.values[field.id]}
                onChange={(val) => handleFieldChange(field.id, val)}
                setEditing={setEditingField}
              />
              {errors[field.id] && (
                <p className="text-xs text-destructive mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))}

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Veuillez corriger les erreurs avant de continuer.
              </AlertDescription>
            </Alert>
          )}
        </motion.div>
      )}

      {/* Children */}
      <AnimatePresence>
        {!block.collapsed && block.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 border-t pt-4"
          >
            <Droppable droppableId={`children-${block.id}`} type="BLOCK">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                  {block.children.map((child, childIndex) => (
                    <Draggable key={child.id} draggableId={child.id} index={childIndex}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.7 : 1,
                          }}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="relative group"
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="absolute -left-9 top-3 opacity-0 group-hover:opacity-70 transition-opacity cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                          </div>

                          <BlockCard 
                            block={child} 
                            depth={depth + 1} 
                            index={childIndex} 
                            parentId={block.id}
                          />
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Child Button */}
      {!block.collapsed && !block.locked && blockType.allowedChildren?.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="mt-4">
              <Plus className="w-4 h-4 mr-2" /> Ajouter enfant
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <Command>
              <CommandInput placeholder="Rechercher un bloc..." />
              <CommandList>
                <CommandEmpty>Aucun bloc trouvé.</CommandEmpty>
                <CommandGroup>
                  {blockType.allowedChildren.map(typeId => {
                    const childType = getBlockType(typeId);
                    if (!childType) return null;
                    return (
                      <CommandItem
                        key={typeId}
                        onSelect={() => addBlock(typeId, block.id)}
                      >
                        {childType.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </motion.div>
  );
}

// Helper component for field rendering
interface FieldRendererProps {
  block: BlockInstance;
  field: BlockFieldDefinition;
  value: any;
  onChange: (value: any) => void;
  setEditing: (fieldId: string | null) => void;
}

function FieldRenderer({ block, field, value, onChange, setEditing }: FieldRendererProps) {
  const [localValue, setLocalValue] = useState(value);
  const [editingField, setEditingField] = useState<string | null>("true");
  const isEditing = (editingField === field.id);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(localValue);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setEditing(null);
  };

  const renderPreview = () => {
    if (field.previewRenderer) {
      return <p className="text-xs text-muted-foreground mt-1">{field.previewRenderer(value)}</p>;
    }
    return null;
  };

  if (block.locked || !isEditing) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground truncate flex-1">
          {value ?? field.placeholder ?? 'Non défini'}
        </p>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(field.id)}>
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  switch (field.type) {
    case 'text':
    case 'number':
      return (
        <div className="flex gap-2">
          <Input 
            type={field.type}
            value={localValue ?? ''}
            onChange={(e) => setLocalValue(field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
            placeholder={field.placeholder}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSave}>OK</Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>Annuler</Button>
        </div>
      );

    case 'select':
      return (
        <Select value={localValue ?? ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'multiselect':
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {(value?.length || 0) > 0 ? `${value.length} sélectionnés` : field.placeholder}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
            <Command>
              <CommandInput placeholder="Rechercher..." />
              <CommandList>
                <CommandEmpty>Aucun résultat.</CommandEmpty>
                <CommandGroup>
                  {field.options?.map(opt => (
                    <CommandItem 
                      key={opt.value} 
                      onSelect={() => {
                        const newValue = value?.includes(opt.value)
                          ? value.filter((v: string) => v !== opt.value)
                          : [...(value || []), opt.value];
                        onChange(newValue);
                      }}
                    >
                      {opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );

    case 'boolean':
      return (
        <Switch checked={value ?? false} onCheckedChange={onChange} />
      );

    case 'enum-values':
      return (
        <Droppable droppableId={`${block.id}-enum-${field.id}`} type="ENUM_VALUE">
          {(provided) => (
            <ScrollArea className="h-[150px] border rounded-md p-2 space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
              {(value || []).map((v: any, idx: number) => (
                <Draggable key={idx} draggableId={`${field.id}-enum-${idx}`} index={idx}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                      <GripVertical className="w-4 h-4 cursor-grab" {...provided.dragHandleProps} />
                      <Input 
                        value={v.name}
                        onChange={(e) => {
                          const newValues = [...value];
                          newValues[idx].name = e.target.value;
                          onChange(newValues);
                        }}
                        placeholder="Nom"
                        className="h-8 flex-1"
                      />
                      <Input 
                        value={v.value}
                        onChange={(e) => {
                          const newValues = [...value];
                          newValues[idx].value = e.target.value;
                          onChange(newValues);
                        }}
                        placeholder="Valeur (optionnel)"
                        className="h-8 w-32"
                      />
                      <Button size="icon" variant="ghost" onClick={() => onChange(value.filter((_: any, i: number) => i !== idx))}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => onChange([...(value || []), { name: '', value: '' }])}>
                <Plus className="w-4 h-4 mr-2" /> Ajouter valeur
              </Button>
            </ScrollArea>
          )}
        </Droppable>
      );

    case 'dataJson':
      return (
        <Droppable droppableId={`${block.id}-datajson-${field.id}`} type="FIELD">
          {(provided) => (
            <ScrollArea className="h-[200px] border rounded-md p-2 space-y-3" ref={provided.innerRef} {...provided.droppableProps}>
              {(value || []).map((v: any, idx: number) => (
                <Draggable key={idx} draggableId={`${field.id}-field-${idx}`} index={idx}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="bg-muted p-3 rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                        <GripVertical className="w-4 h-4 cursor-grab" {...provided.dragHandleProps} />
                        <Button size="icon" variant="ghost" onClick={() => onChange(value.filter((_: any, i: number) => i !== idx))}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <Input 
                        value={v.name}
                        onChange={(e) => {
                          const newValues = [...value];
                          newValues[idx].name = e.target.value;
                          onChange(newValues);
                        }}
                        placeholder="Nom du champ"
                      />
                      <Select 
                        value={v.dataType}
                        onValueChange={(val) => {
                          const newValues = [...value];
                          newValues[idx].dataType = val;
                          onChange(newValues);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type de données" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="String">String</SelectItem>
                          <SelectItem value="Int">Int</SelectItem>
                          <SelectItem value="Float">Float</SelectItem>
                          <SelectItem value="Boolean">Boolean</SelectItem>
                          <SelectItem value="DateTime">DateTime</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Switch checked={v.isRequired} onCheckedChange={(checked) => {
                          const newValues = [...value];
                          newValues[idx].isRequired = checked;
                          onChange(newValues);
                        }} /> Requis
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={v.isUnique} onCheckedChange={(checked) => {
                          const newValues = [...value];
                          newValues[idx].isUnique = checked;
                          onChange(newValues);
                        }} /> Unique
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <Button variant="outline" className="w-full mt-2" onClick={() => onChange([...(value || []), { name: '', dataType: 'String', isRequired: false, isUnique: false }])}>
                <Plus className="w-4 h-4 mr-2" /> Ajouter champ
              </Button>
            </ScrollArea>
          )}
        </Droppable>
      );

    case 'code':
    case 'json':
      return (
        <div className="border rounded-md">
          <Editor
            height="150px"
            language={field.type === 'code' ? 'javascript' : 'json'}
            theme="vs-dark"
            value={localValue || ''}
            onChange={(v) => setLocalValue(v || '')}
            options={{
              minimap: { enabled: false },
              scrollbar: { vertical: 'auto' },
              overviewRulerLanes: 0,
              fontSize: 12,
              tabSize: 2,
            }}
          />
          <div className="flex justify-end gap-2 p-2 border-t">
            <Button size="sm" onClick={handleSave}>Sauvegarder</Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>Annuler</Button>
          </div>
          {renderPreview()}
        </div>
      );

    case 'array':
      return (
        <Droppable droppableId={`${block.id}-${field.id}`} type="ARRAY_ITEM">
          {(provided) => (
            <ScrollArea className="h-[200px] border rounded-md p-2 space-y-3" ref={provided.innerRef} {...provided.droppableProps}>
              {(value || []).map((item: any, idx: number) => (
                <Draggable key={idx} draggableId={`${field.id}-item-${idx}`} index={idx}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="bg-muted p-3 rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                        <GripVertical className="w-4 h-4 cursor-grab" {...provided.dragHandleProps} />
                        <Button size="icon" variant="ghost" onClick={() => {
                          const newValues = value.filter((_: any, i: number) => i !== idx);
                          onChange(newValues.length >= (field.minItems || 0) ? newValues : value);
                        }}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <BlockFields fields={field.nestedType?.fields || []} values={item} onChange={(newItem) => {
                        const newValues = [...value];
                        newValues[idx] = newItem;
                        onChange(newValues);
                      }} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <Button variant="outline" className="w-full" onClick={() => {
                const newItem = {};
                onChange([...(value || []), newItem]);
              }} disabled={(value?.length || 0) >= (field.maxItems || Infinity)}>
                <Plus className="w-4 h-4 mr-2" /> Ajouter item
              </Button>
            </ScrollArea>
          )}
        </Droppable>
      );

    case 'object':
      return (
        <div className="border rounded-md p-3 space-y-3">
          <BlockFields 
            fields={field.nestedType?.fields || []} 
            values={value || {}} 
            onChange={onChange} 
          />
          {renderPreview()}
        </div>
      );

    default:
      return <div className="text-xs text-muted-foreground">Type non supporté: {field.type}</div>;
  }
}

// Recursive sub-component for nested fields
interface BlockFieldsProps {
  fields: BlockFieldDefinition[];
  values: Record<string, any>;
  onChange: (newValues: Record<string, any>) => void;
}

function BlockFields({ fields, values, onChange }: BlockFieldsProps) {
  return (
    <div className="space-y-3">
      {fields.map(field => (
        <div key={field.id} className="space-y-1">
          <Label htmlFor={field.id}>{field.label}</Label>
          <FieldRenderer
            block={{ id: 'nested', typeId: 'object', values, children: [], collapsed: false, locked: false, order: 0, name: 'nested', metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1 } }}
            field={field}
            value={values[field.id]}
            onChange={(val) => onChange({ ...values, [field.id]: val })}
            setEditing={() => {}}
          />
        </div>
      ))}
    </div>
    
  );
}