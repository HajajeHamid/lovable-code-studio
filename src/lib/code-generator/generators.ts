// ============================================
// CODE GENERATORS
// Génération de code à partir de l'AST TP
// ============================================
import { 
  ProgramNode, EnumNode, DataJsonNode, ModelNode, FieldNode,
  ComponentNode, PageNode, MicroserviceNode, DataType, RelationNode,
  RelationPathGenNode, CRUDGenNode, UIGenNode, GenTestNode, MockDataGenNode,
  DeployNode, APINode, IntegrationNode, WebhookNode, SagaNode, BlueprintNode,
  TemplateNode, BusinessRuleNode, WorkflowNode, CacheNode, HealthCheckNode,
  GraphQLGenNode, RESTGenNode, WebSocketGenNode, DocGenNode, PerfOptGenNode,
  CICDGenNode, SectionNode, EndpointNode,
  SecScanGenNode, MigrationGenNode, TestGenNode, BlockNode, DirectiveNode, TestSuiteNode, SecurityNode, ApiGenNode, PluginNode, IndexStrategyNode, ComponentLibraryNode, LayoutNode, SearchNode, RealTimeNode, DatabaseNode, IndexNode,
  ImportNode, ModuleNode, MacroNode, CQRSNode, EventSourcingNode, ProjectionNode, SnapshotNode, MetricNode, AlertNode, MonitoringNode, StepNode, PropertyNode, ArrayNode, ObjectNode, LiteralNode, ReferenceNode, EventBusNode, DirectivesAvanceesNode, TestNode,
  ComponentGenNode, AutoGenNode, EventBusConfig, AlertConfig, CacheKeysConfig, CacheWarmingConfig, Command, Query
} from '../tp-parser/types';

// ============================================
// UTILITAIRES
// ============================================

function mapDataTypeToTS(dataType: DataType): string {
  if (typeof dataType === 'string') {
    switch (dataType) {
      case 'String': return 'string';
      case 'Int': return 'number';
      case 'Float': return 'number';
      case 'Decimal': return 'number';
      case 'Boolean': return 'boolean';
      case 'DateTime': return 'Date';
      case 'Json': return 'Record<string, any>';
      case 'Bytes': return 'Buffer';
      default: return 'any';
    }
  } else {
    switch (dataType.type) {
      case 'Enum': return dataType.name;
      case 'Reference': return dataType.model;
      case 'Array': return `${mapDataTypeToTS(dataType.elementType)}[]`;
      case 'Custom': return dataType.name;
      default: return 'any';
    }
  }
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === 'number' || typeof value === 'boolean') return value.toString();
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (typeof value === 'object') return `{ ${Object.entries(value).map(([k, v]) => `${k}: ${formatValue(v)}`).join(', ')} }`;
  return JSON.stringify(value);
}

// ============================================
// GÉNÉRATEURS INDIVIDUELS
// ============================================

export function generateImport(imp: ImportNode): string {
  const items = imp.items ? `{ ${imp.items.join(', ')} }` : imp.alias ? `* as ${imp.alias}` : '';
  const from = imp.from || imp.path || '';
  const resolved = imp.resolved ? '// Resolved' : '// Unresolved';
  return `import ${items} from '${from}'; ${resolved}`;
}

export function generateModule(mod: ModuleNode): string {
  const lines: string[] = [];
  lines.push(`export module ${mod.name} {`);
  mod.enums.forEach(en => lines.push(generateEnum(en)));
  mod.dataJsons.forEach(dj => lines.push(generateDataJson(dj)));
  mod.models.forEach(model => lines.push(generateModel(model)));
  mod.children.forEach(child => {
    switch (child.type) {
      case 'Component': lines.push(generateComponent(child as ComponentNode)); break;
      case 'Directive': lines.push(generateDirective(child as DirectiveNode)); break;
      default: lines.push(`// Child ${child.type}`);
    }
  });
  lines.push(`}`);
  return lines.join('\n');
}

export function generateDirective(dir: DirectiveNode): string {
  return `@Directive({\n  selector: '[${dir.name}]'\n})\nexport class ${dir.name}Directive {}`;
}

export function generateMacro(macro: MacroNode): string {
  const params = macro.params.map(p => `${p.name}: ${p.type}${p.defaultValue ? ` = ${formatValue(p.defaultValue)}` : ''}`).join(', ');
  return `export function ${macro.name}(${params}) {\n  ${macro.code}\n}`;
}

export function generateEnum(en: EnumNode): string {
  const values = en.values.map(v => {
    const val = v.value !== undefined ? ` = ${formatValue(v.value)}` : '';
    const doc = v.documentation ? `// ${v.documentation}` : '';
    return `${v.name}${val}${doc}`;
  }).join(',\n  ');
  const module = en.module ? `// Module: ${en.module}` : '';
  return `export enum ${en.name} {\n  ${values}\n}${module}`;
}

export function generateDataJson(dj: DataJsonNode): string {
  const fields = dj.fields.map(f => generateField(f)).join('\n  ');
  return `export interface ${dj.name} {\n  ${fields}\n}`;
}

export function generateModel(model: ModelNode): string {
  const fields = model.fields.map(f => generateField(f)).join('\n');
  return `export interface ${model.name} {\n${fields}\n}`;
}

export function generatePage(page: PageNode): string {
  const path = page.path ? `// Path: ${page.path}` : '';
  const layout = page.layout ? `// Layout: ${page.layout}` : '';
  const authGuard = page.authGuard ? `// AuthGuard: ${page.authGuard}` : '';
  const sections = page.sections.map(s => generateSection(s)).join('\n');
  const seo = page.seo ? `// SEO: ${JSON.stringify(page.seo)}` : '';
  const performance = page.performance ? `// Performance: ${JSON.stringify(page.performance)}` : '';
  const auth = page.auth ? `// Auth: ${page.auth}` : '';
  const dataFetching = page.dataFetching ? `// DataFetching: ${page.dataFetching.method}` : '';
  return `export default function ${page.name}() {\n  return <div>${page.name}</div>;\n}${path}${layout}${authGuard}${sections}${seo}${performance}${auth}${dataFetching}`;
}

export function generateLayout(layout: LayoutNode): string {
  const typeLayout = layout.typeLayout ? `// Type: ${layout.typeLayout}` : '';
  const sections = layout.sections.map(s => `// Section: ${s.name}, position: ${s.position || 'main'}`).join('\n');
  const responsive = layout.responsive ? `// Responsive: ${JSON.stringify(layout.responsive)}` : '';
  return `export const ${layout.name} = ({ children }) => <div>{children}</div>;\n${typeLayout}${sections}${responsive}`;
}

export function generateComponentLibrary(lib: ComponentLibraryNode): string {
  const components = lib.components.join(', ');
  const theme = lib.theme ? `// Theme: ${lib.theme}` : '';
  const version = lib.version ? `// Version: ${lib.version}` : '';
  const exports = lib.exports.join(', ');
  return `export const ${lib.name}Library = {\n  components: [${components}],\n  exports: [${exports}]\n};\n${theme}${version}`;
}

export function generateAPI(api: APINode): string {
  const apiType = api.apiType ? `// Type: ${api.apiType}` : '';
  const version = api.version ? `// Version: ${api.version}` : '';
  const basePath = api.basePath ? `// BasePath: ${api.basePath}` : '';
  const endpoints = api.endpoints.map(ep => generateEndpoint(ep)).join('\n');
  const security = api.security ? `// Security: ${api.security}` : '';
  const schema = api.schema ? `// Schema: ${JSON.stringify(api.schema)}` : '';
  return `const router = express.Router();\n${endpoints}\n${apiType}${version}${basePath}${security}${schema}`;
}

