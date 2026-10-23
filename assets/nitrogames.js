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
  try {
    const res = await fetch(_apiBase() + '/nitrogames/games');
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.sucesso) {
      return { sucesso: false, mensagem: data.mensagem || 'Erro ao listar jogos', jogos: [] };
    }
    return { sucesso: true, jogos: data.jogos || [] };
  } catch (e) {
    return { sucesso: false, mensagem: 'Erro de conexao: ' + e.message, jogos: [] };
  }
}

async function listarProvedores() {
  try {
    const res = await fetch(_apiBase() + '/nitrogames/providers');
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.sucesso) {
      return { sucesso: false, mensagem: data.mensagem || 'Erro', provedores: [] };
    }
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
