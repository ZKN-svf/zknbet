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

var SVG_HEART_FILLED = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>';
var SVG_HEART_OUTLINE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>';
var SVG_PLAY = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';

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

// ---------- Toggle do botao ----------
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
      btn.innerHTML = agoraFav ? SVG_HEART_FILLED : SVG_HEART_OUTLINE;
      btn.title = agoraFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
      btn.setAttribute('aria-label', btn.title);
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

// ---------- Render: botao de favoritar (heart icon, translucent dark glass) ----------
function renderFavButton(gameCode) {
  var fav = isFavorito(gameCode);
  return '<button class="game-card-fav ' + (fav ? 'active' : '') + '" ' +
    'onclick="event.stopPropagation(); ZKNGamesLib.toggleFav(this, \'' + _escAttr(gameCode) + '\')" ' +
    'aria-label="' + (fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '" ' +
    'title="' + (fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '">' +
    (fav ? SVG_HEART_FILLED : SVG_HEART_OUTLINE) + '</button>';
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

// ---------- Render: card individual (portrait 3:4, provider tag overlay) ----------
function renderGameCard(j, idx) {
  var capa = j.image_url || '';
  var fallback = j.fallback_image_url || '';
  var inicial = (j.name || '?').charAt(0).toUpperCase();
  var nomeSafe = _esc(j.name);
  var providerSafe = _esc(j.provider_name || '');
  var loadMode = (typeof idx === 'number' && idx < 8) ? 'eager' : 'lazy';

  var coverHtml;
  if (capa) {
    coverHtml = '<img src="' + _esc(capa) + '" alt="' + nomeSafe + '" loading="' + loadMode + '" decoding="async" ' +
      'data-fb="' + _esc(fallback) + '" data-inicial="' + _esc(inicial) + '" ' +
      'onerror="ZKNGamesLib._onCoverError(this)">';
  } else {
    coverHtml = '<span class="fallback-txt" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;color:var(--gold);">' + _esc(inicial) + '</span>';
  }

  var rtpVal = Number(j.rtp || 0);
  var rtpBadge = (Number.isFinite(rtpVal) && rtpVal > 0)
    ? '<span class="game-card-rtp">' + rtpVal.toFixed(1) + '% RTP</span>'
    : '';

  var providerTag = providerSafe
    ? '<span class="game-card-provider-tag">' + providerSafe + '</span>'
    : '';

  return '<div class="game-card" onclick="ZKNGamesLib.abrirJogo(\'' + _escAttr(j.game_code) + '\', \'' + _escAttr(j.name) + '\')">' +
    renderFavButton(j.game_code) +
    '<div class="game-card-cover">' +
      coverHtml +
      rtpBadge +
      providerTag +
      '<div class="game-card-play"><div class="play-btn">' + SVG_PLAY + '</div></div>' +
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

function _getAdjacentDisclosure(containerEl) {
  var sib = containerEl.nextElementSibling;
  if (sib && sib.classList && sib.classList.contains('games-disclosure')) {
    return sib;
  }
  return null;
}

function _cleanupDynamicDisclosure(containerEl) {
  var sib = containerEl.nextElementSibling;
  while (sib && (sib.classList.contains('games-counter') || sib.classList.contains('games-load-more'))) {
    var next = sib.nextElementSibling;
    sib.remove();
    sib = next;
  }
}

// ---------- Render: secao inteira com progressive disclosure ----------
function renderGameSection(containerEl, jogos, opts) {
  if (!containerEl) return;

  var staticDisclosure = _getAdjacentDisclosure(containerEl);
  _cleanupDynamicDisclosure(containerEl);

  if (!jogos || jogos.length === 0) {
    if (staticDisclosure) staticDisclosure.style.display = 'none';
    containerEl.innerHTML = '<div class="game-card" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Nenhum jogo para mostrar.</div>';
    return;
  }

  var perPage = (opts && opts.perPage) || 20;
  var showAll = (opts && opts.showAll) || false;
  var total = jogos.length;
  var shown = showAll ? total : Math.min(perPage, total);

  containerEl.innerHTML = jogos.slice(0, shown).map(function(j, idx) { return renderGameCard(j, idx); }).join('');

  if (staticDisclosure) {
    staticDisclosure.style.display = '';
    var countEl = staticDisclosure.querySelector('.games-disclosure-count');
    var btnEl = staticDisclosure.querySelector('.games-disclosure-btn');
    if (countEl) {
      countEl.innerHTML = 'Mostrando <strong>' + shown + '</strong> de <strong>' + total + '</strong> jogos';
    }
    if (btnEl) {
      if (shown < total) {
        btnEl.style.display = '';
        btnEl.onclick = function() {
          var nextShown = Math.min(shown + perPage, total);
          var fragment = '';
          for (var i = shown; i < nextShown; i++) {
            fragment += renderGameCard(jogos[i]);
          }
          containerEl.insertAdjacentHTML('beforeend', fragment);
          shown = nextShown;
          if (countEl) {
            countEl.innerHTML = 'Mostrando <strong>' + shown + '</strong> de <strong>' + total + '</strong> jogos';
          }
          if (shown >= total) {
            btnEl.style.display = 'none';
            btnEl.onclick = null;
          }
        };
      } else {
        btnEl.style.display = 'none';
        btnEl.onclick = null;
      }
    }
    return;
  }

  if (shown < total) {
    _renderCounter(containerEl, shown, total);
    _renderLoadMore(containerEl, jogos, shown, perPage, total);
  }
}

function _renderCounter(containerEl, shown, total) {
  var sib = containerEl.nextElementSibling;
  if (sib && sib.classList.contains('games-counter')) sib.remove();

  var counter = document.createElement('div');
  counter.className = 'games-counter';
  counter.innerHTML = 'Mostrando <strong>' + shown + '</strong> de <strong>' + total + '</strong> jogos';
  containerEl.insertAdjacentElement('afterend', counter);
}

function _renderLoadMore(containerEl, jogos, shown, perPage, total) {
  var counter = containerEl.nextElementSibling;
  if (counter && counter.classList.contains('games-counter') && counter.nextElementSibling && counter.nextElementSibling.classList.contains('games-load-more')) {
    counter.nextElementSibling.remove();
  }

  if (shown >= total) return;

  var btn = document.createElement('button');
  btn.className = 'games-load-more';
  btn.type = 'button';
  btn.textContent = 'Carregar mais';

  btn.addEventListener('click', function() {
    var nextShown = Math.min(shown + perPage, total);
    var fragment = '';
    for (var i = shown; i < nextShown; i++) {
      fragment += renderGameCard(jogos[i]);
    }
    containerEl.insertAdjacentHTML('beforeend', fragment);
    shown = nextShown;
    _renderCounter(containerEl, shown, total);
    if (shown >= total) {
      btn.remove();
    }
  });

  var currentCounter = containerEl.nextElementSibling;
  if (currentCounter && currentCounter.classList.contains('games-counter')) {
    currentCounter.insertAdjacentElement('afterend', btn);
  } else {
    containerEl.insertAdjacentElement('afterend', btn);
  }
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
