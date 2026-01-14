// ============================================
// TP LANGUAGE PARSER
// Parser pour le langage TechPlatform
// Version 2.0 - Support complet (Ajouts : Parsing pour nouvelles directives comme @GenTest, @CRUDGen, etc., et support avancé pour @DirectivesAvancees avec orchestration, @CICDGen pour pipelines CI/CD)
// ============================================

import { 
  Token, TokenType, ASTNode, ProgramNode, ModuleNode, EnumNode, EnumValue,
  DataJsonNode, FieldNode, DirectiveNode, ImportNode, ParseResult, ParseError,
  ParseWarning, ParseStatistics, DataType, CacheKeysConfig, CacheWarmingConfig, 
  ComponentNode, PageNode, MicroserviceNode, AutoGenNode, ModelNode, APINode,
  DeployNode, TestNode, IntegrationNode, WebhookNode, SagaNode, SagaStepNode,
  BlueprintNode, TemplateNode, BusinessRuleNode, WorkflowNode, CacheNode,
  HealthCheckNode, GraphData, GraphNode, GraphEdge, BlockType,
  GenTestNode, CRUDGenNode, UIGenNode, ComponentGenNode, RelationPathGenNode,
  MockDataGenNode, DocGenNode, PerfOptGenNode, SecScanGenNode, MigrationGenNode,
  GraphQLGenNode, RESTGenNode, WebSocketGenNode, EndpointNode, RelationNode, SchemaDefinition,
  Decorator, SourceLocation, MonitoringNode, EventSourcingNode, CQRSNode, 
  EventSubscriber, EventBusConfig, DataSource, GraphQLSchemaConfig, EventBusNode,
  CORSConfig, JWTConfig, PasswordPolicyConfig, UnitTestConfig, IntegrationTestConfig, E2ETestConfig, PerformanceTestConfig, AuthConfig, AuthorizationConfig, RateLimitSecurityConfig, 
  PropDefinition, VariantDefinition, StyleDefinition, AnimationDefinition, AccessibilityConfig, 
  FieldValidator, StepNode, ProjectionNode, SnapshotNode, MetricNode, AlertNode, SectionNode, LiteralNode, IndexStrategyNode, MacroNode, SecurityConfig, 
  ArrayNode, ObjectNode, ReferenceNode, PluginNode, ComponentLibraryNode, LayoutNode, SearchNode, RealTimeNode,
  DatabaseNode, IndexNode, DirectivesAvanceesNode, PropertyNode, BlockNode, SecurityNode, TestSuiteNode, 
  WorkflowTransition, WebhookSecurityConfig, RetryConfig, StackConfig, ArchitectureConfig, InfrastructureConfig, ValidateConfig, ViolationConfig, HealthCheckItem, 

  CICDGenNode, CICDStep, CICDJob, AutoGenOptions, SectionDefinition, SEOConfig, PerformanceConfig, DataFetchingConfig, DataFetchingSource
} from './types';
import { KEYWORDS, tokenize } from './lexer';



// === Utility function ===
export function parseTP(source: string): ParseResult {
  const parser = new TPParser();
  return parser.parse(source);
}

// === Generate Graph Data from Parse Result ===
export function generateGraphData(program: ProgramNode): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  let x = 0;
  let y = 0;
  const xSpacing = 250;
  const ySpacing = 150;
  let row = 0;
  
  // Helper to add node
  const addNode = (id: string, type: BlockType, label: string, data: ASTNode) => {
    nodes.push({
      id,
      type,
      label,
      data,
      position: { x: (nodes.length % 4) * xSpacing, y: Math.floor(nodes.length / 4) * ySpacing },
    });
  };
  
  // Add imports
  program.imports.forEach((imp, i) => {
    addNode(`import-${i}`, 'import', imp.path || 'import', imp);
  });
  
  // Add enums
  program.enums.forEach((en, i) => {
    addNode(`enum-${en.name}`, 'enum', en.name, en);
  });
  
  // Add dataJsons
  program.dataJsons.forEach((dj, i) => {
    addNode(`dataJson-${dj.name}`, 'dataJson', dj.name, dj);
    
    // Add edges for field references
    dj.fields.forEach(field => {
      const dt = field.dataType;
      if (typeof dt === 'object' && dt.type === 'Reference') {
        edges.push({
          id: `${dj.name}-${dt.model}`,
          source: `dataJson-${dj.name}`,
          target: `dataJson-${dt.model}`,
          type: 'reference',
          label: field.name,
        });
      }
    });
  });
  
  // Add models
  program.models.forEach((model, i) => {
    addNode(`model-${model.name}`, 'model', model.name, model);
  });
  
  // Add microservices
  program.microservices.forEach((ms, i) => {
    addNode(`microservice-${ms.name}`, 'microservice', ms.name, ms);
    
    // Add dependency edges
    ms.dependencies.forEach(dep => {
      edges.push({
        id: `${ms.name}-dep-${dep}`,
        source: `microservice-${ms.name}`,
        target: `microservice-${dep}`,
        type: 'dependency',
        label: 'depends on',
      });
    });
  });
  
  // Add components
  program.components.forEach((comp, i) => {
    addNode(`component-${comp.name}`, 'component', comp.name, comp);
  });
  
  // Add pages
  program.pages.forEach((page, i) => {
    addNode(`page-${page.name}`, 'page', page.name, page);
  });
  
  // Add autoGens
  program.autoGens.forEach((ag, i) => {
    console.log(ag.target);
    addNode(`autogen-${i}`, 'autogen', `AutoGen ${ag.target}`, ag);
  });
  
  // Add deploys
  program.deploys.forEach((dep, i) => {
    addNode(`deploy-${i}`, 'deploy', `Deploy ${dep.target}`, dep);
  });
  
  // Ajouts pour nouvelles
  program.genTests.forEach((gt, i) => {
    addNode(`gentest-${i}`, 'gentest', `GenTest ${gt.target}`, gt);
  });

  program.crudGens.forEach((cg, i) => {
    addNode(`crudgen-${i}`, 'crudgen', `CRUDGen ${cg.for}`, cg);
  });

  // Nouvel ajout pour CI/CD
  program.cicdGens.forEach((cicd, i) => {
    addNode(`cicdgen-${i}`, 'cicdgen', `CICDGen ${cicd.target}`, cicd);
    // Edges pour dépendances jobs
    Object.entries(cicd.jobs).forEach(([jobName, job]) => {
      job.needs?.forEach(need => {
        edges.push({
          id: `${jobName}-needs-${need}`,
          source: jobName,
          target: need,
          type: 'dependency',
          label: 'needs',
        });
      });
    });
  });
    // In addNode calls
  program.integrations.forEach((int, i) => {
    addNode(`integration-${i}`, 'integration', int.name, int);
  });
  program.genTests.forEach((tg, i) => {
    addNode(`testgen-${i}`, 'testgen', `TestGen ${tg.target}`, tg);
  });
  // Add for all new: apigen, block, property, array, object, literal, reference, plugin, indexstrategy, componentlibrary, layout, search, realtime, database, index

  // Edges for new relations, e.g., for integration mapping
  program.integrations.forEach(int => {
    Object.keys(int.mapping).forEach(mapKey => {
      edges.push({ id: `${int.name}-map-${mapKey}`, source: `integration-${int.name}`, target: mapKey, type: 'reference' });
    });
  });
  // Similar for others

  return { nodes, edges };
}

function getTokenValue(token: Token): string {
  return token.value as string; // Adjust according to your Token structure
}

export class TPParser {
  private tokens: Token[] = [];
  private current: number = 0;
  private errors: ParseError[] = [];
  private warnings: ParseWarning[] = [];
  private startTime: number = 0;
  private keys:Array<JSON>=[];
  private last_key:string = "";

  parse(source: string): ParseResult {
    this.startTime = performance.now();
    this.tokens = tokenize(source);
    this.current = 0;
    this.errors = [];
    this.warnings = [];

    const program = this.parseProgramNode();
    const parseTime = performance.now() - this.startTime;

    const statistics = this.calculateStatistics(program, source, parseTime);

    return {
      success: this.errors.length === 0,
      program,
      errors: this.errors,
      warnings: this.warnings,
      statistics,
    };
  }

  private parseProgramNode(): ProgramNode {
    const program: ProgramNode = {
      type: 'Program',
      // Structure hiérarchique principale
      imports: [],
      modules: [],
      directives: [],
      macros: [],
      
      // Éléments de données
      enums: [],
      dataJsons: [],
      models: [],
      fields: [],
      relations: [],
      
      // UI
      components: [],
      pages: [],
      sections: [],
      layouts: [],
      componentLibraries: [],
      
      // API & infra
      apis: [],
      microservices: [],
      eventBuses: [],
      webhooks: [],
      integrations: [],
      endpoints: [],
      
      // Patterns & logique métier
      businessRules: [],
      workflows: [],
      sagas: [],
      cqrsContexts: [],
      eventSourcings: [],
      steps: [],
      projections: [],
      snapshots: [],
      
      // Génération & infra
      autoGens: [],
      apiGens: [],
      crudGens: [],
      uiGens: [],
      componentGens: [],
      relationPathGens: [],
      mockDataGens: [],
      docGens: [],
      perfOptGens: [],
      secScanGens: [],
      migrationGens: [],
      graphQLGens: [],
      restGens: [],
      webSocketGens: [],
      cicdGens: [],
      deploys: [],
      caches: [],
      healthChecks: [],
      monitors: [],
      metrics: [],
      alerts: [],
      indexStrategies: [],
      
      // Autres
      templates: [],
      blueprints: [],
      plugins: [],
      tests: [],
      testSuites: [],
      securityRules: [],
      directivesAvancees: [],
      blocks: [],
      properties: [],
      arrays: [],
      objects: [],
      genTests: [],
      literals: [],
      references: [],
      indexes: [],
      realTimes: [],
      searches: [],
      databases: []
    };
    
    while (!this.isAtEnd()) {
      try {
        const node = this.parseTopLevel();
        if (node) {
          this.addNodeToProgram(program, node);
        }
      } catch (error) {
        this.synchronize();
      }
    }

    return program;
  }

  private parseEventBus(): EventBusNode {
    const eventBus: EventBusNode = {
      type: 'EventBus',
      name: "",
      events: [],
      subscribers: []
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      
      switch (key) {
        case 'name':
          eventBus.name = this.expect('IDENTIFIER').value || this.expect('STRING').value;
        case 'events':
          eventBus.events = this.parseArrayOfStrings();
          break;
        case 'subscribers':
          eventBus.subscribers = this.parseArrayOfSubscribers();
          break;
        default:
          this.error(`Propriété inattendue dans eventBus : ${key}`);
          this.advance();
      }
      
      if (this.checkPunctuation(',')) this.advance();
    }

    this.expectPunctuation('}');
    return eventBus;
  }

  private parseArrayOfSubscribers(): EventSubscriber[] {
    const subscribers: EventSubscriber[] = [];
    this.expectPunctuation('[');
    
    while (!this.checkPunctuation(']') && !this.isAtEnd()) {
      this.expectPunctuation('{');
      const sub: EventSubscriber = { event: '', handler: '' };
      
      while (!this.checkPunctuation('}')) {
        const key = this.expect('IDENTIFIER').value;
        this.expectPunctuation(':');
        if (key === 'event') {
          sub.event = this.expect('IDENTIFIER').value;
        } else if (key === 'handler') {
          sub.handler = this.expect('IDENTIFIER').value;
        } else {
          this.advance();
        }
        if (this.checkPunctuation(',')) this.advance();
      }
      
      this.expectPunctuation('}');
      subscribers.push(sub);
      
      if (this.checkPunctuation(',')) this.advance();
    }
    
    this.expectPunctuation(']');
    return subscribers;
  }

  private parseIntegration(): IntegrationNode {
    const name = this.expect('IDENTIFIER').value;
    this.expectPunctuation('{');
    const integration: IntegrationNode = { type: 'Integration', name, provider: '', version: '', auth: { type: 'API_KEY', credentials: '' }, endpoints: {}, mapping: {} };
    while (!this.checkPunctuation('}')) {
      const key = this.expect('KEYWORD').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      if (key === 'provider') integration.provider = value;
      // Handle other fields similarly
    }
    this.expectPunctuation('}');
    return integration;
  }

