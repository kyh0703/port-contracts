import {
  AssignTag,
  CaptureTag,
  CaseTag,
  Context,
  ForTag,
  IfTag,
  Liquid,
  LiquidError,
  Parser,
  Token,
  Tokenizer,
  TypeGuards,
  UndefinedVariableError,
  UnlessTag,
  Value,
  evalToken,
  toValue,
  toValueSync,
  type Emitter,
  type Expression,
  type FilterImplOptions,
  type RangeToken,
  type Scope,
  type Template,
  type TopLevelToken,
} from 'liquidjs';

const MAX_SOURCE_LENGTH = 65_536;
const MAX_SOURCE_TOKENS = 4_096;
const DEFAULT_OUTPUT_LENGTH = 65_536;
const MAX_OUTPUT_LENGTH = 262_144;
const MAX_CONTEXT_SIZE = 262_144;
const MAX_CONTEXT_NODES = 10_000;
const MAX_DEPTH = 16;
const MAX_COLLECTION_LENGTH = 1_000;
const MAX_ITERATIONS = 1_000;
const MAX_RENDER_STEPS = 10_000;
const MAX_ALLOCATIONS = 1_048_576;
const MAX_RENDER_MS = 100;

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  SOURCE_LIMIT: 'Template source is too large.',
  NESTING_LIMIT: 'Template nesting is too deep.',
  PARSE_ERROR: 'Template syntax is invalid.',
  UNSUPPORTED_SYNTAX: 'Template syntax is not supported.',
  UNSAFE_PROPERTY: 'Template property access is not permitted.',
  MISSING_VARIABLE: 'A required template variable is missing.',
  INVALID_CONTEXT: 'Template values must be plain JSON data.',
  CONTEXT_LIMIT: 'Template values exceed the data limit.',
  ITERATION_LIMIT: 'Template iteration limit exceeded.',
  OUTPUT_LIMIT: 'Template output limit exceeded.',
  RENDER_LIMIT: 'Template execution limit exceeded.',
  INVALID_OPTIONS: 'Template render options are invalid.',
  INVALID_DATE: 'Template dates must be explicit ISO dates or Unix seconds.',
  RENDER_ERROR: 'Template could not be rendered.',
};

/** Safe to expose to an author: never retains source, values, or upstream errors. */
export class LiquidTemplateError extends Error {
  readonly code: string;
  readonly line?: number;
  readonly column?: number;

  constructor(code: string, line?: number, column?: number) {
    super(ERROR_MESSAGES[code] ?? ERROR_MESSAGES.RENDER_ERROR);
    this.name = 'LiquidTemplateError';
    this.code = code;
    this.line = line;
    this.column = column;
  }
}

function fail(code: string, token?: Token): never {
  const position = token?.getPosition();
  throw new LiquidTemplateError(code, position?.[0], position?.[1]);
}

function sanitized(error: unknown, fallback: string, token?: Token): LiquidTemplateError {
  let current = error;
  let code = fallback;
  let location = token;
  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    if (current instanceof LiquidTemplateError) {
      if (!location || current.line !== undefined) return current;
      code = current.code;
      break;
    }
    if (current instanceof UndefinedVariableError) code = 'MISSING_VARIABLE';
    if (!(current instanceof LiquidError)) break;
    location ??= current.token;
    current = current.originalError;
  }
  const position = location?.getPosition();
  return new LiquidTemplateError(code, position?.[0], position?.[1]);
}

const UNSAFE_PROPERTIES: Readonly<Record<string, boolean>> = {
  ['__proto__']: true, prototype: true, constructor: true, toString: true, toLocaleString: true,
  valueOf: true, toLiquid: true, toJSON: true, then: true, catch: true, finally: true,
  hasOwnProperty: true, isPrototypeOf: true, propertyIsEnumerable: true,
  __defineGetter__: true, __defineSetter__: true, __lookupGetter__: true, __lookupSetter__: true,
};

