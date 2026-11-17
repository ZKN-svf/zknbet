# ZKNbet — Frontend

Site institucional e área do jogador da ZKNbet (HTML, CSS e JavaScript puro, sem etapa de build).

## Estrutura

```
.
├── index.html              # Home (jogos, banners, ticker)
├── admin.html              # Painel administrativo (protegido pela API)
├── jogos.html              # Catálogo de jogos
├── provedoras.html         # Provedoras
├── favoritos.html          # Jogos favoritos do jogador
├── deposito.html           # Depósito via PIX
├── saque.html              # Saque via PIX (PIN + verificação de e-mail)
├── historico.html          # Histórico de transações
├── indicacao.html          # Programa de indicação
├── recompensas.html        # Bônus diário, cashback e roleta
├── ofertas.html            # Ofertas de bônus de depósito
├── minha-conta.html        # Dados da conta
├── login / cadastro / ...  # Fluxo de autenticação
├── assets/
│   ├── config.js           # URL central da API (window.ZKN_API)
│   ├── auth.js             # Sessão, JWT e chamadas autenticadas
│   ├── app.js              # Header, drawer, saldo, toasts e utilidades
│   ├── rapidverse.js       # Catálogo/launch de jogos (RapidVerse)
│   ├── style.css           # Design system
│   ├── icons.css           # Ícones
│   └── ...                 # PIX, bônus, navegação
├── img/                    # Capas de jogos
└── backups/                # Backups locais (ignorado pelo git)
```

## Configuração

Toda a comunicação com o backend passa por `assets/config.js`:

```js
const ZKN_API_BASE = 'https://zknbet-api.gabrielrobin63.workers.dev/api';
window.ZKN_API = ZKN_API_BASE;
window.ZKN_CONFIG = { apiBase: ZKN_API_BASE, get api() { return this.apiBase; } };
```

Para apontar para outro ambiente, altere apenas `ZKN_API_BASE` nesse arquivo.

> O backend (Cloudflare Worker) é mantido em repositório separado. Este repositório contém somente o frontend.

## Rodando localmente

Por ser estático, basta servir a pasta com qualquer servidor HTTP:

```bash
npx serve .
# ou
python -m http.server 8080
```

Abra `http://localhost:8080`. Não abra via `file://`, pois o login e as chamadas à API dependem de origem HTTP.

## Deploy

O projeto é publicado no Cloudflare Pages (projeto `zknbet`):

```bash
npx wrangler pages deploy . --project-name zknbet
```

## Convenções

- Não versione `.wrangler/` (cache/credenciais).
- Backups locais ficam em `backups/` (ignorado pelo git). Não espalhe arquivos `.bak*` na raiz.
- O catálogo de jogos usa **RapidVerse** (`assets/rapidverse.js`, exposto como `window.Rapidverse`).
- Sempre escape dados vindos da API antes de inserir via `innerHTML`:
  - `escapeHtml(valor)` para texto/atributos HTML;
  - `escapeJsAttr(valor)` para valores dentro de `onclick="..."`.
- Prefira `textContent` quando o conteúdo for apenas texto.
