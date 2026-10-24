// ============================================================
// ZKNbet - Tela de carregamento
// ============================================================
(function () {
  if (document.getElementById('zkn-loading-screen')) return;

  if (!document.getElementById('zkn-loading-style')) {
    const style = document.createElement('style');
    style.id = 'zkn-loading-style';
    style.textContent = `
      #zkn-loading-screen {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: #05070d;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 24px;
        transition: opacity 0.4s ease-out, visibility 0.4s ease-out;
      }
      #zkn-loading-screen.hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }
      .zkn-loading-logo {
        font-family: 'Sora', 'Inter', sans-serif;
        font-weight: 900;
        font-size: 42px;
        letter-spacing: -1px;
        display: flex;
        align-items: center;
        gap: 2px;
        animation: zknPulse 1.6s ease-in-out infinite;
      }
      .zkn-loading-logo .z {
        background: linear-gradient(135deg, #f5be3c 0%, #ffd76e 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .zkn-loading-logo .rest { color: #f5f7fa; }
      .zkn-loading-spinner {
        width: 44px;
        height: 44px;
        border: 3px solid rgba(245, 190, 60, 0.15);
        border-top-color: #f5be3c;
        border-radius: 50%;
        animation: zknSpin 0.8s linear infinite;
      }
      .zkn-loading-text {
        color: #8a94a6;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      @keyframes zknSpin { to { transform: rotate(360deg); } }
      @keyframes zknPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(0.97); }
      }
    `;
    document.head.appendChild(style);
  }

  const el = document.createElement('div');
  el.id = 'zkn-loading-screen';
  el.innerHTML = `
    <div class="zkn-loading-logo">
      <span class="z">Z</span><span class="rest">KNbet</span>
    </div>
    <div class="zkn-loading-spinner"></div>
    <div class="zkn-loading-text">Carregando...</div>
  `;

  if (document.body) {
    document.body.appendChild(el);
  } else {
    document.documentElement.appendChild(el);
  }

  function esconder() {
    const overlay = document.getElementById('zkn-loading-screen');
    if (!overlay) return;
    overlay.classList.add('hidden');
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 500);
  }

  // OTIMIZADO: esconde assim que o HTML estiver pronto (nao espera imagens)
  if (document.readyState !== 'loading') {
    setTimeout(esconder, 100);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(esconder, 150));
  }

  // Fallback de seguranca (2s em vez de 5s)
  setTimeout(esconder, 2000);

  window.ZKNLoading = { hide: esconder };
})();
