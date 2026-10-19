// Builds the widget contents of the illustrations with the integration's own
// code: node gen.mjs <repo> <out.json> (run by render.sh)
//
// The "today" widget on a fixed day (Tuesday 28 April 2026, Valérie) with the
// next five days, from the built-in list.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const [repo, out] = process.argv.slice(2);
const load = (path) => import(pathToFileURL(`${repo}/${path}`).href);
const { buildTodayWidget } = await load('src/widgets.js');
const { LANGUAGES } = await load('src/i18n.js');
const manifest = JSON.parse(readFileSync(`${repo}/gladys-assistant-integration.json`, 'utf8'));

const NOW = Date.parse('2026-04-28T08:00:00Z');
const contents = {};
for (const language of LANGUAGES) {
  contents[language] = {
    today: buildTodayWidget({
      today: '2026-04-28',
      language,
      apiName: () => null,
      settings: { days: 5 },
      ttl: 3600,
    }),
  };
}
const widgets = Object.fromEntries(
  manifest.widgets.map((w) => [w.key, { icon: w.icon, label: w.label }]),
);
writeFileSync(out, JSON.stringify({ now: NOW, widgets, contents }));
