import { z } from 'zod';

const DEFAULT_MIN_SIMILARITY = 0.8;
const DEFAULT_MIN_MARGIN = 0.15;
const MAX_TOTAL_ENTRIES = 5000;
const MAX_CANDIDATES = 3;
// Unit-interval ratios and their difference may accumulate a few ulps of round-off.
const SCORE_COMPARISON_TOLERANCE = Number.EPSILON * 4;
const CONTROL_CHARACTERS = /\p{Cc}/u;
const IGNORED_COMPARISON_CHARACTERS = /[\s\p{White_Space}.,?!·…‥"'`~]/gu;

function snapshotTextSchema(maxCodePoints: number) {
  return z.string().refine(value => {
    if (!value.length || value.length > maxCodePoints * 2 || value !== value.trim() ||
      !value.isWellFormed() || CONTROL_CHARACTERS.test(value)) return false;
    let length = 0;
    for (let index = 0; index < value.length; index += 1) {
      length += 1;
      if (length > maxCodePoints) return false;
      if (value.codePointAt(index)! > 0xffff) index += 1;
    }
    return true;
  }, { message: `Expected trimmed, nonempty, well-formed Unicode text of at most ${maxCodePoints} code points without control characters.` });
}

const phoneticCorrectionEntrySchema = z.strictObject({
  value: snapshotTextSchema(128),
  aliases: z.array(snapshotTextSchema(128)).max(20),
});
export type PhoneticCorrectionEntry = z.infer<typeof phoneticCorrectionEntrySchema>;

const phoneticCorrectionListSchema = z.strictObject({
  tag: snapshotTextSchema(64),
  entries: z.array(phoneticCorrectionEntrySchema).min(1).max(1000),
}).superRefine((list, context) => {
  const values = new Set<string>();
  for (let index = 0; index < list.entries.length; index += 1) {
    const value = list.entries[index].value;
    if (values.has(value)) context.addIssue({
      code: 'custom', path: ['entries', index, 'value'], message: 'Duplicate canonical value within a phonetic correction tag.',
    });
    values.add(value);
  }
});
export type PhoneticCorrectionList = z.infer<typeof phoneticCorrectionListSchema>;

export const phoneticCorrectionConfigSchema = z.strictObject({
  lists: z.array(phoneticCorrectionListSchema).min(1).max(32),
  minSimilarity: z.number().finite().min(0.5).max(1).optional(),
  minMargin: z.number().finite().gt(0).max(1).optional(),
}).superRefine((config, context) => {
  const tags = new Set<string>();
  let totalEntries = 0;
  for (let index = 0; index < config.lists.length; index += 1) {
    const list = config.lists[index];
    if (tags.has(list.tag)) context.addIssue({
      code: 'custom', path: ['lists', index, 'tag'], message: 'Duplicate phonetic correction tag.',
    });
    tags.add(list.tag);
    totalEntries += list.entries.length;
  }
  if (totalEntries > MAX_TOTAL_ENTRIES) context.addIssue({
    code: 'custom', path: ['lists'], message: `Phonetic correction lists may contain at most ${MAX_TOTAL_ENTRIES} entries in total.`,
  });
});
export type PhoneticCorrectionConfig = z.infer<typeof phoneticCorrectionConfigSchema>;

export type PhoneticCorrectionResult = {
  status: 'resolved' | 'needs_clarification' | 'not_found' | 'unknown_tag';
  tag: string;
  input: string;
  value: string | null;
  matchType: 'exact' | 'alias' | 'phonetic' | null;
  candidates: Array<{ value: string; score: number }>;
};

type Candidate = PhoneticCorrectionResult['candidates'][number];
type CompiledEntry = {
  readonly value: string;
  readonly canonical: string;
  readonly terms: readonly (readonly number[])[];
};
type CompiledList = {
  readonly entries: readonly CompiledEntry[];
  readonly exactMatches: ReadonlyMap<string, readonly CompiledEntry[]>;
  readonly maxTermLength: number;
};
type DistanceRows = { previous: Uint32Array; current: Uint32Array };

const COMPOUND_JAMO: Readonly<Record<string, string>> = {
  'ㅐ': 'ㅏㅣ', 'ㅒ': 'ㅑㅣ', 'ㅔ': 'ㅓㅣ', 'ㅖ': 'ㅕㅣ',
  'ㅘ': 'ㅗㅏ', 'ㅙ': 'ㅗㅏㅣ', 'ㅚ': 'ㅗㅣ',
  'ㅝ': 'ㅜㅓ', 'ㅞ': 'ㅜㅓㅣ', 'ㅟ': 'ㅜㅣ', 'ㅢ': 'ㅡㅣ',
  'ㄳ': 'ㄱㅅ', 'ㄵ': 'ㄴㅈ', 'ㄶ': 'ㄴㅎ', 'ㄺ': 'ㄹㄱ', 'ㄻ': 'ㄹㅁ',
  'ㄼ': 'ㄹㅂ', 'ㄽ': 'ㄹㅅ', 'ㄾ': 'ㄹㅌ', 'ㄿ': 'ㄹㅍ', 'ㅀ': 'ㄹㅎ',
  'ㅄ': 'ㅂㅅ',
  'ㄲ': 'ㄱㄱ', 'ㄸ': 'ㄷㄷ', 'ㅃ': 'ㅂㅂ', 'ㅆ': 'ㅅㅅ', 'ㅉ': 'ㅈㅈ',
};
function expandJamo(jamo: string): readonly number[] {
  return Array.from(COMPOUND_JAMO[jamo] ?? jamo, character => character.codePointAt(0)!);
}
const INITIAL_JAMO = Array.from('ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', expandJamo);
const MEDIAL_JAMO = Array.from('ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ', expandJamo);
const FINAL_JAMO = Array.from(' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ', jamo => jamo === ' ' ? [] : expandJamo(jamo));
const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;
const MEDIAL_COUNT = 21;
const FINAL_COUNT = 28;

function normalizeTerm(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(IGNORED_COMPARISON_CHARACTERS, '');
}

function decomposeTerm(text: string, maxLength = Number.POSITIVE_INFINITY): number[] {
  const decomposed: number[] = [];
  for (const character of text) {
    const codePoint = character.codePointAt(0)!;
    if (codePoint >= HANGUL_BASE && codePoint <= HANGUL_LAST) {
      const offset = codePoint - HANGUL_BASE;
      decomposed.push(
        ...INITIAL_JAMO[Math.floor(offset / (MEDIAL_COUNT * FINAL_COUNT))],
        ...MEDIAL_JAMO[Math.floor(offset / FINAL_COUNT) % MEDIAL_COUNT],
        ...FINAL_JAMO[offset % FINAL_COUNT],
      );
    } else {
      decomposed.push(codePoint);
    }
    // No full-term match can reach the acceptance threshold beyond this length.
    if (decomposed.length > maxLength) return [];
  }
  return decomposed;
}

function compileList(list: PhoneticCorrectionList): CompiledList {
  const termsByText = new Map<string, readonly number[]>();
  const exactMatches = new Map<string, CompiledEntry[]>();
  const entries: CompiledEntry[] = [];
  let maxTermLength = 0;
  for (const entry of list.entries) {
    const canonical = normalizeTerm(entry.value);
    const normalizedTerms = new Set([canonical]);
    for (const alias of entry.aliases) normalizedTerms.add(normalizeTerm(alias));
    normalizedTerms.delete('');
    const terms: (readonly number[])[] = [];
    const compiledEntry: CompiledEntry = { value: entry.value, canonical, terms };
    for (const text of normalizedTerms) {
      let decomposed = termsByText.get(text);
      if (!decomposed) {
        decomposed = decomposeTerm(text);
        termsByText.set(text, decomposed);
        maxTermLength = Math.max(maxTermLength, decomposed.length);
      }
      terms.push(decomposed);
      const matches = exactMatches.get(text);
      if (matches) matches.push(compiledEntry);
      else exactMatches.set(text, [compiledEntry]);
    }
    entries.push(compiledEntry);
  }
  return { entries, exactMatches, maxTermLength };
}

function boundedEditDistance(
  left: readonly number[], right: readonly number[], maxDistance: number, rows: DistanceRows,
): number {
  const columns = left.length <= right.length ? left : right;
  const lines = left.length <= right.length ? right : left;
  const outsideBand = maxDistance + 1;
  if (lines.length - columns.length > maxDistance) return outsideBand;
  let previous = rows.previous;
  let current = rows.current;
  previous.fill(outsideBand, 0, columns.length + 1);
  for (let column = 0; column <= Math.min(columns.length, maxDistance); column += 1) previous[column] = column;
  for (let line = 1; line <= lines.length; line += 1) {
    const firstColumn = Math.max(1, line - maxDistance);
    const lastColumn = Math.min(columns.length, line + maxDistance);
    current[0] = line <= maxDistance ? line : outsideBand;
    if (firstColumn > 1) current[firstColumn - 1] = outsideBand;
    let rowMinimum = current[0];
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const distance = Math.min(
        previous[column] + 1,
        current[column - 1] + 1,
        previous[column - 1] + (lines[line - 1] === columns[column - 1] ? 0 : 1),
      );
      current[column] = distance;
      rowMinimum = Math.min(rowMinimum, distance);
    }
    if (lastColumn < columns.length) current[lastColumn + 1] = outsideBand;
    if (rowMinimum > maxDistance) return outsideBand;
    const swap = previous;
    previous = current;
    current = swap;
  }
  return previous[columns.length];
}

