import test from 'node:test';
import assert from 'node:assert/strict';
import { EthosAccessClient } from '../../src/server/access/ethos-access-client';

test('parsing de 200/401/403/429/503', () => {
  const c = new EthosAccessClient({ baseUrl: 'http://x' });
  assert.deepEqual(c.parseResponse(200, { tier: 'bundle' }).tier, 'bundle');
  assert.deepEqual(c.parseResponse(401, null).tier, 'none');
  assert.deepEqual(c.parseResponse(403, null).tier, 'none');
  assert.deepEqual(c.parseResponse(429, null).source, 'offline-fallback');
  assert.deepEqual(c.parseResponse(503, null).source, 'offline-fallback');
});

test('timeout/retry', async () => {
  let calls = 0;
  // @ts-ignore
  global.fetch = async () => {
    calls++;
    throw new Error('timeout');
  };
  const c = new EthosAccessClient({ baseUrl: 'http://x', maxRetries: 2, timeoutMs: 1 });
  const out = await c.getAccess('p1');
  assert.equal(calls, 3);
  assert.equal(out.source, 'offline-fallback');
});

test('cache TTL evitando chamadas excessivas', async () => {
  let calls = 0;
  // @ts-ignore
  global.fetch = async () => {
    calls++;
    return { status: 200, ok: true, json: async () => ({ tier: 'standalone' }) };
  };
  const c = new EthosAccessClient({ baseUrl: 'http://x', ttlMs: 1000 });
  await c.getAccess('p2');
  await c.getAccess('p2');
  assert.equal(calls, 1);
});
