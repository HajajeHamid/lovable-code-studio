// ============================================
// TP LANGUAGE TYPES
// Types de base pour le langage TechPlatform
// Version 2.0 - Complet
// ============================================

// === Token Types ===
export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'STRING'
  | 'MULTI_LINE_STRING'
  | 'NUMBER'
  | 'UNIT_VALUE'
  | 'BOOLEAN'
  | 'OPERATOR'
  | 'PUNCTUATION'
  | 'DECORATOR'
  | 'COMMENT'
  | 'WHITESPACE'
  | 'NEWLINE'
  | 'UNKNOWN'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  length: number;
}

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

// === AST Node Types ===
export type NodeType =
  | 'Program'
  | 'Module'
  | 'Directive'
  | 'DirectivesAvancees'
  | 'Import'
  | 'Macro'
  | 'Enum'
  | 'DataJson'
  | 'Model'
  | 'Field'
  | 'Relation'
  | 'Component'
  | 'Page'
  | 'API'
  | 'Endpoint'
  | 'Microservice'
  | 'EventBus'
  | 'Webhook'
  | 'Integration'
  | 'Deploy'
  | 'Test'
  | 'TestGen'
  | 'TestSuite'
  | 'Security'
  | 'AutoGen'
  | 'ApiGen'
  | 'Block'
  | 'Property'
  | 'Array'
  | 'Object'
  | 'Literal'
  | 'Reference'
  // Architecture Patterns
  | 'Template'
  | 'Blueprint'
  | 'Plugin'
  | 'BusinessRule'
  | 'Workflow'
  | 'Saga'
  | 'Step'
  | 'CQRS'
  | 'EventSourcing'
  | 'Projection'
  | 'Snapshot'
  // Infrastructure
  | 'Cache'
  | 'IndexStrategy'
  | 'Health'
  | 'Monitoring'
  | 'Metrics'
  | 'Alert'
  // Frontend
  | 'ComponentLibrary'
  | 'Section'
  | 'Layout'
  | 'Search'
  | 'RealTime'
  // Database
  | 'Database'
  | 'Index'
    // Directives ajoutées précédemment
  | 'GenTest'
  | 'CRUDGen'
  | 'UIGen'
  | 'ComponentGen'
  | 'RelationPathGen'
  | 'MockDataGen'
  | 'DocGen'
  | 'PerfOptGen'
  | 'SecScanGen'
  | 'MigrationGen'
  | 'GraphQLGen'
  | 'RESTGen'
  | 'WebSocketGen'
  | 'APIGen'
  | 'CICDGen';

export type DataType =
  | 'String'
  | 'Int'
  | 'Float'
  | 'Decimal'
  | 'Boolean'
  | 'DateTime'
  | 'Json'
  | 'Bytes'
  | { type: 'Enum'; name: string }
  | { type: 'Reference'; model: string }
  | { type: 'Array'; elementType: DataType }
  | { type: 'Custom'; name: string };

export interface TestGenNode extends ASTNode {
  type: 'TestGen' | 'GenTest';
  target: string;
  framework: 'Jest' | 'Mocha' | 'Vitest' | 'Cypress' | string;
  coverage?: number;
  types?: ('UNIT' | 'INTEGRATION' | 'E2E' | 'PERFORMANCE' | string)[];
  options?: Record<string, any>;
}

export interface BlockNode extends ASTNode {
  type: 'Block';
  name?: string;
  blockId: string;                      // identifiant unique dans le canvas
  position?: { x: number; y: number };
  connections?: Array<{
    sourceId: string;
    targetId: string;
    type: 'reference' | 'dependency' | 'relation' | 'import';
    label?: string;
  }>;
  collapsed?: boolean;
  locked?: boolean;
  metadata?: Record<string, any>;       // données libres (ex: couleur, icône custom)
}

export interface TestSuiteNode extends ASTNode {
  type: 'TestSuite';
  name: string;
  tests: string[];                      // noms ou IDs des tests inclus
  setup?: string;                       // code ou hook beforeAll
  teardown?: string;                    // code ou hook afterAll
  timeout?: number | string;            // ex: 30000 ou '30s'
}

export interface SecurityNode extends ASTNode {
  type: 'Security';
  name?: string;
  auth?: 'JWT' | 'OAuth2' | 'Basic' | 'API_KEY' | string;
  encryption?: 'AES-256' | 'RSA' | string;
  roles?: string[];
  policies?: Record<string, any>;
  rateLimit?: { limit: number; window: string };
}

export interface ApiGenNode extends ASTNode {
  type: 'APIGen';
  spec: string;    
  framework?: 'Express' | 'NestJS' | 'FastAPI' | string;
  output?: string;
  options?: {
    auth?: boolean;
    validation?: boolean;
    docs?: boolean;
  };
}

