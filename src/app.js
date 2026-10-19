// -----------------------------------------------------------------------------
// The Fête du jour integration: every handler, registered on a Gladys client.
//
// A calendar integration (manifest `type: "calendar"`): the name day of each
// day in a "Fêtes du jour" calendar for every user who enabled it in "My
// calendars" (src/calendar.js), a daily scene trigger and a scene action
// (src/events.js), a dashboard widget (src/widgets.js).
//
// The names come from the built-in list (src/days.js), and from fetedujour.fr
// when the user set a key (src/fetedujour.js): one day read every 30 seconds
// until the 366 are known, kept for ever in /data (src/store.js). The list
// answers meanwhile, and whenever fetedujour.fr refuses or does not answer.
//
// The clock ticks every 30 s: a new local day pushes the calendars (the window
// slides) and refreshes the widget; the event hour fires the scene event.
//
// index.js only creates the SDK client; the tests drive this module with the
// fake Gladys of the SDK (test/app.test.js).
// -----------------------------------------------------------------------------

import { logger as sdkLogger } from '@gladysassistant/integration-sdk';
import { normalizeConfig, guessLanguage, AUTO_LANGUAGE } from './config.js';
import { createStore, DEFAULT_PATH } from './store.js';
import { createClient } from './fetedujour.js';
import { createCalendarSync } from './calendar.js';
import { TRIGGERS, SCENE_ACTIONS, eventData, nameDayOutputs } from './events.js';
import { WIDGETS, ttlUntil, buildTodayWidget } from './widgets.js';
import { allNames } from './days.js';
import { allMonthDays, monthDay } from './dates.js';
import { all, isLanguage } from './i18n.js';
import { resolveTimezone, localDay, wallClock, secondsUntilMidnight } from './time.js';

const TICK_MS = 30000;
// fetedujour.fr asks not to be called needlessly: one day every 30 seconds
// (366 days in about three hours, once in the life of the integration).
const API_SPACING_MS = 30000;
// A refused key waits 6 hours (the user has to change it, or their IP
// address); a site that does not answer, 15 minutes.
const REFUSED_PAUSE_MS = 6 * 3600 * 1000;
const UNAVAILABLE_PAUSE_MS = 15 * 60 * 1000;
// The calendars follow the names read every 30 days, and at the end.
const SYNC_EVERY = 30;
const MONTH_DAYS = allMonthDays();

/**
 * @description Register every handler of the integration on a Gladys client.
 * @param {object} gladys - A GladysIntegration (or the fake Gladys of the SDK).
 * @param {object} [options] - Options.
 * @param {Function} [options.now] - `() => Date` (tests).
 * @param {string} [options.timezone] - IANA timezone (default: TZ).
 * @param {string|null} [options.statePath] - File of the state (null: memory).
 * @param {Function} [options.fetch] - `fetch` of the fetedujour.fr client.
 * @param {string} [options.userAgent] - User-Agent of the requests.
 * @param {Function} [options.sleep] - `(ms) => Promise` (tests).
 * @param {number} [options.tickMs] - Clock period, 0 for none (tests).
 * @param {object} [options.logger] - Logger.
 * @returns {{ tick: Function, stop: Function }} Handles for the tests.
 * @example
 * createApp(new GladysIntegration());
 */
