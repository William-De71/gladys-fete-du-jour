// The built-in list: every day of a leap year, the corrections made to the
// source list, the keys of the scene filter.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CALENDAR, dayEntry, nameKey, allNames } from '../src/days.js';
import { allMonthDays } from '../src/dates.js';

test('366 days, a name or a feast each', () => {
  assert.deepEqual(
    CALENDAR.map((days) => days.length),
    [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  );
  for (const key of allMonthDays()) {
    const [month, day] = key.split('-').map(Number);
    const entry = dayEntry(month, day);
    assert.ok(entry.name || entry.feast, key);
    assert.ok(!entry.name || entry.name.length <= 60, key);
  }
  assert.equal(dayEntry(2, 30), null);
  assert.equal(dayEntry(13, 1), null);
  assert.deepEqual(dayEntry(2, 29), { name: 'Auguste', feast: null, key: 'auguste' });
});

test('the corrections of the source list', () => {
  const name = (month, day) => dayEntry(month, day).name;
  // Movable feasts and astronomy never sit on a fixed day.
  for (const days of CALENDAR) {
    for (const raw of days) {
      const text = JSON.stringify(raw);
      assert.doesNotMatch(text, /Solstice|Equinoxe|Équinoxe|Cendres|Présention/i, text);
    }
  }
  assert.equal(name(2, 21), 'Pierre Damien');
  assert.equal(name(6, 21), 'Gonzague');
  assert.equal(name(9, 23), 'Constant');
  assert.equal(name(12, 21), 'Pierre Canisius');
  assert.equal(name(5, 30), 'Ferdinand');
  assert.equal(name(5, 31), 'Pétronille');
  assert.equal(name(8, 2), 'Julien Eymard');
  assert.deepEqual([name(1, 5), name(5, 18), name(12, 26)], ['Édouard', 'Éric', 'Étienne']);
  assert.deepEqual([name(2, 7), name(10, 17), name(11, 27)], ['Eugénie', 'Baudouin', 'Séverin']);
});

test('feasts, with the first name celebrated on that day when there is one', () => {
  assert.deepEqual(dayEntry(11, 11), { name: 'Martin', feast: 'Armistice 1918', key: 'martin' });
  assert.deepEqual(dayEntry(7, 14), { name: 'Camille', feast: 'Fête nationale', key: 'camille' });
  assert.deepEqual(dayEntry(8, 15), { name: 'Marie', feast: 'Assomption', key: 'marie' });
  assert.deepEqual(dayEntry(11, 1), { name: null, feast: 'Toussaint', key: null });
  assert.deepEqual(dayEntry(12, 25), { name: 'Emmanuel', feast: 'Noël', key: 'emmanuel' });
});

test('keys: lower case, no accent, hyphens; one option per first name', () => {
  assert.equal(nameKey('Thérèse d’Avila'), 'therese-d-avila');
  assert.equal(nameKey("Thomas d'Aquin"), 'thomas-d-aquin');
  assert.equal(nameKey('Jean-Marie Vianney'), 'jean-marie-vianney');
  const names = allNames();
  assert.equal(names.length, new Set(names.map((n) => n.key)).size);
  assert.deepEqual(
    names.map((n) => n.key),
    [...names.map((n) => n.key)].sort((a, b) => a.localeCompare(b)),
  );
  for (const { key } of names) {
    assert.match(key, /^[a-z0-9]+(-[a-z0-9]+)*$/, key);
  }
  // Augustin is celebrated twice (27/05 and 28/08): one option, two days.
  assert.equal(names.filter((n) => n.key === 'augustin').length, 1);
});
