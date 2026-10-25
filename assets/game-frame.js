// ============================================================
// GAME FRAME — Jogo em modal com sidebar
// Sidebar: Home, Carteira (depósito inline), Recarregar, Fechar
// Fecha com ESC. Saldo atualizado ao fechar.
// ============================================================

(function() {
  var gameModal = null;
  var currentLaunchUrl = null;
  var currentGameName = '';
  var showingDeposit = false;

  var SVG_HOME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
  var SVG_WALLET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>';
  var SVG_REFRESH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>';
  var SVG_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var SVG_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';

  window.ZKNGameFrame = {
    abrir: function(launchUrl, gameName) {
      currentLaunchUrl = launchUrl;
      currentGameName = gameName || 'Jogo';
      showingDeposit = false;
      render();
    },
    fechar: fechar,
    toggleWallet: toggleWallet,
    reloadGame: reloadGame,
    openInNewTab: openInNewTab,
    voltarAoJogo: voltarAoJogo,
  };

  function render() {
    if (gameModal) fechar();

    gameModal = document.createElement('div');
    gameModal.id = 'game-modal';
    gameModal.className = 'game-modal';
    gameModal.innerHTML =
      '<aside class="game-sidebar">' +
        '<button class="game-sidebar-btn" onclick="ZKNGameFrame.fechar()" title="Voltar ao lobby">' + SVG_HOME + '</button>' +
        '<button class="game-sidebar-btn" onclick="ZKNGameFrame.toggleWallet()" title="Depositar">' + SVG_WALLET + '</button>' +
        '<button class="game-sidebar-btn" onclick="ZKNGameFrame.reloadGame()" title="Recarregar">' + SVG_REFRESH + '</button>' +
        '<button class="game-sidebar-btn game-sidebar-close" onclick="ZKNGameFrame.fechar()" title="Fechar">' + SVG_CLOSE + '</button>' +
      '</aside>' +
      '<div class="game-main">' +
        '<iframe id="game-iframe" class="game-iframe" src="' + currentLaunchUrl + '" allow="autoplay; fullscreen; payment; same-origin; storage-access" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-storage-access-by-user-activation"></iframe>' +
        '<div id="game-loading" class="game-loading">' +
          '<div class="game-loading-spinner"></div>' +
          '<div class="game-loading-text">Carregando ' + currentGameName + '...</div>' +
          '<div class="game-loading-sub" id="game-loading-sub"></div>' +
          '<button id="game-loading-retry" class="game-loading-retry hidden" onclick="ZKNGameFrame.reloadGame()">Tentar novamente</button>' +
          '<button id="game-loading-newtab" class="game-loading-newtab hidden" onclick="ZKNGameFrame.openInNewTab()">Abrir em nova aba</button>' +
        '</div>' +
        '<div class="game-voltar-jogo hidden" id="game-voltar-jogo">' +
          '<button class="game-voltar-btn" onclick="ZKNGameFrame.voltarAoJogo()">' + SVG_BACK + ' Voltar ao jogo</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(gameModal);
    document.body.style.overflow = 'hidden';

    var iframe = document.getElementById('game-iframe');
    var loading = document.getElementById('game-loading');
    var loadingSub = document.getElementById('game-loading-sub');
    var retryBtn = document.getElementById('game-loading-retry');
    var newTabBtn = document.getElementById('game-loading-newtab');
    var voltarJogo = document.getElementById('game-voltar-jogo');

    var carregou = false;

    var slowTimer = setTimeout(function() {
      if (!carregou && !showingDeposit) {
        loadingSub.textContent = 'Conexão fraca... aguarde';
        loadingSub.style.color = '#f5be3c';
      }
    }, 5000);

    var errorTimer = setTimeout(function() {
      if (!carregou && !showingDeposit) {
        loadingSub.textContent = 'O jogo está demorando muito.';
        loadingSub.style.color = '#ff4757';
        retryBtn.classList.remove('hidden');
        newTabBtn.classList.remove('hidden');
      }
    }, 15000);

    iframe.addEventListener('load', function() {
      carregou = true;
      clearTimeout(slowTimer);
      clearTimeout(errorTimer);
      setTimeout(function() {
        loading.classList.add('hidden');
      }, 500);
    });

    iframe.addEventListener('error', function() {
      carregou = false;
      loadingSub.textContent = 'Não foi possível abrir.';
      loadingSub.style.color = '#ff4757';
      newTabBtn.classList.remove('hidden');
    });
  }

  function fechar() {
    if (!gameModal) return;
    gameModal.remove();
    gameModal = null;
    showingDeposit = false;
    document.body.style.overflow = '';
    // Atualiza saldo no header
    if (window.ZKNSaldo && window.ZKNSaldo.atualizar) {
      window.ZKNSaldo.atualizar();
    }
  }

  function toggleWallet() {
    var iframe = document.getElementById('game-iframe');
    if (!iframe) return;

    var loading = document.getElementById('game-loading');
    var loadingSub = document.getElementById('game-loading-sub');
    var voltarJogo = document.getElementById('game-voltar-jogo');

    if (showingDeposit) {
      voltarAoJogo();
      return;
    }

    if (loading) {
      loading.classList.remove('hidden');
      if (loadingSub) {
        loadingSub.textContent = 'Carregando depósito...';
        loadingSub.style.color = '#f5be3c';
      }
    }

    iframe.src = 'deposito.html';
    showingDeposit = true;

    if (voltarJogo) voltarJogo.classList.remove('hidden');

    setTimeout(function() {
      if (loading) loading.classList.add('hidden');
    }, 1500);
  }

  function voltarAoJogo() {
    var iframe = document.getElementById('game-iframe');
    if (!iframe) return;

    var loading = document.getElementById('game-loading');
    var loadingSub = document.getElementById('game-loading-sub');
    var voltarJogo = document.getElementById('game-voltar-jogo');

    if (loading) {
      loading.classList.remove('hidden');
      if (loadingSub) {
        loadingSub.textContent = 'Voltando ao jogo...';
        loadingSub.style.color = '#f5be3c';
      }
    }

    iframe.src = currentLaunchUrl;
    showingDeposit = false;

    if (voltarJogo) voltarJogo.classList.add('hidden');

    setTimeout(function() {
      if (loading) loading.classList.add('hidden');
    }, 1500);
  }

  function reloadGame() {
    var loading = document.getElementById('game-loading');
    var iframe = document.getElementById('game-iframe');
    if (!iframe || !loading) return;

    loading.classList.remove('hidden');
    loading.querySelector('.game-loading-sub').textContent = '';
    loading.querySelector('#game-loading-retry').classList.add('hidden');
    loading.querySelector('#game-loading-newtab').classList.add('hidden');

    iframe.src = iframe.src;
  }

  function openInNewTab() {
    window.open(currentLaunchUrl, '_blank', 'noopener');
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && gameModal) fechar();
  });
})();