export interface PluginNode extends ASTNode {
  type: 'Plugin';
  name: string;
  target?: string;                      // composant ou système cible
  hooks?: string[];                     // ex: ['onInit', 'onRequest', 'onError']
  priority?: number;                    // ordre d'exécution (plus bas = plus tôt)
  code?: string;                        // implémentation
}

export interface IndexStrategyNode extends ASTNode {
  type: 'IndexStrategy';
  name: string;
  entity: string;                       // modèle cible
  strategy?: 'BTREE' | 'HASH' | 'GIN' | 'FULLTEXT' | 'SPATIAL';
  fields: string[];                     // champs indexés
  unique?: boolean;
  composite?: boolean;                  // index multi-champs
  customConfig?: Record<string, any>;   // ex: { ginPendingList: true }
}

export interface ComponentLibraryNode extends ASTNode {
  type: 'ComponentLibrary';
  name: string;
  components: string[];
  theme?: 'light' | 'dark' | string;
  version?: string;
  exports?: string[];
}

export interface LayoutNode extends ASTNode {
  type: 'Layout';
  name: string;
  typeLayout: 'grid' | 'flex' | 'stack' | 'sidebar' | string;
  sections?: Array<{ name: string; position?: 'header' | 'main' | 'footer' }>;
  responsive?: Record<string, string>;
}

export interface SearchNode extends ASTNode {
  type: 'Search';
  name: string;
  engine?: 'Elasticsearch' | 'Algolia' | 'DBNative' | string;
  fields?: string[];                    // champs recherchés
  fuzziness?: boolean;
  ranking?: Record<string, number>;     // poids des champs
}

export interface RealTimeNode extends ASTNode {
  type: 'RealTime';
  name: string;
  channels?: string[];                  // noms des channels
  authRequired?: boolean;
  transport?: 'WebSocket' | 'SSE' | 'LongPolling';
  fallback?: string;
}

export interface DatabaseNode extends ASTNode {
  type: 'Database';
  name?: string;
  typeDb: 'PostgreSQL' | 'MongoDB' | 'MySQL' | 'SQLite' | string;
  models?: string[];                    // noms des modèles
  connection?: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;                  // à sécuriser
    database?: string;
  };
  pooling?: {
    min?: number;
    max?: number;
    idleTimeout?: number;
  };
}

export interface IndexNode extends ASTNode {
  type: 'Index';
  name: string;
  entity: string;
  fields: string[];
  typeIndex?: 'BTREE' | 'HASH' | 'GIN' | 'FULLTEXT';
  unique?: boolean;
  where?: string;                       // condition partielle (ex: WHERE active = true)
}

export interface ASTNode {
  type: NodeType;
  name?: string;
  value?: any;
  children?: ASTNode[];
  properties?: Record<string, any>;
  decorators?: Decorator[];
  location?: SourceLocation;
  metadata?: NodeMetadata;
}

