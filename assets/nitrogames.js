// ============================================================
// NITROGAMES CLIENT (frontend) — chama o Worker
// ============================================================

function _apiBase() {
  return (window.ZKN_CONFIG && window.ZKN_CONFIG.api) || 'https://zknbet-api.gabrielrobin63.workers.dev/api';
}

function _authHeaders() {
  const token = (window.ZKNAuth && window.ZKNAuth.getToken && window.ZKNAuth.getToken()) || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  };
}

async function listarJogos() {
  const CACHE_KEY = 'zkn_games_cache_v1';
  const TTL = 5 * 60 * 1000; // 5 min

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < TTL) {
        return { sucesso: true, jogos: data };
      }
    }
  } catch {}

  try {
    const res = await fetch(_apiBase() + '/nitrogames/games');
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.sucesso) {
      return { sucesso: false, mensagem: data.mensagem || 'Erro ao listar jogos', jogos: [] };
    }
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data.jogos || [], timestamp: Date.now() }));
    } catch {}
    return { sucesso: true, jogos: data.jogos || [] };
  } catch (e) {
    return { sucesso: false, mensagem: 'Erro de conexao: ' + e.message, jogos: [] };
  }
}

async function listarProvedores() {
  const CACHE_KEY = 'zkn_providers_cache_v1';
  const TTL = 5 * 60 * 1000;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < TTL) {
        return { sucesso: true, provedores: data };
      }
    }
  } catch {}

  try {
    const res = await fetch(_apiBase() + '/nitrogames/providers');
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.sucesso) {
      return { sucesso: false, mensagem: data.mensagem || 'Erro', provedores: [] };
    }
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data.provedores || [], timestamp: Date.now() }));
    } catch {}
    return { sucesso: true, provedores: data.provedores || [] };
  } catch (e) {
    return { sucesso: false, mensagem: 'Erro de conexao', provedores: [] };
  }
}

async function abrirJogo(gameCode, userEmail) {
  try {
    const res = await fetch(_apiBase() + '/nitrogames/launch', {
      method: 'POST',
      headers: _authHeaders(),
      body: JSON.stringify({ game_code: gameCode, user_email: userEmail || '' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { sucesso: false, mensagem: data.message || data.msg || 'Erro ao abrir jogo' };
    return { sucesso: true, launch_url: data.launch_url };
  } catch (e) {
    return { sucesso: false, mensagem: 'Erro de conexao: ' + e.message };
  }
}

window.NitroGames = { listarJogos, listarProvedores, abrirJogo };
