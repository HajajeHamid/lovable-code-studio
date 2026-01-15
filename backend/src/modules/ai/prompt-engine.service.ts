// src/modules/ai/prompt-engine.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptEngineService {
  buildGenPrompt(description: string, lastError: string = '', context: string = ''): string {
    let prompt = `You are an expert code generator for Node.js projects using best practices. 
    Generate precise code diffs based on this task: ${description}. 
    Focus on modular, testable, and maintainable code.`;
    if (lastError) {
      prompt += ` Fix previous error: ${lastError}.`;
    }
    if (context) {
      prompt += ` Use this context from similar past tasks: ${context}.`;
    }
    prompt += ` Output strictly as JSON array of {file: string, original: string, modified: string}, where original is the current file content or empty if new file.`;
    return prompt;
  }

  buildReviewPrompt(description: string, diffs: any[], context: string = ''): string {
    let prompt = `Review these code diffs rigorously for the task: ${description}. Diffs: ${JSON.stringify(diffs)}. 
    Check for bugs, security, performance, maintainability. Suggest improvements.`;
    if (context) {
      prompt += ` Consider past context: ${context}.`;
    }
    prompt += ` Output 'APPROVED' if perfect, else detailed issues in structured list.`;
    return prompt;
  }

  buildFixPrompt(description: string, reviewResult: string, diffs: any[], context: string = ''): string {
    let prompt = `Fix all issues in these diffs for task: ${description}. Issues: ${reviewResult}. Current diffs: ${JSON.stringify(diffs)}.`;
    if (context) {
      prompt += ` Incorporate lessons from context: ${context}.`;
    }
    prompt += ` Output fixed JSON array of diffs. Ensure compatibility with Node.js ecosystem.`;
    return prompt;
  }
}