export interface SourceLocation {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

export interface NodeMetadata {
  documentation?: string;
  deprecated?: boolean;
  version?: string;
  author?: string;
}

export interface Decorator {
  name: string;
  arguments?: any[];
  properties?: Record<string, any>;
}

export interface HealthCheckItem {
  name: string;
  type: 'database' | 'api' | 'memory' | 'disk' | 'custom';
  threshold?: any;
}

export interface GenTestNode extends ASTNode {
  type: 'GenTest';
  target: string; // e.g., 'Model' or 'API'
  framework: string; // e.g., 'Jest'
  coverage: number; // e.g., 80
  types: string[]; // ['UNIT', 'INTEGRATION']
}

export interface CRUDGenNode extends ASTNode {
  type: 'CRUDGen';
  for: string; // e.g., 'DossierUtilisateur'
  operations: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE')[];
  role: string;
}

export interface UIGenNode extends ASTNode {
  type: 'UIGen';
  for: string; // Model or Page
  framework: string; // 'React'
  options: { forms: boolean; dashboards: boolean; };
}

export interface ComponentGenNode extends ASTNode {
  type: 'ComponentGen';
  name: string;
  props: PropDefinition[];
  variants: VariantDefinition[];
}

export interface RelationPathGenNode extends ASTNode {
  type: 'RelationPathGen';
  from: string; // Starting model
  maxDepth: number;
  output: 'JSON' | 'Graphviz';
}

export interface MockDataGenNode extends ASTNode {
  type: 'MockDataGen';
  for: string;
  count: number;
  format: 'JSON' | 'SQL';
}

export interface DocGenNode extends ASTNode {
  type: 'DocGen';
  strategy: 'Swagger' | 'JSDoc';
  output: string;
}

export interface PerfOptGenNode extends ASTNode {
  type: 'PerfOptGen';
  strategy: 'Caching' | 'Indexing';
  ttl?: string;
}

export interface SecScanGenNode extends ASTNode {
  type: 'SecScanGen';
  tools: string[]; // e.g., 'OWASP ZAP'
}

export interface MigrationGenNode extends ASTNode {
  type: 'MigrationGen';
  from: string;
  to: string;
}

export interface GraphQLGenNode extends ASTNode {
  type: 'GraphQLGen';
  schema: string;
}

export interface RESTGenNode extends ASTNode {
  type: 'RESTGen';
  endpoints: EndpointNode[];
}

export interface WebSocketGenNode extends ASTNode {
  type: 'WebSocketGen';
  events: string[];
}

export interface ImportNode extends ASTNode {
  type: 'Import';
  path: string;
  alias?: string;
  resolved?: boolean;
  content?: ProgramNode;
  from: string;
  items?: string[];
}

export interface ModuleNode extends ASTNode {
  type: 'Module';
  name: string;
  enums: EnumNode[];
  dataJsons: DataJsonNode[];
  models: ModelNode[];
  children: ASTNode[];
}

export interface DirectiveNode extends ASTNode {
  type: 'Directive';
  name: string;
  target?: string;
  config: Record<string, any>;
  children: ASTNode[];
  orchestration?: {
    sequence: string[];
    dependencies: Record<string, string[]>; 
    parallelJobs?: boolean; 
  };
}

export interface CICDGenNode extends ASTNode {
  type: 'CICDGen';
  target: 'GITHUB_ACTIONS' | 'GITLAB_CI' | 'JENKINS' | 'AZURE_DEVOPS'; // Providers inspirés de recherche
  name: string;
  steps: CICDStep[]; // Étapes séquentielles
  environment: 'development' | 'staging' | 'production';
  triggers: ('push' | 'pull_request' | 'schedule')[]; // Triggers comme dans GitHub Actions
  jobs: Record<string, CICDJob>; // Jobs parallèles, e.g., 'build', 'test', 'deploy'
  artifacts?: string[]; // Fichiers à archiver (e.g., generated code)
  cache?: { paths: string[]; key: string }; // Cache pour accélérer (e.g., node_modules)
  secrets?: Record<string, string>; // e.g., { AWS_KEY: '${{ secrets.AWS_KEY }}' }
  matrix?: Record<string, string[]>; // Pour tests multi-versions (e.g., node: ['14', '16'])
}

export interface CICDStep {
  name: string;
  run: string; // Commande (e.g., 'npx tp-generate')
  uses?: string; // Action externe (e.g., 'actions/checkout@v3')
  with?: Record<string, string>; // Params (e.g., { repository: 'owner/repo' })
  env?: Record<string, string>; // Variables d'env
  if?: string; // Condition (e.g., 'github.event_name == "push"')
}

export interface CICDJob {
  name: string;
  runsOn: string; // e.g., 'ubuntu-latest'
  steps: CICDStep[];
  needs?: string[]; // Dépendances (e.g., ['build'])
  strategy?: { matrix: Record<string, string[]> }; // Pour parallélisme
}

export interface BlockDefinition {
  id: string;
  type: BlockType;
  name: string;
  node: ASTNode;
  position: { x: number; y: number };
  connections: BlockConnection[];
  collapsed?: boolean;
  locked?: boolean;
}

export interface EnumNode extends ASTNode {
  type: 'Enum';
  name: string;
  values: EnumValue[];
  module?: string;
}

export interface EnumValue {
  name: string;
  value?: string | number;
  documentation?: string;
}

export interface DataJsonNode extends ASTNode {
  type: 'DataJson';
  name: string;
  fields: FieldNode[];
}

export interface ModelNode extends ASTNode {
  type: 'Model';
  name: string;
  fields: FieldNode[];
  relations: RelationNode[];
  indexes?: IndexDefinition[];
  constraints?: ConstraintDefinition[];
  documentation?: ModelDocumentation;
}

export interface ModelDocumentation {
  description?: string;
  version?: string;
  examples?: Record<string, any>;
  author?: string;
}

export interface FieldNode extends ASTNode {
  type: 'Field';
  name: string;
  dataType: DataType;
  isRequired: boolean;
  isUnique: boolean;
  isImmutable: boolean;
  isArray?: boolean;
  defaultValue?: any;
  validators?: FieldValidator[];
  decorators?: Decorator[];
}

export interface FieldValidator {
  type: string;
  value?: any;
  message?: string;
}

export interface RelationNode extends ASTNode {
  type: 'Relation';
  name: string;
  target: string;
  isArray?: boolean;
  relationType: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
  foreignKey?: string;
  onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
  onUpdate?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
}

export interface IndexDefinition {
  name: string;
  fields: string[];
  unique?: boolean;
  type?: 'BTREE' | 'HASH' | 'GIN' | 'GIST';
}

export interface ConstraintDefinition {
  name: string;
  type: 'CHECK' | 'UNIQUE' | 'FOREIGN_KEY' | 'PRIMARY_KEY';
  expression?: string;
  fields?: string[];
}

export interface ComponentNode extends ASTNode {
  type: 'Component';
  name: string;
  props: PropDefinition[];
  variants?: VariantDefinition[];
  styles?: StyleDefinition;
  animations?: AnimationDefinition[];
  accessibility?: AccessibilityConfig;
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  documentation?: string;
}

export interface VariantDefinition {
  name: string;
  className: string;
  style: string;
  values: string[];
  defaultValue?: string;
}

export interface StyleDefinition {
  base?: string;
  variants?: Record<string, Record<string, string>>;
  sizes?: Record<string, string>;
}

export interface AnimationDefinition {
  name: string;
  keyframes?: Record<string, any>;
  duration?: string;
  easing?: string;
}

export interface AccessibilityConfig {
  role?: string;
  ariaLabel?: string;
  focusTrap?: boolean;
  restoreFocus?: boolean;
}

export interface PageNode extends ASTNode {
  type: 'Page';
  name: string;
  path: string;
  layout?: string;
  authGuard?: 'public' | 'authenticated' | 'admin' | string;
  sections: SectionNode[];
  seo?: SEOConfig;
  performance?: PerformanceConfig;
  auth?: 'required' | 'optional' | 'none';
  dataFetching?: DataFetchingConfig;
}

export interface SectionDefinition {
  name: string;
  component: string;
  props?: Record<string, any>;
  data?: DataSource;
}

export interface DataSource {
  type: 'static' | 'api' | 'dynamic';
  source?: string;
  params?: Record<string, any>;
}

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface PerformanceConfig {
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  preload?: string[];
  prefetch?: string[];
}

export interface DataFetchingConfig {
  method: 'server_component' | 'client' | 'static';
  sources: DataFetchingSource[];
}

export interface DataFetchingSource {
  key: string;
  endpoint: string;
  cache?: string;
  realtime?: boolean;
}

export interface MicroserviceNode extends ASTNode {
  type: 'Microservice';
  name: string;
  port: number;
  domain: string;
  dependencies: string[];
  api: APINode;
  database?: DatabaseNode;
  eventBus?: EventBusNode;
  monitoring?: MonitoringNode;
  security?: SecurityNode;
}

export interface APINode extends ASTNode {
  type: 'API';
  apiType: 'REST' | 'GraphQL' | 'gRPC';
  version?: string;
  basePath?: string;
  endpoints: EndpointNode[];
  security?: SecurityConfig;
  schema?: GraphQLSchemaConfig;
}

export interface GraphQLSchemaConfig {
  types: string[];
  queries: Record<string, string>;
  mutations: Record<string, string>;
  subscriptions?: Record<string, string>;
}

export interface EndpointNode extends ASTNode {
  type: 'Endpoint';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  handler?: string;
  middleware?: string[];
  request?: SchemaDefinition;
  response?: SchemaDefinition;
  description?: string;
}

export interface SchemaDefinition {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
}

export interface SecurityConfig {
  authentication?: AuthConfig;
  authorization?: AuthorizationConfig;
  rateLimiting?: RateLimitSecurityConfig;
  cors?: CORSConfig;
  jwt?: JWTConfig;
  passwordPolicy?: PasswordPolicyConfig;
}

export interface JWTConfig {
  secret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  algorithm: string;
}

export interface PasswordPolicyConfig {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecial: boolean;
  preventCommon: boolean;
  history: number;
}

export interface AuthConfig {
  type: 'JWT' | 'OAuth2' | 'API_KEY' | 'Basic';
  secret?: string;
  expiresIn?: string;
  refreshToken?: boolean;
}

export interface AuthorizationConfig {
  type: 'RBAC' | 'ABAC' | 'ACL';
  roles?: string[];
  permissions?: string[];
}

export interface RateLimitSecurityConfig {
  requests: number;
  per: string;
}

export interface RateLimitIntegrationConfig {
  limit: number;
  window: string;
}

export interface CORSConfig {
  origins: string[];
  methods: string[];
  headers?: string[];
}

export interface DatabaseConfig {
  type: 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'SQLite' | 'Redis';
  models: string[];
  cache?: CacheConfig;
}

export interface CacheConfig {
  strategy: 'READ_THROUGH' | 'WRITE_THROUGH' | 'CACHE_ASIDE';
  ttl: string;
  invalidation?: string[];
  paths: string[];
  key?: string;
  restoreKeys?: string[];
  upload?: boolean;
}

export interface EventBusConfig {
  events: string[];
  subscribers: EventSubscriber[];
}

export interface EventSubscriber {
  event: string;
  handler: string;
}

export interface MonitoringConfig {
  metrics: string[];
  alerts: AlertConfig[];
}

export interface AutoGenNode extends ASTNode {
  type: 'AutoGen';
  target: 'Backend' | 'Frontend' | 'Database' | 'API' | 'Tests';
  framework?: string;
  language?: string;
  orm?: string;
  database?: string;
  models: string[];
  views?: string[];
  options: AutoGenOptions;
  structure?: Record<string, any>;
}

export interface AutoGenOptions {
  migrations?: boolean;
  seeding?: boolean;
  relations?: 'unidirectional' | 'bidirectional';
  softDelete?: boolean;
  timestamps?: boolean | 'auto';
  versioning?: boolean;
  components?: boolean;
  pages?: boolean;
  hooks?: boolean;
  layouts?: boolean;
  utils?: boolean;
  queryOptimization?: QueryOptimizationConfig;
  autoIndexing?: AutoIndexingConfig;
}

export interface QueryOptimizationConfig {
  eagerLoading?: 'smart' | 'always' | 'never';
  nPlusOnePrevention?: boolean;
  queryCaching?: string;
  connectionPooling?: ConnectionPoolingConfig;
}

export interface ConnectionPoolingConfig {
  min: number;
  max: number;
  idleTimeout: number;
}

export interface AutoIndexingConfig {
  foreignKeys?: boolean;
  uniqueConstraints?: boolean;
  fullTextSearch?: string[];
  compositeIndexes?: string[][];
}

export interface DeployNode extends ASTNode {
  type: 'Deploy';
  target: 'AWS' | 'GCP' | 'Azure' | 'Vercel' | 'Docker' | 'Kubernetes';
  region?: string;
  services?: string[];
  cicd?: string;
  environment?: string;
}

// === Test ===
export interface TestNode extends ASTNode {
  type: 'Test' | 'TestGen' | 'TestSuite';
  name?: string;
  coverage?: number;
  types: ('UNIT' | 'INTEGRATION' | 'E2E' | 'PERFORMANCE')[];
  framework?: string;
  scenarios?: string[];
  unit?: UnitTestConfig;
  integration?: IntegrationTestConfig;
  e2e?: E2ETestConfig;
  performance?: PerformanceTestConfig;
}

export interface UnitTestConfig {
  coverage: string;
  frameworks: string[];
}

export interface IntegrationTestConfig {
  scenarios: string[];
}

export interface E2ETestConfig {
  flows: string[];
  tools: string[];
}

export interface PerformanceTestConfig {
  load: string;
  stress: string;
}

export interface IntegrationNode extends ASTNode {
  type: 'Integration';
  name: string;
  provider: string;
  version: string;
  auth: IntegrationAuthConfig;
  endpoints: Record<string, string>;
  mapping: Record<string, string>;
  rateLimit?: RateLimitIntegrationConfig;
  retry?: RetryConfig;
}

export interface IntegrationAuthConfig {
  type: 'API_KEY' | 'OAuth2' | 'Basic';
  credentials: string;
}

export interface RetryConfig {
  attempts: number;
  backoff: 'linear' | 'exponential';
  maxDelay?: string;
}

export interface WebhookNode extends ASTNode {
  type: 'Webhook';
  name: string;
  url: string;
  events: string[];
  security?: WebhookSecurityConfig;
  retry?: RetryConfig;
  handlers?: Record<string, string>;
}

export interface WebhookSecurityConfig {
  signature: string;
  verification: string;
  tolerance?: string;
}

export interface SagaNode extends ASTNode {
  type: 'Saga';
  name: string;
  trigger: string;
  steps: SagaStepNode[];
  timeout?: string;
  retry?: string;
}

export interface SagaStepNode extends ASTNode {
  type: 'Step';
  name: string;
  action: string;
  compensate?: string | StepNode;
  onSuccess?: string | StepNode;
  onFailure?: string | StepNode;
}

export interface BlueprintNode extends ASTNode {
  type: 'Blueprint';
  name: string;
  stack: StackConfig;
  architecture: ArchitectureConfig;
  features: string[];
  infrastructure: InfrastructureConfig;
}

export interface StackConfig {
  frontend: string;
  backend: string;
  database: string;
  cache?: string;
  queue?: string;
}

export interface ArchitectureConfig {
  pattern: string;
  layers: string[];
}

export interface InfrastructureConfig {
  hosting: string;
  ciCd: string;
  monitoring: string;
}

export interface TemplateNode extends ASTNode {
  type: 'Template';
  name: string;
  extends?: string;
  params: TemplateParam[];
  structure: Record<string, any>;
  generate: Record<string, any>;
}

export interface TemplateParam {
  name: string;
  type: string;
  defaultValue?: any;
}

export interface BusinessRuleNode extends ASTNode {
  type: 'BusinessRule';
  name: string;
  entity: string;
  condition: string;
  validate?: ValidateConfig;
  onViolation?: ViolationConfig;
  schedule?: string;
  action?: string;
}

export interface ValidateConfig {
  check: string;
  trigger: string;
}

export interface ViolationConfig {
  action: 'REJECT' | 'WARN' | 'LOG';
  message: string;
}

export interface WorkflowNode extends ASTNode {
  type: 'Workflow';
  name: string;
  entity: string;
  states: string[];
  transitions: WorkflowTransition[];
  guards?: Record<string, string>;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  when: string;
}

export interface CacheNode extends ASTNode {
  type: 'Cache';
  entity?: string;
  strategy: 'READ_THROUGH' | 'WRITE_THROUGH' | 'CACHE_ASIDE' | string;
  ttl: string;
  keys?: CacheKeysConfig;
  warming?: CacheWarmingConfig;
}

export interface CacheKeysConfig {
  pattern: string;
  invalidation: string[];
}

export interface CacheWarmingConfig {
  on: string;
  data: string;
}

export interface HealthCheckNode extends ASTNode {
  type: 'Health';
  name: string;
  endpoint?: string;
  checks: HealthCheckItem[];
  interval?: string;
}

export interface BlockConnection {
  sourceId: string;
  targetId: string;
  type: 'reference' | 'import' | 'dependency' | 'relation';
  label?: string;
}

export interface ParseResult {
  success: boolean;
  program?: ProgramNode;
  errors: ParseError[];
  warnings: ParseWarning[];
  statistics: ParseStatistics;
}

export interface ParseError {
  message: string;
  location: SourceLocation;
  code: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface ParseWarning {
  message: string;
  location: SourceLocation;
  code: string;
}

export interface ParseStatistics {
  totalLines: number;
  totalTokens: number;
  modules: number;
  enums: number;
  dataJsons: number;
  models: number;
  components: number;
  pages: number;
  microservices: number;
  imports: number;
  autoGens: number;
  deploys: number;
  tests: number;
  integrations: number;
  sagas: number;
  businessRules: number;
  parseTime: number;
}

export interface GraphNode {
  id: string;
  type: BlockType;
  label: string;
  data: ASTNode;
  position?: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'reference' | 'import' | 'dependency' | 'relation' | 'contains';
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface MacroNode extends ASTNode {
  type: 'Macro';
  name: string;
  params: Array<{ name: string; type: string; defaultValue?: any }>;
  code: string;  
}

export interface IndexConfig {
  name?: string;
  fields: string[];
  type?: 'BTREE' | 'HASH' | 'GIN' | 'FULLTEXT' | 'SPATIAL';
  unique?: boolean;
}

export interface DirectivesAvanceesNode extends ASTNode {
  type: 'DirectivesAvancees';
  name: string;
  hostBindings?: Record<string, string>;
  hostListeners?: Record<string, string>;
  code?: string;
}

export interface LiteralNode extends ASTNode {
  type: 'Literal';
  /**
   * La valeur littérale effective (string | number | boolean | null | bigint)
   */
  value: string | number | boolean | null | bigint;
  
