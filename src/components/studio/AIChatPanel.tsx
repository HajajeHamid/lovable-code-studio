// ============================================
// AI CHAT PANEL - Enhanced with Ollama Integration
// Chat avec AI pour suggestions et parsing vers blocks
// ============================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, Loader2, Sparkles, X, Maximize2, Minimize2,
  RefreshCw, Copy, Check, Settings, Wand2, Code, FileCode,
  ArrowRight, ChevronDown, Server, AlertCircle, Download,
  Play, Cpu, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useStudioStore } from '@/stores/studioStore';
import { toast } from 'sonner';
import { BLOCK_TYPES, getBlockType } from '@/lib/blocks/block-definitions';
import { 
  OllamaService, 
  OllamaModel, 
  formatModelSize, 
  formatModelDate,
  getOllamaService 
} from '@/lib/ollama';

// ============================================
// TYPES
// ============================================

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  blocks?: ParsedBlock[];
  isStreaming?: boolean;
}

interface ParsedBlock {
  typeId: string;
  name: string;
  values: Record<string, any>;
}

// ============================================
// BLOCK PARSING
// ============================================

function parseBlocksFromText(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  
  // Try to find JSON block definitions in the response
  const jsonMatches = text.matchAll(/```json\s*([\s\S]*?)```/g);
  for (const match of jsonMatches) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (item.typeId && BLOCK_TYPES.find(b => b.id === item.typeId)) {
            blocks.push({
              typeId: item.typeId,
              name: item.name || item.typeId,
              values: item.values || {}
            });
          }
        });
      } else if (parsed.typeId) {
        blocks.push({
          typeId: parsed.typeId,
          name: parsed.name || parsed.typeId,
          values: parsed.values || {}
        });
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  // Try to detect block mentions in natural language
  const blockTypeNames = BLOCK_TYPES.map(b => b.id.toLowerCase());
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach((word, i) => {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (blockTypeNames.includes(cleanWord)) {
      const nextWord = words[i + 1]?.replace(/[^a-zA-Z0-9_]/g, '');
      if (nextWord && nextWord.length > 2 && !blockTypeNames.includes(nextWord.toLowerCase())) {
        // Avoid duplicates
        if (!blocks.find(b => b.typeId === cleanWord && b.name.toLowerCase() === nextWord.toLowerCase())) {
          blocks.push({
            typeId: cleanWord,
            name: nextWord.charAt(0).toUpperCase() + nextWord.slice(1),
            values: {}
          });
        }
      }
    }
  });

  return blocks;
}

// ============================================
// LOCAL RESPONSE GENERATOR
// ============================================

