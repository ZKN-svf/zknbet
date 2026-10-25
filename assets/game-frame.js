// ============================================================
// GAME FRAME - jogo em modal com menu flutuante
// Menu no canto direito (flutuante, mobile-friendly)
// ============================================================

(function() {
  var gameModal = null;
  var currentLaunchUrl = null;
  var currentGameName = '';

  var SVG_HOME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
  var SVG_WALLET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>';
  var SVG_REFRESH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>';
  var SVG_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var SVG_DEPOSIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';

  window.ZKNGameFrame = {
    abrir: function(launchUrl, gameName) {
      currentLaunchUrl = launchUrl;
      currentGameName = gameName || 'Jogo';
      render();
    },
    fechar: fechar,
    toggleWallet: toggleWallet,
    reloadGame: reloadGame,
    openInNewTab: openInNewTab,
    irParaDeposito: irParaDeposito,
  };

  function render() {
    if (gameModal) fechar();

    gameModal = document.createElement('div');
    gameModal.id = 'game-modal';
    gameModal.className = 'game-modal';
    gameModal.innerHTML =
      '<div class="game-main">' +
        '<iframe id="game-iframe" class="game-iframe" src="' + currentLaunchUrl + '" allow="autoplay; fullscreen; payment" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"></iframe>' +
        '<div id="game-loading" class="game-loading">' +
          '<div class="game-loading-spinner"></div>' +
          '<div class="game-loading-text">Carregando ' + currentGameName + '...</div>' +
          '<div class="game-loading-sub" id="game-loading-sub"></div>' +
          '<button id="game-loading-retry" class="game-loading-retry hidden" onclick="ZKNGameFrame.reloadGame()">Tentar novamente</button>' +
          '<button id="game-loading-newtab" class="game-loading-newtab hidden" onclick="ZKNGameFrame.openInNewTab()">Abrir em nova aba</button>' +
        '</div>' +
      '</div>' +
      '<div class="game-floating-menu">' +
        '<button class="game-float-btn" onclick="ZKNGameFrame.irParaDeposito()" title="Depositar">' + SVG_DEPOSIT + '</button>' +
        '<button class="game-float-btn" onclick="ZKNGameFrame.reloadGame()" title="Recarregar">' + SVG_REFRESH + '</button>' +
        '<button class="game-float-btn" onclick="ZKNGameFrame.fechar()" title="Voltar ao lobby">' + SVG_HOME + '</button>' +
        '<button class="game-float-btn game-float-close" onclick="ZKNGameFrame.fechar()" title="Fechar">' + SVG_CLOSE + '</button>' +
      '</div>' +
      '<div id="game-wallet-drawer" class="game-wallet-drawer hidden">' +
        '<div class="game-wallet-header">' +
          '<div class="game-wallet-title">Depositar</div>' +
          '<button class="game-wallet-close" onclick="ZKNGameFrame.toggleWallet()">' + SVG_CLOSE + '</button>' +
        '</div>' +
        '<iframe src="deposito.html" class="game-wallet-iframe"></iframe>' +
      '</div>';
    document.body.appendChild(gameModal);
    document.body.style.overflow = 'hidden';

    var iframe = document.getElementById('game-iframe');
    var loading = document.getElementById('game-loading');
    var loadingSub = document.getElementById('game-loading-sub');
    var retryBtn = document.getElementById('game-loading-retry');
    var newTabBtn = document.getElementById('game-loading-newtab');

    var carregou = false;

    var slowTimer = setTimeout(function() {
      if (!carregou) {
        loadingSub.textContent = 'Conexao fraca... aguarde';
        loadingSub.style.color = '#f5be3c';
      }
    }, 5000);

    var errorTimer = setTimeout(function() {
      if (!carregou) {
        loadingSub.textContent = 'O jogo esta demorando muito.';
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
      loadingSub.textContent = 'Nao foi possivel abrir.';
      loadingSub.style.color = '#ff4757';
      newTabBtn.classList.remove('hidden');
    });
  }

  function fechar() {
    if (!gameModal) return;
    gameModal.remove();
    gameModal = null;
    document.body.style.overflow = '';
    if (window.ZKNSaldo && window.ZKNSaldo.atualizar) {
      window.ZKNSaldo.atualizar();
    }
  }

  function toggleWallet() {
    var drawer = document.getElementById('game-wallet-drawer');
    if (drawer) drawer.classList.toggle('hidden');
  }

  function irParaDeposito() {
    // Fecha o modal e redireciona direto pro depósito
    fechar();
    window.location.href = 'deposito.html';
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