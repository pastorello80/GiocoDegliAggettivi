import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDraft, moveWord, normalize, parseDraft, requiredWords, sameAsReceipt, validateWords } from './game.ts';

const words = ['Contabile', 'Cartaceo', 'Commerciale', 'Catastale', 'Criptato'];
test('requires ten entries only for the two extending boosters', () => {
  assert.equal(requiredWords(null), 5);
  assert.equal(requiredWords('J'), 5);
  assert.equal(requiredWords('T'), 5);
  assert.equal(requiredWords('E'), 10);
  assert.equal(requiredWords('5'), 10);
  assert.match(validateWords(words, 'E')!, /10/);
});
test('validates completeness, initial, duplicates and locutions without judging grammar', () => {
  assert.equal(validateWords(words, null), null);
  assert.match(validateWords(['', ...words.slice(1)], null)!, /Completa/);
  assert.match(validateWords(['Bello', ...words.slice(1)], null)!, /lettera C/);
  assert.match(validateWords([' cartaceo ', ...words.slice(1)], null)!, /ripetuto/);
  assert.match(validateWords(['Carta bella', ...words.slice(1)], null)!, /locuzioni/);
  assert.notEqual(normalize('Blu'), normalize('Bleu'));
});
test('reordering exchanges positions without losing words or crossing visible bounds', () => {
  const all = [...words, 'Celato', 'Centrato', 'Civile', 'Comunale', 'Codificato'];
  assert.deepEqual(moveWord(all, 0, 1, 5).slice(0, 2), [words[1], words[0]]);
  assert.deepEqual(moveWord(all, 4, 5, 5), all);
  assert.deepEqual(all.slice(0, 5), words);
});
test('corrupt local data is discarded without breaking startup', () => {
  assert.deepEqual(parseDraft('{'), emptyDraft());
  assert.deepEqual(parseDraft(JSON.stringify({ words: [1], booster: 'X' })), emptyDraft());
  assert.deepEqual(parseDraft(null), emptyDraft());
});
test('a receipt does not validate later edits or a different booster', () => {
  const receipt = { id: 'DEMO-123', at: '2026-11-16T10:00:00.000Z', words, booster: null };
  assert.equal(sameAsReceipt([...words, ...Array(5).fill('')], null, receipt), true);
  assert.equal(sameAsReceipt(words, 'J', receipt), false);
  assert.equal(sameAsReceipt(['Civile', ...words.slice(1)], null, receipt), false);
  const data = { words: [...words, ...Array(5).fill('')], booster: null, receipt };
  assert.deepEqual(parseDraft(JSON.stringify(data)), data);
});
