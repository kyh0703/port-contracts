const assert = require('node:assert/strict');
const test = require('node:test');
const {
  inspectLiquidTemplate,
  renderLiquidTemplate,
  LiquidTemplateError,
} = require('@overthinker1127/port-contracts/templates');

function expectTemplateError(action, code) {
  assert.throws(action, (error) => {
    assert.ok(error instanceof LiquidTemplateError);
    assert.equal(typeof error.code, 'string');
    if (code) assert.equal(error.code, code);
    assert.doesNotMatch(error.message, /private-marker|customer-secret/);
    assert.equal(error.cause, undefined);
    return true;
  });
}

test('renders authored conditions, defaults, strings, and number filters', () => {
  const source = '{% if confirmed %}{{ name | upcase }}: {{ count | plus: 2 | times: 3 }}{% else %}대기{% endif %} / {{ absent | default: "고객" }}';
  assert.equal(renderLiquidTemplate(source, { confirmed: true, name: 'kim', count: 2 }), 'KIM: 12 / 고객');
  assert.equal(renderLiquidTemplate(source, { confirmed: false }), '대기 / 고객');
  assert.equal(renderLiquidTemplate('{% unless missing %}없음{% endunless %}', {}), '없음');
  assert.equal(renderLiquidTemplate('{{ enabled | default: true, allow_false: true }}', { enabled: false }), 'false');
});

test('inspects external variable paths including condition and filter arguments', () => {
  const source = '{% assign label = customer.name | default: fallback %}{% capture message %}{{ label }} {{ suffix }}{% endcapture %}{% if active %}{{ message }}{% elsif other %}{{ alternate }}{% endif %}{% for item in items limit: count %}{{ forloop.index }} {{ item.name }} {{ customer.name }}{% endfor %}';
  assert.deepEqual(inspectLiquidTemplate(source).variables, ['customer.name', 'fallback', 'suffix', 'active', 'other', 'alternate', 'items', 'count']);
});

test('keeps possibly unassigned branch and loop variables external', () => {
  const conditional = '{% if confirmed %}{% assign name = "fixed" %}{% endif %}{{ name }}';
  assert.deepEqual(inspectLiquidTemplate(conditional).variables, ['confirmed', 'name']);
  assert.equal(renderLiquidTemplate(conditional, { confirmed: false, name: 'fallback' }), 'fallback');
  const loop = '{% for item in items %}{% assign name = item.name %}{% endfor %}{{ name }}';
  assert.deepEqual(inspectLiquidTemplate(loop).variables, ['items', 'name']);
  assert.equal(renderLiquidTemplate(loop, { items: [], name: 'fallback' }), 'fallback');
  assert.deepEqual(inspectLiquidTemplate('{% if flag %}{% capture label %}fixed{% endcapture %}{% endif %}{{ label }}').variables, ['flag', 'label']);
});

test('excludes variables definitely assigned on every conditional branch', () => {
  const source = '{% if flag %}{% assign name = "a" %}{% else %}{% assign name = "b" %}{% endif %}{{ name }}';
  assert.deepEqual(inspectLiquidTemplate(source).variables, ['flag']);
  assert.equal(renderLiquidTemplate(source, { flag: false }), 'b');
  assert.deepEqual(inspectLiquidTemplate('{% capture name %}{{ name }}{% endcapture %}{{ name }}').variables, ['name']);
});

test('keeps loop-local variables scoped to the loop body', () => {
  assert.deepEqual(inspectLiquidTemplate('{% for item in items %}{{ item.name }}{% endfor %}{{ item }}').variables, ['items', 'item']);
});

for (const source of [
  '{{ name }}',
  '{{ name | upcase }}',
  '{% echo name %}',
  '{% assign label = name %}{{ label }}',
  '{% capture label %}{{ name }}{% endcapture %}{{ label }}',
  '{% capture name %}{{ name }}{% endcapture %}{{ name }}',
]) {
  test(`required metadata preserves strict unconditional reads ${JSON.stringify(source)}`, () => {
    assert.deepEqual(inspectLiquidTemplate(source), { variables: ['name'], requiredVariables: ['name'] });
    expectTemplateError(() => renderLiquidTemplate(source, {}), 'MISSING_VARIABLE');
    assert.match(renderLiquidTemplate(source, { name: 'Kim' }), /^(Kim|KIM)$/);
  });
}

