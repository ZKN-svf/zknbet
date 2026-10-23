// ============================================================
// ZKNbet — Configuração central de API
// ============================================================
const ZKN_CONFIG = {
  apiBase: 'https://zknbet-api.gabrielrobin63.workers.dev/api',

  // Sempre usa produção (o Worker deployado já está com tudo funcionando)
  get api() {
    return this.apiBase;
  },
};

window.ZKN_CONFIG = ZKN_CONFIG;