export function generateEventBus(eb: EventBusNode): string {
  const name = eb.name ? `// Name: ${eb.name}` : '';
  const events = eb.events.join(', ');
  const subscribers = eb.subscribers.map(s => `${s.event}: ${s.handler}`).join('\n');
  const transport = eb.transport ? `// Transport: ${eb.transport}` : '';
  const retryPolicy = eb.retryPolicy ? `// Retry: ${JSON.stringify(eb.retryPolicy)}` : '';
  const deadLetterQueue = eb.deadLetterQueue ? `// DLQ: ${eb.deadLetterQueue}` : '';
  return `export const ${eb.name || 'EventBus'} = new EventEmitter();\n// Events: ${events}\n// Subscribers:\n${subscribers}${name}${transport}${retryPolicy}${deadLetterQueue}`;
}

export function generateWebhook(wh: WebhookNode): string {
  const name = wh.name ? `// Name: ${wh.name}` : '';
  const url = wh.url ? `// URL: ${wh.url}` : '';
  const events = wh.events.join(', ');
  const security = wh.security ? `// Security: ${JSON.stringify(wh.security)}` : '';
  const retry = wh.retry ? `// Retry: ${JSON.stringify(wh.retry)}` : '';
  const handlers = Object.entries(wh.handlers || {}).map(([k, v]) => `${k}: ${v}`).join('\n');
  return `app.post('/webhook', (req, res) => {});\n// Events: ${events}\n// Handlers:\n${handlers}${name}${url}${security}${retry}`;
}

export function generateIntegration(int: IntegrationNode): string {
  const name = int.name ? `// Name: ${int.name}` : '';
  const provider = int.provider ? `// Provider: ${int.provider}` : '';
  const mapping = int.mapping ? `// Mapping: ${JSON.stringify(int.mapping)}` : '';
  return `export class ${int.name || 'Integration'} {\n  constructor() {}\n}${name}${provider}${mapping}`;
}

export function generateBusinessRule(rule: BusinessRuleNode): string {
  const name = rule.name ? `// Name: ${rule.name}` : '';
  const entity = rule.entity ? `// Entity: ${rule.entity}` : '';
  const condition = rule.condition ? `// Condition: ${rule.condition}` : '';
  const validate = rule.validate ? `// Validate: ${JSON.stringify(rule.validate)}` : '';
  const onViolation = rule.onViolation ? `// OnViolation: ${JSON.stringify(rule.onViolation)}` : '';
  const schedule = rule.schedule ? `// Schedule: ${rule.schedule}` : '';
  const action = rule.action ? `// Action: ${rule.action}` : '';
  return `if (${rule.condition}) {\n  ${rule.action || ''}\n} else {\n  throw new Error();\n}${name}${entity}${validate}${onViolation}${schedule}`;
}

export function generateWorkflow(wf: WorkflowNode): string {
  const name = wf.name ? `// Name: ${wf.name}` : '';
  const entity = wf.entity ? `// Entity: ${wf.entity}` : '';
  const states = wf.states.join(', ');
  const transitions = wf.transitions.map(t => `${t.from} -> ${t.to}`).join(', ');
  const guards = Object.entries(wf.guards || {}).map(([k, v]) => `${k}: ${v}`).join('\n');
  return `type ${wf.name}State = '${states}';\nexport const transitions = [${transitions}];\n// Guards:\n${guards}${name}${entity}`;
}

export function generateSaga(saga: SagaNode): string {
  const trigger = saga.trigger ? `// Trigger: ${saga.trigger}` : '';
  const steps = saga.steps.map(s => generateStep(s)).join('\n');
  const timeout = saga.timeout ? `// Timeout: ${saga.timeout}` : '';
  const retry = saga.retry ? `// Retry: ${saga.retry}` : '';
  return `export class ${saga.name}Saga {\n  constructor() {}\n${steps}\n}${trigger}${timeout}${retry}`;
}

export function generateCQRS(cqrs: CQRSNode): string {
  const name = cqrs.name ? `// Name: ${cqrs.name}` : '';
  const boundedContext = cqrs.boundedContext ? `// BoundedContext: ${cqrs.boundedContext}` : '';
  const commands = cqrs.commands.map(c => `class ${c.name} {\n  handler: ${c.handler};\n  aggregate: ${c.aggregate};\n}`).join('\n');
  const queries = cqrs.queries.map(q => `class ${q.name} {\n  handler: ${q.handler};\n  viewModel: ${q.viewModel};\n}`).join('\n');
  const commandHandlers = Object.entries(cqrs.commandHandlers || {}).map(([k, v]) => `${k}: ${v}`).join('\n');
  const queryHandlers = Object.entries(cqrs.queryHandlers || {}).map(([k, v]) => `${k}: ${v}`).join('\n');
  const events = cqrs.events.join(', ');
  const readModel = cqrs.readModel ? `// ReadModel: ${cqrs.readModel}` : '';
  const writeModel = cqrs.writeModel ? `// WriteModel: ${cqrs.writeModel}` : '';
  const projections = cqrs.projections.map(p => generateProjection(p)).join('\n');
  return `${commands}\n${queries}\n// CommandHandlers:\n${commandHandlers}\n// QueryHandlers:\n${queryHandlers}\n// Events: ${events}${name}${boundedContext}${readModel}${writeModel}${projections}`;
}

export function generateEventSourcing(es: EventSourcingNode): string {
  const name = es.name ? `// Name: ${es.name}` : '';
  const aggregate = es.aggregate ? `// Aggregate: ${es.aggregate}` : '';
  const events = es.events.join(', ');
  const snapshots = es.snapshots.map(s => generateSnapshot(s)).join('\n');
  const eventStore = es.eventStore ? `// EventStore: ${es.eventStore}` : '';
  const snapshotStrategy = es.snapshotStrategy ? `// SnapshotStrategy: ${es.snapshotStrategy}` : '';
  const snapshotInterval = es.snapshotInterval ? `// SnapshotInterval: ${es.snapshotInterval}` : '';
  const projectors = es.projectors.join(', ');
  return `export class ${es.name} {\n  // Events: ${events}\n  // Projectors: ${projectors}\n}${name}${aggregate}${snapshots}${eventStore}${snapshotStrategy}${snapshotInterval}`;
}

export function generateProjection(proj: ProjectionNode): string {
  const name = proj.name ? `// Name: ${proj.name}` : '';
  const source = proj.source ? `// Source: ${proj.source}` : '';
  const fields = proj.fields.join(', ');
  const handler = proj.handler ? `// Handler: ${proj.handler}` : '';
  return `export function ${proj.name}() {}\n// Fields: ${fields}${name}${source}${handler}`;
}

export function generateSnapshot(snap: SnapshotNode): string {
  const name = snap.name ? `// Name: ${snap.name}` : '';
  const aggregate = snap.aggregate ? `// Aggregate: ${snap.aggregate}` : '';
  const version = snap.version ? `// Version: ${snap.version}` : '';
  const frequency = snap.frequency ? `// Frequency: ${snap.frequency}` : '';
  return `export const ${snap.name} = {};\n${name}${aggregate}${version}${frequency}`;
}

export function generateAutoGen(ag: AutoGenNode): string {
  const target = ag.target ? `// Target: ${ag.target}` : '';
  const framework = ag.framework ? `// Framework: ${ag.framework}` : '';
  const language = ag.language ? `// Language: ${ag.language}` : '';
  const orm = ag.orm ? `// ORM: ${ag.orm}` : '';
  const database = ag.database ? `// Database: ${ag.database}` : '';
  const models = ag.models.join(', ');
  const views = ag.views.join(', ');
  const options = JSON.stringify(ag.options);
  const structure = JSON.stringify(ag.structure);
  return `generateAuto({ models: [${models}], views: [${views}] });\n// Options: ${options}\n// Structure: ${structure}${target}${framework}${language}${orm}${database}`;
}