test('required metadata permits omitted conditional and defaulted inputs', () => {
  const source = '{% if confirmed %}{{ customer.name | upcase }}{% elsif pending %}{{ alternate }}{% endif %}{{ nickname | default: "고객" }}';
  assert.deepEqual(inspectLiquidTemplate(source), {
    variables: ['confirmed', 'customer.name', 'pending', 'alternate', 'nickname'],
    requiredVariables: [],
  });
  assert.equal(renderLiquidTemplate(source, {}), '고객');
  assert.equal(renderLiquidTemplate(source, { confirmed: true, 'customer.name': 'Kim' }), 'KIM고객');
  expectTemplateError(() => renderLiquidTemplate(source, { confirmed: true }), 'MISSING_VARIABLE');
});

test('required metadata keeps unless and case conditions lenient', () => {
  const source = '{% unless excluded %}{{ label | default: "guest" }}{% endunless %}{% case status %}{% when expected %}ok{% else %}{{ detail | default: "none" }}{% endcase %}';
  assert.deepEqual(inspectLiquidTemplate(source), {
    variables: ['excluded', 'label', 'status', 'expected', 'detail'],
    requiredVariables: [],
  });
  assert.equal(renderLiquidTemplate(source, { expected: 'active' }), 'guestnone');
});

test('required metadata evaluates every default filter argument strictly', () => {
  const source = '{{ name | default: fallback, allow_false: preserve_false | append: suffix }}';
  assert.deepEqual(inspectLiquidTemplate(source), {
    variables: ['name', 'fallback', 'preserve_false', 'suffix'],
    requiredVariables: ['fallback', 'preserve_false', 'suffix'],
  });
  assert.equal(renderLiquidTemplate(source, { fallback: 'Kim', preserve_false: true, suffix: '!' }), 'Kim!');
  for (const missing of ['fallback', 'preserve_false', 'suffix']) {
    const values = { name: 'Kim', fallback: 'Guest', preserve_false: true, suffix: '!' };
    delete values[missing];
    expectTemplateError(() => renderLiquidTemplate(source, values), 'MISSING_VARIABLE');
  }
});

test('required metadata only makes an initial default filter lenient', () => {
  const optional = '{{ name | default: "guest" | upcase }}';
  assert.deepEqual(inspectLiquidTemplate(optional), { variables: ['name'], requiredVariables: [] });
  assert.equal(renderLiquidTemplate(optional, {}), 'GUEST');
  const required = '{{ name | upcase | default: "guest" }}';
  assert.deepEqual(inspectLiquidTemplate(required), { variables: ['name'], requiredVariables: ['name'] });
  expectTemplateError(() => renderLiquidTemplate(required, {}), 'MISSING_VARIABLE');
});

test('required metadata distinguishes first-condition filter arguments from elsif arguments', () => {
  const source = '{% if enabled | default: fallback %}yes{% elsif other | default: alternate %}no{% endif %}';
  assert.deepEqual(inspectLiquidTemplate(source), {
    variables: ['enabled', 'fallback', 'other', 'alternate'],
    requiredVariables: ['fallback'],
  });
  assert.equal(renderLiquidTemplate(source, { fallback: true }), 'yes');
  expectTemplateError(() => renderLiquidTemplate(source, { enabled: true }), 'MISSING_VARIABLE');
  expectTemplateError(() => renderLiquidTemplate(source, { fallback: false }), 'MISSING_VARIABLE');
});

for (const source of [
  '{% unless enabled | default: fallback %}no{% endunless %}',
  '{% case enabled | default: fallback %}{% when "yes" %}yes{% endcase %}',
]) {
  test(`required metadata keeps condition filter arguments strict ${JSON.stringify(source)}`, () => {
    assert.deepEqual(inspectLiquidTemplate(source), {
      variables: ['enabled', 'fallback'],
      requiredVariables: ['fallback'],
    });
    expectTemplateError(() => renderLiquidTemplate(source, { enabled: 'yes' }), 'MISSING_VARIABLE');
  });
}

