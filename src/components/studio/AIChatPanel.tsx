// AIChatPanel.tsx - Chat avec AI pour suggestions et parsing vers blocks
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, Loader2, Sparkles, X, Maximize2, Minimize2,
  RefreshCw, Copy, Check, Settings, Wand2, Code, FileCode,
  ArrowRight, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useStudioStore } from '@/stores/studioStore';
import { toast } from '@/components/ui/sonner';
import { BLOCK_TYPES, getBlockType } from '@/lib/blocks/block-definitions';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  blocks?: ParsedBlock[];
}

interface ParsedBlock {
  typeId: string;
  name: string;
  values: Record<string, any>;
}

interface OllamaModel {
  name: string;
  size: string;
  modified: string;
}

// Simulated block parsing from AI response
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
    } catch (e) {
      // Not valid JSON
    }
  }

  // Try to detect block mentions in natural language
  const blockTypeNames = BLOCK_TYPES.map(b => b.id.toLowerCase());
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach((word, i) => {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (blockTypeNames.includes(cleanWord)) {
      // Look for a name after the block type
      const nextWord = words[i + 1]?.replace(/[^a-zA-Z0-9_]/g, '');
      if (nextWord && nextWord.length > 2 && !blockTypeNames.includes(nextWord.toLowerCase())) {
        blocks.push({
          typeId: cleanWord,
          name: nextWord.charAt(0).toUpperCase() + nextWord.slice(1),
          values: {}
        });
      }
    }
  });

  return blocks;
}

export function AIChatPanel() {
  const { addBlock, blocks } = useStudioStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system',
      role: 'system',
      content: "Bonjour ! Je suis l'assistant AI pour vous aider à créer votre projet. Décrivez-moi ce que vous voulez construire et je vous suggérerai les blocs appropriés.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check Ollama connection
  const checkOllama = useCallback(async () => {
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`, {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        setOllamaModels(data.models || []);
        setOllamaConnected(true);
        if (data.models?.length > 0 && !selectedModel) {
          setSelectedModel(data.models[0].name);
        }
        return true;
      }
    } catch (e) {
      console.log('Ollama not available');
    }
    setOllamaConnected(false);
    return false;
  }, [ollamaUrl, selectedModel]);

  useEffect(() => {
    checkOllama();
  }, [checkOllama]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build context from current blocks
  const buildContext = useCallback(() => {
    const blockSummary = blocks.map(b => {
      const type = getBlockType(b.typeId);
      return `- ${type?.label || b.typeId}: ${b.values?.name || b.name || 'unnamed'}`;
    }).join('\n');

    return `
Contexte du projet actuel:
${blocks.length > 0 ? blockSummary : 'Aucun bloc créé pour le moment.'}

Types de blocs disponibles:
${BLOCK_TYPES.slice(0, 20).map(b => `- ${b.id}: ${b.description}`).join('\n')}

Instructions:
- Suggère des blocs pertinents basés sur la demande
- Retourne les suggestions au format JSON quand possible
- Sois concis et précis
`;
  }, [blocks]);

  // Send message to Ollama
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
      if (ollamaConnected) {
        // Real Ollama call
        const response = await fetch(`${ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            prompt: `${buildContext()}\n\nUtilisateur: ${input}\n\nAssistant:`,
            stream: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiContent = data.response || "Je n'ai pas pu générer une réponse.";
          const parsedBlocks = parseBlocksFromText(aiContent);

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiContent,
            timestamp: new Date(),
            blocks: parsedBlocks.length > 0 ? parsedBlocks : undefined
          };

          setMessages(prev => [...prev, aiMessage]);
        } else {
          throw new Error('Ollama response error');
        }
      } else {
        // Fallback: smart local response
        const aiMessage = generateLocalResponse(input);
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('Erreur AI', {
        description: 'Impossible de communiquer avec le modèle AI.',
      });
      
      // Fallback response
      const fallbackMessage = generateLocalResponse(input);
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate local response when Ollama is not available
  const generateLocalResponse = (userInput: string): Message => {
    const inputLower = userInput.toLowerCase();
    let content = '';
    const parsedBlocks: ParsedBlock[] = [];

    // Simple keyword matching for suggestions
    if (inputLower.includes('api') || inputLower.includes('rest')) {
      content = "Je vous suggère de créer une API REST. Voici les blocs recommandés:\n\n";
      content += "1. **API** - Pour définir l'API principale\n";
      content += "2. **Endpoint** - Pour chaque route (GET, POST, etc.)\n";
      content += "3. **Model** - Pour les données manipulées\n";
      
      parsedBlocks.push(
        { typeId: 'api', name: 'API', values: { type: 'REST' } },
        { typeId: 'endpoint', name: 'GetUsers', values: { method: 'GET', path: '/users' } }
      );
    } else if (inputLower.includes('model') || inputLower.includes('données') || inputLower.includes('base')) {
      content = "Pour modéliser vos données, je vous suggère:\n\n";
      content += "1. **Model** - Pour définir vos entités\n";
      content += "2. **Field** - Pour les champs de chaque modèle\n";
      content += "3. **Relation** - Pour lier les modèles entre eux\n";
      
      parsedBlocks.push(
        { typeId: 'model', name: 'User', values: { fields: [] } }
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
    } else {
      content = "Je peux vous aider à créer différents types de blocs:\n\n";
      content += "• **Données**: Model, Enum, DataJson\n";
      content += "• **API**: API, Endpoint, Microservice\n";
      content += "• **UI**: Page, Component, Section\n";
      content += "• **Architecture**: CQRS, EventSourcing, Workflow\n\n";
      content += "Décrivez-moi plus précisément ce que vous voulez construire!";
    }

    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      blocks: parsedBlocks.length > 0 ? parsedBlocks : undefined
    };
  };

  // Add suggested blocks to canvas
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-card border rounded-xl shadow-2xl overflow-hidden transition-all duration-300",
        isExpanded ? "w-[500px] h-[600px]" : "w-[380px] h-[500px]"
      )}
    >
      {/* Header */}
      <div className="p-3 border-b bg-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Assistant AI</h3>
            <div className="flex items-center gap-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                ollamaConnected ? "bg-green-500" : "bg-yellow-500"
              )} />
              <span className="text-xs text-muted-foreground">
                {ollamaConnected ? selectedModel : 'Mode local'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {ollamaConnected && (
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ollamaModels.map(model => (
                  <SelectItem key={model.name} value={model.name} className="text-xs">
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 h-[calc(100%-130px)]" ref={scrollRef}>
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
                  "max-w-[85%] rounded-lg px-4 py-2",
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Suggested blocks */}
                  {message.blocks && message.blocks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium opacity-70">Blocs suggérés:</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => handleAddAllBlocks(message.blocks!)}
                        >
                          Tout ajouter
                        </Button>
                      </div>
                      {message.blocks.map((block, i) => {
                        const blockType = getBlockType(block.typeId);
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 p-2 rounded bg-background/50"
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
                  
                  <span className="text-[10px] opacity-50 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Réflexion en cours...</span>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-card">
        {!ollamaConnected && (
          <Alert className="mb-2 py-2">
            <Sparkles className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Mode local actif. Connectez Ollama pour des suggestions avancées.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez ce que vous voulez créer..."
            className="flex-1 min-h-[40px] max-h-[100px] resize-none"
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
            size="icon"
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