export function generateApiGen(ag: ApiGenNode): string {
  const framework = ag.framework ? `// Framework: ${ag.framework}` : '';
  const spec = ag.spec ? `// Spec: ${ag.spec}` : '';
  const options = JSON.stringify(ag.options);
  return `generateApi({ framework: '${ag.framework || 'Express'}', spec: '${ag.spec || ''}', options: ${options} });${framework}${spec}`;
}

export function generateCRUDGen(cg: CRUDGenNode): string {
  const forModel = cg.for ? `// For: ${cg.for}` : '';
  const operations = cg.operations.join(', ');
  const role = cg.role ? `// Role: ${cg.role}` : '';
  return `export const ${cg.for}CRUD = {\n  operations: [${operations}]\n};\n${forModel}${role}`;
}

export function generateRelationPathGen(rpg: RelationPathGenNode): string {
  const from = rpg.from ? `// From: ${rpg.from}` : '';
  const maxDepth = rpg.maxDepth ? `// MaxDepth: ${rpg.maxDepth}` : '';
  const output = rpg.output ? `// Output: ${rpg.output}` : '';
  return `export function generateRelationPath(from: '${rpg.from}', maxDepth: ${rpg.maxDepth || 3}, output: '${rpg.output || 'json'}') {};\n${from}${maxDepth}${output}`;
}

export function generateMockDataGen(mdg: MockDataGenNode): string {
  const forModel = mdg.for ? `// For: ${mdg.for}` : '';
  const count = mdg.count ? `// Count: ${mdg.count}` : '';
  const format = mdg.format ? `// Format: ${mdg.format}` : '';
  return `export const mock${mdg.for} = Array.from({ length: ${mdg.count || 10} }, () => ({}));\n${forModel}${count}${format}`;
}

export function generateDocGen(dg: DocGenNode): string {
  const strategy = dg.strategy ? `// Strategy: ${dg.strategy}` : '';
  const output = dg.output ? `// Output: ${dg.output}` : '';
  return `generateDocs({ strategy: '${dg.strategy || 'swagger'}', output: '${dg.output || 'docs.md'}' });\n${strategy}${output}`;
}

export function generatePerfOptGen(pog: PerfOptGenNode): string {
  const strategy = pog.strategy ? `// Strategy: ${pog.strategy}` : '';
  const ttl = pog.ttl ? `// TTL: ${pog.ttl}` : '';
  return `optimizePerf({ strategy: '${pog.strategy}', ttl: '${pog.ttl || '60s'}' });\n${strategy}${ttl}`;
}

export function generateSecScanGen(ssg: SecScanGenNode): string {
  const tools = ssg.tools.join(', ');
  return `runSecScan({ tools: [${tools}] });\n// Tools: ${tools}`;
}

export function generateMigrationGen(mg: MigrationGenNode): string {
  const from = mg.from ? `// From: ${mg.from}` : '';
  const to = mg.to ? `// To: ${mg.to}` : '';
  return `migrateFromTo('${mg.from}', '${mg.to}');\n${from}${to}`;
}

export function generateGraphQLGen(gg: GraphQLGenNode): string {
  const schema = gg.schema ? `// Schema: ${gg.schema}` : '';
  return `const schema = gql\`${gg.schema || 'type Query { hello: String }'}\`;\n${schema}`;
}

export function generateRESTGen(rg: RESTGenNode): string {
  const endpoints = rg.endpoints.map(ep => generateEndpoint(ep)).join('\n');
  return `const app = express();\n${endpoints}`;
}

export function generateWebSocketGen(wsg: WebSocketGenNode): string {
  const events = wsg.events.join(', ');
  return `const wss = new WebSocket.Server({ server });\nwss.on('connection', ws => {\n  // Events: ${events}\n});`;
}

export function generateCICDGen(cg: CICDGenNode): string {
  const name = cg.name ? `// Name: ${cg.name}` : '';
  const target = cg.target ? `// Target: ${cg.target}` : '';
  const steps = cg.steps.map(s => s.name).join(', ');
  const environment = cg.environment ? `// Environment: ${cg.environment}` : '';
  const triggers = cg.triggers.join(', ');
  const jobs = Object.entries(cg.jobs).map(([k, v]) => `${k}: ${v.runsOn}`).join('\n');
  const artifacts = cg.artifacts.join(', ');
  const cache = cg.cache ? `// Cache: paths [${cg.cache.paths.join(', ')}], key ${cg.cache.key}` : '';
  const secrets = Object.keys(cg.secrets).join(', ');
  const matrix = Object.entries(cg.matrix).map(([k, v]) => `${k}: [${v.join(', ')}]`).join('\n');
  return `name: ${cg.name}\non: [${triggers}]\njobs:\n  ${jobs}\n// Steps: ${steps}\n// Artifacts: ${artifacts}\n// Secrets: ${secrets}\n// Matrix: ${matrix}${target}${environment}${cache}${name}`;
}

export function generateDeploy(dep: DeployNode): string {
  const target = dep.target ? `// Target: ${dep.target}` : '';
  const region = dep.region ? `// Region: ${dep.region}` : '';
  const services = dep.services.join(', ');
  const cicd = dep.cicd ? `// CI/CD: ${dep.cicd}` : '';
  const environment = dep.environment ? `// Environment: ${dep.environment}` : '';
  return `deployTo('${dep.target}', { services: [${services}] });\n${region}${cicd}${environment}${target}`;
}

export function generateCache(cache: CacheNode): string {
  const entity = cache.entity ? `// Entity: ${cache.entity}` : '';
  const strategy = cache.strategy ? `// Strategy: ${cache.strategy}` : '';
  const ttl = cache.ttl ? `// TTL: ${cache.ttl}` : '';
  const keys = `pattern: '${cache.keys.pattern}', invalidation: [${cache.keys.invalidation.join(', ')}]`;
  const warming = `on: '${cache.warming.on}', data: '${cache.warming.data}'`;
  return `const cache = new Cache({ strategy: '${cache.strategy}', ttl: '${cache.ttl}', keys: { ${keys} }, warming: { ${warming} } });\n${entity}${strategy}${ttl}`;
}

export function generateHealthCheck(hc: HealthCheckNode): string {
  const name = hc.name ? `// Name: ${hc.name}` : '';
  const endpoint = hc.endpoint ? `// Endpoint: ${hc.endpoint}` : '';
  const checks = hc.checks.map(c => c.type).join(', ');
  const interval = hc.interval ? `// Interval: ${hc.interval}` : '';
  return `app.get('/health', (req, res) => {\n  // Checks: ${checks}\n});\n${name}${endpoint}${interval}`;
}

export function generateMonitoring(mon: MonitoringNode): string {
  const name = mon.name ? `// Name: ${mon.name}` : '';
  const provider = mon.provider ? `// Provider: ${mon.provider}` : '';
  const metrics = mon.metrics.join(', ');
  const alerts = mon.alerts.map(a => `// Alert: ${a.name}, condition ${a.condition}, severity ${a.severity}, duration ${a.duration}, channel ${a.channel}`).join('\n');
  const dashboards = mon.dashboards.join(', ');
  const alerting = mon.alerting ? `// Alerting: ${mon.alerting}` : '';
  const retention = mon.retention ? `// Retention: ${mon.retention}` : '';
  const collectionInterval = mon.collectionInterval ? `// CollectionInterval: ${mon.collectionInterval}` : '';
  return `setupMonitoring('${mon.provider || 'Prometheus'}', { metrics: [${metrics}], dashboards: [${dashboards}] });\n// Alerts:\n${alerts}${name}${alerting}${retention}${collectionInterval}`;
}

