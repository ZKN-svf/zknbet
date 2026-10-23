// ============================================================
// ZKNbet — Favoritos + Recentes (API na conta)
// ============================================================

// Cache em memória da sessão (evita refetch a cada render)
let _favsCache = [];
let _recentesCache = [];

async function carregarFavoritos() {
  if (!window.ZKNAuth?.isLoggedIn?.()) { _favsCache = []; return []; }
  _favsCache = await window.ZKNAuth.getFavoritos();
  return _favsCache;
}
async function carregarRecentes() {
  if (!window.ZKNAuth?.isLoggedIn?.()) { _recentesCache = []; return []; }
  _recentesCache = await window.ZKNAuth.getRecentes();
  return _recentesCache;
}

function getFavoritos() { return _favsCache; }
function getRecentes() { return _recentesCache; }
function isFavorito(code) { return _favsCache.includes(code); }

async function toggleFavorito(code) {
  if (!window.ZKNAuth?.isLoggedIn?.()) {
    if (typeof ZKN !== 'undefined') ZKN.toast('Faça login', 'Entre para favoritar jogos.', 'warning');
    return null;
  }
  const jaFav = isFavorito(code);
  const novaLista = jaFav
    ? await window.ZKNAuth.removerFavorito(code)
    : await window.ZKNAuth.addFavorito(code);

  if (novaLista === null) {
    if (typeof ZKN !== 'undefined') ZKN.toast('Erro', 'Não foi possível atualizar favoritos.', 'error');
    return null;
  }
  _favsCache = novaLista;

  if (typeof ZKN !== 'undefined') {
    ZKN.toast(
      jaFav ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
      jaFav ? '' : 'Você pode acessar em ⭐ Favoritos.',
      jaFav ? 'warning' : 'success'
    );
  }
  if (window.__FAV_PAGE_RERENDER__) window.__FAV_PAGE_RERENDER__();
  return !jaFav;
}

async function registrarRecente(code) {
  if (!window.ZKNAuth?.isLoggedIn?.()) return;
  const nova = await window.ZKNAuth.addRecente(code);
  if (nova) _recentesCache = nova;
  if (window.__RECENTES_UPDATED__) window.__RECENTES_UPDATED__();
}

// ---------- Render ----------
function renderGameCard(j, opts = {}) {
  const fav = isFavorito(j.game_code);
  const initial = (j.game_name || '?').charAt(0).toUpperCase();

  const favBtn = `
    <button class="game-card-fav ${fav ? 'active' : ''}"
            onclick="event.stopPropagation(); ZKNGamesLib.toggleFavCard(this, '${j.game_code}')"
            aria-label="${fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
            title="${fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
      ${fav ? '★' : '☆'}
    </button>
  `;

  return `
    <div class="game-card" onclick="ZKNGamesLib.abrirJogo('${j.game_code}')">
      ${favBtn}
      <div class="game-card-cover">
        ${j.cover ? `<img src="${j.cover}" alt="${j.game_name}">` : initial}
        <div class="game-card-play"><div class="play-btn">▶</div></div>
      </div>
      <div class="game-card-info">
        <div class="game-card-name" title="${j.game_name}">${j.game_name}</div>
        <div class="game-card-provider">${j.provider?.name || ''}</div>
      </div>
    </div>
  `;
}

async function toggleFavCard(btn, code) {
  btn.disabled = true;
  const agoraFav = await toggleFavorito(code);
  btn.disabled = false;
  if (agoraFav === null) return;

  btn.classList.toggle('active', agoraFav);
  btn.textContent = agoraFav ? '★' : '☆';
  btn.title = agoraFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
}

async function abrirJogo(code) {
  if (!window.ZKNAuth?.isLoggedIn?.()) {
    if (typeof ZKN !== 'undefined') ZKN.toast('Faça login', 'Entre para jogar.', 'warning');
    setTimeout(() => location.href = 'login.html?back=' + encodeURIComponent(location.pathname.split('/').pop()), 800);
    return;
  }

  await registrarRecente(code);

  const user = window.ZKNAuth.getUser();
  const email = user?.email || (user?.phone ? `${user.phone}@zknbet.com` : '');

  const res = await NitroGames.abrirJogo(code, email);
  if (res.sucesso) {
    window.open(res.launch_url, '_blank');
  } else if (typeof ZKN !== 'undefined') {
    ZKN.toast('Erro ao abrir jogo', res.mensagem || 'Tente novamente.', 'error');
  }
}

function renderGameSection(containerEl, jogos) {
  if (!containerEl) return;
  if (!jogos || jogos.length === 0) {
    containerEl.innerHTML = `<div class="game-card" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Nenhum jogo para mostrar.</div>`;
    return;
  }
  containerEl.innerHTML = jogos.map(j => renderGameCard(j)).join('');
}

window.ZKNGamesLib = {
  carregarFavoritos, carregarRecentes,
  getFavoritos, getRecentes, isFavorito,
  toggleFavorito, registrarRecente,
  renderGameCard, renderGameSection,
  toggleFavCard, abrirJogo,
};