function checkProperty(property: string, token?: Token): void {
  if (property.split('.').some((part) => Object.hasOwn(UNSAFE_PROPERTIES, part))) {
    fail('UNSAFE_PROPERTY', token);
  }
}

function checkIdentifier(name: string, token?: Token): void {
  if (/[^\x00-\x7f]/.test(name)) fail('UNSUPPORTED_SYNTAX', token);
  checkProperty(name, token);
}

type PlainValue = null | boolean | number | string | PlainValue[] | { [key: string]: PlainValue };

function copyValues(values: Readonly<Record<string, unknown>>): Record<string, PlainValue> {
  let size = 0;
  let nodes = 0;
  const ancestors = new Set<object>();
  function copy(value: unknown, depth: number): PlainValue {
    if (depth > MAX_DEPTH || ++nodes > MAX_CONTEXT_NODES) fail('CONTEXT_LIMIT');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) fail('INVALID_CONTEXT');
      return value;
    }
    if (typeof value === 'string') {
      size += value.length;
      if (size > MAX_CONTEXT_SIZE) fail('CONTEXT_LIMIT');
      return value;
    }
    if (typeof value !== 'object') fail('INVALID_CONTEXT');
    const array = Array.isArray(value);
    const prototype = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype : prototype !== null && prototype !== Object.prototype) {
      fail('INVALID_CONTEXT');
    }
    if (ancestors.has(value)) fail('INVALID_CONTEXT');
    if (array && value.length > MAX_COLLECTION_LENGTH) fail('CONTEXT_LIMIT');
    const keys = Reflect.ownKeys(value);
    if (keys.length > MAX_COLLECTION_LENGTH + (array ? 1 : 0)) fail('CONTEXT_LIMIT');
    const result: PlainValue[] | Record<string, PlainValue> = array ? [] : Object.create(null);
    ancestors.add(value);
    for (const key of keys) {
      if (typeof key !== 'string') fail('INVALID_CONTEXT');
      if (array && key === 'length') continue;
      checkProperty(key);
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !('value' in descriptor) || !descriptor.enumerable) fail('INVALID_CONTEXT');
      if (array && !/^(0|[1-9]\d*)$/.test(key)) fail('INVALID_CONTEXT');
      size += key.length;
      if (size > MAX_CONTEXT_SIZE) fail('CONTEXT_LIMIT');
      (result as Record<string, PlainValue>)[key] = copy(descriptor.value, depth + 1);
    }
    ancestors.delete(value);
    if (array && (result as PlainValue[]).length !== value.length) fail('INVALID_CONTEXT');
    return result;
  }
  if (!values || typeof values !== 'object' || Array.isArray(values)) fail('INVALID_CONTEXT');
  return copy(values, 0) as Record<string, PlainValue>;
}

class BoundedContext extends Context {
  readonly localScopes: object[];
  steps = 0;
  iterations = 0;

  constructor(values: Record<string, PlainValue>, readonly maxOutputLength: number) {
    super(values, liquid.options, { sync: true, memoryLimit: MAX_ALLOCATIONS, renderLimit: MAX_RENDER_MS }, { liquid });
    this.localScopes = [this.bottom()];
    const useMemory = this.memoryLimit.use.bind(this.memoryLimit);
    this.memoryLimit.use = (count: number) => {
      if (!Number.isFinite(count) || count > MAX_OUTPUT_LENGTH) fail('OUTPUT_LIMIT');
      try { useMemory(count); } catch { fail('OUTPUT_LIMIT'); }
    };
    const checkTime = this.renderLimit.check.bind(this.renderLimit);
    this.renderLimit.check = (time: number) => {
      try { checkTime(time); } catch { fail('RENDER_LIMIT'); }
    };
  }

  override push(scope: object): number {
    this.localScopes.push(scope);
    return super.push(scope);
  }

  override pop(): Scope | undefined {
    this.localScopes.pop();
    return super.pop();
  }

