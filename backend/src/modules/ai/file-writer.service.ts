// src/modules/ai/file-writer.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as diff from 'diff'; // Utiliser la lib diff pour patching réel

@Injectable()
export class FileWriterService {
  private backups: Map<string, string> = new Map(); // Pour rollback

  applyDiffs(basePath: string, diffs: any[], temporary: boolean = false) {
    for (const d of diffs) {
      const fullPath = path.join(basePath, d.file);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });

      let currentContent = '';
      if (fs.existsSync(fullPath)) {
        currentContent = fs.readFileSync(fullPath, 'utf-8');
      } else if (d.original) {
        currentContent = d.original;
      }

      if (temporary) {
        this.backups.set(fullPath, currentContent);
      }

      // Appliquer comme patch si format diff, sinon overwrite
      if (this.isDiffFormat(d.modified)) {
        const patched = diff.applyPatch(currentContent, d.modified);
        if (patched !== false) {
          fs.writeFileSync(fullPath, patched, 'utf-8');
        } else {
          throw new Error(`Failed to apply patch for ${d.file}`);
        }
      } else {
        fs.writeFileSync(fullPath, d.modified, 'utf-8');
      }
    }
  }

  rollbackDiffs(basePath: string, diffs: any[]) {
    for (const d of diffs) {
      const fullPath = path.join(basePath, d.file);
      const backup = this.backups.get(fullPath);
      if (backup !== undefined) {
        fs.writeFileSync(fullPath, backup, 'utf-8');
        this.backups.delete(fullPath);
      }
    }
  }

  private isDiffFormat(content: string): boolean {
    return content.startsWith('diff --git') || content.includes('@@'); // Simple check for unified diff
  }
}