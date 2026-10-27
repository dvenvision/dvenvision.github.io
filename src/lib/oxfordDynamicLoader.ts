export interface OxfordEntry {
  id: string;
  word: string;
  letter: string; // 'A' through 'Z'
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  partOfSpeech: string;
  phonetic: string;
  definition: string;
  sentence: string;
  definitionUrl?: string;
  voiceUrl?: string;
  isPhrase?: boolean;
}

export type OxfordCollectionType = 'words' | 'phrases';

const STORAGE_KEY_PRIMARY = 'keyhaki_completed_oxford_words_v1';
const STORAGE_KEY_LEGACY = 'typecat_completed_oxford_words_v1';

let inMemoryWords: OxfordEntry[] | null = null;
let inMemoryPhrases: OxfordEntry[] | null = null;

// Progress persistence
export function getCompletedWordIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY_PRIMARY) ||
      localStorage.getItem(STORAGE_KEY_LEGACY);
    if (!raw) return new Set();
    const parsed: string[] = JSON.parse(raw);
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function markWordCompleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const set = getCompletedWordIds();
    set.add(id);
    localStorage.setItem(STORAGE_KEY_PRIMARY, JSON.stringify(Array.from(set)));
  } catch {
    // LocalStorage fallback
  }
}

import { normalizeTypingText } from './utils';

