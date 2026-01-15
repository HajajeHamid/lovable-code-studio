// src/modules/ai/planner.service.ts
import { Injectable } from '@nestjs/common';
import { OllamaService } from './ollama.service';

export interface Task {
  description: string;
  agent: string;
  dependencies?: string[]; // Ajout pour gérer les dépendances entre tâches
}

@Injectable()
export class PlannerService {
  constructor(private readonly ollama: OllamaService) {}

  async plan(goal: string, contextSummary: string = ''): Promise<Task[]> {
    // Utiliser Ollama pour décomposer le goal en tâches structurées
    const model = 'llama3.2:latest'; // Modèle général pour planning
    const prompt = `Décomposez ce goal en tâches détaillées pour un projet Node.js: "${goal}". 
    Incluez le type d'agent pour chaque tâche (RefactorAgent, SecurityAgent, PerformanceAgent, TestAgent, DocAgent).
    Si applicable, ajoutez des dépendances entre tâches.
    Contexte précédent: ${contextSummary}.
    Output as JSON array of {description: string, agent: string, dependencies: string[]}.`;

    const result = await this.ollama.generate(prompt, model);
    try {
      return JSON.parse(result);
    } catch {
      // Fallback to simple splitting if parse fails
      const sentences = goal.split(/\.|\n/).map(s => s.trim()).filter(Boolean);
      return sentences.map(s => {
        let agent = 'RefactorAgent';
        const l = s.toLowerCase();
        if (l.includes('security')) agent = 'SecurityAgent';
        else if (l.includes('performance')) agent = 'PerformanceAgent';
        else if (l.includes('test')) agent = 'TestAgent';
        else if (l.includes('document')) agent = 'DocAgent';
        return { description: s, agent };
      });
    }
  }
}