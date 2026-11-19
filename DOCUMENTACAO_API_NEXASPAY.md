# API NexasPay — integração oficial

Base URL: https://nexaspayments.com.br

Este contrato pode ser usado por cassinos, plataformas, ERPs, lojas e também por outra gateway que deseje utilizar a NexasPay como adquirente PIX.

## 1. Segurança e credenciais

- Ative o Google Authenticator antes de gerar as credenciais.
- Guarde Client ID e Client Secret somente no servidor.
- O Client Secret aparece uma única vez.
- Ao gerar um novo par, o anterior e seus tokens são revogados.
- Cadastre o IP público do servidor antes de solicitar saques.

### Regra de taxas da conta

A taxa de depósito ou saque é o maior valor entre o percentual calculado e a taxa mínima configurada para a conta:

```text
taxa = máximo(arredondar(valor × percentual), taxa mínima)
```

Exemplo: com 5% e mínimo de R$ 1,50, uma operação de R$ 10,00 paga R$ 1,50; uma operação de R$ 100,00 paga R$ 5,00. Alterações valem apenas para novas transações.

## 2. Obter token OAuth

```bash
curl -X POST "https://nexaspayments.com.br/v2/oauth/token" \
  -u "$CLIENT_ID:$CLIENT_SECRET" \
  -H "Accept: application/json"
```

Resposta:
```json
{
  "access_token": "nx_live_...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

O token Bearer é válido por 3600 segundos.

## 3. Criar depósito PIX (Cash-in)

```bash
curl -X POST "https://nexaspayments.com.br/v2/pix/qrcode" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: deposito-123" \
  -H "Content-Type: application/json" \
  -d '{
  "amount": "25.50",
  "external_id": "deposito-123",
  "description": "Depósito no saldo",
  "postbackUrl": "https://seusistema.com/webhooks/nexaspay",
  "payer": {
    "name": "Cliente Teste",
    "document": "52998224725",
    "email": "cliente@exemplo.com",
    "phone": "11999999999"
  }
}'
```

Resposta:
```json
{
  "transactionId": "uuid-nexaspay",
  "transaction_id": "uuid-nexaspay",
  "external_id": "deposito-123",
  "qrcode": "000201...",
  "qr_code": "000201...",
  "pixCode": "000201...",
  "status": "PENDING",
  "amount": "25.50",
  "idempotent": false
}
```

Exiba `pixCode` ou `qrcode` ao cliente. Credite o saldo somente após status PAID ou COMPLETED.

## 4. Solicitar saque PIX (Cash-out)

```bash
curl -X POST "https://nexaspayments.com.br/v2/pix/payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: saque-123" \
  -H "Content-Type: application/json" \
  -d '{
  "amount": "20.00",
  "external_id": "saque-123",
  "description": "Saque do cliente",
  "postbackUrl": "https://seusistema.com/webhooks/nexaspay",
  "creditParty": {
    "key": "cliente@exemplo.com",
    "keyType": "EMAIL",
    "name": "Cliente Teste",
    "taxId": "52998224725"
  }
}'
```

Resposta:
```json
{
  "transactionId": "uuid-nexaspay",
  "transaction_id": "uuid-nexaspay",
  "external_id": "saque-123",
  "status": "PROCESSING",
  "message": "Saque recebido para processamento.",
  "idempotent": false
}
```

Tipos de chave: CPF, CNPJ, EMAIL, PHONE e EVP. Nunca repita automaticamente um saque com status UNKNOWN.

## 5. Consultar uma transação

```bash
curl "https://nexaspayments.com.br/v2/pix/status?transactionId=ID_DA_TRANSACAO" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

Resposta:
```json
{
  "transactionId": "uuid-nexaspay",
  "transaction_id": "uuid-nexaspay",
  "external_id": "deposito-123",
  "status": "PAID",
  "type": "CASHIN",
  "amount": "25.50",
  "fee": "0.50",
  "created_at": "2026-09-02 15:30:00",
  "updated_at": "2026-09-02 15:30:08"
}
```

