// -----------------------------------------------------------------------------
// HTTP client of the fetedujour.fr API (v2), documented at
// https://fetedujour.fr/api/ :
//
//   GET https://fetedujour.fr/api/v2/<KEY>/json-normal-<DAY>-<MONTH>
//   -> { "day": 28, "month": 4, "name": "Valérie" }
//
// The key is free, generated on that page for ONE fixed public IP address:
// a request from another address, or with an unknown key, is refused (HTTP
// 403). The site asks not to call it needlessly: the names never change from
// one year to the next, so each day is asked once and kept (src/store.js),
// one request at a time, spaced by src/app.js.
// -----------------------------------------------------------------------------

const BASE_URL = 'https://fetedujour.fr/api/v2';
const TIMEOUT_MS = 15000;
const NAME_MAX = 100;

class FeteDuJourError extends Error {
  /**
   * @param {'refused'|'unavailable'|'invalid'} kind - What went wrong: the key
   * is refused, the site does not answer, or the answer is not a name.
   * @param {string} message - Details, for the logs.
   */
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

/**
 * @description The fetedujour.fr client.
 * @param {object} [options] - Options.
 * @param {Function} [options.fetch] - `fetch` (tests).
 * @param {string} [options.userAgent] - User-Agent of the requests.
 * @returns {{ dayName: Function }} The client.
 */
function createClient({ fetch = globalThis.fetch, userAgent } = {}) {
  return {
    /**
     * @description The name of a day of the year.
     * @param {string} key - The API key.
     * @param {number} month - 1-12.
     * @param {number} day - 1-31.
     * @returns {Promise<string>} The name.
     * @throws {FeteDuJourError} When the key is refused, the site does not
     * answer or the answer is not the name of that day.
     */
    async dayName(key, month, day) {
      const url = `${BASE_URL}/${encodeURIComponent(key)}/json-normal-${day}-${month}`;
      let response;
      try {
        response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            ...(userAgent ? { 'User-Agent': userAgent } : {}),
          },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
      } catch (error) {
        throw new FeteDuJourError(
          'unavailable',
          error?.name === 'TimeoutError' ? 'timeout' : error.message,
        );
      }
      if (response.status === 401 || response.status === 403) {
        throw new FeteDuJourError('refused', `HTTP ${response.status}`);
      }
      if (!response.ok) {
        throw new FeteDuJourError('unavailable', `HTTP ${response.status}`);
      }
      let body;
      try {
        body = JSON.parse(await response.text());
      } catch {
        throw new FeteDuJourError('invalid', 'not JSON');
      }
      const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
      if (Number(body?.day) !== day || Number(body?.month) !== month) {
        throw new FeteDuJourError('invalid', `answer for ${body?.day}/${body?.month}`);
      }
      if (name.length === 0 || name.length > NAME_MAX) {
        throw new FeteDuJourError('invalid', 'no name');
      }
      return name;
    },
  };
}

export { BASE_URL, FeteDuJourError, createClient };
