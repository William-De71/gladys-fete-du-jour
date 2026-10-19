// Shared helpers of the tests: a silent logger and a fake fetedujour.fr.
// Tests never touch the network.

const silent = { info() {}, warn() {}, error() {}, debug() {} };

/**
 * @description A fake `fetch` answering like fetedujour.fr.
 * @param {object} [options] - Options.
 * @param {Function} [options.name] - `(day, month) => string`, the name answered.
 * @param {Function} [options.status] - `(day, month) => number`, the HTTP status.
 * @returns {Function & { calls: string[] }} The fake, with the URLs asked.
 */
function fakeFetch({ name = (day, month) => `Nom ${day}/${month}`, status = () => 200 } = {}) {
  const calls = [];
  const fetch = async (url) => {
    calls.push(url);
    const [, day, month] = /json-normal-(\d+)-(\d+)$/.exec(url).map(Number);
    const code = status(day, month);
    return {
      status: code,
      ok: code >= 200 && code < 300,
      text: async () => JSON.stringify({ day, month, name: name(day, month) }),
    };
  };
  fetch.calls = calls;
  return fetch;
}

export { silent, fakeFetch };
