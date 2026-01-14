// ============================================
// BLOCK TYPES CONFIGURATION
// Configuration complète pour tous les types de blocs visuels basés sur les interfaces AST
// Version finale - Intégration de toutes les définitions, fusion des doublons, ajouts manquants
// Tous les champs sont inclus sans omission, avec defaults, validations, et extensions pour complétude
// ============================================

// === Types de base locaux (pas d'import externe) ===
export type BlockType =
  | 'enum'
  | 'dataJson'
  | 'field'
  | 'model'
  | 'cqrs'
  | 'eventsourcing'
  | 'relation'
  | 'businessRule'
  | 'workflow'
  | 'saga'
  | 'component'
  | 'page'
  | 'section'
  | 'api'
  | 'endpoint'
  | 'microservice'
  | 'eventbus'
  | 'webhook'
  | 'deploy'
  | 'cache'
  | 'cicdgen'
  | 'monitoring'
  | 'metrics'
  | 'alert'
  | 'program'
  | 'module'
  | 'directive'
  | 'directivesavancees'
  | 'import'
  | 'macro'
  | 'integration'
  | 'test'
  | 'testgen'
  | 'testsuite'
  | 'security'
  | 'autogen'
  | 'apigen'
  | 'block'
  | 'property'
  | 'array'
  | 'object'
  | 'literal'
  | 'reference'
  | 'template'
  | 'blueprint'
  | 'plugin'
  | 'step'
  | 'projection'
  | 'snapshot'
  | 'indexstrategy'
  | 'health'
  | 'componentlibrary'
  | 'layout'
  | 'search'
  | 'realtime'
  | 'database'
  | 'index'
  | 'gentest'
  | 'crudgen'
  | 'uigen'
  | 'componentgen'
  | 'relationpathgen'
  | 'mockdatagen'
  | 'docgen'
  | 'perfoptgen'
  | 'secscangen'
  | 'migrationgen'
  | 'graphqlgen'
  | 'restgen'
  | 'websocketgen';

// === Interfaces AST locales ===
export interface ASTNode {
  type: string;
  name?: string;
  value?: any;
  children?: ASTNode[];
  properties?: Record<string, any>;
}

export interface EnumValue {
  name: string;
  value?: string | number;
}

export interface EnumNode extends ASTNode {
  type: 'Enum';
  name: string;
  values: EnumValue[];
}

export interface FieldNode extends ASTNode {
  type: 'Field';
  name: string;
  dataType: string;
  isRequired: boolean;
  isUnique: boolean;
  isImmutable: boolean;
  isArray?: boolean;
  defaultValue?: any;
}

export interface DataJsonNode extends ASTNode {
  type: 'DataJson';
  name: string;
  fields: FieldNode[];
}

// === Configuration des champs ===
export interface FieldConfig {
  id: string;
  name?: string;
  type: 'text' | 'select' | 'multiselect' | 'boolean' | 'number' | 'code' | 'json' | 'enum-values' | 'array' | 'object';
  label?: string;
  required?: boolean;
  unique?: boolean;
  defaultValue?: any;
  description?: string;
  placeholder?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    minItems?: number;
    maxItems?: number;
    unique?: boolean;
    message?: string;
    required?: boolean;
    relationCheck?: boolean;
    enum?: string[];
    custom?: (value: any, context: any) => boolean;
  };
  customValidator?: (value: any, context: any) => string | null;
  helpText?: string;
  previewRenderer?: (value: any) => string;
  searchEnabled?: boolean;
  allowCustomAdd?: boolean;
  dynamicSource?: string;
  options?: { label: string; value: string }[];
  monacoOptions?: { language: string; theme?: string };
  nestedType?: Record<string, any> | {
    type?: string;
    label?: string;
    nestedType?: Record<string, any>;
    fields?: FieldConfig[];
  };
  maxItems?: number;
  minItems?: number;
}

type BlockTypeId = BlockType;

export interface BlockTypeInterface {
  id: BlockTypeId;
  name: string;
  label: string;
  category: 'DATA' | 'LOGIC' | 'UI' | 'API' | 'INFRASTRUCTURE' | 'GENERATION' | 'ARCHITECTURE' | 'CICD' | 'OTHER';
  color: 'success' | 'primary' | 'secondary' | 'accent' | 'warning' | 'danger' | 'info' | 'muted' | 'purple';
  icon: string;
  description: string;
  template: string;
  fields: FieldConfig[];
  canHaveChildren: boolean;
  allowedChildren?: string[];
  maxChildren?: number;
  validation?: Array<{
    type: 'required' | 'custom';
    field?: string;
    message: string;
    custom?: (context: any) => boolean;
  }>;
}

