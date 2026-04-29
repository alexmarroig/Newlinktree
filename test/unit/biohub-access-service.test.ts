import test from 'node:test';
import assert from 'node:assert/strict';
import { BiohubAccessService } from '../../src/server/access/biohub-access-service';

const service = new BiohubAccessService();

test('trial ativo permite edição', () => {
  const out = service.toPermissions({ tier: 'trial', trialActive: true, source: 'ethos' });
  assert.equal(out.canEdit, true);
});

test('trial expirado bloqueia edição', () => {
  const out = service.toPermissions({ tier: 'trial', trialActive: false, source: 'ethos' });
  assert.equal(out.canEdit, false);
  assert.equal(out.canPublish, false);
});

test('bundle/standalone/ambassador permitem edição', () => {
  for (const tier of ['bundle', 'standalone', 'ambassador'] as const) {
    const out = service.toPermissions({ tier, source: 'ethos' });
    assert.equal(out.canEdit, true);
    assert.equal(out.canPublish, true);
  }
});

test('blocked/none bloqueiam edição/publicação', () => {
  for (const tier of ['blocked', 'none'] as const) {
    const out = service.toPermissions({ tier, source: 'ethos' });
    assert.equal(out.canEdit, false);
    assert.equal(out.canPublish, false);
  }
});

test('fallback offline mantém somente leitura', () => {
  const out = service.toPermissions({ tier: 'bundle', source: 'offline-fallback' });
  assert.equal(out.readOnly, true);
  assert.equal(out.canEdit, false);
});
