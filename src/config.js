// -----------------------------------------------------------------------------
// Configuration of the Fête du jour integration.
//
// Fields of the config_schema:
//   - `api_key`     the key of fetedujour.fr (optional): without it, the
//                   built-in list gives the names;
//   - `event_hour`  local hour (0-23) the daily scene event is fired at;
//   - `language`    language of the texts Gladys does not ask for in a
//                   language (scene summaries, status): `auto` follows the
//                   language of the last widget request, and guesses it from
//                   the timezone of Gladys until a widget is shown.
// -----------------------------------------------------------------------------

import { isLanguage } from './i18n.js';

const EVENT_HOUR = { min: 0, max: 23, default: 8 };
const AUTO_LANGUAGE = 'auto';
// fetedujour.fr does not document the format of its keys; this alphabet is
// enough for a token and keeps the key from changing the path of the request.
const API_KEY_PATTERN = /^[A-Za-z0-9_-]{4,128}$/;

/**
 * @description Read a bounded whole number, falling back to its default.
 * @param {unknown} raw - The raw value (the form can send numbers as strings).
 * @param {{ min: number, max: number, default: number }} bounds - The bounds.
 * @returns {number} The value.
 * @example
 * readNumber('8', EVENT_HOUR); // -> 8
 */
function readNumber(raw, bounds) {
  if (raw === '' || raw === null || raw === undefined) {
    return bounds.default;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    return bounds.default;
  }
  return Math.min(bounds.max, Math.max(bounds.min, Math.round(value)));
}

/**
 * @description Normalize the raw config object from the host API.
 * @param {object} [rawConfig] - The raw config values.
 * @returns {{ apiKey: string|null, apiKeyInvalid: boolean, eventHour: number,
 *   language: string }} The config.
 * @example
 * normalizeConfig({ event_hour: 7 });
 */
function normalizeConfig(rawConfig = {}) {
  const config = rawConfig ?? {};
  const key = typeof config.api_key === 'string' ? config.api_key.trim() : '';
  const valid = API_KEY_PATTERN.test(key);
  return {
    apiKey: valid ? key : null,
    apiKeyInvalid: key.length > 0 && !valid,
    eventHour: readNumber(config.event_hour, EVENT_HOUR),
    language: isLanguage(config.language) ? config.language : AUTO_LANGUAGE,
  };
}

// Timezones of the countries speaking one of the languages of the
// integration; any other one is English. A guess until the first widget
// gives the real language.
const TIMEZONE_LANGUAGES = {
  fr: [
    'Europe/Paris',
    'Europe/Monaco',
    'Europe/Brussels',
    'Europe/Luxembourg',
    'Indian/Reunion',
    'Indian/Mayotte',
    'America/Guadeloupe',
    'America/Martinique',
    'America/Cayenne',
    'America/Miquelon',
    'America/St_Barthelemy',
    'America/Marigot',
    'Pacific/Noumea',
    'Pacific/Tahiti',
    'Pacific/Wallis',
    'America/Montreal',
    'Africa/Abidjan',
    'Africa/Dakar',
    'Africa/Casablanca',
    'Africa/Algiers',
    'Africa/Tunis',
  ],
  de: ['Europe/Berlin', 'Europe/Busingen', 'Europe/Vienna', 'Europe/Zurich', 'Europe/Vaduz'],
  es: [
    'Europe/Madrid',
    'Atlantic/Canary',
    'Africa/Ceuta',
    'America/Mexico_City',
    'America/Bogota',
    'America/Lima',
    'America/Santiago',
    'America/Caracas',
    'America/Montevideo',
    'America/Asuncion',
    'America/La_Paz',
    'America/Guayaquil',
    'America/Havana',
    'America/Panama',
    'America/Costa_Rica',
    'America/Guatemala',
    'America/El_Salvador',
    'America/Tegucigalpa',
    'America/Managua',
    'America/Santo_Domingo',
    'America/Puerto_Rico',
  ],
};

/**
 * @description The language of the texts guessed from a timezone.
 * @param {string} timezone - IANA timezone of Gladys.
 * @returns {string} en, fr, de or es.
 * @example
 * guessLanguage('Europe/Paris'); // -> 'fr'
 */
function guessLanguage(timezone) {
  const zone = String(timezone ?? '');
  if (zone.startsWith('America/Argentina/')) return 'es';
  const found = Object.entries(TIMEZONE_LANGUAGES).find(([, zones]) => zones.includes(zone));
  return found ? found[0] : 'en';
}

export { EVENT_HOUR, AUTO_LANGUAGE, API_KEY_PATTERN, readNumber, normalizeConfig, guessLanguage };