test('required metadata retains unconditional uses after optional occurrences', () => {
  const source = '{{ name | default: "guest" }}{% if flag %}{{ other }}{% endif %}{{ name | append: other }}';
  assert.deepEqual(inspectLiquidTemplate(source), {
    variables: ['name', 'flag', 'other'],
    requiredVariables: ['name', 'other'],
  });
  expectTemplateError(() => renderLiquidTemplate(source, {}), 'MISSING_VARIABLE');
  assert.equal(renderLiquidTemplate(source, { name: 'Kim', other: '!' }), 'KimKim!');
});

test('required metadata preserves definite assignment through branch-local aliases', () => {
  const source = '{% assign greeting = name | default: "guest" %}{% if active %}{% assign label = greeting | append: suffix %}{% else %}{% capture label %}{{ greeting }}{% endcapture %}{% endif %}{{ label }}';
  assert.deepEqual(inspectLiquidTemplate(source), {
    variables: ['name', 'active', 'suffix'],
    requiredVariables: [],
  });
  assert.equal(renderLiquidTemplate(source, {}), 'guest');
  assert.equal(renderLiquidTemplate(source, { active: true, suffix: '!' }), 'guest!');
});

test('required metadata requires aliases that may remain unassigned', () => {
  const source = '{% if active %}{% assign label = "fixed" %}{% endif %}{{ label }}';
  assert.deepEqual(inspectLiquidTemplate(source), {
    variables: ['active', 'label'],
    requiredVariables: ['label'],
  });
  assert.equal(renderLiquidTemplate(source, { label: 'fallback' }), 'fallback');
  expectTemplateError(() => renderLiquidTemplate(source, {}), 'MISSING_VARIABLE');
});

test('required metadata requires loop collections but not skipped bodies or modifiers', () => {
  const source = '{% for item in items limit: count offset: start %}{{ item.name }}{{ suffix }}{% else %}{{ empty_label | default: "empty" }}{% endfor %}';
  assert.deepEqual(inspectLiquidTemplate(source), {
    variables: ['items', 'count', 'start', 'suffix', 'empty_label'],
    requiredVariables: ['items'],
  });
  assert.equal(renderLiquidTemplate(source, { items: [] }), 'empty');
  expectTemplateError(() => renderLiquidTemplate(source, {}), 'MISSING_VARIABLE');
  expectTemplateError(() => renderLiquidTemplate(source, { items: [{ name: 'Kim' }] }), 'MISSING_VARIABLE');
});

test('required metadata keeps loop locals out of the global input scope', () => {
  const source = '{% for item in items %}{% assign label = item.name %}{{ forloop.index }}{{ label }}{% endfor %}{{ item }}{{ label }}';
  assert.deepEqual(inspectLiquidTemplate(source), {
    variables: ['items', 'item', 'label'],
    requiredVariables: ['items', 'item', 'label'],
  });
  assert.equal(renderLiquidTemplate(source, { items: [], item: 'external', label: 'fallback' }), 'externalfallback');
});

test('required metadata requires strict range bounds even with a default filter', () => {
  const source = '{% for n in (start..finish) %}{{ n }}{% endfor %}{{ (low..high) | default: "none" }}';
  assert.deepEqual(inspectLiquidTemplate(source), {
    variables: ['start', 'finish', 'low', 'high'],
    requiredVariables: ['start', 'finish', 'low', 'high'],
  });
  assert.equal(renderLiquidTemplate(source, { start: 1, finish: 2, low: 3, high: 4 }), '1234');
  expectTemplateError(() => renderLiquidTemplate(source, { start: 1, finish: 2 }), 'MISSING_VARIABLE');
});

test('required metadata keeps guarded loop collections and range bounds optional', () => {
  const source = '{% if enabled %}{% for item in items %}{{ item }}{% endfor %}{% for n in (start..finish) %}{{ n }}{% endfor %}{% endif %}';
  assert.deepEqual(inspectLiquidTemplate(source), {
    variables: ['enabled', 'items', 'start', 'finish'],
    requiredVariables: [],
  });
  assert.equal(renderLiquidTemplate(source, {}), '');
});