export function generateMetric(met: MetricNode): string {
  const name = met.name ? `// Name: ${met.name}` : '';
  const strategy = met.strategy ? `// Strategy: ${met.strategy}` : '';
  const labels = met.labels.join(', ');
  const help = met.help ? `// Help: ${met.help}` : '';
  return `export const ${met.name} = new ${met.strategy}Metric('${met.name}', { labels: [${labels}], help: '${met.help || ''}' });\n${name}${strategy}${help}`;
}

export function generateAlert(alert: AlertNode): string {
  const name = alert.name ? `// Name: ${alert.name}` : '';
  const condition = alert.condition ? `// Condition: ${alert.condition}` : '';
  const severity = alert.severity ? `// Severity: ${alert.severity}` : '';
  const action = alert.action ? `// Action: ${alert.action}` : '';
  const threshold = alert.threshold ? `// Threshold: ${alert.threshold}` : '';
  return `alert ${alert.name} {\n  expr: ${alert.condition}\n  labels: { severity: "${alert.severity}" }\n  annotations: { summary: "${alert.action}" }\n}\n${name}${condition}${severity}${threshold}`;
}

export function generateIndexStrategy(is: IndexStrategyNode): string {
  const name = is.name ? `// Name: ${is.name}` : '';
  const entity = is.entity ? `// Entity: ${is.entity}` : '';
  const strategy = is.strategy ? `// Strategy: ${is.strategy}` : '';
  const fields = is.fields.join(', ');
  const unique = is.unique ? `// Unique: ${is.unique}` : '';
  const composite = is.composite ? `// Composite: ${is.composite}` : '';
  const customConfig = is.customConfig ? `// CustomConfig: ${JSON.stringify(is.customConfig)}` : '';
  return `@Index({ fields: [${fields}], type: '${is.strategy || 'BTREE'}', unique: ${is.unique || false}, composite: ${is.composite || false} })\n${name}${entity}${strategy}${unique}${composite}${customConfig}`;
}

export function generateTemplate(tpl: TemplateNode): string {
  const name = tpl.name ? `// Name: ${tpl.name}` : '';
  const params = tpl.params.map(p => `${p.name}: ${p.type}`).join(', ');
  return `export function ${tpl.name}(${params}) {\n  // TODO: template logic\n}${name}`;
}

export function generateBlueprint(bp: BlueprintNode): string {
  const name = bp.name ? `// Name: ${bp.name}` : '';
  const stack = bp.stack ? `// Stack: frontend ${bp.stack.frontend}, backend ${bp.stack.backend}, database ${bp.stack.database}, cache ${bp.stack.cache}, queue ${bp.stack.queue}` : '';
  const architecture = bp.architecture ? `// Architecture: ${bp.architecture.pattern}, layers [${bp.architecture.layers.join(', ')}]` : '';
  const features = bp.features.join(', ');
  const infrastructure = bp.infrastructure ? `// Infrastructure: hosting ${bp.infrastructure.hosting}, ciCd ${bp.infrastructure.ciCd}, monitoring ${bp.infrastructure.monitoring}` : '';
  return `export const ${bp.name}Blueprint = {\n  stack: {},\n  architecture: {},\n  features: [${features}]\n};\n${name}${stack}${architecture}${infrastructure}`;
}

export function generatePlugin(plugin: PluginNode): string {
  const name = plugin.name ? `// Name: ${plugin.name}` : '';
  const target = plugin.target ? `// Target: ${plugin.target}` : '';
  const hooks = plugin.hooks.join(', ');
  const priority = plugin.priority ? `// Priority: ${plugin.priority}` : '';
  const code = plugin.code ? `// Code: ${plugin.code}` : '';
  return `export const ${plugin.name}Plugin = {\n  target: '${plugin.target || ''}',\n  hooks: [${hooks}],\n  priority: ${plugin.priority || 0},\n  code: '${plugin.code || ''}'\n};\n${name}${target}${priority}${code}`;
}

export function generateTest(test: TestNode): string {
  const name = test.name ? `// Name: ${test.name}` : '';
  const coverage = test.coverage ? `// Coverage: ${test.coverage}` : '';
  const types = test.types.join(', ');
  const framework = test.framework ? `// Framework: ${test.framework}` : '';
  const scenarios = test.scenarios.join(', ');
  const unit = test.unit ? `// Unit: ${JSON.stringify(test.unit)}` : '';
  const integration = test.integration ? `// Integration: ${JSON.stringify(test.integration)}` : '';
  const e2e = test.e2e ? `// E2E: ${JSON.stringify(test.e2e)}` : '';
  const performance = test.performance ? `// Performance: ${JSON.stringify(test.performance)}` : '';
  return `test('${test.name || 'unnamed'}', () => {});\n${name}${coverage}// Types: ${types}${framework}// Scenarios: ${scenarios}${unit}${integration}${e2e}${performance}`;
}

export function generateTestSuite(ts: TestSuiteNode): string {
  const name = ts.name ? `// Name: ${ts.name}` : '';
  const tests = ts.tests.join(', ');
  const setup = ts.setup ? `// Setup: ${ts.setup}` : '';
  const teardown = ts.teardown ? `// Teardown: ${ts.teardown}` : '';
  const timeout = ts.timeout ? `// Timeout: ${ts.timeout}` : '';
  return `describe('${ts.name || 'unnamed'}', () => {\n  // Tests: ${tests}\n});\n${name}${setup}${teardown}${timeout}`;
}

export function generateSecurity(sec: SecurityNode): string {
  const name = sec.name ? `// Name: ${sec.name}` : '';
  const auth = sec.auth ? `// Auth: ${sec.auth}` : '';
  const encryption = sec.encryption ? `// Encryption: ${sec.encryption}` : '';
  const roles = sec.roles.join(', ');
  const policies = JSON.stringify(sec.policies);
  const rateLimit = sec.rateLimit ? `// RateLimit: limit ${sec.rateLimit.limit}, window ${sec.rateLimit.window}` : '';
  return `export const security = { roles: [${roles}], policies: ${policies} };\n${name}${auth}${encryption}${rateLimit}`;
}

export function generateBlock(block: BlockNode): string {
  const name = block.name ? `// Name: ${block.name}` : '';
  const blockId = block.blockId ? `// BlockID: ${block.blockId}` : '';
  const position = block.position ? `// Position: x ${block.position.x}, y ${block.position.y}` : '';
  const connections = block.connections.map(c => `// Connection: ${c.sourceId} -> ${c.targetId}, type ${c.type}`).join('\n');
  const collapsed = block.collapsed ? `// Collapsed: ${block.collapsed}` : '';
  const locked = block.locked ? `// Locked: ${block.locked}` : '';
  const metadata = JSON.stringify(block.metadata);
  return `export const ${block.name}Block = { id: '${block.blockId}', position: {}, connections: [] };\n${name}${position}${connections}${collapsed}${locked}// Metadata: ${metadata}`;
}

export function generateArray(arr: ArrayNode): string {
  const elements = arr.elements.map(e => formatValue(e)).join(', ');
  const elementType = arr.elementType ? `// ElementType: ${mapDataTypeToTS(arr.elementType)}` : '';
  return `[${elements}]${elementType}`;
}

