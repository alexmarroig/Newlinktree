# RELATÓRIO DE INTEGRAÇÃO — BIOHUB ⇄ ETHOS

## 1) Endpoints do ETHOS que o BIOHUB espera consumir

> **Observação importante:** hoje o repositório tem **2 clientes de acesso** em paralelo (um legado e um novo), com **paths/payloads diferentes**. Para compatibilidade total, o ETHOS deve cobrir ambos até haver consolidação.

### 1.1 Validação de acesso (fluxo novo)
- **URL:** `POST {ETHOS_API_BASE_URL}/api/integrations/biohub/access`
- **Auth:** `Authorization: Bearer {ETHOS_API_TOKEN}`
- **Headers:** `Content-Type: application/json`
- **Request body:**
  ```json
  {
    "user_id": "string",
    "tenant_id": "string (opcional)"
  }
  ```
- **Response 2xx esperada (qualquer um dos campos abaixo):**
  ```json
  {
    "has_access": true
  }
  ```
  ou
  ```json
  {
    "access": true
  }
  ```
  ou
  ```json
  {
    "allowed": true
  }
  ```

### 1.2 Validação de acesso (fluxo legado ainda em uso)
- **URL:** `POST {ETHOS_API_BASE_URL}/biohub/access`
- **Auth:** `Authorization: Bearer {ETHOS_API_TOKEN}`
- **Headers:** `Content-Type: application/json`
- **Request body:**
  ```json
  {
    "userId": "string",
    "pageId": "string (opcional)",
    "action": "string"
  }
  ```
- **Response 2xx esperada:**
  ```json
  {
    "allowed": true
  }
  ```

### 1.3 (Opcional, mas suportado) Validação de token SSO
- **URL:** `POST {ETHOS_SSO_VALIDATE_ENDPOINT}`
- **Auth:** sem header obrigatório no cliente atual (somente body JSON)
- **Headers:** `Content-Type: application/json`
- **Request body:**
  ```json
  {
    "token": "jwt"
  }
  ```
- **Response 2xx esperada:**
  ```json
  {
    "valid": true,
    "payload": {
      "user_id": "string",
      "tenant_id": "string",
      "session_id": "string",
      "issued_at": 1710000000,
      "exp": 1710003600,
      "requires_upgrade": false
    }
  }
  ```

---

## 2) Campos obrigatórios do payload de acesso (com tipos)

### 2.1 Fluxo novo (`/api/integrations/biohub/access`)
- `user_id` (**string**, obrigatório)
- `tenant_id` (**string**, opcional)

### 2.2 Fluxo legado (`/biohub/access`)
- `userId` (**string**, obrigatório)
- `action` (**string**, obrigatório)
- `pageId` (**string**, opcional)

### 2.3 Payload de resposta para liberar acesso
- Pelo menos um dos campos booleanos com `true` no fluxo novo:
  - `has_access` (**boolean**) **ou**
  - `access` (**boolean**) **ou**
  - `allowed` (**boolean**)
- No fluxo legado:
  - `allowed` (**boolean**) deve ser `true`

---

## 3) Códigos de status tratados e comportamento do BIOHUB

### `200`
- **Fluxo novo:** avalia body para decidir acesso total (`full`) ou bloqueio (`none`).
- **Fluxo legado:** só permite se `allowed === true`; caso contrário bloqueia.

### `401`
- **Fluxo novo:** nega acesso (`mode: none`, `reason: invalid_session`).
- **Fluxo legado:** tratado como negação de acesso (erro para o usuário).

### `403`
- **Fluxo novo:** nega acesso (`mode: none`, `reason: no_access`).
- **Fluxo legado:** tratado como negação de acesso (erro para o usuário).

### `429`
- **Fluxo novo:** entra em modo degradado (`read_only`, `reason: degraded`), com retry/backoff.
- **Fluxo legado:** sem fallback explícito de leitura; chamada falha/nega conforme resposta final.

### `503`
- **Fluxo novo:** entra em modo degradado (`read_only`, `reason: degraded`), com retry/backoff.
- **Fluxo legado:** falha (inclui timeout como indisponibilidade) e retorna erro de integração.

---

## 4) Feature flags e env vars necessárias no BIOHUB

### Feature flag
- `BIOHUB_ETHOS_INTEGRATION_ENABLED`
  - `false` (default): integração desativada (comportamento legado local)
  - `true`: exige config válida de ETHOS

### Variáveis obrigatórias quando flag = `true`
- `ETHOS_API_BASE_URL` (URL base do ETHOS)
- `ETHOS_API_TOKEN` (token Bearer server-to-server)

### Variáveis recomendadas/configuráveis
- `ETHOS_ACCESS_CACHE_TTL_SECONDS` (default: `60`)
- `ETHOS_REQUEST_TIMEOUT_MS` (default: `3000`)
- `ETHOS_UPGRADE_URL` (default: `https://ethos.biohub.app/upgrade`)
- `ETHOS_SSO_VALIDATE_ENDPOINT` (opcional, ativa validação remota de SSO)

---

## 5) Fluxos que quebram se ETHOS não implementar algo

1. **Sem endpoint de acesso novo** (`/api/integrations/biohub/access`):
   - camadas que usam o cliente novo não conseguem validar corretamente acesso (sem “full/none/read_only” esperado).
2. **Sem endpoint legado** (`/biohub/access`):
   - ações server-side que chamam `BiohubAccessService.assertAccess(...)` podem bloquear edição/publicação.
3. **Sem tratamento correto de 401/403:**
   - usuários bloqueados/sessão inválida podem receber comportamento inconsistente.
4. **Sem tratamento de 429/503 estável:**
   - risco de indisponibilidade em picos, especialmente onde se espera fallback degradado.
5. **Sem endpoint SSO (quando configurado):**
   - validação cai para chave pública local; se também não houver chave, login SSO falha.

---

## 6) Checklist mínimo para ETHOS ficar compatível

- [ ] Implementar `POST /api/integrations/biohub/access` com Bearer token.
- [ ] Implementar `POST /biohub/access` com Bearer token (enquanto legado existir).
- [ ] Aceitar payloads nos dois formatos (`snake_case` e `camelCase`, conforme endpoints acima).
- [ ] Responder JSON válido mesmo em erro (evita parsing inconsistente).
- [ ] Garantir semântica de status:
  - `200` com booleano de autorização no body.
  - `401` para sessão/token inválido.
  - `403` para sem permissão/plano.
  - `429` rate limit.
  - `503` indisponibilidade.
- [ ] Manter latência compatível com timeout de 3s (ou alinhar timeout/env no BIOHUB).
- [ ] (Opcional) Expor endpoint de validação SSO (`ETHOS_SSO_VALIDATE_ENDPOINT`).

---

## 7) Exemplo de curl (teste ponta a ponta)

### 7.1 Endpoint novo
```bash
curl -i -X POST "$ETHOS_API_BASE_URL/api/integrations/biohub/access" \
  -H "Authorization: Bearer $ETHOS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "9e7c3f24-0ec2-4fe7-b6f6-3f236e38a901",
    "tenant_id": "biohub-prod"
  }'
```

### 7.2 Endpoint legado
```bash
curl -i -X POST "$ETHOS_API_BASE_URL/biohub/access" \
  -H "Authorization: Bearer $ETHOS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "9e7c3f24-0ec2-4fe7-b6f6-3f236e38a901",
    "pageId": "f2fcb2ff-3e0d-4c4c-9f35-258a1887153d",
    "action": "write"
  }'
```
