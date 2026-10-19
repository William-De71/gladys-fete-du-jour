// Four languages everywhere: the runtime texts, the manifest (except the
// first names of the filter, proper nouns), the documentation and the README.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LANGUAGES, TEXTS } from '../src/i18n.js';
import { guessLanguage } from '../src/config.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const manifest = JSON.parse(read('../gladys-assistant-integration.json'));

test('every runtime text exists in the four languages, with the same placeholders', () => {
  for (const [key, entry] of Object.entries(TEXTS)) {
    const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const language of LANGUAGES) {
      assert.ok(entry[language], `${key}.${language}`);
      assert.deepEqual(placeholders(entry[language]), placeholders(entry.en), `${key}.${language}`);
    }
  }
});

/**
 * @description Every multi-language object of the manifest, with its path.
 * @param {unknown} node - A part of the manifest.
 * @param {string} path - Its path.
 * @returns {Array<[string, object]>} The objects.
 */
function texts(node, path = '') {
  if (Array.isArray(node)) return node.flatMap((item, i) => texts(item, `${path}[${i}]`));
  if (node === null || typeof node !== 'object') return [];
  if (typeof node.en === 'string') return [[path, node]];
  return Object.entries(node).flatMap(([key, value]) => texts(value, `${path}.${key}`));
}

test('every manifest text has the four languages (first names: one label)', () => {
  for (const [path, value] of texts(manifest)) {
    if (/name_key|\.fields\[0\]\.options/.test(path) && path.includes('scene_triggers')) continue;
    for (const language of LANGUAGES) {
      assert.ok(value[language], `${path}.${language}`);
    }
  }
});

test('documentation and README in the four languages', () => {
  for (const language of LANGUAGES) {
    assert.ok(existsSync(new URL(`../docs/${language}.md`, import.meta.url)), language);
    const readme = language === 'en' ? 'README.md' : `README.${language}.md`;
    assert.ok(existsSync(new URL(`../${readme}`, import.meta.url)), readme);
  }
});

test('the automatic language is guessed from the timezone before any widget', () => {
  assert.deepEqual(
    [
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Madrid',
      'America/Argentina/Cordoba',
      'Asia/Tokyo',
    ].map(guessLanguage),
    ['fr', 'de', 'es', 'es', 'en'],
  );
});