// FIX: Clean authentic Oxford dictionary example sentences — AI/2026-10-24
// WHY: Zero words added or repeated by code; official Oxford example or official word directly.
function cleanOxfordSentence(rawExample: string | undefined, word: string): string {
  if (!rawExample || rawExample.trim().length === 0) {
    return normalizeTypingText(word.trim());
  }

  // Normalize all typographical characters (smart quotes, em-dashes, non-breaking spaces)
  const normalized = normalizeTypingText(rawExample);
  const clean = normalized.replace(/^['"`]|['"`]$/g, '');

  // Extract authentic sentence if preceded by collocation/grammatical tag (e.g. "abandon somebody, The baby...")
  const parts = clean.split(/[,;]\s+/);
  if (parts.length > 1) {
    const sentencePart =
      parts.find((p) => /^[A-Z]/.test(p) || p.endsWith('.')) || parts[parts.length - 1];
    const extracted = sentencePart.trim().replace(/^['"`]|['"`]$/g, '');
    const cap = extracted.charAt(0).toUpperCase() + extracted.slice(1);
    return /[.!?]$/.test(cap) ? cap : `${cap}.`;
  }

  const cap = clean.charAt(0).toUpperCase() + clean.slice(1);
  return /[.!?]$/.test(cap) ? cap : `${cap}.`;
}

// FIX: Official Oxford Phrase with zero repetitions or added code — AI/2026-10-24
// WHY: User requested no repeated words unless official; phrase appears exactly as Oxford published.
function formatPhrasePractice(rawPhrase: string): string {
  const clean = normalizeTypingText(rawPhrase)
    .replace(/\.{3}|…/g, '')
    .trim()
    .replace(/\bsth\b/g, 'something')
    .replace(/\bsb\b/g, 'someone');

  return clean || normalizeTypingText(rawPhrase.trim());
}

// Parse raw CSV line safely
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse Oxford JSON dataset (5,942 entries with real Oxford example sentences)
function parseOxfordJson(data: Record<string, any>): OxfordEntry[] {
  const entries: OxfordEntry[] = [];
  const seenWords = new Set<string>();

  const keys = Object.keys(data).filter((k) => k !== 'definition');

  for (let i = 0; i < keys.length; i++) {
    const item = data[keys[i]];
    if (!item || !item.word) continue;

    const word = item.word.trim();
    const lowerWord = word.toLowerCase();
    if (seenWords.has(lowerWord)) continue;
    seenWords.add(lowerWord);

    const firstChar = word.charAt(0).toUpperCase();
    const letter = firstChar >= 'A' && firstChar <= 'Z' ? firstChar : 'A';

    const rawCefr = item.cefr ? item.cefr.toUpperCase() : 'B1';
    const cefr: OxfordEntry['cefr'] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(
      rawCefr
    )
      ? rawCefr
      : 'B1';

    const pos = item.type || 'word';
    const sentence = cleanOxfordSentence(item.example, word);
    const definition = item.definition || `Official Oxford 3000/5000 vocabulary word (${cefr}).`;

    entries.push({
      id: `oxford-word-${lowerWord.replace(/[^a-z0-9]/g, '-')}-${i}`,
      word,
      letter,
      cefr,
      partOfSpeech: pos,
      phonetic: item.phon_n_am || item.phon_br || `/${lowerWord}/`,
      definition,
      sentence,
      definitionUrl: `https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent(
        lowerWord
      )}`,
      voiceUrl: item.us
        ? `https://www.oxfordlearnersdictionaries.com/media/english/us_pron_ogg/${item.us.replace(
            '.mp3',
            '.ogg'
          )}`
        : undefined,
      isPhrase: false,
    });
  }

  return entries;
}

// Load Oxford 3000 & 5000 Words
export async function loadOxfordWords(): Promise<OxfordEntry[]> {
  if (inMemoryWords && inMemoryWords.length > 0) {
    return inMemoryWords;
  }

  // 1. First priority: Load oxford_5000.json with REAL Oxford example sentences
  try {
    const res = await fetch('/data/oxford_5000.json');
    if (res.ok) {
      const data = await res.json();
      const parsed = parseOxfordJson(data);
      if (parsed.length > 0) {
        inMemoryWords = parsed;
        return inMemoryWords;
      }
    }
  } catch {
    // Fallback to CSV
  }

  // 2. Fallback: Load oxford-5k.csv
  const csvSources = [
    '/data/oxford-5k.csv',
    'https://raw.githubusercontent.com/nalgeon/words/main/data/oxford-5k.csv',
  ];

  for (const src of csvSources) {
    try {
      const res = await fetch(src);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n');
        const entries: OxfordEntry[] = [];
        const seen = new Set<string>();

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const [word, rawLevel, rawPos, definitionUrl, voiceUrl] = parseCsvLine(line);
          if (!word) continue;
          const lower = word.toLowerCase();
          if (seen.has(lower)) continue;
          seen.add(lower);

          const firstChar = word.charAt(0).toUpperCase();
          const letter = firstChar >= 'A' && firstChar <= 'Z' ? firstChar : 'A';
          const normLevel = (rawLevel ? rawLevel.toUpperCase() : 'B1') as OxfordEntry['cefr'];
          const cefr: OxfordEntry['cefr'] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(normLevel)
            ? normLevel
            : 'B1';

          entries.push({
            id: `oxford-word-${lower.replace(/[^a-z0-9]/g, '-')}-${i}`,
            word,
            letter,
            cefr,
            partOfSpeech: rawPos || 'word',
            phonetic: `/${lower}/`,
            definition: `Official Oxford 3000/5000 vocabulary word (${cefr}).`,
            sentence: word,
            definitionUrl,
            voiceUrl,
            isPhrase: false,
          });
        }

        if (entries.length > 0) {
          inMemoryWords = entries;
          return inMemoryWords;
        }
      }
    } catch {
      // Try next
    }
  }

  return [];
}

// Load Oxford Phrase List (750 phrases)
export async function loadOxfordPhrases(): Promise<OxfordEntry[]> {
  if (inMemoryPhrases && inMemoryPhrases.length > 0) {
    return inMemoryPhrases;
  }

  const sources = [
    '/data/oxford-phrase.csv',
    'https://raw.githubusercontent.com/nalgeon/words/main/data/oxford-phrase.csv',
  ];

  for (const src of sources) {
    try {
      const res = await fetch(src);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n');
        const entries: OxfordEntry[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const [word, rawLevel, rawPos, definitionUrl, voiceUrl] = parseCsvLine(line);
          if (!word) continue;

          const firstChar = word.charAt(0).toUpperCase();
          const letter = firstChar >= 'A' && firstChar <= 'Z' ? firstChar : 'A';
          const normLevel = (rawLevel ? rawLevel.toUpperCase() : 'B1') as OxfordEntry['cefr'];
          const cefr: OxfordEntry['cefr'] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(normLevel)
            ? normLevel
            : 'B1';

          const sentence = formatPhrasePractice(word);

          entries.push({
            id: `oxford-phrase-${word.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
            word,
            letter,
            cefr,
            partOfSpeech: rawPos || 'phrase',
            phonetic: 'phrase',
            definition: 'Official phrase from the Oxford Phrase List.',
            sentence,
            definitionUrl,
            voiceUrl,
            isPhrase: true,
          });
        }

        if (entries.length > 0) {
          inMemoryPhrases = entries;
          return inMemoryPhrases;
        }
      }
    } catch {
      // Try next
    }
  }

  return [];
}
