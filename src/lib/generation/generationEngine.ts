// Engine de génération de projets complets
import ollamaService, { ChatMessage } from '../ollama/ollamaService';
import { modelRouter, TaskType } from '../ollama/modelRouter';
import { ProjectSpec, Diff, GenerationTask } from '../../stores/chatdevStore';

export interface GenerationResult {
  success: boolean;
  files: Map<string, string>;
  diffs: Diff[];
  errors: string[];
  summary: string;
}

export interface TaskPlan {
  id: string;
  description: string;
  agent: string;
  model: string;
  dependencies: string[];
  priority: number;
}

// Prompts optimisés pour CPU (concis mais efficaces)
const SYSTEM_PROMPTS = {
  planner: `Tu es un architecte logiciel expert. Analyse le projet et crée un plan de tâches.
Réponds UNIQUEMENT en JSON valide avec cette structure:
[{"description": "tâche", "agent": "type", "priority": 1}]
Agents disponibles: CodeGenerator, APIDesigner, DatabaseDesigner, TestWriter, DocWriter`,

  codeGenerator: `Tu es un développeur senior. Génère du code propre et fonctionnel.
Réponds UNIQUEMENT avec le code, sans explication. Format:
\`\`\`[langage]
// Contenu du fichier
\`\`\``,

  reviewer: `Tu es un reviewer de code expert. Analyse le code pour les bugs, sécurité et performance.
Réponds avec: APPROVED si parfait, sinon liste les problèmes à corriger.`,

  fixer: `Tu es un expert en débogage. Corrige les problèmes identifiés.
Réponds UNIQUEMENT avec le code corrigé, sans explication.`,

  summarizer: `Résume ce contexte en 100 mots maximum pour optimiser la mémoire.
Garde uniquement les informations essentielles pour la génération de code.`,
};

class GenerationEngine {
  private contextHistory: string[] = [];
  private maxContextTokens = 2000; // Limite pour CPU

  // Résumer le contexte pour économiser les tokens
  async summarizeContext(context: string, model: string): Promise<string> {
    if (context.length < 500) return context;
    
    try {
      const summary = await ollamaService.generate(
        `${SYSTEM_PROMPTS.summarizer}\n\nContexte:\n${context}`,
        { model, temperature: 0.3, max_tokens: 200 }
      );
      return summary;
    } catch {
      // Fallback: couper le contexte
      return context.slice(-500);
    }
  }

  // Créer un plan de génération
  async createPlan(spec: ProjectSpec): Promise<TaskPlan[]> {
    const model = modelRouter.selectModel('planning');
    if (!model) throw new Error('Aucun modèle disponible pour la planification');

    const prompt = `${SYSTEM_PROMPTS.planner}

Projet: ${spec.name}
Type: ${spec.type} avec ${spec.framework}
Description: ${spec.description}

Fonctionnalités requises:
${spec.requirements.map((r, i) => `${i + 1}. [${r.priority}] ${r.description}`).join('\n')}

Génère le plan de tâches en JSON.`;

    try {
      const response = await ollamaService.generate(prompt, {
        model,
        temperature: 0.3,
        max_tokens: 1000,
      });

      // Parser le JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Format de plan invalide');
      
      const tasks = JSON.parse(jsonMatch[0]);
      return tasks.map((t: any, index: number) => ({
        id: crypto.randomUUID(),
        description: t.description,
        agent: t.agent || 'CodeGenerator',
        model: modelRouter.selectModel(this.agentToTaskType(t.agent)) || model,
        dependencies: t.dependencies || [],
        priority: t.priority || index + 1,
      }));
    } catch (error) {
      console.error('Plan creation error:', error);
      // Fallback: plan basique
      return this.createBasicPlan(spec);
    }
  }

