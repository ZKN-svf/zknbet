// ============================================================
// ZKNbet — Favoritos + Recentes + Render de cards
// ============================================================

let _favsCache = [];
let _recentesCache = [];

// ---------- Favoritos ----------
async function carregarFavoritos() {
  if (!window.ZKNAuth || !window.ZKNAuth.isLoggedIn()) {
    _favsCache = [];
    return [];
  }
  _favsCache = (await window.ZKNAuth.getFavoritos()) || [];
  return _favsCache;
}

function getFavoritos() {
  return _favsCache || [];
}

function isFavorito(code) {
  return _favsCache.indexOf(code) !== -1;
}

async function toggleFavorito(code) {
  if (!window.ZKNAuth || !window.ZKNAuth.isLoggedIn()) {
    if (typeof ZKN !== 'undefined') ZKN.toast('Faça login', 'Entre para favoritar jogos.', 'warning');
    return null;
  }

  var jaFav = isFavorito(code);
  var novaLista = jaFav
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
      jaFav ? '' : 'Você pode acessar em Favoritos.',
      jaFav ? 'warning' : 'success'
    );
  }

  if (window.__FAV_PAGE_RERENDER__) window.__FAV_PAGE_RERENDER__();
  return !jaFav;
}

// ---------- Toggle do botão ----------
async function toggleFav(btn, code) {
  if (btn) btn.disabled = true;

  try {
    var agoraFav = await toggleFavorito(code);

    if (agoraFav === null) {
      if (btn) btn.disabled = false;
      return;
    }

    if (btn) {
      if (agoraFav) btn.classList.add('active');
      else btn.classList.remove('active');
      btn.textContent = agoraFav ? '★' : '☆';
      btn.title = agoraFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
      btn.disabled = false;
    }
  } catch (e) {
    if (btn) btn.disabled = false;
    console.error('[toggleFav]', e);
  }
}

// ---------- Recentes ----------
async function carregarRecentes() {
  if (!window.ZKNAuth || !window.ZKNAuth.isLoggedIn()) {
    _recentesCache = [];
    return [];
  }
  _recentesCache = (await window.ZKNAuth.getRecentes()) || [];
  return _recentesCache;
}

function getRecentes() {
  return _recentesCache || [];
}

async function registrarRecente(code) {
  if (!window.ZKNAuth || !window.ZKNAuth.isLoggedIn()) return;
  var nova = await window.ZKNAuth.addRecente(code);
  if (nova) _recentesCache = nova;
  if (window.__RECENTES_UPDATED__) window.__RECENTES_UPDATED__();
}

// ---------- Render: botão de favoritar ----------
function renderFavButton(gameCode) {
  var fav = isFavorito(gameCode);
  return '<button class="game-card-fav ' + (fav ? 'active' : '') + '" ' +
    'onclick="event.stopPropagation(); ZKNGamesLib.toggleFav(this, \'' + gameCode + '\')" ' +
    'aria-label="' + (fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '" ' +
    'title="' + (fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '">' +
    (fav ? '★' : '☆') + '</button>';
}

// ---------- Render: card individual ----------
function renderGameCard(j) {
  var capa = j.image_url || '';
  var inicial = (j.name || '?').charAt(0).toUpperCase();
  var nomeEsc = (j.name || '').replace(/'/g, "\\'");
  var nomeSafe = (j.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  var providerSafe = (j.provider_name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  var coverHtml;
  if (capa) {
    coverHtml = '<img src="' + capa + '" alt="' + nomeSafe + '" loading="lazy" ' +
      'onerror="this.style.display=\'none\';this.parentNode.insertBefore(document.createTextNode(\'' + inicial + '\'),this.nextSibling)">';
  } else {
    coverHtml = inicial;
  }

  return '<div class="game-card" onclick="ZKNGamesLib.abrirJogo(\'' + j.game_code + '\', \'' + nomeEsc + '\')">' +
    renderFavButton(j.game_code) +
    '<div class="game-card-cover">' +
      coverHtml +
      '<div class="game-card-play"><div class="play-btn">&#9654;</div></div>' +
    '</div>' +
    '<div class="game-card-info">' +
      '<div class="game-card-name" title="' + nomeSafe + '">' + nomeSafe + '</div>' +
      '<div class="game-card-provider">' + providerSafe + '</div>' +
    '</div>' +
  '</div>';
}

// ---------- Render: seção inteira ----------
function renderGameSection(containerEl, jogos) {
  if (!containerEl) return;
  if (!jogos || jogos.length === 0) {
    containerEl.innerHTML = '<div class="game-card" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Nenhum jogo para mostrar.</div>';
    return;
  }
  containerEl.innerHTML = jogos.map(function(j) { return renderGameCard(j); }).join('');
}

// ---------- Abrir jogo ----------
async function abrirJogo(code, nome) {
  if (!window.ZKNAuth || !window.ZKNAuth.isLoggedIn()) {
    if (typeof ZKN !== 'undefined') ZKN.toast('Faça login', 'Entre para jogar.', 'warning');
    setTimeout(function() {
      location.href = 'login.html?back=' + encodeURIComponent(location.pathname.split('/').pop());
    }, 800);
    return;
  }

  await registrarRecente(code);

  var user = window.ZKNAuth.getUser();
  var email = '';
  if (user && user.email) email = user.email;
  else if (user && user.phone) email = user.phone + '@zknbet.com';

  if (typeof ZKN !== 'undefined') ZKN.toast('Abrindo jogo...', nome || code);

  if (!window.NitroGames || !window.NitroGames.abrirJogo) {
    if (typeof ZKN !== 'undefined') ZKN.toast('Erro', 'NitroGames não carregou.', 'error');
    return;
  }

  var res = await window.NitroGames.abrirJogo(code, email);
  if (res.sucesso && res.launch_url) {
    // SOLUÇÃO FINAL: abrir em nova aba (fora do iframe)
    // Isso resolve o problema de cookies de terceiros
    if (window.ZKNGameFrame && window.ZKNGameFrame.abrir) { window.ZKNGameFrame.abrir(res.launch_url, nome || code); } else { if (window.ZKNGameFrame && window.ZKNGameFrame.abrir) { window.ZKNGameFrame.abrir(res.launch_url, nome || code); } else { window.open(res.launch_url, '_blank', 'noopener'); } }
  } else if (typeof ZKN !== 'undefined') {
    ZKN.toast('Erro ao abrir jogo', res.mensagem || 'Tente novamente.', 'error');
  }
}

// ---------- Exporta ----------
window.ZKNGamesLib = {
  carregarFavoritos: carregarFavoritos,
  getFavoritos: getFavoritos,
  isFavorito: isFavorito,
  toggleFavorito: toggleFavorito,
  toggleFav: toggleFav,
  carregarRecentes: carregarRecentes,
  getRecentes: getRecentes,
  registrarRecente: registrarRecente,
  renderFavButton: renderFavButton,
  renderGameCard: renderGameCard,
  renderGameSection: renderGameSection,
  abrirJogo: abrirJogo,
};