  /**
   * Représentation textuelle brute telle qu'écrite dans le code source
   * (utile pour préserver les guillemets, les formats hexadécimaux, etc.)
   */
  raw?: string;
  
  /**
   * Type littéral explicite (optionnel, peut être déduit de value)
   */
  literalType?: 'string' | 'number' | 'boolean' | 'null' | 'bigint';
  
  /**
   * Documentation ou commentaire associé à cette valeur littérale
   */
  documentation?: string;
  
  /**
   * Décorateurs éventuels appliqués directement à la valeur littérale
   * (rare, mais possible dans certains contextes de meta-programmation)
   */
  decorators?: Decorator[];
}

export interface StepNode extends ASTNode {
  type: 'Step';
  
  /**
   * Nom unique ou descriptif de l'étape (doit être unique dans son parent)
   */
  name: string;
  
  /**
   * Description fonctionnelle de ce que fait l'étape
   */
  description?: string;
  
  /**
   * Type d'action principale réalisée par cette étape
   */
  action: string;                       // ex: 'createRecord', 'sendEmail', 'callApi', 'runScript'
  
  /**
   * Référence à une fonction, un handler, un service ou un endpoint
   * (peut être un identifiant ou un chemin qualifié)
   */
  handler?: string;
  
  /**
   * Paramètres d'entrée spécifiques à cette étape
   */
  inputs?: Record<string, any | LiteralNode | ReferenceNode>;
  