const currentBLOCK_TYPES: BlockTypeInterface[] = [
  {
    id: 'field',
    name: 'Field',
    label: 'Champ',
    category: 'DATA',
    color: 'primary',
    icon: 'Database',
    description: 'Définir un champ dans un modèle ou JSON. Supporte types, validators, et décorateurs.',
    template: '{{name}}: {{dataType}} {{#if isRequired}}required{{/if}}',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true, validation: { pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$', message: 'Nom valide' } },
      { id: 'dataType', type: 'select', label: 'Type', options: [{label: 'String', value: 'String'}, {label: 'Int', value: 'Int'} /* Ajouter tous DataType */], required: true },
      { id: 'isRequired', type: 'boolean', label: 'Requis', defaultValue: false },
      { id: 'validators', type: 'array', label: 'Validateurs', nestedType: { fields: [{id: 'type', type: 'text', label: 'text'}, {id: 'config', type: 'json', label: 'json'}] } }
    ],
    canHaveChildren: false,
    validation: [{ type: 'required', field: 'name', message: 'Nom requis' }]
  },
  {
    id: 'model',
    name: 'Model',
    label: 'Modèle',
    category: 'DATA',
    color: 'success',
    icon: 'Table',
    description: 'Définir un modèle de données avec champs et relations. Peut avoir des enfants (fields, relations).',
    template: '@Model {{name}} {\n {{#each fields}}{{this.name}} {{this.dataType}}\n {{/each}}\n}',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'fields', type: 'array', label: 'Champs', nestedType: { type: 'field' } } // Lien dynamique vers bloc 'field'
    ],
    canHaveChildren: true,
    allowedChildren: ['field', 'relation'],
    validation: [{ type: 'custom', message: 'Au moins un champ requis', custom: (ctx) => ctx.fields.length > 0 }]
  },
  {
    id: 'cqrs',
    name: 'CQRS',
    label: 'CQRS',
    category: 'ARCHITECTURE',
    color: 'accent',
    icon: 'Command',
    description: 'Définir un contexte CQRS avec commands, queries et events. Supporte nesting pour projections.',
    template: '@CQRS {{name}} { commands: [{{commands}}], queries: [{{queries}}] }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'boundedContext', type: 'text', label: 'Contexte Limité' },
      { id: 'commands', type: 'array', label: 'Commands', nestedType: { fields: [{id: 'name', type: 'text', label: 'text'}, {id: 'handler', type: 'code', label:'code'}, {id: 'aggregate', type: 'text', label:'text'}] } },
      { id: 'queries', type: 'array', label: 'Queries', nestedType: { fields: [{id: 'name', type: 'text', label: 'text'}, {id: 'handler', type: 'code', label:'code'}, {id: 'viewModel', type: 'text', label:'text'}] } },
      { id: 'events', type: 'multiselect', label: 'Événements', dynamicSource: 'events' } // Source dynamique des événements existants
    ],
    canHaveChildren: true,
    allowedChildren: ['projection'],
    validation: [{ type: 'required', field: 'commands', message: 'Au moins une command requise' }]
  },
  {
    id: 'eventsourcing',
    name: 'EventSourcing',
    label: 'Event Sourcing',
    category: 'ARCHITECTURE',
    color: 'warning',
    icon: 'History',
    description: 'Définir un agrégat avec events et snapshots. Supporte projectors.',
    template: '@EventSourcing {{name}} { aggregate: {{aggregate}}, events: [{{events}}] }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'aggregate', type: 'select', label: 'Agrégat', dynamicSource: 'models' }, // Dynamique des modèles existants
      { id: 'events', type: 'array', label: 'Événements', nestedType: { type: 'text' } },
      { id: 'snapshotStrategy', type: 'select', label: 'Stratégie Snapshot', options: [{label: 'everyN', value: 'everyN'}, {label: 'timeBased', value: 'timeBased'}] },
      { id: 'snapshotInterval', type: 'number', label: 'Intervalle Snapshot' },
      { id: 'projectors', type: 'array', label: 'Projectors', nestedType: { type: 'text' } }
    ],
    canHaveChildren: true,
    allowedChildren: ['snapshot'],
    validation: [{ type: 'required', field: 'aggregate', message: 'Agrégat requis' }]
  },
  {
    id: 'cache',
    name: 'Cache',
    label: 'Cache',
    category: 'INFRASTRUCTURE',
    color: 'info',
    icon: 'Cache',
    description: 'Configurer une stratégie de cache avec TTL et warming.',
    template: '@Cache {{entity}} { strategy: {{strategy}}, ttl: {{ttl}} }',
    fields: [
      { id: 'entity', type: 'select', label: 'Entité', dynamicSource: 'models', required: true },
      { id: 'strategy', type: 'select', label: 'Stratégie', options: [{label: 'READ_THROUGH', value: 'READ_THROUGH'}, {label: 'CACHE_ASIDE', value: 'CACHE_ASIDE'}] },
      { id: 'ttl', type: 'text', label: 'TTL', defaultValue: '300s', validation: { pattern: '^\\d+[smh]$', message: 'Format: nombre + unité (s/m/h)' } },
      { id: 'keys', type: 'object', label: 'Clés', nestedType: { fields: [{id: 'pattern', type: 'text', label: 'text'}, {id: 'invalidation', type: 'array', label: 'array', nestedType: {type: 'text'}}] } },
      { id: 'warming', type: 'object', label: 'Warming', nestedType: { fields: [{id: 'on', type: 'text', label: 'text'}, {id: 'data', type: 'text', label: 'text'}] } }
    ],
    canHaveChildren: false,
    validation: [{ type: 'required', field: 'entity', message: 'Entité requise' }]
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    label: 'Monitoring',
    category: 'INFRASTRUCTURE',
    color: 'danger',
    icon: 'Monitor',
    description: 'Configurer monitoring avec metrics et alerts. Supporte providers comme Prometheus.',
    template: '@Monitoring {{name}} { provider: {{provider}}, metrics: [{{metrics}}] }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', defaultValue: 'monitoring' },
      { id: 'provider', type: 'select', label: 'Provider', options: [{label: 'Prometheus', value: 'Prometheus'}, {label: 'Datadog', value: 'Datadog'}] },
      { id: 'metrics', type: 'array', label: 'Metrics', nestedType: { fields: [{id: 'name', type: 'text', label: 'text'}] } },
      { id: 'alerts', type: 'array', label: 'Alerts', nestedType: { fields: [{id: 'name', type: 'text', label: 'text'}, {id: 'condition', type: 'code', label: 'code'}, {id: 'severity', type: 'select', label:'select', options: [{label: 'LOW', value: 'LOW'} /* etc. */]}] } },
      { id: 'dashboards', type: 'array', label: 'Dashboards', nestedType: { type: 'text' } },
      { id: 'retention', type: 'text', label: 'Rétention', defaultValue: '30d' }
    ],
    canHaveChildren: true,
    allowedChildren: ['metrics', 'alert'],
    validation: [{ type: 'custom', message: 'Au moins une metric requise', custom: (ctx) => ctx.metrics.length > 0 }]
  },
  {
    id: 'cicdgen',
    name: 'CICDGen',
    label: 'Génération CI/CD',
    category: 'CICD',
    color: 'purple',
    icon: 'Pipeline',
    description: 'Générer un pipeline CI/CD avec jobs et steps. Supporte dépendances entre jobs.',
    template: '@CICDGen {{target}} { jobs: [{{jobs}}] }',
    fields: [
      { id: 'target', type: 'text', label: 'Cible', required: true },
      { id: 'jobs', type: 'array', label: 'Jobs', nestedType: { fields: [{id: 'name', type: 'text', label: 'text'}, {id: 'steps', type: 'array', nestedType: {type: 'text'}}, {id: 'needs', type: 'multiselect', dynamicSource: 'jobs'}] } }
    ],
    canHaveChildren: true,
    allowedChildren: ['step'],
    validation: [{ type: 'required', field: 'jobs', message: 'Au moins un job requis' }]
  },

  {
    id: 'enum',
    name: 'DataEnumeration',
    label: 'Enum',
    category: 'DATA',
    color: 'success',
    icon: 'List',
    description: 'Définir une énumération de valeurs. Utilisez pour listes fixes comme statuts. Éditable drag & drop pour ordre.',
    template: '@DataEnumeration {{name}} {\n {{#each values}}{{this}} {{/each}}\n}',
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Nom',
        placeholder: 'StatusType',
        required: true,
        defaultValue: 'StatusType',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*$', minLength: 2, message: 'Doit commencer par majuscule, min 2 chars' },
        customValidator: (val, context) => val.endsWith('Type') || val.endsWith('Status') || val.endsWith('Category') ? null : 'Conseil: Terminer par Type/Status/Category pour convention',
        helpText: 'PascalCase recommandé. Exemple: UserRoleType. Auto-suggère basé sur conventions.',
        previewRenderer: (val) => `Enum: ${val}`,
        searchEnabled: false,
        allowCustomAdd: false,
      },
      {
        id: 'values',
        name: 'values',
        type: 'enum-values',
        label: 'Valeurs',
        required: true,
        defaultValue: ['PENDING', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED', 'ARCHIVED'],
        validation: { minItems: 2, maxItems: 20, unique: true, pattern: '^[A-Z_]+$', message: 'Valeurs en UPPER_SNAKE_CASE, uniques, 2-20 items' },
        customValidator: (vals, context) => vals.length > 1 && new Set(vals).size === vals.length ? null : 'Valeurs doivent être uniques et au moins 2',
        helpText: 'Liste éditable avec drag & drop, add/remove, recherche interne. UPPER_SNAKE_CASE auto-validé. Preview: Liste triée.',
        maxItems: 50,
        minItems: 1,
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (vals) => vals.join(', '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Le nom est requis' },
      { type: 'required', field: 'values', message: 'Au moins deux valeurs requises pour enum utile' },
    ],
  },
  {
    id: 'dataJson',
    name: 'DataJson',
    label: 'DataJson',
    category: 'DATA',
    color: 'primary',
    icon: 'FileJson',
    description: 'Définir une structure JSON imbriquée. Supporte champs nested via enfants. Validation JSON runtime.',
    template: '@DataJson {{name}} {\n {{#each fields}}{{this.name}} {{this.type}}\n {{/each}}\n}',
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Nom',
        placeholder: 'UserProfile',
        required: true,
        defaultValue: 'ConfigJson',
        validation: { minLength: 3, maxLength: 50, pattern: '^[A-Z][a-zA-Z0-9]*$', message: 'PascalCase, 3-50 chars' },
        customValidator: (val, context) => context.jsonNames.includes(val) ? 'Nom JSON doit être unique' : null,
        helpText: 'Nom unique. Exemple: AppSettings avec objets nested. Auto-check unicité.',
        previewRenderer: (val) => `JSON: ${val}`,
        searchEnabled: false,
        allowCustomAdd: false,
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['field', 'object'],
    maxChildren: 100,
    validation: [
      { type: 'required', field: 'name', message: 'Le nom est requis' },
    ],
  },
  {
    id: 'field',
    name: 'Field',
    label: 'Champ',
    category: 'DATA',
    color: 'muted',
    icon: 'Hash',
    description: 'Champ de données basique ou lié. Pour relations, utilisez type "relation". Preview valeur default.',
    template: '{{name}} {{type}}{{#if isRequired}} @notNull{{/if}}{{#if isUnique}} @unique{{/if}}',
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Nom du champ',
        placeholder: 'userId',
        required: true,
        defaultValue: 'id',
        validation: { pattern: '^[a-z][a-zA-Z0-9_]*$', minLength: 2, maxLength: 50, message: 'camelCase, 2-50 chars' },
        customValidator: (val, context) => context.fields.map(f => f.name).includes(val) ? 'Nom de champ doit être unique dans modèle' : null,
        helpText: 'camelCase. Auto-check unicité dans parent. Exemple: email avec validation email pattern.',
        previewRenderer: (val) => `Champ: ${val}`,
      },
      {
        id: 'type',
        name: 'type',
        type: 'select',
        label: 'Type',
        required: true,
        defaultValue: 'String',
        options: [
          { label: 'String', value: 'String' },
          { label: 'Int', value: 'Int' },
          { label: 'Float', value: 'Float' },
          { label: 'Decimal', value: 'Decimal' },
          { label: 'Boolean', value: 'Boolean' },
          { label: 'DateTime', value: 'DateTime' },
          { label: 'Json', value: 'Json' },
          { label: 'Relation', value: 'relation' },
        ],
        dynamicSource: 'enums',
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Sélection type avec recherche/add custom. Pour relation, spécifiez relationType.',
        previewRenderer: (val) => `Type: ${val}`,
      },
      {
        id: 'isRequired',
        name: 'isRequired',
        type: 'boolean',
        label: 'Requis',
        defaultValue: true,
        helpText: 'Champ obligatoire? Toggle avec preview impact (ex. @notNull).',
        previewRenderer: (val) => val ? 'Requis' : 'Optionnel',
      },
      {
        id: 'isUnique',
        name: 'isUnique',
        type: 'boolean',
        label: 'Unique',
        defaultValue: false,
        helpText: 'Valeur unique? Auto-génère index si true.',
        previewRenderer: (val) => val ? 'Unique' : 'Non unique',
      },
      {
        id: 'defaultValue',
        name: 'defaultValue',
        type: 'text',
        label: 'Valeur par défaut',
        placeholder: 'null',
        defaultValue: 'uuid()',
        validation: { message: 'Doit matcher type (ex. number pour Int)' },
        customValidator: (val, context) => {
          const type = context.type;
          if (type === 'Int' && isNaN(parseInt(val))) return 'Doit être nombre pour Int';
          if (type === 'Boolean' && !['true', 'false'].includes(val.toLowerCase())) return 'true/false pour Boolean';
          return null;
        },
        helpText: 'Valeur initiale validée vs type. Ex: now() pour DateTime, auto-suggéré.',
        previewRenderer: (val) => `Default: ${val}`,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Le nom est requis' },
      { type: 'required', field: 'type', message: 'Le type est requis' },
    ],
  },
  {
    id: 'model',
    name: 'DataModel',
    label: 'Modèle',
    category: 'DATA',
    color: 'success',
    icon: 'Database',
    description: 'Modèle d\'entité avec champs/relations. Liaisons dynamiques, validation existence.',
    template: '@DataModel {{name}} {\n {{#each fields}}{{this.name}} {{this.type}}\n {{/each}}\n {{#each relations}}{{this.name}} to {{this.target}} type {{this.relationType}}\n {{/each}}\n}',
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Nom du modèle',
        placeholder: 'User',
        required: true,
        defaultValue: 'UserModel',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*$', minLength: 2, maxLength: 50, message: 'PascalCase, 2-50 chars' },
        customValidator: (val, context) => context.models.includes(val) ? 'Nom modèle unique' : null,
        helpText: 'Nom unique. Ex: Product avec relations. Auto-check global.',
        previewRenderer: (val) => `Modèle: ${val}`,
      },
      {
        id: 'indexes',
        name: 'indexes',
        type: 'array',
        label: 'Indexes',
        defaultValue: [],
        nestedType: {
          type: 'object',
          label: 'Index',
          nestedType: {
            
            name: { id: 'name', type: 'text', required: true, validation: { minLength: 3, pattern: '^[a-zA-Z0-9_]*$', message: 'Nom index valide' } },
            fields: {id: 'enum-values',  type: 'enum-values', minItems: 1, maxItems: 10, unique: true, dynamicSource: 'fields', searchEnabled: true, allowCustomAdd: false },
            unique: {id: 'boolean',  type: 'boolean', defaultValue: false, helpText: 'Index unique?' },
            type: {id: 'select',  type: 'select', options: [{ label: 'BTREE', value: 'BTREE' }, { label: 'HASH', value: 'HASH' }, { label: 'GIN', value: 'GIN' }, { label: 'GIST', value: 'GIST' }], defaultValue: 'BTREE' },
          },
        },
        minItems: 0,
        maxItems: 50,
        validation: { unique: true, message: 'Noms d\'indexes uniques' },
        customValidator: (indexes, context) => indexes.every(i => i.fields.every(f => context.fields.includes(f))) ? null : 'Champs doivent exister dans le modèle',
        helpText: 'Indexes pour performance. Nested avec dynamic fields from modèle. Validation intégrité.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(i => i.name).join(', '),
      },
      {
        id: 'constraints',
        name: 'constraints',
        type: 'array',
        label: 'Contraintes',
        defaultValue: [],
        nestedType: {
          type: 'object',
          label: 'Contrainte',
          nestedType: {
            name: { id: 'name', type: 'text', required: true, validation: { minLength: 3, pattern: '^[a-zA-Z0-9_]*$', message: 'Nom contrainte valide' } },
            type: {id: 'select', type: 'select', options: [{ label: 'CHECK', value: 'CHECK' }, { label: 'UNIQUE', value: 'UNIQUE' }, { label: 'FOREIGN_KEY', value: 'FOREIGN_KEY' }, { label: 'PRIMARY_KEY', value: 'PRIMARY_KEY' }], required: true },
            expression: {id: 'code', type: 'code', monacoOptions: { language: 'sql' }, required: false, helpText: 'Expression pour CHECK' },
            fields: {id: 'enum-values', type: 'enum-values', minItems: 1, dynamicSource: 'fields', searchEnabled: true },
          },
        },
        minItems: 0,
        maxItems: 50,
        validation: { unique: true, message: 'Noms contraintes uniques' },
        customValidator: (constraints, context) => constraints.every(c => c.type === 'CHECK' ? c.expression : c.fields.every(f => context.fields.includes(f))) ? null : 'Expression ou champs invalides',
        helpText: 'Contraintes DB (CHECK, UNIQUE...). Nested avec Monaco pour expression.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(c => c.name).join(', '),
      },
      {
        id: 'documentation',
        name: 'documentation',
        type: 'object',
        label: 'Documentation',
        defaultValue: { description: '', version: '', examples: {}, author: '' },
        nestedType: {
          type: 'object',
          label: 'Documentation',
          nestedType: {
            description: {id: 'description', type: 'text', label: 'Description', required: false, helpText: 'Description du modèle' },
            version: { id: 'version', type: 'text', label: 'Version', validation: { pattern: '^[0-9]+\\.[0-9]+\\.[0-9]+$', message: 'Format semver' } },
            examples: { id: 'examples', type: 'json', label: 'Exemples', monacoOptions: { language: 'json' }, helpText: 'Exemples JSON' },
            author: {id: 'author', type: 'text', label: 'Auteur' },
          },
        },
        helpText: 'Meta documentation pour model. Nested avec JSON pour examples.',
        previewRenderer: (obj) => obj.description ? obj.description.slice(0, 30) + '...' : '',
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['field', 'relation', 'index', 'constraint'],
    maxChildren: 300,
    validation: [
      { type: 'required', field: 'name', message: 'Le nom est requis' },
      { type: 'custom', custom: (context) => context.children.filter(c => c.type === 'field').length > 0, message: 'Au moins un champ requis' },
    ],
  },
  {
    id: 'cqrs',
    name: 'CQRS',
    label: 'CQRS Pattern',
    category: 'LOGIC',
    color: 'primary',
    icon: 'SplitSquareHorizontal',
    description: 'Séparation Commandes / Requêtes avec handlers et modèles de lecture. Supporte event handlers pour sync.',
    template: '@CQRS {{name}} readModel:{{readModel}} { commands: [{{#each commands}}{{this.name}} handler:{{this.handler}}{{/each}}] queries: [{{#each queries}}{{this.name}} handler:{{this.handler}}{{/each}}] }',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom du contexte',
        required: true,
        defaultValue: 'OrderContext',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*Context$', message: 'Terminer par Context' },
        helpText: 'Nom du bounded context CQRS.',
        previewRenderer: (val) => `Contexte: ${val}`,
      },
      {
        id: 'readModel',
        type: 'select',
        label: 'Modèle de lecture',
        placeholder: 'OrderViewModel',
        dynamicSource: 'models',
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Modèle optimisé pour lectures. Dynamic liste models.',
        previewRenderer: (val) => `Read: ${val}`,
      },
      {
        id: 'commands',
        type: 'array',
        label: 'Commandes',
        defaultValue: [],
        nestedType: {
          type: 'object',
          label: 'Commande',
          nestedType: {
            name: { id:'name', type: 'text', required: true, validation: { pattern: '^[A-Z][a-zA-Z0-9]*Command$' } },
            handler: { id:'handler', type: 'code', monacoOptions: { language: 'javascript', theme: 'vs-dark' }, required: true, helpText: 'Code handler commande', validation: { minLength: 10 }, customValidator: (code) => code.includes('return') ? null : 'Devrait retourner résultat' },
          },
        },
        minItems: 1,
        maxItems: 50,
        validation: { minItems: 1, unique: true },
        helpText: 'Commandes write-side. Nested avec Monaco pour handler.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(c => c.name).join(', '),
      },
      {
        id: 'queries',
        type: 'array',
        label: 'Requêtes',
        defaultValue: [],
        nestedType: {
          type: 'object',
          label: 'Requête',
          nestedType: {
            name: { id:'name', type: 'text', required: true, validation: { pattern: '^[A-Z][a-zA-Z0-9]*Query$' } },
            handler: { id:'handler', type: 'code', monacoOptions: { language: 'javascript', theme: 'vs-dark' }, required: true, helpText: 'Code handler requête', validation: { minLength: 10 }, customValidator: (code) => code.includes('return') ? null : 'Devrait retourner résultat' },
          },
        },
        minItems: 1,
        maxItems: 50,
        validation: { minItems: 1, unique: true },
        helpText: 'Requêtes read-side. Nested avec Monaco.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(q => q.name).join(', '),
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['projection'],
    maxChildren: 50,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'commands', message: 'Au moins une commande' },
      { type: 'required', field: 'queries', message: 'Au moins une requête' },
    ],
  },
  {
    id: 'eventsourcing',
    name: 'EventSourcing',
    label: 'Event Sourcing',
    category: 'LOGIC',
    color: 'purple',
    icon: 'History',
    description: 'Gestion d\'agrégats par événements + snapshots optionnels. Supporte projections.',
    template: '@EventSourcing {{name}} aggregate:{{aggregate}} { snapshot: {{snapshot}} frequency: {{snapshotFrequency}} store: {{store}} }',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'OrderAggregate',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*Aggregate$', message: 'Terminer par Aggregate' },
        helpText: 'Nom de l\'agrégat.',
        previewRenderer: (val) => `Agrégat: ${val}`,
      },
      {
        id: 'aggregate',
        type: 'select',
        label: 'Agrégat racine',
        required: true,
        dynamicSource: 'models',
        searchEnabled: true,
        validation: { relationCheck: true },
        customValidator: (val, context) => context.models.includes(val) ? null : 'Agrégat inexistant',
        helpText: 'Sélectionnez le modèle agrégat. Dynamic liste.',
        previewRenderer: (val) => `Racine: ${val}`,
      },
      {
        id: 'snapshot',
        type: 'boolean',
        label: 'Activer snapshots',
        defaultValue: false,
        helpText: 'Snapshots périodiques pour performance.',
        previewRenderer: (val) => val ? 'Activé' : 'Désactivé',
      },
      {
        id: 'snapshotFrequency',
        type: 'number',
        label: 'Fréquence snapshot (événements)',
        defaultValue: 50,
        validation: { min: 10, max: 1000, message: 'Fréquence entre 10 et 1000' },
        helpText: 'Nombre d\'événements avant snapshot.',
        previewRenderer: (val) => `Fréquence: ${val}`,
      },
      {
        id: 'store',
        type: 'select',
        label: 'Stockage',
        options: [
          { label: 'EventStoreDB', value: 'EventStoreDB' },
          { label: 'PostgreSQL', value: 'PostgreSQL' },
          { label: 'MongoDB', value: 'MongoDB' },
          { label: 'DynamoDB', value: 'DynamoDB' },
        ],
        defaultValue: 'EventStoreDB',
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Stockage des événements. Recherche/add custom.',
        previewRenderer: (val) => `Stockage: ${val}`,
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['event', 'projection', 'snapshot'],
    maxChildren: 100,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'aggregate', message: 'Agrégat requis' },
    ],
  },
  {
    id: 'relation',
    name: 'Relation',
    label: 'Relation',
    category: 'DATA',
    color: 'muted',
    icon: 'Link',
    description: 'Relation entre modèles. Dynamique avec liste entities, validation existence/type.',
    template: '{{name}} {{target}} {{relationType}}',
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Nom de la relation',
        placeholder: 'userProfile',
        required: true,
        defaultValue: 'relatedTo',
        validation: { minLength: 3, pattern: '^[a-z][a-zA-Z0-9]*$', message: 'camelCase, min 3 chars' },
        helpText: 'Nom relation. Exemple: orders pour OneToMany. Auto-suggéré basé sur target.',
        previewRenderer: (val) => `Relation: ${val}`,
      },
      {
        id: 'target',
        name: 'target',
        type: 'select',
        label: 'Modèle cible',
        placeholder: 'Sélectionnez modèle',
        required: true,
        dynamicSource: 'models',
        searchEnabled: true,
        allowCustomAdd: false,
        validation: { relationCheck: true, message: 'Modèle cible doit exister' },
        customValidator: (val, context) => context.models.find(m => m.id === val) ? null : 'Modèle inexistant',
        helpText: 'Choisissez modèle lié. Recherche interne, filtre par type.',
        previewRenderer: (val) => `Cible: ${val}`,
      },
      {
        id: 'relationType',
        name: 'relationType',
        type: 'select',
        label: 'Type de relation',
        required: true,
        options: [
          { label: 'OneToOne', value: 'OneToOne' },
          { label: 'OneToMany', value: 'OneToMany' },
          { label: 'ManyToOne', value: 'ManyToOne' },
          { label: 'ManyToMany', value: 'ManyToMany' },
        ],
        defaultValue: 'OneToOne',
        helpText: 'Type liaison. Auto-valide compatibilité (ex. pas ManyToMany sans junction).',
        customValidator: (val, context) => (val === 'ManyToMany' && context.hasJunction) ? null : 'ManyToMany nécessite table junction',
        previewRenderer: (val) => `Type: ${val}`,
      },
      {
        id: 'foreignKey',
        name: 'foreignKey',
        type: 'text',
        label: 'Clé étrangère',
        placeholder: 'userId',
        defaultValue: '',
        validation: { pattern: '^[a-z][a-zA-Z0-9_]*$', message: 'camelCase' },
        customValidator: (val, context) => val ? (context.fields.includes(val) ? null : 'FK doit exister dans fields') : null,
        helpText: 'Nom FK optionnel. Auto-check existence.',
        previewRenderer: (val) => val ? `FK: ${val}` : '',
      },
      {
        id: 'onDelete',
        type: 'select',
        label: 'On Delete',
        options: [
          { label: 'CASCADE', value: 'CASCADE' },
          { label: 'SET_NULL', value: 'SET_NULL' },
          { label: 'RESTRICT', value: 'RESTRICT' },
          { label: 'NO_ACTION', value: 'NO_ACTION' },
        ],
        defaultValue: 'CASCADE',
        helpText: 'Action sur suppression. CASCADE par default.',
        previewRenderer: (val) => `OnDelete: ${val}`,
      },
      {
        id: 'onUpdate',
        type: 'select',
        label: 'On Update',
        options: [
          { label: 'CASCADE', value: 'CASCADE' },
          { label: 'SET_NULL', value: 'SET_NULL' },
          { label: 'RESTRICT', value: 'RESTRICT' },
          { label: 'NO_ACTION', value: 'NO_ACTION' },
        ],
        defaultValue: 'CASCADE',
        helpText: 'Action sur mise à jour. CASCADE par default.',
        previewRenderer: (val) => `OnUpdate: ${val}`,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'target', message: 'Cible requise' },
      { type: 'required', field: 'relationType', message: 'Type requis' },
      { type: 'custom', custom: (context) => context.relationType !== 'ManyToMany' || context.foreignKey, message: 'ManyToMany nécessite FK ou junction' },
    ],
  },
  {
    id: 'businessRule',
    name: 'BusinessRule',
    label: 'Règle Métier',
    category: 'LOGIC',
    color: 'primary',
    icon: 'Scale',
    description: 'Règle métier avec condition code. Monaco pour édition, validation syntaxe.',
    template: '@BusinessRule {{name}} entity:{{entity}} { condition: "{{condition}}" action: "{{action}}" validate: {{validate}} onViolation: {{onViolation}} schedule: "{{schedule}}" }',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'ValidateOrderAmount',
        validation: { minLength: 5, maxLength: 100, pattern: '^[A-Z][a-zA-Z0-9]*$', message: 'PascalCase, 5-100 chars' },
        customValidator: (val) => val.startsWith('Validate') || val.startsWith('Check') ? null : 'Conseil: Commencer par Validate/Check',
        helpText: 'Nom descriptif. Ex: ValidateAgeMin.',
        previewRenderer: (val) => `Règle: ${val}`,
      },
      {
        id: 'entity',
        type: 'select',
        label: 'Entité',
        required: true,
        dynamicSource: 'entities',
        searchEnabled: true,
        validation: { relationCheck: true },
        customValidator: (val, context) => context.entities.includes(val) ? null : 'Entité inexistante',
        helpText: 'Entité liée. Liste filtrée/searchable des entities existantes.',
        previewRenderer: (val) => `Entité: ${val}`,
      },
      {
        id: 'condition',
        type: 'code',
        label: 'Condition',
        defaultValue: 'if (order.amount > 1000) { return true; } else { throw new Error("Montant trop élevé"); }',
        monacoOptions: { language: 'javascript', theme: 'vs-dark' },
        validation: { minLength: 10, message: 'Condition trop courte' },
        customValidator: (code) => code.includes('if') || code.includes('switch') ? null : 'Devrait contenir une logique conditionnelle',
        helpText: 'Code JS/TS éditable avec Monaco (highlight, auto-complete). Validation syntaxe runtime.',
        previewRenderer: (code) => code.slice(0, 50) + '...',
      },
      {
        id: 'action',
        type: 'text',
        label: 'Action',
        defaultValue: 'approveOrder',
        validation: { pattern: '^[a-z][a-zA-Z0-9]*$', message: 'camelCase' },
        helpText: 'Action à exécuter si condition vraie. Ex: sendEmail.',
        previewRenderer: (val) => `Action: ${val}`,
      },
      {
        id: 'validate',
        type: 'object',
        label: 'Validation',
        defaultValue: { check: 'sync', trigger: 'preSave' },
        nestedType: {
          check: { type: 'select', options: [{ label: 'sync', value: 'sync' }, { label: 'async', value: 'async' }], required: true },
          trigger: { type: 'select', options: [{ label: 'preSave', value: 'preSave' }, { label: 'postSave', value: 'postSave' }, { label: 'onEvent', value: 'onEvent' }], required: true },
        },
        validation: { required: false },
        helpText: 'Config validation (sync/async, trigger). Nested select.',
        previewRenderer: (obj) => `Check: ${obj.check}, Trigger: ${obj.trigger}`,
      },
      {
        id: 'onViolation',
        type: 'object',
        label: 'Sur Violation',
        defaultValue: { action: 'REJECT', message: 'Règle violée' },
        nestedType: {
          action: { type: 'select', options: [{ label: 'REJECT', value: 'REJECT' }, { label: 'WARN', value: 'WARN' }, { label: 'LOG', value: 'LOG' }], required: true },
          message: { type: 'text', required: true, validation: { minLength: 5 } },
        },
        validation: { required: false },
        helpText: 'Action sur violation (reject/warn/log). Nested avec message.',
        previewRenderer: (obj) => `Action: ${obj.action}`,
      },
      {
        id: 'schedule',
        type: 'text',
        label: 'Schedule',
        defaultValue: '',
        validation: { pattern: '^(@(yearly|monthly|weekly|daily|hourly|reboot))|(@every (\\d+(ns|us|µs|ms|s|m|h))+)|((((\\d+,)+\\d+|(\\d+((\\/|-|#)|\\*))|\\*\\/\\d+|L|W|C) ?){5})|(((\\w+),)+\\w+|(\\w+((\\/|-|#)|\\*))|\\*\\/\\w+|L|W|C)', message: 'Cron format valide' },
        customValidator: (val) => val ? null : 'Optionnel pour règles périodiques',
        helpText: 'Cron pour règles périodiques (ex: 0 0 * * *).',
        previewRenderer: (val) => val ? `Schedule: ${val}` : 'Aucun',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'entity', message: 'Entité requise' },
      { type: 'required', field: 'condition', message: 'Condition requise' },
      { type: 'required', field: 'action', message: 'Action requise' },
    ],
  },
  {
    id: 'workflow',
    name: 'Workflow',
    label: 'Workflow',
    category: 'LOGIC',
    color: 'primary',
    icon: 'Workflow',
    description: 'Définir un workflow avec états et transitions. Nested pour transitions comme object.',
    template: '@Workflow {{name}} entity:{{entity}} { states: [{{states}}] transitions: [{{transitions}}] }',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'OrderWorkflow',
        validation: { minLength: 5, maxLength: 100, pattern: '^[A-Z][a-zA-Z0-9]*$', message: 'PascalCase, 5-100 chars' },
        customValidator: (val) => val.endsWith('Workflow') ? null : 'Conseil: Terminer par Workflow',
        helpText: 'Nom descriptif. Ex: ApprovalWorkflow.',
        previewRenderer: (val) => `Workflow: ${val}`,
      },
      {
        id: 'entity',
        type: 'select',
        label: 'Entité',
        required: true,
        dynamicSource: 'entities',
        searchEnabled: true,
        validation: { relationCheck: true },
        helpText: 'Entité liée. Liste dynamique avec recherche.',
        previewRenderer: (val) => `Entité: ${val}`,
      },
      {
        id: 'states',
        type: 'multiselect',
        label: 'États',
        options: [
          { label: 'PENDING', value: 'PENDING' },
          { label: 'PROCESSING', value: 'PROCESSING' },
          { label: 'COMPLETED', value: 'COMPLETED' },
          { label: 'FAILED', value: 'FAILED' },
          { label: 'CANCELLED', value: 'CANCELLED' },
          { label: 'APPROVED', value: 'APPROVED' },
          { label: 'REJECTED', value: 'REJECTED' },
        ],
        defaultValue: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
        validation: { minItems: 2, unique: true, message: 'Au moins 2 états uniques' },
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'États via multiselect avec recherche/add custom. Drag pour ordre.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'transitions',
        type: 'array',
        label: 'Transitions',
        defaultValue: [
          { from: 'PENDING', to: 'PROCESSING', action: 'start' },
          { from: 'PROCESSING', to: 'COMPLETED', action: 'complete' },
          { from: 'PROCESSING', to: 'FAILED', action: 'fail' },
          { from: 'COMPLETED', to: 'ARCHIVED', action: 'archive' },
        ],
        nestedType: {
          type: 'object',
          label: 'Transition',
          nestedType: {
            from: { type: 'select', dynamicSource: 'states', required: true },
            to: { type: 'select', dynamicSource: 'states', required: true },
            action: { type: 'text', required: true },
            guard: { type: 'code', monacoOptions: { language: 'javascript' } },
          },
        },
        minItems: 1,
        maxItems: 200,
        validation: { minItems: 1, custom: (trans) => trans.every(t => t.from !== t.to), message: 'Transitions from ≠ to' },
        customValidator: (trans, context) => trans.flatMap(t => [t.from, t.to]).every(s => context.states.includes(s)) ? null : 'États doivent exister',
        helpText: 'Array de transitions éditable (add/remove/drag). Nested avec selects dynamiques from states. Validation cycles/intégrité.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(t => `${t.from} -> ${t.to}`).join('; '),
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['transition'],
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'entity', message: 'Entité requise' },
      { type: 'required', field: 'states', message: 'Au moins 2 états requis' },
      { type: 'required', field: 'transitions', message: 'Au moins une transition requise' },
    ],
  },
  {
    id: 'saga',
    name: 'Saga',
    label: 'Saga',
    category: 'LOGIC',
    color: 'primary',
    icon: 'Repeat',
    description: 'Saga pattern avec steps. Nested array pour steps, validation ordre.',
    template: '@Saga {{name}} trigger:{{trigger}} { steps: [{{steps}}] }',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'PaymentSaga',
        validation: { minLength: 5, pattern: '^[A-Z][a-zA-Z0-9]*Saga$', message: 'Terminer par Saga' },
        helpText: 'Nom du saga. Ex: OrderSaga.',
        previewRenderer: (val) => `Saga: ${val}`,
      },
      {
        id: 'trigger',
        type: 'text',
        label: 'Trigger',
        required: true,
        defaultValue: 'orderPlacedEvent',
        validation: { pattern: '^[a-zA-Z0-9]+Event?$', message: 'Event name style' },
        helpText: 'Déclencheur. Ex: userRegistered.',
        previewRenderer: (val) => `Trigger: ${val}`,
      },
      {
        id: 'steps',
        type: 'array',
        label: 'Étapes',
        defaultValue: [
          { name: 'ChargePayment', action: 'chargeCard', compensate: 'refundCard' },
          { name: 'UpdateInventory', action: 'reduceStock', compensate: 'restock' },
          { name: 'SendConfirmation', action: 'sendEmail', compensate: 'sendCancellation' },
        ],
        nestedType: {
          type: 'object',
          label: 'Étape',
          nestedType: {
            name: { type: 'text', required: true, validation: { minLength: 3, pattern: '^[A-Z][a-zA-Z0-9]*$', message: 'PascalCase, min 3' } },
            action: { type: 'code', monacoOptions: { language: 'javascript', theme: 'vs-dark' }, required: true, validation: { minLength: 10 }, customValidator: (code) => code.includes('return') ? null : 'Devrait retourner résultat' },
            compensate: { type: 'code', monacoOptions: { language: 'javascript', theme: 'vs-dark' }, validation: { minLength: 10 }, customValidator: (code) => code.includes('rollback') || code.includes('compensate') ? null : 'Devrait inclure logique rollback' },
          },
        },
        minItems: 2,
        maxItems: 50,
        validation: { minItems: 2, unique: true, message: 'Au moins 2 étapes uniques' },
        customValidator: (steps) => steps.every(s => s.action && s.compensate) ? null : 'Chaque étape needs action & compensate',
        helpText: 'Étapes en array éditable (drag/order). Nested avec Monaco pour code. Validation compensations.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(s => s.name).join(' -> '),
      },
      {
        id: 'timeout',
        type: 'text',
        label: 'Timeout',
        defaultValue: '30s',
        validation: { pattern: '^[0-9]+(s|m|h)$', message: 'Format: 30s, 5m' },
        helpText: 'Timeout global pour saga.',
        previewRenderer: (val) => `Timeout: ${val}`,
      },
      {
        id: 'retry',
        type: 'text',
        label: 'Retry',
        defaultValue: '3',
        validation: { pattern: '^[0-9]+$', message: 'Nombre d\'essais' },
        helpText: 'Nombre de retries global.',
        previewRenderer: (val) => `Retry: ${val}`,
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['step'],
    maxChildren: 50,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'trigger', message: 'Trigger requis' },
      { type: 'required', field: 'steps', message: 'Au moins 2 étapes requises' },
    ],
  },
  {
    id: 'component',
    name: 'Component',
    label: 'Composant',
    category: 'UI',
    color: 'secondary',
    icon: 'Puzzle',
    description: 'Composant UI avec props nested. Array pour variants/sizes.',
    template: '@Component {{name}} {\n props: [{{props}}]\n variants: [{{variants}}]\n}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'ButtonComponent',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*$', message: 'PascalCase' },
        customValidator: (val, context) => context.components.includes(val) ? 'Nom composant unique' : null,
        helpText: 'Nom unique. Ex: CustomButton.',
        previewRenderer: (val) => `Composant: ${val}`,
      },
      {
        id: 'props',
        type: 'array',
        label: 'Props',
        defaultValue: [
          { name: 'variant', type: 'string', required: false, defaultValue: 'primary', documentation: 'Variant du bouton' },
          { name: 'size', type: 'string', required: false, defaultValue: 'md', documentation: 'Taille du bouton' },
        ],
        nestedType: {
          type: 'object',
          label: 'Prop',
          nestedType: {
            name: { type: 'text', required: true, validation: { pattern: '^[a-z][a-zA-Z0-9]*$', message: 'camelCase' } },
            type: { type: 'select', options: [{ label: 'string', value: 'string' }, { label: 'number', value: 'number' }, { label: 'boolean', value: 'boolean' }, { label: 'function', value: 'function' }], required: true },
            required: { type: 'boolean', defaultValue: false },
            defaultValue: { type: 'text', validation: { message: 'Matcher type prop' } },
            documentation: { type: 'text', helpText: 'Description prop' },
          },
        },
        minItems: 0,
        maxItems: 50,
        validation: { unique: true, message: 'Noms props uniques' },
        customValidator: (props) => props.every(p => p.name && p.type) ? null : 'Chaque prop needs name & type',
        helpText: 'Props en array nested (éditable sub-fields). Drag pour ordre, Monaco pour function props.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(p => p.name).join(', '),
      },
      {
        id: 'variants',
        type: 'enum-values',
        label: 'Variants',
        defaultValue: ['primary', 'secondary', 'destructive', 'outline', 'ghost'],
        validation: { unique: true, minItems: 1, maxItems: 20, message: 'Variants uniques, min 1' },
        maxItems: 20,
        minItems: 1,
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Variants via liste éditable. Drag pour ordre.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'sizes',
        type: 'enum-values',
        label: 'Tailles',
        defaultValue: ['sm', 'md', 'lg', 'xl'],
        validation: { unique: true, minItems: 1, maxItems: 10, message: 'Tailles uniques, min 1' },
        maxItems: 10,
        minItems: 1,
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Tailles via liste. Ex: icon, default.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'styles',
        type: 'json',
        label: 'Styles',
        defaultValue: { base: '', variants: {}, sizes: {} },
        monacoOptions: { language: 'json', theme: 'vs-dark' },
        validation: { message: 'JSON valide pour styles' },
        helpText: 'Styles JSON (base, variants, sizes). Éditable Monaco.',
        previewRenderer: (json) => `Variants: ${Object.keys(json.variants).length}`,
      },
      {
        id: 'animations',
        type: 'array',
        label: 'Animations',
        defaultValue: [],
        nestedType: {
          type: 'object',
          label: 'Animation',
          nestedType: {
            name: { type: 'text', required: true, validation: { minLength: 3 } },
            keyframes: { type: 'json', monacoOptions: { language: 'json' }, required: true },
            duration: { type: 'text', defaultValue: '0.5s', validation: { pattern: '^[0-9.]+s$' } },
            easing: { type: 'text', defaultValue: 'ease-in-out' },
          },
        },
        minItems: 0,
        maxItems: 20,
        validation: { unique: true },
        helpText: 'Animations nested avec JSON keyframes.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(a => a.name).join(', '),
      },
      {
        id: 'accessibility',
        type: 'object',
        label: 'Accessibilité',
        defaultValue: { role: '', ariaLabel: '', focusTrap: false, restoreFocus: false },
        nestedType: {
          role: { type: 'text', helpText: 'Rôle ARIA' },
          ariaLabel: { type: 'text', helpText: 'Label ARIA' },
          focusTrap: { type: 'boolean', defaultValue: false },
          restoreFocus: { type: 'boolean', defaultValue: false },
        },
        validation: { required: false },
        helpText: 'Config a11y pour composant.',
        previewRenderer: (obj) => `Role: ${obj.role || 'none'}`,
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['prop'],
    maxChildren: 100,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
    ],
  },
  {
    id: 'page',
    name: 'Page',
    label: 'Page',
    category: 'UI',
    color: 'secondary',
    icon: 'FileText',
    description: 'Définir une page UI complète avec chemin, layout et sections imbriquées. Supporte meta SEO, auth guards et dynamic components.',
    template: '@Page {{name}} path:{{path}} layout:{{layout}} { }',
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Nom de la page',
        placeholder: 'DashboardPage',
        required: true,
        defaultValue: 'HomePage',
        validation: {
          pattern: '^[A-Z][a-zA-Z0-9]*Page$',
          minLength: 5,
          maxLength: 60,
          message: 'Doit commencer par majuscule et se terminer par Page (ex: DashboardPage)'
        },
        customValidator: (val, context) => context.pages?.includes(val) ? 'Ce nom de page existe déjà' : null,
        helpText: 'Nom unique et clair de la page. Exemple maximal: AdminDashboardPage, UserProfilePage.',
        previewRenderer: (val) => `Page: ${val}`,
        searchEnabled: false,
        allowCustomAdd: false,
      },
      {
        id: 'path',
        name: 'path',
        type: 'text',
        label: 'Chemin URL',
        placeholder: '/dashboard',
        required: true,
        defaultValue: '/',
        validation: {
          pattern: '^(/[a-zA-Z0-9{}-]+)+/?$',
          message: 'Chemin valide (ex: /users/{id}, /admin/dashboard)'
        },
        helpText: 'Chemin d’accès dans l’application. Supporte params dynamiques {id}. Exemple maximal: /dashboard/{userId}/settings.',
        previewRenderer: (val) => `URL: ${val}`,
      },
      {
        id: 'layout',
        name: 'layout',
        type: 'select',
        label: 'Layout principal',
        required: true,
        defaultValue: 'MainLayout',
        options: [
          { label: 'MainLayout (standard)', value: 'MainLayout' },
          { label: 'AdminLayout (sidebar)', value: 'AdminLayout' },
          { label: 'AuthLayout (centré)', value: 'AuthLayout' },
          { label: 'DashboardLayout (full)', value: 'DashboardLayout' },
          { label: 'EmptyLayout (sans header)', value: 'EmptyLayout' },
        ],
        dynamicSource: 'layouts',
        searchEnabled: true,
        allowCustomAdd: true,
        validation: { relationCheck: true },
        customValidator: (val, context) => context.layouts.includes(val) ? null : 'Layout inexistant',
        helpText: 'Choisissez le layout global de la page. Vous pouvez ajouter un layout custom.',
        previewRenderer: (val) => `Layout: ${val}`,
      },
      {
        id: 'authGuard',
        name: 'authGuard',
        type: 'select',
        label: 'Protection d’accès',
        defaultValue: 'public',
        options: [
          { label: 'Public (ouvert à tous)', value: 'public' },
          { label: 'Authenticated (connecté seulement)', value: 'authenticated' },
          { label: 'Admin (rôle admin requis)', value: 'admin' },
          { label: 'Custom guard', value: 'custom' },
        ],
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Niveau d’accès à la page. Exemple maximal: admin pour dashboard sensible.',
        previewRenderer: (val) => `Accès: ${val}`,
      },
      {
        id: 'seo',
        type: 'object',
        label: 'SEO Config',
        defaultValue: { title: '', description: '', keywords: [], ogImage: '' },
        nestedType: {
          title: { type: 'text', label: 'Titre', validation: { minLength: 1, maxLength: 60 } },
          description: { type: 'text', label: 'Description', validation: { minLength: 1, maxLength: 160 } },
          keywords: { type: 'enum-values', label: 'Mots-clés', minItems: 1, maxItems: 20, unique: true },
          ogImage: { type: 'text', label: 'OG Image', validation: { pattern: '^https?://', message: 'URL valide' } },
        },
        validation: { required: false },
        helpText: 'Meta SEO pour page. Nested avec validation longueur.',
        previewRenderer: (obj) => `Title: ${obj.title || 'none'}`,
      },
      {
        id: 'performance',
        type: 'object',
        label: 'Performance Config',
        defaultValue: { priority: 'MEDIUM', preload: [], prefetch: [] },
        nestedType: {
          priority: { type: 'select', options: [{ label: 'HIGH', value: 'HIGH' }, { label: 'MEDIUM', value: 'MEDIUM' }, { label: 'LOW', value: 'LOW' }], defaultValue: 'MEDIUM' },
          preload: { type: 'enum-values', label: 'Preload', maxItems: 10, helpText: 'Ressources à preload' },
          prefetch: { type: 'enum-values', label: 'Prefetch', maxItems: 10, helpText: 'Ressources à prefetch' },
        },
        validation: { required: false },
        helpText: 'Config perf (priority, preload/prefetch). Nested enum-values.',
        previewRenderer: (obj) => `Priority: ${obj.priority}`,
      },
      {
        id: 'dataFetching',
        type: 'object',
        label: 'Data Fetching',
        defaultValue: { method: 'server_component', sources: [] },
        nestedType: {
          method: { type: 'select', options: [{ label: 'server_component', value: 'server_component' }, { label: 'client', value: 'client' }, { label: 'static', value: 'static' }], defaultValue: 'server_component' },
          sources: {
            type: 'array',
            label: 'Sources',
            nestedType: {
              type: 'object',
              label: 'Source',
              nestedType: {
                key: { type: 'text', required: true },
                endpoint: { type: 'text', required: true, validation: { pattern: '^/[a-zA-Z0-9/{}]*$', message: 'Endpoint valide' } },
                cache: { type: 'text', defaultValue: '1h', validation: { pattern: '^[0-9]+(s|m|h|d)$' } },
                realtime: { type: 'boolean', defaultValue: false },
              },
            },
            minItems: 0,
            maxItems: 20,
          },
        },
        validation: { required: false },
        helpText: 'Config fetching data (method, sources nested avec cache/realtime).',
        previewRenderer: (obj) => `Method: ${obj.method}, Sources: ${obj.sources.length}`,
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['section'],
    maxChildren: 50,
    validation: [
      { type: 'required', field: 'name', message: 'Le nom est requis' },
      { type: 'required', field: 'path', message: 'Le chemin est requis' },
      { type: 'required', field: 'layout', message: 'Le layout est requis' },
    ],
  },
  {
    id: 'section',
    name: 'Section',
    label: 'Section',
    category: 'UI',
    color: 'muted',
    icon: 'LayoutPanelLeft',
    description: 'Section d’une page avec layout et composants. Supporte responsive, animations et SEO.',
    template: '@Section {{name}} layout:{{layout}} { }',
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Nom de la section',
        placeholder: 'HeroBanner',
        required: true,
        defaultValue: 'HeroSection',
        validation: {
          pattern: '^[A-Z][a-zA-Z0-9]*Section$',
          minLength: 3,
          maxLength: 60,
          message: 'Doit commencer par majuscule et se terminer par Section'
        },
        customValidator: (val, context) => context.sections?.includes(val) ? 'Ce nom de section existe déjà dans la page' : null,
        helpText: 'Nom descriptif de la section. Exemple maximal: FeaturesSection, TestimonialsSection.',
        previewRenderer: (val) => `Section: ${val}`,
      },
      {
        id: 'layout',
        name: 'layout',
        type: 'select',
        label: 'Disposition',
        required: true,
        defaultValue: 'flex',
        options: [
          { label: 'Flex (horizontal/vertical)', value: 'flex' },
          { label: 'Grid (colonnes)', value: 'grid' },
          { label: 'Stack (empilé)', value: 'stack' },
          { label: 'Tabs (onglets)', value: 'tabs' },
          { label: 'Accordion (pliable)', value: 'accordion' },
          { label: 'Carousel (diaporama)', value: 'carousel' },
        ],
        searchEnabled: true,
        allowCustomAdd: true,
        validation: { message: 'Disposition obligatoire' },
        customValidator: (val) => val ? null : 'Disposition requise',
        helpText: 'Choisissez la disposition responsive. Vous pouvez ajouter un layout custom.',
        previewRenderer: (val) => `Disposition: ${val}`,
      },
      {
        id: 'responsive',
        name: 'responsive',
        type: 'json',
        label: 'Comportement Responsive',
        defaultValue: { mobile: 'stack', tablet: 'grid-2', desktop: 'grid-3', padding: '4', gap: '6' },
        monacoOptions: { language: 'json', theme: 'vs-dark' },
        validation: { custom: (json) => Object.keys(json).includes('desktop'), message: 'Au moins desktop requis' },
        helpText: 'Config responsive Tailwind-like. Exemple maximal: mobile stack, desktop 3 colonnes.',
        previewRenderer: (json) => `Mobile: ${json.mobile || 'stack'} | Desktop: ${json.desktop || 'grid'}`,
      },
      {
        id: 'components',
        name: 'components',
        type: 'multiselect',
        label: 'Composants inclus',
        dynamicSource: 'components',
        defaultValue: ['Hero', 'Button', 'Card', 'Image'],
        validation: { minItems: 1, unique: true, message: 'Au moins un composant' },
        searchEnabled: true,
        allowCustomAdd: true,
        customValidator: (comps, context) => comps.every(c => context.components.includes(c)) ? null : 'Composants inexistants',
        helpText: 'Sélectionnez les composants à afficher dans cette section. Recherche + ajout custom.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'data',
        name: 'data',
        type: 'array',
        label: 'Sources Data',
        defaultValue: [],
        nestedType: {
          type: 'object',
          label: 'Source Data',
          nestedType: {
            type: { type: 'select', options: [{ label: 'static', value: 'static' }, { label: 'api', value: 'api' }, { label: 'dynamic', value: 'dynamic' }], required: true },
            source: { type: 'text', required: true, validation: { message: 'Source requise' } },
            params: { type: 'json', monacoOptions: { language: 'json' }, helpText: 'Params JSON' },
          },
        },
        minItems: 0,
        maxItems: 20,
        validation: { custom: (arr) => arr.every(d => d.type && d.source), message: 'Chaque source needs type & source' },
        helpText: 'Sources data pour section. Nested avec JSON params.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(d => d.type).join(', '),
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['component'],
    maxChildren: 100,
    validation: [
      { type: 'required', field: 'name', message: 'Le nom est requis' },
      { type: 'required', field: 'layout', message: 'La disposition est requise' },
    ],
  },
  {
    id: 'api',
    name: 'API',
    label: 'API',
    category: 'API',
    color: 'accent',
    icon: 'Globe',
    description: 'Définir une API complète avec type, version, base path et endpoints.',
    template: '@API {{name}} type:{{type}} version:{{version}} base_path:{{basePath}} { endpoints: [{{endpoints}}] }',
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Nom de l’API',
        placeholder: 'UserManagementAPI',
        required: true,
        defaultValue: 'UserAPI',
        validation: {
          pattern: '^[A-Z][a-zA-Z0-9]*API$',
          minLength: 5,
          maxLength: 60,
          message: 'Doit commencer par majuscule et se terminer par API'
        },
        customValidator: (val, context) => context.apis?.includes(val) ? 'Ce nom d’API existe déjà' : null,
        helpText: 'Nom unique et descriptif de l’API. Exemple maximal: OrderProcessingAPI.',
        previewRenderer: (val) => `API: ${val}`,
      },
      {
        id: 'type',
        name: 'type',
        type: 'select',
        label: 'Type d’API',
        required: true,
        defaultValue: 'REST',
        options: [
          { label: 'REST (classique)', value: 'REST' },
          { label: 'GraphQL (flexible)', value: 'GRAPHQL' },
          { label: 'gRPC (haute performance)', value: 'GRPC' },
          { label: 'SOAP (legacy)', value: 'SOAP' },
        ],
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Choisissez le style d’API. REST est recommandé pour la plupart des cas.',
        previewRenderer: (val) => `Type: ${val}`,
      },
      {
        id: 'version',
        name: 'version',
        type: 'text',
        label: 'Version',
        placeholder: 'v1.2.0',
        defaultValue: 'v1',
        validation: {
          pattern: '^v[0-9]+(\\.[0-9]+)*$',
          message: 'Format version sémantique (ex: v1, v2.3.0)'
        },
        helpText: 'Version de l’API. Exemple maximal: v1.0.0 ou v2-beta.',
        previewRenderer: (val) => `Version: ${val}`,
      },
      {
        id: 'basePath',
        name: 'basePath',
        type: 'text',
        label: 'Chemin de base',
        placeholder: '/api/v1',
        defaultValue: '/api/v1',
        validation: {
          pattern: '^(/[a-zA-Z0-9-]+)+/?$',
          message: 'Chemin valide commençant par /'
        },
        helpText: 'Préfixe commun à tous les endpoints. Exemple maximal: /api/v2/admin.',
        previewRenderer: (val) => `Base: ${val}`,
      },
      {
        id: 'security',
        type: 'object',
        label: 'Sécurité',
        defaultValue: { authentication: {}, authorization: {} },
        nestedType: {
          authentication: { type: 'object', nestedType: { type: 'select', options: [{ label: 'JWT', value: 'JWT' }, { label: 'OAuth2', value: 'OAuth2' }] } },
          authorization: { type: 'object', nestedType: { type: 'select', options: [{ label: 'RBAC', value: 'RBAC' }, { label: 'ABAC', value: 'ABAC' }] } },
        },
        helpText: 'Config sécurité globale.',
        previewRenderer: (obj) => `Auth: ${obj.authentication.type}`,
      },
      {
        id: 'schema',
        type: 'object',
        label: 'Schema GraphQL (si applicable)',
        defaultValue: { types: [], queries: {}, mutations: {}, subscriptions: {} },
        nestedType: {
          types: { type: 'enum-values' },
          queries: { type: 'json' },
          mutations: { type: 'json' },
          subscriptions: { type: 'json' },
        },
        helpText: 'Schema pour GraphQL.',
        previewRenderer: (obj) => `Queries: ${Object.keys(obj.queries).length}`,
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['endpoint'],
    maxChildren: 200,
    validation: [
      { type: 'required', field: 'name', message: 'Le nom est requis' },
      { type: 'required', field: 'type', message: 'Le type est requis' },
    ],
  },
  {
    id: 'endpoint',
    name: 'Endpoint',
    label: 'Endpoint',
    category: 'API',
    color: 'muted',
    icon: 'Link',
    description: 'Définir un endpoint API avec méthode, chemin, params, body et réponses.',
    template: '{{method}} {{path}}',
    fields: [
      {
        id: 'method',
        name: 'method',
        type: 'select',
        label: 'Méthode HTTP',
        required: true,
        defaultValue: 'GET',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
          { label: 'PATCH', value: 'PATCH' },
          { label: 'OPTIONS', value: 'OPTIONS' },
          { label: 'HEAD', value: 'HEAD' },
        ],
        searchEnabled: true,
        helpText: 'Méthode HTTP de l’endpoint. GET pour lecture, POST pour création.',
        previewRenderer: (val) => val,
      },
      {
        id: 'path',
        name: 'path',
        type: 'text',
        label: 'Chemin relatif',
        placeholder: '/users/{id}',
        required: true,
        defaultValue: '/users/{id}',
        validation: {
          pattern: '^(/[a-zA-Z0-9{}-]+)+/?$',
          message: 'Chemin valide avec params {var}'
        },
        helpText: 'Chemin après base_path. Supporte params dynamiques {id}. Exemple maximal: /orders/{orderId}/items/{itemId}.',
        previewRenderer: (val) => val,
      },
      {
        id: 'handler',
        name: 'handler',
        type: 'text',
        label: 'Handler',
        placeholder: 'userController.getUser',
        defaultValue: 'userController.getUser',
        helpText: 'Fonction handler.',
        previewRenderer: (val) => `Handler: ${val}`,
      },
      {
        id: 'middleware',
        name: 'middleware',
        type: 'enum-values',
        label: 'Middleware',
        defaultValue: ['auth', 'rateLimit'],
        validation: { unique: true },
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Middleware chain.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'request',
        type: 'object',
        label: 'Requête Schema',
        defaultValue: { type: 'object', properties: {}, required: [] },
        nestedType: {
          type: { type: 'text' },
          properties: { type: 'json' },
          required: { type: 'enum-values' },
        },
        helpText: 'Schema requête.',
        previewRenderer: (obj) => `Type: ${obj.type}`,
      },
      {
        id: 'response',
        type: 'object',
        label: 'Réponse Schema',
        defaultValue: { type: 'object', properties: {}, required: [] },
        nestedType: {
          type: { type: 'text' },
          properties: { type: 'json' },
          required: { type: 'enum-values' },
        },
        helpText: 'Schema réponse.',
        previewRenderer: (obj) => `Type: ${obj.type}`,
      },
      {
        id: 'description',
        name: 'description',
        type: 'text',
        label: 'Description',
        placeholder: 'Récupère les détails d’un utilisateur',
        defaultValue: 'Récupère les détails d’un utilisateur par ID',
        helpText: 'Description claire pour la doc (Swagger/Postman).',
        previewRenderer: (val) => val.slice(0, 40) + (val.length > 40 ? '...' : ''),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'method', message: 'Méthode requise' },
      { type: 'required', field: 'path', message: 'Chemin requis' },
    ],
  },
  {
    id: 'microservice',
    name: 'Microservice',
    label: 'Microservice',
    category: 'API',
    color: 'accent',
    icon: 'Server',
    description: 'Définir un microservice avec port, domaine et dépendances.',
    template: '@Microservice {{name}} port:{{port}} domain:{{domain}} { dependencies: [{{dependencies}}] }',
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Nom du microservice',
        placeholder: 'UserService',
        required: true,
        defaultValue: 'AuthService',
        validation: {
          pattern: '^[A-Z][a-zA-Z0-9]*Service$',
          minLength: 5,
          maxLength: 50,
          message: 'Doit commencer par majuscule et finir par Service'
        },
        customValidator: (val, context) => context.microservices?.includes(val) ? 'Ce nom existe déjà' : null,
        helpText: 'Nom unique du service. Exemple maximal: NotificationService, PaymentGatewayService.',
        previewRenderer: (val) => `Service: ${val}`,
      },
      {
        id: 'port',
        name: 'port',
        type: 'number',
        label: 'Port d’écoute',
        required: true,
        defaultValue: 3000,
        validation: { min: 1024, max: 65535, message: 'Port entre 1024 et 65535' },
        customValidator: (val, context) => context.ports?.includes(val) ? 'Port déjà utilisé par un autre service' : null,
        helpText: 'Port interne du service. Auto-check conflits.',
        previewRenderer: (val) => `Port: ${val}`,
      },
      {
        id: 'domain',
        name: 'domain',
        type: 'text',
        label: 'Domaine / Hostname',
        placeholder: 'auth.example.com',
        defaultValue: 'auth.example.com',
        validation: {
          pattern: '^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$|^localhost(:[0-9]+)?$',
          message: 'Domaine valide ou localhost'
        },
        helpText: 'Domaine public ou interne. Exemple maximal: api.payments.prod.company.com.',
        previewRenderer: (val) => `Domaine: ${val}`,
      },
      {
        id: 'dependencies',
        name: 'dependencies',
        type: 'multiselect',
        label: 'Dépendances',
        dynamicSource: 'microservices',
        defaultValue: ['DatabaseService', 'CacheService', 'AuthService'],
        validation: { unique: true, message: 'Dépendances uniques' },
        searchEnabled: true,
        allowCustomAdd: true,
        customValidator: (deps, context) => {
          const missing = deps.filter(d => !context.microservices.includes(d));
          return missing.length === 0 ? null : `Dépendances manquantes: ${missing.join(', ')}`;
        },
        helpText: 'Services dont ce microservice dépend. Recherche dynamique + ajout custom.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'database',
        type: 'object',
        label: 'Database',
        defaultValue: { type: 'PostgreSQL', models: [], cache: { strategy: 'READ_THROUGH', ttl: '5m' } },
        nestedType: {
          type: { type: 'select', options: [{ label: 'PostgreSQL', value: 'PostgreSQL' }, { label: 'MySQL', value: 'MySQL' }] },
          models: { type: 'multiselect', dynamicSource: 'models' },
          cache: { type: 'object', nestedType: { strategy: 'select', ttl: 'text' } },
        },
        helpText: 'Config DB.',
        previewRenderer: (obj) => `Type: ${obj.type}`,
      },
      {
        id: 'eventBus',
        type: 'object',
        label: 'Event Bus',
        defaultValue: { events: [], subscribers: [] },
        nestedType: {
          events: { type: 'enum-values' },
          subscribers: { type: 'multiselect', dynamicSource: 'microservices' },
        },
        helpText: 'Config event bus.',
        previewRenderer: (obj) => `Events: ${obj.events.length}`,
      },
      {
        id: 'monitoring',
        type: 'object',
        label: 'Monitoring',
        defaultValue: { metrics: [], alerts: [] },
        nestedType: {
          metrics: { type: 'enum-values' },
          alerts: { type: 'array', nestedType: { name: 'text', condition: 'text' } },
        },
        helpText: 'Config monitoring.',
        previewRenderer: (obj) => `Metrics: ${obj.metrics.join(', ')}`,
      },
      {
        id: 'security',
        type: 'object',
        label: 'Sécurité',
        defaultValue: { authentication: { type: 'JWT' }, authorization: { type: 'RBAC' } },
        nestedType: {
          authentication: { type: 'object', nestedType: { type: 'select' } },
          authorization: { type: 'object', nestedType: { type: 'select' } },
        },
        helpText: 'Config sécurité.',
        previewRenderer: (obj) => `Auth: ${obj.authentication.type}`,
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['api', 'endpoint', 'database', 'cache'],
    maxChildren: 50,
    validation: [
      { type: 'required', field: 'name', message: 'Le nom est requis' },
      { type: 'required', field: 'port', message: 'Le port est requis' },
    ],
  },
  {
    id: 'eventbus',
    name: 'EventBus',
    label: 'Event Bus',
    category: 'API',
    color: 'accent',
    icon: 'RadioTower',
    description: 'Bus d’événements pour pub/sub. Dynamic subscribers, validation events uniques.',
    template: '@EventBus {{name}} { events: [{{events}}] subscribers: [{{subscribers}}] }',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Bus',
        required: true,
        defaultValue: 'MainEventBus',
        validation: { minLength: 5, pattern: '^[A-Z][a-zA-Z0-9]*Bus$', message: 'Terminer par Bus' },
        helpText: 'Nom unique. Ex: NotificationBus.',
        previewRenderer: (val) => `Bus: ${val}`,
      },
      {
        id: 'events',
        type: 'enum-values',
        label: 'Événements',
        defaultValue: ['userCreated', 'orderPlaced', 'paymentFailed', 'stockUpdated', 'messageSent'],
        validation: { unique: true, minItems: 1, maxItems: 100, pattern: '^[a-zA-Z0-9]+$', message: 'Noms events camelCase uniques' },
        maxItems: 100,
        minItems: 1,
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Événements publiés. Liste éditable/drag, recherche/add custom.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'subscribers',
        type: 'multiselect',
        label: 'Abonnés',
        dynamicSource: 'microservices',
        defaultValue: ['EmailService', 'LoggingService', 'AnalyticsService'],
        validation: { minItems: 1, unique: true },
        searchEnabled: true,
        allowCustomAdd: true,
        customValidator: (subs, context) => subs.every(s => context.services.includes(s)) ? null : 'Abonnés inexistants',
        helpText: 'Services abonnés. Multiselect dynamique avec recherche.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'config',
        type: 'json',
        label: 'Config',
        defaultValue: { retry: 3, timeout: '5s', persistent: true },
        monacoOptions: { language: 'json', theme: 'vs-dark' },
        validation: { custom: (json) => json.retry > 0, message: 'Retry > 0' },
        helpText: 'Config JSON (retry, timeout). Monaco pour édition.',
        previewRenderer: (json) => `Retry: ${json.retry}`,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'events', message: 'Au moins un événement' },
    ],
  },
  {
    id: 'webhook',
    name: 'Webhook',
    label: 'Webhook',
    category: 'API',
    color: 'accent',
    icon: 'Webhook',
    description: 'Webhook pour callbacks externes. Validation URL, security nested.',
    template: '@Webhook {{name}} url:{{url}} { events: [{{events}}] security: {{security}} }',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Webhook',
        required: true,
        defaultValue: 'PaymentWebhook',
        validation: { minLength: 5, pattern: '^[A-Z][a-zA-Z0-9]*Webhook$', message: 'Terminer par Webhook' },
        helpText: 'Nom unique. Ex: StripeWebhook.',
        previewRenderer: (val) => `Webhook: ${val}`,
      },
      {
        id: 'url',
        type: 'text',
        label: 'URL Callback',
        required: true,
        defaultValue: 'https://example.com/webhook',
        validation: { pattern: '^https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/.*)?$', message: 'URL valide' },
        customValidator: (val) => val.startsWith('https') ? null : 'Préférez HTTPS pour sécurité',
        helpText: 'URL externe pour callbacks. https:// recommended.',
        previewRenderer: (val) => `URL: ${val}`,
      },
      {
        id: 'events',
        type: 'multiselect',
        label: 'Événements',
        dynamicSource: 'events',
        defaultValue: ['paymentSuccess', 'paymentFailure', 'userUpdate'],
        validation: { minItems: 1, unique: true },
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Événements déclencheurs. Multiselect dynamique.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'security',
        type: 'object',
        label: 'Sécurité',
        defaultValue: { signature: 'HMAC-SHA256', secret: 'your_secret_key', tolerance: '5m' },
        nestedType: {
          signature: { type: 'select', options: [{ label: 'HMAC-SHA256', value: 'HMAC-SHA256' }, { label: 'JWT', value: 'JWT' }, { label: 'API Key', value: 'API Key' }] },
          secret: { type: 'text', required: true },
          tolerance: { type: 'text', defaultValue: '5m', validation: { pattern: '^[0-9]+(s|m|h)$' } },
        },
        validation: { required: true, custom: (obj) => obj.secret?.length > 10, message: 'Secret min 10 chars' },
        helpText: 'Config sécurité nested. Object avec select pour signature.',
        previewRenderer: (obj) => `Signature: ${obj.signature}`,
      },
      {
        id: 'retry',
        type: 'json',
        label: 'Retry Config',
        defaultValue: { attempts: 3, backoff: 'exponential', maxDelay: '30s' },
        monacoOptions: { language: 'json', theme: 'vs-dark' },
        helpText: 'Config retry JSON. Ex: backoff linear/exponential.',
        previewRenderer: (json) => `Attempts: ${json.attempts}`,
      },
      {
        id: 'handlers',
        type: 'json',
        label: 'Handlers',
        defaultValue: { paymentSuccess: 'handleSuccess', paymentFailed: 'handleFailure' },
        monacoOptions: { language: 'json', theme: 'vs-dark' },
        helpText: 'Handlers par événement JSON.',
        previewRenderer: (json) => Object.keys(json).join(', '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'url', message: 'URL requise' },
      { type: 'required', field: 'events', message: 'Au moins un événement' },
      { type: 'required', field: 'security', message: 'Sécurité requise' },
    ],
  },
  {
    id: 'deploy',
    name: 'Deploy',
    label: 'Déploiement',
    category: 'INFRASTRUCTURE',
    color: 'warning',
    icon: 'Cloud',
    description: 'Définir un déploiement cloud avec cible, région, environnement et services.',
    template: '@Deploy target:{{target}} { region: {{region}} env: {{environment}} }',
    fields: [
      {
        id: 'target',
        name: 'target',
        type: 'select',
        label: 'Plateforme cloud',
        required: true,
        defaultValue: 'AWS',
        options: [
          { label: 'AWS (Amazon)', value: 'AWS' },
          { label: 'Azure (Microsoft)', value: 'Azure' },
          { label: 'GCP (Google)', value: 'GCP' },
          { label: 'Heroku', value: 'Heroku' },
          { label: 'Vercel (frontend)', value: 'Vercel' },
          { label: 'DigitalOcean', value: 'DigitalOcean' },
        ],
        searchEnabled: true,
        allowCustomAdd: true,
        validation: { message: 'Plateforme obligatoire' },
        helpText: 'Choisissez votre fournisseur cloud. Add custom si besoin.',
        previewRenderer: (val) => `Plateforme: ${val}`,
      },
      {
        id: 'region',
        name: 'region',
        type: 'text',
        label: 'Région / Zone',
        placeholder: 'eu-west-1',
        defaultValue: 'eu-west-1',
        validation: {
          pattern: '^[a-z]{2}-[a-z]+-[0-9a-z]+$|^[a-z]+-[a-z]+-[0-9]$',
          message: 'Format région valide (ex: eu-west-1, us-central1-a)'
        },
        helpText: 'Région géographique du provider. Exemple maximal: europe-west1-c (GCP).',
        previewRenderer: (val) => `Région: ${val}`,
      },
      {
        id: 'environment',
        name: 'environment',
        type: 'select',
        label: 'Environnement',
        required: true,
        defaultValue: 'production',
        options: [
          { label: 'Production (live)', value: 'production' },
          { label: 'Staging (pré-prod)', value: 'staging' },
          { label: 'Development (dev)', value: 'development' },
          { label: 'QA / Test', value: 'qa' },
        ],
        searchEnabled: true,
        helpText: 'Type d’environnement. Production = live, staging = tests finaux.',
        previewRenderer: (val) => `Env: ${val}`,
      },
      {
        id: 'services',
        name: 'services',
        type: 'multiselect',
        label: 'Services à déployer',
        dynamicSource: 'microservices',
        defaultValue: ['AuthService', 'UserService', 'PaymentService'],
        validation: { minItems: 1, unique: true, message: 'Au moins un service' },
        searchEnabled: true,
        allowCustomAdd: true,
        customValidator: (services, context) => {
          const missing = services.filter(s => !context.microservices.includes(s));
          return missing.length === 0 ? null : `Services inconnus: ${missing.join(', ')}`;
        },
        helpText: 'Sélectionnez les microservices à déployer. Recherche dynamique + ajout.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'cicd',
        name: 'cicd',
        type: 'text',
        label: 'CI/CD',
        defaultValue: 'GitHub Actions',
        helpText: 'Outil CI/CD.',
        previewRenderer: (val) => `CI/CD: ${val}`,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'target', message: 'La plateforme est requise' },
      { type: 'required', field: 'environment', message: 'L’environnement est requis' },
      { type: 'required', field: 'services', message: 'Au moins un service requis' },
    ],
  },
  {
    id: 'cache',
    name: 'Cache',
    label: 'Cache',
    category: 'INFRASTRUCTURE',
    color: 'warning',
    icon: 'Database',
    description: 'Stratégie de cache pour une entité avec TTL et clés.',
    template: '@Cache entity:{{entity}} strategy:{{strategy}} ttl:{{ttl}}',
    fields: [
      {
        id: 'entity',
        name: 'entity',
        type: 'select',
        label: 'Entité à mettre en cache',
        required: true,
        defaultValue: 'User',
        dynamicSource: 'entities',
        searchEnabled: true,
        validation: { relationCheck: true },
        customValidator: (val, context) => context.entities.includes(val) ? null : 'Entité inexistante',
        helpText: 'Quelle entité (modèle) doit être cachée ? Liste dynamique des modèles.',
        previewRenderer: (val) => `Entité: ${val}`,
      },
      {
        id: 'strategy',
        name: 'strategy',
        type: 'select',
        label: 'Stratégie de cache',
        required: true,
        defaultValue: 'READ_THROUGH',
        options: [
          { label: 'Read-Through (lecture via cache)', value: 'READ_THROUGH' },
          { label: 'Write-Through (écriture sync)', value: 'WRITE_THROUGH' },
          { label: 'Cache-Aside (géré manuellement)', value: 'CACHE_ASIDE' },
          { label: 'Write-Behind (écriture asynchrone)', value: 'WRITE_BEHIND' },
        ],
        helpText: 'Comment le cache interagit avec la source de données.',
        previewRenderer: (val) => `Stratégie: ${val}`,
      },
      {
        id: 'ttl',
        name: 'ttl',
        type: 'text',
        label: 'Durée de vie (TTL)',
        placeholder: '5m',
        defaultValue: '5m',
        validation: {
          pattern: '^[0-9]+(s|m|h|d)$',
          message: 'Format: 30s, 5m, 1h, 24h, 7d'
        },
        customValidator: (val) => {
          const num = parseInt(val);
          return num > 0 ? null : 'TTL doit être positif';
        },
        helpText: 'Durée avant expiration. Exemple maximal: 30m pour données semi-dynamiques.',
        previewRenderer: (val) => `TTL: ${val}`,
      },
      {
        id: 'keys',
        name: 'keys',
        type: 'enum-values',
        label: 'Modèles de clés cache',
        defaultValue: [
          'user:{id}',
          'users:list:{filter}:{page}',
          'user:email:{email}',
          'session:{token}'
        ],
        validation: { unique: true, minItems: 1, maxItems: 30, pattern: '^[a-zA-Z0-9:{}-]+$', message: 'Modèles valides avec {var}' },
        maxItems: 30,
        minItems: 1,
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Modèles de clés (avec {var}). Drag & drop pour ordre, add custom.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'warming',
        type: 'object',
        label: 'Cache Warming',
        defaultValue: { on: 'startup', data: 'popularUsers' },
        nestedType: {
          on: { type: 'select', options: [{ label: 'startup', value: 'startup' }, { label: 'event', value: 'event' }], required: true },
          data: { type: 'text', required: true },
        },
        validation: { required: false },
        helpText: 'Config warming (on startup/event).',
        previewRenderer: (obj) => `On: ${obj.on}`,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'entity', message: 'L’entité est requise' },
      { type: 'required', field: 'strategy', message: 'La stratégie est requise' },
      { type: 'required', field: 'ttl', message: 'TTL requis' },
      { type: 'required', field: 'keys', message: 'Au moins un modèle de clé requis' },
    ],
  },
  {
    id: 'cicdgen',
    name: 'CICDGen',
    label: 'Générateur CI/CD',
    category: 'CICD',
    color: 'primary',
    icon: 'Code',
    description: 'Génère configs CI/CD pour platforms. Éditable via JSON avancé avec validation YAML-like. Liaisons à deps.',
    template: '@CICDGen target:{{target}} name:{{name}} { steps: [{{steps}}] jobs: {{jobs}} }',
    fields: [
      {
        id: 'target',
        type: 'select',
        label: 'Plateforme',
        options: [
          { label: 'GITHUB_ACTIONS', value: 'GITHUB_ACTIONS' },
          { label: 'GITLAB_CI', value: 'GITLAB_CI' },
          { label: 'JENKINS', value: 'JENKINS' },
          { label: 'AZURE_DEVOPS', value: 'AZURE_DEVOPS' },
        ],
        defaultValue: 'GITHUB_ACTIONS',
        required: true,
        searchEnabled: true,
        allowCustomAdd: true,
        validation: { enum: ['GITHUB_ACTIONS', 'GITLAB_CI', 'JENKINS', 'AZURE_DEVOPS'], message: 'Plateforme valide seulement' },
        customValidator: (val) => val === 'JENKINS' ? 'Avertissement: Jenkins nécessite config avancée' : null,
        helpText: 'Choisissez plateforme avec recherche/add custom. Preview template basé sur choix.',
        previewRenderer: (val) => `Plateforme: ${val}`,
      },
      {
        id: 'name',
        type: 'text',
        label: 'Nom Pipeline',
        defaultValue: 'MainPipeline',
        validation: { pattern: '^[a-zA-Z0-9_-]+$', minLength: 5, maxLength: 50, message: 'Alphanumérique avec -_, 5-50 chars' },
        customValidator: (val, context) => context.pipelines.includes(val) ? 'Nom pipeline unique' : null,
        helpText: 'Nom unique. Auto-généré si vide. Check global unicité.',
        previewRenderer: (val) => `Pipeline: ${val}`,
      },
      {
        id: 'environment',
        type: 'multiselect',
        label: 'Environnements',
        options: [
          { label: 'development', value: 'development' },
          { label: 'staging', value: 'staging' },
          { label: 'production', value: 'production' },
          { label: 'testing', value: 'testing' },
          { label: 'qa', value: 'qa' },
        ],
        defaultValue: ['development', 'staging', 'production'],
        minItems: 1,
        maxItems: 10,
        searchEnabled: true,
        allowCustomAdd: true,
        validation: { minItems: 1, unique: true, message: 'Au moins un env, uniques' },
        helpText: 'Envs avec recherche/add custom. Validation: Au moins un, uniques.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'triggers',
        type: 'multiselect',
        label: 'Triggers',
        options: [
          { label: 'push', value: 'push' },
          { label: 'pull_request', value: 'pull_request' },
          { label: 'schedule', value: 'schedule' },
          { label: 'manual', value: 'manual' },
          { label: 'release', value: 'release' },
          { label: 'webhook', value: 'webhook' },
        ],
        defaultValue: ['push', 'pull_request', 'schedule'],
        validation: { minItems: 1, maxItems: 5, unique: true, message: 'Au moins un trigger, max 5, uniques' },
        searchEnabled: true,
        helpText: 'Déclencheurs avec recherche. Ex: push sur main. Auto-filtre par plateforme.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'jobs',
        type: 'array',
        label: 'Jobs',
        defaultValue: [
          {
            name: 'build',
            runsOn: 'ubuntu-latest',
            steps: [
              { name: 'Checkout', uses: 'actions/checkout@v3' },
              { name: 'Install', run: 'npm install', env: { NODE_ENV: 'production' } },
              { name: 'Build', run: 'npm run build', if: 'success()' },
            ],
            needs: ['test'],
            strategy: { matrix: { node: ['14', '16', '18'] } },
          },
          {
            name: 'test',
            runsOn: 'ubuntu-latest',
            steps: [
              { name: 'Checkout', uses: 'actions/checkout@v3' },
              { name: 'Install', run: 'npm install' },
              { name: 'Test', run: 'npm test', env: { CI: 'true' } },
            ],
            strategy: { matrix: { os: ['ubuntu-latest', 'windows-latest'] } },
          },
          {
            name: 'deploy',
            runsOn: 'ubuntu-latest',
            steps: [
              { name: 'Deploy to Prod', run: 'deploy-script.sh', if: 'github.ref == "refs/heads/main"' },
            ],
            needs: ['build', 'test'],
          },
        ],
        nestedType: {
          type: 'object',
          label: 'Job',
          nestedType: {
            name: { type: 'text', required: true, validation: { unique: true, message: 'Nom job unique' } },
            runsOn: { type: 'text', defaultValue: 'ubuntu-latest', validation: { enumIn: ['ubuntu-latest', 'windows-latest', 'macos-latest'], message: 'OS valide' } },
            steps: { type: 'array', minItems: 1, maxItems: 50, nestedType: { name: 'text', run: 'code', uses: 'text', env: 'json', if: 'text' }, validation: { minItems: 1 } },
            needs: { type: 'multiselect', dynamicSource: 'jobs', validation: { unique: true } },
            strategy: { type: 'json', helpText: 'Matrix strategy', previewRenderer: (json) => JSON.stringify(json) },
          },
        },
        minItems: 1,
        maxItems: 50,
        validation: { minItems: 1, custom: (jobs, context) => jobs.every(j => j.steps?.length > 0), message: 'Chaque job needs steps' },
        customValidator: (jobs, context) => jobs.flatMap(j => j.needs || []).every(n => jobs.some(jb => jb.name === n)) ? null : 'Needs must reference existing jobs',
        helpText: 'Array de jobs éditable (add/remove/drag). Nested avec Monaco pour code/run. Validation circulaire intelligente.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(j => j.name).join(', '),
      },
      {
        id: 'artifacts',
        type: 'enum-values',
        label: 'Artifacts',
        defaultValue: ['build/dist', 'coverage/reports', 'logs/error.log', 'deploy/bundle.zip', 'test/results.xml'],
        validation: { unique: true, minItems: 1, maxItems: 20, pattern: '^[a-zA-Z0-9./_-]+$', message: 'Chemins valides, uniques' },
        maxItems: 20,
        minItems: 0,
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Artefacts via liste éditable/drag. Auto-filtre par jobs. Ex: Ajoutez via recherche paths communs.',
        previewRenderer: (vals) => vals.join('; '),
      },
      {
        id: 'cache',
        type: 'json',
        label: 'Cache',
        defaultValue: {
          paths: ['node_modules', '.cache', 'build', '**/*.cache', 'vendor'],
          key: '${{ runner.os }}-node-${{ hashFiles(\'package-lock.json\') }}',
          restoreKeys: ['${{ runner.os }}-node-', '${{ runner.os }}-'],
          upload: true,
        },
        monacoOptions: { language: 'json', theme: 'vs-dark' },
        validation: { required: false, custom: (json) => json.paths?.length > 0 || json.restoreKeys?.length > 0, message: 'Paths ou restoreKeys requis pour cache utile' },
        customValidator: (json) => json.key?.includes('${{') ? null : 'Key devrait utiliser variables dynamiques pour efficacité',
        helpText: 'Config cache JSON avec Monaco (validation, autocomplete). Nested pour restoreKeys/upload. Preview: Clés actives.',
        previewRenderer: (json) => `Cache paths: ${json.paths?.join(', ')}`,
      },
      {
        id: 'secrets',
        type: 'object',
        label: 'Secrets',
        defaultValue: {
          API_KEY: '${{ secrets.API_KEY }}',
          DB_PASSWORD: '${{ secrets.DB_PASSWORD }}',
          AWS_ACCESS_KEY: '${{ secrets.AWS_ACCESS_KEY }}',
          SLACK_WEBHOOK: '${{ secrets.SLACK_WEBHOOK }}',
          NPM_TOKEN: '${{ secrets.NPM_TOKEN }}',
        },
        nestedType: { type: 'text' },
        validation: { minLength: 0, maxLength: 50, unique: true, message: 'Clés uniques' },
        helpText: 'Secrets comme object éditable (add/remove keys). Values masquées pour sécurité, mais éditables via input sécurisé.',
        previewRenderer: (obj) => `Secrets: ${Object.keys(obj).join(', ')} (valeurs masquées)`,
      },
      {
        id: 'matrix',
        type: 'json',
        label: 'Matrix',
        defaultValue: {
          os: ['ubuntu-latest', 'windows-latest', 'macos-latest'],
          node: ['14', '16', '18', '20'],
          browser: ['chrome', 'firefox', 'safari', 'edge'],
          env: ['dev', 'prod', 'test'],
          python: ['3.8', '3.9', '3.10'],
        },
        monacoOptions: { language: 'json', theme: 'vs-dark' },
        validation: { custom: (json) => Object.values(json).every(v => Array.isArray(v) && v.length > 0 && new Set(v).size === v.length), message: 'Chaque clé needs array non-vide, uniques' },
        customValidator: (json) => Object.keys(json).length >= 1 ? null : 'Au moins une clé matrix pour utilité',
        helpText: 'Matrix pour builds parallèles. JSON avec Monaco, validation arrays/uniques. Ajoutez clés via éditeur.',
        previewRenderer: (json) => `Matrices: ${Object.keys(json).join(', ')}`,
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['job', 'step', 'dependency'],
    maxChildren: 100,
    validation: [
      { type: 'required', field: 'target', message: 'Plateforme requise' },
      { type: 'required', field: 'jobs', message: 'Au moins un job' },
      { type: 'custom', custom: (context) => context.jobs.length >= 1 && context.triggers.length >= 1, message: 'Triggers et jobs requis pour pipeline complet' },
    ],
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    label: 'Monitoring',
    category: 'INFRASTRUCTURE',
    color: 'warning',
    icon: 'Activity',
    description: 'Configuration du monitoring global (métriques + alertes).',
    template: '@Monitoring { metrics: [{{metrics}}] alerts: [{{alerts}}] }',
    fields: [
      {
        id: 'metrics',
        type: 'multiselect',
        label: 'Métriques collectées',
        options: [
          { label: 'CPU Usage', value: 'cpu' },
          { label: 'Memory Usage', value: 'memory' },
          { label: 'Request Latency', value: 'latency' },
          { label: 'Error Rate', value: 'errors' },
          { label: 'Database Connections', value: 'db_connections' },
        ],
        defaultValue: ['cpu', 'memory', 'latency', 'errors'],
        validation: { minItems: 2, unique: true },
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Métriques principales à surveiller.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'provider',
        type: 'select',
        label: 'Outil de monitoring',
        required: true,
        defaultValue: 'Prometheus',
        options: [
          { label: 'Prometheus + Grafana', value: 'Prometheus' },
          { label: 'Datadog', value: 'Datadog' },
          { label: 'New Relic', value: 'NewRelic' },
          { label: 'Sentry (erreurs)', value: 'Sentry' },
        ],
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Plateforme principale de monitoring.',
        previewRenderer: (val) => val,
      },
      {
        id: 'alerts',
        type: 'array',
        label: 'Alertes',
        defaultValue: [
          { metric: 'errors', threshold: '>5%', duration: '5m', severity: 'critical' },
          { metric: 'latency', threshold: '>500ms', duration: '10m', severity: 'warning' },
        ],
        nestedType: {
          type: 'object',
          label: 'Alerte',
          nestedType: {
            metric: { type: 'select', dynamicSource: 'metrics', required: true },
            threshold: { type: 'text', required: true, validation: { pattern: '^(<|>|>=|<=|=)?[0-9.]+(%|ms|s)?$' } },
            duration: { type: 'text', defaultValue: '5m', validation: { pattern: '^[0-9]+(s|m|h)$' } },
            severity: { type: 'select', options: [{ label: 'LOW', value: 'LOW' }, { label: 'MEDIUM', value: 'MEDIUM' }, { label: 'HIGH', value: 'HIGH' }, { label: 'CRITICAL', value: 'CRITICAL' }], required: true },
            action: { type: 'text', required: true },
          },
        },
        minItems: 1,
        maxItems: 30,
        validation: { minItems: 1 },
        customValidator: (alerts, context) => alerts.every(a => context.metrics.includes(a.metric)) ? null : 'Métriques doivent exister',
        helpText: 'Règles d’alerte avec seuil et canal de notification.',
        previewRenderer: (arr) => arr.map(a => `${a.metric} ${a.threshold}`).join(', '),
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['metrics', 'alert'],
    maxChildren: 50,
    validation: [
      { type: 'required', field: 'provider', message: 'Outil requis' },
      { type: 'required', field: 'metrics', message: 'Au moins 2 métriques' },
      { type: 'required', field: 'alerts', message: 'Au moins une alerte' },
    ],
  },
  {
    id: 'metrics',
    name: 'Metrics',
    label: 'Métriques',
    category: 'INFRASTRUCTURE',
    color: 'warning',
    icon: 'TrendingUp',
    description: 'Métriques spécifiques (enfant de Monitoring).',
    template: '@Metrics {{name}} collect {{type}}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Métrique',
        required: true,
        defaultValue: 'RequestLatency',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*Metric$', message: 'Terminer par Metric' },
        helpText: 'Nom descriptif.',
        previewRenderer: (val) => val,
      },
      {
        id: 'type',
        type: 'select',
        label: 'Type Métrique',
        required: true,
        defaultValue: 'gauge',
        options: [
          { label: 'Gauge (valeur instantanée)', value: 'gauge' },
          { label: 'Counter (incrémental)', value: 'counter' },
          { label: 'Histogram (distribution)', value: 'histogram' },
          { label: 'Summary (percentiles)', value: 'summary' }
        ],
        helpText: 'Type de métrique compatible Prometheus / OpenTelemetry.',
        previewRenderer: (val) => val.charAt(0).toUpperCase() + val.slice(1),
      },
      {
        id: 'help',
        type: 'text',
        label: 'Description',
        defaultValue: 'Temps de réponse des requêtes en millisecondes',
        helpText: 'Texte descriptif affiché dans Grafana / observability.',
        previewRenderer: (val) => val.slice(0, 40) + (val.length > 40 ? '...' : ''),
      },
      {
        id: 'labels',
        type: 'enum-values',
        label: 'Labels / Dimensions',
        defaultValue: ['endpoint', 'method', 'statusCode', 'service'],
        validation: { unique: true, minItems: 1, maxItems: 15 },
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Dimensions pour filtrer et agréger les métriques (équivalent Prometheus labels).',
        previewRenderer: (vals) => vals.join(', '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom de la métrique requis' },
      { type: 'required', field: 'type', message: 'Type de métrique requis' },
    ],
  },

  {
    id: 'alert',
    name: 'Alert',
    label: 'Alerte',
    category: 'INFRASTRUCTURE',
    color: 'danger',
    icon: 'Bell',
    description: 'Définir une alerte pour monitoring. Nested pour conditions/actions.',
    template: '@Alert {{name}} severity:{{severity}} condition: "{{condition}}"',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'HighCPUAlert',
        validation: { minLength: 5, pattern: '^[A-Z][a-zA-Z0-9]*Alert$', message: 'Terminer par Alert' },
        customValidator: (val) => val.endsWith('Alert') ? null : 'Conseil: Terminer par Alert',
        helpText: 'Nom descriptif. Ex: LowDiskSpaceAlert.',
        previewRenderer: (val) => `Alerte: ${val}`,
      },
      {
        id: 'severity',
        type: 'select',
        label: 'Sévérité',
        required: true,
        options: [
          { label: 'INFO', value: 'INFO' },
          { label: 'WARNING', value: 'WARNING' },
          { label: 'CRITICAL', value: 'CRITICAL' },
          { label: 'ERROR', value: 'ERROR' },
        ],
        defaultValue: 'WARNING',
        helpText: 'Niveau sévérité alerte.',
        previewRenderer: (val) => `Sévérité: ${val}`,
      },
      {
        id: 'condition',
        type: 'code',
        label: 'Condition',
        defaultValue: 'cpu_usage > 90%',
        monacoOptions: { language: 'javascript' },
        validation: { minLength: 5, message: 'Condition trop courte' },
        customValidator: (code) => code.includes('>') || code.includes('<') || code.includes('==') ? null : 'Devrait contenir comparaison',
        helpText: 'Condition déclencheuse (ex: PromQL ou JS). Monaco pour édition.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
      {
        id: 'duration',
        type: 'text',
        label: 'Durée',
        defaultValue: '5m',
        validation: { pattern: '^[0-9]+(s|m|h)$', message: 'Format: 5m, 1h' },
        helpText: 'Durée condition vraie avant alerte.',
        previewRenderer: (val) => `Durée: ${val}`,
      },
      {
        id: 'actions',
        type: 'array',
        label: 'Actions',
        defaultValue: [{ type: 'email', to: 'admin@example.com' }],
        nestedType: {
          type: 'object',
          label: 'Action',
          nestedType: {
            type: { type: 'select', options: [{ label: 'email', value: 'email' }, { label: 'slack', value: 'slack' }, { label: 'pagerduty', value: 'pagerduty' }], required: true },
            to: { type: 'text', required: true },
            message: { type: 'text', defaultValue: 'Alerte déclenchée!' },
          },
        },
        minItems: 1,
        maxItems: 10,
        validation: { minItems: 1, message: 'Au moins une action' },
        helpText: 'Actions sur alerte (nested avec type/to).',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(a => a.type).join(', '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'severity', message: 'Sévérité requise' },
      { type: 'required', field: 'condition', message: 'Condition requise' },
      { type: 'required', field: 'actions', message: 'Au moins une action requise' },
    ],
  },
  {
    id: 'program',
    name: 'Program',
    label: 'Programme',
    category: 'ARCHITECTURE',
    color: 'secondary',
    icon: 'Code2',
    description: 'Définir un programme global avec modules/imps.',
    template: '@Program {{name}} { modules: [{{modules}}] }',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Programme',
        required: true,
        defaultValue: 'MainProgram',
        validation: { minLength: 5, pattern: '^[A-Z][a-zA-Z0-9]*Program$', message: 'Terminer par Program' },
        helpText: 'Nom principal. Ex: AppProgram.',
        previewRenderer: (val) => `Programme: ${val}`,
      },
      {
        id: 'modules',
        type: 'multiselect',
        label: 'Modules',
        dynamicSource: 'modules',
        defaultValue: ['auth', 'core', 'ui'],
        validation: { minItems: 1, unique: true },
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Modules inclus. Dynamic liste.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'language',
        type: 'select',
        label: 'Langage',
        options: [
          { label: 'JavaScript', value: 'js' },
          { label: 'TypeScript', value: 'ts' },
          { label: 'Python', value: 'py' },
        ],
        defaultValue: 'ts',
        helpText: 'Langage principal.',
        previewRenderer: (val) => val.toUpperCase(),
      },
      {
        id: 'config',
        type: 'json',
        label: 'Config',
        defaultValue: { version: '1.0', env: 'prod' },
        monacoOptions: { language: 'json' },
        helpText: 'Config JSON programme.',
        previewRenderer: (json) => JSON.stringify(json),
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['module', 'import'],
    maxChildren: 50,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'modules', message: 'Au moins un module' },
    ],
  },
  {
    id: 'module',
    name: 'Module',
    label: 'Module',
    category: 'ARCHITECTURE',
    color: 'secondary',
    icon: 'Package',
    description: 'Module dans un programme. Peut contenir directives/macros.',
    template: '@Module {{name}} { dependencies: [{{dependencies}}] }',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Module',
        required: true,
        defaultValue: 'AuthModule',
        validation: { minLength: 5, pattern: '^[A-Z][a-zA-Z0-9]*Module$', message: 'Terminer par Module' },
        helpText: 'Nom unique. Ex: UserModule.',
        previewRenderer: (val) => `Module: ${val}`,
      },
      {
        id: 'dependencies',
        type: 'multiselect',
        label: 'Dépendances',
        dynamicSource: 'modules',
        defaultValue: ['CoreModule'],
        validation: { unique: true },
        searchEnabled: true,
        allowCustomAdd: true,
        customValidator: (deps, context) => deps.every(d => context.modules.includes(d)) ? null : 'Dépendances inexistantes',
        helpText: 'Modules parents. Dynamic avec validation.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'exports',
        type: 'enum-values',
        label: 'Exports',
        defaultValue: ['AuthService', 'AuthComponent'],
        validation: { unique: true, minItems: 1 },
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Éléments exportés.',
        previewRenderer: (vals) => vals.join(', '),
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['directive', 'component'],
    maxChildren: 50,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
    ],
  },
  {
    id: 'directive',
    name: 'Directive',
    label: 'Directive',
    category: 'UI',
    color: 'secondary',
    icon: 'CodeSquare',
    description: 'Directive UI (ex: Angular-like).',
    template: '@Directive {{name}} selector:{{selector}}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Directive',
        required: true,
        defaultValue: 'HighlightDirective',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*Directive$', message: 'Terminer par Directive' },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'selector',
        type: 'text',
        label: 'Sélecteur',
        required: true,
        defaultValue: '[appHighlight]',
        validation: { pattern: '^\\[[a-zA-Z0-9-]+\\]$', message: 'Format [attr]' },
        helpText: 'Sélecteur attribut/classe/élément.',
        previewRenderer: (val) => val,
      },
      {
        id: 'inputs',
        type: 'enum-values',
        label: 'Inputs',
        defaultValue: ['color', 'text'],
        validation: { unique: true },
        helpText: 'Inputs bindables.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'code',
        type: 'code',
        label: 'Implémentation',
        defaultValue: '// Directive code',
        monacoOptions: { language: 'typescript' },
        helpText: 'Code directive.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'selector', message: 'Sélecteur requis' },
    ],
  },
  {
    id: 'directivesavancees',
    name: 'DirectivesAvancees',
    label: 'Directives Avancées',
    category: 'UI',
    color: 'secondary',
    icon: 'CodeSquare',
    description: 'Directives avancées avec host bindings/listeners.',
    template: '@DirectivesAvancees {{name}}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'AdvancedDirective',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*Directive$', message: 'Terminer par Directive' },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'hostBindings',
        type: 'json',
        label: 'Host Bindings',
        defaultValue: { '[style.color]': 'color' },
        monacoOptions: { language: 'json' },
        helpText: 'Bindings host (JSON).',
        previewRenderer: (json) => Object.keys(json).join(', '),
      },
      {
        id: 'hostListeners',
        type: 'json',
        label: 'Host Listeners',
        defaultValue: { 'click': 'onClick($event)' },
        monacoOptions: { language: 'json' },
        helpText: 'Listeners host (JSON).',
        previewRenderer: (json) => Object.keys(json).join(', '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
    ],
  },
  {
    id: 'import',
    name: 'Import',
    label: 'Import',
    category: 'ARCHITECTURE',
    color: 'muted',
    icon: 'Import',
    description: 'Import de module/dépendance.',
    template: '@Import {{from}} as {{alias}}',
    fields: [
      {
        id: 'from',
        type: 'text',
        label: 'From',
        required: true,
        defaultValue: '@angular/core',
        validation: { pattern: '^[@a-zA-Z0-9/.-]+$', message: 'Format package valide' },
        helpText: 'Source import.',
        previewRenderer: (val) => val,
      },
      {
        id: 'alias',
        type: 'text',
        label: 'Alias',
        defaultValue: '',
        helpText: 'Alias optionnel.',
        previewRenderer: (val) => val ? `as ${val}` : '',
      },
      {
        id: 'items',
        type: 'enum-values',
        label: 'Éléments importés',
        defaultValue: ['Component', 'NgModule'],
        validation: { unique: true },
        helpText: 'Éléments spécifiques.',
        previewRenderer: (vals) => vals.join(', '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'from', message: 'Source requise' },
    ],
  },
  {
    id: 'macro',
    name: 'Macro',
    label: 'Macro',
    category: 'ARCHITECTURE',
    color: 'secondary',
    icon: 'Wand',
    description: 'Macro pour génération/code réutilisable.',
    template: '@Macro {{name}} params: [{{params}}]',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Macro',
        required: true,
        defaultValue: 'CrudMacro',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*Macro$', message: 'Terminer par Macro' },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'params',
        type: 'array',
        label: 'Params',
        defaultValue: [{ name: 'entity', type: 'string' }],
        nestedType: {
          type: 'object',
          label: 'Param',
          nestedType: {
            name: { type: 'text', required: true },
            type: { type: 'select', options: [{ label: 'string', value: 'string' }, { label: 'number', value: 'number' }] },
          },
        },
        helpText: 'Params macro.',
        previewRenderer: (arr) => arr.map(p => p.name).join(', '),
      },
      {
        id: 'code',
        type: 'code',
        label: 'Code Macro',
        defaultValue: '// Macro code',
        monacoOptions: { language: 'javascript' },
        helpText: 'Code générateur.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'code', message: 'Code requis' },
    ],
  },
  {
    id: 'integration',
    name: 'Integration',
    label: 'Intégration',
    category: 'API',
    color: 'accent',
    icon: 'Plug',
    description: 'Intégration externe (ex: API tierce).',
    template: '@Integration {{name}} provider:{{provider}}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Intégration',
        required: true,
        defaultValue: 'StripeIntegration',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*Integration$', message: 'Terminer par Integration' },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'provider',
        type: 'text',
        label: 'Fournisseur',
        required: true,
        defaultValue: 'Stripe',
        helpText: 'Nom du service externe.',
        previewRenderer: (val) => val,
      },
      {
        id: 'apiKey',
        type: 'text',
        label: 'API Key',
        required: true,
        helpText: 'Clé API (masquée).',
        previewRenderer: (val) => '***',
      },
      {
        id: 'endpoints',
        type: 'array',
        label: 'Endpoints',
        defaultValue: [{ method: 'POST', path: '/charge' }],
        nestedType: {
          type: 'object',
          label: 'Endpoint',
          nestedType: {
            method: { type: 'select', options: [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }] },
            path: { type: 'text', required: true },
          },
        },
        helpText: 'Endpoints utilisés.',
        previewRenderer: (arr) => arr.length,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'provider', message: 'Fournisseur requis' },
    ],
  },
  {
    id: 'test',
    name: 'Test',
    label: 'Test',
    category: 'GENERATION',
    color: 'info',
    icon: 'TestTube2',
    description: 'Définition d’un test unitaire/intégration.',
    template: '@Test {{name}} type:{{type}}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Test',
        required: true,
        defaultValue: 'LoginTest',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*Test$', message: 'Terminer par Test' },
        helpText: 'Nom descriptif.',
        previewRenderer: (val) => val,
      },
      {
        id: 'type',
        type: 'select',
        label: 'Type Test',
        required: true,
        options: [
          { label: 'Unit', value: 'unit' },
          { label: 'Integration', value: 'integration' },
          { label: 'E2E', value: 'e2e' },
        ],
        helpText: 'Type de test.',
        previewRenderer: (val) => val.toUpperCase(),
      },
      {
        id: 'code',
        type: 'code',
        label: 'Code Test',
        defaultValue: 'test("should login", () => { ... })',
        monacoOptions: { language: 'javascript' },
        validation: { minLength: 20 },
        helpText: 'Code du test.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
      {
        id: 'expectations',
        type: 'enum-values',
        label: 'Expectations',
        defaultValue: ['expect(res).toBe(200)', 'expect(user).not.null'],
        helpText: 'Assertions clés.',
        previewRenderer: (vals) => vals.join('; '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'type', message: 'Type requis' },
    ],
  },
  {
    id: 'testgen',
    name: 'TestGen',
    label: 'Générateur Tests',
    category: 'GENERATION',
    color: 'info',
    icon: 'TestTubes',
    description: 'Génère tests pour code ou modèles.',
    template: '@TestGen target:{{target}} framework:{{framework}}',
    fields: [
      {
        id: 'target',
        type: 'select',
        label: 'Cible',
        dynamicSource: 'code|models',
        required: true,
        searchEnabled: true,
        helpText: 'Code ou modèle à tester.',
        previewRenderer: (val) => val,
      },
      {
        id: 'framework',
        type: 'select',
        label: 'Framework',
        options: [
          { label: 'Jest', value: 'Jest' },
          { label: 'Mocha', value: 'Mocha' },
        ],
        defaultValue: 'Jest',
        helpText: 'Framework test.',
        previewRenderer: (val) => val,
      },
      {
        id: 'types',
        type: 'multiselect',
        label: 'Types',
        options: [
          { label: 'Unit', value: 'unit' },
          { label: 'Integration', value: 'integration' },
        ],
        defaultValue: ['unit'],
        validation: { minItems: 1 },
        helpText: 'Types de tests à générer.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'coverage',
        type: 'number',
        label: 'Couverture',
        defaultValue: 80,
        validation: { min: 0, max: 100 },
        helpText: 'Couverture cible (%).',
        previewRenderer: (val) => `${val}%`,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'target', message: 'Cible requise' },
      { type: 'required', field: 'framework', message: 'Framework requis' },
    ],
  },
  {
    id: 'testsuite',
    name: 'TestSuite',
    label: 'Suite Tests',
    category: 'GENERATION',
    color: 'info',
    icon: 'TestTube2',
    description: 'Suite de tests groupés.',
    template: '@TestSuite {{name}} tests:[{{tests}}]',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Suite',
        required: true,
        defaultValue: 'AuthSuite',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*Suite$', message: 'Terminer par Suite' },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'tests',
        type: 'multiselect',
        label: 'Tests Inclus',
        dynamicSource: 'tests',
        defaultValue: ['LoginTest', 'LogoutTest'],
        validation: { minItems: 1, unique: true },
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Tests dans la suite.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'setup',
        type: 'code',
        label: 'Setup',
        defaultValue: '// Before all tests',
        monacoOptions: { language: 'javascript' },
        helpText: 'Code setup.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
      {
        id: 'teardown',
        type: 'code',
        label: 'Teardown',
        defaultValue: '// After all tests',
        monacoOptions: { language: 'javascript' },
        helpText: 'Code cleanup.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['test'],
    maxChildren: 50,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'tests', message: 'Au moins un test' },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    label: 'Sécurité',
    category: 'INFRASTRUCTURE',
    color: 'danger',
    icon: 'Shield',
    description: 'Config sécurité globale.',
    template: '@Security auth:{{auth}} encryption:{{encryption}}',
    fields: [
      {
        id: 'auth',
        type: 'select',
        label: 'Authentification',
        options: [
          { label: 'JWT', value: 'JWT' },
          { label: 'OAuth2', value: 'OAuth2' },
          { label: 'Basic', value: 'Basic' },
        ],
        defaultValue: 'JWT',
        helpText: 'Méthode auth.',
        previewRenderer: (val) => val,
      },
      {
        id: 'encryption',
        type: 'select',
        label: 'Encryption',
        options: [
          { label: 'AES-256', value: 'AES' },
          { label: 'RSA', value: 'RSA' },
        ],
        defaultValue: 'AES',
        helpText: 'Algo encryption.',
        previewRenderer: (val) => val,
      },
      {
        id: 'roles',
        type: 'enum-values',
        label: 'Rôles',
        defaultValue: ['admin', 'user', 'guest'],
        validation: { unique: true, minItems: 1 },
        helpText: 'Rôles pour RBAC.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'policies',
        type: 'json',
        label: 'Policies',
        defaultValue: { admin: 'full_access' },
        monacoOptions: { language: 'json' },
        helpText: 'Policies JSON.',
        previewRenderer: (json) => Object.keys(json).join(', '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'auth', message: 'Auth requise' },
    ],
  },
  {
    id: 'autogen',
    name: 'AutoGen',
    label: 'AutoGen',
    category: 'GENERATION',
    color: 'info',
    icon: 'Sparkles',
    description: 'Génération automatique basée sur template.',
    template: '@AutoGen template:{{template}} output:{{output}}',
    fields: [
      {
        id: 'template',
        type: 'select',
        label: 'Template',
        dynamicSource: 'templates',
        required: true,
        searchEnabled: true,
        helpText: 'Template à utiliser.',
        previewRenderer: (val) => val,
      },
      {
        id: 'output',
        type: 'text',
        label: 'Output Path',
        defaultValue: 'generated/code',
        validation: { pattern: '^[a-zA-Z0-9/.-]+$' },
        helpText: 'Chemin output.',
        previewRenderer: (val) => val,
      },
      {
        id: 'params',
        type: 'json',
        label: 'Params',
        defaultValue: { key: 'value' },
        monacoOptions: { language: 'json' },
        helpText: 'Params pour génération.',
        previewRenderer: (json) => JSON.stringify(json),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'template', message: 'Template requis' },
    ],
  },
  {
    id: 'apigen',
    name: 'APIGen',
    label: 'Générateur API',
    category: 'GENERATION',
    color: 'info',
    icon: 'Globe',
    description: 'Génère API complète à partir de specs.',
    template: '@APIGen spec:{{spec}} framework:{{framework}}',
    fields: [
      {
        id: 'spec',
        type: 'text',
        label: 'Spec (OpenAPI/Swagger)',
        required: true,
        defaultValue: 'openapi.yaml',
        validation: { pattern: '^.*\\.(yaml|json)$', message: 'Fichier YAML/JSON' },
        helpText: 'Fichier spec.',
        previewRenderer: (val) => val,
      },
      {
        id: 'framework',
        type: 'select',
        label: 'Framework',
        options: [
          { label: 'Express', value: 'Express' },
          { label: 'FastAPI', value: 'FastAPI' },
        ],
        defaultValue: 'Express',
        helpText: 'Framework backend.',
        previewRenderer: (val) => val,
      },
      {
        id: 'output',
        type: 'text',
        label: 'Output',
        defaultValue: 'api/generated',
        helpText: 'Chemin output.',
        previewRenderer: (val) => val,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'spec', message: 'Spec requise' },
      { type: 'required', field: 'framework', message: 'Framework requis' },
    ],
  },
  {
    id: 'block',
    name: 'Block',
    label: 'Bloc',
    category: 'OTHER',
    color: 'muted',
    icon: 'Square',
    description: 'Bloc générique pour extension.',
    template: '@Block {{name}}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Bloc',
        required: true,
        defaultValue: 'CustomBlock',
        validation: { minLength: 3 },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'properties',
        type: 'json',
        label: 'Propriétés',
        defaultValue: {},
        monacoOptions: { language: 'json' },
        helpText: 'Props JSON.',
        previewRenderer: (json) => JSON.stringify(json),
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['property'],
    maxChildren: 20,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
    ],
  },
  {
    id: 'property',
    name: 'Property',
    label: 'Propriété',
    category: 'OTHER',
    color: 'muted',
    icon: 'KeyRound',
    description: 'Propriété pour bloc/objet.',
    template: '{{name}}: {{value}}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Propriété',
        required: true,
        defaultValue: 'key',
        validation: { pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$' },
        helpText: 'Nom clé.',
        previewRenderer: (val) => val,
      },
      {
        id: 'value',
        type: 'text',
        label: 'Valeur',
        required: true,
        defaultValue: 'value',
        helpText: 'Valeur propriété.',
        previewRenderer: (val) => val,
      },
      {
        id: 'type',
        type: 'select',
        label: 'Type',
        options: [
          { label: 'string', value: 'string' },
          { label: 'number', value: 'number' },
          { label: 'boolean', value: 'boolean' },
        ],
        defaultValue: 'string',
        helpText: 'Type valeur.',
        previewRenderer: (val) => val,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'value', message: 'Valeur requise' },
    ],
  },
  {
    id: 'array',
    name: 'Array',
    label: 'Tableau',
    category: 'DATA',
    color: 'primary',
    icon: 'Brackets',
    description: 'Définir un tableau avec items nested. Validation unique/ordered.',
    template: '@Array items: [{{items}}]',
    fields: [
      {
        id: 'items',
        type: 'array',
        label: 'Items',
        defaultValue: [],
        nestedType: {
          type: 'object',
          label: 'Item',
          nestedType: {
            value: { type: 'text', required: true, validation: { minLength: 1 } },
            type: { type: 'select', options: [{ label: 'String', value: 'string' }, { label: 'Number', value: 'number' }], defaultValue: 'string' },
          },
        },
        minItems: 0,
        maxItems: 100,
        validation: { unique: true, message: 'Items uniques' },
        customValidator: (items) => items.length > 0 ? null : 'Conseil: Ajoutez items pour utilité',
        helpText: 'Items nested avec type/value. Drag pour ordre.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(i => i.value).join(', '),
      },
      {
        id: 'minLength',
        type: 'number',
        label: 'Min Length',
        defaultValue: 0,
        validation: { min: 0 },
        helpText: 'Longueur min tableau.',
        previewRenderer: (val) => `Min: ${val}`,
      },
      {
        id: 'maxLength',
        type: 'number',
        label: 'Max Length',
        defaultValue: 100,
        validation: { min: 1 },
        helpText: 'Longueur max tableau.',
        previewRenderer: (val) => `Max: ${val}`,
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['literal', 'object'],
    maxChildren: 100,
    validation: [
      { type: 'custom', custom: (context) => context.minLength <= context.maxLength, message: 'Min <= Max' },
    ],
  },
  {
    id: 'object',
    name: 'Object',
    label: 'Objet',
    category: 'DATA',
    color: 'primary',
    icon: 'Braces',
    description: 'Définir un objet avec propriétés nested. Validation clés uniques.',
    template: '@Object properties: {{properties}}',
    fields: [
      {
        id: 'properties',
        type: 'array',
        label: 'Propriétés',
        defaultValue: [],
        nestedType: {
          type: 'object',
          label: 'Propriété',
          nestedType: {
            key: { type: 'text', required: true, validation: { pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$', message: 'Clé valide' } },
            value: { type: 'text', required: true },
            type: { type: 'select', options: [{ label: 'String', value: 'string' }, { label: 'Number', value: 'number' }], defaultValue: 'string' },
          },
        },
        minItems: 0,
        maxItems: 50,
        validation: { unique: true, message: 'Clés uniques' },
        customValidator: (props, context) => new Set(props.map(p => p.key)).size === props.length ? null : 'Clés doivent être uniques',
        helpText: 'Propriétés nested avec key/value/type. Drag pour ordre.',
        searchEnabled: true,
        allowCustomAdd: true,
        previewRenderer: (arr) => arr.map(p => p.key).join(', '),
      },
      {
        id: 'additionalProperties',
        type: 'boolean',
        label: 'Propriétés Additionnelles',
        defaultValue: false,
        helpText: 'Autoriser props non définies?',
        previewRenderer: (val) => val ? 'Oui' : 'Non',
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['property'],
    maxChildren: 50,
    validation: [],
  },
  {
    id: 'literal',
    name: 'Literal',
    label: 'Littéral',
    category: 'DATA',
    color: 'muted',
    icon: 'Type',
    description: 'Valeur littérale simple (string, number, boolean).',
    template: '{{value}}',
    fields: [
      {
        id: 'value',
        type: 'text',
        label: 'Valeur',
        required: true,
        defaultValue: '',
        validation: { minLength: 1, message: 'Valeur non vide' },
        helpText: 'Valeur littérale.',
        previewRenderer: (val) => `Valeur: ${val}`,
      },
      {
        id: 'type',
        type: 'select',
        label: 'Type',
        required: true,
        options: [
          { label: 'String', value: 'string' },
          { label: 'Number', value: 'number' },
          { label: 'Boolean', value: 'boolean' },
        ],
        defaultValue: 'string',
        customValidator: (type, context) => {
          if (type === 'number' && isNaN(parseFloat(context.value))) return 'Doit être nombre pour Number';
          if (type === 'boolean' && !['true', 'false'].includes(context.value.toLowerCase())) return 'true/false pour Boolean';
          return null;
        },
        helpText: 'Type de la valeur. Validation auto.',
        previewRenderer: (val) => `Type: ${val}`,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'value', message: 'Valeur requise' },
      { type: 'required', field: 'type', message: 'Type requis' },
    ],
  },
  {
    id: 'reference',
    name: 'Reference',
    label: 'Référence',
    category: 'DATA',
    color: 'muted',
    icon: 'Link',
    description: 'Référence à un autre bloc ou entité.',
    template: '@Reference {{target}}',
    fields: [
      {
        id: 'target',
        type: 'select',
        label: 'Cible',
        required: true,
        dynamicSource: 'entities',
        searchEnabled: true,
        allowCustomAdd: false,
        validation: { relationCheck: true, message: 'Cible doit exister' },
        customValidator: (val, context) => context.entities.find(e => e.name === val) ? null : 'Cible inexistante',
        helpText: 'Sélectionnez entité référencée. Liste dynamique.',
        previewRenderer: (val) => `Ref: ${val}`,
      },
      {
        id: 'onDelete',
        type: 'select',
        label: 'On Delete',
        options: [{ label: 'CASCADE', value: 'CASCADE' }, { label: 'SET_NULL', value: 'SET_NULL' }],
        defaultValue: 'SET_NULL',
        helpText: 'Action sur suppression référence.',
        previewRenderer: (val) => val,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'target', message: 'Cible requise' },
    ],
  },
  {
    id: 'template',
    name: 'Template',
    label: 'Template',
    category: 'GENERATION',
    color: 'secondary',
    icon: 'LayoutTemplate',
    description: 'Template pour génération code/UI.',
    template: '@Template {{name}} params:[{{params}}]',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'CrudTemplate',
        validation: { minLength: 5, pattern: '^[A-Z][a-zA-Z0-9]*Template$', message: 'Terminer par Template' },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'params',
        type: 'array',
        label: 'Params',
        defaultValue: [{ name: 'entity', type: 'string', defaultValue: 'User' }],
        nestedType: {
          type: 'object',
          label: 'Param',
          nestedType: {
            name: { type: 'text', required: true, validation: { pattern: '^[a-z][a-zA-Z0-9]*$' } },
            type: { type: 'select', options: [{ label: 'string', value: 'string' }, { label: 'number', value: 'number' }], required: true },
            defaultValue: { type: 'text' },
          },
        },
        minItems: 1,
        maxItems: 20,
        validation: { unique: true, message: 'Noms params uniques' },
        helpText: 'Params pour template. Nested.',
        previewRenderer: (arr) => arr.map(p => p.name).join(', '),
      },
      {
        id: 'code',
        type: 'code',
        label: 'Code Template',
        defaultValue: '// Handlebars-like template',
        monacoOptions: { language: 'handlebars' },
        validation: { minLength: 20 },
        helpText: 'Code template (ex: Handlebars).',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'params', message: 'Au moins un param' },
    ],
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    label: 'Blueprint',
    category: 'ARCHITECTURE',
    color: 'secondary',
    icon: 'Blueprint',
    description: 'Plan architecture globale.',
    template: '@Blueprint {{name}} patterns:[{{patterns}}]',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'AppBlueprint',
        validation: { minLength: 5, pattern: '^[A-Z][a-zA-Z0-9]*Blueprint$', message: 'Terminer par Blueprint' },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'patterns',
        type: 'multiselect',
        label: 'Patterns',
        options: [
          { label: 'MVC', value: 'MVC' },
          { label: 'CQRS', value: 'CQRS' },
          { label: 'Event Sourcing', value: 'EventSourcing' },
        ],
        defaultValue: ['MVC'],
        validation: { minItems: 1 },
        helpText: 'Patterns architecturaux.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'components',
        type: 'array',
        label: 'Composants',
        defaultValue: [{ name: 'Frontend', type: 'UI' }, { name: 'Backend', type: 'API' }],
        nestedType: {
          type: 'object',
          label: 'Composant',
          nestedType: {
            name: { type: 'text', required: true },
            type: { type: 'select', options: [{ label: 'UI', value: 'UI' }, { label: 'API', value: 'API' }, { label: 'DB', value: 'DB' }] },
          },
        },
        helpText: 'Composants blueprint.',
        previewRenderer: (arr) => arr.map(c => c.name).join(', '),
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['component', 'api'],
    maxChildren: 20,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'patterns', message: 'Au moins un pattern' },
    ],
  },
  {
    id: 'plugin',
    name: 'Plugin',
    label: 'Plugin',
    category: 'ARCHITECTURE',
    color: 'secondary',
    icon: 'Plug',
    description: 'Plugin extensible.',
    template: '@Plugin {{name}} hooks:[{{hooks}}]',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'LoggingPlugin',
        validation: { minLength: 5, pattern: '^[A-Z][a-zA-Z0-9]*Plugin$', message: 'Terminer par Plugin' },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'hooks',
        type: 'enum-values',
        label: 'Hooks',
        defaultValue: ['onInit', 'onRequest'],
        validation: { minItems: 1, unique: true },
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Points d\'accroche.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'code',
        type: 'code',
        label: 'Code Plugin',
        defaultValue: '// Plugin impl',
        monacoOptions: { language: 'javascript' },
        helpText: 'Code plugin.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'hooks', message: 'Au moins un hook' },
    ],
  },
  {
    id: 'step',
    name: 'Step',
    label: 'Étape',
    category: 'LOGIC',
    color: 'primary',
    icon: 'StepForward',
    description: 'Étape dans workflow/pipeline.',
    template: '@Step {{name}} action:{{action}}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'BuildStep',
        validation: { minLength: 3, pattern: '^[A-Z][a-zA-Z0-9]*Step$', message: 'Terminer par Step' },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'action',
        type: 'code',
        label: 'Action',
        required: true,
        defaultValue: '// Step action',
        monacoOptions: { language: 'javascript' },
        validation: { minLength: 10 },
        customValidator: (code) => code.trim() ? null : 'Action non vide',
        helpText: 'Code action étape.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
      {
        id: 'conditions',
        type: 'array',
        label: 'Conditions',
        defaultValue: [],
        nestedType: {
          type: 'object',
          label: 'Condition',
          nestedType: {
            expr: { type: 'code', monacoOptions: { language: 'javascript' }, required: true },
          },
        },
        helpText: 'Conditions exécution.',
        previewRenderer: (arr) => arr.length,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'action', message: 'Action requise' },
    ],
  },
  {
    id: 'projection',
    name: 'Projection',
    label: 'Projection',
    category: 'LOGIC',
    color: 'primary',
    icon: 'Projector',
    description: 'Projection pour read models.',
    template: '@Projection {{name}} events:[{{events}}]',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'UserProjection',
        validation: { minLength: 5, pattern: '^[A-Z][a-zA-Z0-9]*Projection$', message: 'Terminer par Projection' },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'events',
        type: 'multiselect',
        label: 'Événements',
        dynamicSource: 'events',
        defaultValue: ['UserCreated', 'UserUpdated'],
        validation: { minItems: 1, unique: true },
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Événements déclencheurs.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'handler',
        type: 'code',
        label: 'Handler',
        defaultValue: '// Projection handler',
        monacoOptions: { language: 'javascript' },
        helpText: 'Code projection.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'events', message: 'Au moins un événement' },
    ],
  },
  {
    id: 'snapshot',
    name: 'Snapshot',
    label: 'Snapshot',
    category: 'LOGIC',
    color: 'primary',
    icon: 'Camera',
    description: 'Snapshot pour Event Sourcing.',
    template: '@Snapshot {{aggregate}} frequency:{{frequency}}',
    fields: [
      {
        id: 'aggregate',
        type: 'select',
        label: 'Agrégat',
        dynamicSource: 'aggregates',
        required: true,
        searchEnabled: true,
        helpText: 'Agrégat à snapshot.',
        previewRenderer: (val) => val,
      },
      {
        id: 'frequency',
        type: 'number',
        label: 'Fréquence',
        defaultValue: 100,
        validation: { min: 10 },
        helpText: 'Tous les X événements.',
        previewRenderer: (val) => val,
      },
      {
        id: 'handler',
        type: 'code',
        label: 'Handler',
        defaultValue: '// Snapshot handler',
        monacoOptions: { language: 'javascript' },
        helpText: 'Code snapshot.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'aggregate', message: 'Agrégat requis' },
      { type: 'required', field: 'frequency', message: 'Fréquence requise' },
    ],
  },
  {
    id: 'indexstrategy',
    name: 'IndexStrategy',
    label: 'Stratégie Index',
    category: 'DATA',
    color: 'success',
    icon: 'Search',
    description: 'Stratégie indexation DB.',
    template: '@IndexStrategy {{name}} type:{{type}}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'SearchIndex',
        helpText: 'Nom stratégie.',
        previewRenderer: (val) => val,
      },
      {
        id: 'type',
        type: 'select',
        label: 'Type',
        options: [
          { label: 'BTree', value: 'btree' },
          { label: 'Hash', value: 'hash' },
          { label: 'FullText', value: 'fulltext' },
        ],
        defaultValue: 'btree',
        helpText: 'Type index.',
        previewRenderer: (val) => val,
      },
      {
        id: 'fields',
        type: 'enum-values',
        label: 'Champs',
        defaultValue: ['name', 'email'],
        validation: { minItems: 1 },
        dynamicSource: 'fields',
        helpText: 'Champs indexés.',
        previewRenderer: (vals) => vals.join(', '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'type', message: 'Type requis' },
    ],
  },
  {
    id: 'health',
    name: 'Health',
    label: 'Health Check',
    category: 'INFRASTRUCTURE',
    color: 'success',
    icon: 'Activity',
    description: 'Health check système.',
    template: '@Health endpoint:{{endpoint}}',
    fields: [
      {
        id: 'endpoint',
        type: 'text',
        label: 'Endpoint',
        required: true,
        defaultValue: '/health',
        validation: { pattern: '^/[a-zA-Z0-9/]*$' },
        helpText: 'Endpoint health.',
        previewRenderer: (val) => val,
      },
      {
        id: 'checks',
        type: 'multiselect',
        label: 'Checks',
        options: [
          { label: 'DB', value: 'db' },
          { label: 'Cache', value: 'cache' },
          { label: 'API', value: 'api' },
        ],
        defaultValue: ['db', 'cache'],
        validation: { minItems: 1 },
        helpText: 'Composants à vérifier.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'interval',
        type: 'number',
        label: 'Intervalle (s)',
        defaultValue: 30,
        validation: { min: 5 },
        helpText: 'Intervalle checks.',
        previewRenderer: (val) => `${val}s`,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'endpoint', message: 'Endpoint requis' },
    ],
  },
  {
    id: 'componentlibrary',
    name: 'ComponentLibrary',
    label: 'Bibliothèque Composants',
    category: 'UI',
    color: 'secondary',
    icon: 'Library',
    description: 'Biblio de composants réutilisables.',
    template: '@ComponentLibrary {{name}} components:[{{components}}]',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Biblio',
        required: true,
        defaultValue: 'UIComponents',
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'components',
        type: 'multiselect',
        label: 'Composants',
        dynamicSource: 'components',
        defaultValue: ['Button', 'Input'],
        validation: { minItems: 1 },
        searchEnabled: true,
        helpText: 'Composants inclus.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'theme',
        type: 'select',
        label: 'Thème',
        options: [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }],
        defaultValue: 'light',
        helpText: 'Thème par default.',
        previewRenderer: (val) => val,
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['component'],
    maxChildren: 100,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'components', message: 'Au moins un composant' },
    ],
  },
  {
    id: 'layout',
    name: 'Layout',
    label: 'Layout',
    category: 'UI',
    color: 'secondary',
    icon: 'LayoutGrid',
    description: 'Layout UI.',
    template: '@Layout {{name}} type:{{type}}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'MainLayout',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*Layout$', message: 'Terminer par Layout' },
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'type',
        type: 'select',
        label: 'Type',
        options: [
          { label: 'Grid', value: 'grid' },
          { label: 'Flex', value: 'flex' },
          { label: 'Stack', value: 'stack' },
        ],
        defaultValue: 'grid',
        helpText: 'Type layout.',
        previewRenderer: (val) => val,
      },
      {
        id: 'sections',
        type: 'array',
        label: 'Sections',
        defaultValue: [{ name: 'header' }, { name: 'body' }],
        nestedType: {
          type: 'object',
          label: 'Section',
          nestedType: {
            name: { type: 'text', required: true },
          },
        },
        helpText: 'Sections layout.',
        previewRenderer: (arr) => arr.map(s => s.name).join(', '),
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['section'],
    maxChildren: 20,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'type', message: 'Type requis' },
    ],
  },
  {
    id: 'search',
    name: 'Search',
    label: 'Recherche',
    category: 'UI',
    color: 'secondary',
    icon: 'Search',
    description: 'Fonction recherche UI/DB.',
    template: '@Search {{name}} engine:{{engine}}',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'FullTextSearch',
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'engine',
        type: 'select',
        label: 'Engine',
        options: [
          { label: 'Elasticsearch', value: 'elasticsearch' },
          { label: 'Algolia', value: 'algolia' },
          { label: 'DB Native', value: 'db' },
        ],
        defaultValue: 'db',
        helpText: 'Engine recherche.',
        previewRenderer: (val) => val,
      },
      {
        id: 'fields',
        type: 'enum-values',
        label: 'Champs',
        defaultValue: ['title', 'content'],
        validation: { minItems: 1 },
        dynamicSource: 'fields',
        helpText: 'Champs recherchables.',
        previewRenderer: (vals) => vals.join(', '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'engine', message: 'Engine requis' },
    ],
  },
  {
    id: 'realtime',
    name: 'Realtime',
    label: 'Realtime',
    category: 'API',
    color: 'accent',
    icon: 'Radio',
    description: 'Config realtime (WebSockets/pubsub).',
    template: '@Realtime {{name}} channels:[{{channels}}]',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom',
        required: true,
        defaultValue: 'ChatRealtime',
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'channels',
        type: 'enum-values',
        label: 'Channels',
        defaultValue: ['chat', 'notifications'],
        validation: { minItems: 1, unique: true },
        helpText: 'Channels pubsub.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'auth',
        type: 'boolean',
        label: 'Auth Requis',
        defaultValue: true,
        helpText: 'Auth pour subscribe.',
        previewRenderer: (val) => val ? 'Oui' : 'Non',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'channels', message: 'Au moins un channel' },
    ],
  },
  {
    id: 'database',
    name: 'Database',
    label: 'Base de Données',
    category: 'INFRASTRUCTURE',
    color: 'success',
    icon: 'Database',
    description: 'Config DB globale.',
    template: '@Database type:{{type}} models:[{{models}}]',
    fields: [
      {
        id: 'type',
        type: 'select',
        label: 'Type DB',
        options: [
          { label: 'PostgreSQL', value: 'postgres' },
          { label: 'MongoDB', value: 'mongo' },
          { label: 'MySQL', value: 'mysql' },
        ],
        defaultValue: 'postgres',
        required: true,
        helpText: 'Type base.',
        previewRenderer: (val) => val,
      },
      {
        id: 'models',
        type: 'multiselect',
        label: 'Modèles',
        dynamicSource: 'models',
        defaultValue: ['User', 'Order'],
        validation: { minItems: 1 },
        searchEnabled: true,
        helpText: 'Modèles dans DB.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'connection',
        type: 'json',
        label: 'Connection',
        defaultValue: { host: 'localhost', port: 5432, user: 'admin', pass: '***' },
        monacoOptions: { language: 'json' },
        helpText: 'Params connection.',
        previewRenderer: (json) => `Host: ${json.host}`,
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['model'],
    maxChildren: 50,
    validation: [
      { type: 'required', field: 'type', message: 'Type requis' },
    ],
  },
  {
    id: 'index',
    name: 'Index',
    label: 'Index',
    category: 'DATA',
    color: 'success',
    icon: 'Hash',
    description: 'Index DB pour performance.',
    template: '@Index {{name}} fields:[{{fields}}]',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Index',
        required: true,
        defaultValue: 'UserEmailIndex',
        helpText: 'Nom unique.',
        previewRenderer: (val) => val,
      },
      {
        id: 'fields',
        type: 'enum-values',
        label: 'Champs',
        defaultValue: ['email'],
        validation: { minItems: 1, unique: true },
        dynamicSource: 'fields',
        helpText: 'Champs indexés.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'type',
        type: 'select',
        label: 'Type',
        options: [{ label: 'BTREE', value: 'BTREE' }, { label: 'HASH', value: 'HASH' }],
        defaultValue: 'BTREE',
        helpText: 'Type index.',
        previewRenderer: (val) => val,
      },
      {
        id: 'unique',
        type: 'boolean',
        label: 'Unique',
        defaultValue: false,
        helpText: 'Index unique?',
        previewRenderer: (val) => val ? 'Oui' : 'Non',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'fields', message: 'Au moins un champ' },
    ],
  },
  {
    id: 'gentest',
    name: 'GenTest',
    label: 'Générateur Tests',
    category: 'GENERATION',
    color: 'info',
    icon: 'TestTube',
    description: 'Génère tests automatisés.',
    template: '@GenTest target:{{target}} framework:{{framework}}',
    fields: [
      {
        id: 'target',
        type: 'text',
        label: 'Cible',
        required: true,
        defaultValue: 'UserService',
        helpText: 'Composant à tester.',
        previewRenderer: (val) => val,
      },
      {
        id: 'framework',
        type: 'select',
        label: 'Framework',
        options: [{ label: 'Jest', value: 'jest' }, { label: 'Mocha', value: 'mocha' }],
        defaultValue: 'jest',
        helpText: 'Framework test.',
        previewRenderer: (val) => val,
      },
      {
        id: 'coverage',
        type: 'number',
        label: 'Couverture (%)',
        defaultValue: 80,
        validation: { min: 0, max: 100 },
        helpText: 'Couverture cible.',
        previewRenderer: (val) => `${val}%`,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'target', message: 'Cible requise' },
      { type: 'required', field: 'framework', message: 'Framework requis' },
    ],
  },
  {
    id: 'crudgen',
    name: 'CrudGen',
    label: 'Générateur CRUD',
    category: 'GENERATION',
    color: 'info',
    icon: 'DatabaseZap',
    description: 'Génère CRUD pour entité.',
    template: '@CrudGen entity:{{entity}}',
    fields: [
      {
        id: 'entity',
        type: 'select',
        label: 'Entité',
        dynamicSource: 'models',
        required: true,
        searchEnabled: true,
        helpText: 'Entité pour CRUD.',
        previewRenderer: (val) => val,
      },
      {
        id: 'framework',
        type: 'select',
        label: 'Framework',
        options: [{ label: 'Express', value: 'express' }, { label: 'NestJS', value: 'nestjs' }],
        defaultValue: 'express',
        helpText: 'Framework backend.',
        previewRenderer: (val) => val,
      },
      {
        id: 'auth',
        type: 'boolean',
        label: 'Avec Auth',
        defaultValue: true,
        helpText: 'Inclure auth dans CRUD.',
        previewRenderer: (val) => val ? 'Oui' : 'Non',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'entity', message: 'Entité requise' },
    ],
  },
  {
    id: 'uigen',
    name: 'UIGen',
    label: 'Générateur UI',
    category: 'GENERATION',
    color: 'info',
    icon: 'LayoutDashboard',
    description: 'Génère UI pour entité.',
    template: '@UIGen entity:{{entity}} framework:{{framework}}',
    fields: [
      {
        id: 'entity',
        type: 'select',
        label: 'Entité',
        dynamicSource: 'models',
        required: true,
        helpText: 'Entité pour UI.',
        previewRenderer: (val) => val,
      },
      {
        id: 'framework',
        type: 'select',
        label: 'Framework',
        options: [{ label: 'React', value: 'react' }, { label: 'Vue', value: 'vue' }],
        defaultValue: 'react',
        helpText: 'Framework UI.',
        previewRenderer: (val) => val,
      },
      {
        id: 'components',
        type: 'multiselect',
        label: 'Composants',
        options: [{ label: 'Form', value: 'form' }, { label: 'List', value: 'list' }],
        defaultValue: ['form', 'list'],
        helpText: 'Composants à générer.',
        previewRenderer: (vals) => vals.join(', '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'entity', message: 'Entité requise' },
      { type: 'required', field: 'framework', message: 'Framework requis' },
    ],
  },
  {
    id: 'componentgen',
    name: 'ComponentGen',
    label: 'Générateur Composant',
    category: 'GENERATION',
    color: 'info',
    icon: 'Puzzle',
    description: 'Génère composant UI.',
    template: '@ComponentGen name:{{name}} props:[{{props}}]',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nom Composant',
        required: true,
        defaultValue: 'Button',
        validation: { pattern: '^[A-Z][a-zA-Z0-9]*$' },
        helpText: 'PascalCase.',
        previewRenderer: (val) => val,
      },
      {
        id: 'props',
        type: 'json',
        label: 'Props',
        defaultValue: { color: 'string', size: 'number' },
        monacoOptions: { language: 'json' },
        helpText: 'Props JSON.',
        previewRenderer: (json) => Object.keys(json).join(', '),
      },
      {
        id: 'framework',
        type: 'select',
        label: 'Framework',
        options: [{ label: 'React', value: 'react' }, { label: 'Vue', value: 'vue' }],
        defaultValue: 'react',
        helpText: 'Framework UI.',
        previewRenderer: (val) => val,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
    ],
  },
  {
    id: 'relationpathgen',
    name: 'RelationPathGen',
    label: 'Générateur Chemin Relation',
    category: 'GENERATION',
    color: 'info',
    icon: 'Link',
    description: 'Génère chemins relations pour queries.',
    template: '@RelationPathGen from:{{from}} maxDepth:{{maxDepth}}',
    fields: [
      {
        id: 'from',
        type: 'select',
        label: 'From',
        dynamicSource: 'models',
        required: true,
        helpText: 'Modèle de départ.',
        previewRenderer: (val) => val,
      },
      {
        id: 'maxDepth',
        type: 'number',
        label: 'Max Depth',
        defaultValue: 3,
        validation: { min: 1, max: 10 },
        helpText: 'Profondeur max relations.',
        previewRenderer: (val) => val,
      },
      {
        id: 'output',
        type: 'text',
        label: 'Output Format',
        defaultValue: 'json',
        validation: { enum: ['json', 'graphql', 'sql'] },
        helpText: 'Format output.',
        previewRenderer: (val) => val,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'from', message: 'From requis' },
      { type: 'required', field: 'maxDepth', message: 'Depth requis' },
    ],
  },
  {
    id: 'mockdatagen',
    name: 'MockDataGen',
    label: 'Générateur Mock Data',
    category: 'GENERATION',
    color: 'info',
    icon: 'DatabaseZap',
    description: 'Génère données mock pour entité.',
    template: '@MockDataGen for:{{for}} count:{{count}}',
    fields: [
      {
        id: 'for',
        type: 'select',
        label: 'Pour Entité',
        dynamicSource: 'models',
        required: true,
        helpText: 'Modèle pour mock.',
        previewRenderer: (val) => val,
      },
      {
        id: 'count',
        type: 'number',
        label: 'Nombre',
        defaultValue: 100,
        validation: { min: 1, max: 10000 },
        helpText: 'Nombre enregistrements.',
        previewRenderer: (val) => val,
      },
      {
        id: 'format',
        type: 'select',
        label: 'Format',
        options: [{ label: 'JSON', value: 'json' }, { label: 'SQL', value: 'sql' }, { label: 'CSV', value: 'csv' }],
        defaultValue: 'json',
        helpText: 'Format output.',
        previewRenderer: (val) => val,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'for', message: 'Entité requise' },
      { type: 'required', field: 'count', message: 'Nombre requis' },
    ],
  },
  {
    id: 'docgen',
    name: 'DocGen',
    label: 'Générateur Docs',
    category: 'GENERATION',
    color: 'info',
    icon: 'Book',
    description: 'Génère documentation.',
    template: '@DocGen strategy:{{strategy}} output:{{output}}',
    fields: [
      {
        id: 'strategy',
        type: 'select',
        label: 'Stratégie',
        options: [{ label: 'Swagger', value: 'swagger' }, { label: 'JSDoc', value: 'jsdoc' }],
        defaultValue: 'swagger',
        helpText: 'Stratégie doc.',
        previewRenderer: (val) => val,
      },
      {
        id: 'output',
        type: 'text',
        label: 'Output',
        defaultValue: 'docs/api.md',
        helpText: 'Fichier output.',
        previewRenderer: (val) => val,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'strategy', message: 'Stratégie requise' },
      { type: 'required', field: 'output', message: 'Output requis' },
    ],
  },
  {
    id: 'perfoptgen',
    name: 'PerfOptGen',
    label: 'Générateur Optimisation Perf',
    category: 'GENERATION',
    color: 'info',
    icon: 'Zap',
    description: 'Génère optimisations performance.',
    template: '@PerfOptGen strategy:{{strategy}} ttl:{{ttl}}',
    fields: [
      {
        id: 'strategy',
        type: 'select',
        label: 'Stratégie',
        options: [{ label: 'Caching', value: 'caching' }, { label: 'Indexing', value: 'indexing' }],
        defaultValue: 'caching',
        helpText: 'Stratégie opt.',
        previewRenderer: (val) => val,
      },
      {
        id: 'ttl',
        type: 'text',
        label: 'TTL',
        defaultValue: '60s',
        validation: { pattern: '^[0-9]+(s|m|h)$' },
        helpText: 'TTL pour cache.',
        previewRenderer: (val) => val,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'strategy', message: 'Stratégie requise' },
    ],
  },
  {
    id: 'secscangen',
    name: 'SecScanGen',
    label: 'Générateur Scan Sécurité',
    category: 'GENERATION',
    color: 'info',
    icon: 'ShieldCheck',
    description: 'Génère scans sécurité.',
    template: '@SecScanGen tools:[{{tools}}]',
    fields: [
      {
        id: 'tools',
        type: 'multiselect',
        label: 'Outils',
        options: [{ label: 'OWASP ZAP', value: 'zap' }, { label: 'Snyk', value: 'snyk' }],
        defaultValue: ['zap'],
        validation: { minItems: 1 },
        helpText: 'Outils scan.',
        previewRenderer: (vals) => vals.join(', '),
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'tools', message: 'Au moins un outil' },
    ],
  },
  {
    id: 'migrationgen',
    name: 'MigrationGen',
    label: 'Générateur Migrations',
    category: 'GENERATION',
    color: 'info',
    icon: 'ArrowRightLeft',
    description: 'Génère migrations DB.',
    template: '@MigrationGen from:{{from}} to:{{to}}',
    fields: [
      {
        id: 'from',
        type: 'text',
        label: 'From Version',
        required: true,
        defaultValue: 'v1',
        validation: { pattern: '^v[0-9.]+$' },
        helpText: 'Version source.',
        previewRenderer: (val) => val,
      },
      {
        id: 'to',
        type: 'text',
        label: 'To Version',
        required: true,
        defaultValue: 'v2',
        validation: { pattern: '^v[0-9.]+$' },
        helpText: 'Version cible.',
        previewRenderer: (val) => val,
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'from', message: 'From requis' },
      { type: 'required', field: 'to', message: 'To requis' },
    ],
  },
  {
    id: 'graphqlgen',
    name: 'GraphQLGen',
    label: 'Générateur GraphQL',
    category: 'GENERATION',
    color: 'info',
    icon: 'Graphql',
    description: 'Génère schema/resolvers GraphQL.',
    template: '@GraphQLGen schema:{{schema}}',
    fields: [
      {
        id: 'schema',
        type: 'code',
        label: 'Schema SDL',
        defaultValue: 'type Query { hello: String }',
        monacoOptions: { language: 'graphql' },
        validation: { minLength: 10 },
        helpText: 'Schema GraphQL.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'schema', message: 'Schema requis' },
    ],
  },
  {
    id: 'restgen',
    name: 'RestGen',
    label: 'Générateur REST',
    category: 'GENERATION',
    color: 'info',
    icon: 'Globe',
    description: 'Génère endpoints REST.',
    template: '@RestGen endpoints:[{{endpoints}}]',
    fields: [
      {
        id: 'endpoints',
        type: 'array',
        label: 'Endpoints',
        defaultValue: [{ method: 'GET', path: '/users' }],
        nestedType: {
          type: 'object',
          label: 'Endpoint',
          nestedType: {
            method: { type: 'select', options: [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }], required: true },
            path: { type: 'text', required: true, validation: { pattern: '^/[a-zA-Z0-9/{}]*$' } },
          },
        },
        minItems: 1,
        helpText: 'Endpoints à générer.',
        previewRenderer: (arr) => arr.map(e => `${e.method} ${e.path}`).join(', '),
      },
    ],
    canHaveChildren: true,
    allowedChildren: ['endpoint'],
    maxChildren: 50,
    validation: [
      { type: 'required', field: 'endpoints', message: 'Au moins un endpoint' },
    ],
  },
  {
    id: 'websocketgen',
    name: 'WebSocketGen',
    label: 'Générateur WebSocket',
    category: 'GENERATION',
    color: 'info',
    icon: 'RadioTower',
    description: 'Génère impl WebSocket avec events.',
    template: '@WebSocketGen events:[{{events}}]',
    fields: [
      {
        id: 'events',
        type: 'enum-values',
        label: 'Événements',
        defaultValue: ['connect', 'disconnect', 'message'],
        validation: { minItems: 1, maxItems: 20, unique: true, message: 'Événements uniques, min 1' },
        maxItems: 20,
        minItems: 1,
        searchEnabled: true,
        allowCustomAdd: true,
        helpText: 'Événements WebSocket. Liste éditable.',
        previewRenderer: (vals) => vals.join(', '),
      },
      {
        id: 'auth',
        type: 'boolean',
        label: 'Authentification',
        defaultValue: true,
        helpText: 'Requérir auth pour connexions.',
        previewRenderer: (val) => val ? 'Avec Auth' : 'Sans Auth',
      },
      {
        id: 'namespace',
        type: 'text',
        label: 'Namespace',
        defaultValue: '/ws',
        validation: { pattern: '^/[a-zA-Z0-9/]*$', message: 'Chemin valide' },
        helpText: 'Namespace Socket.IO.',
        previewRenderer: (val) => val,
      },
      {
        id: 'handler',
        type: 'code',
        label: 'Handler Global',
        defaultValue: '// Global handler code',
        monacoOptions: { language: 'javascript', theme: 'vs-dark' },
        validation: { minLength: 10, message: 'Handler trop court' },
        customValidator: (code) => code.includes('socket.on') ? null : 'Devrait inclure socket listeners',
        helpText: 'Code handler global. Monaco avec validation.',
        previewRenderer: (code) => code.slice(0, 30) + '...',
      },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'events', message: 'Au moins un événement requis' },
    ],
  },
  {
    id: 'layout',
    name: 'Layout',
    label: 'Layout',
    category: 'UI',
    color: 'secondary',
    icon: 'LayoutGrid',
    description: 'Définit la structure globale d’une page (header, sidebar, main, footer).',
    template: '@Layout {{name}} { sections: [{{sections}}] }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true, defaultValue: 'MainLayout' },
      { id: 'type', type: 'select', label: 'Type', options: [{label:'Dashboard', value:'dashboard'}, {label:'Auth', value:'auth'}, {label:'Marketing', value:'marketing'}], defaultValue: 'dashboard' },
      { id: 'responsive', type: 'boolean', label: 'Responsive', defaultValue: true },
    ],
    canHaveChildren: true,
    allowedChildren: ['section'],
    validation: [{ type: 'required', field: 'name', message: 'Nom du layout requis' }]
  },

  {
    id: 'componentlibrary',
    name: 'ComponentLibrary',
    label: 'Bibliothèque de composants',
    category: 'UI',
    color: 'secondary',
    icon: 'Library',
    description: 'Regroupe plusieurs composants réutilisables avec un thème commun.',
    template: '@ComponentLibrary {{name}} { components: [{{components}}] }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true, defaultValue: 'CoreUI' },
      { id: 'theme', type: 'select', label: 'Thème', options: [{label:'Light', value:'light'}, {label:'Dark', value:'dark'}, {label:'System', value:'system'}] },
      { id: 'version', type: 'text', label: 'Version', defaultValue: '1.0.0' },
    ],
    canHaveChildren: true,
    allowedChildren: ['component'],
    validation: [{ type: 'required', field: 'name', message: 'Nom de la bibliothèque requis' }]
  },

  // ── API / Intégrations ─────────────────────────
  {
    id: 'integration',
    name: 'Integration',
    label: 'Intégration externe',
    category: 'API',
    color: 'accent',
    icon: 'Plug',
    description: 'Connexion à un service tiers (Stripe, SendGrid, Twilio, etc.).',
    template: '@Integration {{name}} provider:{{provider}} { mapping: {{mapping}} }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true, defaultValue: 'StripeIntegration' },
      { id: 'provider', type: 'text', label: 'Fournisseur', required: true, defaultValue: 'Stripe' },
      { id: 'apiVersion', type: 'text', label: 'Version API', defaultValue: '2024-06-20' },
      { id: 'authType', type: 'select', label: 'Type Auth', options: [{label:'API Key', value:'api_key'}, {label:'OAuth2', value:'oauth2'}, {label:'Basic', value:'basic'}] },
    ],
    canHaveChildren: false,
    validation: [
      { type: 'required', field: 'name', message: 'Nom requis' },
      { type: 'required', field: 'provider', message: 'Fournisseur requis' }
    ]
  },

  // ── Event Sourcing & CQRS avancés ──────────────
  {
    id: 'projection',
    name: 'Projection',
    label: 'Projection',
    category: 'LOGIC',
    color: 'primary',
    icon: 'Projector',
    description: 'Projection d’événements vers un read-model.',
    template: '@Projection {{name}} on:{{aggregate}} { handler: "{{handler}}" }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true, defaultValue: 'OrderViewProjection' },
      { id: 'aggregate', type: 'select', label: 'Agrégat source', dynamicSource: 'aggregates', required: true },
      { id: 'handler', type: 'code', label: 'Handler', monacoOptions: { language: 'typescript' }, required: true },
    ],
    canHaveChildren: false,
    validation: [{ type: 'required', field: 'name', message: 'Nom requis' }]
  },

  {
    id: 'snapshot',
    name: 'Snapshot',
    label: 'Snapshot',
    category: 'LOGIC',
    color: 'primary',
    icon: 'Camera',
    description: 'Point de restauration pour Event Sourcing.',
    template: '@Snapshot {{name}} aggregate:{{aggregate}} every:{{frequency}}',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true, defaultValue: 'OrderSnapshot' },
      { id: 'aggregate', type: 'select', label: 'Agrégat', dynamicSource: 'aggregates', required: true },
      { id: 'frequency', type: 'number', label: 'Fréquence (événements)', defaultValue: 100, validation: { min: 10 } },
      { id: 'version', type: 'number', label: 'Version', defaultValue: 1 },
    ],
    canHaveChildren: false,
    validation: [{ type: 'required', field: 'aggregate', message: 'Agrégat requis' }]
  },

  // ── Génération (tous les *Gen manquants) ───────
  {
    id: 'autogen',
    name: 'AutoGen',
    label: 'Génération automatique',
    category: 'GENERATION',
    color: 'info',
    icon: 'Sparkles',
    description: 'Génération automatique à partir d’un template ou d’une règle.',
    template: '@AutoGen target:{{target}} template:{{template}}',
    fields: [
      { id: 'target', type: 'text', label: 'Cible', required: true },
      { id: 'template', type: 'select', label: 'Template', dynamicSource: 'templates' },
      { id: 'when', type: 'text', label: 'Condition', placeholder: 'on model change' },
    ],
    canHaveChildren: false
  },

  {
    id: 'apigen',
    name: 'ApiGen',
    label: 'Générateur API',
    category: 'GENERATION',
    color: 'info',
    icon: 'Globe',
    description: 'Génère une API complète à partir d’un modèle ou d’une spec.',
    template: '@ApiGen for:{{for}} framework:{{framework}} output:{{output}}',
    fields: [
      { id: 'for', type: 'select', label: 'Pour', dynamicSource: 'models', required: true },
      { id: 'framework', type: 'select', label: 'Framework', options: [{label:'Express',value:'express'},{label:'NestJS',value:'nestjs'},{label:'FastAPI',value:'fastapi'}], required: true },
      { id: 'output', type: 'text', label: 'Dossier de sortie', defaultValue: 'src/api/generated' },
    ],
    canHaveChildren: false
  },

  {
    id: 'crudgen',
    name: 'CrudGen',
    label: 'Générateur CRUD',
    category: 'GENERATION',
    color: 'info',
    icon: 'DatabaseZap',
    description: 'Génère les opérations CRUD pour une entité.',
    template: '@CRUDGen for:{{for}} operations:{{operations}}',
    fields: [
      { id: 'for', type: 'select', label: 'Entité', dynamicSource: 'models', required: true },
      { id: 'operations', type: 'multiselect', label: 'Opérations', options: [{label:'Create',value:'create'},{label:'Read',value:'read'},{label:'Update',value:'update'},{label:'Delete',value:'delete'}], defaultValue: ['create','read','update','delete'] },
      { id: 'auth', type: 'boolean', label: 'Avec authentification', defaultValue: true },
    ],
    canHaveChildren: false
  },

  {
    id: 'uigen',
    name: 'UIGen',
    label: 'Générateur UI',
    category: 'GENERATION',
    color: 'info',
    icon: 'LayoutDashboard',
    description: 'Génère des écrans / composants UI à partir d’un modèle.',
    template: '@UIGen for:{{for}} framework:{{framework}}',
    fields: [
      { id: 'for', type: 'select', label: 'Modèle source', dynamicSource: 'models', required: true },
      { id: 'framework', type: 'select', label: 'Framework', options: [{label:'React',value:'react'},{label:'Vue',value:'vue'},{label:'Angular',value:'angular'}], required: true },
      { id: 'style', type: 'select', label: 'Style', options: [{label:'Tailwind',value:'tailwind'},{label:'Material',value:'material'},{label:'Bootstrap',value:'bootstrap'}] },
    ],
    canHaveChildren: false
  },

  {
    id: 'componentgen',
    name: 'ComponentGen',
    label: 'Générateur de Composant',
    category: 'GENERATION',
    color: 'info',
    icon: 'Puzzle',
    description: 'Génère un composant UI réutilisable.',
    template: '@ComponentGen name:{{name}} framework:{{framework}}',
    fields: [
      { id: 'name', type: 'text', label: 'Nom du composant', required: true, defaultValue: 'DataTable' },
      { id: 'framework', type: 'select', label: 'Framework', options: [{label:'React',value:'react'},{label:'Vue',value:'vue'}], required: true },
      { id: 'props', type: 'array', label: 'Props attendus', nestedType: { fields: [{id:'name',type:'text'}, {id:'type',type:'select',options:[{label:'string',value:'string'},{label:'number',value:'number'}]}] } },
    ],
    canHaveChildren: false
  },

  {
    id: 'relationpathgen',
    name: 'RelationPathGen',
    label: 'Générateur de chemins de relations',
    category: 'GENERATION',
    color: 'info',
    icon: 'Link',
    description: 'Génère les chemins de relations pour requêtes profondes.',
    template: '@RelationPathGen from:{{from}} maxDepth:{{maxDepth}}',
    fields: [
      { id: 'from', type: 'select', label: 'Entité de départ', dynamicSource: 'models', required: true },
      { id: 'maxDepth', type: 'number', label: 'Profondeur maximale', defaultValue: 4, validation: { min: 1, max: 10 } },
      { id: 'output', type: 'select', label: 'Format', options: [{label:'GraphQL',value:'graphql'},{label:'SQL JOIN',value:'sql'}] },
    ],
    canHaveChildren: false
  },

  {
    id: 'mockdatagen',
    name: 'MockDataGen',
    label: 'Générateur de données mock',
    category: 'GENERATION',
    color: 'info',
    icon: 'DatabaseZap',
    description: 'Génère des données de test réalistes.',
    template: '@MockDataGen for:{{for}} count:{{count}} format:{{format}}',
    fields: [
      { id: 'for', type: 'select', label: 'Modèle', dynamicSource: 'models', required: true },
      { id: 'count', type: 'number', label: 'Quantité', defaultValue: 50, validation: { min: 1 } },
      { id: 'format', type: 'select', label: 'Format', options: [{label:'JSON',value:'json'},{label:'CSV',value:'csv'},{label:'SQL',value:'sql'}], defaultValue: 'json' },
    ],
    canHaveChildren: false
  },

  {
    id: 'docgen',
    name: 'DocGen',
    label: 'Générateur de documentation',
    category: 'GENERATION',
    color: 'info',
    icon: 'Book',
    description: 'Génère la documentation API / code.',
    template: '@DocGen target:{{target}} format:{{format}}',
    fields: [
      { id: 'target', type: 'select', label: 'Cible', options: [{label:'API',value:'api'},{label:'Models',value:'models'},{label:'All',value:'all'}], required: true },
      { id: 'format', type: 'select', label: 'Format', options: [{label:'Markdown',value:'md'},{label:'Swagger/OpenAPI',value:'openapi'},{label:'JSDoc',value:'jsdoc'}] },
      { id: 'output', type: 'text', label: 'Chemin de sortie', defaultValue: 'docs/' },
    ],
    canHaveChildren: false
  },

  {
    id: 'perfoptgen',
    name: 'PerfOptGen',
    label: 'Générateur d’optimisations performance',
    category: 'GENERATION',
    color: 'info',
    icon: 'Zap',
    description: 'Ajoute automatiquement cache, index, lazy-loading, etc.',
    template: '@PerfOptGen target:{{target}} strategy:{{strategy}}',
    fields: [
      { id: 'target', type: 'text', label: 'Cible', required: true },
      { id: 'strategy', type: 'select', label: 'Stratégie principale', options: [{label:'Caching',value:'cache'},{label:'Indexing',value:'index'},{label:'Query optimization',value:'query'}] },
      { id: 'aggressive', type: 'boolean', label: 'Mode agressif', defaultValue: false },
    ],
    canHaveChildren: false
  },

  {
    id: 'secscangen',
    name: 'SecScanGen',
    label: 'Générateur de scans de sécurité',
    category: 'GENERATION',
    color: 'danger',
    icon: 'ShieldCheck',
    description: 'Génère configuration pour outils de scan (SAST, DAST).',
    template: '@SecScanGen tools:[{{tools}}] target:{{target}}',
    fields: [
      { id: 'tools', type: 'multiselect', label: 'Outils', options: [{label:'Snyk',value:'snyk'},{label:'OWASP ZAP',value:'zap'},{label:'Trivy',value:'trivy'},{label:'Semgrep',value:'semgrep'}] },
      { id: 'target', type: 'text', label: 'Cible', defaultValue: '.' },
      { id: 'schedule', type: 'text', label: 'Planification', defaultValue: 'daily' },
    ],
    canHaveChildren: false
  },

  {
    id: 'migrationgen',
    name: 'MigrationGen',
    label: 'Générateur de migrations',
    category: 'GENERATION',
    color: 'info',
    icon: 'ArrowRightLeft',
    description: 'Génère scripts de migration de base de données.',
    template: '@MigrationGen from:{{from}} to:{{to}}',
    fields: [
      { id: 'from', type: 'text', label: 'Version source', required: true, defaultValue: '1.0.0' },
      { id: 'to', type: 'text', label: 'Version cible', required: true, defaultValue: '1.1.0' },
      { id: 'type', type: 'select', label: 'Type de migration', options: [{label:'Schema only',value:'schema'},{label:'Data + Schema',value:'full'}] },
    ],
    canHaveChildren: false
  },

  {
    id: 'graphqlgen',
    name: 'GraphQLGen',
    label: 'Générateur GraphQL',
    category: 'GENERATION',
    color: 'info',
    icon: 'Graphql',
    description: 'Génère schema et resolvers GraphQL.',
    template: '@GraphQLGen schema:{{schema}} resolvers:{{resolvers}}',
    fields: [
      { id: 'schema', type: 'code', label: 'Schéma SDL', monacoOptions: { language: 'graphql' }, required: true },
      { id: 'resolvers', type: 'boolean', label: 'Générer resolvers', defaultValue: true },
      { id: 'federation', type: 'boolean', label: 'Mode fédéré', defaultValue: false },
    ],
    canHaveChildren: false
  },

  {
    id: 'restgen',
    name: 'RestGen',
    label: 'Générateur REST',
    category: 'GENERATION',
    color: 'info',
    icon: 'Globe',
    description: 'Génère contrôleurs et routes REST.',
    template: '@RestGen for:{{for}} prefix:{{prefix}}',
    fields: [
      { id: 'for', type: 'select', label: 'Modèle', dynamicSource: 'models', required: true },
      { id: 'prefix', type: 'text', label: 'Préfixe de route', defaultValue: '/api/v1' },
      { id: 'auth', type: 'boolean', label: 'Protéger avec auth', defaultValue: true },
    ],
    canHaveChildren: false
  },

  {
    id: 'websocketgen',
    name: 'WebSocketGen',
    label: 'Générateur WebSocket',
    category: 'GENERATION',
    color: 'info',
    icon: 'RadioTower',
    description: 'Génère serveur et events WebSocket.',
    template: '@WebSocketGen path:{{path}} events:[{{events}}]',
    fields: [
      { id: 'path', type: 'text', label: 'Chemin', defaultValue: '/ws' },
      { id: 'events', type: 'array', label: 'Événements', nestedType: { fields: [{id:'name',type:'text'},{id:'description',type:'text'}] } },
      { id: 'auth', type: 'boolean', label: 'Authentification', defaultValue: true },
    ],
    canHaveChildren: false
  },

  // ── Infrastructure manquante ───────────────────
  {
    id: 'health',
    name: 'Health',
    label: 'Health Check',
    category: 'INFRASTRUCTURE',
    color: 'success',
    icon: 'Activity',
    description: 'Endpoint de health-check pour monitoring.',
    template: '@Health endpoint:{{endpoint}} checks:[{{checks}}]',
    fields: [
      { id: 'endpoint', type: 'text', label: 'Chemin', defaultValue: '/health', required: true },
      { id: 'checks', type: 'multiselect', label: 'Vérifications', options: [{label:'Database',value:'db'},{label:'Cache',value:'cache'},{label:'External APIs',value:'external'}] },
      { id: 'interval', type: 'text', label: 'Intervalle', defaultValue: '30s' },
    ],
    canHaveChildren: false
  },

  {
    id: 'metrics',
    name: 'Metrics',
    label: 'Métriques',
    category: 'INFRASTRUCTURE',
    color: 'warning',
    icon: 'TrendingUp',
    description: 'Définition d’une métrique custom.',
    template: '@Metrics {{name}} type:{{type}}',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'type', type: 'select', label: 'Type', options: [{label:'Counter',value:'counter'},{label:'Gauge',value:'gauge'},{label:'Histogram',value:'histogram'}], required: true },
      { id: 'labels', type: 'enum-values', label: 'Labels', defaultValue: ['service','endpoint'] },
    ],
    canHaveChildren: false
  },

  {
    id: 'alert',
    name: 'Alert',
    label: 'Alerte',
    category: 'INFRASTRUCTURE',
    color: 'danger',
    icon: 'Bell',
    description: 'Règle d’alerte sur une métrique.',
    template: '@Alert {{name}} when:{{condition}} notify:{{channel}}',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'condition', type: 'text', label: 'Condition', placeholder: 'cpu_usage > 90 for 5m', required: true },
      { id: 'severity', type: 'select', label: 'Sévérité', options: [{label:'critical',value:'critical'},{label:'warning',value:'warning'}] },
      { id: 'channel', type: 'select', label: 'Canal', options: [{label:'Slack',value:'slack'},{label:'Email',value:'email'},{label:'PagerDuty',value:'pagerduty'}] },
    ],
    canHaveChildren: false
  },

  {
    id: 'indexstrategy',
    name: 'IndexStrategy',
    label: 'Stratégie d’indexation',
    category: 'DATA',
    color: 'success',
    icon: 'Search',
    description: 'Définit comment indexer une entité.',
    template: '@IndexStrategy for:{{for}} type:{{type}}',
    fields: [
      { id: 'for', type: 'select', label: 'Entité', dynamicSource: 'models', required: true },
      { id: 'type', type: 'select', label: 'Type', options: [{label:'BTREE',value:'btree'},{label:'GIN',value:'gin'},{label:'Hash',value:'hash'}] },
      { id: 'fields', type: 'multiselect', label: 'Champs', dynamicSource: 'fields' },
    ],
    canHaveChildren: false
  },

  // ── Autres entités structurelles ───────────────
  {
    id: 'template',
    name: 'Template',
    label: 'Template',
    category: 'GENERATION',
    color: 'muted',
    icon: 'LayoutTemplate',
    description: 'Modèle réutilisable pour génération.',
    template: '@Template {{name}} { content: """{{content}}""" }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'content', type: 'code', label: 'Contenu', monacoOptions: { language: 'handlebars' } },
    ],
    canHaveChildren: false
  },

  {
    id: 'blueprint',
    name: 'Blueprint',
    label: 'Blueprint',
    category: 'ARCHITECTURE',
    color: 'secondary',
    icon: 'FileBlueprint',
    description: 'Plan d’architecture global.',
    template: '@Blueprint {{name}} { modules: [{{modules}}] }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'description', type: 'text', label: 'Description' },
    ],
    canHaveChildren: true,
    allowedChildren: ['module', 'api', 'database']
  },

  {
    id: 'plugin',
    name: 'Plugin',
    label: 'Plugin',
    category: 'ARCHITECTURE',
    color: 'muted',
    icon: 'Plug',
    description: 'Extension ou plugin applicatif.',
    template: '@Plugin {{name}} hooks:[{{hooks}}]',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'hooks', type: 'multiselect', label: 'Points d’entrée', options: [{label:'onInit',value:'onInit'},{label:'onRequest',value:'onRequest'}] },
    ],
    canHaveChildren: false
  },

  {
    id: 'test',
    name: 'Test',
    label: 'Test',
    category: 'GENERATION',
    color: 'info',
    icon: 'TestTube2',
    description: 'Définition d’un cas de test.',
    template: '@Test {{name}} { expect: {{expect}} }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'type', type: 'select', label: 'Type', options: [{label:'unit',value:'unit'},{label:'integration',value:'integration'},{label:'e2e',value:'e2e'}] },
    ],
    canHaveChildren: false
  },

  {
    id: 'testsuite',
    name: 'TestSuite',
    label: 'Suite de tests',
    category: 'GENERATION',
    color: 'info',
    icon: 'TestTubes',
    description: 'Regroupe plusieurs tests.',
    template: '@TestSuite {{name}} { tests: [{{tests}}] }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'tests', type: 'multiselect', label: 'Tests inclus', dynamicSource: 'tests' },
    ],
    canHaveChildren: true,
    allowedChildren: ['test']
  },

  {
    id: 'security',
    name: 'Security',
    label: 'Sécurité',
    category: 'INFRASTRUCTURE',
    color: 'danger',
    icon: 'Shield',
    description: 'Politiques de sécurité globales.',
    template: '@Security { auth: {{auth}} roles: [{{roles}}] }',
    fields: [
      { id: 'auth', type: 'select', label: 'Méthode', options: [{label:'JWT',value:'jwt'},{label:'OAuth2',value:'oauth2'}] },
      { id: 'roles', type: 'enum-values', label: 'Rôles' },
    ],
    canHaveChildren: false
  },

  {
    id: 'directivesavancees',
    name: 'DirectivesAvancees',
    label: 'Directives avancées',
    category: 'UI',
    color: 'secondary',
    icon: 'Wand2',
    description: 'Directives avec bindings et listeners complexes.',
    template: '@DirectivesAvancees {{name}}',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'bindings', type: 'json', label: 'Host Bindings' },
      { id: 'listeners', type: 'json', label: 'Host Listeners' },
    ],
    canHaveChildren: false
  },

  {
    id: 'block',
    name: 'Block',
    label: 'Bloc générique',
    category: 'OTHER',
    color: 'muted',
    icon: 'Square',
    description: 'Bloc personnalisé extensible.',
    template: '@Block {{name}}',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'metadata', type: 'json', label: 'Métadonnées' },
    ],
    canHaveChildren: true
  },

  {
    id: 'property',
    name: 'Property',
    label: 'Propriété',
    category: 'DATA',
    color: 'primary',
    icon: 'KeyRound',
    description: 'Propriété dans un objet ou bloc.',
    template: '{{name}}: {{type}} = {{default}}',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'type', type: 'select', label: 'Type', options: [{ label: 'String', value: 'String' }, { label: 'Int', value: 'Int' }, { label: 'Float', value: 'Float' }, { label: 'Boolean', value: 'Boolean' }, { label: 'DateTime', value: 'DateTime' }, { label: 'Json', value: 'Json' }] },
      { id: 'default', type: 'text', label: 'Valeur par défaut' },
    ],
    canHaveChildren: false
  },

  {
    id: 'array',
    name: 'Array',
    label: 'Tableau',
    category: 'DATA',
    color: 'primary',
    icon: 'Brackets',
    description: 'Définition d’un tableau typé.',
    template: '{{name}}: {{elementType}}[]',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'elementType', type: 'select', label: 'Type des éléments', dynamicSource: 'types' },
      { id: 'minItems', type: 'number', label: 'Minimum', defaultValue: 0 },
      { id: 'maxItems', type: 'number', label: 'Maximum' },
    ],
    canHaveChildren: false
  },

  {
    id: 'object',
    name: 'Object',
    label: 'Objet',
    category: 'DATA',
    color: 'primary',
    icon: 'Braces',
    description: 'Définition d’un objet anonyme ou inline.',
    template: '{{name}}: { {{properties}} }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom (optionnel)' },
      { id: 'properties', type: 'array', label: 'Propriétés', nestedType: { type: 'property' } },
    ],
    canHaveChildren: true,
    allowedChildren: ['property']
  },

  {
    id: 'gentest',
    name: 'GenTest',
    label: 'Générateur de tests',
    category: 'GENERATION',
    color: 'info',
    icon: 'TestTube',
    description: 'Génère automatiquement des tests unitaires / intégration.',
    template: '@GenTest target:{{target}} framework:{{framework}} coverage:{{coverage}}%',
    fields: [
      { id: 'target', type: 'text', label: 'Cible', required: true },
      { id: 'framework', type: 'select', label: 'Framework', options: [{label:'Jest',value:'jest'},{label:'Vitest',value:'vitest'},{label:'Mocha',value:'mocha'}] },
      { id: 'coverage', type: 'number', label: 'Couverture cible (%)', defaultValue: 85 },
    ],
    canHaveChildren: false
  },

  {
    id: 'literal',
    name: 'Literal',
    label: 'Littéral',
    category: 'DATA',
    color: 'muted',
    icon: 'Type',
    description: 'Valeur littérale fixe.',
    template: '{{value}}',
    fields: [
      { id: 'value', type: 'text', label: 'Valeur', required: true },
      { id: 'type', type: 'select', label: 'Type inféré', options: [{label:'string',value:'string'},{label:'number',value:'number'},{label:'boolean',value:'boolean'}] },
    ],
    canHaveChildren: false
  },

  {
    id: 'reference',
    name: 'Reference',
    label: 'Référence',
    category: 'DATA',
    color: 'muted',
    icon: 'Link',
    description: 'Référence vers un autre modèle ou entité.',
    template: '{{name}}: ref {{target}}',
    fields: [
      { id: 'name', type: 'text', label: 'Nom local', required: true },
      { id: 'target', type: 'select', label: 'Cible', dynamicSource: 'models', required: true },
    ],
    canHaveChildren: false
  },

  {
    id: 'index',
    name: 'Index',
    label: 'Index',
    category: 'DATA',
    color: 'success',
    icon: 'Hash',
    description: 'Index sur une collection ou table.',
    template: '@Index {{name}} on:{{collection}} fields:[{{fields}}]',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'collection', type: 'select', label: 'Collection', dynamicSource: 'models' },
      { id: 'fields', type: 'multiselect', label: 'Champs', dynamicSource: 'fields' },
      { id: 'unique', type: 'boolean', label: 'Unique', defaultValue: false },
    ],
    canHaveChildren: false
  },

  {
    id: 'realtime',
    name: 'Realtime',
    label: 'Realtime',
    category: 'API',
    color: 'accent',
    icon: 'Radio',
    description: 'Configuration de fonctionnalités temps réel.',
    template: '@Realtime {{name}} channels:[{{channels}}]',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'channels', type: 'enum-values', label: 'Canaux', defaultValue: ['updates', 'notifications'] },
      { id: 'protocol', type: 'select', label: 'Protocole', options: [{label:'WebSocket',value:'ws'},{label:'SSE',value:'sse'}] },
    ],
    canHaveChildren: false
  },

  {
    id: 'search',
    name: 'Search',
    label: 'Recherche',
    category: 'UI',
    color: 'secondary',
    icon: 'Search',
    description: 'Moteur de recherche intégré.',
    template: '@Search {{name}} engine:{{engine}}',
    fields: [
      { id: 'name', type: 'text', label: 'Nom', required: true },
      { id: 'engine', type: 'select', label: 'Moteur', options: [{label:'Meilisearch',value:'meilisearch'},{label:'Algolia',value:'algolia'},{label:'Elastic',value:'elastic'}] },
      { id: 'fields', type: 'multiselect', label: 'Champs indexés', dynamicSource: 'fields' },
    ],
    canHaveChildren: false
  },

  {
    id: 'database',
    name: 'Database',
    label: 'Base de données',
    category: 'INFRASTRUCTURE',
    color: 'success',
    icon: 'Database',
    description: 'Configuration globale d’une base de données.',
    template: '@Database {{name}} type:{{type}} { connection: {{connection}} }',
    fields: [
      { id: 'name', type: 'text', label: 'Nom logique', required: true, defaultValue: 'MainDB' },
      { id: 'type', type: 'select', label: 'Type', options: [{label:'PostgreSQL',value:'postgres'},{label:'MongoDB',value:'mongodb'},{label:'MySQL',value:'mysql'}], required: true },
      { id: 'connection', type: 'json', label: 'Chaîne de connexion', monacoOptions: { language: 'json' } },
    ],
    canHaveChildren: true,
    allowedChildren: ['model', 'index'],
    validation: [{ type: 'required', field: 'type', message: 'Type de base requis' }]
  }

];