function createApp(
  gladys,
  {
    now = () => new Date(),
    timezone = resolveTimezone(),
    statePath = DEFAULT_PATH,
    fetch,
    userAgent,
    sleep,
    tickMs = TICK_MS,
    logger = sdkLogger,
  } = {},
) {
  const store = createStore({ path: statePath, logger });
  const client = createClient({ fetch, userAgent });
  let config = normalizeConfig();
  let lastDay = null;
  let timer = null;
  let running = Promise.resolve();
  let lastStatus = null;
  // fetedujour.fr: when the next request may go, and why it stopped.
  const api = { pausedUntil: 0, lastRequest: 0, problem: null, reason: '', sinceSync: 0 };

  const today = () => localDay(now(), timezone);
  const usingApi = () => config.apiKey !== null;
  const apiName = (key) => (usingApi() ? store.apiName(key) : null);
  const textLanguage = () =>
    config.language === AUTO_LANGUAGE
      ? (store.language() ?? guessLanguage(timezone))
      : config.language;

  const calendarSync = createCalendarSync(gladys, {
    today,
    apiName,
    usingApi,
    ...(sleep ? { sleep } : {}),
    logger,
  });

  /** @description Ask Gladys to fetch the widget again. */
  function refreshWidgets() {
    if (!gladys.connected) return;
    try {
      gladys.requestWidgetRefresh(WIDGETS.TODAY);
    } catch (err) {
      logger.warn(`Unable to refresh the widget: ${err.message}`);
    }
  }

  /** @description Show the source and its progress in the Configuration screen. */
  async function reportStatus() {
    let connected = true;
    let message;
    if (config.apiKeyInvalid) {
      message = all('statusInvalidKey');
    } else if (!usingApi()) {
      message = all('statusList', { count: allNames().length });
    } else if (api.problem === 'refused') {
      connected = false;
      message = all('statusRefused');
    } else if (api.problem === 'unavailable') {
      message = all('statusUnreachable', { reason: api.reason });
    } else if (store.apiCount() >= MONTH_DAYS.length) {
      message = all('statusComplete');
    } else {
      message = all('statusFilling', { read: store.apiCount() });
    }
    const signature = JSON.stringify([connected, message]);
    if (!gladys.connected || signature === lastStatus) return;
    lastStatus = signature;
    try {
      await gladys.setConnectionStatus(connected, message);
    } catch (err) {
      lastStatus = null;
      logger.error('Unable to report the status', err);
    }
  }

  /**
   * @description Fire the scene event of the day, once the event hour is
   * reached; a refused event is fired again at the next tick.
   * @param {string} day - YYYY-MM-DD.
   */
  async function fireEvent(day) {
    if (!gladys.connected || store.fired() === day) return;
    if (wallClock(now(), timezone).hour < config.eventHour) return;
    try {
      await gladys.publishSceneEvent(TRIGGERS.NAME_DAY, eventData(day, apiName, textLanguage()));
      store.setFired(day);
    } catch (err) {
      logger.warn(`Scene event of ${day} refused: ${err.message}`);
    }
  }

  /**
   * @description Read one more day from fetedujour.fr, if a key is set, a day
   * is still unknown and the spacing allows it. Today first, then the next
   * days: the calendar fills in the order it is read.
   */
  async function readOneDay() {
    if (!usingApi() || !gladys.connected) return;
    const at = now().getTime();
    if (at < api.pausedUntil || at - api.lastRequest < API_SPACING_MS) return;
    const start = MONTH_DAYS.indexOf(monthDay(today()));
    const missing = [...MONTH_DAYS.slice(Math.max(0, start)), ...MONTH_DAYS.slice(0, start)].find(
      (key) => store.apiName(key) === null,
    );
    if (missing === undefined) return;
    api.lastRequest = at;
    const [month, day] = missing.split('-').map(Number);
    try {
      store.setApiName(missing, await client.dayName(config.apiKey, month, day));
      api.problem = null;
      api.sinceSync += 1;
    } catch (err) {
      api.problem = err.kind === 'refused' ? 'refused' : 'unavailable';
      api.reason = err.message;
      api.pausedUntil = at + (err.kind === 'refused' ? REFUSED_PAUSE_MS : UNAVAILABLE_PAUSE_MS);
      logger.warn(`fetedujour.fr, ${missing}: ${err.kind} (${err.message})`);
    }
    const done = store.apiCount() >= MONTH_DAYS.length;
    if (api.sinceSync > 0 && (api.sinceSync >= SYNC_EVERY || done)) {
      api.sinceSync = 0;
      await calendarSync.syncAll();
      refreshWidgets();
    }
    await reportStatus();
  }

  /**
   * @description One look at the clock: a new day pushes the calendars and
   * refreshes the widget, the event hour fires the scene event, and one more
   * day may be read from fetedujour.fr. Never two at once.
   * @returns {Promise<void>}
   */
  function tick() {
    running = running.then(async () => {
      const day = today();
      if (day !== lastDay) {
        lastDay = day;
        await calendarSync.syncAll();
        refreshWidgets();
      }
      await fireEvent(day);
      await readOneDay();
    });
    running = running.catch((err) => logger.error('Clock round failed', err));
    return running;
  }

  /**
   * @description Apply a configuration: a new key starts reading again at
   * once, the calendars say which source they come from.
   * @param {object} raw - The raw configuration.
   */
  async function applyConfig(raw) {
    const before = config;
    config = normalizeConfig(raw ?? {});
    if (before.apiKey !== config.apiKey) {
      Object.assign(api, { pausedUntil: 0, lastRequest: 0, problem: null, reason: '' });
      lastDay = null;
    }
    await reportStatus();
    refreshWidgets();
    await tick();
  }

  /**
   * @description Remember the language of a widget request.
   * @param {string} next - The language.
   */
  function rememberLanguage(next) {
    if (isLanguage(next) && next !== store.language()) {
      store.setLanguage(next);
    }
  }

  // --- Scene action ---------------------------------------------------------
  gladys.onSceneAction(SCENE_ACTIONS.GET_NAME_DAY, async (fields = {}) =>
    nameDayOutputs(today(), fields, apiName, textLanguage()),
  );

  // --- Widget ---------------------------------------------------------------
  gladys.onWidgetGet(WIDGETS.TODAY, async ({ settings = {}, language: lang } = {}) => {
    rememberLanguage(lang);
    return buildTodayWidget({
      today: today(),
      language: isLanguage(lang) ? lang : textLanguage(),
      apiName,
      settings,
      ttl: ttlUntil(secondsUntilMidnight(now(), timezone)),
    });
  });

  // --- Calendars and configuration ------------------------------------------
  gladys.onCalendarAccountUpdated(async (userSelector) => {
    await calendarSync.syncUser(userSelector);
  });

  gladys.onConfigUpdated(async (raw) => {
    await applyConfig(raw);
  });

  gladys.on('connected', async () => {
    // Calendars may have changed while disconnected: push everything again.
    calendarSync.forget();
    lastStatus = null;
    lastDay = null;
    await applyConfig(gladys.config ?? {});
    logger.info(
      `connected, timezone ${timezone}, ${usingApi() ? `fetedujour.fr (${store.apiCount()}/366 days read)` : 'built-in list'}`,
    );
    if (tickMs > 0 && timer === null) {
      timer = setInterval(() => tick(), tickMs);
      timer.unref?.();
    }
  });

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  gladys.handleShutdown(async (signal) => {
    logger.info(`Received ${signal} -> graceful shutdown`);
    stop();
    await running;
  });

  return { tick, stop };
}

export { TICK_MS, API_SPACING_MS, REFUSED_PAUSE_MS, UNAVAILABLE_PAUSE_MS, createApp };