  /**
   * Sorties attendues (peut servir à la validation ou au typage)
   */
  outputs?: Record<string, DataType | LiteralNode>;
  
  /**
   * Action de compensation (rollback) en cas d'échec — surtout utilisé dans les Sagas
   */
  compensate?: string | StepNode;
  
  /**
   * Étape suivante en cas de succès (optionnel si flux linéaire)
   */
  onSuccess?: string | StepNode;
  
  /**
   * Étape ou action en cas d'échec (alternative à compensate)
   */
  onFailure?: string | StepNode;
  
  /**
   * Conditions de garde (prerequisites) pour exécuter cette étape
   */
  when?: string | LiteralNode | BusinessRuleNode;
  
  /**
   * Timeout maximum autorisé pour cette étape
   */
  timeout?: string;                     // ex: '30s', '5m', '1h'
  
  /**
   * Stratégie de retry en cas d'échec temporaire
   */
  retry?: {
    maxAttempts: number;
    backoff?: 'linear' | 'exponential' | 'fixed';
    delay?: string;                     // ex: '2s'
    maxDelay?: string;
  };
  
  /**
   * Métadonnées supplémentaires (ex: icône UI, couleur dans le canvas, etc.)
   */
  metadata?: Record<string, any>;
}

export interface EventBusNode extends ASTNode {
  type: 'EventBus';
  name: string;
  events: string[];
  subscribers: EventSubscriber[];
  transport?: 'RabbitMQ' | 'Kafka' | 'Redis' | string;
  retryPolicy?: RetryConfig;
  deadLetterQueue?: string;
}

export interface PropertyNode extends ASTNode {
  type: 'Property';
  name: string;
  value: any;
  dataType?: DataType;
  decorators?: Decorator[];
}

export interface ArrayNode extends ASTNode {
  type: 'Array';
  elements: ASTNode[];  // Peut inclure Literal, Reference, etc.
  elementType?: DataType;
}

export interface ObjectNode extends ASTNode {
  type: 'Object';
  properties: PropertyNode[];
}

export interface ReferenceNode extends ASTNode {
  type: 'Reference';
  target: string;  // e.g., Model ou Enum référencé
  path?: string;
}

export interface EventSourcingNode extends ASTNode {
  type: 'EventSourcing';
  name: string;
  aggregate: string;
  events: string[];
  snapshots?: SnapshotNode[];
  eventStore?: string;
}

export interface ProjectionNode extends ASTNode {
  type: 'Projection';
  name: string;
  source: string;  // e.g., Event ou Aggregate
  fields: string[];
  handler: string;
}

export interface SnapshotNode extends ASTNode {
  type: 'Snapshot';
  name: string;
  aggregate: string;
  version: number;
  frequency?: string;  // e.g., 'every 100 events'
}

export interface MonitoringNode extends ASTNode {
  type: 'Monitoring';
  name: string;
  metrics: string[];
  alerts: AlertConfig[];
  provider?: 'Prometheus' | 'Datadog' | 'NewRelic' | string;
  dashboards?: string[];
}

export interface MetricNode extends ASTNode {
  type: 'Metrics';
  name: string;
  strategy: 'counter' | 'gauge' | 'histogram' | 'summary';
  labels?: string[];
  help?: string;
}

export interface AlertNode extends ASTNode {
  type: 'Alert';
  name: string;
  condition: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: string;  // e.g., 'email' ou 'slack'
  threshold: any;
}

export interface SectionNode extends ASTNode {
  type: 'Section';
  name: string;
  component: string;
  props?: Record<string, any>;
  data?: DataSource;
  position?: 'header' | 'main' | 'footer' | string;
}

export interface ProgramNode extends ASTNode {
  type: 'Program';
  // Structure hiérarchique principale
  imports: ImportNode[];
  modules?: ModuleNode[];
  directives?: DirectiveNode[];
  macros?: MacroNode[];
  