  override *_get(paths: Parameters<Context['_get']>[0]): IterableIterator<unknown> {
    const root = String(paths[0]);
    if (!this.localScopes.some((scope) => Object.hasOwn(scope, root))) {
      // Exact legacy flat keys win over nested JSON, but never over Liquid locals.
      for (let length = paths.length; length > 0; length--) {
        const key = paths.slice(0, length).join('.');
        if (Object.hasOwn(this.environments, key)) {
          return yield* this._getFromScope(this.environments[key], paths.slice(length));
        }
      }
    }
    return yield* super._get(paths);
  }

  step(): void {
    if (++this.steps > MAX_RENDER_STEPS) fail('RENDER_LIMIT');
  }

  iterate(): void {
    if (++this.iterations > MAX_ITERATIONS) fail('ITERATION_LIMIT');
  }
}

function text(value: unknown, limit: number): string {
  value = toValue(value);
  if (Array.isArray(value)) {
    let result = '';
    for (const item of value) result += text(item, limit - result.length);
    return result;
  }
  const result = value === null || value === undefined ? ''
    : typeof value === 'object' ? '[object Object]' : String(value);
  if (result.length > limit) fail('OUTPUT_LIMIT');
  return result;
}

class BoundedEmitter implements Emitter {
  buffer = '';
  constructor(private readonly context: BoundedContext) {}
  write(value: unknown): void {
    this.buffer += text(value, this.context.maxOutputLength - this.buffer.length);
  }
}

const STRING_FILTERS = new Set([
  'upcase', 'downcase', 'capitalize', 'strip', 'lstrip', 'rstrip', 'strip_newlines',
  'append', 'prepend', 'replace', 'replace_first', 'replace_last',
  'remove', 'remove_first', 'remove_last', 'truncate',
]);
const NUMBER_FILTERS = new Set([
  'abs', 'at_least', 'at_most', 'ceil', 'floor', 'round', 'plus', 'minus',
  'times', 'divided_by', 'modulo',
]);
const FILTERS = new Set([...STRING_FILTERS, ...NUMBER_FILTERS, 'default', 'size', 'date']);
const BLOCK_TAGS: Readonly<Record<string, true>> = { if: true, unless: true, case: true, for: true, capture: true };
const TAGS: Readonly<Record<string, true>> = { ...BLOCK_TAGS, assign: true, break: true, continue: true, echo: true, comment: true };

const liquid = new Liquid({
  strictVariables: true,
  strictFilters: true,
  lenientIf: true,
  ownPropertyOnly: true,
  globals: Object.create(null),
  outputEscape: undefined,
  timezoneOffset: 0,
  preserveTimezones: false,
  locale: 'en-US',
  groupedExpressions: false,
  parseLimit: MAX_SOURCE_LENGTH,
  memoryLimit: MAX_ALLOCATIONS,
  renderLimit: MAX_RENDER_MS,
});
for (const name of Object.keys(liquid.tags)) {
  if (!Object.hasOwn(TAGS, name)) delete liquid.tags[name];
}
for (const name of Object.keys(liquid.filters)) {
  if (!FILTERS.has(name)) liquid.unregisterFilter(name);
}

function explicitDate(value: unknown, token?: Token): string | number {
  if (typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 8_640_000_000_000) return value;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) {
    fail('INVALID_DATE', token);
  }
  if (!Number.isFinite(Date.parse(value))) fail('INVALID_DATE', token);
  return value;
}