function belowThreshold(score: number, threshold: number): boolean {
  return threshold - score > SCORE_COMPARISON_TOLERANCE;
}

function insertCandidate(candidates: Candidate[], value: string, score: number): void {
  let index = 0;
  while (index < candidates.length && candidates[index].score >= score) index += 1;
  if (index >= MAX_CANDIDATES) return;
  candidates.splice(index, 0, { value, score });
  if (candidates.length > MAX_CANDIDATES) candidates.pop();
}

function rankPhoneticCandidates(list: CompiledList, input: readonly number[], minScore: number): Candidate[] {
  const candidates: Candidate[] = [];
  const rowLength = Math.min(input.length, list.maxTermLength) + 1;
  const rows: DistanceRows = { previous: new Uint32Array(rowLength), current: new Uint32Array(rowLength) };
  for (const entry of list.entries) {
    let bestScore = 0;
    const rankingFloor = Math.max(minScore, candidates[MAX_CANDIDATES - 1]?.score ?? 0);
    for (const term of entry.terms) {
      const longest = Math.max(input.length, term.length);
      const cutoff = Math.max(rankingFloor, bestScore);
      if (belowThreshold(1 - Math.abs(input.length - term.length) / longest, cutoff)) continue;
      // Ceil admits at most one extra edit and avoids rounding away a threshold-equal match.
      const maxDistance = Math.ceil((1 - cutoff) * longest);
      const distance = boundedEditDistance(input, term, maxDistance, rows);
      if (distance > maxDistance) continue;
      bestScore = Math.max(bestScore, 1 - distance / longest);
      if (bestScore === 1) break;
    }
    if (entry.terms.length && !belowThreshold(bestScore, rankingFloor)) insertCandidate(candidates, entry.value, bestScore);
  }
  return candidates;
}