export function generateObject(obj: ObjectNode): string {
  const properties = obj.properties.map(p => generateProperty(p)).join('\n  ');
  return `{ \n  ${properties}\n }`;
}

export function generateGenTest(gt: GenTestNode): string {
  const target = gt.target ? `// Target: ${gt.target}` : '';
  const framework = gt.framework ? `// Framework: ${gt.framework}` : '';
  return `test('gen test for ${gt.target}', () => {});\n${target}${framework}`;
}

export function generateReference(ref: ReferenceNode): string {
  const target = ref.target ? `// Target: ${ref.target}` : '';
  const path = ref.path ? `// Path: ${ref.path}` : '';
  return `import { ${ref.target} } from '${ref.path || './reference'}';\n${target}${path}`;
}

export function generateIndex(idx: IndexNode): string {
  const name = idx.name ? `// Name: ${idx.name}` : '';
  const entity = idx.entity ? `// Entity: ${idx.entity}` : '';
  const fields = idx.fields.join(', ');
  const typeIndex = idx.typeIndex ? `// Type: ${idx.typeIndex}` : '';
  const unique = idx.unique ? `// Unique: ${idx.unique}` : '';
  const where = idx.where ? `// Where: ${idx.where}` : '';
  return `@Index({ fields: [${fields}], type: '${idx.typeIndex || 'BTREE'}', unique: ${idx.unique || false}, where: '${idx.where || ''}' })\n${name}${entity}${typeIndex}${unique}${where}`;
}

export function generateRealTime(rt: RealTimeNode): string {
  const name = rt.name ? `// Name: ${rt.name}` : '';
  const channels = rt.channels.join(', ');
  const authRequired = rt.authRequired ? `// AuthRequired: ${rt.authRequired}` : '';
  const transport = rt.transport ? `// Transport: ${rt.transport}` : '';
  const fallback = rt.fallback ? `// Fallback: ${rt.fallback}` : '';
  return `const socket = io();\n// Channels: ${channels}${name}${authRequired}${transport}${fallback}`;
}

export function generateSearch(srch: SearchNode): string {
  const name = srch.name ? `// Name: ${srch.name}` : '';
  const engine = srch.engine ? `// Engine: ${srch.engine}` : '';
  const fields = srch.fields.join(', ');
  const fuzziness = srch.fuzziness ? `// Fuzziness: ${srch.fuzziness}` : '';
  const ranking = JSON.stringify(srch.ranking);
  return `export function ${srch.name}Search(query: string) {\n  // Fields: ${fields}\n  return [];\n}${name}${engine}${fuzziness}// Ranking: ${ranking}`;
}

export function generateDatabase(db: DatabaseNode): string {
  const name = db.name ? `// Name: ${db.name}` : '';
  const typeDb = db.typeDb ? `// Type: ${db.typeDb}` : '';
  const models = db.models.join(', ');
  const connection = JSON.stringify(db.connection);
  const pooling = JSON.stringify(db.pooling);
  return `const db = new PrismaClient({ datasourceUrl: '${db.connection?.database || ''}' });\n// Models: ${models}\n// Pooling: ${pooling}${name}${typeDb}${connection}`;
}

export function generateHealth(hc: HealthCheckNode): string {
  const name = hc.name ? `// Name: ${hc.name}` : '';
  const endpoint = hc.endpoint ? `// Endpoint: ${hc.endpoint}` : '';
  const checks = hc.checks.map(c => c.type).join(', ');
  const interval = hc.interval ? `// Interval: ${hc.interval}` : '';
  return `app.get('${hc.endpoint || '/health'}', (req, res) => {});\n// Checks: ${checks}${name}${interval}`;
}

// ============================================
// GÉNÉRATEURS PRINCIPAUX
// ============================================

