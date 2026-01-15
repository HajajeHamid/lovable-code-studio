import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Wand2, 
  FolderTree, 
  Settings,
  Cpu,
  Sparkles
} from 'lucide-react';
import { useChatDevStore } from '../../stores/chatdevStore';
import ollamaService from '../../lib/ollama/ollamaService';
import { modelRouter } from '../../lib/ollama/modelRouter';
import ChatInterface from './ChatInterface';
import ProjectWizard from './ProjectWizard';
import FileExplorer from './FileExplorer';
import OllamaPanel from './OllamaPanel';

const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'wizard', label: 'Nouveau Projet', icon: Wand2 },
  { id: 'files', label: 'Fichiers', icon: FolderTree },
  { id: 'settings', label: 'Paramètres', icon: Settings },
] as const;

export default function ChatDevLayout() {
  const { 
    activePanel, 
    setActivePanel,
    ollamaStatus,
    setOllamaStatus,
    selectedModel,
    projectSpec,
    generatedFiles,
  } = useChatDevStore();

  // Vérifier la connexion Ollama au démarrage
  useEffect(() => {
    const checkOllama = async () => {
      const status = await ollamaService.checkConnection();
      setOllamaStatus(status);
      if (status.isConnected) {
        modelRouter.updateAvailableModels(status.models);
      }
    };
    checkOllama();
  }, [setOllamaStatus]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CHATDEV
              </h1>
              <p className="text-xs text-gray-500">AI Project Builder</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            {projectSpec && (
              <div className="px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                <span className="text-sm text-purple-300">
                  📦 {projectSpec.name}
                </span>
              </div>
            )}
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              ollamaStatus.isConnected 
                ? 'bg-green-600/20 border border-green-500/30' 
                : 'bg-red-600/20 border border-red-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                ollamaStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <Cpu className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {ollamaStatus.isConnected 
                  ? selectedModel || 'Ollama connecté'
                  : 'Ollama déconnecté'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4">
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                  activePanel === tab.id
                    ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'files' && generatedFiles.size > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 rounded-full">
                    {generatedFiles.size}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full container mx-auto p-4">
          <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Panel */}
            <div className="lg:col-span-3 h-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  {activePanel === 'chat' && <ChatInterface />}
                  {activePanel === 'wizard' && <ProjectWizard />}
                  {activePanel === 'files' && <FileExplorer />}
                  {activePanel === 'settings' && <SettingsPanel />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sidebar - Ollama Panel */}
            <div className="hidden lg:block overflow-auto">
              <OllamaPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-2 px-4 bg-gray-900/30">
        <div className="container mx-auto flex items-center justify-between text-xs text-gray-500">
          <span>CHATDEV v1.0 - Powered by Ollama</span>
          <span>
            {ollamaStatus.models.length} modèles disponibles
          </span>
        </div>
      </footer>
    </div>
  );
}

// Panneau de paramètres
function SettingsPanel() {
  const { 
    projectPath, 
    setProjectPath, 
    ollamaUrl, 
    setOllamaUrl,
    clearMessages,
    clearGeneratedFiles,
  } = useChatDevStore();

  const [tempPath, setTempPath] = React.useState(projectPath);
  const [tempUrl, setTempUrl] = React.useState(ollamaUrl);

  return (
    <div className="h-full bg-gray-900/50 rounded-xl border border-gray-700 p-6 overflow-auto">
      <h2 className="text-xl font-bold text-white mb-6">Paramètres</h2>

      <div className="space-y-6">
        {/* Project Path */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chemin du projet
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempPath}
              onChange={(e) => setTempPath(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
            <button
              onClick={() => setProjectPath(tempPath)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sauver
            </button>
          </div>
        </div>

        {/* Ollama URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            URL Ollama
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white"
              placeholder="http://localhost:11434"
            />
            <button
              onClick={() => setOllamaUrl(tempUrl)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sauver
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Actions</h3>
          <div className="flex gap-3">
            <button
              onClick={clearMessages}
              className="px-4 py-2 bg-yellow-600/20 text-yellow-300 border border-yellow-600/30 rounded-lg hover:bg-yellow-600/30"
            >
              Effacer l'historique
            </button>
            <button
              onClick={clearGeneratedFiles}
              className="px-4 py-2 bg-red-600/20 text-red-300 border border-red-600/30 rounded-lg hover:bg-red-600/30"
            >
              Supprimer les fichiers
            </button>
          </div>
        </div>

        {/* Modèles recommandés */}
        <div className="pt-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Modèles recommandés à télécharger
          </h3>
          <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-400 font-mono space-y-2">
            <p># Pour la génération de code:</p>
            <p className="text-green-400">ollama pull qwen2.5-coder:latest</p>
            <p className="text-green-400">ollama pull codellama:7b</p>
            <p className="mt-4"># Pour le raisonnement:</p>
            <p className="text-green-400">ollama pull llama3.2:latest</p>
            <p className="text-green-400">ollama pull mistral:7b-instruct</p>
            <p className="mt-4"># Pour la résumation (CPU optimisé):</p>
            <p className="text-green-400">ollama pull smollm2:latest</p>
            <p className="text-green-400">ollama pull gemma2:2b</p>
          </div>
        </div>
      </div>
    </div>
  );
}