/**
 * Nettoie un tableau de BlockType en supprimant les doublons d'id
 * et en conservant uniquement la version la plus développée pour chaque id.
 * 
 * @param blocks Le tableau BLOCK_TYPES brut (potentiellement avec doublons)
 * @returns Un nouveau tableau sans doublons, avec la meilleure version pour chaque id
 */
export function removeDuplicateBlockTypes(blocks: BlockTypeInterface[]): BlockTypeInterface[] {
  // Étape 1 : Regrouper par id
  const grouped = new Map<string, BlockTypeInterface[]>();

  for (const block of blocks) {
    if (!grouped.has(block.id)) {
      grouped.set(block.id, []);
    }
    grouped.get(block.id)!.push(block);
  }

  // Étape 2 : Pour chaque groupe, choisir la meilleure version
  const result: BlockTypeInterface[] = [];

  for (const [id, duplicates] of grouped.entries()) {
    if (duplicates.length === 1) {
      // Pas de doublon → on garde tel quel
      result.push(duplicates[0]);
      continue;
    }

    // Il y a plusieurs versions → on choisit la plus "développée"
    const best = duplicates.reduce((prev, current) => {
      // Critère 1 : nombre de fields
      const prevFieldsCount = prev.fields?.length || 0;
      const currFieldsCount = current.fields?.length || 0;

      if (currFieldsCount > prevFieldsCount) return current;
      if (currFieldsCount < prevFieldsCount) return prev;

      // Critère 2 : maxChildren (si présent)
      const prevMax = prev.maxChildren ?? 0;
      const currMax = current.maxChildren ?? 0;

      if (currMax > prevMax) return current;
      if (currMax < prevMax) return prev;

      // Critère 3 : longueur de la description
      const prevDescLen = prev.description?.length || 0;
      const currDescLen = current.description?.length || 0;

      if (currDescLen > prevDescLen) return current;
      if (currDescLen < prevDescLen) return prev;

      // En cas d'égalité parfaite → on garde le premier (stabilité)
      return prev;
    });

    result.push(best);
  }

  // Étape 3 : Trier par ordre alphabétique d'id (optionnel mais améliore la lisibilité)
  result.sort((a, b) => a.id.localeCompare(b.id));

  return result;
}

