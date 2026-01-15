// src/modules/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { FileWriterService } from './file-writer.service';
import { ValidatorService } from './validator.service';
import { ScoreService, ScoreResult } from './score.service';
import { ReviewerService } from './reviewer.service';
import { FixerService } from './fixer.service';
import { ModelRouterService } from './model-router.service';
import { PromptEngineService } from './prompt-engine.service';
import { MemoryService } from './memory.service';
import { PlannerService, Task } from './planner.service';
import { CollaborationService } from './collaboration.service';

@Injectable()
export class AiService {
  constructor(
    private readonly ollama: OllamaService,
    private readonly writer: FileWriterService,
    private readonly validator: ValidatorService,
    private readonly scorer: ScoreService,
    private readonly reviewer: ReviewerService,
    private readonly fixer: FixerService,
    private readonly modelRouter: ModelRouterService,
    private readonly promptEngine: PromptEngineService,
    private readonly memory: MemoryService,
    private readonly planner: PlannerService,
    private readonly collaboration: CollaborationService
  ) {}

  async execute(goal: string, projectPath = './project', userId: string) {
    const maxIterations = 3;
    let lastError = '';
    let finalDiffs: any[] = [];

    // 🔹 1️⃣ Recherche de contexte similaire dans la mémoire
    const contextEntries = await this.memory.query(goal);
    const contextDiffs = contextEntries.flatMap(e => e.diffs);
    if (contextDiffs.length > 0) {
      // Optionally apply or merge context diffs
      console.log('Using context from memory');
    }

    // 🔹 2️⃣ Découpe multi-agent
    const tasks: Task[] = this.planner.plan(goal);

    for (const task of tasks) {
      let diffs: any[] = [];
      for (let i = 0; i < maxIterations; i++) {
        // Choix du modèle intelligent selon agent et erreurs passées
        const model = this.modelRouter.selectModelForAgent(task.agent, lastError);

        // Génération des diffs avec prompt contextuel
        const genPrompt = this.promptEngine.buildGenPrompt(
          task.description,
          lastError
        );
        const genResult = await this.ollama.generate(genPrompt, model);

        try {
          diffs = JSON.parse(genResult);
        } catch {
          diffs = [];
          lastError = 'Failed to parse generated diffs';
          continue;
        }

        // 🔹 Reviewer
        const reviewResult = await this.reviewer.review(task.description, diffs);
        if (reviewResult.includes('APPROVED')) break;

        // 🔹 Fixer automatique si nécessaire
        diffs = await this.fixer.fix(task.description, reviewResult, diffs);
        lastError = reviewResult;
      }

      // 🔹 Collaboration : proposer les diffs pour vote
      for (const diff of diffs) {
        this.collaboration.proposeDiff({ ...diff, proposedBy: userId, approvedBy: [], rejectedBy: [] });
      }

      // Ajouter aux diffs finaux seulement les diffs approuvés par vote
      finalDiffs.push(...this.collaboration.getApprovedDiffs(1));
    }

    // 🔹 Apply des diffs
    this.writer.applyDiffs(projectPath, finalDiffs);

    // 🔹 Validation et scoring multidimensionnel
    const validation = this.validator.validate(projectPath);
    const scoreResult: ScoreResult = this.scorer.score(validation, projectPath);

    // 🔹 Stockage dans mémoire intelligente pour auto-amélioration
    await this.memory.add(goal, finalDiffs, scoreResult.global);

    // 🔹 Retour final
    return {
      message: 'Pipeline IA complet exécuté',
      diffs: finalDiffs,
      validation,
      score: scoreResult,
      context: contextEntries,
      audit: this.collaboration.getAuditTrail(),
    };
  }
}