  private parseTopLevel(): ASTNode | null {
    // Skip comments
    while (this.check('COMMENT')) {
      this.advance();
    }

    if (this.isAtEnd()) return null;

    // Handle decorators (main entry for directives)
    if (this.check('DECORATOR')) {
      return this.parseDecorator();
    }


    // Handle keywords
    if (this.check('KEYWORD')) {
      const keyword = this.peek().value;
      switch (keyword) {
        case 'Module':
          return this.parseModuleBlock();
        case 'GenTest':
          return this.parseGenTest();
        case 'CRUDGen':
          return this.parseCRUDGen();
        case 'UIGen':
          return this.parseUIGen();
        case 'ComponentGen':
          return this.parseComponentGen();
        case 'RelationPathGen':
          return this.parseRelationPathGen();
        case 'MockDataGen':
          return this.parseMockDataGen();
        case 'DocGen':
          return this.parseDocGen();
        case 'PerfOptGen':
          return this.parsePerfOptGen();
        case 'SecScanGen':
          return this.parseSecScanGen();
        case 'MigrationGen':
          return this.parseMigrationGen();
        case 'GraphQLGen':
          return this.parseGraphQLGen();
        case 'RESTGen':
          return this.parseRESTGen();
        case 'WebSocketGen':
          return this.parseWebSocketGen();
        case 'CICDGen':
          return this.parseCICDGen();
        default:
          this.keys.push(JSON.parse(`{${keyword}:null}`));
          this.advance();
          return null;
      }
    }
    this.advance();
    return null;
  }


