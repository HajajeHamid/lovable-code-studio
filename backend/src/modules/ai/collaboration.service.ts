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