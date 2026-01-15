// src/modules/ai/ollama.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OllamaService {
  private readonly baseUrl = 'http://localhost:11434/api'; // Assuming Ollama runs locally on default port

  async generate(prompt: string, model: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/generate`, {
        model,
        prompt,
        stream: false,
      });
      return response.data.response;
    } catch (error) {
      console.error('Error generating with Ollama:', error);
      throw new Error('Failed to generate response');
    }
  }

  async embed(text: string, model: string = 'smollm2:latest'): Promise<number[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/embeddings`, {
        model,
        prompt: text,
      });
      return response.data.embedding;
    } catch (error) {
      console.error('Error embedding with Ollama:', error);
      throw new Error('Failed to generate embedding');
    }
  }
}