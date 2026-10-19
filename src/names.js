// -----------------------------------------------------------------------------
// The name day of a calendar day, from both sources:
//   - the built-in list (src/days.js) always answers, offline;
//   - fetedujour.fr, when a key is set and the day was read (src/store.js),
//     gives the first name of the ordinary days. A feast of the list (Noël,
//     Fête nationale…) stays as the list writes it, with its first name.
// The key of the scene filter always comes from the list: a scene keeps
// matching whatever the source.
// -----------------------------------------------------------------------------

import { dayEntry } from './days.js';
import { parseDay, monthDay } from './dates.js';
import { t } from './i18n.js';

/**
 * @description The name day of a day.
 * @param {string} iso - YYYY-MM-DD.
 * @param {Function} [apiName] - `(MM-DD) => string|null`, the names read from
 * fetedujour.fr (none: the list only).
 * @returns {{ date: string, name: string|null, feast: string|null,
 *   key: string|null, source: 'api'|'list' }} The day.
 * @example
 * nameDay('2026-04-28'); // -> { date: '2026-04-28', name: 'Valérie', feast: null, key: 'valerie', source: 'list' }
 */
function nameDay(iso, apiName = () => null) {
  const { month, day } = parseDay(iso);
  const entry = dayEntry(month, day);
  const fromApi = entry.feast === null ? apiName(monthDay(iso)) : null;
  return {
    date: iso,
    name: fromApi ?? entry.name,
    feast: entry.feast,
    key: entry.key,
    source: fromApi ? 'api' : 'list',
  };
}

/**
 * @description The title of a day: "Bonne fête Valérie", "Fête nationale ·
 * Bonne fête Camille", "Toussaint".
 * @param {object} nameOfDay - From nameDay.
 * @param {string} language - The language.
 * @returns {string} The title.
 */
function dayTitle({ name, feast }, language) {
  const wish = name ? t('eventName', language, { name }) : '';
  return [feast, wish].filter(Boolean).join(' · ');
}

/**
 * @description One sentence for a day: "Aujourd’hui, nous fêtons les
 * Valérie.", "Demain : Toussaint."
 * @param {object} nameOfDay - From nameDay.
 * @param {'today'|'tomorrow'} when - The day, from today.
 * @param {string} language - The language.
 * @returns {string} The sentence.
 */
function daySummary({ name, feast }, when, language) {
  if (name && feast) return t(`summaryBoth_${when}`, language, { name, feast });
  if (feast) return t(`summaryFeast_${when}`, language, { feast });
  return t(`summaryName_${when}`, language, { name });
}

export { nameDay, dayTitle, daySummary };
