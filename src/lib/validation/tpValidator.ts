// ============================================
// TP VALIDATOR - Validation robuste des fichiers TP
// Valide format, syntaxe, relations et génère des rapports détaillés
// ============================================

import { ParseResult, ProgramNode } from '@/lib/tp-parser/types';
import { parseTP } from '@/lib/tp-parser/parser';

// ============================================
// TYPES
// ============================================

export interface ValidationError {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  line?: number;
  column?: number;
  fix?: string;
}

export interface ValidationResult {
  valid: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
  statistics: {
    totalBlocks: number;
    blocksByType: Record<string, number>;
    coverage: number;
    complexity: number;
  };
}

export interface RelationValidationResult {
  valid: boolean;
  issues: ValidationError[];
  graph: {
    nodes: string[];
    edges: Array<{ from: string; to: string; type: string }>;
  };
}

// ============================================
// FORMAT VALIDATION
// ============================================

export function validateTPFormat(source: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: ValidationError[] = [];
  let score = 100;
  
  // Parse the source
  const parseResult = parseTP(source);
  
  // Check parse errors
  if (parseResult.errors && parseResult.errors.length > 0) {
    parseResult.errors.forEach(err => {
      errors.push({
        type: 'error',
        code: 'PARSE_ERROR',
        message: err.message,
        line: (err as any).line,
        column: (err as any).column,
      });
      score -= 10;
    });
  }
  
  // Check parse warnings
  if (parseResult.warnings && parseResult.warnings.length > 0) {
    parseResult.warnings.forEach(warn => {
      warnings.push({
        type: 'warning',
        code: 'PARSE_WARNING',
        message: warn.message,
        line: (warn as any).line,
      });
      score -= 3;
    });
  }
  
  // Validate structure
  const program = parseResult.program;
  
  // Check naming conventions
  validateNamingConventions(program, warnings);
  
  // Check required fields
  validateRequiredFields(program, errors);
  
  // Check best practices
  validateBestPractices(program, suggestions);
  
  // Calculate statistics
  const statistics = calculateStatistics(program);
  
  // Adjust score based on warnings and suggestions
  score -= warnings.length * 2;
  score -= suggestions.length * 1;
  
  return {
    valid: errors.length === 0,
    score: Math.max(0, Math.min(100, score)),
    errors,
    warnings,
    suggestions,
    statistics,
  };
}

// ============================================
// NAMING CONVENTIONS
// ============================================

function validateNamingConventions(program: ProgramNode, warnings: ValidationError[]): void {
  // Check model names (should be PascalCase)
  program.models.forEach(model => {
    if (model.name && !/^[A-Z][a-zA-Z0-9]*$/.test(model.name)) {
      warnings.push({
        type: 'warning',
        code: 'NAMING_MODEL',
        message: `Model "${model.name}" devrait être en PascalCase`,
        fix: `Renommer en ${toPascalCase(model.name)}`,
      });
    }
  });
  
  // Check enum names
  program.enums.forEach(en => {
    if (en.name && !/^[A-Z][a-zA-Z0-9]*$/.test(en.name)) {
      warnings.push({
        type: 'warning',
        code: 'NAMING_ENUM',
        message: `Enum "${en.name}" devrait être en PascalCase`,
        fix: `Renommer en ${toPascalCase(en.name)}`,
      });
    }
    
    // Check enum values (should be UPPER_SNAKE_CASE)
    en.values.forEach(val => {
      if (typeof val === 'object' && val.name && !/^[A-Z][A-Z0-9_]*$/.test(val.name)) {
        warnings.push({
          type: 'warning',
          code: 'NAMING_ENUM_VALUE',
          message: `Valeur enum "${val.name}" devrait être en UPPER_SNAKE_CASE`,
          fix: `Renommer en ${toUpperSnakeCase(val.name)}`,
        });
      }
    });
  });
  
  // Check field names (should be camelCase)
  program.fields.forEach(field => {
    if (field.name && !/^[a-z][a-zA-Z0-9]*$/.test(field.name)) {
      warnings.push({
        type: 'warning',
        code: 'NAMING_FIELD',
        message: `Champ "${field.name}" devrait être en camelCase`,
        fix: `Renommer en ${toCamelCase(field.name)}`,
      });
    }
  });
}

// ============================================
// REQUIRED FIELDS
// ============================================