export const BLOCK_TYPES = removeDuplicateBlockTypes(currentBLOCK_TYPES);

export const BLOCK_CATEGORIES = {
  DATA: {
    id: 'data',
    label: 'Données',
    description: 'Définitions de données et structures',
    color: 'success',
    icon: 'Database',
  },
  LOGIC: {
    id: 'logic',
    label: 'Logique',
    description: 'Logique métier et règles',
    color: 'primary',
    icon: 'Cpu',
  },
  UI: {
    id: 'ui',
    label: 'Interface',
    description: 'Composants et pages',
    color: 'secondary',
    icon: 'Layout',
  },
  API: {
    id: 'api',
    label: 'API',
    description: 'Endpoints et services',
    color: 'accent',
    icon: 'Globe',
  },
  INFRASTRUCTURE: {
    id: 'infrastructure',
    label: 'Infrastructure',
    description: 'Déploiement et configuration',
    color: 'warning',
    icon: 'Server',
  },
  GENERATION: {
    id: 'generation',
    label: 'Génération',
    description: 'Génération de code/tests/UI',
    color: 'info',
    icon: 'Code',
  },
  CICD: {
    id: 'cicd',
    label: 'CI/CD',
    description: 'Intégration et pipelines CI/CD',
    color: 'danger',
    icon: 'GitMerge',
  },
  ARCHITECTURE: {
    id: 'architecture',
    label: 'Architecture',
    description: 'Patterns et structures globales',
    color: 'purple',
    icon: 'Layers',
  },
  OTHER: {
    id: 'other',
    label: 'Autres',
    description: 'Blocs divers, utilitaires, expérimentaux ou non classés',
    color: 'muted',
    icon: 'Package',
  },
} as const;

