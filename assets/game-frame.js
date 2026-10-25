// ============================================================
// GAME FRAME — Redireciona o jogo pra game.html (página cheia)
// Resolve o problema de cookies de terceiros no iframe
// ============================================================

(function() {
  window.ZKNGameFrame = {
    abrir: function(launchUrl, gameName) {
      // Abre o jogo em game.html (página intermediária)
      // Isso mantém o jogo no mesmo domínio, com cookies funcionando
      const url = 'game.html?url=' + encodeURIComponent(launchUrl) + '&name=' + encodeURIComponent(gameName || 'Jogo');
      location.href = url;
    },
    fechar: function() {
      // Volta pra página anterior
      if (history.length > 1) {
        history.back();
      } else {
        location.href = 'index.html';
      }
    },
    toggleWallet: function() {},
    reloadGame: function() {},
    openInNewTab: function() {},
    irParaDeposito: function() {},
    voltarAoJogo: function() {},
  };

  console.log('[GAME FRAME] Modo game.html ativado (cookies funcionam)');
})();