test('required metadata excludes only the internal loop resume reference', () => {
  const source = '{% for item in items limit: 1 %}{{ item }}{% endfor %}{% for item in items offset: continue %}{{ item }}{% endfor %}';
  assert.deepEqual(inspectLiquidTemplate(source), { variables: ['items'], requiredVariables: ['items'] });
  assert.equal(renderLiquidTemplate(source, { items: ['a', 'b', 'c'] }), 'abc');
  const withExternal = `${source}{{ continue }}{% for item in continue %}{{ item }}{% endfor %}`;
  assert.deepEqual(inspectLiquidTemplate(withExternal), {
    variables: ['items', 'continue'],
    requiredVariables: ['items', 'continue'],
  });
  assert.equal(renderLiquidTemplate(withExternal, { items: [], continue: 'external' }), 'externalexternal');
});

test('comments stay inert and do not contribute external variables', () => {
  const source = '{% comment %}{{ secret }} {% include "private-marker" %}{% endcomment %}{{ name }}';
  assert.deepEqual(inspectLiquidTemplate(source).variables, ['name']);
  assert.equal(renderLiquidTemplate(source, { name: 'Kim' }), 'Kim');
});

test('locals shadow flat external keys without changing the caller values', () => {
  const values = { item: { name: 'external' }, 'item.name': 'flat', items: [{ name: 'local' }] };
  assert.equal(renderLiquidTemplate('{% for item in items %}{{ item.name }}{% endfor %}{{ item.name }}', values), 'localflat');
  assert.deepEqual(values, { item: { name: 'external' }, 'item.name': 'flat', items: [{ name: 'local' }] });
});

test('supports bounded assign, capture, for, case, break, and continue', () => {
  const source = '{% assign total = price | times: 2 %}{% capture title %}금액 {{ total }}{% endcapture %}{{ title }}:{% for item in items %}{% if item == "skip" %}{% continue %}{% endif %}{% case item %}{% when "stop" %}{% break %}{% else %}{{ forloop.index }}={{ item }};{% endcase %}{% else %}없음{% endfor %}';
  assert.equal(renderLiquidTemplate(source, { price: 3, items: ['a', 'skip', 'b', 'stop', 'c'] }), '금액 6:1=a;3=b;');
  assert.equal(renderLiquidTemplate('{% for n in (1..3) %}{{ n }}{% endfor %}', {}), '123');
  assert.equal(renderLiquidTemplate('{% for n in (1..count) %}{{ n }}{% endfor %}', { count: '3' }), '123');
});

test('preserves plain text, Korean aliases, exact dotted keys, and signed date offsets', () => {
  const values = { 'customer.name': 'flat', customer: { name: 'nested' }, 고객명: '김고객', '오늘+1': '2026-11-06', '오늘-2': '2026-11-03', '사용자.이름': '홍길동' };
  assert.equal(renderLiquidTemplate('안내 {{고객명}} {{customer.name}} {{오늘+1}} {{오늘-2}} {{사용자.이름}}', values), '안내 김고객 flat 2026-11-06 2026-11-03 홍길동');
  assert.deepEqual(inspectLiquidTemplate('{{오늘+1}} {{오늘-2}} {{사용자.이름}} {{customer.name}}').variables, ['오늘+1', '오늘-2', '사용자.이름', 'customer.name']);
  assert.equal(renderLiquidTemplate('{{ 오늘 + 1 }} / {{ 오늘 - 2 }}', values), '2026-11-06 / 2026-11-03');
  assert.deepEqual(inspectLiquidTemplate('{{ 오늘 + 1 }} {{ 오늘 - 2 }}').variables, ['오늘+1', '오늘-2']);
  assert.equal(renderLiquidTemplate('{{ customer.name }}', { customer: { name: 'nested' } }), 'nested');
  assert.equal(renderLiquidTemplate('그대로 안내합니다.', {}), '그대로 안내합니다.');
});

test('inserts data once without interpreting it as source or HTML-encoding it', () => {
  const injected = '{{ secret }} {% include "private-marker" %} <b>&</b>';
  assert.equal(renderLiquidTemplate('{{ name }}', { name: injected, secret: 'customer-secret' }), injected);
  assert.equal(renderLiquidTemplate('{{ value | append: suffix }}', { value: '<a>', suffix: '&b' }), '<a>&b');
});