function unresolvedResult(
  status: Exclude<PhoneticCorrectionResult['status'], 'resolved'>,
  tag: string, input: string, candidates: Candidate[] = [],
): PhoneticCorrectionResult {
  return { status, tag, input, value: null, matchType: null, candidates };
}

/** Validates and compiles a detached, tag-scoped snapshot; calls perform no I/O. */
export function createPhoneticCorrector(
  config: PhoneticCorrectionConfig,
): (tag: string, input: string) => PhoneticCorrectionResult {
  const snapshot = phoneticCorrectionConfigSchema.parse(config);
  const lists = new Map(snapshot.lists.map(list => [list.tag, compileList(list)]));
  const minSimilarity = snapshot.minSimilarity ?? DEFAULT_MIN_SIMILARITY;
  const minMargin = snapshot.minMargin ?? DEFAULT_MIN_MARGIN;
  // A runner-up below minSimilarity can still make the winning margin too narrow.
  const relevantScoreFloor = Math.max(0, minSimilarity - minMargin);
  return (tag, input) => {
    const list = lists.get(tag);
    if (!list) return unresolvedResult('unknown_tag', tag, input);
    if (!input.isWellFormed()) return unresolvedResult('not_found', tag, input);
    const normalized = normalizeTerm(input);
    if (!normalized) return unresolvedResult('not_found', tag, input);
    const exactMatches = list.exactMatches.get(normalized);
    if (exactMatches) {
      const candidates = exactMatches.slice(0, MAX_CANDIDATES).map(entry => ({ value: entry.value, score: 1 }));
      if (exactMatches.length > 1) return unresolvedResult('needs_clarification', tag, input, candidates);
      const entry = exactMatches[0];
      return {
        status: 'resolved', tag, input, value: entry.value,
        matchType: entry.canonical === normalized ? 'exact' : 'alias', candidates,
      };
    }
    const decomposed = decomposeTerm(normalized, Math.ceil(list.maxTermLength / minSimilarity));
    if (!decomposed.length) return unresolvedResult('not_found', tag, input);
    const candidates = rankPhoneticCandidates(list, decomposed, relevantScoreFloor);
    const best = candidates[0];
    if (!best || belowThreshold(best.score, minSimilarity)) return unresolvedResult('not_found', tag, input);
    const margin = best.score - (candidates[1]?.score ?? 0);
    if (margin === 0 || belowThreshold(margin, minMargin)) {
      return unresolvedResult('needs_clarification', tag, input, candidates);
    }
    return { status: 'resolved', tag, input, value: best.value, matchType: 'phonetic', candidates };
  };
}