export function generateProgram(program: ProgramNode): string {
  const lines: string[] = [];

  lines.push('// ============================================');
  lines.push('// CODE GÉNÉRÉ À PARTIR DE L\'AST TP');
  lines.push('// ============================================');
  lines.push('');

  // Imports
  if (program.imports.length) {
    lines.push('// ── Imports ──────────────────────────────────────');
    program.imports.forEach(imp => lines.push(generateImport(imp)));
    lines.push('');
  }

  // Modules
  if (program.modules?.length) {
    lines.push('// ── Modules ──────────────────────────────────────');
    program.modules.forEach(mod => lines.push(generateModule(mod)));
    lines.push('');
  }

  // Directives
  if (program.directives?.length) {
    lines.push('// ── Directives ───────────────────────────────────');
    program.directives.forEach(dir => lines.push(generateDirective(dir)));
    lines.push('');
  }

  // Macros
  if (program.macros?.length) {
    lines.push('// ── Macros ───────────────────────────────────────');
    program.macros.forEach(macro => lines.push(generateMacro(macro)));
    lines.push('');
  }

  // Enums
  if (program.enums.length) {
    lines.push('// ── Enums ────────────────────────────────────────');
    program.enums.forEach(en => lines.push(generateEnum(en)));
    lines.push('');
  }

  // DataJsons
  if (program.dataJsons.length) {
    lines.push('// ── Data JSON ────────────────────────────────────');
    program.dataJsons.forEach(dj => lines.push(generateDataJson(dj)));
    lines.push('');
  }

  // Models
  if (program.models.length) {
    lines.push('// ── Models ───────────────────────────────────────');
    program.models.forEach(model => lines.push(generateModel(model)));
    lines.push('');
  }

  // Fields (orphelins ou globaux)
  if (program.fields?.length) {
    lines.push('// ── Fields ───────────────────────────────────────');
    program.fields.forEach(field => lines.push(generateField(field)));
    lines.push('');
  }

  // Relations
  if (program.relations?.length) {
    lines.push('// ── Relations ────────────────────────────────────');
    program.relations.forEach(rel => lines.push(generateRelation(rel)));
    lines.push('');
  }

  // Components
  if (program.components.length) {
    lines.push('// ── Components ───────────────────────────────────');
    program.components.forEach(comp => lines.push(generateComponent(comp)));
    lines.push('');
  }

  // Pages
  if (program.pages.length) {
    lines.push('// ── Pages ────────────────────────────────────────');
    program.pages.forEach(page => lines.push(generatePage(page)));
    lines.push('');
  }

  // Sections
  if (program.sections?.length) {
    lines.push('// ── Sections ─────────────────────────────────────');
    program.sections.forEach(sec => lines.push(generateSection(sec)));
    lines.push('');
  }

  // Layouts
  if (program.layouts?.length) {
    lines.push('// ── Layouts ──────────────────────────────────────');
    program.layouts.forEach(layout => lines.push(generateLayout(layout)));
    lines.push('');
  }

  // Component Libraries
  if (program.componentLibraries?.length) {
    lines.push('// ── Component Libraries ──────────────────────────');
    program.componentLibraries.forEach(lib => lines.push(generateComponentLibrary(lib)));
    lines.push('');
  }

  // APIs
  if (program.apis?.length) {
    lines.push('// ── APIs ─────────────────────────────────────────');
    program.apis.forEach(api => lines.push(generateAPI(api)));
    lines.push('');
  }

  // Microservices
  if (program.microservices?.length) {
    lines.push('// ── Microservices ────────────────────────────────');
    program.microservices.forEach(ms => lines.push(generateMicroservice(ms)));
    lines.push('');
  }

  // Event Buses
  if (program.eventBuses?.length) {
    lines.push('// ── Event Buses ──────────────────────────────────');
    program.eventBuses.forEach(eb => lines.push(generateEventBus(eb)));
    lines.push('');
  }

  // Webhooks
  if (program.webhooks?.length) {
    lines.push('// ── Webhooks ─────────────────────────────────────');
    program.webhooks.forEach(wh => lines.push(generateWebhook(wh)));
    lines.push('');
  }

  // Integrations
  if (program.integrations?.length) {
    lines.push('// ── Integrations ─────────────────────────────────');
    program.integrations.forEach(int => lines.push(generateIntegration(int)));
    lines.push('');
  }

  // Endpoints
  if (program.endpoints?.length) {
    lines.push('// ── Endpoints ────────────────────────────────────');
    program.endpoints.forEach(ep => lines.push(generateEndpoint(ep)));
    lines.push('');
  }

  // Business Rules
  if (program.businessRules?.length) {
    lines.push('// ── Business Rules ───────────────────────────────');
    program.businessRules.forEach(rule => lines.push(generateBusinessRule(rule)));
    lines.push('');
  }

  // Workflows
  if (program.workflows?.length) {
    lines.push('// ── Workflows ────────────────────────────────────');
    program.workflows.forEach(wf => lines.push(generateWorkflow(wf)));
    lines.push('');
  }

  // Sagas
  if (program.sagas?.length) {
    lines.push('// ── Sagas ────────────────────────────────────────');
    program.sagas.forEach(saga => lines.push(generateSaga(saga)));
    lines.push('');
  }

  // CQRS Contexts
  if (program.cqrsContexts?.length) {
    lines.push('// ── CQRS Contexts ────────────────────────────────');
    program.cqrsContexts.forEach(cqrs => lines.push(generateCQRS(cqrs)));
    lines.push('');
  }

  // Event Sourcings
  if (program.eventSourcings?.length) {
    lines.push('// ── Event Sourcings ──────────────────────────────');
    program.eventSourcings.forEach(es => lines.push(generateEventSourcing(es)));
    lines.push('');
  }

  // Steps
  if (program.steps?.length) {
    lines.push('// ── Steps ────────────────────────────────────────');
    program.steps.forEach(step => lines.push(generateStep(step)));
    lines.push('');
  }

  // Projections
  if (program.projections?.length) {
    lines.push('// ── Projections ──────────────────────────────────');
    program.projections.forEach(proj => lines.push(generateProjection(proj)));
    lines.push('');
  }

  // Snapshots
  if (program.snapshots?.length) {
    lines.push('// ── Snapshots ────────────────────────────────────');
    program.snapshots.forEach(snap => lines.push(generateSnapshot(snap)));
    lines.push('');
  }

  // AutoGens
  if (program.autoGens?.length) {
    lines.push('// ── AutoGens ─────────────────────────────────────');
    program.autoGens.forEach(ag => lines.push(generateAutoGen(ag)));
    lines.push('');
  }

  // ApiGens
  if (program.apiGens?.length) {
    lines.push('// ── API Gens ─────────────────────────────────────');
    program.apiGens.forEach(ag => lines.push(generateApiGen(ag)));
    lines.push('');
  }

  // CRUDGens
  if (program.crudGens?.length) {
    lines.push('// ── CRUD Gens ────────────────────────────────────');
    program.crudGens.forEach(cg => lines.push(generateCRUDGen(cg)));
    lines.push('');
  }

  // UIGens
  if (program.uiGens?.length) {
    lines.push('// ── UI Gens ──────────────────────────────────────');
    program.uiGens.forEach(ug => lines.push(generateUIGen(ug)));
    lines.push('');
  }

  // ComponentGens
  if (program.componentGens?.length) {
    lines.push('// ── Component Gens ───────────────────────────────');
    program.componentGens.forEach(cg => lines.push(generateComponentGen(cg)));
    lines.push('');
  }

  // RelationPathGens
  if (program.relationPathGens?.length) {
    lines.push('// ── Relation Path Gens ───────────────────────────');
    program.relationPathGens.forEach(rpg => lines.push(generateRelationPathGen(rpg)));
    lines.push('');
  }

  // MockDataGens
  if (program.mockDataGens?.length) {
    lines.push('// ── Mock Data Gens ───────────────────────────────');
    program.mockDataGens.forEach(mdg => lines.push(generateMockDataGen(mdg)));
    lines.push('');
  }

  // DocGens
  if (program.docGens?.length) {
    lines.push('// ── Doc Gens ─────────────────────────────────────');
    program.docGens.forEach(dg => lines.push(generateDocGen(dg)));
    lines.push('');
  }

  // PerfOptGens
  if (program.perfOptGens?.length) {
    lines.push('// ── Perf Opt Gens ────────────────────────────────');
    program.perfOptGens.forEach(pog => lines.push(generatePerfOptGen(pog)));
    lines.push('');
  }

  // SecScanGens
  if (program.secScanGens?.length) {
    lines.push('// ── Sec Scan Gens ────────────────────────────────');
    program.secScanGens.forEach(ssg => lines.push(generateSecScanGen(ssg)));
    lines.push('');
  }

  // MigrationGens
  if (program.migrationGens?.length) {
    lines.push('// ── Migration Gens ───────────────────────────────');
    program.migrationGens.forEach(mg => lines.push(generateMigrationGen(mg)));
    lines.push('');
  }

  // GraphQLGens
  if (program.graphQLGens?.length) {
    lines.push('// ── GraphQL Gens ─────────────────────────────────');
    program.graphQLGens.forEach(gg => lines.push(generateGraphQLGen(gg)));
    lines.push('');
  }

  // RESTGens
  if (program.restGens?.length) {
    lines.push('// ── REST Gens ────────────────────────────────────');
    program.restGens.forEach(rg => lines.push(generateRESTGen(rg)));
    lines.push('');
  }

  // WebSocketGens
  if (program.webSocketGens?.length) {
    lines.push('// ── WebSocket Gens ───────────────────────────────');
    program.webSocketGens.forEach(wsg => lines.push(generateWebSocketGen(wsg)));
    lines.push('');
  }

  // CICDGens
  if (program.cicdGens?.length) {
    lines.push('// ── CICD Gens ────────────────────────────────────');
    program.cicdGens.forEach(cg => lines.push(generateCICDGen(cg)));
    lines.push('');
  }

  // Deploys
  if (program.deploys?.length) {
    lines.push('// ── Deploys ──────────────────────────────────────');
    program.deploys.forEach(dep => lines.push(generateDeploy(dep)));
    lines.push('');
  }

  // Caches
  if (program.caches?.length) {
    lines.push('// ── Caches ───────────────────────────────────────');
    program.caches.forEach(cache => lines.push(generateCache(cache)));
    lines.push('');
  }

  // Health Checks
  if (program.healthChecks?.length) {
    lines.push('// ── Health Checks ────────────────────────────────');
    program.healthChecks.forEach(hc => lines.push(generateHealthCheck(hc)));
    lines.push('');
  }

  // Monitors
  if (program.monitors?.length) {
    lines.push('// ── Monitors ─────────────────────────────────────');
    program.monitors.forEach(mon => lines.push(generateMonitoring(mon)));
    lines.push('');
  }

  // Metrics
  if (program.metrics?.length) {
    lines.push('// ── Metrics ──────────────────────────────────────');
    program.metrics.forEach(met => lines.push(generateMetric(met)));
    lines.push('');
  }

  // Alerts
  if (program.alerts?.length) {
    lines.push('// ── Alerts ───────────────────────────────────────');
    program.alerts.forEach(alert => lines.push(generateAlert(alert)));
    lines.push('');
  }

  // Index Strategies
  if (program.indexStrategies?.length) {
    lines.push('// ── Index Strategies ─────────────────────────────');
    program.indexStrategies.forEach(is => lines.push(generateIndexStrategy(is)));
    lines.push('');
  }

  // Templates
  if (program.templates?.length) {
    lines.push('// ── Templates ────────────────────────────────────');
    program.templates.forEach(tpl => lines.push(generateTemplate(tpl)));
    lines.push('');
  }

  // Blueprints
  if (program.blueprints?.length) {
    lines.push('// ── Blueprints ───────────────────────────────────');
    program.blueprints.forEach(bp => lines.push(generateBlueprint(bp)));
    lines.push('');
  }

  // Plugins
  if (program.plugins?.length) {
    lines.push('// ── Plugins ──────────────────────────────────────');
    program.plugins.forEach(plugin => lines.push(generatePlugin(plugin)));
    lines.push('');
  }

  // Tests
  if (program.tests?.length) {
    lines.push('// ── Tests ────────────────────────────────────────');
    program.tests.forEach(test => lines.push(generateTest(test)));
    lines.push('');
  }

  // Test Suites
  if (program.testSuites?.length) {
    lines.push('// ── Test Suites ──────────────────────────────────');
    program.testSuites.forEach(ts => lines.push(generateTestSuite(ts)));
    lines.push('');
  }

  // Security Rules
  if (program.securityRules?.length) {
    lines.push('// ── Security Rules ───────────────────────────────');
    program.securityRules.forEach(sec => lines.push(generateSecurity(sec)));
    lines.push('');
  }

  // Directives Avancées
  if (program.directivesAvancees?.length) {
    lines.push('// ── Directives Avancées ──────────────────────────');
    program.directivesAvancees.forEach(da => lines.push(generateDirectivesAvancees(da)));
    lines.push('');
  }

  // Blocks
  if (program.blocks?.length) {
    lines.push('// ── Blocks ───────────────────────────────────────');
    program.blocks.forEach(block => lines.push(generateBlock(block)));
    lines.push('');
  }

  // Properties
  if (program.properties?.length) {
    lines.push('// ── Properties ───────────────────────────────────');
    program.properties.forEach(prop => lines.push(generateProperty(prop)));
    lines.push('');
  }

  // Arrays
  if (program.arrays?.length) {
    lines.push('// ── Arrays ───────────────────────────────────────');
    program.arrays.forEach(arr => lines.push(generateArray(arr)));
    lines.push('');
  }

  // Objects
  if (program.objects?.length) {
    lines.push('// ── Objects ──────────────────────────────────────');
    program.objects.forEach(obj => lines.push(generateObject(obj)));
    lines.push('');
  }

  // GenTests
  if (program.genTests?.length) {
    lines.push('// ── Gen Tests ────────────────────────────────────');
    program.genTests.forEach(gt => lines.push(generateGenTest(gt)));
    lines.push('');
  }

  // Literals
  if (program.literals?.length) {
    lines.push('// ── Literals ─────────────────────────────────────');
    program.literals.forEach(lit => lines.push(generateLiteral(lit)));
    lines.push('');
  }

  // References
  if (program.references?.length) {
    lines.push('// ── References ───────────────────────────────────');
    program.references.forEach(ref => lines.push(generateReference(ref)));
    lines.push('');
  }

  // Indexes
  if (program.indexes?.length) {
    lines.push('// ── Indexes ──────────────────────────────────────');
    program.indexes.forEach(idx => lines.push(generateIndex(idx)));
    lines.push('');
  }

  // RealTimes
  if (program.realTimes?.length) {
    lines.push('// ── Real Times ───────────────────────────────────');
    program.realTimes.forEach(rt => lines.push(generateRealTime(rt)));
    lines.push('');
  }

  // Searches
  if (program.searches?.length) {
    lines.push('// ── Searches ─────────────────────────────────────');
    program.searches.forEach(srch => lines.push(generateSearch(srch)));
    lines.push('');
  }

  // Databases
  if (program.databases?.length) {
    lines.push('// ── Databases ────────────────────────────────────');
    program.databases.forEach(db => lines.push(generateDatabase(db)));
    lines.push('');
  }

  lines.push('// ============================================');
  lines.push('// FIN DU CODE GÉNÉRÉ');
  lines.push('// ============================================');

  return lines.join('\n');
}


