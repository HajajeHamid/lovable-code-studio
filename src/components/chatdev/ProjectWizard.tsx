import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Code, 
  Database, 
  Layout, 
  Server,
  Check,
  Plus,
  Trash2,
  Wand2
} from 'lucide-react';
import { useChatDevStore, ProjectRequirement, ProjectSpec } from '../../stores/chatdevStore';
import ollamaService from '../../lib/ollama/ollamaService';
import { modelRouter } from '../../lib/ollama/modelRouter';

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

const STEPS: WizardStep[] = [
  { id: 1, title: 'Type de Projet', description: 'Choisissez le langage et framework' },
  { id: 2, title: 'Description', description: 'Décrivez votre projet' },
  { id: 3, title: 'Fonctionnalités', description: 'Listez les fonctionnalités requises' },
  { id: 4, title: 'Révision', description: 'Vérifiez et lancez la génération' },
];

const FRAMEWORKS = {
  nodejs: [
    { id: 'nestjs', name: 'NestJS', description: 'Framework Node.js progressif' },
    { id: 'express', name: 'Express', description: 'Framework minimaliste' },
    { id: 'fastify', name: 'Fastify', description: 'Framework rapide et léger' },
  ],
  python: [
    { id: 'fastapi', name: 'FastAPI', description: 'API moderne et rapide' },
    { id: 'django', name: 'Django', description: 'Framework complet' },
    { id: 'flask', name: 'Flask', description: 'Micro-framework flexible' },
  ],
};

const FEATURE_CATEGORIES = [
  { id: 'feature', icon: Sparkles, label: 'Fonctionnalité' },
  { id: 'technical', icon: Code, label: 'Technique' },
  { id: 'ui', icon: Layout, label: 'Interface' },
  { id: 'api', icon: Server, label: 'API' },
  { id: 'database', icon: Database, label: 'Base de données' },
];

