// ================================================================
// TP LANGUAGE - COMPLETE BLOCK LIBRARY
// Unified blocks for database.tp, generate_backend.tp, generate_frontend.tp
// ================================================================

import { 
  Database, Server, Globe, FileCode, FolderOpen, Play, 
  Settings, Layers, Code, Package, Zap, Shield, 
  GitBranch, Workflow, BarChart, TestTube, Cloud, 
  Activity, Puzzle, Bell, Users, Lock, FileText,
  Box, Cpu, HardDrive, Network, Palette, Layout,
  FormInput, Component, Rocket, Terminal
} from 'lucide-react';

export type BlockCategory = 
  | 'data' 
  | 'backend' 
  | 'frontend' 
  | 'architecture'
  | 'integration'
  | 'business'
  | 'testing'
  | 'infrastructure'
  | 'directives';

export interface TPBlock {
  icon: any;
  category: BlockCategory;
  template: string;
  params: string[];
  desc: string;
  fileTypes: ('database' | 'backend' | 'frontend')[];
  color: string;
}

export interface BlockInstance {
  id: string;
  type: string;
  category: BlockCategory;
  template: string;
  params: Record<string, string>;
  desc: string;
  icon: any;
  color: string;
  collapsed: boolean;
}

export interface TPFile {
  id: string;
  name: string;
  type: 'database' | 'backend' | 'frontend';
  blocks: BlockInstance[];
  modified: boolean;
}

