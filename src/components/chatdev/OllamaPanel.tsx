import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  RefreshCw, 
  Download, 
  Trash2, 
  Check, 
  X, 
  Settings,
  Cpu,
  HardDrive
} from 'lucide-react';
import { useChatDevStore } from '../../stores/chatdevStore';
import ollamaService, { OllamaModel, RECOMMENDED_MODELS } from '../../lib/ollama/ollamaService';
import { modelRouter } from '../../lib/ollama/modelRouter';

export default function OllamaPanel() {
  const { 
    ollamaStatus, 
    setOllamaStatus, 
    selectedModel, 
    setSelectedModel,
    ollamaUrl,
    setOllamaUrl 
  } = useChatDevStore();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(ollamaUrl);
  const [pullProgress, setPullProgress] = useState<Record<string, string>>({});
  const [modelToInstall, setModelToInstall] = useState('');

  useEffect(() => {
    checkConnection();
  }, [ollamaUrl]);

  const checkConnection = async () => {
    setIsRefreshing(true);
    ollamaService.setBaseUrl(ollamaUrl);
    const status = await ollamaService.checkConnection();
    setOllamaStatus(status);
    modelRouter.updateAvailableModels(status.models);
    
    // Auto-sélectionner le premier modèle si aucun sélectionné
    if (status.isConnected && status.models.length > 0 && !selectedModel) {
      const bestModel = modelRouter.selectModel('code_generation');
      if (bestModel) setSelectedModel(bestModel);
    }
    
    setIsRefreshing(false);
  };

  const handlePullModel = async (modelName: string) => {
    setPullProgress(prev => ({ ...prev, [modelName]: 'Démarrage...' }));
    
    const success = await ollamaService.pullModel(modelName, (progress) => {
      setPullProgress(prev => ({ ...prev, [modelName]: progress }));
    });

    if (success) {
      setPullProgress(prev => ({ ...prev, [modelName]: 'Terminé!' }));
      await checkConnection();
      setTimeout(() => {
        setPullProgress(prev => {
          const { [modelName]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);
    } else {
      setPullProgress(prev => ({ ...prev, [modelName]: 'Échec!' }));
    }
  };

  const handleDeleteModel = async (modelName: string) => {
    if (!confirm(`Supprimer le modèle ${modelName} ?`)) return;
    
    const success = await ollamaService.deleteModel(modelName);
    if (success) {
      if (selectedModel === modelName) setSelectedModel(null);
      await checkConnection();
    }
  };

  const handleSaveUrl = () => {
    setOllamaUrl(tempUrl);
    setShowSettings(false);
  };

  const isModelInstalled = (name: string) => 
    ollamaStatus.models.some(m => m.name === name);

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            ollamaStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <h3 className="font-semibold text-white">Ollama</h3>
          {ollamaStatus.version && (
            <span className="text-xs text-gray-400">v{ollamaStatus.version}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={checkConnection}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-700 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm text-gray-400 block mb-1">URL Ollama</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    className="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
                    placeholder="http://localhost:11434"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Sauver
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Pour installer Ollama: <code className="bg-gray-900 px-1 rounded">curl -fsSL https://ollama.com/install.sh | sh</code></p>
                <p className="mt-1">Puis: <code className="bg-gray-900 px-1 rounded">ollama serve</code></p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Error */}
      {!ollamaStatus.isConnected && (
        <div className="p-4 bg-red-900/20 text-red-300 text-sm">
          <p className="font-medium">Ollama non connecté</p>
          <p className="text-xs mt-1">{ollamaStatus.error || 'Vérifiez que Ollama est en cours d\'exécution'}</p>
        </div>
      )}

      {/* Model Selection */}
      {ollamaStatus.isConnected && (
        <div className="p-4 space-y-4">
          {/* Installed Models */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Modèles installés ({ollamaStatus.models.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {ollamaStatus.models.map((model) => (
                <div
                  key={model.name}
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedModel === model.name
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-gray-900/30 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedModel(model.name)}
                >
                  <div className="flex items-center gap-2">
                    {selectedModel === model.name && (
                      <Check className="w-4 h-4 text-blue-400" />
                    )}
                    <div>
                      <p className="text-sm text-white">{model.name}</p>
                      <p className="text-xs text-gray-500">{model.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModel(model.name);
                    }}
                    className="p-1 hover:bg-red-600/20 rounded text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Install New Model */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Installer un modèle
            </h4>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={modelToInstall}
                onChange={(e) => setModelToInstall(e.target.value)}
                className="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="Nom du modèle (ex: llama3.2:latest)"
              />
              <button
                onClick={() => {
                  if (modelToInstall) {
                    handlePullModel(modelToInstall);
                    setModelToInstall('');
                  }
                }}
                disabled={!modelToInstall || Boolean(pullProgress[modelToInstall])}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Installer
              </button>
            </div>

            {/* Recommended Models */}
            <div className="space-y-3">
              {Object.entries(RECOMMENDED_MODELS).map(([category, models]) => (
                <div key={category}>
                  <p className="text-xs text-gray-500 uppercase mb-1">{category}</p>
                  <div className="flex flex-wrap gap-1">
                    {models.map((model) => (
                      <button
                        key={model.name}
                        onClick={() => {
                          if (!isModelInstalled(model.name)) {
                            handlePullModel(model.name);
                          } else {
                            setSelectedModel(model.name);
                          }
                        }}
                        disabled={Boolean(pullProgress[model.name])}
                        className={`px-2 py-1 rounded text-xs transition-all ${
                          isModelInstalled(model.name)
                            ? 'bg-green-600/20 text-green-300 border border-green-600/50'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        title={`${model.description} (${model.size})`}
                      >
                        {pullProgress[model.name] ? (
                          <span className="animate-pulse">{pullProgress[model.name]}</span>
                        ) : (
                          <>
                            {model.name.split(':')[0]}
                            {isModelInstalled(model.name) && <Check className="w-3 h-3 inline ml-1" />}
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