Também são aceitos os parâmetros `transaction_id`, `id` e `external_id`.

## 6. Webhook

Informe uma URL HTTPS pública em `postbackUrl`. A NexasPay envia o aviso e seu servidor confirma o resultado pela consulta autenticada de status antes de alterar qualquer saldo.

```json
{
  "event": "payment.updated",
  "transactionId": "uuid-nexaspay",
  "transaction_id": "uuid-nexaspay",
  "external_id": "deposito-123",
  "paymentType": "CASHIN",
  "transactionType": "CASHIN",
  "status": "PAID",
  "amount": "25.50",
  "updated_at": "2026-09-02 15:30:08"
}
```

- Responda com HTTP 2xx rapidamente.
- Eventos podem ser repetidos; processe pelo `transactionId` de forma idempotente.
- Antes de liberar saldo ou produto, confirme a transação no endpoint de status.

## 7. Exemplo base em PHP

```php
<?php
$baseUrl = 'https://nexaspayments.com.br';
$clientId = getenv('NEXASPAY_CLIENT_ID');
$clientSecret = getenv('NEXASPAY_CLIENT_SECRET');

function nexasRequest(string $method, string $url, array $headers = [], ?array $body = null): array {
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => $body === null ? null : json_encode($body),
        CURLOPT_TIMEOUT => 30,
    ]);
    $raw = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    if ($raw === false) throw new RuntimeException(curl_error($curl));
    $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    if ($status < 200 || $status >= 300) throw new RuntimeException($data['message'] ?? 'Erro NexasPay');
    return $data;
}

$token = nexasRequest('POST', $baseUrl . '/v2/oauth/token', [
    'Authorization: Basic ' . base64_encode($clientId . ':' . $clientSecret),
    'Accept: application/json',
])['access_token'];
```

## 8. Exemplo no backend Node.js

```javascript
const BASE_URL = 'https://nexaspayments.com.br';
const CLIENT_ID = process.env.NEXASPAY_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXASPAY_CLIENT_SECRET;

const basic = Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64');
const tokenResponse = await fetch(BASE_URL + '/v2/oauth/token', {
  method: 'POST',
  headers: { Authorization: 'Basic ' + basic, Accept: 'application/json' }
});
if (!tokenResponse.ok) throw new Error('Falha ao autenticar na NexasPay');
const { access_token } = await tokenResponse.json();

const paymentResponse = await fetch(BASE_URL + '/v2/pix/qrcode', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + access_token,
    'Idempotency-Key': 'deposito-123',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
  "amount": "25.50",
  "external_id": "deposito-123",
  "description": "Depósito no saldo",
  "postbackUrl": "https://seusistema.com/webhooks/nexaspay",
  "payer": {
    "name": "Cliente Teste",
    "document": "52998224725",
    "email": "cliente@exemplo.com",
    "phone": "11999999999"
  }
})
});
const payment = await paymentResponse.json();
if (!paymentResponse.ok) throw new Error(payment.message || 'Falha ao criar PIX');
console.log(payment.pixCode, payment.transactionId);
```

## 9. Mapeamento para outra gateway

| Operação do seu sistema | NexasPay |
| --- | --- |
| Autenticar adquirente | POST /v2/oauth/token |
| Criar cobrança/depósito | POST /v2/pix/qrcode |
| Criar pagamento/saque | POST /v2/pix/payment |
| Consultar operação | GET /v2/pix/status |
| Receber aviso | postbackUrl HTTPS; confirme em /v2/pix/status |

## 10. Erros

Erros usam JSON no formato:
```json
{
  "ok": false,
  "message": "Descrição segura do erro",
  "errors": {}
}
```

- 401: credencial ou token inválido/expirado.
- 403: operação, conta ou IP não autorizado.
- 404: rota ou transação não encontrada.
- 422: dados inválidos ou operação recusada.
- 429: limite de requisições atingido.
- 500/502: erro ou resposta inconclusiva; consulte o status antes de repetir.

Valores monetários são enviados em reais com duas casas decimais. Use uma `Idempotency-Key` única e estável por operação.