function validateRequiredFields(program: ProgramNode, errors: ValidationError[]): void {
  // Check models have at least one field
  program.models.forEach(model => {
    if (!model.fields || model.fields.length === 0) {
      errors.push({
        type: 'error',
        code: 'REQUIRED_FIELDS',
        message: `Model "${model.name}" doit avoir au moins un champ`,
      });
    }
  });
  
  // Check pages have a path
  program.pages.forEach(page => {
    if (!page.path) {
      errors.push({
        type: 'error',
        code: 'REQUIRED_PATH',
        message: `Page "${page.name}" doit avoir un path`,
      });
    }
  });
  
  // Check endpoints have method and path
  program.endpoints.forEach(endpoint => {
    if (!endpoint.method) {
      errors.push({
        type: 'error',
        code: 'REQUIRED_METHOD',
        message: `Endpoint "${endpoint.name || 'unnamed'}" doit avoir une méthode HTTP`,
      });
    }
    if (!endpoint.path) {
      errors.push({
        type: 'error',
        code: 'REQUIRED_PATH',
        message: `Endpoint "${endpoint.name || 'unnamed'}" doit avoir un path`,
      });
    }
  });
  
  // Check microservices have a name
  program.microservices.forEach(ms => {
    if (!ms.name) {
      errors.push({
        type: 'error',
        code: 'REQUIRED_NAME',
        message: `Microservice doit avoir un nom`,
      });
    }
  });
}

// ============================================
// BEST PRACTICES
// ============================================

function validateBestPractices(program: ProgramNode, suggestions: ValidationError[]): void {
  // Suggest adding tests
  if (program.genTests.length === 0 && program.models.length > 0) {
    suggestions.push({
      type: 'info',
      code: 'SUGGEST_TESTS',
      message: 'Ajoutez @GenTest pour générer automatiquement les tests',
    });
  }
  
  // Suggest adding caching for APIs
  if (program.apis.length > 0 && program.caches.length === 0) {
    suggestions.push({
      type: 'info',
      code: 'SUGGEST_CACHE',
      message: 'Considérez @Cache pour améliorer les performances API',
    });
  }
  
  // Suggest monitoring
  if (program.microservices.length > 0 && program.monitors.length === 0) {
    suggestions.push({
      type: 'info',
      code: 'SUGGEST_MONITORING',
      message: 'Ajoutez @Monitoring pour surveiller vos microservices',
    });
  }
  
  // Suggest documentation
  if (program.apis.length > 0 && program.docGens.length === 0) {
    suggestions.push({
      type: 'info',
      code: 'SUGGEST_DOCS',
      message: 'Utilisez @DocGen pour générer la documentation API',
    });
  }
  
  // Suggest security for APIs
  if (program.apis.length > 0 && program.securityRules.length === 0) {
    suggestions.push({
      type: 'info',
      code: 'SUGGEST_SECURITY',
      message: 'Ajoutez @Security pour protéger vos endpoints',
    });
  }
}

// ============================================
// RELATION VALIDATION
// ============================================