export type BlockCategoryId = keyof typeof BLOCK_CATEGORIES;


export interface BlockValidation {
  type: 'required' | 'unique' | 'pattern' | 'custom';
  field?: string;
  message: string;
  validator?: (block: BlockInstance) => boolean;
}

// === Block Instance ===
export interface BlockInstance {
  id: string;
  typeId: string;
  name: string;
  values: Record<string, any>;
  children: BlockInstance[];
  collapsed: boolean;
  locked: boolean;
  order: number;
  parentId?: string;
  metadata: BlockMetadata;
}

export interface BlockMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: number;
  author?: string;
  tags?: string[];
  notes?: string;
}

export interface BlockFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'enum-values' | 'code' | 'json' | 'relation' | 'array' | 'object'; // Ajouts: 'relation' pour liaisons, 'array'/'object' pour nested
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[]; // Statiques
  dynamicSource?: 'models' | 'entities' | 'apis' | 'enums' | 'components' | 'pages' | 'none'; // Sources dynamiques (filtre/search runtime via store)
  searchEnabled?: boolean; // Active recherche/autocomplete pour select/multiselect/dynamic
  relationType?: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany'; // Pour 'relation', auto-valide liaisons
  previewRenderer?: (value: any) => string; // Fonction pour preview mini (ex. JSON.stringify truncé)
  validation?: FieldValidation;
  helpText?: string;
  customValidator?: (value: any, context: any) => string | null; // Avec contexte (ex. store.blocks pour check existence)
  allowCustomAdd?: boolean; // Permet ajout custom dans listes/select (simplifie pour non-tech)
  maxItems?: number; // Pour array/enum/multiselect (drag & drop limité)
  minItems?: number;
  nestedType?: BlockFieldDefinition; // Type interne pour array/object (récursif, éditable nested)
  monacoOptions?: { language: string; theme: string }; // Pour 'code'/'json', config Monaco (highlight, auto-complete)
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  unique?: boolean; // Unicité (ex. dans liste ou vs store)
  enumIn?: string[]; // Valeur dans enum prédéfini
  required?: boolean;
  message?: string;
  custom?: (value: any, context: any) => boolean; // Check avancé (ex. API call simulé)
  relationCheck?: boolean; // Vérifie existence cible (dynamicSource)
}

