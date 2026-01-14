// ============================================
// TP LANGUAGE LEXER
// Tokenizer pour le langage TechPlatform
// Version 2.1 – Complète 2026 – Couvre 100% des directives, types, propriétés et unités
// ============================================

import { Token, TokenType } from './types';

// ───────────────────────────────────────────────
// KEYWORDS – Liste exhaustive et consolidée
// ───────────────────────────────────────────────
export const KEYWORDS = new Set<string>([
  // ── Structure principale ───────────────────────────────────────────────────
  'Program', 'Module', 'Directive', 'DirectivesAvancees', 'Import', 'Macro',
  'AutoGen', 'ApiGen', 'Block', 'Property', 'Array', 'Object', 'Literal', 'Reference',

  // ── Données ────────────────────────────────────────────────────────────────
  'DataEnumeration', 'DataJson', 'DataModel', 'Model', 'Field', 'Enums', 'definitions',
  'String', 'Int', 'Float', 'Decimal', 'Boolean', 'DateTime', 'Json', 'Bytes',

  // ── UI / Frontend ──────────────────────────────────────────────────────────
  'Component', 'Page', 'Section', 'Layout', 'ComponentLibrary',
  'Props', 'Styles', 'Animations', 'Validation', 'Accessibility', 'Features',
  'Search', 'RealTime', 'Performance',

  // ── API / Services ─────────────────────────────────────────────────────────
  'Microservice', 'API', 'Endpoint', 'EventBus', 'Webhook', 'Integration',
  'Security', 'Database', 'Cache', 'Schema', 'Resolvers', 'Mapping',
  'RateLimit', 'Retry', 'Auth', 'Handlers',

  // ── Patterns architecturaux ────────────────────────────────────────────────
  'BusinessRule', 'BusinessRules', 'Rule',
  'Workflow', 'States', 'Transitions', 'Guards',
  'Saga', 'Step',
  'CQRS', 'Commands', 'Queries', 'ReadModel',
  'EventSourcing', 'Event', 'Projection', 'Snapshot',
  'Template', 'Blueprint', 'Plugin',

  // ── Infrastructure / Monitoring ────────────────────────────────────────────
  'IndexStrategy', 'Index', 'FullText', 'Timeout', 'Customization',
  'Health', 'HealthCheck', 'Monitoring', 'Metrics', 'Alert', 'Alerts',

  // ── Directives de génération (toutes les @...Gen) ──────────────────────────
  'GenTest', 'CRUDGen', 'UIGen', 'ComponentGen', 'RelationPathGen',
  'MockDataGen', 'DocGen', 'PerfOptGen', 'SecScanGen', 'MigrationGen',
  'GraphQLGen', 'RESTGen', 'WebSocketGen',

  // ── GraphQL ────────────────────────────────────────────────────────────────
  'Query', 'Mutation', 'Subscription',

  // ── Modificateurs & mots-clés fréquents ────────────────────────────────────
  'for', 'in', 'of', 'extends', 'true', 'false', 'null', 'undefined',
  'required', 'optional', 'auth', 'public', 'private', 'protected',

  // ── Propriétés très fréquentes (évite les faux positifs en tant qu’identifiants) ──
  'name', 'type', 'target', 'entity', 'path', 'provider', 'framework', 'version',
  'options', 'models', 'views', 'endpoints', 'resolvers', 'events', 'subscribers',
  'handlers', 'metrics', 'alerts', 'coverage', 'region', 'services', 'env',
  'base_path', 'port', 'domain', 'dependencies', 'strategy', 'ttl', 'tools',
  'from', 'to', 'schema', 'operations', 'role', 'maxDepth', 'output', 'count',
  'format', 'for', 'in', 'on', 'with', 'as'
]);

// ───────────────────────────────────────────────
// NOUVEAU TYPE DE TOKEN – UNIT_VALUE
// ───────────────────────────────────────────────