  // Éléments de données
  enums: EnumNode[];
  dataJsons: DataJsonNode[];
  models: ModelNode[];
  fields?: FieldNode[];  // Ajout pour exhaustivité, bien que souvent enfants de Model
  relations?: RelationNode[];  // Correction de l'erreur existante (était SecurityNode[])
  
  // UI
  components: ComponentNode[];
  pages: PageNode[];
  sections?: SectionNode[];
  layouts?: LayoutNode[];
  componentLibraries?: ComponentLibraryNode[];
  
  // API & infra
  apis?: APINode[];
  microservices?: MicroserviceNode[];
  eventBuses?: EventBusNode[];
  webhooks?: WebhookNode[];
  integrations?: IntegrationNode[];
  endpoints?: EndpointNode[];  // Correction de l'erreur existante (était SecurityNode[])
  
  // Patterns & logique métier
  businessRules?: BusinessRuleNode[];
  workflows?: WorkflowNode[];
  sagas?: SagaNode[];
  cqrsContexts?: CQRSNode[];
  eventSourcings?: EventSourcingNode[];
  steps?: StepNode[];  // Correction de l'erreur existante (était SecurityNode[])
  projections?: ProjectionNode[];
  snapshots?: SnapshotNode[];
  
  // Génération & infra
  autoGens?: AutoGenNode[];
  apiGens?: ApiGenNode[];
  crudGens?: CRUDGenNode[];
  uiGens?: UIGenNode[];
  componentGens?: ComponentGenNode[];
  relationPathGens?: RelationPathGenNode[];
  mockDataGens?: MockDataGenNode[];
  docGens?: DocGenNode[];
  perfOptGens?: PerfOptGenNode[];
  secScanGens?: SecScanGenNode[];
  migrationGens?: MigrationGenNode[];
  graphQLGens?: GraphQLGenNode[];
  restGens?: RESTGenNode[];
  webSocketGens?: WebSocketGenNode[];
  cicdGens?: CICDGenNode[];
  deploys?: DeployNode[];
  caches?: CacheNode[];
  healthChecks?: HealthCheckNode[];
  monitors?: MonitoringNode[];
  metrics?: MetricNode[];
  alerts?: AlertNode[];
  indexStrategies?: IndexStrategyNode[];
  