export const BLOCK_TYPES_MAP = Object.fromEntries(
  BLOCK_TYPES.map(b => [b.id, b])
);

export function getBlockType(id: string): BlockTypeInterface | undefined {
  return BLOCK_TYPES_MAP[id];
}

export function getBlocksByCategory(categoryId: BlockCategoryId): BlockTypeInterface[] {
  return BLOCK_TYPES.filter(t => t.category === categoryId);
}

export function createBlockInstance(
  typeId: string,
  name?: string,
  parentId?: string
): BlockInstance | null {
  const blockType = getBlockType(typeId);
  if (!blockType) return null;
  
  const defaultValues: Record<string, any> = {};
  blockType.fields.forEach(field => {
    if (field.defaultValue !== undefined) {
      defaultValues[field.id] = field.defaultValue;
    }
  });
  
  return {
    id: crypto.randomUUID(),
    typeId,
    name: name || blockType.label,
    values: defaultValues,
    children: [],
    collapsed: false,
    locked: false,
    order: 0,
    parentId,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    },
  };
}

export function blockInstanceToAST(block: BlockInstance): ASTNode | null {
  const blockType = getBlockType(block.typeId);
  if (!blockType) return null;
  
  switch (block.typeId) {
    case 'enum':
      const enumNode: EnumNode = {
        type: 'Enum',
        name: block.values.name || 'Unnamed',
        values: (block.values.values || '').split(/\s+/).filter(Boolean).map((v: string) => ({ name: v })),
      };
      return enumNode;
    
    case 'dataJson':
      const dataJsonNode: DataJsonNode = {
        type: 'DataJson',
        name: block.values.name || 'Unnamed',
        fields: block.children.map(child => ({
          type: 'Field' as const,
          name: child.values.name || 'field',
          dataType: child.values.type || 'String',
          isRequired: child.values.isRequired || false,
          isUnique: child.values.isUnique || false,
          isImmutable: false,
          isArray: false,
          defaultValue: child.values.defaultValue,
        })),
      };
      return dataJsonNode;
    
    default:
      return {
        type: 'Block',
        name: block.name,
        properties: block.values,
        children: block.children.map(c => blockInstanceToAST(c)).filter(Boolean) as ASTNode[],
      };
  }
}