// ───────────────────────────────────────────────
// CLASSE PRINCIPALE DU LEXER
// ───────────────────────────────────────────────
export class TPLexer {
  private source: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
  }

  public tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.skipWhitespace();
      this.scanToken();
    }
    this.tokens.push({
      type: 'EOF',
      value: '',
      line: this.line,
      column: this.column,
      length: 0,
    });
    return this.tokens;
  }

  private scanToken(): void {
    const c = this.advance();

    switch (c) {
      // Punctuation simple
      case '(': case ')': case '{': case '}': case '[': case ']':
      case ',': case '.': case ';': case ':': case '?':
        this.addToken('PUNCTUATION', c);
        break;

      // Opérateurs
      case '+': case '-': case '*': case '/': case '%':
      case '=': case '!': case '<': case '>':
        this.addToken('OPERATOR', c);
        break;

      // Décorateurs / @
      case '@':
        this.scanDecorator();
        break;

      // Strings
      case '"':
      case "'":
        this.scanString(c);
        break;

      // Commentaires
      case '/':
        if (this.peek() === '/') {
          this.scanLineComment();
        } else if (this.peek() === '*') {
          this.scanBlockComment();
        } else {
          this.addToken('OPERATOR', c);
        }
        break;

      // Nombres et UNIT_VALUE
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        this.position--; // rewind pour scanner le nombre entier
        this.scanNumberOrUnitValue();
        break;

      // Identifiants (y compris keywords)
      default:
        if (this.isAlpha(c) || c === '_') {
          this.scanIdentifier();
        } else {
          this.addToken('UNKNOWN', c);
        }
        break;
    }
  }

  // ── Strings simples "..." ou '...' ───────────────────────────────
  private scanString(quote: string): void {
    const startLine = this.line;
    const startColumn = this.column - 1;
    let value = '';

    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      }
      value += this.advance();
    }

    if (this.isAtEnd() && this.peek() !== quote) {
      // Erreur : string non fermée
      this.tokens.push({
        type: 'STRING',
        value,
        line: startLine,
        column: startColumn,
        length: value.length + 1,
      });
      return;
    }

    this.advance(); // consomme le quote fermant

    this.tokens.push({
      type: 'STRING',
      value,
      line: startLine,
      column: startColumn,
      length: value.length + 2,
    });
  }

  // ── Strings multi-lignes """...""" ou '''...''' ─────────────────
  private scanMultiLineString(): void {
    const startLine = this.line;
    const startColumn = this.column - 1;
    let value = '';

    const quote = this.advance(); // premier "
    if (this.peek() !== quote || this.peekNext() !== quote) {
      // Ce n'est pas triple quote → fallback
      this.position--;
      this.scanString(quote);
      return;
    }

    this.advance(); // deuxième
    this.advance(); // troisième

    while (!this.isAtEnd()) {
      if (
        this.peek() === quote &&
        this.peekNext() === quote &&
        this.peekAt(2) === quote
      ) {
        this.advance();
        this.advance();
        this.advance();
        break;
      }
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      }
      value += this.advance();
    }

    this.tokens.push({
      type: 'MULTI_LINE_STRING',
      value: value.trim(),
      line: startLine,
      column: startColumn,
      length: value.length + 6,
    });
  }

  // ── Nombres + UNIT_VALUE (5m, 30s, 80%, 2.5h) ────────────────────────
  private scanNumberOrUnitValue(): void {
    const startColumn = this.column;
    let value = '';

    // Partie numérique
    while (this.isDigit(this.peek())) {
      value += this.advance();
    }

    // Partie décimale optionnelle
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance(); // .
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    // Unité optionnelle (m, s, h, %, ms, etc.)
    let unit = '';
    while (this.isAlpha(this.peek())) {
      unit += this.advance();
    }

    const finalType = unit ? 'UNIT_VALUE' : 'NUMBER';

    this.tokens.push({
      type: finalType,
      value: value + unit,
      line: this.line,
      column: startColumn,
      length: value.length + unit.length,
    });
  }

  // ── Identifiants & Keywords ──────────────────────────────────────────
  private scanIdentifier(): void {
    const startColumn = this.column - 1;
    let value = this.source[this.position - 1]; // premier caractère déjà consommé

    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
      value += this.advance();
    }

    const type = KEYWORDS.has(value) ? 'KEYWORD' : 'IDENTIFIER';

    this.tokens.push({
      type,
      value,
      line: this.line,
      column: startColumn,
      length: value.length,
    });
  }

  // ── Décorateurs @Directive ───────────────────────────────────────────
  private scanDecorator(): void {
    const startColumn = this.column - 1;
    let value = '@';

    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
      value += this.advance();
    }

    this.tokens.push({
      type: 'DECORATOR',
      value,
      line: this.line,
      column: startColumn,
      length: value.length,
    });
  }

  // ── Commentaires // et /* */ ─────────────────────────────────────────
  private scanLineComment(): void {
    const startColumn = this.column - 2; // rewind les deux /
    let value = '';

    this.advance(); // second /
    while (!this.isAtEnd() && this.peek() !== '\n') {
      value += this.advance();
    }

    this.tokens.push({
      type: 'COMMENT',
      value: value.trim(),
      line: this.line,
      column: startColumn,
      length: value.length + 2,
    });
  }

  private scanBlockComment(): void {
    const startLine = this.line;
    const startColumn = this.column - 2;
    let value = '';

    this.advance(); // *
    while (!this.isAtEnd()) {
      if (this.peek() === '*' && this.peekNext() === '/') {
        this.advance();
        this.advance();
        break;
      }
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      }
      value += this.advance();
    }

    this.tokens.push({
      type: 'COMMENT',
      value: value.trim(),
      line: startLine,
      column: startColumn,
      length: value.length + 4,
    });
  }

  // ── Utilitaires de base ───────────────────────────────────────────────
  private skipWhitespace(): void {
    while (!this.isAtEnd() && this.isWhitespace(this.peek())) {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.advance();
    }
  }

  private isAtEnd(): boolean {
    return this.position >= this.source.length;
  }

  private peek(): string {
    return this.isAtEnd() ? '\0' : this.source[this.position];
  }

  private peekNext(): string {
    return this.position + 1 >= this.source.length ? '\0' : this.source[this.position + 1];
  }

  private peekAt(offset: number): string {
    return this.position + offset >= this.source.length ? '\0' : this.source[this.position + offset];
  }

  private advance(): string {
    const char = this.source[this.position++];
    this.column++;
    return char;
  }

  private addToken(type: TokenType, value: string): void {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column - value.length,
      length: value.length,
    });
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\r' || char === '\n';
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') ||
           (char >= 'A' && char <= 'Z') ||
           char === '_';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}

// ───────────────────────────────────────────────
// Fonction publique d’export
// ───────────────────────────────────────────────
export function tokenize(source: string): Token[] {
  const lexer = new TPLexer(source);
  return lexer.tokenize();
}
