
<DOCUMENT filename="reviewer.service.ts">

</DOCUMENT>

<DOCUMENT filename="fixer.service.ts">
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
</DOCUMENT>

<DOCUMENT filename="collaboration.service.ts">
// src/modules/ai/collaboration.service.ts
import { Injectable } from '@nestjs/common';
import { DiffItem, AuditEntry } from './types/collaboration.types';

@Injectable()
export class CollaborationService {
  private diffs: DiffItem[] = [];
  private audit: AuditEntry[] = [];

  proposeDiff(diff: DiffItem) {
    this.diffs.push(diff);
    this.log(diff.proposedBy, `Proposed diff for ${diff.file}`);
  }

  vote(userId: string, file: string, approve: boolean) {
    const diff = this.diffs.find(d => d.file === file);
    if (!diff) return;

    if (approve) {
      if (!diff.approvedBy.includes(userId)) diff.approvedBy.push(userId);
      this.log(userId, `Approved diff for ${file}`);
    } else {
      if (!diff.rejectedBy.includes(userId)) diff.rejectedBy.push(userId);
      this.log(userId, `Rejected diff for ${file}`);
    }
  }

  getApprovedDiffs(minVotes = 1) {
    return this.diffs.filter(d => d.approvedBy.length >= minVotes && d.rejectedBy.length === 0);
  }

  private log(userId: string, action: string) {
    this.audit.push({
      timestamp: new Date(),
      userId,
      action,
      details: action,
    });
  }

  getAuditTrail() {
    return this.audit;
  }
}
</DOCUMENT>

<DOCUMENT filename="package.json">

</DOCUMENT>