export function validateTPRelations(sources: Record<string, string>): RelationValidationResult {
  const issues: ValidationError[] = [];
  const nodes: string[] = [];
  const edges: Array<{ from: string; to: string; type: string }> = [];
  
  // Parse all files
  const programs: Record<string, ProgramNode> = {};
  
  for (const [filename, source] of Object.entries(sources)) {
    try {
      const result = parseTP(source);
      programs[filename] = result.program;
      nodes.push(filename);
    } catch (error) {
      issues.push({
        type: 'error',
        code: 'PARSE_FAILED',
        message: `Impossible de parser ${filename}: ${error}`,
      });
    }
  }
  
  // Collect all model names
  const allModels = new Map<string, string>(); // modelName -> filename
  
  for (const [filename, program] of Object.entries(programs)) {
    program.models.forEach(model => {
      if (model.name) {
        if (allModels.has(model.name)) {
          issues.push({
            type: 'warning',
            code: 'DUPLICATE_MODEL',
            message: `Model "${model.name}" défini dans ${allModels.get(model.name)} et ${filename}`,
          });
        }
        allModels.set(model.name, filename);
      }
    });
  }
  
  // Check relations
  for (const [filename, program] of Object.entries(programs)) {
    program.relations.forEach(relation => {
      const fromModel = (relation as any).from || (relation as any).source;
      const toModel = (relation as any).to || (relation as any).target;
      
      // Check if referenced models exist
      if (fromModel && !allModels.has(fromModel)) {
        issues.push({
          type: 'error',
          code: 'MISSING_MODEL',
          message: `Relation dans ${filename}: Model source "${fromModel}" non trouvé`,
        });
      }
      
      if (toModel && !allModels.has(toModel)) {
        issues.push({
          type: 'error',
          code: 'MISSING_MODEL',
          message: `Relation dans ${filename}: Model cible "${toModel}" non trouvé`,
        });
      }
      
      if (fromModel && toModel && allModels.has(fromModel) && allModels.has(toModel)) {
        edges.push({
          from: fromModel,
          to: toModel,
          type: relation.type || 'relation',
        });
      }
    });
    
    // Check model field references
    program.models.forEach(model => {
      model.fields.forEach(field => {
        const dt = field.dataType;
        if (typeof dt === 'object' && dt.type === 'Reference' && dt.model) {
          if (!allModels.has(dt.model)) {
            issues.push({
              type: 'error',
              code: 'MISSING_REFERENCE',
              message: `Champ "${field.name}" dans "${model.name}": Model référencé "${dt.model}" non trouvé`,
            });
          } else {
            edges.push({
              from: model.name || 'unknown',
              to: dt.model,
              type: 'reference',
            });
          }
        }
      });
    });
  }
  
  // Check for circular dependencies (simple check)
  const visited = new Set<string>();
  const inStack = new Set<string>();
  
  function hasCycle(node: string): boolean {
    if (inStack.has(node)) return true;
    if (visited.has(node)) return false;
    
    visited.add(node);
    inStack.add(node);
    
    const neighbors = edges.filter(e => e.from === node).map(e => e.to);
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor)) {
        return true;
      }
    }
    
    inStack.delete(node);
    return false;
  }
  
  for (const node of allModels.keys()) {
    if (hasCycle(node)) {
      issues.push({
        type: 'warning',
        code: 'CIRCULAR_DEPENDENCY',
        message: `Dépendance circulaire détectée impliquant "${node}"`,
      });
      break;
    }
    visited.clear();
    inStack.clear();
  }
  
  return {
    valid: issues.filter(i => i.type === 'error').length === 0,
    issues,
    graph: {
      nodes: Array.from(allModels.keys()),
      edges,
    },
  };
}

// ============================================
// STATISTICS
// ============================================

function calculateStatistics(program: ProgramNode): ValidationResult['statistics'] {
  const blocksByType: Record<string, number> = {};
  
  // Count all block types
  const countItems = (items: any[], type: string) => {
    blocksByType[type] = (blocksByType[type] || 0) + items.length;
  };
  
  countItems(program.models, 'Model');
  countItems(program.enums, 'Enum');
  countItems(program.dataJsons, 'DataJson');
  countItems(program.components, 'Component');
  countItems(program.pages, 'Page');
  countItems(program.apis, 'API');
  countItems(program.endpoints, 'Endpoint');
  countItems(program.microservices, 'Microservice');
  countItems(program.workflows, 'Workflow');
  countItems(program.sagas, 'Saga');
  countItems(program.cqrsContexts, 'CQRS');
  countItems(program.eventSourcings, 'EventSourcing');
  countItems(program.caches, 'Cache');
  countItems(program.monitors, 'Monitoring');
  countItems(program.genTests, 'GenTest');
  countItems(program.cicdGens, 'CICDGen');
  
  const totalBlocks = Object.values(blocksByType).reduce((a, b) => a + b, 0);
  
  // Calculate coverage (how many key areas are covered)
  const areas = [
    program.models.length > 0,
    program.apis.length > 0 || program.endpoints.length > 0,
    program.pages.length > 0 || program.components.length > 0,
    program.genTests.length > 0,
    program.caches.length > 0,
    program.monitors.length > 0,
  ];
  const coverage = (areas.filter(Boolean).length / areas.length) * 100;
  
  // Calculate complexity
  const complexity = Math.min(100, totalBlocks * 2 + 
    (program.sagas.length * 5) + 
    (program.cqrsContexts.length * 5) + 
    (program.eventSourcings.length * 5));
  
  return {
    totalBlocks,
    blocksByType,
    coverage,
    complexity,
  };
}

// ============================================
// UTILITIES
// ============================================

function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

function toUpperSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s]+/g, '_')
    .toUpperCase()
    .replace(/^_/, '');
}

// ============================================
// EXPORTS
// ============================================

export default {
  validateTPFormat,
  validateTPRelations,
};
