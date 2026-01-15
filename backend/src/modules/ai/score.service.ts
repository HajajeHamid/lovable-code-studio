// src/modules/ai/score.service.ts
import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import * as escomplex from 'escomplex';
import * as fs from 'fs';
import * as path from 'path';

export interface ScoreResult {
  lint: number;
  tests: number;
  complexity: number;
  security: number;
  maintainability: number;
  dx: number;
  global: number;
}

@Injectable()
export class ScoreService {
  score(validation: any, projectPath: string): ScoreResult {
    let lint = validation.lint ? 100 : 50;
    let tests = validation.test ? 100 : 40;

    // Complexity: Use escomplex on JS/TS files
    let complexity = this.calculateComplexity(projectPath);

    // Security: Run snyk test (assuming snyk is installed)
    let security = this.calculateSecurity(projectPath);

    // Maintainability: Based on complexity and sloc
    let maintainability = this.calculateMaintainability(projectPath);

    // DX: Placeholder, could use readability metrics
    let dx = 80;

    // Global weighted score
    const global = Math.round(
      0.2 * lint +
      0.2 * tests +
      0.2 * complexity +
      0.15 * security +
      0.15 * maintainability +
      0.1 * dx
    );

    return { lint, tests, complexity, security, maintainability, dx, global };
  }

  private calculateComplexity(projectPath: string): number {
    let totalComplexity = 0;
    let fileCount = 0;
    this.walkDir(projectPath, (file) => {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const code = fs.readFileSync(file, 'utf-8');
        const report = escomplex.analyse(code);
        totalComplexity += report.aggregate.cyclomatic;
        fileCount++;
      }
    });
    return fileCount > 0 ? 100 - (totalComplexity / fileCount) * 5 : 80; // Arbitrary scaling
  }

  private calculateSecurity(projectPath: string): number {
    try {
      const output = execSync('snyk test', { cwd: projectPath, stdio: 'pipe' }).toString();
      const vulnerabilities = output.match(/High severity/g)?.length || 0;
      return 100 - vulnerabilities * 10;
    } catch {
      return 90;
    }
  }

  private calculateMaintainability(projectPath: string): number {
    let totalSloc = 0;
    let fileCount = 0;
    this.walkDir(projectPath, (file) => {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const code = fs.readFileSync(file, 'utf-8');
        // Simple line count for sloc
        totalSloc += code.split('\n').length;
        fileCount++;
      }
    });
    return fileCount > 0 ? 100 - (totalSloc / fileCount) / 10 : 85; // Arbitrary
  }

  private walkDir(dir: string, callback: (file: string) => void) {
    fs.readdirSync(dir).forEach(f => {
      const dirPath = path.join(dir, f);
      const isDirectory = fs.statSync(dirPath).isDirectory();
      isDirectory ? this.walkDir(dirPath, callback) : callback(dirPath);
    });
  }
}