  private createBasicPlan(spec: ProjectSpec): TaskPlan[] {
    const baseModel = modelRouter.selectModel('code_generation') || 'llama3.2:latest';
    const tasks: TaskPlan[] = [];

    // Structure de base
    tasks.push({
      id: crypto.randomUUID(),
      description: `Créer la structure de base du projet ${spec.type}/${spec.framework}`,
      agent: 'CodeGenerator',
      model: baseModel,
      dependencies: [],
      priority: 1,
    });

    // Configuration
    tasks.push({
      id: crypto.randomUUID(),
      description: 'Créer les fichiers de configuration (package.json, tsconfig, etc.)',
      agent: 'CodeGenerator',
      model: baseModel,
      dependencies: [tasks[0].id],
      priority: 2,
    });

    // Pour chaque requirement
    spec.requirements.forEach((req, index) => {
      tasks.push({
        id: crypto.randomUUID(),
        description: req.description,
        agent: this.getCategoryAgent(req.category),
        model: modelRouter.selectModel(this.categoryToTaskType(req.category)) || baseModel,
        dependencies: [tasks[1].id],
        priority: 3 + index,
      });
    });

    return tasks;
  }

  // Exécuter une tâche de génération
  async executeTask(
    task: TaskPlan,
    spec: ProjectSpec,
    existingFiles: Map<string, string>,
    onProgress?: (content: string) => void
  ): Promise<Diff[]> {
    const diffs: Diff[] = [];
    
    // Construire le contexte condensé
    const contextSummary = await this.getCondensedContext(spec, existingFiles, task);
    
    const prompt = this.buildTaskPrompt(task, spec, contextSummary);
    
    let response = '';
    await ollamaService.generate(prompt, {
      model: task.model,
      temperature: 0.7,
      max_tokens: 2048,
    }, (token) => {
      response += token;
      if (onProgress) onProgress(token);
    });

    // Parser les fichiers générés
    const files = this.parseCodeBlocks(response);
    for (const [filePath, content] of files) {
      const original = existingFiles.get(filePath) || '';
      if (content !== original) {
        diffs.push({
          file: filePath,
          original,
          modified: content,
          language: this.getLanguage(filePath),
          status: 'pending',
        });
      }
    }

    // Ajouter au contexte
    this.contextHistory.push(`Tâche: ${task.description}\nFichiers: ${Array.from(files.keys()).join(', ')}`);

    return diffs;
  }