export const TP_BLOCKS_LIBRARY: Record<string, TPBlock> = {
  // ================================================================
  // DATA & STRUCTURE BLOCKS (database.tp)
  // ================================================================
  
  '@DataModel': {
    icon: Database,
    category: 'data',
    template: `@DataModel {{name}} {
  Id String @unique @key @immutable
  dateCreation DateTime @default(now()) @immutable
  {{fields}}
}`,
    params: ['name', 'fields'],
    desc: 'Modèle de données principal avec champs et relations',
    fileTypes: ['database'],
    color: 'block-data',
  },

  '@DataJson': {
    icon: FileCode,
    category: 'data',
    template: `@DataJson {{name}} {
  {{fields}}
}`,
    params: ['name', 'fields'],
    desc: 'Structure JSON réutilisable',
    fileTypes: ['database'],
    color: 'block-data',
  },

  '@DataEnumeration': {
    icon: Package,
    category: 'data',
    template: '@DataEnumeration {{name}} {{{values}}}',
    params: ['name', 'values'],
    desc: 'Énumération de valeurs constantes',
    fileTypes: ['database'],
    color: 'block-data',
  },

  '@Module': {
    icon: Layers,
    category: 'data',
    template: `@Module {{name}} {
  {{content}}
}`,
    params: ['name', 'content'],
    desc: 'Module sectoriel regroupant entités liées',
    fileTypes: ['database'],
    color: 'block-data',
  },

  '@Relation': {
    icon: GitBranch,
    category: 'data',
    template: `@Relation {{name}} {
  from: {{fromModel}}
  to: {{toModel}}
  type: {{relationType}}
  onDelete: {{onDelete}}
}`,
    params: ['name', 'fromModel', 'toModel', 'relationType', 'onDelete'],
    desc: 'Relation entre modèles de données',
    fileTypes: ['database'],
    color: 'block-data',
  },

  // ================================================================
  // ARCHITECTURE BLOCKS
  // ================================================================
  
  '@Microservice': {
    icon: Server,
    category: 'architecture',
    template: `@Microservice {{name}} {
  port: {{port}}
  domain: {{domain}}
  dependencies: [{{dependencies}}]
  
  @API {
    type: {{apiType}}
    endpoints: [
      {{endpoints}}
    ]
  }
}`,
    params: ['name', 'port', 'domain', 'dependencies', 'apiType', 'endpoints'],
    desc: 'Service backend indépendant avec API dédiée',
    fileTypes: ['backend'],
    color: 'block-architecture',
  },

  '@EventSourcing': {
    icon: GitBranch,
    category: 'architecture',
    template: `@EventSourcing for {{aggregate}} {
  events: [{{events}}]
  
  @Projection {{projectionName}} {
    from: [{{sourceEvents}}]
    to: {{readModel}}
  }
  
  @Snapshot {
    every: {{frequency}}
    storage: {{storageType}}
  }
}`,
    params: ['aggregate', 'events', 'projectionName', 'sourceEvents', 'readModel', 'frequency', 'storageType'],
    desc: 'Persistance par événements immuables',
    fileTypes: ['backend'],
    color: 'block-architecture',
  },

  '@CQRS': {
    icon: GitBranch,
    category: 'architecture',
    template: `@CQRS for {{domain}} {
  @Commands {
    {{commands}}
  }
  
  @Queries {
    {{queries}}
  }
  
  @ReadModel {{readModelName}} {
    source: {{writeModel}}
    cache: {{cacheStrategy}}
  }
}`,
    params: ['domain', 'commands', 'queries', 'readModelName', 'writeModel', 'cacheStrategy'],
    desc: 'Séparation Commande/Requête pour scalabilité',
    fileTypes: ['backend'],
    color: 'block-architecture',
  },

  '@Saga': {
    icon: Workflow,
    category: 'architecture',
    template: `@Saga {{name}} {
  trigger: {{triggerEvent}}
  
  @Step {{stepName}} {
    action: {{action}}
    compensate: {{compensationAction}}
    onSuccess: {{nextStep}}
    onFailure: {{rollbackStep}}
  }
  
  @Timeout {{timeout}}
  @Retry {{retryStrategy}}
}`,
    params: ['name', 'triggerEvent', 'stepName', 'action', 'compensationAction', 'nextStep', 'rollbackStep', 'timeout', 'retryStrategy'],
    desc: 'Orchestration de transactions distribuées',
    fileTypes: ['backend'],
    color: 'block-architecture',
  },

  '@Blueprint': {
    icon: Layers,
    category: 'architecture',
    template: `@Blueprint {{projectType}} {
  @Stack {
    frontend: {{frontend}}
    backend: {{backend}}
    database: {{database}}
    cache: {{cache}}
  }
  
  @Architecture {
    pattern: {{pattern}}
    layers: [{{layers}}]
  }
  
  @Features {
    {{features}}
  }
}`,
    params: ['projectType', 'frontend', 'backend', 'database', 'cache', 'pattern', 'layers', 'features'],
    desc: 'Blueprint complet pour nouveau projet',
    fileTypes: ['backend'],
    color: 'block-architecture',
  },

  // ================================================================
  // BACKEND BLOCKS
  // ================================================================

  '@API': {
    icon: Network,
    category: 'backend',
    template: `@API {{name}} {
  type: {{type}}
  version: {{version}}
  base_path: {{basePath}}
  
  endpoints: [
    {{endpoints}}
  ]
  
  @Security {
    authentication: {{authType}}
    rate_limiting: {{rateLimit}}
  }
}`,
    params: ['name', 'type', 'version', 'basePath', 'endpoints', 'authType', 'rateLimit'],
    desc: 'API REST ou GraphQL avec configuration',
    fileTypes: ['backend'],
    color: 'block-backend',
  },

  '@BusinessRule': {
    icon: Shield,
    category: 'business',
    template: `@BusinessRule {{name}} for {{entity}} {
  condition: {{condition}}
  trigger: {{trigger}}
  
  @OnViolation {
    action: {{action}}
    message: "{{message}}"
  }
}`,
    params: ['name', 'entity', 'condition', 'trigger', 'action', 'message'],
    desc: 'Règle métier avec validation automatique',
    fileTypes: ['backend'],
    color: 'block-business',
  },

  '@Workflow': {
    icon: Workflow,
    category: 'business',
    template: `@Workflow {{name}} for {{entity}} {
  @States {
    {{states}}
  }
  
  @Transitions {
    {{transitions}}
  }
  
  @Guards {
    {{guards}}
  }
}`,
    params: ['name', 'entity', 'states', 'transitions', 'guards'],
    desc: 'Machine à états pour processus métier',
    fileTypes: ['backend'],
    color: 'block-business',
  },

  '@Cache': {
    icon: Zap,
    category: 'backend',
    template: `@Cache for {{entity}} {
  strategy: {{strategy}}
  ttl: {{ttl}}
  invalidation: [{{invalidationEvents}}]
}`,
    params: ['entity', 'strategy', 'ttl', 'invalidationEvents'],
    desc: 'Stratégie de mise en cache',
    fileTypes: ['backend'],
    color: 'block-backend',
  },

  '@Queue': {
    icon: Box,
    category: 'backend',
    template: `@Queue {{name}} {
  type: {{queueType}}
  
  @Job {{jobName}} {
    handler: {{handler}}
    retry: {{retryCount}}
    delay: {{delay}}
  }
}`,
    params: ['name', 'queueType', 'jobName', 'handler', 'retryCount', 'delay'],
    desc: 'File de tâches asynchrones',
    fileTypes: ['backend'],
    color: 'block-backend',
  },

  '@Scheduler': {
    icon: Activity,
    category: 'backend',
    template: `@Scheduler {{name}} {
  cron: "{{cronExpression}}"
  action: {{action}}
  timezone: {{timezone}}
}`,
    params: ['name', 'cronExpression', 'action', 'timezone'],
    desc: 'Tâche planifiée récurrente',
    fileTypes: ['backend'],
    color: 'block-backend',
  },

  // ================================================================
  // INTEGRATION BLOCKS
  // ================================================================

  '@Integration': {
    icon: Puzzle,
    category: 'integration',
    template: `@Integration {{serviceName}} {
  provider: {{provider}}
  
  @Auth {
    type: {{authType}}
    credentials: env.{{envVar}}
  }
  
  @Endpoints {
    {{endpoints}}
  }
}`,
    params: ['serviceName', 'provider', 'authType', 'envVar', 'endpoints'],
    desc: 'Intégration service externe (Stripe, AWS...)',
    fileTypes: ['backend'],
    color: 'block-integration',
  },

  '@Webhook': {
    icon: Zap,
    category: 'integration',
    template: `@Webhook {{name}} {
  url: {{url}}
  events: [{{events}}]
  
  @Validation {
    signature: {{signatureHeader}}
    secret: env.{{secretEnv}}
  }
}`,
    params: ['name', 'url', 'events', 'signatureHeader', 'secretEnv'],
    desc: 'Réception d\'événements externes',
    fileTypes: ['backend'],
    color: 'block-integration',
  },

  '@Notification': {
    icon: Bell,
    category: 'integration',
    template: `@Notification {{name}} {
  channels: [{{channels}}]
  
  @Template {{templateName}} {
    subject: "{{subject}}"
    body: "{{body}}"
  }
  
  trigger: {{triggerEvent}}
}`,
    params: ['name', 'channels', 'templateName', 'subject', 'body', 'triggerEvent'],
    desc: 'Système de notifications multi-canal',
    fileTypes: ['backend'],
    color: 'block-integration',
  },

  // ================================================================
  // FRONTEND BLOCKS
  // ================================================================

  '@Page': {
    icon: Globe,
    category: 'frontend',
    template: `@Page {{name}} {
  path: "{{path}}"
  layout: {{layout}}
  
  @Meta {
    title: "{{title}}"
    description: "{{description}}"
  }
  
  @Components {
    {{components}}
  }
}`,
    params: ['name', 'path', 'layout', 'title', 'description', 'components'],
    desc: 'Page web complète avec métadonnées SEO',
    fileTypes: ['frontend'],
    color: 'block-frontend',
  },

  '@Component': {
    icon: Component,
    category: 'frontend',
    template: `@Component {{name}} {
  @Props {
    {{props}}
  }
  
  @State {
    {{state}}
  }
  
  @Render {
    {{renderCode}}
  }
}`,
    params: ['name', 'props', 'state', 'renderCode'],
    desc: 'Composant React réutilisable',
    fileTypes: ['frontend'],
    color: 'block-frontend',
  },

  '@Layout': {
    icon: Layout,
    category: 'frontend',
    template: `@Layout {{name}} {
  @Sections {
    header: {{headerComponent}}
    sidebar: {{sidebarComponent}}
    main: {{mainSlot}}
    footer: {{footerComponent}}
  }
  
  @Responsive {
    breakpoints: {{breakpoints}}
  }
}`,
    params: ['name', 'headerComponent', 'sidebarComponent', 'mainSlot', 'footerComponent', 'breakpoints'],
    desc: 'Layout avec sections configurables',
    fileTypes: ['frontend'],
    color: 'block-frontend',
  },

  '@Form': {
    icon: FormInput,
    category: 'frontend',
    template: `@Form {{name}} {
  @Fields {
    {{fields}}
  }
  
  @Validation {
    schema: {{validationSchema}}
  }
  
  @Submit {
    action: {{submitAction}}
    onSuccess: {{onSuccess}}
    onError: {{onError}}
  }
}`,
    params: ['name', 'fields', 'validationSchema', 'submitAction', 'onSuccess', 'onError'],
    desc: 'Formulaire avec validation intégrée',
    fileTypes: ['frontend'],
    color: 'block-frontend',
  },

  '@Hook': {
    icon: Code,
    category: 'frontend',
    template: `@Hook {{name}} {
  @Params {
    {{params}}
  }
  
  @Returns {
    {{returns}}
  }
  
  @Dependencies {
    {{dependencies}}
  }
}`,
    params: ['name', 'params', 'returns', 'dependencies'],
    desc: 'Hook React personnalisé',
    fileTypes: ['frontend'],
    color: 'block-frontend',
  },

  '@Store': {
    icon: Database,
    category: 'frontend',
    template: `@Store {{name}} {
  @State {
    {{state}}
  }
  
  @Actions {
    {{actions}}
  }
  
  @Selectors {
    {{selectors}}
  }
  
  persist: {{persist}}
}`,
    params: ['name', 'state', 'actions', 'selectors', 'persist'],
    desc: 'Store Zustand pour gestion d\'état',
    fileTypes: ['frontend'],
    color: 'block-frontend',
  },

  '@Theme': {
    icon: Palette,
    category: 'frontend',
    template: `@Theme {{name}} {
  @Colors {
    {{colors}}
  }
  
  @Typography {
    {{typography}}
  }
  
  @Spacing {
    {{spacing}}
  }
  
  @Components {
    {{componentStyles}}
  }
}`,
    params: ['name', 'colors', 'typography', 'spacing', 'componentStyles'],
    desc: 'Thème et design system',
    fileTypes: ['frontend'],
    color: 'block-frontend',
  },

  // ================================================================
  // TESTING BLOCKS
  // ================================================================

  '@TestSuite': {
    icon: TestTube,
    category: 'testing',
    template: `@TestSuite {{name}} for {{target}} {
  @Unit {
    coverage: {{coverage}}
    cases: [{{unitCases}}]
  }
  
  @Integration {
    cases: [{{integrationCases}}]
  }
  
  @E2E {
    flows: [{{e2eFlows}}]
    browser: {{browser}}
  }
}`,
    params: ['name', 'target', 'coverage', 'unitCases', 'integrationCases', 'e2eFlows', 'browser'],
    desc: 'Suite de tests complète',
    fileTypes: ['backend', 'frontend'],
    color: 'block-testing',
  },

  '@Mock': {
    icon: Box,
    category: 'testing',
    template: `@Mock {{name}} for {{service}} {
  @Responses {
    {{mockedResponses}}
  }
  
  @Delay {{delay}}
}`,
    params: ['name', 'service', 'mockedResponses', 'delay'],
    desc: 'Données mockées pour tests',
    fileTypes: ['backend', 'frontend'],
    color: 'block-testing',
  },

  // ================================================================
  // INFRASTRUCTURE BLOCKS
  // ================================================================

  '@Deploy': {
    icon: Cloud,
    category: 'infrastructure',
    template: `@Deploy target:{{target}} {
  region: {{region}}
  
  @Services {
    {{services}}
  }
  
  @Scaling {
    min: {{minInstances}}
    max: {{maxInstances}}
    trigger: {{scalingTrigger}}
  }
  
  env: {{environment}}
}`,
    params: ['target', 'region', 'services', 'minInstances', 'maxInstances', 'scalingTrigger', 'environment'],
    desc: 'Configuration de déploiement cloud',
    fileTypes: ['backend'],
    color: 'block-infra',
  },

  '@Monitoring': {
    icon: Activity,
    category: 'infrastructure',
    template: `@Monitoring {
  @Metrics {
    {{metrics}}
  }
  
  @Alerts {
    {{alerts}}
  }
  
  @Dashboard {
    provider: {{provider}}
    panels: [{{panels}}]
  }
}`,
    params: ['metrics', 'alerts', 'provider', 'panels'],
    desc: 'Surveillance et alerting production',
    fileTypes: ['backend'],
    color: 'block-infra',
  },

  '@Security': {
    icon: Lock,
    category: 'infrastructure',
    template: `@Security {
  @Authentication {
    type: {{authType}}
    provider: {{provider}}
  }
  
  @Authorization {
    model: {{authzModel}}
    policies: [{{policies}}]
  }
  
  @Encryption {
    at_rest: {{atRest}}
    in_transit: {{inTransit}}
  }
}`,
    params: ['authType', 'provider', 'authzModel', 'policies', 'atRest', 'inTransit'],
    desc: 'Configuration sécurité globale',
    fileTypes: ['backend'],
    color: 'block-infra',
  },

  // ================================================================
  // DIRECTIVE BLOCKS (Common to all files)
  // ================================================================

  '@Import': {
    icon: FolderOpen,
    category: 'directives',
    template: '@Import "{{file}}"',
    params: ['file'],
    desc: 'Importer fichier .tp externe',
    fileTypes: ['database', 'backend', 'frontend'],
    color: 'block-directive',
  },

  '@AutoGen': {
    icon: Play,
    category: 'directives',
    template: `@AutoGen target:{{target}} lang:{{language}} framework:{{framework}} {
  models: [{{models}}]
  
  orm: {{orm}}
  database: {{database}}
  
  options: {
    migrations: {{migrations}}
    seeding: {{seeding}}
    soft_delete: {{softDelete}}
  }
}`,
    params: ['target', 'language', 'framework', 'models', 'orm', 'database', 'migrations', 'seeding', 'softDelete'],
    desc: 'Génération automatique de code',
    fileTypes: ['database', 'backend', 'frontend'],
    color: 'block-directive',
  },

  '@Macro': {
    icon: Terminal,
    category: 'directives',
    template: '@Macro {{macroType}} for {{target}}',
    params: ['macroType', 'target'],
    desc: 'Macro de génération (CRUD, Validation...)',
    fileTypes: ['database', 'backend'],
    color: 'block-directive',
  },

  '@Template': {
    icon: Package,
    category: 'directives',
    template: `@Template {{name}} extends {{baseTemplate}} {
  @Params {
    {{params}}
  }
  
  @Generate {
    {{generateRules}}
  }
}`,
    params: ['name', 'baseTemplate', 'params', 'generateRules'],
    desc: 'Template réutilisable',
    fileTypes: ['database', 'backend', 'frontend'],
    color: 'block-directive',
  },
};

