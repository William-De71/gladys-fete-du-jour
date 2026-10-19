// -----------------------------------------------------------------------------
// Scene trigger and scene action of the Fête du jour integration.
//
// Trigger `name_day`, fired once a day at the hour of the configuration
// (never twice a day, see src/store.js): the name day of today. Its filter
// `name_key` (a multi-select of the first names of the list, empty = every
// day) starts a scene on the name day of chosen people. The Gladys calendar
// trigger "an event is coming" works too, once the calendar is shared.
//
// Action `get_name_day`: the name day of today or tomorrow, as a sentence to
// send in a message.
// -----------------------------------------------------------------------------

import { addDays } from './dates.js';
import { nameDay, daySummary } from './names.js';

const TRIGGERS = { NAME_DAY: 'name_day' };
const SCENE_ACTIONS = { GET_NAME_DAY: 'get_name_day' };
const WHEN = ['today', 'tomorrow'];

/**
 * @description The data of the daily scene event (flat, scalars only).
 * @param {string} today - YYYY-MM-DD.
 * @param {Function} apiName - `(MM-DD) => string|null`.
 * @param {string} language - Language of the summary.
 * @returns {object} The data.
 */
function eventData(today, apiName, language) {
  const day = nameDay(today, apiName);
  return {
    name_key: day.key,
    name: day.name ?? '',
    feast: day.feast ?? '',
    date: day.date,
    summary: daySummary(day, 'today', language),
  };
}

/**
 * @description The outputs of the get_name_day scene action.
 * @param {string} today - YYYY-MM-DD.
 * @param {object} fields - `{ day: 'today'|'tomorrow' }`.
 * @param {Function} apiName - `(MM-DD) => string|null`.
 * @param {string} language - Language of the summary.
 * @returns {{ name: string, feast: string, date: string, summary: string }} The outputs.
 */
function nameDayOutputs(today, fields, apiName, language) {
  const when = WHEN.includes(fields?.day) ? fields.day : 'today';
  const day = nameDay(when === 'tomorrow' ? addDays(today, 1) : today, apiName);
  return {
    name: day.name ?? '',
    feast: day.feast ?? '',
    date: day.date,
    summary: daySummary(day, when, language),
  };
}

export { TRIGGERS, SCENE_ACTIONS, WHEN, eventData, nameDayOutputs };
