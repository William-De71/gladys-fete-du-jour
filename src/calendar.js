// -----------------------------------------------------------------------------
// The name days in the Gladys calendar (manifest `type: "calendar"`).
//
// Every user who enabled the integration in "My calendars" gets one calendar,
// "Fêtes du jour", with one all-day event a day, in the user's language: from
// 7 days back to 366 days ahead, pushed again when it slides (at midnight)
// and when fetedujour.fr gave new names. The window of the push starts 30
// days back: the core prunes only inside the window, so the days older than
// a week are deleted as they leave, instead of piling up. The calendar is private
// when created: the user shares it with the household (and the scenes) from
// "My calendars".
//
// Limits of the core: 500 events per request (the window holds 374), 30
// calendar writes per minute per integration (writes are spaced by 2.1 s).
//
// External ids: ext:<selector>:<user>:name-days        (calendar)
//               ext:<selector>:<user>:day-<YYYY-MM-DD>  (event)
// -----------------------------------------------------------------------------

import { addDays } from './dates.js';
import { clip, t } from './i18n.js';
import { nameDay, dayTitle } from './names.js';

const HISTORY_DAYS = 7;
const PRUNE_DAYS = 30;
const AHEAD_DAYS = 366;
const WRITE_SPACING_MS = 2100;
const COLOR = '#d6336c';

/**
 * @description The external id of the calendar of a user.
 * @param {object} gladys - SDK client.
 * @param {string} user - User selector.
 * @returns {string} The external id.
 */
const calendarId = (gladys, user) => gladys.externalId(`${user}:name-days`);

/**
 * @description The events of the window, in a language.
 * @param {object} gladys - SDK client.
 * @param {string} user - User selector.
 * @param {object} window - `{ from, to }`, YYYY-MM-DD, `to` excluded.
 * @param {Function} apiName - `(MM-DD) => string|null`.
 * @param {string} language - The user's language.
 * @returns {object[]} The events.
 */
function buildEvents(gladys, user, { from, to }, apiName, language) {
  const events = [];
  for (let day = from; day < to; day = addDays(day, 1)) {
    const entry = nameDay(day, apiName);
    events.push({
      external_id: gladys.externalId(`${user}:day-${day}`),
      name: clip(dayTitle(entry, language), 200),
      description: t('eventDescription', language, {
        source: t(entry.source === 'api' ? 'sourceApi' : 'sourceList', language),
      }),
      start: day,
      end: addDays(day, 1),
      full_day: true,
    });
  }
  return events;
}

/**
 * @description Create the calendar synchronizer.
 * @param {object} gladys - SDK client.
 * @param {object} options - Dependencies.
 * @param {Function} options.today - `() => 'YYYY-MM-DD'`.
 * @param {Function} options.apiName - `(MM-DD) => string|null`.
 * @param {Function} options.usingApi - `() => boolean`: a key is set.
 * @param {Function} [options.sleep] - Delay between two writes.
 * @param {object} [options.logger] - SDK logger.
 * @returns {{ syncAll: Function, syncUser: Function, forget: Function }} The synchronizer.
 */
function createCalendarSync(gladys, { today, apiName, usingApi, sleep = defaultSleep, logger }) {
  // Last content pushed per calendar: an unchanged calendar is not pushed again.
  const pushed = new Map();
  let lastWrite = 0;
  let queue = Promise.resolve();

  const write = async (call) => {
    const wait = lastWrite + WRITE_SPACING_MS - Date.now();
    if (wait > 0) {
      await sleep(wait);
    }
    lastWrite = Date.now();
    return call();
  };

  const syncAccount = async (account, { force = false } = {}) => {
    const user = account.user.selector;
    const language = account.user.language;
    const id = calendarId(gladys, user);
    const calendar = {
      external_id: id,
      name: t('calendarName', language),
      description: t('calendarDescription', language, {
        source: t(usingApi() ? 'sourceApi' : 'sourceList', language),
      }),
      color: COLOR,
    };
    const calendarKey = JSON.stringify(calendar);
    if (force || pushed.get(`calendar:${user}`) !== calendarKey) {
      await write(() => gladys.publishCalendars(user, [calendar]));
      pushed.set(`calendar:${user}`, calendarKey);
    }
    const mine = (await gladys.getCalendars(user)).find((c) => c.external_id === id);
    if (mine && mine.sync === false) {
      return;
    }
    const to = addDays(today(), AHEAD_DAYS);
    const window = { from: addDays(today(), -PRUNE_DAYS), to };
    const events = buildEvents(
      gladys,
      user,
      { from: addDays(today(), -HISTORY_DAYS), to },
      apiName,
      language,
    );
    const content = JSON.stringify([window, events]);
    if (!force && pushed.get(id) === content) {
      return;
    }
    try {
      await write(() => gladys.publishCalendarEvents(id, events, window));
      pushed.set(id, content);
    } catch (error) {
      // The user turned the sync of this calendar off meanwhile.
      if (error?.status === 403) {
        logger?.info(`calendar of ${user} not synchronized: ${error.message}`);
        return;
      }
      throw error;
    }
  };

  const enqueue = (job) => {
    const result = queue.then(job);
    queue = result.catch((error) => logger?.warn(`calendar sync failed: ${error.message}`));
    return result;
  };

  return {
    /**
     * @param {object} [options] - `{ force }`: push even what did not change.
     * @returns {Promise<void>} Every enabled user synchronized.
     */
    syncAll: (options) =>
      enqueue(async () => {
        for (const account of await gladys.getCalendarAccounts()) {
          await syncAccount(account, options);
        }
      }),
    /**
     * @param {string} userSelector - The user whose account changed.
     * @returns {Promise<void>} That user synchronized (nothing if disabled).
     */
    syncUser: (userSelector) =>
      enqueue(async () => {
        const account = (await gladys.getCalendarAccounts()).find(
          (candidate) => candidate.user.selector === userSelector,
        );
        if (account) {
          await syncAccount(account, { force: true });
        } else {
          // Disabled: the core already deleted the calendar.
          pushed.delete(`calendar:${userSelector}`);
          pushed.delete(calendarId(gladys, userSelector));
        }
      }),
    /** Forget what was pushed (reconnection: the core may have changed meanwhile). */
    forget: () => pushed.clear(),
  };
}

/**
 * @param {number} ms - Delay.
 * @returns {Promise<void>} Resolved after the delay.
 */
function defaultSleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms).unref?.();
  });
}

export {
  HISTORY_DAYS,
  PRUNE_DAYS,
  AHEAD_DAYS,
  WRITE_SPACING_MS,
  calendarId,
  buildEvents,
  createCalendarSync,
};
