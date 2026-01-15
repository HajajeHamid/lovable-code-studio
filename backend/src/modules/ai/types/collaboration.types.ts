// src/modules/ai/types/collaboration.types.ts
export interface User {
  id: string;
  name: string;
}

export interface DiffItem {
  file: string;
  original: string;
  modified: string;
  proposedBy: string; // userId
  approvedBy: string[]; // userIds
  rejectedBy: string[]; // userIds
}

export interface AuditEntry {
  timestamp: Date;
  userId: string;
  action: string;
  details: string;
}
