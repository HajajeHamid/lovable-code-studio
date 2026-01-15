import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OllamaService } from './ollama.service';
import { FileWriterService } from './file-writer.service';
import { ValidatorService } from './validator.service';
import { ScoreService } from './score.service';
import { ReviewerService } from './reviewer.service';
import { FixerService } from './fixer.service';
import { ModelRouterService } from './model-router.service';
import { PromptEngineService } from './prompt-engine.service';
import { MemoryService } from './memory.service';
import { PlannerService } from './planner.service';
import { CollaborationService } from './collaboration.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    OllamaService,
    FileWriterService,
    ValidatorService,
    ScoreService,
    ReviewerService,
    FixerService,
    ModelRouterService,
    PromptEngineService,
    MemoryService,
    PlannerService,
    CollaborationService,
  ],
})
export class AiModule {}
