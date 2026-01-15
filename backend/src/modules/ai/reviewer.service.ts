// src/modules/ai/reviewer.service.ts
import { Injectable } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { PromptEngineService } from './prompt-engine.service';

@Injectable()
export class ReviewerService {
  constructor(
    private readonly ollama: OllamaService,
    private readonly promptEngine: PromptEngineService,
  ) {}

  async review(description: string, diffs: any[], context: string = ''): Promise<string> {
    const prompt = this.promptEngine.buildReviewPrompt(description, diffs, context);
    const model = 'codellama:latest'; // Bon pour review code
    return this.ollama.generate(prompt, model);
  }
}