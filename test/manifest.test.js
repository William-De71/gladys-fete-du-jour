// The manifest, tied to the code: type, versions, store limits, the keys of
// the trigger, the action and the widget, the first names of the filter.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { TRIGGERS, SCENE_ACTIONS, WHEN } from '../src/events.js';
import { WIDGETS, NEXT_DAYS } from '../src/widgets.js';
import { EVENT_HOUR, AUTO_LANGUAGE } from '../src/config.js';
import { allNames } from '../src/days.js';
import { LANGUAGES } from '../src/i18n.js';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const manifest = read('../gladys-assistant-integration.json');
const pkg = read('../package.json');
const byKey = (list) => new Map(list.map((entry) => [entry.key, entry]));
const values = (field) => field.options.map((option) => option.value);

test('a calendar integration, in lockstep with package.json, at 0.x until 1.0.0 is decided', () => {
  assert.equal(manifest.type, 'calendar');
  assert.equal(manifest.name, 'Fête du jour');
  assert.equal(manifest.version, pkg.version);
  assert.equal(manifest.docker_image, `ghcr.io/william-de71/gladys-fete-du-jour:${pkg.version}`);
  assert.equal(manifest.gladys_version, '>=5.2.0');
  assert.deepEqual(manifest.transports, ['local', 'cloud']);
  assert.equal(pkg.license, 'Apache-2.0');
  for (const key of ['location', 'network_wake', 'containers', 'network_discovery', 'webhooks']) {
    assert.equal(manifest[key], undefined, key);
  }
  assert.equal(manifest.account_schema, undefined, 'nothing to type per user');
});

test('only fetedujour.fr is called, and only from its client', () => {
  for (const file of ['app', 'calendar', 'events', 'widgets', 'names', 'days', 'store', 'config']) {
    assert.doesNotMatch(source(`../src/${file}.js`), /fetch\(|node:https?|node:net/, file);
  }
  assert.match(source('../src/fetedujour.js'), /https:\/\/fetedujour\.fr\/api\/v2/);
});

test('declares exactly the trigger, the action and the widget the code handles', () => {
  const app = source('../src/app.js');
  assert.deepEqual(
    manifest.scene_triggers.map((t) => t.key),
    Object.values(TRIGGERS),
  );
  assert.deepEqual(
    manifest.scene_actions.map((a) => a.key),
    Object.values(SCENE_ACTIONS),
  );
  assert.deepEqual(
    manifest.widgets.map((w) => w.key),
    Object.values(WIDGETS),
  );
  assert.match(app, /onWidgetGet\(WIDGETS\.TODAY/);
  assert.match(app, /onSceneAction\(SCENE_ACTIONS\.GET_NAME_DAY/);
  const trigger = manifest.scene_triggers[0];
  assert.deepEqual(
    trigger.fields.map((f) => f.key),
    ['name_key'],
  );
  assert.deepEqual(
    trigger.variables.map((v) => [v.key, v.type]),
    [
      ['name', 'string'],
      ['feast', 'string'],
      ['date', 'string'],
      ['summary', 'string'],
    ],
  );
  const action = manifest.scene_actions[0];
  assert.deepEqual(values(byKey(action.fields).get('day')), WHEN);
  assert.deepEqual(
    action.outputs.map((o) => o.key),
    ['name', 'feast', 'date', 'summary'],
  );
});

test('the filter offers every first name of the list (node scripts/sync-names.mjs)', () => {
  const field = byKey(manifest.scene_triggers[0].fields).get('name_key');
  const options = new Map(field.options.map((option) => [option.value, option.label.en]));
  for (const { key, name } of allNames()) {
    assert.equal(options.get(key), name, key);
  }
});

test('mirrors the bounds of the code', () => {
  const config = byKey(manifest.config_schema);
  for (const bound of ['min', 'max', 'default']) {
    assert.equal(config.get('event_hour')[bound], EVENT_HOUR[bound]);
  }
  assert.deepEqual(values(config.get('language')), [AUTO_LANGUAGE, ...LANGUAGES]);
  assert.equal(config.get('api_key').type, 'secret');
  const days = byKey(manifest.widgets[0].settings).get('days');
  assert.deepEqual(
    [days.min, days.max, days.default],
    [NEXT_DAYS.min, NEXT_DAYS.max, NEXT_DAYS.default],
  );
});

test('limits of the store: sizes, catalog description, links over https', () => {
  const size = statSync(new URL('../gladys-assistant-integration.json', import.meta.url)).size;
  assert.ok(size < 100 * 1024, `${size} bytes`);
  for (const language of LANGUAGES) {
    const { length } = manifest.description[language];
    assert.ok(length >= 10 && length <= 100, `description.${language}: ${length}`);
    for (const widget of manifest.widgets) {
      assert.ok(widget.label[language].length <= 30, widget.key);
      assert.ok(widget.description[language].length <= 100, widget.key);
    }
  }
  for (const field of manifest.config_schema) {
    for (const link of field.links ?? []) {
      assert.match(link.url, /^https:\/\//);
    }
  }
  const cover = readFileSync(new URL('../cover.jpg', import.meta.url));
  assert.ok(cover.length < 150 * 1024, `cover.jpg: ${cover.length} bytes`);
  assert.equal(cover.readUInt16BE(0), 0xffd8, 'cover.jpg is a JPEG');
});