test('allows static bracket paths but rejects computed access', () => {
  assert.deepEqual(inspectLiquidTemplate('{{ customer["name"] }} {{ items[0].name }}').variables, ['customer.name', 'items.0.name']);
  assert.equal(renderLiquidTemplate('{{ customer["name"] }}', { customer: { name: 'Kim' } }), 'Kim');
  expectTemplateError(() => inspectLiquidTemplate('{{ customer[key] }}'), 'UNSUPPORTED_SYNTAX');
});

test('rejects missing values only when evaluated and provides sanitized coordinates', () => {
  assert.doesNotThrow(() => inspectLiquidTemplate('{{ missing }}'));
  expectTemplateError(() => renderLiquidTemplate('line\n{{ private-marker }}', {}), 'MISSING_VARIABLE');
  try {
    renderLiquidTemplate('line\n{{ private-marker }}', {});
  } catch (error) {
    assert.equal(error.line, 2);
    assert.equal(error.column, 1);
  }
  assert.equal(renderLiquidTemplate('{% if available %}{{ private-marker }}{% else %}없음{% endif %}', {}), '없음');
  expectTemplateError(() => renderLiquidTemplate('{% assign value = missing %}{{ value }}', {}), 'MISSING_VARIABLE');
  assert.throws(() => renderLiquidTemplate('{% if true %}\n{{ private-marker }}{% endif %}', {}), (error) => error instanceof LiquidTemplateError && error.line === 2 && error.column === 1);
});

for (const source of ['name}}', 'name%}', '{{}}', '{{a{{b}}', '{{a}', '{{ name', '{% if active %}private-marker', '{% endif %}', '{{ name trailing }}', '{{ name | upcase trailing }}', '{{name,other}}', '{{ customer["name" trailing] }}', '{{ customer. }}', '{% capture name extra %}x{% endcapture %}', '{% assign name = 1, other %}', '{% case name %}{% when "a" trailing %}x{% endcase %}']) {
  test(`rejects malformed syntax ${JSON.stringify(source)}`, () => {
    expectTemplateError(() => inspectLiquidTemplate(source));
  });
}

for (const source of [
  '{% include "private-marker" %}',
  '{% render "private-marker" %}',
  '{% layout "private-marker" %}',
  '{% javascript %}private-marker{% endjavascript %}',
  '{% unknown %}',
  '{{ name | unknown_filter }}',
  '{{ name | json }}',
  '{{ name | map: "constructor" }}',
  '{{ name | repeat: 1000000000 }}',
]) {
  test(`rejects unsupported policy ${JSON.stringify(source)}`, () => {
    expectTemplateError(() => inspectLiquidTemplate(source));
  });
}

for (const source of ['{{ value.__proto__ }}', '{{ value.constructor }}', '{{ value["prototype"] }}', '{{ toString }}', '{% assign constructor = "bad" %}']) {
  test(`rejects prototype access ${JSON.stringify(source)}`, () => {
    expectTemplateError(() => inspectLiquidTemplate(source), 'UNSAFE_PROPERTY');
  });
}

test('rejects accessors without invoking them and never accepts behavior-bearing values', () => {
  let getterCalls = 0;
  const accessor = {};
  Object.defineProperty(accessor, 'name', { enumerable: true, get() { getterCalls++; throw new Error('customer-secret'); } });
  expectTemplateError(() => renderLiquidTemplate('{{ name }}', accessor), 'INVALID_CONTEXT');
  assert.equal(getterCalls, 0);
  for (const value of [() => 'customer-secret', new Date(), new Map(), Object.create({ name: 'customer-secret' })]) {
    expectTemplateError(() => renderLiquidTemplate('{{ value }}', { value }), 'INVALID_CONTEXT');
  }
  expectTemplateError(() => renderLiquidTemplate('{{ value }}', JSON.parse('{"__proto__":{"value":"customer-secret"}}')), 'UNSAFE_PROPERTY');
  expectTemplateError(() => renderLiquidTemplate('{{ value }}', { value: { toLiquid() { throw new Error('customer-secret'); } } }), 'UNSAFE_PROPERTY');
});