function checkDateFormat(format: unknown, maxLength: number, token?: Token): void {
  if (typeof format !== 'string' || format.length > 256) fail('INVALID_DATE', token);
  // Bound strftime's optional padding width before it can allocate a padded string.
  for (const match of format.matchAll(/%[-_0^#:]*([0-9]+)/g)) {
    if (Number(match[1]) > Math.min(maxLength, 256)) fail('OUTPUT_LIMIT', token);
  }
}

for (const name of FILTERS) {
  const implementation = liquid.filters[name] as FilterImplOptions;
  const handler = typeof implementation === 'function' ? implementation : implementation.handler;
  liquid.registerFilter(name, function (value: unknown, ...args: unknown[]) {
    const context = this.context as BoundedContext;
    const limit = context.maxOutputLength;
    context.step();
    if (STRING_FILTERS.has(name)) {
      value = text(value, limit);
      args = args.map((arg) => typeof arg === 'number' ? arg : text(arg, limit));
      if ((name === 'append' || name === 'prepend') && (value as string).length + text(args[0], limit).length > limit) {
        fail('OUTPUT_LIMIT', this.token);
      }
      if (name === 'replace') {
        const input = value as string;
        const pattern = text(args[0], limit);
        const replacement = text(args[1], limit);
        let count = pattern.length ? 0 : Math.max(0, input.length - 1);
        if (pattern.length) {
          for (let at = input.indexOf(pattern); at !== -1; at = input.indexOf(pattern, at + pattern.length)) count++;
        }
        if (input.length + count * (replacement.length - pattern.length) > limit) fail('OUTPUT_LIMIT', this.token);
      }
    } else if (NUMBER_FILTERS.has(name)) {
      for (const input of [value, ...args]) {
        if ((typeof input !== 'string' && typeof input !== 'number') || !Number.isFinite(Number(input))) fail('RENDER_ERROR', this.token);
      }
    } else if (name === 'date') {
      value = explicitDate(value, this.token);
      if (args.length !== 1) fail('UNSUPPORTED_SYNTAX', this.token);
      checkDateFormat(args[0], limit, this.token);
    }
    const result: unknown = handler.apply(this, [value, ...args]);
    if (typeof result === 'string' && result.length > limit) fail('OUTPUT_LIMIT', this.token);
    if (typeof result === 'number' && !Number.isFinite(result)) fail('RENDER_ERROR', this.token);
    return result;
  });
}

/** Only a legacy identifier spelling adapter; all Liquid grammar is parsed by LiquidJS. */
function normalizeLegacyOffsets(source: string, tokens: TopLevelToken[]): string {
  const replacements: Array<[number, string]> = [];
  for (const token of tokens) {
    if (!TypeGuards.isDelimitedToken(token)) continue;
    const [begin, end] = token.contentRange;
    let segment = begin;
    let nesting = 0;
    const visit = (from: number, to: number) => {
      const fragment = source.slice(from, to);
      for (const match of fragment.matchAll(/(?<![\p{L}\p{N}_.-])[\p{L}_][\p{L}\p{N}_.-]*\s*[+-]\s*\d+(?=$|[\s|,:\])=<>])/gu)) {
        const at = from + (match.index ?? 0);
        for (let offset = 0; offset < match[0].length; offset++) {
          const char = match[0][offset];
          if (char === '+' || /\s/.test(char)) replacements.push([at + offset, '＿']);
        }
      }
    };
    for (let at = begin; at < end; at++) {
      const char = source[at];
      if (char === '"' || char === "'") {
        visit(segment, at);
        const tokenizer = new Tokenizer(source, liquid.options.operators, undefined, [at, end]);
        const quoted = tokenizer.readQuoted();
        if (!quoted) fail('PARSE_ERROR', token);
        at = tokenizer.p - 1;
        segment = tokenizer.p;
      } else if (char === '[' || char === '(') {
        if (++nesting > MAX_DEPTH) fail('NESTING_LIMIT', token);
      } else if (char === ']' || char === ')') {
        if (--nesting < 0) fail('PARSE_ERROR', token);
      }
    }
    visit(segment, end);
    if (nesting !== 0) fail('PARSE_ERROR', token);
  }
  if (!replacements.length) return source;
  const characters = source.split('');
  for (const [at, character] of replacements) characters[at] = character;
  return characters.join('');
}

