import test from 'node:test';
import assert from 'node:assert/strict';
import { enforceEditPermission, enforcePublishPermission } from '../../src/server/access/authoring-guard';
import { BiohubAccessService } from '../../src/server/access/biohub-access-service';

const service = new BiohubAccessService();

test('escrita bloqueada quando não pode editar', () => {
  const perms = service.toPermissions({ tier: 'none', source: 'ethos' });
  const out = enforceEditPermission(perms);
  assert.equal(out?.success, false);
  assert.equal(out?.code, 'FORBIDDEN');
});

test('publicação bloqueada quando não pode publicar', () => {
  const perms = service.toPermissions({ tier: 'blocked', source: 'ethos' });
  const out = enforcePublishPermission(perms);
  assert.equal(out?.success, false);
  assert.equal(out?.code, 'FORBIDDEN');
});

test('página pública continua acessível em trial expirado/offline ETHOS', () => {
  const expired = service.toPermissions({ tier: 'trial', trialActive: false, source: 'ethos' });
  const offline = service.toPermissions({ tier: 'none', source: 'offline-fallback' });
  assert.equal(expired.readOnly, true);
  assert.equal(offline.readOnly, true);
  // contrato retrocompatível: leitura não é bloqueada pelo guard
  assert.equal(enforceEditPermission({ ...expired, canEdit: true }), null);
});