// Category metadata for UI
export const BLOCK_CATEGORIES: Record<BlockCategory, { label: string; icon: any; color: string }> = {
  data: { label: 'Data & Structure', icon: Database, color: 'block-data' },
  backend: { label: 'Backend', icon: Server, color: 'block-backend' },
  frontend: { label: 'Frontend', icon: Globe, color: 'block-frontend' },
  architecture: { label: 'Architecture', icon: Layers, color: 'block-architecture' },
  integration: { label: 'Intégrations', icon: Puzzle, color: 'block-integration' },
  business: { label: 'Business Logic', icon: Shield, color: 'block-business' },
  testing: { label: 'Testing', icon: TestTube, color: 'block-testing' },
  infrastructure: { label: 'Infrastructure', icon: Cloud, color: 'block-infra' },
  directives: { label: 'Directives', icon: Settings, color: 'block-directive' },
};

// File type metadata
export const FILE_TYPES = {
  database: { label: 'Data & Structure', icon: Database, extension: 'database.tp', color: 'block-data' },
  backend: { label: 'Backend', icon: Server, extension: 'generate_backend.tp', color: 'block-backend' },
  frontend: { label: 'Frontend', icon: Globe, extension: 'generate_frontend.tp', color: 'block-frontend' },
};

// Get blocks available for a specific file type
export function getBlocksForFileType(fileType: 'database' | 'backend' | 'frontend'): Record<string, TPBlock> {
  const filtered: Record<string, TPBlock> = {};
  
  Object.entries(TP_BLOCKS_LIBRARY).forEach(([key, block]) => {
    if (block.fileTypes.includes(fileType)) {
      filtered[key] = block;
    }
  });
  
  return filtered;
}