function preflight(tokens: TopLevelToken[]): TopLevelToken[] {
  if (tokens.length > MAX_SOURCE_TOKENS) fail('SOURCE_LIMIT');
  const stack: Array<{ name: string; hasElse: boolean; token: Token }> = [];
  const active: TopLevelToken[] = [];
  let comment: Token | undefined;
  for (const token of tokens) {
    if (comment) {
      if (TypeGuards.isTagToken(token) && token.name === 'endcomment') comment = undefined;
      continue;
    }
    active.push(token);
    if (TypeGuards.isHTMLToken(token)) {
      if (/}}|%}/.test(token.getText())) fail('PARSE_ERROR', token);
      continue;
    }
    if (!TypeGuards.isTagToken(token)) continue;
    const name = token.name;
    if (name === 'comment') {
      if (token.args.trim()) fail('PARSE_ERROR', token);
      comment = token;
      continue;
    }
    if (Object.hasOwn(BLOCK_TAGS, name)) {
      stack.push({ name, hasElse: false, token });
      if (stack.length > MAX_DEPTH) fail('NESTING_LIMIT', token);
    } else if (name.startsWith('end')) {
      if (token.args.trim() || stack.pop()?.name !== name.slice(3)) fail('PARSE_ERROR', token);
    } else if (name === 'else' || name === 'elsif' || name === 'when') {
      const parent = stack[stack.length - 1];
      if (!parent || parent.hasElse || parent.name === 'capture') fail('PARSE_ERROR', token);
      if (name === 'else') {
        if (token.args.trim()) fail('PARSE_ERROR', token);
        parent.hasElse = true;
      } else if (name === 'elsif' && parent.name !== 'if' && parent.name !== 'unless') {
        fail('PARSE_ERROR', token);
      } else if (name === 'when' && parent.name !== 'case') {
        fail('PARSE_ERROR', token);
      }
    } else if (!Object.hasOwn(TAGS, name)) {
      fail('UNSUPPORTED_SYNTAX', token);
    }
    if (name === 'break' || name === 'continue') {
      if (token.args.trim() || !stack.some((entry) => entry.name === 'for')) fail('PARSE_ERROR', token);
    }
  }
  if (comment) fail('PARSE_ERROR', comment);
  if (stack.length) fail('PARSE_ERROR', stack[stack.length - 1].token);
  return active;
}

function validateWhenTokens(tokens: TopLevelToken[]): void {
  for (const token of tokens) {
    if (!TypeGuards.isTagToken(token) || token.name !== 'when') continue;
    const tokenizer = new Tokenizer(token.input, liquid.options.operators, undefined, token.contentRange);
    tokenizer.readIdentifier();
    do {
      tokenizer.readValueOrThrow();
      tokenizer.skipBlank();
      if (tokenizer.end()) break;
      if (tokenizer.peek() === ',') tokenizer.advance();
      else if (tokenizer.readIdentifier().content !== 'or') fail('PARSE_ERROR', token);
      tokenizer.skipBlank();
      if (tokenizer.end()) fail('PARSE_ERROR', token);
    } while (!tokenizer.end());
  }
}

function validateConsumedTokens(tokens: TopLevelToken[]): void {
  for (const token of tokens) {
    let tokenizer: Tokenizer;
    if (TypeGuards.isTagToken(token)) {
      tokenizer = token.tokenizer;
    } else if (TypeGuards.isOutputToken(token)) {
      tokenizer = new Tokenizer(token.input, liquid.options.operators, undefined, token.contentRange);
      tokenizer.readFilteredValue();
    } else continue;
    tokenizer.skipBlank();
    if (!tokenizer.end()) fail('PARSE_ERROR', token);
  }
}

function checkRange(low: unknown, high: unknown, token: RangeToken): void {
  if ((typeof low !== 'number' && (typeof low !== 'string' || !/^-?\d+$/.test(low)))
    || (typeof high !== 'number' && (typeof high !== 'string' || !/^-?\d+$/.test(high)))) fail('ITERATION_LIMIT', token);
  const first = Number(low);
  const last = Number(high);
  if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last)
    || Math.abs(first) >= Number.MAX_SAFE_INTEGER || Math.abs(last) >= Number.MAX_SAFE_INTEGER
    || last - first + 1 > MAX_COLLECTION_LENGTH) fail('ITERATION_LIMIT', token);
}

