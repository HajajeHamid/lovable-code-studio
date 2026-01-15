// src/modules/ai/validator.service.ts
import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';

@Injectable()
export class ValidatorService {
  validate(projectPath: string) {
    const results: any = { lint: true, build: true, test: true, errors: [] };

    try {
      execSync('npm run lint -- --quiet', { cwd: projectPath, stdio: 'pipe' }); // Ajout --quiet pour moins de verbose
    } catch (e: any) {
      results.lint = false;
      results.errors.push(e.stdout?.toString() || e.message);
    }

    try {
      execSync('npm run build', { cwd: projectPath, stdio: 'pipe' });
    } catch (e: any) {
      results.build = false;
      results.errors.push(e.stdout?.toString() || e.message);
    }

    try {
      execSync('npm test -- --runInBand --passWithNoTests', { cwd: projectPath, stdio: 'pipe' }); // Ajout --passWithNoTests
    } catch (e: any) {
      results.test = false;
      results.errors.push(e.stdout?.toString() || e.message);
    }

    return results;
  }
}