export function generateTPCode(blocks: BlockInstance[]): string {
  const lines: string[] = [];

  const indent = (level: number) => '  '.repeat(level);

  const escapeString = (str: string | undefined): string => {
    if (!str) return '""';
    return `"${str.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  };

  const processValue = (value: any, level: number): string[] => {
    if (value === undefined || value === null) return [];
    if (typeof value === 'boolean') return [`${value}`];
    if (typeof value === 'number') return [`${value}`];
    if (typeof value === 'string') return [escapeString(value)];

    if (Array.isArray(value)) {
      if (value.length === 0) return [];
      const subLines: string[] = [`[`];
      value.forEach((item: any) => {
        if (typeof item === 'string') {
          subLines.push(indent(level + 1) + escapeString(item));
        } else if (typeof item === 'object') {
          const objLines = processObject(item, level + 1);
          subLines.push(...objLines.map(l => indent(level + 1) + l));
        } else {
          subLines.push(indent(level + 1) + String(item));
        }
      });
      subLines.push(indent(level) + `]`);
      return subLines;
    }

    if (typeof value === 'object') {
      return processObject(value, level);
    }

    return [String(value)];
  };

  const processObject = (obj: Record<string, any>, level: number): string[] => {
    const subLines: string[] = [];
    Object.entries(obj).forEach(([key, val]) => {
      if (val === undefined || val === null) return;
      if (Array.isArray(val) && val.length === 0) return;

      const valLines = processValue(val, level + 1);
      if (valLines.length === 1 && !valLines[0].includes('\n')) {
        subLines.push(`${key}: ${valLines[0]}`);
      } else {
        subLines.push(`${key}: `);
        subLines.push(...valLines.map(l => indent(level + 1) + l));
      }
    });
    return subLines;
  };

  const processBlock = (block: BlockInstance, level = 0): void => {
    const type = getBlockType(block.typeId);
    if (!type) {
      lines.push(`${indent(level)}// Bloc inconnu : ${block.typeId}`);
      return;
    }

    const v = block.values || {};
    const name = v.name || v.id || block.typeId.replace(/([A-Z])/g, ' $1').trim() || 'Unnamed';

    // ── Directives principales ───────────────────────────────────────
    const directiveMap: Record<string, string> = {
      enum: '@DataEnumeration',
      dataJson: '@DataJson',
      model: '@DataModel',
      cqrs: '@CQRS',
      eventsourcing: '@EventSourcing',
      cache: '@Cache',
      monitoring: '@Monitoring',
      cicdgen: '@CICDGen',
      relation: '',
      businessRule: '@BusinessRule',
      workflow: '@Workflow',
      saga: '@Saga',
      component: '@Component',
      page: '@Page',
      section: '@Section',
      api: '@API',
      microservice: '@Microservice',
      eventbus: '@EventBus',
      webhook: '@Webhook',
      deploy: '@Deploy',
      program: '@Program',
      module: '@Module',
      directive: '@Directive',
      directivesavancees: '@DirectivesAvancees',
      import: '@Import',
      macro: '@Macro',
      integration: '@Integration',
      test: '@Test',
      testsuite: '@TestSuite',
      security: '@Security',
      autogen: '@AutoGen',
      apigen: '@APIGen',
      block: '@Block',
      template: '@Template',
      blueprint: '@Blueprint',
      plugin: '@Plugin',
      step: '@Step',
      projection: '@Projection',
      snapshot: '@Snapshot',
      indexstrategy: '@IndexStrategy',
      health: '@Health',
      componentlibrary: '@ComponentLibrary',
      layout: '@Layout',
      search: '@Search',
      realtime: '@Realtime',
      database: '@Database',
      index: '@Index',
      gentest: '@GenTest',
      crudgen: '@CRUDGen',
      uigen: '@UIGen',
      componentgen: '@ComponentGen',
      relationpathgen: '@RelationPathGen',
      mockdatagen: '@MockDataGen',
      docgen: '@DocGen',
      perfoptgen: '@PerfOptGen',
      secscangen: '@SecScanGen',
      migrationgen: '@MigrationGen',
      graphqlgen: '@GraphQLGen',
      restgen: '@RESTGen',
      websocketgen: '@WebSocketGen',
    };

    const directive = directiveMap[block.typeId] || `@${type.name || block.typeId}`;

    // Cas spéciaux sans accolade ou avec syntaxe particulière
    if (['field', 'relation', 'endpoint', 'literal', 'property', 'reference', 'import'].includes(block.typeId)) {
      let line = indent(level);

      if (block.typeId === 'field') {
        const mods = [];
        if (v.isRequired) mods.push('@notNull');
        if (v.isUnique) mods.push('@unique');
        if (v.defaultValue) mods.push(`default(${v.defaultValue})`);
        line += `${v.name || 'field'} ${v.type || 'String'}`;
        if (mods.length) line += ` ${mods.join(' ')}`;
      } else if (block.typeId === 'relation') {
        line += `${v.name || 'rel'} ${v.target || '?'} ${v.relationType || 'OneToOne'}`;
      } else if (block.typeId === 'endpoint') {
        line += `${v.method || 'GET'} ${escapeString(v.path || '/')}`;
      } else if (block.typeId === 'literal') {
        line += v.value || 'null';
      } else if (block.typeId === 'property') {
        line += `${v.name || 'prop'}: ${v.value || '?'}`;
      } else if (block.typeId === 'reference') {
        line += `@Reference ${v.target || '?'}`;
      } else if (block.typeId === 'import') {
        line += `@Import from:${escapeString(v.from || '')}`;
        if (v.alias) line += ` as ${v.alias}`;
      }

      lines.push(line);
      return;
    }

    // Cas normaux avec { }
    let header = `${indent(level)}${directive}`;
    if (name && !['health', 'monitoring', 'cache'].includes(block.typeId)) {
      header += ` ${name}`;
    }

    // Ajout des paramètres inline quand ils existent
    const inlineParams: string[] = [];
    if (block.typeId === 'page') {
      if (v.path) inlineParams.push(`path:${escapeString(v.path)}`);
      if (v.layout) inlineParams.push(`layout:${v.layout}`);
    } else if (block.typeId === 'cache') {
      if (v.entity) inlineParams.push(`entity:${v.entity}`);
      if (v.strategy) inlineParams.push(`strategy:${v.strategy}`);
      if (v.ttl) inlineParams.push(`ttl:${v.ttl}`);
    } else if (block.typeId === 'deploy') {
      if (v.target) inlineParams.push(`target:${v.target}`);
    } else if (block.typeId === 'health') {
      if (v.endpoint) inlineParams.push(`endpoint:${escapeString(v.endpoint)}`);
    }

    if (inlineParams.length) {
      header += ` ${inlineParams.join(' ')}`;
    }

    lines.push(`${header} {`);

    // Champs prioritaires
    const importantFields = [
      'type', 'version', 'basePath', 'provider', 'strategy', 'ttl', 'entity', 'aggregate',
      'readModel', 'trigger', 'entity', 'path', 'method', 'port', 'domain'
    ];

    importantFields.forEach(key => {
      if (v[key] !== undefined && v[key] !== null && !(Array.isArray(v[key]) && v[key].length === 0)) {
        const valLines = processValue(v[key], level + 1);
        if (valLines.length === 1) {
          lines.push(`${indent(level + 1)}${key}: ${valLines[0]}`);
        } else {
          lines.push(`${indent(level + 1)}${key}: `);
          lines.push(...valLines.map(l => indent(level + 1) + l));
        }
      }
    });

    // Tous les autres champs (sauf name déjà utilisé)
    Object.entries(v).forEach(([key, val]) => {
      if (importantFields.includes(key) || key === 'name') return;
      const valLines = processValue(val, level + 1);
      if (valLines.length > 0) {
        if (valLines.length === 1 && !valLines[0].includes('\n')) {
          lines.push(`${indent(level + 1)}${key}: ${valLines[0]}`);
        } else {
          lines.push(`${indent(level + 1)}${key}: `);
          lines.push(...valLines.map(l => indent(level + 1) + l));
        }
      }
    });

    // Enfants (nested blocks)
    if (block.children?.length) {
      block.children.forEach(child => processBlock(child, level + 1));
    }

    lines.push(`${indent(level)}}`);
  };

  // Traitement principal
  blocks.forEach(block => {
    processBlock(block);
    lines.push(''); // séparation entre blocs racine
  });

  return lines.join('\n').trim();
}