function validateExpression(expression: Expression, source: string, ranges: RangeToken[], location: Token): void {
  let operands = 0;
  for (const token of expression.postfix) {
    if (TypeGuards.isOperatorToken(token)) {
      const arity = token.operator === 'not' ? 1 : 2;
      if (operands < arity) fail('PARSE_ERROR', location);
      operands -= arity - 1;
    } else {
      validateToken(token, source, ranges);
      operands++;
    }
  }
  if (operands !== 1) fail('PARSE_ERROR', location);
}

function validateToken(token: Token, source: string, ranges: RangeToken[]): void {
  if (TypeGuards.isPropertyAccessToken(token)) {
    if (token.variable) fail('UNSUPPORTED_SYNTAX', token);
    if (token.props.length > MAX_DEPTH) fail('NESTING_LIMIT', token);
    let cursor = token.begin;
    for (const property of token.props) {
      if (!TypeGuards.isWordToken(property) && !TypeGuards.isQuotedToken(property) && !TypeGuards.isNumberToken(property)) {
        fail('UNSUPPORTED_SYNTAX', token);
      }
      const before = token.input.slice(cursor, property.begin).trim();
      if (before === '[') {
        let close = property.end;
        while (/\s/.test(token.input[close] ?? '') && close < token.end) close++;
        if (token.input[close] !== ']') fail('PARSE_ERROR', token);
        cursor = close + 1;
      } else {
        if (before !== '' && (before !== '.' || !TypeGuards.isWordToken(property))) fail('PARSE_ERROR', token);
        cursor = property.end;
      }
      if (TypeGuards.isWordToken(property)) {
        property.content = source.slice(property.begin, property.end).replace(/\s*([+-])\s*(\d+)$/, '$1$2');
      }
      checkIdentifier(String(property.content), token);
    }
    if (token.input.slice(cursor, token.end).trim()) fail('PARSE_ERROR', token);
    token.input = source;
  } else if (TypeGuards.isRangeToken(token)) {
    if (TypeGuards.isRangeToken(token.lhs) || TypeGuards.isRangeToken(token.rhs)) fail('UNSUPPORTED_SYNTAX', token);
    validateToken(token.lhs, source, ranges);
    validateToken(token.rhs, source, ranges);
    if (TypeGuards.isNumberToken(token.lhs) && TypeGuards.isNumberToken(token.rhs)) checkRange(token.lhs.content, token.rhs.content, token);
    ranges.push(token);
  } else if (TypeGuards.isFilteredValueToken(token)) {
    fail('UNSUPPORTED_SYNTAX', token);
  }
}

function validateValue(value: Value, source: string, ranges: RangeToken[], token: Token): void {
  validateExpression(value.initial, source, ranges, token);
  if (value.filters.length > 32) fail('NESTING_LIMIT', token);
  for (const filter of value.filters) {
    if (!FILTERS.has(filter.name)) fail('UNSUPPORTED_SYNTAX', token);
    for (const argument of filter.args) {
      const argumentToken = Array.isArray(argument) ? argument[1] : argument;
      if (!argumentToken) fail('PARSE_ERROR', token);
      if (Array.isArray(argument) && (filter.name !== 'default' || argument[0] !== 'allow_false')) fail('UNSUPPORTED_SYNTAX', token);
      validateToken(argumentToken, source, ranges);
    }
    if (filter.name === 'date') {
      if (filter.args.length !== 1 || Array.isArray(filter.args[0])) fail('UNSUPPORTED_SYNTAX', token);
      const input = value.initial.postfix[0];
      if (value.filters[0] === filter && TypeGuards.isQuotedToken(input)) explicitDate(input.content, token);
      if (TypeGuards.isQuotedToken(filter.args[0])) checkDateFormat(filter.args[0].content, MAX_OUTPUT_LENGTH, token);
    }
  }
}

