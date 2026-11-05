const assert = require('node:assert/strict');
const { it } = require('node:test');

const {
  createPhoneticCorrector,
  compileTtsPronunciation,
  phoneticCorrectionConfigSchema,
  ttsPronunciationConfigSchema,
} = require('@overthinker1127/port-contracts/speech-correction');

it('resolves normalized and alias terms within a tag without guessing ambiguous matches', () => {
  const correct = createPhoneticCorrector({ lists: [
    { tag: 'stores', entries: [
      { value: 'Alpha', aliases: ['공통'] },
      { value: 'Beta', aliases: ['공통', '베타점'] },
    ] },
    { tag: 'other', entries: [{ value: 'Gamma', aliases: ['공통'] }] },
  ] });
  assert.deepEqual(correct('stores', ' ＡＬＰＨＡ! '), {
    status: 'resolved', tag: 'stores', input: ' ＡＬＰＨＡ! ', value: 'Alpha',
    matchType: 'exact', candidates: [{ value: 'Alpha', score: 1 }],
  });
  assert.equal(correct('stores', '베타점').matchType, 'alias');
  assert.deepEqual(correct('stores', '공통').candidates, [
    { value: 'Alpha', score: 1 }, { value: 'Beta', score: 1 },
  ]);
  assert.equal(correct('stores', '공통').status, 'needs_clarification');
  assert.equal(correct('other', '공통').value, 'Gamma');
  assert.equal(correct('stores', 'zzzzzz').status, 'not_found');
  assert.equal(correct('missing', '공통').status, 'unknown_tag');
});

it('keeps threshold-equal winners and genuinely narrower margins distinct', () => {
  const config = { minSimilarity: 0.8, minMargin: 0.15, lists: [{ tag: 'code', entries: [
    { value: 'b' + 'a'.repeat(19), aliases: [] },
    { value: 'bbbb' + 'a'.repeat(16), aliases: [] },
  ] }] };
  assert.equal(createPhoneticCorrector(config)('code', 'a'.repeat(20)).status, 'resolved');
  config.lists[0].entries[1].value = 'bbb' + 'a'.repeat(17);
  assert.equal(createPhoneticCorrector(config)('code', 'a'.repeat(20)).status, 'needs_clarification');
});

it('transforms chunk splits with the same literal boundaries, case and longest-match behavior', () => {
  const compiled = compileTtsPronunciation({ entries: [
    { text: 'ml', pronunciation: '밀리리터' },
    { text: 'ml/min', pronunciation: '분당 밀리리터' },
    { text: '밀리리터', pronunciation: '재치환 금지' },
  ] });
  const source = '500ml를 html ML mlword ml/min ml';
  const expected = '500밀리리터를 html ML mlword 분당 밀리리터 밀리리터';
  for (let split = 0; split <= source.length; split++) {
    const transformer = compiled.createTransformer();
    assert.equal(transformer.transform(source.slice(0, split), false) + transformer.transform(source.slice(split), true), expected, `split ${split}`);
  }
  const transformer = compiled.createTransformer();
  assert.equal(source.split('').map(character => transformer.transform(character, false)).join('') + transformer.transform('', true), expected);
});

it('rejects incomplete and duplicate runtime configuration', () => {
  assert.equal(phoneticCorrectionConfigSchema.safeParse({ lists: [{ tag: '', entries: [] }] }).success, false);
  assert.equal(ttsPronunciationConfigSchema.safeParse({ entries: [{ text: 'ml', pronunciation: '' }] }).success, false);
  assert.equal(ttsPronunciationConfigSchema.safeParse({ entries: [
    { text: 'ml', pronunciation: '밀리리터' }, { text: 'ml', pronunciation: '엠엘' },
  ] }).success, false);
});