export default function ProjectWizard() {
  const { 
    selectedModel, 
    ollamaStatus,
    setProjectSpec, 
    setActivePanel,
    addMessage 
  } = useChatDevStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [projectType, setProjectType] = useState<'nodejs' | 'python'>('nodejs');
  const [framework, setFramework] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<ProjectRequirement[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  // Nouveau requirement
  const [newReq, setNewReq] = useState({
    category: 'feature' as ProjectRequirement['category'],
    description: '',
    priority: 'medium' as ProjectRequirement['priority'],
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addRequirement = () => {
    if (!newReq.description.trim()) return;
    
    setRequirements([
      ...requirements,
      {
        id: crypto.randomUUID(),
        ...newReq,
        status: 'pending',
      },
    ]);
    setNewReq({ ...newReq, description: '' });
  };

  const removeRequirement = (id: string) => {
    setRequirements(requirements.filter(r => r.id !== id));
  };

  const analyzeWithAI = async () => {
    if (!selectedModel || !ollamaStatus.isConnected) return;
    
    setIsAnalyzing(true);
    try {
      const prompt = `Analysez cette description de projet et suggérez 5 fonctionnalités importantes à implémenter.
      
Projet: ${projectName}
Type: ${projectType} avec ${framework}
Description: ${description}

Répondez uniquement avec une liste de 5 fonctionnalités, une par ligne, sans numérotation.`;

      const response = await ollamaService.generate(prompt, {
        model: selectedModel,
        temperature: 0.7,
        max_tokens: 500,
      });

      const suggestions = response
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 5 && s.length < 200)
        .slice(0, 5);
      
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addSuggestion = (suggestion: string) => {
    setRequirements([
      ...requirements,
      {
        id: crypto.randomUUID(),
        category: 'feature',
        description: suggestion,
        priority: 'medium',
        status: 'pending',
      },
    ]);
    setAiSuggestions(aiSuggestions.filter(s => s !== suggestion));
  };

  const handleGenerate = () => {
    const spec: ProjectSpec = {
      name: projectName,
      description,
      type: projectType,
      framework,
      requirements,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setProjectSpec(spec);
    
    // Ajouter un message système
    addMessage({
      type: 'system',
      content: `🚀 Projet "${projectName}" configuré!\n\nType: ${projectType} (${framework})\nFonctionnalités: ${requirements.length}\n\nTapez votre première commande pour commencer la génération.`,
    });
    
    setActivePanel('chat');
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return projectType && framework;
      case 2: return projectName.trim() && description.trim();
      case 3: return requirements.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50">
      {/* Progress Steps */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                currentStep > step.id
                  ? 'bg-green-600 border-green-600 text-white'
                  : currentStep === step.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-gray-600 text-gray-600'
              }`}>
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <h3 className="text-white font-medium">{STEPS[currentStep - 1].title}</h3>
          <p className="text-sm text-gray-400">{STEPS[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Step 1: Project Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Langage</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {(['nodejs', 'python'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setProjectType(type);
                          setFramework('');
                        }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          projectType === type
                            ? 'border-blue-500 bg-blue-600/20'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-3xl mb-2">{type === 'nodejs' ? '📦' : '🐍'}</div>
                        <div className="text-white font-medium capitalize">{type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Framework</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {FRAMEWORKS[projectType].map((fw) => (
                      <button
                        key={fw.id}
                        onClick={() => setFramework(fw.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          framework === fw.id
                            ? 'border-blue-500 bg-blue-600/20'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-white font-medium">{fw.name}</div>
                        <div className="text-sm text-gray-400">{fw.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Description */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Nom du projet</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                    placeholder="mon-super-projet"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Description du projet</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-40 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white resize-none"
                    placeholder="Décrivez votre projet en détail. Plus vous êtes précis, meilleur sera le résultat..."
                  />
                </div>

                {description.length > 50 && ollamaStatus.isConnected && selectedModel && (
                  <button
                    onClick={analyzeWithAI}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Wand2 className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Analyse en cours...' : 'Suggérer des fonctionnalités (AI)'}
                  </button>
                )}

                {aiSuggestions.length > 0 && (
                  <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                    <h4 className="text-purple-300 font-medium mb-2">Suggestions AI</h4>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
                          <span className="text-sm text-gray-300">{suggestion}</span>
                          <button
                            onClick={() => addSuggestion(suggestion)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Requirements */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex gap-2 mb-3">
                    {FEATURE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setNewReq({ ...newReq, category: cat.id as any })}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition-all ${
                          newReq.category === cat.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <cat.icon className="w-3 h-3" />
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newReq.description}
                      onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addRequirement()}
                      className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                      placeholder="Décrire la fonctionnalité..."
                    />
                    <select
                      value={newReq.priority}
                      onChange={(e) => setNewReq({ ...newReq, priority: e.target.value as any })}
                      className="bg-gray-900 border border-gray-600 rounded-lg px-2 text-white text-sm"
                    >
                      <option value="high">Haute</option>
                      <option value="medium">Moyenne</option>
                      <option value="low">Basse</option>
                    </select>
                    <button
                      onClick={addRequirement}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {requirements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Ajoutez au moins une fonctionnalité pour continuer
                    </div>
                  ) : (
                    requirements.map((req) => {
                      const CategoryIcon = FEATURE_CATEGORIES.find(c => c.id === req.category)?.icon || Sparkles;
                      return (
                        <div
                          key={req.id}
                          className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg"
                        >
                          <CategoryIcon className="w-4 h-4 text-gray-400" />
                          <span className="flex-1 text-gray-200">{req.description}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            req.priority === 'high' ? 'bg-red-600/30 text-red-300' :
                            req.priority === 'medium' ? 'bg-yellow-600/30 text-yellow-300' :
                            'bg-green-600/30 text-green-300'
                          }`}>
                            {req.priority}
                          </span>
                          <button
                            onClick={() => removeRequirement(req.id)}
                            className="text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl p-6">
                  <h4 className="text-2xl font-bold text-white mb-4">{projectName}</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-gray-400 text-sm">Type</div>
                      <div className="text-white font-medium capitalize">{projectType}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-gray-400 text-sm">Framework</div>
                      <div className="text-white font-medium capitalize">{framework}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-gray-400 text-sm mb-1">Description</div>
                    <div className="text-gray-200">{description}</div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm mb-2">
                      Fonctionnalités ({requirements.length})
                    </div>
                    <div className="space-y-1">
                      {requirements.map((req) => (
                        <div key={req.id} className="flex items-center gap-2 text-sm text-gray-300">
                          <Check className="w-3 h-3 text-green-400" />
                          {req.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                  <h5 className="text-yellow-300 font-medium mb-2">Modèle AI sélectionné</h5>
                  <p className="text-gray-300">
                    {selectedModel || 'Aucun modèle sélectionné - Configurez Ollama'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-gray-700 flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>

        {currentStep < STEPS.length ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!selectedModel}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Lancer la génération
          </button>
        )}
      </div>
    </div>
  );
}
