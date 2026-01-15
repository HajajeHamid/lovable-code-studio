// Model Router - Sélection intelligente des modèles selon la tâche
import { OllamaModel } from './ollamaService';

export type TaskType = 
  | 'code_generation'
  | 'code_review'
  | 'code_fix'
  | 'testing'
  | 'documentation'
  | 'planning'
  | 'sql'
  | 'vision'
  | 'summarization'
  | 'general';

interface ModelPreference {
  primary: string[];
  fallback: string[];
}

const TASK_MODEL_MAP: Record<TaskType, ModelPreference> = {
  code_generation: {
    primary: ['qwen2.5-coder:latest', 'codellama:latest', 'deepseek-coder:latest'],
    fallback: ['codegemma:latest', 'wizardcoder:latest'],
  },
  code_review: {
    primary: ['codellama:latest', 'qwen2.5-coder:latest'],
    fallback: ['deepseek-coder:latest', 'mistral:7b-instruct'],
  },
  code_fix: {
    primary: ['qwen2.5-coder:latest', 'codellama:7b'],
    fallback: ['deepseek-coder:latest'],
  },
  testing: {
    primary: ['qwen2.5-coder:latest', 'codellama:latest'],
    fallback: ['codegemma:latest'],
  },
  documentation: {
    primary: ['mistral:7b-instruct', 'llama3.2:latest'],
    fallback: ['gemma:latest', 'phi3:latest'],
  },
  planning: {
    primary: ['llama3.2:latest', 'mistral:7b-instruct', 'phi3:14b'],
    fallback: ['gemma2:2b', 'phi3:latest'],
  },
  sql: {
    primary: ['sqlcoder:latest'],
    fallback: ['qwen2.5-coder:latest', 'codellama:latest'],
  },
  vision: {
    primary: ['llava:7b', 'moondream:latest'],
    fallback: [],
  },
  summarization: {
    primary: ['smollm2:latest', 'gemma2:2b', 'phi3:latest'],
    fallback: ['llama3.2:3b'],
  },
  general: {
    primary: ['llama3.2:latest', 'mistral:latest'],
    fallback: ['gemma:latest', 'phi:latest'],
  },
};

export class ModelRouter {
  private availableModels: Set<string> = new Set();

  updateAvailableModels(models: OllamaModel[]) {
    this.availableModels = new Set(models.map(m => m.name));
  }

  selectModel(taskType: TaskType, lastError?: string): string | null {
    const preference = TASK_MODEL_MAP[taskType];
    
    // Si erreur de syntaxe, privilégier les modèles de code
    if (lastError?.includes('syntax') || lastError?.includes('error')) {
      for (const model of TASK_MODEL_MAP.code_fix.primary) {
        if (this.availableModels.has(model)) return model;
      }
    }

    // Chercher dans les modèles primaires
    for (const model of preference.primary) {
      if (this.availableModels.has(model)) return model;
    }

    // Fallback
    for (const model of preference.fallback) {
      if (this.availableModels.has(model)) return model;
    }

    // Dernier recours: n'importe quel modèle disponible
    const anyModel = Array.from(this.availableModels)[0];
    return anyModel || null;
  }

  getSuggestedModels(taskType: TaskType): { installed: string[]; toInstall: string[] } {
    const preference = TASK_MODEL_MAP[taskType];
    const all = [...preference.primary, ...preference.fallback];
    
    return {
      installed: all.filter(m => this.availableModels.has(m)),
      toInstall: all.filter(m => !this.availableModels.has(m)),
    };
  }

  getTaskType(description: string): TaskType {
    const lower = description.toLowerCase();
    
    if (lower.includes('sql') || lower.includes('database') || lower.includes('query')) {
      return 'sql';
    }
    if (lower.includes('image') || lower.includes('photo') || lower.includes('screenshot')) {
      return 'vision';
    }
    if (lower.includes('test') || lower.includes('spec') || lower.includes('jest')) {
      return 'testing';
    }
    if (lower.includes('doc') || lower.includes('readme') || lower.includes('comment')) {
      return 'documentation';
    }
    if (lower.includes('fix') || lower.includes('bug') || lower.includes('error') || lower.includes('repair')) {
      return 'code_fix';
    }
    if (lower.includes('review') || lower.includes('check') || lower.includes('analyze')) {
      return 'code_review';
    }
    if (lower.includes('plan') || lower.includes('architecture') || lower.includes('design')) {
      return 'planning';
    }
    if (lower.includes('summary') || lower.includes('summarize') || lower.includes('résumé')) {
      return 'summarization';
    }
    if (lower.includes('create') || lower.includes('generate') || lower.includes('implement') || lower.includes('code')) {
      return 'code_generation';
    }
    
    return 'general';
  }
}

export const modelRouter = new ModelRouter();
export default modelRouter;
