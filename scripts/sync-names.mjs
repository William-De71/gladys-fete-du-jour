// Copies the first names of the built-in list (src/days.js) into the options
// of the `name_key` filter of the scene trigger, in the manifest:
//   node scripts/sync-names.mjs   (then npm run format)
// test/manifest.test.js fails when they differ. A key is kept for ever: a
// first name removed from the list must stay an option (scenes store it).
import { readFileSync, writeFileSync } from 'node:fs';
import { allNames } from '../src/days.js';

const path = new URL('../gladys-assistant-integration.json', import.meta.url);
const manifest = JSON.parse(readFileSync(path, 'utf8'));
const field = manifest.scene_triggers
  .find((trigger) => trigger.key === 'name_day')
  .fields.find((candidate) => candidate.key === 'name_key');
const known = new Map(field.options.map((option) => [option.value, option]));
for (const { key, name } of allNames()) {
  // Proper nouns: one label for every language (the manifest stays under
  // 100 KB), the UI falls back to English.
  known.set(key, { value: key, label: { en: name } });
}
field.options = [...known.values()].sort((a, b) => a.value.localeCompare(b.value));
writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${field.options.length} first names`);
