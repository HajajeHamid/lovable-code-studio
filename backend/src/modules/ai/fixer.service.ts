// src/modules/ai/fixer.service.ts
import { Injectable } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { PromptEngineService } from './prompt-engine.service';

@Injectable()
export class FixerService {
  constructor(
    private readonly ollama: OllamaService,
    private readonly promptEngine: PromptEngineService,
  ) {}

  async fix(description: string, reviewResult: string, diffs: any[], context: string = ''): Promise<any[]> {
    const prompt = this.promptEngine.buildFixPrompt(description, reviewResult, diffs, context);
    const model = 'qwen2.5-coder:latest'; // Fort pour fixer code
    const result = await this.ollama.generate(prompt, model);
    try {
      return JSON.parse(result);
    } catch {
      return diffs; // Fallback
    }
  }
}