function generateLocalResponse(userInput: string): Message {
  const inputLower = userInput.toLowerCase();
  let content = '';
  const parsedBlocks: ParsedBlock[] = [];

  if (inputLower.includes('api') || inputLower.includes('rest')) {
    content = "Je vous suggère de créer une API REST. Voici les blocs recommandés:\n\n";
    content += "1. **API** - Pour définir l'API principale\n";
    content += "2. **Endpoint** - Pour chaque route (GET, POST, etc.)\n";
    content += "3. **Model** - Pour les données manipulées\n";
    
    parsedBlocks.push(
      { typeId: 'api', name: 'MainAPI', values: { type: 'REST' } },
      { typeId: 'endpoint', name: 'GetUsers', values: { method: 'GET', path: '/users' } }
    );
  } else if (inputLower.includes('model') || inputLower.includes('données') || inputLower.includes('base')) {
    content = "Pour modéliser vos données, je vous suggère:\n\n";
    content += "1. **Model** - Pour définir vos entités\n";
    content += "2. **Field** - Pour les champs de chaque modèle\n";
    content += "3. **Relation** - Pour lier les modèles entre eux\n";
    
    parsedBlocks.push(
      { typeId: 'model', name: 'User', values: { fields: [] } },
      { typeId: 'field', name: 'email', values: { type: 'String', required: true } }
    );
  } else if (inputLower.includes('page') || inputLower.includes('interface') || inputLower.includes('ui')) {
    content = "Pour créer votre interface utilisateur:\n\n";
    content += "1. **Page** - Pour chaque page de l'application\n";
    content += "2. **Component** - Pour les composants réutilisables\n";
    content += "3. **Section** - Pour organiser le contenu\n";
    
    parsedBlocks.push(
      { typeId: 'page', name: 'HomePage', values: { path: '/' } },
      { typeId: 'component', name: 'Header', values: {} }
    );
  } else if (inputLower.includes('auth') || inputLower.includes('sécurité') || inputLower.includes('login')) {
    content = "Pour implémenter l'authentification:\n\n";
    content += "1. **Security** - Pour configurer l'auth (JWT, OAuth)\n";
    content += "2. **Model** User - Pour stocker les utilisateurs\n";
    content += "3. **Endpoint** login/register - Pour les routes auth\n";
    
    parsedBlocks.push(
      { typeId: 'security', name: 'Auth', values: { auth: 'JWT' } },
      { typeId: 'model', name: 'User', values: {} }
    );
  } else if (inputLower.includes('test') || inputLower.includes('qualité')) {
    content = "Pour les tests et la qualité:\n\n";
    content += "1. **TestSuite** - Suite de tests pour un module\n";
    content += "2. **GenTest** - Génération automatique de tests\n";
    content += "3. **Mock** - Données de test simulées\n";
    
    parsedBlocks.push(
      { typeId: 'testsuite', name: 'UserTests', values: {} },
      { typeId: 'gentest', name: 'AutoTests', values: {} }
    );
  } else if (inputLower.includes('deploy') || inputLower.includes('production') || inputLower.includes('cicd')) {
    content = "Pour le déploiement et CI/CD:\n\n";
    content += "1. **CICDGen** - Pipeline CI/CD\n";
    content += "2. **Deploy** - Configuration déploiement\n";
    content += "3. **Monitoring** - Surveillance production\n";
    
    parsedBlocks.push(
      { typeId: 'cicdgen', name: 'MainPipeline', values: {} },
      { typeId: 'monitoring', name: 'AppMonitoring', values: {} }
    );
  } else {
    content = "Je peux vous aider à créer différents types de blocs:\n\n";
    content += "• **Données**: Model, Enum, DataJson, Field\n";
    content += "• **API**: API, Endpoint, Microservice\n";
    content += "• **UI**: Page, Component, Section, Layout\n";
    content += "• **Architecture**: CQRS, EventSourcing, Saga, Workflow\n";
    content += "• **Tests**: TestSuite, GenTest, Mock\n";
    content += "• **Infra**: Cache, Monitoring, CICDGen\n\n";
    content += "Décrivez-moi plus précisément ce que vous voulez construire!";
  }

  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    blocks: parsedBlocks.length > 0 ? parsedBlocks : undefined
  };
}

// ============================================
// AI CHAT PANEL COMPONENT
// ============================================

