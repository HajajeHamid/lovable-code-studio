// src/stores/aiStore.ts
import { create } from 'zustand';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  diffs?: any[];
  score?: any;
  audit?: any[];
  validation?: any;
  context?: any[];
}

interface AiState {
  messages: Message[];
  projectPath: string;
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setProjectPath: (path: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAiStore = create<AiState>((set) => ({
  messages: [],
  projectPath: './project',
  isLoading: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setProjectPath: (path) => set({ projectPath: path }),
  setLoading: (loading) => set({ isLoading: loading }),
}));