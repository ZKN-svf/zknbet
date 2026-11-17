// ============================================================
// ZKNbet — Configuração central de API
// ============================================================
const ZKN_API_BASE = 'https://zknbet-api.gabrielrobin63.workers.dev/api';

const ZKN_CONFIG = {
  apiBase: ZKN_API_BASE,

  // Sempre usa produção (o Worker deployado já está com tudo funcionando)
  get api() {
    return this.apiBase;
  },
};

// Expõe a URL da API para todo o frontend (evita repetir o fallback em cada arquivo)
window.ZKN_API = ZKN_API_BASE;
window.ZKN_CONFIG = ZKN_CONFIG;
