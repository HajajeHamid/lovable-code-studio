// ============================================
// OLLAMA INTEGRATION SERVICE
// Service robuste pour gérer la connexion et les modèles Ollama
// ============================================

export interface OllamaModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaListResponse {
  models: OllamaModel[];
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
  };
  system?: string;
  context?: number[];
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaChatMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaChatMessage;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

export interface OllamaStatus {
  connected: boolean;
  url: string;
  models: OllamaModel[];
  selectedModel: string | null;
  error: string | null;
  lastChecked: Date | null;
}

// Default Ollama URL
const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

// Format model size for display
export function formatModelSize(bytes: number): string {
  if (bytes >= 1e9) {
    return `${(bytes / 1e9).toFixed(1)} GB`;
  } else if (bytes >= 1e6) {
    return `${(bytes / 1e6).toFixed(1)} MB`;
  }
  return `${bytes} B`;
}

// Format date for display
export function formatModelDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Ollama Service Class
export class OllamaService {
  private url: string;
  private abortController: AbortController | null = null;

  constructor(url: string = DEFAULT_OLLAMA_URL) {
    this.url = url.replace(/\/$/, ''); // Remove trailing slash
  }

  // Set new URL
  setUrl(url: string): void {
    this.url = url.replace(/\/$/, '');
  }

  getUrl(): string {
    return this.url;
  }

  // Cancel ongoing request
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // Check if Ollama is available
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.warn('Ollama connection failed:', error);
      return false;
    }
  }

  // List all available models (ollama list)
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.url}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OllamaListResponse = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      throw error;
    }
  }

  // Pull a model (ollama pull)
  async pullModel(modelName: string, onProgress?: (status: string) => void): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Stream the response for progress updates
      const reader = response.body?.getReader();
      if (!reader) return false;

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.status && onProgress) {
              onProgress(data.status);
            }
          } catch {
            // Ignore JSON parse errors
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to pull model:', error);
      throw error;
    }
  }

  // Generate completion (non-streaming)
  async generate(request: OllamaGenerateRequest): Promise<OllamaGenerateResponse> {
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: false }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  // Generate completion with streaming
  async generateStream(
    request: OllamaGenerateRequest,
    onToken: (token: string) => void,
    onDone?: (response: OllamaGenerateResponse) => void
  ): Promise<void> {
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullResponse: OllamaGenerateResponse | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data: OllamaGenerateResponse = JSON.parse(line);
            if (data.response) {
              onToken(data.response);
            }
            if (data.done) {
              fullResponse = data;
            }
          } catch {
            // Ignore JSON parse errors for incomplete chunks
          }
        }
      }

      if (fullResponse && onDone) {
        onDone(fullResponse);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Silently handle abort
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  // Chat completion (non-streaming)
  async chat(request: OllamaChatRequest): Promise<OllamaChatResponse> {
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.url}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: false }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  // Chat with streaming
  async chatStream(
    request: OllamaChatRequest,
    onToken: (token: string) => void,
    onDone?: (response: OllamaChatResponse) => void
  ): Promise<void> {
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.url}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullResponse: OllamaChatResponse | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data: OllamaChatResponse = JSON.parse(line);
            if (data.message?.content) {
              onToken(data.message.content);
            }
            if (data.done) {
              fullResponse = data;
            }
          } catch {
            // Ignore JSON parse errors
          }
        }
      }

      if (fullResponse && onDone) {
        onDone(fullResponse);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }
}

// Singleton instance
let ollamaInstance: OllamaService | null = null;

export function getOllamaService(url?: string): OllamaService {
  if (!ollamaInstance || (url && ollamaInstance.getUrl() !== url)) {
    ollamaInstance = new OllamaService(url);
  }
  return ollamaInstance;
}

// Quick helper functions
export async function ollamaList(url?: string): Promise<OllamaModel[]> {
  const service = getOllamaService(url);
  return service.listModels();
}

export async function ollamaGenerate(
  model: string,
  prompt: string,
  system?: string,
  url?: string
): Promise<string> {
  const service = getOllamaService(url);
  const response = await service.generate({ model, prompt, system });
  return response.response;
}

export async function ollamaChat(
  model: string,
  messages: OllamaChatMessage[],
  url?: string
): Promise<string> {
  const service = getOllamaService(url);
  const response = await service.chat({ model, messages });
  return response.message.content;
}
