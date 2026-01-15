// src/modules/ai/model-router.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ModelRouterService {
  private modelMap: Record<string, string> = {
    RefactorAgent: 'codellama:latest',
    SecurityAgent: 'deepseek-coder:latest',
    PerformanceAgent: 'codegemma:latest',
    TestAgent: 'qwen2.5-coder:latest',
    DocAgent: 'gemma:latest',
    default: 'llama3.2:latest',
  };

  selectModelForAgent(agent: string, lastError: string): string {
    let model = this.modelMap[agent] || this.modelMap.default;
    if (lastError.includes('syntax') || lastError.includes('error')) {
      model = 'qwen2.5-coder:latest'; // Switch to a strong coder for fixes
    }
    return model;
  }
}