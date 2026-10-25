// ============================================================
// GAME FRAME — Abre o jogo em nova aba (solução final)
// ============================================================

(function() {
  window.ZKNGameFrame = {
    abrir: function(launchUrl, gameName) {
      window.open(launchUrl, '_blank', 'noopener');
    },
    fechar: function() {
      if (window.ZKNSaldo && window.ZKNSaldo.atualizar) {
        window.ZKNSaldo.atualizar();
      }
    },
    toggleWallet: function() {},
    reloadGame: function() {},
    openInNewTab: function() {},
    irParaDeposito: function() {},
    voltarAoJogo: function() {},
  };
})();