function prepareTemplates(templates: Template[], source: string): void {
  for (const template of templates) {
    template.token.input = source;
    const ranges: RangeToken[] = [];
    for (const argument of template.arguments?.() ?? []) {
      if (argument instanceof Value) validateValue(argument, source, ranges, template.token);
      else validateToken(argument, source, ranges);
    }
    for (const local of template.localScope?.() ?? []) {
      checkIdentifier(local.content, template.token);
      if (TypeGuards.isWordToken(local) && source.slice(local.begin, local.end) !== local.content) fail('UNSUPPORTED_SYNTAX', template.token);
    }
    for (const local of template.blockScope?.() ?? []) checkIdentifier(local, template.token);
    if (template.children) prepareTemplates(toValueSync(template.children(false, true)) as Template[], source);
    if (template instanceof ForTag) {
      for (const key of Object.keys(template.hash.hash)) {
        if (!['limit', 'offset', 'reversed'].includes(key)) fail('UNSUPPORTED_SYNTAX', template.token);
      }
      template.templates.unshift({ token: template.token, render(context: Context) { (context as BoundedContext).iterate(); } });
    }
    const assignment = template instanceof AssignTag
      ? { key: [...template.localScope()][0].content, value: [...template.arguments()][0] as Value }
      : undefined;
    const render = template.render.bind(template);
    template.render = function* (context: Context, emitter: Emitter): Generator<unknown, unknown, unknown> {
      const bounded = context as BoundedContext;
      try {
        bounded.step();
        for (const range of ranges) {
          checkRange(toValueSync(evalToken(range.lhs, context)), toValueSync(evalToken(range.rhs, context)), range);
        }
        if (assignment) {
          context.bottom()[assignment.key] = yield assignment.value.value(context, false);
          return;
        }
        if (template instanceof CaptureTag) {
          const capture = new BoundedEmitter(bounded);
          yield liquid.renderer.renderTemplates(template.templates, context, capture);
          context.bottom()[template.variable] = capture.buffer;
          return;
        }
        return yield render(context, emitter);
      } catch (error) {
        throw sanitized(error, 'RENDER_ERROR', template.token);
      }
    };
  }
}

function parse(source: string): Template[] {
  if (typeof source !== 'string') fail('PARSE_ERROR');
  if (source.length > MAX_SOURCE_LENGTH) fail('SOURCE_LIMIT');
  try {
    const originalTokens = new Tokenizer(source, liquid.options.operators).readTopLevelTokens(liquid.options);
    const activeOriginalTokens = preflight(originalTokens);
    const normalized = normalizeLegacyOffsets(source, activeOriginalTokens);
    const tokens = new Tokenizer(normalized, liquid.options.operators).readTopLevelTokens(liquid.options);
    const activeTokens = preflight(tokens);
    validateWhenTokens(activeTokens);
    const templates = new Parser(liquid).parseTokens([...tokens]);
    validateConsumedTokens(activeTokens);
    prepareTemplates(templates, source);
    return templates;
  } catch (error) {
    throw sanitized(error, 'PARSE_ERROR');
  }
}

