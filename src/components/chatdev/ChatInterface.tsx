import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  StopCircle, 
  Loader2, 
  Bot, 
  User, 
  Code,
  FileCode,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useChatDevStore, ChatMessage, Diff } from '../../stores/chatdevStore';
import ollamaService from '../../lib/ollama/ollamaService';
import { modelRouter } from '../../lib/ollama/modelRouter';
import generationEngine from '../../lib/generation/generationEngine';
import DiffViewer from './DiffViewer';

export default function ChatInterface() {
  const {
    messages,
    addMessage,
    updateMessage,
    isGenerating,
    setIsGenerating,
    selectedModel,
    ollamaStatus,
    projectSpec,
    generatedFiles,
    addGeneratedFile,
  } = useChatDevStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;
    if (!selectedModel || !ollamaStatus.isConnected) {
      addMessage({
        type: 'system',
        content: '⚠️ Veuillez configurer Ollama et sélectionner un modèle dans le panneau de droite.',
      });
      return;
    }

    const userInput = input.trim();
    setInput('');
    setIsGenerating(true);

    // Ajouter le message utilisateur
    addMessage({
      type: 'user',
      content: userInput,
    });

    // Créer un message assistant vide pour le streaming
    const assistantMessageId = crypto.randomUUID();
    addMessage({
      type: 'assistant',
      content: '',
      isStreaming: true,
    });

    try {
      // Déterminer le type de tâche
      const taskType = modelRouter.getTaskType(userInput);
      const model = modelRouter.selectModel(taskType) || selectedModel;

      // Construire le contexte
      const contextMessages = buildContextMessages(userInput);

      let streamedContent = '';
      let diffs: Diff[] = [];

      // Si on a un projet configuré et que c'est une demande de génération
      if (projectSpec && isGenerationRequest(userInput)) {
        // Utiliser le moteur de génération
        const plan = await generationEngine.createPlan(projectSpec);
        
        for (const task of plan.slice(0, 3)) { // Limiter à 3 tâches pour la démo
          streamedContent += `\n\n📋 **${task.description}**\n`;
          updateMessage(assistantMessageId, { 
            content: streamedContent,
            isStreaming: true 
          });

          const taskDiffs = await generationEngine.executeTask(
            task,
            projectSpec,
            generatedFiles,
            (token) => {
              streamedContent += token;
              updateMessage(assistantMessageId, { 
                content: streamedContent,
                isStreaming: true 
              });
            }
          );

          diffs = [...diffs, ...taskDiffs];

          // Sauvegarder les fichiers
          for (const diff of taskDiffs) {
            addGeneratedFile(diff.file, diff.modified);
          }
        }

        streamedContent += '\n\n✅ Génération terminée!';
      } else {
        // Chat simple avec streaming
        await ollamaService.chat(
          contextMessages,
          { model, temperature: 0.7, max_tokens: 2048 },
          (token) => {
            streamedContent += token;
            updateMessage(assistantMessageId, { 
              content: streamedContent,
              isStreaming: true 
            });
          }
        );

        // Parser les éventuels blocs de code comme diffs
        diffs = parseCodeBlocksAsDiffs(streamedContent);
      }

      // Finaliser le message
      updateMessage(assistantMessageId, {
        content: streamedContent,
        diffs: diffs.length > 0 ? diffs : undefined,
        isStreaming: false,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      updateMessage(assistantMessageId, {
        content: `❌ Erreur: ${errorMessage}`,
        isStreaming: false,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    ollamaService.stopGeneration();
    setIsGenerating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const buildContextMessages = (userInput: string) => {
    const systemPrompt = projectSpec
      ? `Tu es un assistant de développement expert. Tu aides à créer un projet ${projectSpec.type} avec ${projectSpec.framework}.
Projet: ${projectSpec.name}
Description: ${projectSpec.description}
Génère du code propre, commenté et fonctionnel.`
      : `Tu es CHATDEV, un assistant de développement IA. Tu aides à créer des projets Node.js et Python complets.
Réponds de manière concise et génère du code quand demandé.`;

    const contextMessages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      { role: 'system', content: systemPrompt },
    ];

    // Ajouter les derniers messages pour le contexte (limité pour CPU)
    const recentMessages = messages.slice(-6);
    for (const msg of recentMessages) {
      if (msg.type === 'user') {
        contextMessages.push({ role: 'user', content: msg.content });
      } else if (msg.type === 'assistant') {
        contextMessages.push({ role: 'assistant', content: msg.content.slice(0, 500) });
      }
    }

    contextMessages.push({ role: 'user', content: userInput });
    return contextMessages;
  };

  const isGenerationRequest = (input: string): boolean => {
    const keywords = ['génère', 'crée', 'implemente', 'développe', 'code', 'generate', 'create', 'implement'];
    return keywords.some(kw => input.toLowerCase().includes(kw));
  };

  const parseCodeBlocksAsDiffs = (content: string): Diff[] => {
    const diffs: Diff[] = [];
    const regex = /```(\w+)\n([\s\S]*?)```/g;
    let match;
    let index = 0;

    while ((match = regex.exec(content)) !== null) {
      const language = match[1];
      const code = match[2].trim();
      
      // Essayer d'extraire le nom du fichier
      const fileMatch = content.slice(Math.max(0, match.index - 100), match.index)
        .match(/(?:fichier|file|créer|create)[\s:]*`?([a-zA-Z0-9_\-./]+\.[a-z]+)`?/i);
      
      const fileName = fileMatch ? fileMatch[1] : `snippet_${index}.${getExtension(language)}`;
      
      diffs.push({
        file: fileName,
        original: '',
        modified: code,
        language,
        status: 'pending',
      });
      index++;
    }

    return diffs;
  };

  const getExtension = (lang: string): string => {
    const map: Record<string, string> = {
      typescript: 'ts', javascript: 'js', python: 'py',
      json: 'json', yaml: 'yml', html: 'html', css: 'css',
    };
    return map[lang.toLowerCase()] || 'txt';
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">CHATDEV Assistant</h3>
        </div>
        {selectedModel && (
          <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">
            {selectedModel}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Bienvenue dans CHATDEV!</p>
            <p className="text-sm">
              {projectSpec 
                ? `Projet "${projectSpec.name}" configuré. Demandez-moi de générer du code!`
                : 'Configurez un projet via l\'assistant ou posez-moi une question.'}
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              !ollamaStatus.isConnected 
                ? "Configurez Ollama pour commencer..."
                : "Décrivez ce que vous voulez créer..."
            }
            disabled={!ollamaStatus.isConnected || isGenerating}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white resize-none min-h-[48px] max-h-[120px] disabled:opacity-50"
            rows={1}
          />
          
          {isGenerating ? (
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <StopCircle className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || !ollamaStatus.isConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant MessageBubble
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-xl p-4 ${
          isUser
            ? 'bg-blue-600/30 border border-blue-500/30'
            : isSystem
              ? 'bg-yellow-600/20 border border-yellow-500/30'
              : 'bg-gray-800/50 border border-gray-700'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          {isUser ? (
            <User className="w-4 h-4 text-blue-400" />
          ) : isSystem ? (
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          ) : (
            <Bot className="w-4 h-4 text-green-400" />
          )}
          <span className="text-xs text-gray-400">
            {isUser ? 'Vous' : isSystem ? 'Système' : 'CHATDEV'}
          </span>
          {message.isStreaming && (
            <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
          )}
        </div>

        {/* Content */}
        <div className="text-gray-200 whitespace-pre-wrap">
          <FormattedContent content={message.content} />
        </div>

        {/* Diffs */}
        {message.diffs && message.diffs.length > 0 && (
          <div className="mt-4">
            <DiffViewer diffs={message.diffs} />
          </div>
        )}

        {/* Score */}
        {message.score && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(message.score).map(([key, value]) => (
              <div key={key} className="flex justify-between bg-gray-900/50 rounded px-2 py-1">
                <span className="text-gray-400 capitalize">{key}</span>
                <span className={value >= 70 ? 'text-green-400' : 'text-yellow-400'}>
                  {value}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Formatage du contenu avec syntaxe markdown basique
function FormattedContent({ content }: { content: string }) {
  // Parser le markdown basique
  const parts = content.split(/(```[\s\S]*?```|\*\*.*?\*\*|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
          if (match) {
            return (
              <pre key={i} className="bg-gray-900 rounded-lg p-3 my-2 overflow-x-auto text-sm">
                <code className={`language-${match[1]}`}>{match[2]}</code>
              </pre>
            );
          }
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="bg-gray-800 px-1 rounded text-blue-300">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