test('rejects cyclic, overdeep, oversized, and overlong collection inputs', () => {
  const cyclic = {};
  cyclic.self = cyclic;
  expectTemplateError(() => renderLiquidTemplate('hello', cyclic), 'INVALID_CONTEXT');
  let deep = 'leaf';
  for (let i = 0; i < 30; i++) deep = { next: deep };
  expectTemplateError(() => renderLiquidTemplate('{{ value }}', { value: deep }), 'CONTEXT_LIMIT');
  expectTemplateError(() => renderLiquidTemplate('{{ value }}', { value: 'x'.repeat(300000) }), 'CONTEXT_LIMIT');
  expectTemplateError(() => renderLiquidTemplate('{{ values.size }}', { values: new Array(10001).fill('x') }), 'CONTEXT_LIMIT');
});

test('bounds source size and nesting before recursive parsing', () => {
  expectTemplateError(() => inspectLiquidTemplate('x'.repeat(65537)), 'SOURCE_LIMIT');
  expectTemplateError(() => inspectLiquidTemplate('{% if true %}'.repeat(1000) + 'x' + '{% endif %}'.repeat(1000)), 'NESTING_LIMIT');
  expectTemplateError(() => inspectLiquidTemplate('{{ name' + '['.repeat(1000) + '"value"' + ']'.repeat(1000) + ' }}'), 'NESTING_LIMIT');
  expectTemplateError(() => inspectLiquidTemplate('{{ value' + '.nested'.repeat(50) + ' }}'), 'NESTING_LIMIT');
  expectTemplateError(() => inspectLiquidTemplate('{{x}}'.repeat(5000)), 'SOURCE_LIMIT');
});

test('rejects huge ranges before allocation and limits total loop iterations', () => {
  expectTemplateError(() => inspectLiquidTemplate('{% for n in (1..1000000000) %}{{ n }}{% endfor %}'), 'ITERATION_LIMIT');
  expectTemplateError(() => renderLiquidTemplate('{% for n in (start..finish) %}x{% endfor %}', { start: 1, finish: 1000000000 }), 'ITERATION_LIMIT');
  expectTemplateError(() => renderLiquidTemplate('{% for x in (1..100) %}{% for y in (1..100) %}{% endfor %}{% endfor %}', {}), 'ITERATION_LIMIT');
});

test('limits output and intermediate growth rather than truncating success', () => {
  assert.equal(renderLiquidTemplate('{{ name }}', { name: 'abcd' }, { maxOutputLength: 4 }), 'abcd');
  expectTemplateError(() => renderLiquidTemplate('{{ name }}', { name: 'abcde' }, { maxOutputLength: 4 }), 'OUTPUT_LIMIT');
  expectTemplateError(() => renderLiquidTemplate('12345', {}, { maxOutputLength: 4 }), 'OUTPUT_LIMIT');
  expectTemplateError(() => renderLiquidTemplate('{% capture a %}12345{% endcapture %}ok', {}, { maxOutputLength: 4 }), 'OUTPUT_LIMIT');
  expectTemplateError(() => renderLiquidTemplate('{% assign value = "12345678" %}{% for n in (1..100) %}{% assign value = value | append: value %}{% endfor %}', {}), 'OUTPUT_LIMIT');
  for (const maxOutputLength of [0, -1, Infinity, NaN, 300000]) {
    expectTemplateError(() => renderLiquidTemplate('x', {}, { maxOutputLength }), 'INVALID_OPTIONS');
  }
});

test('formats explicit dates in UTC but rejects implicit wall-clock dates', () => {
  const source = '{{ timestamp | date: "%Y-%m-%d %H:%M %z" }}';
  assert.equal(renderLiquidTemplate(source, { timestamp: '2026-11-05T03:04:00+09:00' }), '2026-11-04 18:04 +0000');
  for (const timestamp of ['now', 'today', 'yesterday', 'tomorrow', '11/05/2026']) {
    expectTemplateError(() => renderLiquidTemplate(source, { timestamp }), 'INVALID_DATE');
  }
  expectTemplateError(() => inspectLiquidTemplate('{{ "now" | date: "%Y" }}'), 'INVALID_DATE');
  expectTemplateError(() => renderLiquidTemplate('{{ timestamp | date: "%999999999Y" }}', { timestamp: '2026-11-05' }), 'OUTPUT_LIMIT');
});
