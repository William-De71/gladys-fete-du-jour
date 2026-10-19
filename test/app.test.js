// The integration end to end, against the fake Gladys of the SDK: the
// calendar of the enabled users, the daily scene event, fetedujour.fr read
// day by day (spacing, refusal, outage), the widget and the scene action.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFakeGladys } from '@gladysassistant/integration-sdk/testing';
import { createApp, API_SPACING_MS, REFUSED_PAUSE_MS } from '../src/app.js';
import { TRIGGERS } from '../src/events.js';
import { silent, fakeFetch } from './helpers.js';

const statePath = () => join(mkdtempSync(join(tmpdir(), 'fete-')), 'state.json');
const john = { user: { selector: 'john', first_name: 'John', language: 'fr' }, config: {} };
const jane = { user: { selector: 'jane', first_name: 'Jane', language: 'en' }, config: {} };

/**
 * @description A started integration on a controllable clock.
 * @param {object} [options] - Options.
 * @returns {Promise<object>} `{ gladys, app, clock, fetch, path }`.
 */
async function start({
  at = '2026-04-28T04:00:00Z', // 06:00 in Paris
  config = {},
  accounts = [john],
  fetch = fakeFetch(),
  path = statePath(),
} = {}) {
  const clock = { now: new Date(at) };
  const gladys = createFakeGladys({
    config: { language: 'auto', ...config },
    calendarAccounts: accounts,
  });
  const app = createApp(gladys, {
    now: () => clock.now,
    timezone: 'Europe/Paris',
    statePath: path,
    fetch,
    sleep: async () => {},
    tickMs: 0,
    logger: silent,
  });
  await gladys.connect();
  await app.tick();
  return { gladys, app, clock, fetch, path };
}

const ok = (ack) => {
  assert.equal(ack.success, true, ack.error);
  return ack.data.content ?? ack.data.outputs ?? ack.data.message;
};
const later = (clock, ms) => {
  clock.now = new Date(clock.now.getTime() + ms);
};

test('a calendar for each enabled user, in their language, a year ahead', async () => {
  const { gladys } = await start({ accounts: [john, jane] });
  assert.deepEqual(
    gladys.fake.calendars.map((c) => [c.user, c.name]),
    [
      ['john', 'Fêtes du jour'],
      ['jane', 'Name days'],
    ],
  );
  const events = gladys.fake.calendarEvents.filter((e) => e.external_id.includes(':john:'));
  assert.equal(events.length, 373);
  const today = events.find((e) => e.external_id.endsWith(':day-2026-04-28'));
  assert.deepEqual(
    [today.name, today.start, today.end, today.full_day],
    ['Bonne fête Valérie', '2026-04-28', '2026-04-29', true],
  );
  assert.ok(gladys.fake.calendarEvents.some((e) => e.name === 'Name day: Valérie'));
  assert.match(gladys.fake.connectionStatus.message.fr, /Liste intégrée : 351 prénoms/);
});

test('the scene event: at the event hour, once a day, even after a restart', async () => {
  const path = statePath();
  const first = await start({ path });
  assert.deepEqual(first.gladys.fake.sceneEvents, [], '06:00, before 08:00');
  first.clock.now = new Date('2026-04-28T06:00:05Z'); // 08:00:05 in Paris
  await first.app.tick();
  assert.deepEqual(
    first.gladys.fake.sceneEvents.map((e) => [e.key, e.data.name_key, e.data.name]),
    [[TRIGGERS.NAME_DAY, 'valerie', 'Valérie']],
  );
  assert.equal(
    first.gladys.fake.sceneEvents[0].data.summary,
    'Aujourd’hui, nous fêtons les Valérie.',
  );
  await first.app.tick();
  assert.equal(first.gladys.fake.sceneEvents.length, 1, 'never twice');
  const again = await start({ at: '2026-04-28T10:00:00Z', path });
  assert.deepEqual(again.gladys.fake.sceneEvents, []);
  const nextDay = await start({ at: '2026-04-29T10:00:00Z', path });
  assert.equal(nextDay.gladys.fake.sceneEvents[0].data.name, 'Catherine de Sienne');
});

