import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OllamaModel, OllamaStatus } from '../lib/ollama/ollamaService';

// Types pour les messages et projets
export interface Diff {
  file: string;
  original: string;
  modified: string;
  language?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ScoreResult {
  security: number;
  performance: number;
  maintainability: number;
  testability: number;
  global: number;
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  details: string;
  userId?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  diffs?: Diff[];
  score?: ScoreResult;
  audit?: AuditEntry[];
  validation?: ValidationResult;
  isStreaming?: boolean;
}

export interface ProjectRequirement {
  id: string;
  category: 'feature' | 'technical' | 'ui' | 'api' | 'database';
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dependencies?: string[];
}

export interface ProjectSpec {
  name: string;
  description: string;
  type: 'nodejs' | 'python';
  framework?: string;
  requirements: ProjectRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationTask {
  id: string;
  description: string;
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

// État principal CHATDEV
interface ChatDevState {
  // Ollama
  ollamaStatus: OllamaStatus;
  selectedModel: string | null;
  ollamaUrl: string;
  
  // Messages
  messages: ChatMessage[];
  isGenerating: boolean;
  
  // Projet
  projectPath: string;
  projectSpec: ProjectSpec | null;
  generatedFiles: Map<string, string>;
  
  // Génération
  generationTasks: GenerationTask[];
  currentTask: string | null;
  
  // UI
  activePanel: 'chat' | 'wizard' | 'files' | 'settings';
  
  // Actions Ollama
  setOllamaStatus: (status: OllamaStatus) => void;
  setSelectedModel: (model: string | null) => void;
  setOllamaUrl: (url: string) => void;
  
  // Actions Messages
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setIsGenerating: (value: boolean) => void;
  
  // Actions Projet
  setProjectPath: (path: string) => void;
  setProjectSpec: (spec: ProjectSpec | null) => void;
  addGeneratedFile: (path: string, content: string) => void;
  clearGeneratedFiles: () => void;
  
  // Actions Génération
  addGenerationTask: (task: Omit<GenerationTask, 'id'>) => void;
  updateGenerationTask: (id: string, updates: Partial<GenerationTask>) => void;
  setCurrentTask: (id: string | null) => void;
  clearGenerationTasks: () => void;
  
  // Actions UI
  setActivePanel: (panel: 'chat' | 'wizard' | 'files' | 'settings') => void;
}

export const useChatDevStore = create<ChatDevState>()(
  persist(
    (set, get) => ({
      // État initial Ollama
      ollamaStatus: { isConnected: false, models: [] },
      selectedModel: null,
      ollamaUrl: 'http://localhost:11434',
      
      // État initial Messages
      messages: [],
      isGenerating: false,
      
      // État initial Projet
      projectPath: './generated-project',
      projectSpec: null,
      generatedFiles: new Map(),
      
      // État initial Génération
      generationTasks: [],
      currentTask: null,
      
      // État initial UI
      activePanel: 'chat',
      
      // Actions Ollama
      setOllamaStatus: (status) => set({ ollamaStatus: status }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setOllamaUrl: (url) => set({ ollamaUrl: url }),
      
      // Actions Messages
      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date(),
          },
        ],
      })),
      
      updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      })),
      
      clearMessages: () => set({ messages: [] }),
      
      setIsGenerating: (value) => set({ isGenerating: value }),
      
      // Actions Projet
      setProjectPath: (path) => set({ projectPath: path }),
      
      setProjectSpec: (spec) => set({ projectSpec: spec }),
      
      addGeneratedFile: (path, content) => set((state) => {
        const newFiles = new Map(state.generatedFiles);
        newFiles.set(path, content);
        return { generatedFiles: newFiles };
      }),
      
      clearGeneratedFiles: () => set({ generatedFiles: new Map() }),
      
      // Actions Génération
      addGenerationTask: (task) => set((state) => ({
        generationTasks: [
          ...state.generationTasks,
          { ...task, id: crypto.randomUUID() },
        ],
      })),
      
      updateGenerationTask: (id, updates) => set((state) => ({
        generationTasks: state.generationTasks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      })),
      
      setCurrentTask: (id) => set({ currentTask: id }),
      
      clearGenerationTasks: () => set({ generationTasks: [], currentTask: null }),
      
      // Actions UI
      setActivePanel: (panel) => set({ activePanel: panel }),
    }),
    {
      name: 'chatdev-storage',
      partialize: (state) => ({
        ollamaUrl: state.ollamaUrl,
        projectPath: state.projectPath,
        selectedModel: state.selectedModel,
      }),
    }
  )
);
