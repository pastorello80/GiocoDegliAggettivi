export type Booster = 'J' | 'E' | 'T' | '5' | null;
export type Receipt = { id: string; at: string; words: string[]; booster: Booster };
export type Draft = { words: string[]; booster: Booster; receipt: Receipt | null };
export const STORAGE_KEY = 'aggettivi.demo.v1';
export const emptyDraft = (): Draft => ({ words: Array(10).fill(''), booster: null, receipt: null });
export const requiredWords = (booster: Booster) => booster === 'E' || booster === '5' ? 10 : 5;
export const normalize = (word: string) => word.normalize('NFC').trim().toLocaleLowerCase('it');

export function validateWords(words: string[], booster: Booster, initial = 'C'): string | null {
  const selected = words.slice(0, requiredWords(booster));
  if (selected.length !== requiredWords(booster) || selected.some(w => !normalize(w))) return `Completa tutti i ${requiredWords(booster)} aggettivi prima di confermare.`;
  if (selected.some(w => !normalize(w).startsWith(normalize(initial)))) return `Tutti gli aggettivi devono iniziare con la lettera ${initial}.`;
  if (selected.some(w => /\s/.test(normalize(w)))) return 'Inserisci una parola per posizione, senza locuzioni.';
  if (new Set(selected.map(normalize)).size !== selected.length) return 'Hai ripetuto un aggettivo. Ogni parola deve essere diversa.';
  return null;
}

export function parseDraft(raw: string | null): Draft {
  if (!raw) return emptyDraft();
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return emptyDraft();
    const d = value as Record<string, unknown>;
    if (!Array.isArray(d.words) || d.words.length !== 10 || !d.words.every(w => typeof w === 'string' && w.length <= 64)) return emptyDraft();
    if (d.booster !== null && !['J', 'E', 'T', '5'].includes(String(d.booster))) return emptyDraft();
    const booster = d.booster as Booster;
    let receipt: Receipt | null = null;
    const r = d.receipt as Record<string, unknown> | null;
    if (r && typeof r.id === 'string' && r.id.startsWith('DEMO-') && typeof r.at === 'string' && Number.isFinite(Date.parse(r.at)) && Array.isArray(r.words) && r.words.every(w => typeof w === 'string' && w.length <= 64) && (r.booster === null || ['J', 'E', 'T', '5'].includes(String(r.booster))) && r.words.length === requiredWords(r.booster as Booster)) {
      receipt = { id: r.id, at: r.at, words: r.words, booster: r.booster as Booster };
    }
    return { words: d.words, booster, receipt };
  } catch { return emptyDraft(); }
}

export function sameAsReceipt(words: string[], booster: Booster, receipt: Receipt | null) {
  return !!receipt && booster === receipt.booster && JSON.stringify(words.slice(0, requiredWords(booster)).map(w => w.trim())) === JSON.stringify(receipt.words);
}

export function moveWord(words: string[], from: number, to: number, visibleCount: number) {
  if (from < 0 || to < 0 || from >= visibleCount || to >= visibleCount) return [...words];
  const next = [...words];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}