// Get blocks by category for a file type
export function getBlocksByCategory(fileType: 'database' | 'backend' | 'frontend'): Record<BlockCategory, Record<string, TPBlock>> {
  const blocks = getBlocksForFileType(fileType);
  const categorized: Record<BlockCategory, Record<string, TPBlock>> = {
    data: {},
    backend: {},
    frontend: {},
    architecture: {},
    integration: {},
    business: {},
    testing: {},
    infrastructure: {},
    directives: {},
  };
  
  Object.entries(blocks).forEach(([key, block]) => {
    categorized[block.category][key] = block;
  });
  
  return categorized;
}

// Generate code from blocks
export function generateTPCode(file: TPFile): string {
  let code = `// ================================================================\n`;
  code += `// ${file.name.toUpperCase()}\n`;
  code += `// Généré automatiquement par TP Editor\n`;
  code += `// Version 2.0 - ${new Date().toLocaleDateString('fr-FR')}\n`;
  code += `// ================================================================\n\n`;

  file.blocks.forEach((block) => {
    let blockCode = block.template;
    Object.entries(block.params).forEach(([param, value]) => {
      blockCode = blockCode.replace(new RegExp(`{{${param}}}`, 'g'), value || `/* ${param} */`);
    });
    code += blockCode + '\n\n';
  });

  return code;
}

