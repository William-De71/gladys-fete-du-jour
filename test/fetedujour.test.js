// The fetedujour.fr client: the URL it asks, and how it reads a refusal, an
// outage or an answer that is not a name. No network: a fake fetch.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient, FeteDuJourError } from '../src/fetedujour.js';
import { fakeFetch } from './helpers.js';

test('one day, as documented: /api/v2/<key>/json-normal-<day>-<month>', async () => {
  const fetch = fakeFetch({ name: () => '  Valérie ' });
  const client = createClient({ fetch, userAgent: 'test' });
  assert.equal(await client.dayName('abc123', 4, 28), 'Valérie');
  assert.deepEqual(fetch.calls, ['https://fetedujour.fr/api/v2/abc123/json-normal-28-4']);
});

test('a refused key, an outage, an answer that is not the name of that day', async () => {
  const kind = async (fetch) => {
    try {
      await createClient({ fetch }).dayName('k1234', 4, 28);
    } catch (error) {
      assert.ok(error instanceof FeteDuJourError);
      return error.kind;
    }
    return 'none';
  };
  assert.equal(await kind(fakeFetch({ status: () => 403 })), 'refused');
  assert.equal(await kind(fakeFetch({ status: () => 401 })), 'refused');
  assert.equal(await kind(fakeFetch({ status: () => 503 })), 'unavailable');
  assert.equal(
    await kind(async () => {
      throw new Error('ECONNREFUSED');
    }),
    'unavailable',
  );
  assert.equal(
    await kind(async () => ({ status: 200, ok: true, text: async () => '<html>' })),
    'invalid',
  );
  assert.equal(
    await kind(async () => ({
      status: 200,
      ok: true,
      text: async () => JSON.stringify({ day: 1, month: 1, name: 'Basile' }),
    })),
    'invalid',
  );
  assert.equal(await kind(fakeFetch({ name: () => '' })), 'invalid');
});