  private parseArrayNode(): ArrayNode {
    const arrayNode: ArrayNode = {
      type: 'Array',
      elements: [],
      elementType: undefined,
    };

    this.expectPunctuation('[');

    while (!this.checkPunctuation(']') && !this.isAtEnd()) {
      const element = this.parseValue();
      if (element !== null) {
        arrayNode.elements.push(element as ASTNode);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation(']');

    // Inférer le type d'élément si possible
    if (arrayNode.elements.length > 0) {
      arrayNode.elementType = this.inferDataTypeFromValue(arrayNode.elements[0]);
    }

    return arrayNode;
  }

  private parseDataSource(): DataSource {
    const dataSource: DataSource = {
      type: 'static',
      source: undefined,
      params: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();

      switch (key) {
        case 'type':
          if (['static', 'api', 'dynamic'].includes(value as string)) {
            dataSource.type = value as 'static' | 'api' | 'dynamic';
          }
          break;
        case 'source':
          dataSource.source = value as string;
          break;
        case 'params':
          dataSource.params = value as Record<string, any>;
          break;
        default:
          this.error(`Clé inattendue dans data source : ${key}`);
      }

      if (this.checkPunctuation(',')) this.advance();
    }

    this.expectPunctuation('}');
    return dataSource;
  }
  private inferDataTypeFromValue(value: any): DataType | undefined {
    if (value === null) return 'Json'; // ou type spécifique si vous avez Null
    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') return Number.isInteger(value) ? 'Int' : 'Float';
    if (typeof value === 'boolean') return 'Boolean';
    if (Array.isArray(value)) {
      if (value.length === 0) return { type: 'Array', elementType: 'Json' };
      const first = value[0];
      return { type: 'Array', elementType: this.inferDataTypeFromValue(first) || 'Json' };
    }
    if (typeof value === 'object' && value !== null) {
      return 'Json';
    }
    return undefined;
  }
  private parseSagaStep(): SagaStepNode {
    const name = this.expect('IDENTIFIER').value;

    const step: SagaStepNode = {
      type: 'Step',
      name,
      action: '',
      compensate: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();

      switch (key) {
        case 'action':
          step.action = value as string;
          break;

        case 'compensate':
          // Peut être une string (nom d'une autre étape) ou un StepNode inline
          if (this.check('IDENTIFIER')) {
            step.compensate = this.expect('IDENTIFIER').value;
          } else if (this.checkPunctuation('{')) {
            step.compensate = this.parseSagaStep(); // récursif pour step inline
          } else {
            this.error('Valeur invalide pour compensate (attendu: string ou { ... })');
          }
          break;

        default:
          this.error(`Propriété inconnue dans Step : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return step;
  }
  private parseDirectivesAvancees(): DirectivesAvanceesNode {
    const name = this.expect('IDENTIFIER').value;
    
    const node: DirectivesAvanceesNode = {
      type: 'DirectivesAvancees',
      name,
      hostBindings: {},
      hostListeners: {},
      code: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();

      switch (key) {
        case 'hostBindings':
          node.hostBindings = value as Record<string, string>;
          break;

        case 'hostListeners':
          node.hostListeners = value as Record<string, string>;
          break;

        case 'code':
          node.code = value as string;
          break;

        default:
          this.error(`Propriété inconnue dans DirectivesAvancees : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return node;
  }

  private parseCICDJobs(): Record<string, CICDJob> {
    const jobs: Record<string, CICDJob> = {};
    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const jobName = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      this.expectPunctuation('{');

      const job: CICDJob = {
        name: jobName,
        runsOn: 'ubuntu-latest',
        steps: [],
        needs: [],
        strategy: undefined
      };

      while (!this.checkPunctuation('}') && !this.isAtEnd()) {
        const key = this.expect('IDENTIFIER').value;
        this.expectPunctuation(':');
        
        switch (key) {
          case 'runsOn':
            job.runsOn = this.expect('STRING').value;
            break;
          case 'steps':
            job.steps = this.parseCICDSteps();
            break;
          case 'needs':
            job.needs = this.parseArrayOfStrings();
            break;
          case 'strategy':
            job.strategy = { matrix: this.parseObject() as Record<string, string[]> };
            break;
          default:
            this.advance();
        }
        
        if (this.checkPunctuation(',')) this.advance();
      }

      this.expectPunctuation('}');
      jobs[jobName] = job;

      if (this.checkPunctuation(',')) this.advance();
    }

    this.expectPunctuation('}');
    return jobs;
  }
  private parseImport(): ImportNode {
    const importNode: ImportNode = {
      type: 'Import',
      path: '',
      alias: undefined,
      from: '',
      items: undefined,
      resolved: false
    };

    // Support de plusieurs formes courantes :
    // import "module"
    // import { X, Y } from "module"
    // import * as alias from "module"

    if (this.check('STRING')) {
      // import "chemin"
      importNode.path = this.advance().value;
    } else if (this.checkPunctuation('{')) {
      // import { ... } from "..."
      this.advance(); // consomme {
      importNode.items = [];
      while (!this.checkPunctuation('}')) {
        const item = this.expect('IDENTIFIER').value;
        importNode.items.push(item);
        if (this.checkPunctuation(',')) this.advance();
      }
      this.expectPunctuation('}');
      this.expect('KEYWORD'); // from
      importNode.from = this.expect('STRING').value;
    } else if (this.check('IDENTIFIER') && this.peek().value === '*') {
      // import * as alias from "..."
      this.advance(); // *
      this.expect('KEYWORD'); // as
      importNode.alias = this.expect('IDENTIFIER').value;
      this.expect('KEYWORD'); // from
      importNode.from = this.expect('STRING').value;
    } else {
      // cas le plus simple : import Nom from "chemin"
      importNode.from = this.expect('IDENTIFIER').value;
      this.expect('KEYWORD'); // from
      importNode.path = this.expect('STRING').value;
    }

    return importNode;
  }
  private parseObjectNode(): ObjectNode {
    const objectNode: ObjectNode = {
      type: 'Object',
      properties: [],
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      if (this.check('IDENTIFIER') || this.check('STRING')) {
        const key = this.advance().value;
        this.expectPunctuation(':');
        const value = this.parseValue();
        const property: PropertyNode = {
          type: 'Property',
          name: key,
          value,
          dataType: this.inferDataTypeFromValue(value),
        };
        objectNode.properties.push(property);
        if (this.checkPunctuation(',')) {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return objectNode;
  }
  private parseReference(): ReferenceNode {
    const target = this.expect('IDENTIFIER').value;
    const referenceNode: ReferenceNode = {
      type: 'Reference',
      target,
      path: undefined,
    };

    if (this.checkPunctuation('.')) {
      this.advance();
      referenceNode.path = this.expect('IDENTIFIER').value;
    }

    return referenceNode;
  }
  private parsePlugin(): PluginNode {
    const name = this.expect('IDENTIFIER').value;
    const pluginNode: PluginNode = {
      type: 'Plugin',
      name,
      target: undefined,
      hooks: [],
      priority: undefined,
      code: undefined,
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'target':
          pluginNode.target = value as string;
          break;
        case 'hooks':
          pluginNode.hooks = value as string[];
          break;
        case 'priority':
          pluginNode.priority = value as number;
          break;
        case 'code':
          pluginNode.code = value as string;
          break;
        default:
          this.error(`Unknown plugin property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return pluginNode;
  }
  private parseComponentLibrary(): ComponentLibraryNode {
    const name = this.expect('IDENTIFIER').value;
    const componentLibraryNode: ComponentLibraryNode = {
      type: 'ComponentLibrary',
      name,
      components: [],
      theme: undefined,
      version: undefined,
      exports: [],
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'components':
          componentLibraryNode.components = value as string[];
          break;
        case 'theme':
          componentLibraryNode.theme = value as 'light' | 'dark' | string;
          break;
        case 'version':
          componentLibraryNode.version = value as string;
          break;
        case 'exports':
          componentLibraryNode.exports = value as string[];
          break;
        default:
          this.error(`Unknown component library property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return componentLibraryNode;
  }
  private parseLayout(): LayoutNode {
    const name = this.expect('IDENTIFIER').value;
    const layoutNode: LayoutNode = {
      type: 'Layout',
      name,
      typeLayout: 'grid',
      sections: [],
      responsive: {},
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'typeLayout':
          layoutNode.typeLayout = value as 'grid' | 'flex' | 'stack' | 'sidebar' | string;
          break;
        case 'sections':
          layoutNode.sections = value as Array<{ name: string; position?: 'header' | 'main' | 'footer' }>;
          break;
        case 'responsive':
          layoutNode.responsive = value as Record<string, string>;
          break;
        default:
          this.error(`Unknown layout property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return layoutNode;
  }
  private parseSearch(): SearchNode {
    const name = this.expect('IDENTIFIER').value;
    const searchNode: SearchNode = {
      type: 'Search',
      name,
      engine: undefined,
      fields: [],
      fuzziness: false,
      ranking: {},
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'engine':
          searchNode.engine = value as 'Elasticsearch' | 'Algolia' | 'DBNative' | string;
          break;
        case 'fields':
          searchNode.fields = value as string[];
          break;
        case 'fuzziness':
          searchNode.fuzziness = value as boolean;
          break;
        case 'ranking':
          searchNode.ranking = value as Record<string, number>;
          break;
        default:
          this.error(`Unknown search property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return searchNode;
  }
  private parseRealTime(): RealTimeNode {
    const name = this.expect('IDENTIFIER').value;
    const realTimeNode: RealTimeNode = {
      type: 'RealTime',
      name,
      channels: [],
      authRequired: false,
      transport: 'WebSocket',
      fallback: undefined,
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'channels':
          realTimeNode.channels = value as string[];
          break;
        case 'authRequired':
          realTimeNode.authRequired = value as boolean;
          break;
        case 'transport':
          realTimeNode.transport = value as 'WebSocket' | 'SSE' | 'LongPolling';
          break;
        case 'fallback':
          realTimeNode.fallback = value as string;
          break;
        default:
          this.error(`Unknown real-time property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return realTimeNode;
  }
  private parseDatabase(): DatabaseNode {
    const name = this.expect('IDENTIFIER').value;
    const databaseNode: DatabaseNode = {
      type: 'Database',
      name,
      typeDb: 'PostgreSQL',
      models: [],
      connection: {},
      pooling: {},
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'typeDb':
          databaseNode.typeDb = value as 'PostgreSQL' | 'MongoDB' | 'MySQL' | 'SQLite' | string;
          break;
        case 'models':
          databaseNode.models = value as string[];
          break;
        case 'connection':
          databaseNode.connection = value as { host?: string; port?: number; user?: string; password?: string; database?: string };
          break;
        case 'pooling':
          databaseNode.pooling = value as { min?: number; max?: number; idleTimeout?: number };
          break;
        default:
          this.error(`Unknown database property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return databaseNode;
  }
  private parseIndexNode(): IndexNode {
    const name = this.expect('IDENTIFIER').value;
    const indexNode: IndexNode = {
      type: 'Index',
      name,
      entity: '',
      fields: [],
      typeIndex: undefined,
      unique: false,
      where: undefined,
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'entity':
          indexNode.entity = value as string;
          break;
        case 'fields':
          indexNode.fields = value as string[];
          break;
        case 'typeIndex':
          indexNode.typeIndex = value as 'BTREE' | 'HASH' | 'GIN' | 'FULLTEXT';
          break;
        case 'unique':
          indexNode.unique = value as boolean;
          break;
        case 'where':
          indexNode.where = value as string;
          break;
        default:
          this.error(`Unknown index property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return indexNode;
  }
  private parseField(): FieldNode {
    const name = this.expect('IDENTIFIER').value;
    this.expectPunctuation(':');
    const typeName = this.expect('IDENTIFIER').value;
    const fieldNode: FieldNode = {
      type: 'Field',
      name,
      dataType: this.resolveDataType(typeName),
      isRequired: false,
      isUnique: false,
      isImmutable: false,
      isArray: false,
      defaultValue: undefined,
      validators: [],
      decorators: []
    };

    while (this.check('DECORATOR')) {
      const dec = this.parseDecorator();
      if (dec) {
        fieldNode.decorators?.push(dec as Decorator);
        if (dec.name === 'required') fieldNode.isRequired = true;
        if (dec.name === 'unique') fieldNode.isUnique = true;
        if (dec.name === 'immutable') fieldNode.isImmutable = true;
        if (dec.name === 'array') fieldNode.isArray = true;
      }
    }

    if (this.checkOperator('=')) {
      this.advance();
      fieldNode.defaultValue = this.parseValue();
    }

    if (this.checkPunctuation('[')) {
      fieldNode.validators = this.parseArrayOfValidators();
    }

    return fieldNode;
  }

  private parseArrayOfValidators(): FieldValidator[] {
    const validators: FieldValidator[] = [];
    this.expectPunctuation('[');
    while (!this.checkPunctuation(']')) {
      const val: FieldValidator = { type: this.expect('IDENTIFIER').value };
      if (this.checkPunctuation(':')) {
        this.advance();
        val.value = this.parseValue();
      }
      if (this.check('STRING')) {
        val.message = this.advance().value;
      }
      validators.push(val);
      if (this.checkPunctuation(',')) this.advance();
    }
    this.expectPunctuation(']');
    return validators;
  }
  private parseRelation(): RelationNode {
    const name = this.expect('IDENTIFIER').value;
    this.expectPunctuation(':');
    const target = this.expect('IDENTIFIER').value;
    const relationNode: RelationNode = {
      type: 'Relation',
      name,
      target,
      relationType: 'OneToOne',
      foreignKey: undefined,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'relationType':
          relationNode.relationType = value as 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
          break;
        case 'foreignKey':
          relationNode.foreignKey = value as string;
          break;
        case 'onDelete':
          relationNode.onDelete = value as 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
          break;
        case 'onUpdate':
          relationNode.onUpdate = value as 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
          break;
        default:
          this.error(`Unknown relation property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return relationNode;
  }
  private parseAPI(): APINode {
    const apiNode: APINode = {
      type: 'API',
      apiType: 'REST',
      version: undefined,
      basePath: undefined,
      endpoints: [],
      security: undefined,
      schema: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'apiType':
          apiNode.apiType = value as 'REST' | 'GraphQL' | 'gRPC';
          break;
        case 'version':
          apiNode.version = value as string;
          break;
        case 'basePath':
          apiNode.basePath = value as string;
          break;
        case 'endpoints':
          apiNode.endpoints = this.parseArrayOfEndpoints();
          break;
        case 'security':
          apiNode.security = this.parseSecurityConfig();
          break;
        case 'schema':
          apiNode.schema = value as GraphQLSchemaConfig;
          break;
        default:
          this.error(`Unknown API property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return apiNode;
  }

  private parseArrayOfEndpoints(): EndpointNode[] {
    const endpoints: EndpointNode[] = [];
    this.expectPunctuation('[');
    while (!this.checkPunctuation(']')) {
      endpoints.push(this.parseEndpoint());
      if (this.checkPunctuation(',')) this.advance();
    }
    this.expectPunctuation(']');
    return endpoints;
  }
  private parseEndpoint(): EndpointNode {
    const endpointNode: EndpointNode = {
      type: 'Endpoint',
      method: 'GET',
      path: '',
      handler: undefined,
      middleware: [],
      request: undefined,
      response: undefined,
      description: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'method':
          endpointNode.method = value as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
          break;
        case 'path':
          endpointNode.path = value as string;
          break;
        case 'handler':
          endpointNode.handler = value as string;
          break;
        case 'middleware':
          endpointNode.middleware = value as string[];
          break;
        case 'request':
          endpointNode.request = value as SchemaDefinition;
          break;
        case 'response':
          endpointNode.response = value as SchemaDefinition;
          break;
        case 'description':
          endpointNode.description = value as string;
          break;
        default:
          this.error(`Unknown endpoint property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return endpointNode;
  }

  private parseSnapshot(): SnapshotNode {
    const name = this.expect('IDENTIFIER').value;
    
    const snapshotNode: SnapshotNode = {
      type: 'Snapshot',
      name,
      aggregate: '',
      version: 0,
      frequency: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();

      switch (key) {
        case 'aggregate':
          snapshotNode.aggregate = value as string;
          break;
        case 'version':
          snapshotNode.version = value as number;
          break;
        case 'frequency':
          snapshotNode.frequency = value as string;
          break;
        default:
          this.error(`Propriété inconnue dans Snapshot : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return snapshotNode;
  }

  private parseMetric(): MetricNode {
    const name = this.expect('IDENTIFIER').value;
    
    const metricNode: MetricNode = {
      type: 'Metrics',
      name,
      strategy: 'counter',
      labels: [],
      help: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();

      switch (key) {
        case 'strategy':
          metricNode.strategy = value as 'counter' | 'gauge' | 'histogram' | 'summary';
          break;
        case 'labels':
          metricNode.labels = value as string[];
          break;
        case 'help':
          metricNode.help = value as string;
          break;
        default:
          this.error(`Propriété inconnue dans Metric : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return metricNode;
  }
  private parseAlert(): AlertNode {
    const name = this.expect('IDENTIFIER').value;
    
    const alertNode: AlertNode = {
      type: 'Alert',
      name,
      condition: '',
      severity: 'LOW',
      action: '',
      threshold: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();

      switch (key) {
        case 'condition':
          alertNode.condition = value as string;
          break;
        case 'severity':
          alertNode.severity = value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          break;
        case 'action':
          alertNode.action = value as string;
          break;
        case 'threshold':
          alertNode.threshold = value;
          break;
        default:
          this.error(`Propriété inconnue dans Alert : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return alertNode;
  }
  private parseSection(): SectionNode {
    const name = this.expect('IDENTIFIER').value;
    
    const sectionNode: SectionNode = {
      type: 'Section',
      name,
      component: ''
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();

      switch (key) {
        case 'component':
          sectionNode.component = value as string;
          break;
        default:
          this.error(`Propriété inconnue dans Section : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return sectionNode;
  }
  private parseLiteralNode(): LiteralNode {
    let token = this.advance();
    let value: string | number | boolean | null | bigint;
    let raw: string = token.value;
    let literalType: 'string' | 'number' | 'boolean' | 'null' | 'bigint' | undefined;

    switch (token.type) {
      case 'STRING':
        // On retire les guillemets (simple ou double)
        value = token.value.slice(1, -1);
        literalType = 'string';
        break;

      case 'NUMBER':
        // On tente de parser en number ou bigint
        if (token.value.endsWith('n')) {
          // bigint (ex: 123n)
          value = BigInt(token.value.slice(0, -1));
          literalType = 'bigint';
        } else if (token.value.includes('.')) {
          value = parseFloat(token.value);
          literalType = 'number';
        } else {
          value = parseInt(token.value, 10);
          literalType = 'number';
        }
        break;

      case 'BOOLEAN':
        value = token.value === 'true';
        literalType = 'boolean';
        break;

      case 'KEYWORD':
        if (token.value === 'null') {
          value = null;
          literalType = 'null';
        } else {
          this.error(`Mot-clé inattendu dans un littéral : ${token.value}`);
          value = null;
          literalType = 'null';
        }
        break;

      default:
        this.error(`Type de token inattendu pour un littéral : ${token.type}`);
        value = null;
        literalType = 'null';
        raw = '';
    }

    const node: LiteralNode = {
      type: 'Literal',
      value,
      raw,
      literalType,
      documentation: undefined,
      decorators: []
    };

    // Optionnel : documentation juste après (commentaire ou string multiligne)
    if (this.check('COMMENT') || this.check('MULTI_LINE_STRING')) {
      node.documentation = this.advance().value;
    }

    // Décorateurs éventuels (ex: @deprecated, @internal sur une constante littérale)
    while (this.check('DECORATOR')) {
      const decorator = this.parseDecorator();
      if (decorator) {
        node.decorators!.push({
          ...decorator,
          name: decorator.name ?? 'unknown' 
        });
      }
    }

    return node;
  }
  private parseCICDGen(): CICDGenNode {
    const target = this.expect('IDENTIFIER').value;
    
    const cicdGen: CICDGenNode = {
      type: 'CICDGen',
      target: target as 'GITHUB_ACTIONS' | 'GITLAB_CI' | 'JENKINS' | 'AZURE_DEVOPS',
      name: target.toLowerCase(),           // on déduit un nom logique à partir du target
      steps: [],
      environment: 'production',
      triggers: ['push'],
      jobs: {},
      artifacts: [],
      cache: { paths: ['node_modules'], key: '${{ runner.os }}-node-${{ hashFiles(\'**/package-lock.json\') }}' },
      secrets: {},
      matrix: {}
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');

      switch (key) {
        case 'name':
          cicdGen.name = this.expect('IDENTIFIER').value || this.expect('STRING').value;
          break;
        case 'steps':
          cicdGen.steps = this.parseCICDSteps();
          break;
        case 'environment':
          cicdGen.environment = this.expect('IDENTIFIER').value as 'development' | 'staging' | 'production';
          break;
        case 'triggers':
          this.expectPunctuation('[');
          cicdGen.triggers = this.parseArrayOfStrings() as ('push' | 'pull_request' | 'schedule')[];
          this.expectPunctuation(']');
          break;
        case 'jobs':
          cicdGen.jobs = this.parseCICDJobs();
          break;
        case 'artifacts':
          this.expectPunctuation('[');
          cicdGen.artifacts = this.parseArrayOfStrings();
          this.expectPunctuation(']');
          break;
        case 'cache':
          cicdGen.cache = this.parseObject() as { paths: string[]; key: string };
          break;
        case 'secrets':
          cicdGen.secrets = this.parseObject() as Record<string, string>;
          break;
        case 'matrix':
          cicdGen.matrix = this.parseObject() as Record<string, string[]>;
          break;
        default:
          this.error(`Propriété inconnue dans CICDGen : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');
    return cicdGen;
  }

  private inferLiteralType(value: any): 'string' | 'number' | 'boolean' | 'null' | 'bigint' | undefined {
    if (value === null) return 'null';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'bigint') return 'bigint';
    return undefined;
  }
  private parseIndexStrategy(): IndexStrategyNode {
    const name = this.expect('IDENTIFIER').value;
    const indexStrategyNode: IndexStrategyNode = {
      type: 'IndexStrategy',
      name,
      entity: '',
      strategy: undefined,
      fields: [],
      unique: false,
      composite: false,
      customConfig: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'entity':
          indexStrategyNode.entity = value as string;
          break;
        case 'strategy':
          indexStrategyNode.strategy = value as 'BTREE' | 'HASH' | 'GIN' | 'FULLTEXT' | 'SPATIAL';
          break;
        case 'fields':
          indexStrategyNode.fields = value as string[];
          break;
        case 'unique':
          indexStrategyNode.unique = value as boolean;
          break;
        case 'composite':
          indexStrategyNode.composite = value as boolean;
          break;
        case 'customConfig':
          indexStrategyNode.customConfig = value as Record<string, any>;
          break;
        default:
          this.error(`Unknown index strategy property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return indexStrategyNode;
  }
  private parseDirectiveNode(): DirectiveNode {
    const name = this.expect('IDENTIFIER').value;
    const directiveNode: DirectiveNode = {
      type: 'Directive',
      name,
      target: undefined,
      config: {},
      children: [],
      orchestration: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'target':
          directiveNode.target = value as string;
          break;
        case 'config':
          directiveNode.config = value as Record<string, any>;
          break;
        case 'orchestration':
          directiveNode.orchestration = value as { sequence: string[]; dependencies: Record<string, string[]>; parallelJobs?: boolean };
          break;
        default:
          // Assume children if not a known key
          if (value && typeof value === 'object' && value.type) {
            directiveNode.children.push(value as ASTNode);
          } else {
            this.error(`Unknown directive property: ${key}`);
          }
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return directiveNode;
  }
  private parseMacro(): MacroNode {
    const name = this.expect('IDENTIFIER').value;
    const macroNode: MacroNode = {
      type: 'Macro',
      name,
      params: [],
      code: ''
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'params':
          macroNode.params = value as Array<{ name: string; type: string; defaultValue?: any }>;
          break;
        case 'code':
          macroNode.code = value as string;
          break;
        default:
          this.error(`Unknown macro property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return macroNode;
  }
  private parseEnum(): EnumNode {
    const name = this.expect('IDENTIFIER').value;
    const enumNode: EnumNode = {
      type: 'Enum',
      name,
      values: [],
      module: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const valName = this.expect('IDENTIFIER').value;
      const enumValue: EnumValue = { name: valName, value: undefined, documentation: undefined };
      if (this.checkOperator('=')) {
        this.advance();
        enumValue.value = this.parseValue();
      }
      if (this.check('STRING')) {
        enumValue.documentation = this.advance().value;
      }
      enumNode.values.push(enumValue);
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return enumNode;
  }
  private parseComponent(): ComponentNode {
    const name = this.expect('IDENTIFIER').value;
    const componentNode: ComponentNode = {
      type: 'Component',
      name,
      props: [],
      variants: undefined,
      styles: undefined,
      animations: [],
      accessibility: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'props':
          componentNode.props = value as PropDefinition[];
          break;
        case 'variants':
          componentNode.variants = value as VariantDefinition[];
          break;
        case 'styles':
          componentNode.styles = value as StyleDefinition;
          break;
        case 'animations':
          componentNode.animations = value as AnimationDefinition[];
          break;
        case 'accessibility':
          componentNode.accessibility = value as AccessibilityConfig;
          break;
        default:
          this.error(`Unknown component property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return componentNode;
  }
  private parsePage(): PageNode {
    const name = this.expect('IDENTIFIER').value;
    const pageNode: PageNode = {
      type: 'Page',
      name,
      path: '',
      layout: undefined,
      authGuard: undefined,
      sections: [],
      seo: undefined,
      performance: undefined,
      auth: undefined,
      dataFetching: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'path':
          pageNode.path = value as string;
          break;
        case 'layout':
          pageNode.layout = value as string;
          break;
        case 'authGuard':
          pageNode.authGuard = value as 'public' | 'authenticated' | 'admin' | string;
          break;
        case 'sections':
          pageNode.sections = value as SectionNode[];
          break;
        case 'seo':
          pageNode.seo = value as SEOConfig;
          break;
        case 'performance':
          pageNode.performance = value as PerformanceConfig;
          break;
        case 'auth':
          pageNode.auth = value as 'required' | 'optional' | 'none';
          break;
        case 'dataFetching':
          pageNode.dataFetching = value as DataFetchingConfig;
          break;
        default:
          this.error(`Unknown page property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return pageNode;
  }
  private parseAutoGen(): AutoGenNode {
    const target = this.expect('IDENTIFIER').value;
    const autoGenNode: AutoGenNode = {
      type: 'AutoGen',
      target: target as 'Backend' | 'Frontend' | 'Database' | 'API' | 'Tests',
      framework: undefined,
      language: undefined,
      orm: undefined,
      database: undefined,
      models: [],
      views: undefined,
      options: {},
      structure: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'framework':
          autoGenNode.framework = value as string;
          break;
        case 'language':
          autoGenNode.language = value as string;
          break;
        case 'orm':
          autoGenNode.orm = value as string;
          break;
        case 'database':
          autoGenNode.database = value as string;
          break;
        case 'models':
          autoGenNode.models = value as string[];
          break;
        case 'views':
          autoGenNode.views = value as string[];
          break;
        case 'options':
          autoGenNode.options = value as AutoGenOptions;
          break;
        case 'structure':
          autoGenNode.structure = value as Record<string, any>;
          break;
        default:
          this.error(`Unknown autoGen property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return autoGenNode;
  }
  private parseTest(): TestNode {
    const name = this.expect('IDENTIFIER').value;
    const testNode: TestNode = {
      type: 'Test',
      name,
      coverage: undefined,
      types: [],
      framework: undefined,
      scenarios: undefined,
      unit: undefined,
      integration: undefined,
      e2e: undefined,
      performance: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'coverage':
          testNode.coverage = value as number;
          break;
        case 'types':
          testNode.types = value as ('UNIT' | 'INTEGRATION' | 'E2E' | 'PERFORMANCE')[];
          break;
        case 'framework':
          testNode.framework = value as string;
          break;
        case 'scenarios':
          testNode.scenarios = value as string[];
          break;
        case 'unit':
          testNode.unit = value as UnitTestConfig;
          break;
        case 'integration':
          testNode.integration = value as IntegrationTestConfig;
          break;
        case 'e2e':
          testNode.e2e = value as E2ETestConfig;
          break;
        case 'performance':
          testNode.performance = value as PerformanceTestConfig;
          break;
        default:
          this.error(`Unknown test property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return testNode;
  }
  private parseWebhook(): WebhookNode {
    const name = this.expect('IDENTIFIER').value;
    const webhookNode: WebhookNode = {
      type: 'Webhook',
      name,
      url: '',
      events: [],
      security: undefined,
      retry: undefined,
      handlers: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'url':
          webhookNode.url = value as string;
          break;
        case 'events':
          webhookNode.events = value as string[];
          break;
        case 'security':
          webhookNode.security = value as WebhookSecurityConfig; 
          break;
        case 'retry':
          webhookNode.retry = value as RetryConfig;
          break;
        case 'handlers':
          webhookNode.handlers = value as Record<string, string>;
          break;
        default:
          this.error(`Unknown webhook property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return webhookNode;
  }
  private parseSaga(): SagaNode {
    const name = this.expect('IDENTIFIER').value;
    const sagaNode: SagaNode = {
      type: 'Saga',
      name,
      trigger: '',
      steps: [],
      timeout: undefined,
      retry: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'trigger':
          sagaNode.trigger = value as string;
          break;
        case 'steps':
          sagaNode.steps = this.parseArrayOfSagaSteps();
          break;
        case 'timeout':
          sagaNode.timeout = value as string;
          break;
        case 'retry':
          sagaNode.retry = value as string;
          break;
        default:
          this.error(`Unknown saga property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return sagaNode;
  }

  private parseArrayOfSagaSteps(): SagaStepNode[] {
    const steps: SagaStepNode[] = [];
    this.expectPunctuation('[');
    while (!this.checkPunctuation(']')) {
      steps.push(this.parseSagaStep());
      if (this.checkPunctuation(',')) this.advance();
    }
    this.expectPunctuation(']');
    return steps;
  }

  private parseBlueprint(): BlueprintNode {
    const name = this.expect('IDENTIFIER').value;
    const blueprintNode: BlueprintNode = {
      type: 'Blueprint',
      name,
      stack: { frontend: '', backend: '', database: '', cache: undefined, queue: undefined },
      architecture: { pattern: '', layers: [] },
      features: [],
      infrastructure: { hosting: '', ciCd: '', monitoring: '' }
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'stack':
          blueprintNode.stack = value as StackConfig;
          break;
        case 'architecture':
          blueprintNode.architecture = value as ArchitectureConfig;
          break;
        case 'features':
          blueprintNode.features = value as string[];
          break;
        case 'infrastructure':
          blueprintNode.infrastructure = value as InfrastructureConfig;
          break;
        default:
          this.error(`Unknown blueprint property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return blueprintNode;
  }
  private parseBusinessRule(): BusinessRuleNode {
    const name = this.expect('IDENTIFIER').value;
    const businessRuleNode: BusinessRuleNode = {
      type: 'BusinessRule',
      name,
      entity: '',
      condition: '',
      validate: undefined,
      onViolation: undefined,
      schedule: undefined,
      action: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'entity':
          businessRuleNode.entity = value as string;
          break;
        case 'condition':
          businessRuleNode.condition = value as string;
          break;
        case 'validate':
          businessRuleNode.validate = value as ValidateConfig; 
          break;
        case 'onViolation':
          businessRuleNode.onViolation = value as ViolationConfig;
          break;
        case 'schedule':
          businessRuleNode.schedule = value as string;
          break;
        case 'action':
          businessRuleNode.action = value as string;
          break;
        default:
          this.error(`Unknown business rule property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return businessRuleNode;
  }
  private parseWorkflow(): WorkflowNode {
    const name = this.expect('IDENTIFIER').value;
    const workflowNode: WorkflowNode = {
      type: 'Workflow',
      name,
      entity: '',
      states: [],
      transitions: [],
      guards: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'entity':
          workflowNode.entity = value as string;
          break;
        case 'states':
          workflowNode.states = value as string[];
          break;
        case 'transitions':
          workflowNode.transitions = value as WorkflowTransition[]; 
          break;
        case 'guards':
          workflowNode.guards = value as Record<string, string>;
          break;
        default:
          this.error(`Unknown workflow property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return workflowNode;
  }
  private parseHealthCheck(): HealthCheckNode {
    const name = this.expect('IDENTIFIER').value;
    const healthCheckNode: HealthCheckNode = {
      type: 'Health',
      name,
      endpoint: undefined,
      checks: [],
      interval: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'endpoint':
          healthCheckNode.endpoint = value as string;
          break;
        case 'checks':
          healthCheckNode.checks = value as HealthCheckItem[];
          break;
        case 'interval':
          healthCheckNode.interval = value as string;
          break;
        default:
          this.error(`Unknown health check property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return healthCheckNode;
  }
  private parseSecurityConfig(): SecurityConfig {
    const securityConfig: SecurityConfig = {
      authentication: undefined,
      authorization: undefined,
      rateLimiting: undefined,
      cors: undefined,
      jwt: undefined,
      passwordPolicy: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'authentication':
          securityConfig.authentication = value as AuthConfig;
          break;
        case 'authorization':
          securityConfig.authorization = value as AuthorizationConfig;
          break;
        case 'rateLimiting':
          securityConfig.rateLimiting = value as RateLimitSecurityConfig;
          break;
        case 'cors':
          securityConfig.cors = value as CORSConfig;
          break;
        case 'jwt':
          securityConfig.jwt = value as JWTConfig;
          break;
        case 'passwordPolicy':
          securityConfig.passwordPolicy = value as PasswordPolicyConfig;
          break;
        default:
          this.error(`Unknown security config property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return securityConfig;
  }
  private parseCICDSteps(): CICDStep[] {
    const steps: CICDStep[] = [];
    this.expectPunctuation('[');

    while (!this.checkPunctuation(']') && !this.isAtEnd()) {
      const step: CICDStep = {
        name: '',
        run: '',
        uses: undefined,
        with: undefined,
        env: undefined,
        if: undefined
      };

      this.expectPunctuation('{');

      while (!this.checkPunctuation('}') && !this.isAtEnd()) {
        const key = this.expect('IDENTIFIER').value;
        this.expectPunctuation(':');
        const value = this.parseValue();
        switch (key) {
          case 'name':
            step.name = value as string;
            break;
          case 'run':
            step.run = value as string;
            break;
          case 'uses':
            step.uses = value as string;
            break;
          case 'with':
            step.with = value as Record<string, string>;
            break;
          case 'env':
            step.env = value as Record<string, string>;
            break;
          case 'if':
            step.if = value as string;
            break;
          default:
            this.error(`Unknown CICD step property: ${key}`);
        }
        if (this.checkPunctuation(',')) {
          this.advance();
        }
      }

      this.expectPunctuation('}');
      steps.push(step);

      if (this.checkPunctuation(',')) this.advance();
    }

    this.expectPunctuation(']');
    return steps;
  }
  private parseDeploy(): DeployNode {
    const target = this.expect('IDENTIFIER').value;
    const deployNode: DeployNode = {
      type: 'Deploy',
      target: target as 'AWS' | 'GCP' | 'Azure' | 'Vercel' | 'Docker' | 'Kubernetes',
      region: undefined,
      services: undefined,
      cicd: undefined,
      environment: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'region':
          deployNode.region = value as string;
          break;
        case 'services':
          deployNode.services = value as string[];
          break;
        case 'cicd':
          deployNode.cicd = value as string;
          break;
        case 'environment':
          deployNode.environment = value as string;
          break;
        default:
          this.error(`Unknown deploy property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return deployNode;
  }
  private parseMicroservice(): MicroserviceNode {
    const name = this.expect('IDENTIFIER').value;
    
    const microservice: MicroserviceNode = {
      type: 'Microservice',
      name,
      port: 3000,
      domain: 'localhost',
      dependencies: [],
      api: {
        type: 'API',
        apiType: 'REST',
        version: 'v1',
        basePath: '/',
        endpoints: []
      },
      database: undefined,
      eventBus: undefined,
      monitoring: undefined,
      security: undefined
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');

      switch (key) {
        case 'port':
          microservice.port = Number(this.expect('NUMBER').value);
          break;

        case 'domain':
          microservice.domain = this.expect('STRING').value;
          break;

        case 'dependencies':
          microservice.dependencies = this.parseArrayOfStrings();
          break;

        case 'api':
          microservice.api = this.parseAPI();
          break;

        case 'database':
          microservice.database = this.parseDatabase();
          break;

        case 'eventBus':
          microservice.eventBus = this.parseEventBus();
          break;

        case 'monitoring':
          microservice.monitoring = this.parseMonitoring();
          break;

        case 'security':
          microservice.security = this.parseSecurity();
          break;

        default:
          this.error(`Propriété inconnue dans Microservice : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return microservice;
  }
  private parseProperty(): PropertyNode {
    const name = this.expect('IDENTIFIER').value;
    this.expectPunctuation(':');
    const value = this.parseValue();
    const propertyNode: PropertyNode = {
      type: 'Property',
      name,
      value,
      dataType: this.inferDataTypeFromValue(value),
      decorators: [],
    };

    while (this.check('DECORATOR')) {
      const dec = this.parseDecorator();
      if (dec) {
        propertyNode.decorators?.push(dec as Decorator);
      }
    }

    return propertyNode;
  }
  private parseBlock(): BlockNode {
    const name = this.expect('IDENTIFIER').value;
    const blockNode: BlockNode = {
      type: 'Block',
      name,
      blockId: name,
      position: undefined,
      connections: [],
      collapsed: false,
      locked: false,
      metadata: {},
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'position':
          blockNode.position = value as { x: number; y: number };
          break;
        case 'connections':
          blockNode.connections = value as Array<{ sourceId: string; targetId: string; type: 'reference' | 'dependency' | 'relation' | 'import'; label?: string }>;
          break;
        case 'collapsed':
          blockNode.collapsed = value as boolean;
          break;
        case 'locked':
          blockNode.locked = value as boolean;
          break;
        case 'metadata':
          blockNode.metadata = value as Record<string, any>;
          break;
        default:
          this.error(`Unknown block property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return blockNode;
  }
  private parseSecurity(): SecurityNode {
    const name = this.expect('IDENTIFIER').value;
    const securityNode: SecurityNode = {
      type: 'Security',
      name,
      auth: undefined,
      encryption: undefined,
      roles: [],
      policies: {},
      rateLimit: undefined,
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'auth':
          securityNode.auth = value as 'JWT' | 'OAuth2' | 'Basic' | 'API_KEY' | string;
          break;
        case 'encryption':
          securityNode.encryption = value as 'AES-256' | 'RSA' | string;
          break;
        case 'roles':
          securityNode.roles = value as string[];
          break;
        case 'policies':
          securityNode.policies = value as Record<string, any>;
          break;
        case 'rateLimit':
          securityNode.rateLimit = value as { limit: number; window: string };
          break;
        default:
          this.error(`Unknown security property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return securityNode;
  }
  private parseTestSuite(): TestSuiteNode {
    const name = this.expect('IDENTIFIER').value;
    const testSuiteNode: TestSuiteNode = {
      type: 'TestSuite',
      name,
      tests: [],
      setup: undefined,
      teardown: undefined,
      timeout: undefined,
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();
      switch (key) {
        case 'tests':
          testSuiteNode.tests = value as string[];
          break;
        case 'setup':
          testSuiteNode.setup = value as string;
          break;
        case 'teardown':
          testSuiteNode.teardown = value as string;
          break;
        case 'timeout':
          testSuiteNode.timeout = value as number | string;
          break;
        default:
          this.error(`Unknown test suite property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return testSuiteNode;
  }

  private parseDecorator(): ASTNode | null {
    const decorator = this.advance();
    const decoratorName = decorator.value.substring(1); // Remove @
    switch (decoratorName) {
            case 'Program':
        return this.parseProgramNode(); // New parser function; define below
      case 'Directive':
        return this.parseDirectivesBlock();
      case 'DirectivesAvancees':
        return this.parseDirectivesAvancees();
      case 'Import':
        return this.parseImport();
      case 'Macro':
        return this.parseMacro();
      case 'Integration':
        return this.parseIntegration();
      case 'TestGen':
        return this.parseTestGen();
      case 'TestSuite':
        return this.parseTestSuite();
      case 'Security':
        return this.parseSecurity();
      case 'ApiGen':
        return this.parseApiGen();
      case 'Block':
        return this.parseBlock();
      case 'Property':
        return this.parseProperty();
      case 'Array':
        return this.parseArrayNode();
      case 'Object':
        return this.parseObjectNode();
      case 'Literal':
        return this.parseLiteral();
      case 'Reference':
        return this.parseReference();
      case 'Plugin':
        return this.parsePlugin();
      case 'IndexStrategy':
        return this.parseIndexStrategy();
      case 'ComponentLibrary':
        return this.parseComponentLibrary();
      case 'Layout':
        return this.parseLayout();
      case 'Search':
        return this.parseSearch();
      case 'RealTime':
        return this.parseRealTime();
      case 'Database':
        return this.parseDatabase();
      case 'Index':
        return this.parseIndexNode();
      case 'Module':
        return this.parseModuleBlock();
      case 'Enums':
        return this.parseEnumsBlock();
      case 'definitions':
        return this.parseDefinitionsBlock();
      case 'DataEnumeration':
        return this.parseEnumDeclaration();
      case 'DataJson':
        return this.parseDataJson();
      case 'DataModel':
        return this.parseModel();
      case 'Macro':
        return this.parseMacro();
      case 'AutoGen':
        return this.parseAutoGen();
      case 'ApiGen':
        return this.parseApiGen();
      case 'Deploy':
        return this.parseDeploy();
      case 'TestGen':
      case 'TestSuite':
        return this.parseTestGen();
      case 'Component':
      case 'ComponentLibrary':
        return this.parseComponent();
      case 'Page':
      case 'Pages':
        return this.parsePage();
      case 'Microservice':
        return this.parseMicroservice();
      case 'Integration':
        return this.parseIntegration();
      case 'Webhook':
        return this.parseWebhook();
      case 'Saga':
        return this.parseSaga();
      case 'Blueprint':
        return this.parseBlueprint();
      case 'Template':
        return this.parseTemplate();
      case 'BusinessRule':
      case 'Rule':
        return this.parseBusinessRule();
      case 'Workflow':
        return this.parseWorkflow();
      case 'Cache':
        return this.parseCache();
      case 'Health':
      case 'HealthCheck':
        return this.parseHealthCheck();
      case 'EventSourcing':
      case 'CQRS':
        return this.parseEventSourcing();
      case 'IndexStrategy':
        return this.parseIndexStrategy();
      case 'GenTest':
        return this.parseGenTest();
      case 'CRUDGen':
        return this.parseCRUDGen();
      case 'UIGen':
        return this.parseUIGen();
      case 'ComponentGen':
        return this.parseComponentGen();
      case 'RelationPathGen':
        return this.parseRelationPathGen();
      case 'MockDataGen':
        return this.parseMockDataGen();
      case 'DocGen':
        return this.parseDocGen();
      case 'PerfOptGen':
        return this.parsePerfOptGen();
      case 'SecScanGen':
        return this.parseSecScanGen();
      case 'MigrationGen':
        return this.parseMigrationGen();
      case 'GraphQLGen':
        return this.parseGraphQLGen();
      case 'RESTGen':
        return this.parseRESTGen();
      case 'WebSocketGen':
        return this.parseWebSocketGen();
      case 'CICDGen':
        return this.parseCICDGen();
      default:
        return this.parseGenericBlock(decoratorName);
    }
  }

  private parseDirectivesBlock(): DirectiveNode {
    const directive: DirectiveNode = {
      type: 'Directive',
      name: 'DirectivesAvancees',
      config: {},
      children: [],
      orchestration: {
        sequence: [],
        dependencies: {},
        parallelJobs: false,
      },
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const child = this.parseTopLevel();
      if (child) {
        directive.children.push(child);
        if (['AutoGen', 'ApiGen', 'TestGen', 'Deploy', 'GenTest', 'CRUDGen', 'CICDGen'].includes(child.type)) {
          directive.orchestration.sequence.push(child.type);
          if (child.type === 'Deploy') {
            directive.orchestration.dependencies['Deploy'] = ['TestGen'];
          }
        }
      }
    }

    this.expectPunctuation('}');

    return directive;
  }

  private parseModuleBlock(): ModuleNode {
    const name = this.expect('IDENTIFIER').value;

    const module: ModuleNode = {
      type: 'Module',
      name,
      enums: [],
      dataJsons: [],
      models: [],
      children: [],
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const child = this.parseTopLevel();
      if (child) {
        if (child.type === 'Enum') {
          module.enums.push(child as EnumNode);
        } else if (child.type === 'DataJson') {
          module.dataJsons.push(child as DataJsonNode);
        } else if (child.type === 'Model') {
          module.models.push(child as ModelNode);
        } else {
          module.children.push(child);
        }
      }
    }

    this.expectPunctuation('}');

    return module;
  }

  private parseEnumsBlock(): ASTNode {
    const block: ASTNode = {
      type: 'Block',
      name: 'Enums',
      children: [],
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      if (this.check('DECORATOR') && this.peek().value === '@DataEnumeration') {
        const enumNode = this.parseEnumDeclaration();
        block.children.push(enumNode);
      } else {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return block;
  }

  private parseDefinitionsBlock(): ASTNode {
    const block: ASTNode = {
      type: 'Block',
      name: 'definitions',
      children: [],
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const child = this.parseTopLevel();
      if (child) block.children.push(child);
    }

    this.expectPunctuation('}');

    return block;
  }

  private parseEnumDeclaration(): EnumNode {
    const name = this.expect('IDENTIFIER').value;

    this.expectPunctuation('{');

    const values: EnumValue[] = [];
    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      if (this.check('IDENTIFIER')) {
        const valName = this.advance().value;
        values.push({ name: valName });
      } else {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return {
      type: 'Enum',
      name,
      values,
    };
  }

  private parseDataJson(): DataJsonNode {
    const name = this.expect('IDENTIFIER').value;

    const dataJson: DataJsonNode = {
      type: 'DataJson',
      name,
      fields: [],
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const field = this.parseField();
      if (field) dataJson.fields.push(field);
    }

    this.expectPunctuation('}');

    return dataJson;
  }

  private parseDataType(typeStr: string): DataType {
    if (typeStr.endsWith('[]')) {
      return { type: 'Array', elementType: this.parseDataType(typeStr.slice(0, -2)) };
    }
    if (KEYWORDS.has(typeStr) && typeStr.endsWith('Type')) {
      return { type: 'Enum', name: typeStr };
    }
    return typeStr as DataType;
  }

  private parseLiteral(): any {
    if (this.check('STRING')) return this.advance().value;
    if (this.check('NUMBER')) return parseFloat(this.advance().value);
    if (this.check('BOOLEAN')) return this.advance().value === 'true';
    if (this.checkPunctuation('[')) {
      const arr = [];
      this.advance();
      while (!this.checkPunctuation(']')) {
        arr.push(this.parseLiteral());
        if (this.checkPunctuation(',')) this.advance();
      }
      this.expectPunctuation(']');
      return arr;
    }
    if (this.checkPunctuation('{')) {
      const obj: Record<string, any> = {};
      this.advance();
      while (!this.checkPunctuation('}')) {
        const key = this.expect('IDENTIFIER').value;
        this.expectPunctuation(':');
        obj[key] = this.parseLiteral();
        if (this.checkPunctuation(',')) this.advance();
      }
      this.expectPunctuation('}');
      return obj;
    }
    return this.advance().value;
  }

  private parseModels(): string[] {
    // Logique pour analyser et retourner les modèles
    return ['User', 'Product']; // Exemple de modèles
  }

  private parseOptions(): AutoGenOptions {
    // Logique pour analyser et retourner les options
    return {
      migrations: true,
      seeding: false,
      relations: 'bidirectional',
      softDelete: true,
      timestamps: true,
      versioning: true,
      components: true,
      pages: true,
      hooks: true,
      layouts: true,
      utils: true,
      queryOptimization: {
      },
      autoIndexing: {
      }
    };
  }

  private parseApiGen(): ASTNode {
    const config = this.parseProperties();
    return { type: 'ApiGen', properties: config };
  }

  private parseTarget(): 'AWS' | 'GCP' | 'Azure' | 'Vercel' | 'Docker' | 'Kubernetes' {

    return 'Docker'; // Exemple de cible
  }

  private parseRegion(): string | undefined {
    // Logique pour analyser et retourner la région si nécessaire
    return 'us-east-1'; // Exemple de région
  }

  private parseServices(): string[] | undefined {
    // Logique pour analyser et retourner les services si nécessaires
    return ['EC2', 'S3']; // Exemple de services
  }

  private parseCICD(): string | undefined {
    // Logique pour analyser et retourner le système CICD si nécessaire
    return 'Jenkins'; // Exemple de système CICD
  }

  private parseEnvironment(): string | undefined {
    // Logique pour analyser et retourner l'environnement si nécessaire
    return 'production'; // Exemple d'environnement
  }

  private parseTestGen(): TestNode {
    // Analysez les propriétés selon votre logique (par exemple, à partir d'un fichier de configuration)
    const name: string | undefined = this.parseName();
    const coverage: number | undefined = this.parseCoverage();
    const types: ('UNIT' | 'INTEGRATION' | 'E2E' | 'PERFORMANCE')[] = this.parseTypes();
    const framework: string | undefined = this.parseFramework();
    const scenarios: string[] | undefined = this.parseScenarios();

    return {
      type: 'TestGen',
      name,
      coverage,
      types,
      framework,
      scenarios
    };
  }

  private parseName(): string | undefined {
    // Logique pour analyser et retourner le nom du test si nécessaire
    return 'UnitTests'; // Exemple de nom
  }

  private parseCoverage(): number | undefined {
    // Logique pour analyser et retourner la couverture si nécessaire
    return 90; // Exemple de couverture
  }

  private parseTypes(): ('UNIT' | 'INTEGRATION' | 'E2E' | 'PERFORMANCE')[] {
    // Logique pour analyser et retourner les types de tests si nécessaires
    return ['UNIT', 'INTEGRATION']; // Exemple de types
  }

  private parseFramework(): string | undefined {
    // Logique pour analyser et retourner le framework si nécessaire
    return 'Jest'; // Exemple de framework
  }

  private parseScenarios(): string[] | undefined {
    // Logique pour analyser et retourner les scénarios si nécessaires
    return ['Scenario1', 'Scenario2']; // Exemple de scénarios
  }

  private isLiteral(type: TokenType): boolean {
    return this.check(type);
  }

  private parseSEO(): SEOConfig {
    const seo: Partial<SEOConfig> = {};

    while (!this.checkPunctuation(',')) {
      const key = this.expect('IDENTIFIER').value;
      switch (key) {
        case 'title':
          if (this.isLiteral('STRING')) {
            seo.title = this.advance().value;
          }
          break;
        case 'description':
          if (this.isLiteral('STRING')) {
            seo.description = this.advance().value;
          }
          break;
        case 'keywords':
          seo.keywords = this.parseStringArray();
          break;
        case 'ogImage':
          if (this.isLiteral('STRING')) {
            seo.ogImage = this.advance().value;
          }
          break;
        default:
          throw new SyntaxError(`Unexpected property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      } else if (!this.checkPunctuation('}')) {
        throw new SyntaxError(`Expected comma or closing brace, got unexpected token`);
      }
    }

    return seo as SEOConfig;
  }

  private parsePerformance(): PerformanceConfig {
    const performance: Partial<PerformanceConfig> = {};

    while (!this.checkPunctuation(',')) {
      const key = this.expect('IDENTIFIER').value;
      switch (key) {
        case 'priority':
          if (this.isLiteral('STRING')) {
            performance.priority = this.advance().value as 'HIGH' | 'MEDIUM' | 'LOW';
          }
          break;
        case 'preload':
          performance.preload = this.parseStringArray();
          break;
        case 'prefetch':
          performance.prefetch = this.parseStringArray();
          break;
        default:
          throw new SyntaxError(`Unexpected property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      } else if (!this.checkPunctuation('}')) {
        throw new SyntaxError(`Expected comma or closing brace, got unexpected token`);
      }
    }

    return performance as PerformanceConfig;
  }

  private parseDataFetching(): DataFetchingConfig {
    const dataFetching: Partial<DataFetchingConfig> = { method: 'static', sources: [] };

    while (!this.checkPunctuation(',')) {
      const key = this.expect('IDENTIFIER').value;
      switch (key) {
        case 'method':
          if (this.isLiteral('STRING')) {
            dataFetching.method = this.advance().value as 'server_component' | 'client' | 'static';
          }
          break;
        case 'sources':
          const sources: DataFetchingSource[] = [];
          while (!this.checkPunctuation(',')) {
            sources.push(this.parseDataFetchingSource());
          }
          dataFetching.sources = sources;
          break;
        default:
          throw new SyntaxError(`Unexpected property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      } else if (!this.checkPunctuation('}')) {
        throw new SyntaxError(`Expected comma or closing brace, got unexpected token`);
      }
    }

    return dataFetching as DataFetchingConfig;
  }

  private parseDataFetchingSource(): DataFetchingSource {
    const source: Partial<DataFetchingSource> = { key: '', endpoint: '' };

    while (!this.checkPunctuation(',')) {
      const key = this.expect('IDENTIFIER').value;
      switch (key) {
        case 'key':
          if (this.isLiteral('STRING')) {
            source.key = this.advance().value;
          }
          break;
        case 'endpoint':
          if (this.isLiteral('STRING')) {
            source.endpoint = this.advance().value;
          }
          break;
        case 'cache':
          if (this.isLiteral('STRING')) {
            source.cache = this.advance().value;
          }
          break;
        case 'realtime':
          source.realtime = this.expect('BOOLEAN').value === 'true';
          break;
        default:
          throw new SyntaxError(`Unexpected property: ${key}`);
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      } else if (!this.checkPunctuation('}')) {
        throw new SyntaxError(`Expected comma or closing brace, got unexpected token`);
      }
    }

    return source as DataFetchingSource;
  }

  private parseProps(): Record<string, any> {
    const props: Record<string, any> = {};

    while (!this.checkPunctuation(',')) {
      const key = this.expect('IDENTIFIER').value;
      if (this.checkPunctuation(':')) {
        this.advance();
        const value = this.parseValue();
        props[key] = value;
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      } else if (!this.checkPunctuation('}')) {
        throw new SyntaxError(`Expected comma or closing brace, got unexpected token`);
      }
    }

    return props;
  }

  private parseString(): Token {
    const token = this.expect('STRING');
    if (token.value[0] !== '"' || token.value[token.value.length - 1] !== '"') {
      throw new SyntaxError('Expected a string literal enclosed in double quotes');
    }
    return { ...token, value: token.value.slice(1, -1) };
  }

  private parseStringArray(): string[] {
    const array: string[] = [];

    if (this.checkPunctuation('[')) {
      this.advance();
      while (!this.checkPunctuation(']')) {
        array.push(this.parseString().value);
        if (this.checkPunctuation(',')) {
          this.advance();
        }
      }
      this.expectPunctuation(']');
    }

    return array;
  }

  private parseAPIType(): 'REST' | 'GraphQL' | 'gRPC' {
    const value = this.expect('KEYWORD').value;
    if (['REST', 'GraphQL', 'gRPC'].includes(value)) {
      return value as 'REST' | 'GraphQL' | 'gRPC';
    } else {
      throw new Error(`Unexpected API type: ${value}`);
    }
  }

  private parseEndpoints(): EndpointNode[] {
    this.expectPunctuation('[');
    const endpoints: EndpointNode[] = [];

    while (!this.checkPunctuation(']')) {
      if (endpoints.length > 0) {
        this.expectPunctuation(',');
      }
      endpoints.push(this.parseEndpoint());
    }

    this.expectPunctuation(']');
    return endpoints;
  }


  private parseSchemaDefinition(): SchemaDefinition {
    const type = this.expect('KEYWORD').value;

    if (type === 'schema') {
      this.expectPunctuation('{');

      const schema: SchemaDefinition = {
        type,
        properties: undefined,
        required: []
      };

      while (!this.checkPunctuation('}')) {
        const key = this.expect('KEYWORD').value;

        switch (key) {
          case 'properties':
            schema.properties = this.parseProperties();
            break;
          case 'required':
            schema.required = this.parseArray();
            break;
          default:
            throw new Error(`Unexpected key: ${key}`);
        }

        if (this.checkPunctuation(',')) {
          this.expectPunctuation(',');
        } else {
          break;
        }
      }

      this.expectPunctuation('}');
      return schema;
    } else {
      throw new Error(`Unexpected schema type: ${type}`);
    }
  }

  private parseTemplate(): TemplateNode {
    const name = this.expect('IDENTIFIER').value;
    const template: TemplateNode = { type: 'Template', name, params: [], structure: {}, generate: {} };
    // Parsing params
    return template;
  }

  private parseGenTest(): GenTestNode {
    const target = this.expect('IDENTIFIER').value;
    const genTest: GenTestNode = { type: 'GenTest', target, framework: 'Jest', coverage: 80, types: ['UNIT'] };
    this.expectPunctuation('{');
    genTest.properties = this.parseProperties();
    this.expectPunctuation('}');
    return genTest;
  }

  private parseCRUDGen(): CRUDGenNode {
    const forTarget = this.expect('KEYWORD').value === 'for' ? this.expect('IDENTIFIER').value : '';
    const crudGen: CRUDGenNode = { type: 'CRUDGen', for: forTarget, operations: ['CREATE', 'READ', 'UPDATE', 'DELETE'], role: '' };
    crudGen.properties = this.parseProperties();
    return crudGen;
  }

  private parseUIGen(): UIGenNode {
    const forTarget = this.expect('KEYWORD').value === 'for' ? this.expect('IDENTIFIER').value : '';
    const uiGen: UIGenNode = { type: 'UIGen', for: forTarget, framework: 'React', options: { forms: true, dashboards: true } };
    uiGen.properties = this.parseProperties();
    return uiGen;
  }

  private parseComponentGen(): ComponentGenNode {
    const name = this.expect('IDENTIFIER').value;
    const componentGen: ComponentGenNode = { type: 'ComponentGen', name, props: [], variants: [] };
    this.expectPunctuation('{');
    while (!this.checkPunctuation('}')) {
      // Parse props, variants
      this.advance();
    }
    this.expectPunctuation('}');
    return componentGen;
  }

  private parseRelationPathGen(): RelationPathGenNode {
    const from = this.expect('IDENTIFIER').value;
    const relationPathGen: RelationPathGenNode = { type: 'RelationPathGen', from, maxDepth: 3, output: 'JSON' };
    relationPathGen.properties = this.parseProperties();
    return relationPathGen;
  }

  private parseMockDataGen(): MockDataGenNode {
    const forTarget = this.expect('IDENTIFIER').value;
    const mockDataGen: MockDataGenNode = { type: 'MockDataGen', for: forTarget, count: 100, format: 'JSON' };
    mockDataGen.properties = this.parseProperties();
    return mockDataGen;
  }

  private parseDocGen(): DocGenNode {
    const strategy = this.expect('IDENTIFIER').value  as 'Swagger' | 'JSDoc'; 
    const docGen: DocGenNode = { type: 'DocGen', strategy, output: 'docs.md' };
    docGen.properties = this.parseProperties();
    return docGen;
  }

  private parsePerfOptGen(): PerfOptGenNode {
    const strategy = this.expect('IDENTIFIER').value as 'Caching' | 'Indexing'; 
    const perfOptGen: PerfOptGenNode = { type: 'PerfOptGen', strategy, ttl: '5m' };
    perfOptGen.properties = this.parseProperties();
    return perfOptGen;
  }

  private parseSecScanGen(): SecScanGenNode {
    const secScanGen: SecScanGenNode = { type: 'SecScanGen', tools: ['OWASP ZAP'] };
    secScanGen.properties = this.parseProperties();
    return secScanGen;
  }

  private parseMigrationGen(): MigrationGenNode {
    const from = this.expect('IDENTIFIER').value;
    const to = this.expect('IDENTIFIER').value;
    const migrationGen: MigrationGenNode = { type: 'MigrationGen', from, to };
    migrationGen.properties = this.parseProperties();
    return migrationGen;
  }

  private parseGraphQLGen(): GraphQLGenNode {
    const schema = this.expect('STRING').value;
    const graphQLGen: GraphQLGenNode = { type: 'GraphQLGen', schema };
    graphQLGen.properties = this.parseProperties();
    return graphQLGen;
  }

  private parseRESTGen(): RESTGenNode {
    const restGen: RESTGenNode = { type: 'RESTGen', endpoints: [] };
    this.expectPunctuation('{');
    while (!this.checkPunctuation('}')) {
      restGen.endpoints.push(this.parseEndpoint());
    }
    this.expectPunctuation('}');
    return restGen;
  }

  private parseWebSocketGen(): WebSocketGenNode {
    const webSocketGen: WebSocketGenNode = { type: 'WebSocketGen', events: [] };
    this.expectPunctuation('{');
    while (!this.checkPunctuation('}')) {
      if (this.check('IDENTIFIER')) webSocketGen.events.push(this.advance().value);
      else this.advance();
    }
    this.expectPunctuation('}');
    return webSocketGen;
  }

  private parseProjection(): ProjectionNode {
    const name = this.expect('IDENTIFIER').value;
    
    const projectionNode: ProjectionNode = {
      type: 'Projection',
      name,
      source: '',
      fields: [],
      handler: ''
    };

    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      const value = this.parseValue();

      switch (key) {
        case 'source':
          projectionNode.source = value as string;
          break;
        case 'fields':
          projectionNode.fields = value as string[];
          break;
        case 'handler':
          projectionNode.handler = value as string;
          break;
        default:
          this.error(`Propriété inconnue dans Projection : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');

    return projectionNode;
  }

  private parseGenericBlock(name: string): ASTNode {
    const block: ASTNode = { type: 'Block', name, children: [] };
    this.expectPunctuation('{');
    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const child = this.parseTopLevel();
      if (child) block.children?.push(child);
    }
    this.expectPunctuation('}');
    return block;
  }

  private parseProperties(): Record<string, any> {
    const props: Record<string, any> = {};
    while (this.check('IDENTIFIER')) {
      const key = this.advance().value;
      this.expectPunctuation(':');
      props[key] = this.parseLiteral();
    }
    return props;
  }

  private parseModel(): ModelNode {
    const name = this.expect('IDENTIFIER').value;
    const model: ModelNode = { type: 'Model', name, fields: [], relations: [], indexes: [], constraints: [], documentation: { description: '' } };
    this.expectPunctuation('{');
    while (!this.checkPunctuation('}')) {
      if (this.check('IDENTIFIER')) {
        const field = this.parseField();
        if (field) model.fields.push(field);
      } else if (this.check('KEYWORD') && this.peek().value === 'Relation') {
        model.relations.push(this.parseRelation());
      } else {
        this.advance();
      }
    }
    this.expectPunctuation('}');
    return model;
  }

  private addNodeToProgram(program: ProgramNode, node: ASTNode): void {
    switch (node.type) {
      case 'Import':
        program.imports.push(node as ImportNode);
        break;
      case 'Module':
        program.modules.push(node as ModuleNode);
        break;
      case 'Directive':
        program.directives.push(node as DirectiveNode);
        break;
      case 'Enum':
        program.enums.push(node as EnumNode);
        break;
      case 'DataJson':
        program.dataJsons.push(node as DataJsonNode);
        break;
      case 'Model':
        program.models.push(node as ModelNode);
        break;
      case 'Component':
        program.components.push(node as ComponentNode);
        break;
      case 'Page':
        program.pages.push(node as PageNode);
        break;
      case 'Microservice':
        program.microservices.push(node as MicroserviceNode);
        break;
      case 'AutoGen':
        console.log(node);
        program.autoGens.push(node as AutoGenNode);
        break;
      case 'Deploy':
        program.deploys.push(node as DeployNode);
        break;
      case 'Test':
        program.tests.push(node as TestNode);
        break;
      case 'Integration':
        program.integrations.push(node as IntegrationNode);
        break;
      case 'Webhook':
        program.webhooks.push(node as WebhookNode);
        break;
      case 'Saga':
        program.sagas.push(node as SagaNode);
        break;
      case 'Blueprint':
        program.blueprints.push(node as BlueprintNode);
        break;
      case 'Template':
        program.templates.push(node as TemplateNode);
        break;
      case 'BusinessRule':
        program.businessRules.push(node as BusinessRuleNode);
        break;
      case 'Workflow':
        program.workflows.push(node as WorkflowNode);
        break;
      case 'Cache':
        program.caches.push(node as CacheNode);
        break;
      case 'Health':
        program.healthChecks.push(node as HealthCheckNode);
        break;
      // Ajouts pour nouvelles directives
      case 'GenTest':
        program.genTests.push(node as GenTestNode);
        break;
      case 'CRUDGen':
        program.crudGens.push(node as CRUDGenNode);
        break;
      case 'UIGen':
        program.uiGens.push(node as UIGenNode);
        break;
      case 'ComponentGen':
        program.componentGens.push(node as ComponentGenNode);
        break;
      case 'RelationPathGen':
        program.relationPathGens.push(node as RelationPathGenNode);
        break;
      case 'MockDataGen':
        program.mockDataGens.push(node as MockDataGenNode);
        break;
      case 'DocGen':
        program.docGens.push(node as DocGenNode);
        break;
      case 'PerfOptGen':
        program.perfOptGens.push(node as PerfOptGenNode);
        break;
      case 'SecScanGen':
        program.secScanGens.push(node as SecScanGenNode);
        break;
      case 'MigrationGen':
        program.migrationGens.push(node as MigrationGenNode);
        break;
      case 'GraphQLGen':
        program.graphQLGens.push(node as GraphQLGenNode);
        break;
      case 'RESTGen':
        program.restGens.push(node as RESTGenNode);
        break;
      case 'WebSocketGen':
        program.webSocketGens.push(node as WebSocketGenNode);
        break;
      // Nouvel ajout pour CI/CD
      case 'CICDGen':
        program.cicdGens.push(node as CICDGenNode);
        break;
      case 'Block':
        // Handle nested content in blocks
        if (node.children) {
          node.children.forEach(child => this.addNodeToProgram(program, child));
        }
        break;
    }
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private checkPunctuation(value: string): boolean {
    return this.check('PUNCTUATION') && this.peek().value === value;
  }

  private checkPunctuationAt(offset: number, value: string): boolean {
    const idx = this.current + offset;
    if (idx >= this.tokens.length) return false;
    return this.tokens[idx].type === 'PUNCTUATION' && this.tokens[idx].value === value;
  }

  private checkOperator(value: string): boolean {
    return this.check('OPERATOR') && this.peek().value === value;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    if(this.tokens[this.current - 1].type == 'IDENTIFIER' && this.last_key != ""){
      this.keys[this.last_key] = this.tokens[this.current - 1].value;
      this.last_key = "";
    }
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }
  private expect(type: TokenType): Token {
    if (this.check(type)) return this.advance();

    // Don't throw error, just skip
    return this.peek();
  }

  private expectPunctuation(value: string): Token {
    if (this.checkPunctuation(value)) return this.advance();
    
    // Don't throw error, just skip
    return this.peek();
  }

  private error(message: string): void {
    const token = this.peek();
    this.errors.push({
      message,
      location: {
        start: { line: token.line, column: token.column },
        end: { line: token.line, column: token.column + token.length },
      },
      code: 'PARSE_ERROR',
      severity: 'error',
    });
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().value === '}') return;
      if (this.check('DECORATOR')) return;
      if (this.check('KEYWORD')) {
        const keyword = this.peek().value;
        if (['Module', 'Component', 'Page', 'CICDGen'].includes(keyword)) return; // Ajout CICDGen
      }
      this.advance();
    }
  }

  private calculateStatistics(
    program: ProgramNode, 
    source: string, 
    parseTime: number
  ): ParseStatistics {
    return {
      totalLines: source.split('\n').length,
      totalTokens: this.tokens.length,
      modules: program.modules.length,
      enums: program.enums.length,
      dataJsons: program.dataJsons.length,
      models: program.models.length,
      components: program.components.length,
      pages: program.pages.length,
      microservices: program.microservices.length,
      imports: program.imports.length,
      autoGens: program.autoGens.length,
      deploys: program.deploys.length,
      tests: program.tests.length,
      integrations: program.integrations.length,
      sagas: program.sagas.length,
      businessRules: program.businessRules.length,
      parseTime,
    };
  }

  private resolveDataType(typeName: string): DataType {
    const primitives = ['String', 'Int', 'Float', 'Decimal', 'Boolean', 'DateTime', 'Json', 'Bytes'];
    
    if (primitives.includes(typeName)) {
      return typeName as DataType;
    }

    // Check if it's an enum reference
    if (typeName.endsWith('Type') || typeName.endsWith('Status') || typeName.endsWith('Code') || 
        typeName.endsWith('Level') || typeName.endsWith('Category')) {
      return { type: 'Enum', name: typeName };
    }

    // Reference to another model
    return { type: 'Reference', model: typeName };
  }

  private parseValue(): any {
    if (this.check('STRING')) {
      return this.advance().value;
    }
    if (this.check('NUMBER')) {
      const num = this.advance().value;
      // Handle percentages and units
      if (num.includes('%')) {
        return num;
      }
      if (num.match(/[a-zA-Z]/)) {
        return num; // Return with unit
      }
      return num.includes('.') ? parseFloat(num) : parseInt(num);
    }
    if (this.check('BOOLEAN')) {
      return this.advance().value === 'true';
    }
    if (this.check('IDENTIFIER') || this.check('KEYWORD')) {
      return this.advance().value;
    }
    if (this.checkPunctuation('{')) {
      return this.parseObject();
    }
    if (this.checkPunctuation('[')) {
      return this.parseArray();
    }

    this.advance();
    return null;
  }

  private parseObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    this.expectPunctuation('{');

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      if (this.check('IDENTIFIER') || this.check('KEYWORD') || this.check('STRING')) {
        const key = this.advance().value;
        
        if (this.checkPunctuation(':')) {
          this.advance();
        }
        
        const value = this.parseValue();
        obj[key] = value;
        
        if (this.checkPunctuation(',')) {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expectPunctuation('}');
    return obj;
  }

  private parseArray(): any[] {
    const arr: any[] = [];
    this.expectPunctuation('[');

    while (!this.checkPunctuation(']') && !this.isAtEnd()) {
      const value = this.parseValue();
      if (value !== null) {
        arr.push(value);
      }
      
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation(']');
    return arr;
  }

  private skipUntilMatchingBrace(): void {
    if (!this.checkPunctuation('{')) return;

    let depth = 0;
    do {
      if (this.checkPunctuation('{')) depth++;
      if (this.checkPunctuation('}')) depth--;
      this.advance();
    } while (depth > 0 && !this.isAtEnd());
  }

  private parseArrayOfObjects(expectedKeys: string[]): any[] {
    const arr: any[] = [];
    this.expectPunctuation('[');
    while (!this.checkPunctuation(']')) {
      const obj: any = {};
      while (!this.checkPunctuation('}') && !this.checkPunctuation(']')) {
        const key = this.expect('IDENTIFIER').value;
        this.expectPunctuation(':');
        obj[key] = this.parseValue();
        if (this.checkPunctuation(',')) this.advance();
      }
      if (this.checkPunctuation('}')) this.advance();
      arr.push(obj);
      if (this.checkPunctuation(',')) this.advance();
    }
    this.expectPunctuation(']');
    return arr;
  }
  private parseArrayOfStrings(): string[] {
    const arr: string[] = [];
    this.expectPunctuation('[');
    while (!this.checkPunctuation(']') && !this.isAtEnd()) {
      if (this.check('STRING')) {
        arr.push(this.advance().value);
      } else if (this.check('IDENTIFIER')) {
        arr.push(this.advance().value);
      } else {
        this.error('Expected STRING or IDENTIFIER in array');
        this.advance();
      }
      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }
    this.expectPunctuation(']');
    return arr;
  }
  private parseGenerationDirective(directiveName: string): ASTNode | null {
    const node: any = { type: directiveName.replace('@', '') };

    switch (directiveName) {
      // @CRUDGen for:User operations:[create,read,update,delete] role:admin
      case '@CRUDGen':
        this.match('for');
        this.expectPunctuation(':');
        node.for = this.expect('IDENTIFIER').value;
        if (this.match('operations')) {
          this.expectPunctuation('[');
          node.operations = this.parseArrayOfStrings();
          this.expectPunctuation(']');
        }
        if (this.match('role')) node.role = this.expect('IDENTIFIER').value;
        break;

      // @UIGen for:User framework:react options:[forms,dashboards]
      case '@UIGen':
        this.match('for');
        this.expectPunctuation(':');
        node.for = this.expect('IDENTIFIER').value;
        if (this.match('framework')) node.framework = this.expect('IDENTIFIER').value;
        if (this.match('options')) {
          this.expectPunctuation('[');
          node.options = this.parseArrayOfStrings();
          this.expectPunctuation(']');
        }
        break;

      // @ComponentGen name:Button props:[label:string, onClick:function]
      case '@ComponentGen':
        this.match('name');
        this.expectPunctuation(':');
        node.name = this.expect('IDENTIFIER').value;
        if (this.match('props')) {
          this.expectPunctuation('[');
          node.props = this.parseArrayOfObjects(['name', 'type', 'required', 'defaultValue']);
          this.expectPunctuation(']');
        }
        break;

      // @RelationPathGen from:User maxDepth:4 output:json
      case '@RelationPathGen':
        this.match('from');
        this.expectPunctuation(':');
        node.from = this.expect('IDENTIFIER').value;
        if (this.match('maxDepth')) node.maxDepth = this.expect('NUMBER').value;
        if (this.match('output')) node.output = this.expect('IDENTIFIER').value;
        break;

      // @MockDataGen for:User count:50 format:json
      case '@MockDataGen':
        this.match('for');
        this.expectPunctuation(':');
        node.for = this.expect('IDENTIFIER').value;
        if (this.match('count')) node.count = this.expect('NUMBER').value;
        if (this.match('format')) node.format = this.expect('IDENTIFIER').value;
        break;

      // @DocGen strategy:swagger output:docs/api.md
      case '@DocGen':
        this.match('strategy');
        this.expectPunctuation(':');
        node.strategy = this.expect('IDENTIFIER').value;
        if (this.match('output')) node.output = this.expect('STRING').value;
        break;

      // @PerfOptGen strategy:caching ttl:60s
      case '@PerfOptGen':
        this.match('strategy');
        this.expectPunctuation(':');
        node.strategy = this.expect('IDENTIFIER').value;
        if (this.match('ttl')) node.ttl = this.expect('STRING').value;
        break;

      // @SecScanGen tools:[zap,snyk,eslint]
      case '@SecScanGen':
        if (this.match('tools')) {
          this.expectPunctuation('[');
          node.tools = this.parseArrayOfStrings();
          this.expectPunctuation(']');
        }
        break;

      // @MigrationGen from:v1 to:v2
      case '@MigrationGen':
        this.match('from');
        this.expectPunctuation(':');
        node.from = this.expect('IDENTIFIER').value;
        if (this.match('to')) node.to = this.expect('IDENTIFIER').value;
        break;

      // @GraphQLGen schema:"type Query { hello: String }"
      case '@GraphQLGen':
        if (this.match('schema')) node.schema = this.expect('STRING').value;
        break;

      // @RESTGen endpoints:[GET /users, POST /users]
      case '@RESTGen':
        if (this.match('endpoints')) {
          this.expectPunctuation('[');
          node.endpoints = this.parseArrayOfObjects(['method', 'path']);
          this.expectPunctuation(']');
        }
        break;

      // @WebSocketGen events:[connect, message, disconnect]
      case '@WebSocketGen':
        if (this.match('events')) {
          this.expectPunctuation('[');
          node.events = this.parseArrayOfStrings();
          this.expectPunctuation(']');
        }
        break;
      
      default:
        return null;
    }

    return node;
  }

  private parseCacheKeysConfig(): CacheKeysConfig {
    const config: CacheKeysConfig = { pattern: '', invalidation: [] };

    this.expectPunctuation('{');
    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      if (key === 'pattern') {
        config.pattern = this.expect('STRING').value;
      } else if (key === 'invalidation') {
        config.invalidation = this.parseArrayOfStrings();
      }
      if (this.checkPunctuation(',')) this.advance();
    }
    this.expectPunctuation('}');

    return config;
  }

  private parseCacheWarmingConfig(): CacheWarmingConfig {
    const config: CacheWarmingConfig = { on: '', data: '' };

    this.expectPunctuation('{');
    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');
      if (key === 'on') {
        config.on = this.expect('IDENTIFIER').value;
      } else if (key === 'data') {
        config.data = this.expect('IDENTIFIER').value;
      }
      if (this.checkPunctuation(',')) this.advance();
    }
    this.expectPunctuation('}');

    return config;
  }
  private match(value: string): boolean {
    if (this.check('IDENTIFIER') || this.check('KEYWORD')) {
      if (this.peek().value === value) {
        this.advance();
        return true;
      }
    }
    return false;
  }


  private parseCQRS(): CQRSNode {
    const name = this.expect('IDENTIFIER').value;
    this.expectPunctuation('{');  // Ajouté pour consommer {

    const node: CQRSNode = {
      type: 'CQRS',
      name,
      boundedContext: undefined,
      commands: [],
      queries: [],
      commandHandlers: undefined,
      queryHandlers: undefined,
      events: [],
      readModel: undefined,
      writeModel: undefined
    };

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');

      switch (key) {
        case 'boundedContext':
          node.boundedContext = this.expect('IDENTIFIER').value;
          break;
        case 'readModel':
        case 'writeModel':
          node[key] = this.expect('IDENTIFIER').value;
          break;
        case 'commands':
          this.expectPunctuation('[');
          // Utilise 'name' comme clé principale pour matcher Command
          node.commands = this.parseArrayOfObjects(['name', 'handler', 'aggregate']).map(obj => ({ name: obj.name, handler: obj.handler, aggregate: obj.aggregate }));
          this.expectPunctuation(']');
          break;
        case 'queries':
          this.expectPunctuation('[');
          node.queries = this.parseArrayOfObjects(['name', 'handler', 'viewModel']).map(obj => ({ name: obj.name, handler: obj.handler, viewModel: obj.viewModel }));
          this.expectPunctuation(']');
          break;
        case 'events':
          node.events = this.parseArrayOfStrings();
          break;
        default:
          this.error(`Propriété inconnue dans CQRS : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');
    return node;
  }

  private parseEventSourcing(): EventSourcingNode {
    const name = this.expect('IDENTIFIER').value;
    this.expectPunctuation('{');  // Ajouté

    const node: EventSourcingNode = {
      type: 'EventSourcing',
      name,
      aggregate: name,  // Uniformisé
      events: [],
      eventStore: undefined,
      snapshotStrategy: undefined,
      snapshotInterval: undefined,
      projectors: [],
      snapshots: undefined  // Ajouté pour matcher types
    };

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');

      switch (key) {
        case 'aggregate':
          node.aggregate = this.expect('IDENTIFIER').value;
          break;
        case 'events':
          node.events = this.parseArrayOfStrings();
          break;
        case 'eventStore':
          node.eventStore = this.expect('IDENTIFIER').value;
          break;
        case 'snapshotStrategy':
          node.snapshotStrategy = this.expect('IDENTIFIER').value;
          break;
        case 'snapshotInterval':
          node.snapshotInterval = this.parseValue();
          break;
        case 'projectors':
          node.projectors = this.parseArrayOfStrings();
          break;
        default:
          this.error(`Propriété inconnue dans EventSourcing : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');
    return node;
  }

  private parseCache(): CacheNode {
    const entity = this.expect('IDENTIFIER').value;
    this.expectPunctuation('{');

    const node: CacheNode = {
      type: 'Cache',
      entity,
      strategy: 'CACHE_ASIDE',
      ttl: '300s',
      keys: { pattern: '', invalidation: [] },
      warming: { on: '', data: '' }  // Initialisé correctement
    };

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');

      switch (key) {
        case 'strategy':
          node.strategy = this.expect('IDENTIFIER').value as 'READ_THROUGH' | 'WRITE_THROUGH' | 'CACHE_ASIDE' | string;
          break;
        case 'ttl':
          node.ttl = this.expect('STRING').value || this.expect('IDENTIFIER').value;
          break;
        case 'keys':
          node.keys = this.parseCacheKeysConfig();
          break;
        case 'warming':
          node.warming = this.parseCacheWarmingConfig();
          break;
        default:
          this.error(`Propriété inconnue dans Cache : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');
    return node;
  }

  private parseMonitoring(): MonitoringNode {
    let name = 'monitoring';
    if (this.check('IDENTIFIER')) {
      name = this.expect('IDENTIFIER').value;
    }
    this.expectPunctuation('{');

    const node: MonitoringNode = {
      type: 'Monitoring',
      name,
      provider: undefined,
      metrics: [],
      alerts: [],  // Aligné avec AlertConfig[]
      dashboards: [],
      alerting: false,
      retention: undefined,
      collectionInterval: undefined
    };

    while (!this.checkPunctuation('}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expectPunctuation(':');

      switch (key) {
        case 'provider':
          node.provider = this.expect('IDENTIFIER').value;
          break;
        case 'metrics':
          this.expectPunctuation('[');
          node.metrics = this.parseArrayOfObjects(['name', 'type', 'labels', 'buckets', 'description']).map(obj => obj.name);  // Extraire pour string[]
          this.expectPunctuation(']');
          break;
        case 'alerts':
          this.expectPunctuation('[');
          node.alerts = this.parseArrayOfObjects(['name', 'condition', 'severity', 'duration', 'channel']);
          this.expectPunctuation(']');
          break;
        case 'dashboards':
          node.dashboards = this.parseArrayOfStrings();
          break;
        case 'alerting':
          node.alerting = this.parseValue() as boolean;
          break;
        case 'retention':
          node.retention = this.expect('STRING').value;
          break;
        case 'collectionInterval':
          node.collectionInterval = this.expect('STRING').value;
          break;
        default:
          this.error(`Propriété inconnue dans Monitoring : ${key}`);
          this.advance();
      }

      if (this.checkPunctuation(',')) {
        this.advance();
      }
    }

    this.expectPunctuation('}');
    return node;
  }
}

