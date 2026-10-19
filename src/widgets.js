// -----------------------------------------------------------------------------
// Dashboard widget of the Fête du jour integration.
//
//   - `today`  the name day of today (the first name, or the feast), a wish,
//              and the next days (setting `days`, 0 to 7).
//
// The content changes once a day: it is cached until the next midnight of the
// Gladys timezone (one hour at most), and refreshed at midnight and when
// fetedujour.fr gave new names. Content budget of a card: 2 texts, 1 status.
// -----------------------------------------------------------------------------

import { addDays } from './dates.js';
import { clip, formatDay, t } from './i18n.js';
import { nameDay } from './names.js';

const WIDGETS = { TODAY: 'today' };
const NEXT_DAYS = { min: 0, max: 7, default: 5 };
const TTL = { min: 10, max: 3600 };

/**
 * @description The cache duration of a content: until the next midnight (a
 * few seconds after), one hour at most.
 * @param {number} secondsToMidnight - Seconds until the next local midnight.
 * @returns {number} The ttl in seconds.
 */
const ttlUntil = (secondsToMidnight) =>
  Math.min(TTL.max, Math.max(TTL.min, Math.round(secondsToMidnight) + 5));

/**
 * @description How many next days the widget lists.
 * @param {unknown} raw - The setting.
 * @returns {number} 0 to 7.
 */
function nextDays(raw) {
  const value = Number(raw);
  if (raw === '' || raw === null || raw === undefined || !Number.isFinite(value)) {
    return NEXT_DAYS.default;
  }
  return Math.min(NEXT_DAYS.max, Math.max(NEXT_DAYS.min, Math.round(value)));
}

/**
 * @description The "today" widget.
 * @param {object} options - Options.
 * @param {string} options.today - YYYY-MM-DD.
 * @param {string} options.language - The language.
 * @param {Function} options.apiName - `(MM-DD) => string|null`.
 * @param {object} [options.settings] - `{ days }`.
 * @param {number} options.ttl - Cache duration.
 * @returns {object} The content.
 */
function buildTodayWidget({ today, language, apiName, settings = {}, ttl }) {
  const day = nameDay(today, apiName);
  // Two texts at most: the name as heading, the day and the wish below it
  // (a body honors line breaks).
  const lines = [
    [day.name && day.feast, formatDay(today, language)].filter(Boolean).join(' · '),
    day.name ? t('widgetWish', language, { name: day.name }) : null,
  ];
  const components = [
    { type: 'text', variant: 'heading', text: clip(day.name ?? day.feast, 40) },
    { type: 'text', variant: 'body', text: clip(lines.filter(Boolean).join('\n'), 300) },
  ];
  const count = nextDays(settings.days);
  if (count > 0) {
    const items = [];
    for (let offset = 1; offset <= count; offset += 1) {
      const iso = addDays(today, offset);
      const next = nameDay(iso, apiName);
      items.push({
        label: clip(offset === 1 ? t('tomorrow', language) : formatDay(iso, language, 'short'), 40),
        value: clip(next.name ?? next.feast, 40),
        color: next.feast ? 'info' : 'neutral',
      });
    }
    components.push({ type: 'status', items });
  }
  return { ttl_seconds: ttl, components };
}

export { WIDGETS, NEXT_DAYS, TTL, ttlUntil, nextDays, buildTodayWidget };