export function AIChatPanel() {
  const { addBlock, blocks } = useStudioStore();
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system',
      role: 'system',
      content: "Bonjour ! Je suis l'assistant AI. Décrivez ce que vous voulez construire et je vous suggérerai les blocs appropriés. Connectez Ollama pour des suggestions avancées.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Ollama state
  const [ollamaService] = useState(() => getOllamaService());
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Check Ollama Connection ───────────────────────────────────────────────
  const checkOllamaConnection = useCallback(async () => {
    setIsCheckingConnection(true);
    setConnectionError(null);
    
    try {
      ollamaService.setUrl(ollamaUrl);
      const connected = await ollamaService.checkConnection();
      
      if (connected) {
        const models = await ollamaService.listModels();
        setOllamaModels(models);
        setOllamaConnected(true);
        
        // Auto-select first model if none selected
        if (models.length > 0 && !selectedModel) {
          setSelectedModel(models[0].name);
        }
        
        toast.success('Ollama connecté', {
          description: `${models.length} modèle(s) disponible(s)`,
        });
      } else {
        setOllamaConnected(false);
        setOllamaModels([]);
        setConnectionError('Ollama non disponible. Vérifiez qu\'il est lancé.');
      }
    } catch (error) {
      setOllamaConnected(false);
      setOllamaModels([]);
      setConnectionError(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setIsCheckingConnection(false);
    }
  }, [ollamaUrl, ollamaService, selectedModel]);

  // Auto-check on mount
  useEffect(() => {
    checkOllamaConnection();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ─── Build Context ─────────────────────────────────────────────────────────
  const buildContext = useCallback(() => {
    const blockSummary = blocks.map(b => {
      const type = getBlockType(b.typeId);
      return `- ${type?.label || b.typeId}: ${b.values?.name || b.name || 'unnamed'}`;
    }).join('\n');

    return `
Tu es un assistant expert en création de projets avec le langage TP (TechPlatform).
Tu dois suggérer des blocs pertinents basés sur la demande de l'utilisateur.

Contexte du projet actuel:
${blocks.length > 0 ? blockSummary : 'Aucun bloc créé.'}

Types de blocs disponibles:
${BLOCK_TYPES.slice(0, 25).map(b => `- ${b.id}: ${b.description}`).join('\n')}

Instructions importantes:
1. Suggère des blocs pertinents au format JSON quand possible
2. Utilise le format: {"typeId": "...", "name": "...", "values": {...}}
3. Sois concis et pratique
4. Réponds en français
`;
  }, [blocks]);

  // ─── Send Message ──────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (ollamaConnected && selectedModel) {
        // Create assistant message for streaming
        const assistantId = (Date.now() + 1).toString();
        let streamedContent = '';
        
        setMessages(prev => [...prev, {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true
        }]);

        // Use Ollama streaming
        await ollamaService.generateStream(
          {
            model: selectedModel,
            prompt: input,
            system: buildContext(),
            options: {
              temperature: 0.7,
              top_p: 0.9,
            }
          },
          (token) => {
            streamedContent += token;
            setMessages(prev => prev.map(m => 
              m.id === assistantId 
                ? { ...m, content: streamedContent }
                : m
            ));
          },
          () => {
            // On done - parse blocks
            const parsedBlocks = parseBlocksFromText(streamedContent);
            setMessages(prev => prev.map(m => 
              m.id === assistantId 
                ? { ...m, isStreaming: false, blocks: parsedBlocks.length > 0 ? parsedBlocks : undefined }
                : m
            ));
          }
        );
      } else {
        // Fallback: smart local response
        await new Promise(r => setTimeout(r, 500)); // Simulate delay
        const aiMessage = generateLocalResponse(input);
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      
      // Show error and fallback
      toast.error('Erreur AI', {
        description: error instanceof Error ? error.message : 'Erreur inconnue',
      });
      
      const fallbackMessage = generateLocalResponse(input);
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Cancel Request ────────────────────────────────────────────────────────
  const cancelRequest = () => {
    ollamaService.cancel();
    setIsLoading(false);
    toast.info('Requête annulée');
  };

  // ─── Add Block Handlers ────────────────────────────────────────────────────
  const handleAddBlock = (block: ParsedBlock) => {
    addBlock(block.typeId);
    toast.success('Bloc ajouté', {
      description: `${block.name} a été ajouté au canvas.`,
    });
  };

  const handleAddAllBlocks = (blocksList: ParsedBlock[]) => {
    blocksList.forEach(block => addBlock(block.typeId));
    toast.success('Blocs ajoutés', {
      description: `${blocksList.length} bloc(s) ajouté(s) au canvas.`,
    });
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden transition-all duration-300",
        isExpanded ? "w-[550px] h-[700px]" : "w-[400px] h-[550px]"
      )}
    >
      {/* Header */}
      <div className="p-3 border-b border-border bg-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            ollamaConnected ? "bg-success/20" : "bg-warning/20"
          )}>
            <Bot className={cn("w-5 h-5", ollamaConnected ? "text-success" : "text-warning")} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Assistant AI</h3>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-2 h-2 rounded-full",
                ollamaConnected ? "bg-success animate-pulse" : "bg-warning"
              )} />
              <span className="text-xs text-muted-foreground">
                {ollamaConnected ? selectedModel || 'Ollama connecté' : 'Mode local'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Paramètres Ollama</TooltipContent>
          </Tooltip>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border overflow-hidden"
          >
            <div className="p-3 space-y-3 bg-muted/30">
              {/* Ollama URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">URL Ollama</label>
                <div className="flex gap-2">
                  <Input
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={checkOllamaConnection}
                    disabled={isCheckingConnection}
                    className="h-8 px-3"
                  >
                    {isCheckingConnection ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Connection Status */}
              {connectionError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{connectionError}</AlertDescription>
                </Alert>
              )}

              {/* Model Selection */}
              {ollamaConnected && ollamaModels.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Modèle ({ollamaModels.length} disponible{ollamaModels.length > 1 ? 's' : ''})
                  </label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sélectionner un modèle" />
                    </SelectTrigger>
                    <SelectContent>
                      {ollamaModels.map(model => (
                        <SelectItem key={model.name} value={model.name}>
                          <div className="flex items-center gap-2">
                            <Cpu className="w-3 h-3 text-muted-foreground" />
                            <span>{model.name}</span>
                            <Badge variant="outline" className="text-[10px] h-4">
                              {formatModelSize(model.size)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Models List Details */}
              {ollamaConnected && ollamaModels.length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between h-7 text-xs">
                      <span>Détails des modèles</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
                      {ollamaModels.map(model => (
                        <div 
                          key={model.name}
                          className={cn(
                            "p-2 rounded text-xs bg-background border transition-colors cursor-pointer",
                            selectedModel === model.name && "border-primary bg-primary/5"
                          )}
                          onClick={() => setSelectedModel(model.name)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{model.name}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {formatModelSize(model.size)}
                            </Badge>
                          </div>
                          {model.details && (
                            <div className="text-muted-foreground mt-1">
                              {model.details.parameter_size} • {model.details.quantization_level}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Help for Ollama */}
              {!ollamaConnected && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Pour activer Ollama:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                    <li>Installez Ollama: <code className="bg-muted px-1 rounded">curl -fsSL https://ollama.ai/install.sh | sh</code></li>
                    <li>Lancez Ollama: <code className="bg-muted px-1 rounded">ollama serve</code></li>
                    <li>Téléchargez un modèle: <code className="bg-muted px-1 rounded">ollama pull llama3.2</code></li>
                    <li>Cliquez sur Refresh ci-dessus</li>
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <ScrollArea className="flex-1 h-[calc(100%-140px)]" ref={scrollRef}>
        <div className="p-4 space-y-4">
          <AnimatePresence>
            {messages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  "max-w-[85%] rounded-lg px-4 py-2.5",
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                )}>
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-primary ml-1 animate-pulse" />
                    )}
                  </p>
                  
                  {/* Suggested blocks */}
                  {message.blocks && message.blocks.length > 0 && !message.isStreaming && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium opacity-70 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Blocs suggérés
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => handleAddAllBlocks(message.blocks!)}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Tout ajouter
                        </Button>
                      </div>
                      {message.blocks.map((block, i) => {
                        const blockType = getBlockType(block.typeId);
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 p-2 rounded bg-background/50 hover:bg-background/80 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {blockType?.label || block.typeId}
                              </Badge>
                              <span className="text-xs">{block.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleAddBlock(block)}
                            >
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <span className="text-[10px] opacity-50 mt-1.5 block">
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Loading indicator */}
          {isLoading && !messages.some(m => m.isStreaming) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm">Réflexion en cours...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs ml-2"
                  onClick={cancelRequest}
                >
                  Annuler
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-card">
        {!ollamaConnected && !showSettings && (
          <Alert className="mb-2 py-2">
            <Sparkles className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Mode local actif. <button onClick={() => setShowSettings(true)} className="underline">Configurer Ollama</button> pour des suggestions avancées.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez ce que vous voulez créer..."
            className="flex-1 min-h-[40px] max-h-[100px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 p-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default AIChatPanel;
