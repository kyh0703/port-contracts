const assert = require('node:assert/strict');
const test = require('node:test');
const { SttRuntime } = require('../dist/gen/ts/port/api/v1/voice_runtime.js');

// Captured from the pinned v10 encoder, including explicit multilingual=false and diarization=true.
const legacyHex = '3a0c6f726967696e616c2d73747412097374742d72742d76351a026b6f2206ebb288ed98b82a06736f6e696f7830004001';

test('preserves a v10 original STT pin without inventing an endpoint policy', () => {
  const pin = SttRuntime.decode(Buffer.from(legacyHex, 'hex'));
  assert.equal(pin.sonioxEndpointing, undefined);
  assert.equal(pin.multilingual, false);
  assert.equal(pin.speakerDiarization, true);
  assert.equal(Buffer.from(SttRuntime.encode(pin).finish()).toString('hex'), legacyHex);
});

for (const [name, suffix, expected] of [
  ['server defaults with zero controls', '4a05080120d00f', { serverTurnDetection: true, latencyAdjustmentLevel: 0, sensitivity: 0, maxDelayMs: 2000 }],
  ['aggressive server controls', '4a100801100219333333333333d33f20f403', { serverTurnDetection: true, latencyAdjustmentLevel: 2, sensitivity: 0.3, maxDelayMs: 500 }],
  ['inactive prepared controls', '4a0e100219333333333333d33f20f403', { serverTurnDetection: false, latencyAdjustmentLevel: 2, sensitivity: 0.3, maxDelayMs: 500 }],
]) {
  test(`decodes ${name} on field 9 without disturbing legacy original pins`, () => {
    const bytes = Buffer.from(legacyHex + suffix, 'hex');
    const pin = SttRuntime.decode(bytes);
    assert.deepEqual(pin.sonioxEndpointing, expected);
    assert.equal(pin.leaseId, 'original-stt');
    assert.equal(pin.speakerDiarization, true);
    assert.equal(Buffer.from(SttRuntime.encode(pin).finish()).toString('hex'), legacyHex + suffix);
  });
}
