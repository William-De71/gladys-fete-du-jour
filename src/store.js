// -----------------------------------------------------------------------------
// What the integration keeps in /data/state.json (the only writable place of
// the container):
//   - `api`       the names read from fetedujour.fr, by MM-DD: they never
//                 change, each day is asked once;
//   - `fired`     the last day the daily scene event was fired (never twice a
//                 day, even across a restart);
//   - `language`  the language of the last widget request.
// Written atomically (temporary file, then rename). A missing or broken file
// starts empty: the built-in list still gives every name.
// -----------------------------------------------------------------------------

import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { isLanguage } from './i18n.js';

const DEFAULT_PATH = '/data/state.json';
const MONTH_DAY = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/**
 * @description The state of the integration.
 * @param {object} [options] - Options.
 * @param {string|null} [options.path] - The file (null: memory only, tests).
 * @param {object} [options.logger] - Logger.
 * @returns {object} The store.
 */
function createStore({ path = DEFAULT_PATH, logger } = {}) {
  let state = { api: {}, fired: null, language: null };

  if (path !== null) {
    try {
      const raw = JSON.parse(readFileSync(path, 'utf8'));
      const api = Object.fromEntries(
        Object.entries(raw?.api ?? {}).filter(
          ([key, name]) => MONTH_DAY.test(key) && typeof name === 'string' && name.length > 0,
        ),
      );
      state = {
        api,
        fired: typeof raw?.fired === 'string' ? raw.fired : null,
        language: isLanguage(raw?.language) ? raw.language : null,
      };
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger?.warn(`state file ignored: ${error.message}`);
      }
    }
  }

  const save = () => {
    if (path === null) return;
    try {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(`${path}.tmp`, JSON.stringify(state));
      renameSync(`${path}.tmp`, path);
    } catch (error) {
      logger?.warn(`unable to save the state: ${error.message}`);
    }
  };

  return {
    /** @param {string} monthDay - MM-DD. @returns {string|null} The name read. */
    apiName: (monthDay) => state.api[monthDay] ?? null,
    /** @returns {number} How many days were read from fetedujour.fr. */
    apiCount: () => Object.keys(state.api).length,
    /**
     * @param {string} monthDay - MM-DD.
     * @param {string} name - The name read.
     */
    setApiName(monthDay, name) {
      state.api[monthDay] = name;
      save();
    },
    /** @returns {string|null} The last day the scene event was fired. */
    fired: () => state.fired,
    /** @param {string} day - YYYY-MM-DD. */
    setFired(day) {
      state.fired = day;
      save();
    },
    /** @returns {string|null} The language of the last widget request. */
    language: () => state.language,
    /** @param {string} language - en, fr, de or es. */
    setLanguage(language) {
      state.language = language;
      save();
    },
  };
}

export { DEFAULT_PATH, createStore };
