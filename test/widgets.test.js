// The widget through validateWidgetContent (the checks of the core, which
// only run in debug mode in production) and the content budget of a card.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateWidgetContent } from '@gladysassistant/integration-sdk';
import { buildTodayWidget, ttlUntil, nextDays } from '../src/widgets.js';
import { LANGUAGES } from '../src/i18n.js';

const widget = (today, language, settings = {}, apiName = () => null) =>
  buildTodayWidget({ today, language, apiName, settings, ttl: 600 });
const types = (content) => content.components.map((c) => c.type);

test('valid in every language, on an ordinary day and on feasts', () => {
  for (const language of LANGUAGES) {
    for (const day of ['2026-04-28', '2026-07-14', '2026-11-01', '2028-02-29', '2026-12-31']) {
      for (const days of [0, 5, 7]) {
        const content = widget(day, language, { days });
        assert.deepEqual(validateWidgetContent(content), [], `${language} ${day} ${days}`);
        assert.ok(types(content).filter((type) => type === 'text').length <= 2);
      }
    }
  }
});

test('today, a wish, the next days', () => {
  const content = widget('2026-04-28', 'fr', { days: 2 });
  assert.deepEqual(types(content), ['text', 'text', 'status']);
  const [heading, body, status] = content.components;
  assert.equal(heading.text, 'Valérie');
  assert.equal(body.text, 'mardi 28 avril\nBonne fête aux Valérie !');
  assert.deepEqual(
    status.items.map((item) => [item.label, item.value]),
    [
      ['Demain', 'Catherine de Sienne'],
      ['jeu. 30 avr.', 'Robert'],
    ],
  );
  const feast = widget('2026-07-14', 'en', { days: 0 });
  assert.deepEqual(types(feast), ['text', 'text']);
  assert.equal(feast.components[0].text, 'Camille');
  assert.equal(
    feast.components[1].text,
    'Fête nationale · Tuesday, July 14\nHappy name day to all the Camille!',
  );
  assert.equal(widget('2026-11-01', 'fr', { days: 0 }).components[0].text, 'Toussaint');
  // A name read from fetedujour.fr.
  const read = widget('2026-04-28', 'fr', { days: 0 }, () => 'Val');
  assert.equal(read.components[0].text, 'Val');
});

test('settings and cache', () => {
  assert.deepEqual([nextDays(''), nextDays(12), nextDays(-1), nextDays('3')], [5, 7, 0, 3]);
  assert.equal(ttlUntil(120), 125);
  assert.equal(ttlUntil(86000), 3600);
});