function pronunciationText(maxCodePoints: number) {
  return z.string().refine(value => {
    if (!value.length || value.length > maxCodePoints * 2 || value !== value.trim()
      || !value.isWellFormed() || /\p{Cc}/u.test(value)) return false;
    let length = 0;
    for (let index = 0; index < value.length; index++) {
      if (++length > maxCodePoints) return false;
      if (value.codePointAt(index)! > 0xffff) index++;
    }
    return true;
  }, { message: `Expected trimmed, nonempty Unicode text of at most ${maxCodePoints} code points without controls.` });
}

export const ttsPronunciationConfigSchema = z.strictObject({
  entries: z.array(z.strictObject({ text: pronunciationText(128), pronunciation: pronunciationText(256) })).min(1).max(200),
}).superRefine((config, context) => {
  const seen = new Set<string>();
  for (let index = 0; index < config.entries.length; index++) {
    const text = config.entries[index]!.text;
    if (seen.has(text)) context.addIssue({ code: 'custom', path: ['entries', index, 'text'], message: 'Duplicate TTS pronunciation text.' });
    seen.add(text);
  }
});

type Rule = { text: string; pronunciation: string; leftBoundary: boolean; rightBoundary: boolean };
const latinWordEdge = (character: string): boolean => /^[A-Za-z_]$/.test(character);

export type TtsPronunciationTransformer = {
  transform(chunk: string, final: boolean): string;
  clear(): void;
};

function createTtsPronunciationTransformer(rules: ReadonlyMap<string, readonly Rule[]>): TtsPronunciationTransformer {
  let pending = '';
  let previous = '';

  function transform(chunk: string, final: boolean): string {
    const text = pending + chunk;
    let offset = 0;
    let copiedThrough = 0;
    let output = '';
    scan: while (offset < text.length) {
      const candidates = rules.get(text[offset]!);
      if (candidates) for (const rule of candidates) {
        if (rule.leftBoundary && latinWordEdge(previous)) continue;
        const remaining = text.length - offset;
        if (remaining < rule.text.length) {
          if (!final && rule.text.startsWith(text.slice(offset))) break scan;
          continue;
        }
        if (!text.startsWith(rule.text, offset)) continue;
        const end = offset + rule.text.length;
        if (rule.rightBoundary) {
          if (end === text.length && !final) break scan;
          if (latinWordEdge(text[end] ?? '')) continue;
        }
        output += text.slice(copiedThrough, offset) + rule.pronunciation;
        previous = text[end - 1]!;
        offset = end;
        copiedThrough = end;
        continue scan;
      }
      // Never split a Unicode scalar merely because the upstream chunk split it.
      const code = text.charCodeAt(offset);
      if (!final && offset === text.length - 1 && code >= 0xd800 && code <= 0xdbff) break;
      previous = text[offset]!;
      offset++;
    }
    output += text.slice(copiedThrough, offset);
    // Only a possible rule prefix (at most 128 codepoints) survives a source chunk.
    pending = text.slice(offset);
    return output;
  }

  return { transform, clear() { pending = ''; } };
}

/** Validates and compiles a detached pronunciation snapshot, without any I/O. */
export function compileTtsPronunciation(config: z.infer<typeof ttsPronunciationConfigSchema>): {
  entries: ReadonlyArray<Readonly<{ text: string; pronunciation: string }>>;
  createTransformer(): TtsPronunciationTransformer;
} {
  const entries = ttsPronunciationConfigSchema.parse(config).entries.sort((left, right) =>
    right.text.length - left.text.length || (left.text < right.text ? -1 : left.text > right.text ? 1 : 0));
  const rules = new Map<string, Rule[]>();
  for (const entry of entries) {
    const first = entry.text[0]!;
    let candidates = rules.get(first);
    if (!candidates) { candidates = []; rules.set(first, candidates); }
    candidates.push({ ...entry, leftBoundary: latinWordEdge(first), rightBoundary: latinWordEdge(entry.text.at(-1)!) });
  }
  return { entries, createTransformer: () => createTtsPronunciationTransformer(rules) };
}
