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
import * as fs from 'fs';
import * as path from 'path';
import * as diff from 'diff'; // Added for proper diff patching

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

  async execute(goal: string, projectPath: string = './project', userId: string) {
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    const maxIterations = 5; // Increased for better iteration
    let lastError = '';
    let finalDiffs: any[] = [];

    // 🔹 1️⃣ Recherche de contexte similaire dans la mémoire avec résumé
    const contextEntries = await this.memory.query(goal, 3); // Top 3 similar
    const contextSummary = this.summarizeContext(contextEntries);
    const contextDiffs = contextEntries.flatMap(e => e.diffs);

    // 🔹 2️⃣ Découpe multi-agent améliorée avec Ollama pour décomposition
    const tasks: Task[] = await this.planner.plan(goal, contextSummary);

    for (const task of tasks) {
      let diffs: any[] = [];
      for (let i = 0; i < maxIterations; i++) {
        // Choix du modèle intelligent selon agent et erreurs passées
        const model = this.modelRouter.selectModelForAgent(task.agent, lastError);

        // Génération des diffs avec prompt contextuel incluant résumé de mémoire
        const genPrompt = this.promptEngine.buildGenPrompt(
          task.description,
          lastError,
          contextSummary
        );
        const genResult = await this.ollama.generate(genPrompt, model);

        try {
          diffs = JSON.parse(genResult);
        } catch {
          diffs = [];
          lastError = 'Failed to parse generated diffs';
          continue;
        }

        // Appliquer temporairement les diffs pour review
        this.writer.applyDiffs(projectPath, diffs, true); // Mode temporaire

        // 🔹 Reviewer avec contexte
        const reviewResult = await this.reviewer.review(task.description, diffs, contextSummary);
        if (reviewResult.includes('APPROVED')) break;

        // 🔹 Fixer automatique si nécessaire
        diffs = await this.fixer.fix(task.description, reviewResult, diffs, contextSummary);
        lastError = reviewResult;

        // Rollback temporary apply if not approved
        this.writer.rollbackDiffs(projectPath, diffs);
      }

      // 🔹 Collaboration : proposer les diffs pour vote (simulé pour single user, ou étendre pour multi)
      for (const diff of diffs) {
        const proposedDiff = { ...diff, proposedBy: userId, approvedBy: [], rejectedBy: [] };
        this.collaboration.proposeDiff(proposedDiff);
        // Simulation d'approbation automatique pour dev, ou implémenter vote réel
        this.collaboration.vote(userId, diff.file, true); // Auto-approve for now
      }

      // Ajouter aux diffs finaux seulement les diffs approuvés
      finalDiffs.push(...this.collaboration.getApprovedDiffs(1));
    }

    // 🔹 Apply des diffs finaux avec patching réel
    this.writer.applyDiffs(projectPath, finalDiffs);

    // 🔹 Validation et scoring multidimensionnel
    const validation = this.validator.validate(projectPath);
    const scoreResult: ScoreResult = this.scorer.score(validation, projectPath);

    // 🔹 Stockage dans mémoire intelligente pour auto-amélioration
    await this.memory.add(goal, finalDiffs, scoreResult.global);

    // 🔹 Retour final avec audit trail
    return {
      message: 'Pipeline IA complet exécuté avec succès',
      diffs: finalDiffs,
      validation,
      score: scoreResult,
      context: contextEntries,
      audit: this.collaboration.getAuditTrail(),
    };
  }

  private summarizeContext(entries: any[]): string {
    if (entries.length === 0) return '';
    return entries.map(e => `Goal: ${e.goal}, Score: ${e.score}`).join('\n');
  }
}