  // Réviser le code généré
  async reviewCode(diffs: Diff[], spec: ProjectSpec): Promise<{ approved: boolean; issues: string[] }> {
    const model = modelRouter.selectModel('code_review');
    if (!model) return { approved: true, issues: [] };

    const prompt = `${SYSTEM_PROMPTS.reviewer}

Projet: ${spec.name} (${spec.type}/${spec.framework})

Code à réviser:
${diffs.map(d => `=== ${d.file} ===\n${d.modified}`).join('\n\n')}

Analyse ce code.`;

    try {
      const response = await ollamaService.generate(prompt, {
        model,
        temperature: 0.3,
        max_tokens: 500,
      });

      if (response.includes('APPROVED')) {
        return { approved: true, issues: [] };
      }

      const issues = response
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim());

      return { approved: false, issues };
    } catch {
      return { approved: true, issues: [] };
    }
  }

  // Corriger les problèmes
  async fixIssues(diffs: Diff[], issues: string[], spec: ProjectSpec): Promise<Diff[]> {
    const model = modelRouter.selectModel('code_fix');
    if (!model) return diffs;

    const fixedDiffs: Diff[] = [];

    for (const diff of diffs) {
      const prompt = `${SYSTEM_PROMPTS.fixer}

Fichier: ${diff.file}
Problèmes à corriger:
${issues.join('\n')}

Code actuel:
\`\`\`${diff.language}
${diff.modified}
\`\`\`

Corrige le code.`;

      try {
        const response = await ollamaService.generate(prompt, {
          model,
          temperature: 0.5,
          max_tokens: 2048,
        });

        const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
        const fixedCode = codeMatch ? codeMatch[1].trim() : diff.modified;

        fixedDiffs.push({
          ...diff,
          original: diff.modified,
          modified: fixedCode,
        });
      } catch {
        fixedDiffs.push(diff);
      }
    }

    return fixedDiffs;
  }

  // Helpers
  private async getCondensedContext(
    spec: ProjectSpec,
    files: Map<string, string>,
    currentTask: TaskPlan
  ): Promise<string> {
    const context = [
      `Projet: ${spec.name} (${spec.type}/${spec.framework})`,
      `Tâche actuelle: ${currentTask.description}`,
      `Fichiers existants: ${Array.from(files.keys()).join(', ')}`,
      ...this.contextHistory.slice(-3), // Garder les 3 dernières tâches
    ].join('\n');

    if (context.length > this.maxContextTokens) {
      const model = modelRouter.selectModel('summarization');
      if (model) {
        return this.summarizeContext(context, model);
      }
    }

    return context;
  }

  private buildTaskPrompt(task: TaskPlan, spec: ProjectSpec, context: string): string {
    return `${SYSTEM_PROMPTS.codeGenerator}

Contexte:
${context}

Tâche: ${task.description}

Génère le code nécessaire pour ${spec.type === 'nodejs' ? 'Node.js' : 'Python'} avec ${spec.framework}.
Utilise les meilleures pratiques et conventions du framework.`;
  }

  private parseCodeBlocks(response: string): Map<string, string> {
    const files = new Map<string, string>();
    const regex = /(?:\/\/|#)\s*(?:File|Fichier):\s*([^\n]+)\n```[\w]*\n([\s\S]*?)```/gi;
    
    let match;
    while ((match = regex.exec(response)) !== null) {
      const filePath = match[1].trim();
      const content = match[2].trim();
      files.set(filePath, content);
    }

    // Fallback: chercher des blocs de code simples
    if (files.size === 0) {
      const simpleRegex = /```(\w+)\n([\s\S]*?)```/g;
      let blockIndex = 0;
      while ((match = simpleRegex.exec(response)) !== null) {
        const lang = match[1];
        const content = match[2].trim();
        const ext = this.getExtension(lang);
        files.set(`generated_${blockIndex}.${ext}`, content);
        blockIndex++;
      }
    }

    return files;
  }

  private getExtension(lang: string): string {
    const map: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      json: 'json',
      yaml: 'yml',
      markdown: 'md',
      sql: 'sql',
      html: 'html',
      css: 'css',
    };
    return map[lang.toLowerCase()] || 'txt';
  }

  private getLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      json: 'json',
      yml: 'yaml',
      yaml: 'yaml',
      md: 'markdown',
      sql: 'sql',
      html: 'html',
      css: 'css',
    };
    return map[ext] || 'text';
  }

  private agentToTaskType(agent: string): TaskType {
    const map: Record<string, TaskType> = {
      CodeGenerator: 'code_generation',
      APIDesigner: 'code_generation',
      DatabaseDesigner: 'sql',
      TestWriter: 'testing',
      DocWriter: 'documentation',
    };
    return map[agent] || 'general';
  }

  private categoryToTaskType(category: string): TaskType {
    const map: Record<string, TaskType> = {
      feature: 'code_generation',
      technical: 'code_generation',
      ui: 'code_generation',
      api: 'code_generation',
      database: 'sql',
    };
    return map[category] || 'code_generation';
  }

  private getCategoryAgent(category: string): string {
    const map: Record<string, string> = {
      feature: 'CodeGenerator',
      technical: 'CodeGenerator',
      ui: 'CodeGenerator',
      api: 'APIDesigner',
      database: 'DatabaseDesigner',
    };
    return map[category] || 'CodeGenerator';
  }

  clearContext() {
    this.contextHistory = [];
  }
}

export const generationEngine = new GenerationEngine();
export default generationEngine;