  // Autres
  templates?: TemplateNode[];
  blueprints?: BlueprintNode[];
  plugins?: PluginNode[];
  tests?: TestNode[];
  testSuites?: TestSuiteNode[];
  securityRules?: SecurityNode[];
  directivesAvancees?: DirectivesAvanceesNode[];
  blocks?: BlockNode[];
  properties?: PropertyNode[];
  arrays?: ArrayNode[];
  objects?: ObjectNode[];
  genTests?: GenTestNode[];
  literals?: LiteralNode[];
  references?: ReferenceNode[];
  indexes?: IndexNode[];
  realTimes?: RealTimeNode[];
  searches?: SearchNode[];
  databases?: DatabaseNode[];
}

export interface Command {
  name: string;
  handler: string;
  aggregate: string;
}

export interface Query {
  name: string;
  handler: string;
  viewModel: string;
}

export interface CQRSNode extends ASTNode {
  type: 'CQRS';
  name: string;
  boundedContext?: string;
  commands: Command[];  // Changé de string[] pour matcher parser
  queries: Query[];     // Changé de string[]
  commandHandlers?: Record<string, string>;
  queryHandlers?: Record<string, string>;
  events?: string[];    // Ajouté
  readModel?: string;   // Ajouté
  writeModel?: string;  // Ajouté
  projections?: ProjectionNode[];
}

// Pour EventSourcing (harmoniser noms et ajouts)
export interface EventSourcingNode extends ASTNode {
  type: 'EventSourcing';
  name: string;
  aggregate: string;    // Utiliser 'aggregate' uniformément
  events: string[];
  snapshots?: SnapshotNode[];
  eventStore?: string;
  snapshotStrategy?: 'everyN' | 'timeBased' | string;  // Ajouté
  snapshotInterval?: number | string;                  // Ajouté
  projectors?: string[];                               // Ajouté
}

// Pour Cache (définir sous-types explicitement)
export interface CacheKeysConfig {
  pattern: string;
  invalidation: string[];
}

export interface CacheWarmingConfig {
  on: string;
  data: string;
}

// Pour Monitoring (ajouts du parser)
export interface AlertConfig {
  name: string;
  condition: string;
  severity: string;
  duration: string;
  channel: string;
}

export interface MonitoringNode extends ASTNode {
  type: 'Monitoring';
  name: string;
  provider?: string;
  metrics: string[];
  alerts: AlertConfig[];  // Aligné avec ancien parsing
  dashboards?: string[];
  alerting?: boolean;     // Ajouté
  retention?: string;     // Ajouté
  collectionInterval?: string;  // Ajouté
}

// Autres ajouts manquants (basés sur parser)
export interface EventSubscriber {
  event: string;
  handler: string;
}

export interface EventBusConfig {  // Utilisé dans parser, mais EventBusNode existe
  events: string[];
  subscribers: EventSubscriber[];
}