test('fetedujour.fr: one day every 30 seconds, today first, kept for ever', async () => {
  const fetch = fakeFetch({ name: (day, month) => `API ${day}/${month}` });
  const path = statePath();
  const { gladys, app, clock } = await start({ config: { api_key: 'abc123' }, fetch, path });
  assert.deepEqual(fetch.calls, ['https://fetedujour.fr/api/v2/abc123/json-normal-28-4']);
  await app.tick();
  assert.equal(fetch.calls.length, 1, 'spaced');
  later(clock, API_SPACING_MS);
  await app.tick();
  assert.match(fetch.calls[1], /json-normal-29-4$/);
  assert.match(gladys.fake.connectionStatus.message.fr, /2 jours sur 366 lus/);
  const widget = ok(await gladys.fake.widgetGet('today', { settings: { days: 1 } }));
  assert.equal(widget.components[0].text, 'API 28/4');
  // Every day read: no more request, the calendars follow.
  for (let i = 0; i < 400; i += 1) {
    later(clock, API_SPACING_MS);
    await app.tick();
  }
  assert.equal(fetch.calls.length, 366);
  assert.match(gladys.fake.connectionStatus.message.en, /the 366 days are read/);
  const event = gladys.fake.calendarEvents.find((e) => e.external_id.endsWith(':day-2026-06-01'));
  assert.equal(event.name, 'Bonne fête API 1/6');
  assert.equal(event.description, 'Source : fetedujour.fr.');
  // After a restart, nothing is asked again.
  const restarted = await start({ config: { api_key: 'abc123' }, fetch: fakeFetch(), path });
  assert.equal(restarted.fetch.calls.length, 0);
});

test('a refused key waits 6 hours, the list answers meanwhile', async () => {
  const fetch = fakeFetch({ status: () => 403 });
  const { gladys, app, clock } = await start({ config: { api_key: 'abc123' }, fetch });
  assert.equal(gladys.fake.connectionStatus.connected, false);
  assert.match(gladys.fake.connectionStatus.message.fr, /IP publique fixe/);
  later(clock, REFUSED_PAUSE_MS - 1000);
  await app.tick();
  assert.equal(fetch.calls.length, 1);
  later(clock, 2000);
  await app.tick();
  assert.equal(fetch.calls.length, 2);
  const out = ok(await gladys.fake.sceneAction('get_name_day', { day: 'today' }));
  assert.equal(out.name, 'Valérie');
  // A new key starts again at once.
  await gladys.fake.configUpdated({ ...gladys.fake.config, api_key: 'other99' });
  assert.equal(fetch.calls.length, 3);
});

test('the scene action and the language of the texts', async () => {
  const { gladys } = await start();
  assert.deepEqual(ok(await gladys.fake.sceneAction('get_name_day', { day: 'tomorrow' })), {
    name: 'Catherine de Sienne',
    feast: '',
    date: '2026-04-29',
    summary: 'Demain, nous fêterons les Catherine de Sienne.',
  });
  // The dashboard is in German: the summaries follow.
  await gladys.fake.widgetGet('today', { language: 'de' });
  const out = ok(await gladys.fake.sceneAction('get_name_day', {}));
  assert.equal(out.summary, 'Heute ist der Namenstag von Valérie.');
});

test('a user who enables the integration gets the calendar at once', async () => {
  const { gladys } = await start({ accounts: [] });
  assert.equal(gladys.fake.calendars.length, 0);
  gladys.fake.calendarAccounts.push(jane);
  await gladys.fake.calendarAccountUpdated('jane');
  assert.equal(gladys.fake.calendars.length, 1);
  assert.ok(gladys.fake.calendarEvents.length > 300);
});

test('midnight slides the window', async () => {
  const { gladys, app, clock } = await start();
  clock.now = new Date('2026-04-28T22:00:30Z'); // 00:00:30 on the 29th in Paris
  await app.tick();
  const ids = gladys.fake.calendarEvents.map((e) => e.external_id);
  assert.ok(ids.some((id) => id.endsWith(':day-2027-04-29')));
  assert.ok(!ids.some((id) => id.endsWith(':day-2026-04-21')));
});
