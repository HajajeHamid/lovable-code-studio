// Service Ollama complet pour CHATDEV
export interface OllamaModel {
  name: string;
  size: string;
  modified: string;
  digest: string;
  family?: string;
  quantization?: string;
}

export interface OllamaStatus {
  isConnected: boolean;
  version?: string;
  models: OllamaModel[];
  error?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerationOptions {
  model: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// Modèles recommandés par catégorie
export const RECOMMENDED_MODELS = {
  coding: [
    { name: 'qwen2.5-coder:latest', description: 'Meilleur pour génération de code', size: '4.7 GB' },
    { name: 'codellama:7b', description: 'Bon équilibre performance/taille', size: '3.8 GB' },
    { name: 'deepseek-coder:latest', description: 'Compact et efficace', size: '776 MB' },
    { name: 'codegemma:latest', description: 'Polyvalent Google', size: '5.0 GB' },
  ],
  reasoning: [
    { name: 'llama3.2:latest', description: 'Raisonnement général', size: '2.0 GB' },
    { name: 'phi3:latest', description: 'Compact et puissant', size: '2.2 GB' },
    { name: 'gemma2:2b', description: 'Ultra léger Google', size: '1.6 GB' },
    { name: 'mistral:7b-instruct', description: 'Instructions précises', size: '4.4 GB' },
  ],
  sql: [
    { name: 'sqlcoder:latest', description: 'Spécialisé SQL', size: '4.1 GB' },
  ],
  vision: [
    { name: 'llava:7b', description: 'Analyse d\'images', size: '4.7 GB' },
    { name: 'moondream:latest', description: 'Vision compacte', size: '1.7 GB' },
  ],
};

class OllamaService {
  private baseUrl: string = 'http://localhost:11434';
  private abortController: AbortController | null = null;

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async checkConnection(): Promise<OllamaStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/version`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) {
        throw new Error('Ollama not responding');
      }
      
      const version = await response.json();
      const models = await this.listModels();
      
      return {
        isConnected: true,
        version: version.version,
        models,
      };
    } catch (error) {
      return {
        isConnected: false,
        models: [],
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to list models');
      
      const data = await response.json();
      return (data.models || []).map((m: any) => ({
        name: m.name,
        size: this.formatSize(m.size),
        modified: m.modified_at,
        digest: m.digest,
        family: m.details?.family,
        quantization: m.details?.quantization_level,
      }));
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }

  async pullModel(modelName: string, onProgress?: (progress: string) => void): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, stream: true }),
      });

      if (!response.ok) throw new Error('Failed to pull model');
      if (!response.body) return false;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.status && onProgress) {
              const progressText = json.completed 
                ? `${json.status} (${Math.round((json.completed / json.total) * 100)}%)`
                : json.status;
              onProgress(progressText);
            }
          } catch {}
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error pulling model:', error);
      return false;
    }
  }

  async deleteModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting model:', error);
      return false;
    }
  }

  async generate(
    prompt: string,
    options: GenerationOptions,
    onToken?: (token: string) => void
  ): Promise<string> {
    this.abortController = new AbortController();
    let fullResponse = '';

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.model,
          prompt,
          stream: options.stream ?? true,
          options: {
            temperature: options.temperature ?? 0.7,
            num_predict: options.max_tokens ?? 2048,
          },
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) throw new Error('Generation failed');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullResponse += json.response;
              if (onToken) onToken(json.response);
            }
          } catch {}
        }
      }

      return fullResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return fullResponse || '';
      }
      throw error;
    }
  }

  async chat(
    messages: ChatMessage[],
    options: GenerationOptions,
    onToken?: (token: string) => void
  ): Promise<string> {
    this.abortController = new AbortController();
    let fullResponse = '';

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.model,
          messages,
          stream: options.stream ?? true,
          options: {
            temperature: options.temperature ?? 0.7,
            num_predict: options.max_tokens ?? 2048,
          },
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) throw new Error('Chat failed');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              fullResponse += json.message.content;
              if (onToken) onToken(json.message.content);
            }
          } catch {}
        }
      }

      return fullResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return fullResponse || '';
      }
      throw error;
    }
  }

  stopGeneration() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private formatSize(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  }
}

export const ollamaService = new OllamaService();
export default ollamaService;
