// Helpers locais (usa os globais de app.js quando disponíveis)
function _esc(v) {
  if (window.escapeHtml) return window.escapeHtml(v);
  return String(v == null ? '' : v).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function _escAttr(v) {
  if (window.escapeJsAttr) return window.escapeJsAttr(v);
  return _esc(String(v == null ? '' : v)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029'));
}

// Traduz mensagens do backend para o usuario
function _traduzirMensagem(msg) {
  if (!msg) return msg;
  var m = String(msg);
  if (m.indexOf("AGENT_WALLET_EMPTY") !== -1) return "EM MANUTENÇÃO!!";
  return m;
}
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
    'onclick="event.stopPropagation(); ZKNGamesLib.toggleFav(this, \'' + _escAttr(gameCode) + '\')" ' +
    'aria-label="' + (fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '" ' +
    'title="' + (fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '">' +
    (fav ? '★' : '☆') + '</button>';
}

function _onCoverError(img) {
  var fb = img.getAttribute('data-fb');
  if (fb && !img.dataset.tentou) {
    img.dataset.tentou = '1';
    img.src = fb;
    return;
  }
  img.style.display = 'none';
  if (img.parentNode && !img.parentNode.querySelector('.fallback-txt')) {
    var span = document.createElement('span');
    span.className = 'fallback-txt';
    span.textContent = img.getAttribute('data-inicial') || '?';
    span.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;color:var(--gold);';
    img.parentNode.appendChild(span);
  }
}

// ---------- Render: card individual ----------
function renderGameCard(j) {
  var capa = j.image_url || '';
  var fallback = j.fallback_image_url || '';
  var inicial = (j.name || '?').charAt(0).toUpperCase();
  var nomeSafe = _esc(j.name);
  var providerSafe = _esc(j.provider_name || '');

  var coverHtml;
  if (capa) {
    coverHtml = '<img src="' + _esc(capa) + '" alt="' + nomeSafe + '" loading="lazy" decoding="async" ' +
      'data-fb="' + _esc(fallback) + '" data-inicial="' + _esc(inicial) + '" ' +
      'onerror="ZKNGamesLib._onCoverError(this)">';
  } else {
    coverHtml = '<span class="fallback-txt" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;color:var(--gold);">' + _esc(inicial) + '</span>';
  }

  var rtpVal = Number(j.rtp || 0);
  var rtpBadge = (Number.isFinite(rtpVal) && rtpVal > 0)
    ? '<span class="game-card-rtp">' + rtpVal.toFixed(1) + '% RTP</span>'
    : '';

  return '<div class="game-card" onclick="ZKNGamesLib.abrirJogo(\'' + _escAttr(j.game_code) + '\', \'' + _escAttr(j.name) + '\')">' +
    renderFavButton(j.game_code) +
    '<div class="game-card-cover">' +
      coverHtml +
      rtpBadge +
      '<div class="game-card-play"><div class="play-btn">&#9654;</div></div>' +
    '</div>' +
    '<div class="game-card-info">' +
      '<div class="game-card-name" title="' + nomeSafe + '">' + nomeSafe + '</div>' +
      '<div class="game-card-provider">' + providerSafe + '</div>' +
    '</div>' +
  '</div>';
}

// ---------- Skeletons e Classificacao de categorias ----------
function renderSkeletons(containerEl, count) {
  if (!containerEl) return;
  var n = Math.max(4, Math.min(24, Number(count || 12)));
  var html = '';
  for (var i = 0; i < n; i++) {
    html += '<div class="skeleton-card" aria-hidden="true">' +
      '<div class="skeleton-thumb"></div>' +
      '<div class="skeleton-line"></div>' +
      '<div class="skeleton-line short"></div>' +
    '</div>';
  }
  containerEl.innerHTML = html;
}

function classificarCategoria(j) {
  var tipo = String(j.game_type || '').toLowerCase();
  var nome = String(j.name || '').toLowerCase();
  if (/crash|instant|arcade|mine|plinko/.test(tipo) || /\b(aviator|spaceman|mines|plinko|crash|jetx|penalty|dice|goal|hi-?lo|limbo|keno)\b/.test(nome)) {
    return 'crash';
  }
  if (/table|live|card|roulette|blackjack/.test(tipo) || /\b(roulette|roleta|blackjack|baccarat|poker|dragon tiger|sic bo|andar bahar|teen patti)\b/.test(nome)) {
    return 'mesa';
  }
  return 'slots';
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
let _abrindoJogo = false;
async function abrirJogo(code, nome) {
  if (!window.ZKNAuth || !window.ZKNAuth.isLoggedIn()) {
    if (typeof ZKN !== 'undefined') ZKN.toast('Faça login', 'Entre para jogar.', 'warning');
    setTimeout(function() {
      location.href = 'login.html?back=' + encodeURIComponent(location.pathname.split('/').pop() || 'index.html');
    }, 800);
    return;
  }
  if (_abrindoJogo) return;
  _abrindoJogo = true;

  try {
    // Registra recente sem bloquear a abertura do jogo se houver lentidao
    registrarRecente(code).catch(function() {});

    if (typeof ZKN !== 'undefined') ZKN.toast('Abrindo jogo...', nome || code);

    if (!window.Rapidverse || !window.Rapidverse.abrirJogo) {
      if (typeof ZKN !== 'undefined') ZKN.toast('Erro', 'Rapidverse não carregou.', 'error');
      return;
    }

    var res = await window.Rapidverse.abrirJogo(code);
    if (res.sucesso && res.launch_url) {
      if (window.ZKNGameFrame && window.ZKNGameFrame.abrir) {
        window.ZKNGameFrame.abrir(res.launch_url, nome || code);
      } else {
        window.open(res.launch_url, '_blank', 'noopener');
      }
    } else if (typeof ZKN !== 'undefined') {
      ZKN.toast('Erro ao abrir jogo', _traduzirMensagem(res.mensagem) || 'Tente novamente.', 'error');
    }
  } finally {
    _abrindoJogo = false;
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
  renderSkeletons: renderSkeletons,
  classificarCategoria: classificarCategoria,
  abrirJogo: abrirJogo,
  _onCoverError: _onCoverError,
};