export function generateEndpoint(ep: EndpointNode): string {
  const method = ep.method?.toLowerCase() || 'get';
  const handler = ep.handler || `async (req: Request, res: Response) => {
    res.status(200).json({ message: "Endpoint ${ep.path} implemented" });
  }`;

  let code = `router.${method}('${ep.path}', `;

  if (ep.middleware?.length) {
    code += `${ep.middleware.join(', ')}, `;
  }

  code += `${handler});`;

  if (ep.description) {
    code = `// ${ep.description}\n` + code;
  }

  return code;
}

export function generateStep(step: StepNode): string {
  const lines: string[] = [];

  lines.push(`export async function ${step.name}(context: any) {`);

  if (step.description) {
    lines.push(`  // ${step.description}`);
  }

  if (step.when) {
    lines.push(`  if (!(${formatValue(step.when)})) return;`);
  }

  lines.push(`  // Action: ${step.action || 'execute'}`);
  if (step.handler) {
    lines.push(`  const result = await ${step.handler}(context);`);
  } else {
    lines.push(`  // TODO: implement ${step.action || 'action'}`);
  }

  if (step.inputs) {
    lines.push(`  // Inputs:`);
    Object.entries(step.inputs).forEach(([k, v]) => {
      lines.push(`  // ${k}: ${formatValue(v)}`);
    });
  }

  if (step.outputs) {
    lines.push(`  // Outputs:`);
    Object.entries(step.outputs).forEach(([k, v]) => {
      lines.push(`  // ${k}: ${mapDataTypeToTS(v as DataType)}`);
    });
  }

  if (step.retry) {
    lines.push(`  // Retry: maxAttempts=${step.retry.maxAttempts}, backoff=${step.retry.backoff || 'linear'}`);
  }

  if (step.timeout) {
    lines.push(`  // Timeout: ${step.timeout}`);
  }

  if (step.compensate) {
    const comp = typeof step.compensate === 'string' ? step.compensate : (step.compensate as StepNode).name;
    lines.push(`  // Compensate: ${comp}`);
  }

  lines.push(`  return result;`);
  lines.push(`}`);
  
  return lines.join('\n');
}

export function generateDirectivesAvancees(da: DirectivesAvanceesNode): string {
  const bindings = Object.entries(da.hostBindings || {}).map(([k, v]) => `${k}: '${v}'`).join(',\n  ');
  return `@Directive({\n  host: { ${bindings} }\n})\nexport class ${da.name}Directive { }`;
}


export function generateMetrics(met: MetricNode): string {
  const lines: string[] = [];

  lines.push(`export const ${met.name} = new ${met.strategy}Metric({`);

  lines.push(`  name: "${met.name}",`);
  
  if (met.labels?.length) {
    lines.push(`  labels: [${met.labels.map(l => `"${l}"`).join(', ')}],`);
  }

  if (met.help) {
    lines.push(`  help: "${met.help}",`);
  }

  lines.push(`});`);

  return lines.join('\n');
}

export function generateTestGen(tg: TestGenNode): string {
  const lines: string[] = [];

  lines.push(`export function generateTests(target: "${tg.target}", {`);

  lines.push(`  framework: "${tg.framework}",`);

  lines.push(`  coverage: ${tg.coverage},`);

  lines.push(`  types: [${tg.types.map(t => `"${t}"`).join(', ')}],`);

  lines.push(`}) {`);

  lines.push(`  // Test generation logic here`);

  lines.push(`}`);

  return lines.join('\n');
}