// Create a new block instance
export function createBlockInstance(type: string, blockDef: TPBlock): BlockInstance {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    category: blockDef.category,
    template: blockDef.template,
    params: blockDef.params.reduce((acc, p) => ({ ...acc, [p]: '' }), {}),
    desc: blockDef.desc,
    icon: blockDef.icon,
    color: blockDef.color,
    collapsed: false,
  };
}

// Validate a file's blocks
export interface ValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function validateTPFile(file: TPFile): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check for empty required params
  file.blocks.forEach((block, idx) => {
    const emptyParams = Object.entries(block.params).filter(([_, value]) => !value.trim());
    if (emptyParams.length > 0) {
      emptyParams.forEach(([param]) => {
        warnings.push(`Bloc #${idx + 1} (${block.type}): Paramètre "${param}" vide`);
        score -= 3;
      });
    }
  });

  // Check for missing imports
  const hasImports = file.blocks.some(b => b.type === '@Import');
  if (!hasImports && file.blocks.length > 3) {
    suggestions.push('Considérez d\'ajouter des @Import pour une meilleure organisation');
  }

  // Check for missing tests
  const hasTests = file.blocks.some(b => b.type === '@TestSuite' || b.type === '@Mock');
  if (!hasTests && file.blocks.length > 5) {
    suggestions.push('Ajoutez @TestSuite pour garantir la qualité du code');
  }

  // Architecture suggestions
  if (file.type === 'backend') {
    const hasCache = file.blocks.some(b => b.type === '@Cache');
    if (!hasCache && file.blocks.length > 3) {
      suggestions.push('Optimisez avec @Cache pour les données fréquemment accédées');
    }

    const hasMonitoring = file.blocks.some(b => b.type === '@Monitoring');
    if (!hasMonitoring && file.blocks.length > 5) {
      suggestions.push('Ajoutez @Monitoring pour surveiller votre application en production');
    }
  }

  return {
    valid: errors.length === 0,
    score: Math.max(0, score),
    errors,
    warnings,
    suggestions,
  };
}
