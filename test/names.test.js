// The name day of a day from both sources, its title and its sentence, in
// the four languages.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nameDay, dayTitle, daySummary } from '../src/names.js';

const api = (names) => (key) => names[key] ?? null;

test('the list, or fetedujour.fr for an ordinary day it read', () => {
  assert.deepEqual(nameDay('2026-04-28'), {
    date: '2026-04-28',
    name: 'Valérie',
    feast: null,
    key: 'valerie',
    source: 'list',
  });
  const read = api({ '04-28': 'Valérie (API)', '07-14': 'Fête nationale' });
  assert.deepEqual(nameDay('2026-04-28', read), {
    date: '2026-04-28',
    name: 'Valérie (API)',
    feast: null,
    key: 'valerie',
    source: 'api',
  });
  // A feast of the list stays as the list writes it.
  assert.equal(nameDay('2026-07-14', read).name, 'Camille');
  assert.equal(nameDay('2026-07-14', read).source, 'list');
  // Not read yet: the list.
  assert.equal(nameDay('2026-04-29', read).source, 'list');
});

test('titles and sentences', () => {
  const valerie = nameDay('2026-04-28');
  const camille = nameDay('2026-07-14');
  const toussaint = nameDay('2026-11-01');
  assert.equal(dayTitle(valerie, 'fr'), 'Bonne fête Valérie');
  assert.equal(dayTitle(valerie, 'de'), 'Namenstag: Valérie');
  assert.equal(dayTitle(camille, 'fr'), 'Fête nationale · Bonne fête Camille');
  assert.equal(dayTitle(toussaint, 'es'), 'Toussaint');
  assert.equal(daySummary(valerie, 'today', 'fr'), 'Aujourd’hui, nous fêtons les Valérie.');
  assert.equal(daySummary(valerie, 'tomorrow', 'en'), 'Tomorrow is the name day of Valérie.');
  assert.equal(
    daySummary(camille, 'today', 'fr'),
    'Aujourd’hui : Fête nationale, et nous fêtons les Camille.',
  );
  assert.equal(daySummary(toussaint, 'tomorrow', 'de'), 'Morgen: Toussaint.');
  assert.equal(daySummary(valerie, 'today', 'es'), 'Hoy es el santo de Valérie.');
});
