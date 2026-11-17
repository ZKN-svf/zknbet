// ============================================================
// GAME FRAME — Jogo em modal com menu flutuante
// Menu no canto direito (flutuante, mobile-friendly)
// Botão Carteira: abre deposito.html dentro do iframe
// ============================================================

(function() {
  var gameModal = null;
  var currentLaunchUrl = null;
  var currentGameName = '';
  var showingDeposit = false;
  var slowTimer = null;
  var errorTimer = null;

  var SVG_HOME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
  var SVG_REFRESH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>';
  var SVG_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var SVG_DEPOSIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  var SVG_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
  var SVG_FULL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
  var SVG_MINIMIZE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

  function _atualizarSaldoOverlay() {
    var el = document.getElementById('game-float-balance');
    if (!el || !window.ZKN || !window.ZKN.ZKN_USER) return;
    el.textContent = window.ZKN.formatBRL(window.ZKN.ZKN_USER.balance);
  }

  function escHtml(v) {
    if (window.escapeHtml) return window.escapeHtml(v);
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function limparTimers() {
    if (slowTimer) { clearTimeout(slowTimer); slowTimer = null; }
    if (errorTimer) { clearTimeout(errorTimer); errorTimer = null; }
  }

  function iniciarTimersCarregamento() {
    limparTimers();
    var loading = document.getElementById('game-loading');
    var loadingSub = document.getElementById('game-loading-sub');
    var retryBtn = document.getElementById('game-loading-retry');
    var newTabBtn = document.getElementById('game-loading-newtab');
    if (!loading || !loadingSub) return;

    loading._carregou = false;
    loadingSub.textContent = '';
    loadingSub.style.color = '';
    if (retryBtn) retryBtn.classList.add('hidden');
    if (newTabBtn) newTabBtn.classList.add('hidden');

    slowTimer = setTimeout(function() {
      if (!loading._carregou && loadingSub) {
        loadingSub.textContent = 'Conexão fraca... aguarde';
        loadingSub.style.color = '#f5be3c';
      }
    }, 3000);

    errorTimer = setTimeout(function() {
      if (!loading._carregou && loadingSub) {
        loadingSub.textContent = 'O jogo está demorando muito.';
        loadingSub.style.color = '#ff4757';
        if (retryBtn) retryBtn.classList.remove('hidden');
        if (newTabBtn) newTabBtn.classList.remove('hidden');
      }
    }, 10000);
  }

  window.ZKNGameFrame = {
    abrir: function(launchUrl, gameName) {
      if (!launchUrl || !/^https?:\/\//i.test(launchUrl)) return;
      currentLaunchUrl = launchUrl;
      currentGameName = gameName || 'Jogo';
      showingDeposit = false;
      render();
    },
    fechar: fechar,
    toggleWallet: toggleWallet,
    toggleCollapse: toggleCollapse,
    toggleFullscreen: toggleFullscreen,
    reloadGame: reloadGame,
    openInNewTab: openInNewTab,
    irParaDeposito: irParaDeposito,
    voltarAoJogo: voltarAoJogo,
  };

  function toggleCollapse() {
    var menu = document.getElementById('game-menu');
    if (!menu) return;
    menu.classList.toggle('collapsed');
  }

  function toggleFullscreen() {
    if (!gameModal) return;
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(function() {});
      } else if (gameModal.requestFullscreen) {
        gameModal.requestFullscreen().catch(function() {});
      }
    } catch (_) {}
  }

  function render() {
    if (gameModal) fechar();

    var saldoInicial = (window.ZKN && window.ZKN.ZKN_USER) ? window.ZKN.formatBRL(window.ZKN.ZKN_USER.balance) : 'R$ 0,00';
    var temFull = !!(document.documentElement.requestFullscreen);

    gameModal = document.createElement('div');
    gameModal.id = 'game-modal';
    gameModal.className = 'game-modal';
    gameModal.innerHTML =
      '<div class="game-main">' +
        '<iframe id="game-iframe" class="game-iframe" data-src-pending="1" allow="autoplay; fullscreen; payment; same-origin; storage-access" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-storage-access-by-user-activation"></iframe>' +
        '<div id="game-loading" class="game-loading">' +
          '<div class="game-loading-spinner"></div>' +
          '<div class="game-loading-text">Carregando ' + escHtml(currentGameName) + '...</div>' +
          '<div class="game-loading-sub" id="game-loading-sub"></div>' +
          '<button id="game-loading-retry" class="game-loading-retry hidden" onclick="ZKNGameFrame.reloadGame()">Tentar novamente</button>' +
          '<button id="game-loading-newtab" class="game-loading-newtab hidden" onclick="ZKNGameFrame.openInNewTab()">Abrir em nova aba</button>' +
        '</div>' +
      '</div>' +
      '<div class="game-floating-menu" id="game-menu">' +
        '<button class="game-float-btn" onclick="ZKNGameFrame.toggleCollapse()" title="Mostrar/ocultar controles" aria-label="Recolher menu">' + SVG_MINIMIZE + '</button>' +
        '<div class="game-float-balance game-float-collapsible" id="game-float-balance">' + escHtml(saldoInicial) + '</div>' +
        '<button class="game-float-btn game-float-collapsible" onclick="ZKNGameFrame.toggleWallet()" title="Depositar">' + SVG_DEPOSIT + '</button>' +
        '<button class="game-float-btn game-float-collapsible" onclick="ZKNGameFrame.reloadGame()" title="Recarregar">' + SVG_REFRESH + '</button>' +
        (temFull ? '<button class="game-float-btn game-float-collapsible" onclick="ZKNGameFrame.toggleFullscreen()" title="Tela cheia">' + SVG_FULL + '</button>' : '') +
        '<button class="game-float-btn game-float-collapsible" onclick="ZKNGameFrame.fechar()" title="Voltar ao lobby">' + SVG_HOME + '</button>' +
        '<button class="game-float-btn game-float-close game-float-collapsible" onclick="ZKNGameFrame.fechar()" title="Fechar">' + SVG_CLOSE + '</button>' +
      '</div>' +
      '<div class="game-floating-menu game-menu-back hidden" id="game-menu-back">' +
        '<button class="game-float-btn game-float-back" onclick="ZKNGameFrame.voltarAoJogo()" title="Voltar ao jogo">' + SVG_BACK + '</button>' +
      '</div>';
    document.body.appendChild(gameModal);
    document.body.style.overflow = 'hidden';

    var iframe = document.getElementById('game-iframe');
    var loading = document.getElementById('game-loading');
    var loadingSub = document.getElementById('game-loading-sub');
    var newTabBtn = document.getElementById('game-loading-newtab');

    iniciarTimersCarregamento();

    iframe.addEventListener('load', function() {
      loading._carregou = true;
      limparTimers();
      setTimeout(function() {
        if (loading) loading.classList.add('hidden');
      }, 400);
    });

    iframe.addEventListener('error', function() {
      loading._carregou = false;
      limparTimers();
      if (loadingSub) {
        loadingSub.textContent = 'Não foi possível abrir.';
        loadingSub.style.color = '#ff4757';
      }
      if (newTabBtn) newTabBtn.classList.remove('hidden');
    });

    // Setar src via JS depois dos listeners e appendChild (evita loading travado)
    if (iframe && iframe.getAttribute('data-src-pending')) {
      iframe.removeAttribute('data-src-pending');
      iframe.src = currentLaunchUrl;
    }
  }

  function fechar() {
    limparTimers();
    if (!gameModal) return;
    gameModal.remove();
    gameModal = null;
    showingDeposit = false;
    document.body.style.overflow = '';
    if (window.ZKNSaldo && window.ZKNSaldo.atualizar) {
      window.ZKNSaldo.atualizar();
    }
  }

  function toggleWallet() {
    var iframe = document.getElementById('game-iframe');
    if (!iframe) return;

    var loading = document.getElementById('game-loading');
    var loadingSub = document.getElementById('game-loading-sub');
    var menu = document.getElementById('game-menu');
    var menuBack = document.getElementById('game-menu-back');

    if (showingDeposit) {
      voltarAoJogo();
      return;
    }

    limparTimers();
    if (loading) {
      loading._carregou = false;
      loading.classList.remove('hidden');
      if (loadingSub) {
        loadingSub.textContent = 'Carregando depósito...';
        loadingSub.style.color = '#f5be3c';
      }
    }

    iframe.src = 'deposito.html';
    showingDeposit = true;

    if (menu) menu.classList.add('hidden');
    if (menuBack) menuBack.classList.remove('hidden');

    setTimeout(function() {
      if (loading) loading.classList.add('hidden');
    }, 1500);
  }

  function voltarAoJogo() {
    var iframe = document.getElementById('game-iframe');
    if (!iframe) return;

    var loading = document.getElementById('game-loading');
    var loadingSub = document.getElementById('game-loading-sub');
    var menu = document.getElementById('game-menu');
    var menuBack = document.getElementById('game-menu-back');

    if (loading) {
      loading.classList.remove('hidden');
      iniciarTimersCarregamento();
      if (loadingSub) {
        loadingSub.textContent = 'Voltando ao jogo...';
        loadingSub.style.color = '#f5be3c';
      }
    }

    iframe.src = currentLaunchUrl;
    showingDeposit = false;

    if (menu) menu.classList.remove('hidden');
    if (menuBack) menuBack.classList.add('hidden');
    if (window.ZKNAuth && window.ZKNAuth.getSaldo) {
      window.ZKNAuth.getSaldo().then(_atualizarSaldoOverlay).catch(function() {});
    }
  }

  function irParaDeposito() {
    fechar();
    window.location.href = 'deposito.html';
  }

  function reloadGame() {
    var loading = document.getElementById('game-loading');
    var iframe = document.getElementById('game-iframe');
    if (!iframe || !loading) return;

    loading.classList.remove('hidden');
    iniciarTimersCarregamento();
    iframe.src = showingDeposit ? 'deposito.html' : currentLaunchUrl;
  }

  function openInNewTab() {
    if (currentLaunchUrl) window.open(currentLaunchUrl, '_blank', 'noopener');
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && gameModal) fechar();
  });
})();