export function generateLiteral(lit: LiteralNode): string {
  const lines: string[] = [];

  if (lit.decorators?.length) {
    lit.decorators.forEach(dec => {
      lines.push(`@${dec.name}(${dec.arguments?.join(', ') || ''})`);
    });
  }

  lines.push(`export const LITERAL_VALUE = ${formatValue(lit.value)};`);

  if (lit.raw) {
    lines.push(`// Raw: ${lit.raw}`);
  }

  if (lit.literalType) {
    lines.push(`// Type: ${lit.literalType}`);
  }

  if (lit.documentation) {
    lines.push(`/** ${lit.documentation} */`);
  }

  return lines.join('\n');
}

export function generateProperty(prop: PropertyNode): string {
  const lines: string[] = [];

  if (prop.decorators?.length) {
    prop.decorators.forEach(dec => {
      lines.push(`@${dec.name}(${dec.arguments?.join(', ') || ''})`);
    });
  }

  lines.push(`${prop.name}: ${formatValue(prop.value)};`);

  if (prop.dataType) {
    lines.push(`// Data type: ${mapDataTypeToTS(prop.dataType)}`);
  }

  return lines.join('\n');
}

export function generateUIGen(ug: UIGenNode): string {
  const lines: string[] = [];

  lines.push(`export function generateUI(forModel: "${ug.for}", {`);

  lines.push(`  framework: "${ug.framework}",`);

  lines.push(`}) {`);

  lines.push(`  // UI generation logic for ${ug.for}`);

  lines.push(`  return <div>Generated UI</div>;`);

  lines.push(`}`);

  return lines.join('\n');
}

export function generateComponentGen(cg: ComponentGenNode): string {
  const lines: string[] = [];

  lines.push(`export interface ${cg.name}Props {`);

  cg.props.forEach(p => {
    lines.push(`  ${p.name}: ${p.type || 'any'};`);
  });

  lines.push(`}`);

  lines.push(`export const ${cg.name}Variants = {`);

  cg.variants.forEach(v => {
    lines.push(`  ${v.name}: { className: "${v.className || 'default'}", style: ${JSON.stringify(v.style || {})} },`);
  });

  lines.push(`};`);

  const propsDestr = cg.props.map(p => p.name).join(', ');
  lines.push(`export const ${cg.name} = ({ ${propsDestr} }: ${cg.name}Props) => {`);

  lines.push(`  return <div className="${cg.name.toLowerCase()}">Component content</div>;`);

  lines.push(`};`);

  return lines.join('\n');
}

export function generateMicroservice(ms: MicroserviceNode): string {
  const lines: string[] = [];

  lines.push(`import express from 'express';`);

  lines.push(`const app = express();`);

  lines.push(`app.use(express.json());`);

  lines.push(`const PORT = ${ms.port || 3000};`);

  lines.push(`const DOMAIN = "${ms.domain || 'localhost'}";`);

  if (ms.dependencies?.length) {
    ms.dependencies.forEach(dep => {
      lines.push(`// Dependency: ${dep}`);
    });
  }

  if (ms.api) {
    lines.push(generateAPI(ms.api));
  }

  if (ms.database) {
    lines.push(generateDatabase(ms.database));
  }

  if (ms.eventBus) {
    lines.push(generateEventBus(ms.eventBus));
  }

  if (ms.monitoring) {
    lines.push(generateMonitoring(ms.monitoring));
  }

  if (ms.security) {
    lines.push(generateSecurity(ms.security));
  }

  lines.push(`app.listen(PORT, () => {`);

  lines.push(`  console.log(\`Microservice ${ms.name} running on ${ms.domain || 'localhost'}:${ms.port || 3000}\`);`);

  lines.push(`});`);

  return lines.join('\n');
}

export function generateSection(sec: SectionNode): string {
  const lines: string[] = [];

  lines.push(`export function ${sec.name}() {`);

  lines.push(`  return (`);

  lines.push(`    <section className="${sec.component || 'default-section'}">`);

  if (sec.props) {
    const propsStr = Object.entries(sec.props).map(([k, v]) => `${k}={${formatValue(v)}}`).join(' ');
    lines.push(`      <div ${propsStr}>Props applied</div>`);
  }

  if (sec.data) {
    lines.push(`      {/* Data from ${sec.data.type}: ${sec.data.source} */}`);
  }

  if (sec.position) {
    lines.push(`      {/* Position: ${sec.position} */}`);
  }

  lines.push(`    </section>`);

  lines.push(`  );`);

  lines.push(`}`);

  return lines.join('\n');
}

export function generateRelation(rel: RelationNode): string {
  const lines: string[] = [];

  const typeMap: Record<string, string> = {
    'OneToOne': 'OneToOne',
    'OneToMany': 'OneToMany',
    'ManyToOne': 'ManyToOne',
    'ManyToMany': 'ManyToMany'
  };
  const relType = typeMap[rel.relationType || 'OneToOne'];

  lines.push(`@${relType}({`);

  if (rel.foreignKey) {
    lines.push(`  mappedBy: '${rel.foreignKey}',`);
  }

  if (rel.onDelete) {
    lines.push(`  onDelete: '${rel.onDelete}',`);
  }

  if (rel.onUpdate) {
    lines.push(`  onUpdate: '${rel.onUpdate}',`);
  }

  lines.push(`})`);

  lines.push(`${rel.name}: ${rel.target}${rel.isArray ? '[]' : ''};`);

  return lines.join('\n');
}

export function generateComponent(comp: ComponentNode): string {
  const lines: string[] = [];

  lines.push(`export interface ${comp.name}Props {`);

  comp.props.forEach(p => {
    lines.push(`  ${p.name}${p.required ? '' : '?'}: ${p.type};`);
  });

  lines.push(`}`);

  lines.push(`const variants = {`);

  comp.variants.forEach(v => {
    lines.push(`  ${v.name}: { className: "${v.className || 'default'}", style: ${JSON.stringify(v.style || {})} },`);
  });

  lines.push(`};`);

  lines.push(`const styles = ${JSON.stringify(comp.styles || {})};`);

  comp.animations.forEach(a => {
    lines.push(`// Animation: ${a.name}`);
  });

  lines.push(`const accessibility = ${JSON.stringify(comp.accessibility || {})};`);

  const propsDestr = comp.props.map(p => p.name).join(', ');
  lines.push(`export const ${comp.name} = ({ ${propsDestr} }: ${comp.name}Props) => {`);

  lines.push(`  return <div style={styles}>${comp.name}</div>;`);

  lines.push(`};`);

  return lines.join('\n');
}

export function generateField(field: FieldNode): string {
  const lines: string[] = [];

  if (field.decorators?.length) {
    field.decorators.forEach(dec => {
      lines.push(`@${dec.name}(${dec.arguments?.join(', ') || ''})`);
    });
  }

  let typeStr = mapDataTypeToTS(field.dataType);
  if (field.isArray) typeStr += '[]';

  let line = `  ${field.name}${field.isRequired ? '' : '?'}: ${typeStr}`;

  if (field.defaultValue !== undefined) {
    line += ` = ${formatValue(field.defaultValue)}`;
  }

  lines.push(line + ';');

  if (field.isUnique) {
    lines.push(`  // @unique`);
  }

  if (field.isImmutable) {
    lines.push(`  // immutable`);
  }

  if (field.validators?.length) {
    field.validators.forEach(v => {
      lines.push(`  // validator: ${v.type}${v.message ? ` ${JSON.stringify(v.message)}` : ''}`);
    });
  }

  return lines.join('\n');
}