function externalReferences(templates: Template[]): { variables: string[]; requiredVariables: string[] } {
  const references: Array<{ name: string; begin: number }> = [];
  const required = new Set<string>();
  function collect(token: Token, defined: ReadonlySet<string>, strict: boolean, rangesRequired: boolean): void {
    if (TypeGuards.isPropertyAccessToken(token)) {
      const segments = token.props.map((property) => {
        if ('content' in property) return String(property.content);
        return fail('UNSUPPORTED_SYNTAX', token);
      });
      if (!defined.has(segments[0])) {
        const name = segments.join('.');
        references.push({ name, begin: token.begin });
        if (strict) required.add(name);
      }
    } else if (TypeGuards.isRangeToken(token)) {
      // prepareTemplates checks range bounds strictly before evaluating any tag arguments.
      collect(token.lhs, defined, rangesRequired, rangesRequired);
      collect(token.rhs, defined, rangesRequired, rangesRequired);
    }
  }
  function visit(nodes: Template[], defined: Set<string>, unconditional: boolean): Set<string> {
    for (const template of nodes) {
      const conditional = template instanceof IfTag || template instanceof UnlessTag || template instanceof CaseTag;
      for (const argument of template.arguments?.() ?? []) {
        let unconditionalArgument = unconditional;
        if (template instanceof ForTag) unconditionalArgument &&= argument === template.collection;
        if (template instanceof IfTag || template instanceof UnlessTag) {
          unconditionalArgument &&= argument === template.branches[0]?.value;
        }
        if (argument instanceof Value) {
          // Liquid only makes the initial expression lenient, never a filter's arguments.
          const strict = unconditionalArgument && !conditional && argument.filters[0]?.name !== 'default';
          for (const token of argument.initial.postfix) collect(token, defined, strict, unconditional);
          for (const filter of argument.filters) {
            for (const token of filter.args) {
              const value = Array.isArray(token) ? token[1] : token;
              if (value) collect(value, defined, unconditionalArgument, unconditional);
            }
          }
        } else {
          if (template instanceof ForTag && argument === template.hash.hash.offset
            && TypeGuards.isPropertyAccessToken(argument) && argument.props.length === 1
            && TypeGuards.isWordToken(argument.props[0]) && argument.props[0].content === 'continue') continue;
          collect(argument, defined, unconditionalArgument && !conditional, unconditional);
        }
      }
      if (template instanceof ForTag) {
        const loop = new Set(defined);
        loop.add(template.variable);
        loop.add('forloop');
        visit(template.templates, loop, false);
        visit(template.elseTemplates, new Set(defined), false);
        // Both the body and the else branch can be skipped. Neither guarantees assignment.
        continue;
      }
      if (template instanceof IfTag || template instanceof UnlessTag || template instanceof CaseTag) {
        const branches = template.branches.map((branch) => visit(branch.templates, new Set(defined), false));
        branches.push(visit(template.elseTemplates ?? [], new Set(defined), false));
        for (const name of branches[0]) {
          if (branches.every((branch) => branch.has(name))) defined.add(name);
        }
        continue;
      }
      // Capture evaluates its body before binding its own name. Assigns inside it do execute.
      if (template instanceof CaptureTag) visit(template.templates, defined, unconditional);
      for (const local of template.localScope?.() ?? []) defined.add(local.content);
    }
    return defined;
  }
  visit(templates, new Set(), true);
  references.sort((left, right) => left.begin - right.begin);
  const variables = [...new Set(references.map((reference) => reference.name))];
  return { variables, requiredVariables: variables.filter((name) => required.has(name)) };
}

/** Inspect all external references and the subset read strictly outside optional branches/defaults. */
export function inspectLiquidTemplate(source: string): { variables: string[]; requiredVariables: string[] } {
  try {
    return externalReferences(parse(source));
  } catch (error) {
    throw sanitized(error, 'PARSE_ERROR');
  }
}

/** Render authored source once as plain text using only the caller's permitted JSON values. */
export function renderLiquidTemplate(
  source: string,
  values: Readonly<Record<string, unknown>>,
  options: { maxOutputLength?: number } = {},
): string {
  const maxOutputLength = options.maxOutputLength ?? DEFAULT_OUTPUT_LENGTH;
  if (!Number.isSafeInteger(maxOutputLength) || maxOutputLength < 1 || maxOutputLength > MAX_OUTPUT_LENGTH) fail('INVALID_OPTIONS');
  try {
    const templates = parse(source);
    const context = new BoundedContext(copyValues(values), maxOutputLength);
    const emitter = new BoundedEmitter(context);
    toValueSync(liquid.renderer.renderTemplates(templates, context, emitter));
    return emitter.buffer;
  } catch (error) {
    throw sanitized(error, 'RENDER_ERROR');
  }
}
