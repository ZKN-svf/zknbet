// ============================================================
// BOTTOM NAV - barra de navegacao inferior
// 5 botoes: Inicio, Recompensas, Pesquisa, Conta, Convidar
// Badges pulsando quando ha algo disponivel
// ============================================================

(function() {
  // Não mostra na tela de login/cadastro
  const PAGINAS_SEM_NAV = ['login.html', 'cadastro.html'];
  const paginaAtual = location.pathname.split('/').pop() || 'index.html';
  if (PAGINAS_SEM_NAV.includes(paginaAtual)) return;

  // SVGs
  const SVG_HOME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
  const SVG_GIFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>';
  const SVG_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  const SVG_USER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const SVG_HANDSHAKE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l-5-5"/><path d="M14 14l5-5"/><path d="M3 3l3 3"/><path d="M21 3l-3 3"/><path d="M3 21l3-3"/><path d="M21 21l-3-3"/><path d="M14 10l-4 4"/><path d="M10 14l-4 4"/><path d="M14 14l4 4"/></svg>';

  const itens = [
    { id: 'home',    label: 'Início',      href: 'index.html',       svg: SVG_HOME },
    { id: 'rewards', label: 'Recompensas', href: 'recompensas.html', svg: SVG_GIFT },
    { id: 'search',  label: 'Buscar',      href: 'jogos.html',       svg: SVG_SEARCH },
    { id: 'account', label: 'Conta',       href: 'minha-conta.html', svg: SVG_USER },
    { id: 'invite',  label: 'Convidar',    href: 'indicacao.html',   svg: SVG_HANDSHAKE },
  ];

  // Cria CSS
  const style = document.createElement('style');
  style.textContent = `
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 480px;
      background: rgba(10, 15, 26, 0.96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid rgba(245, 190, 60, 0.3);
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 8px 4px calc(8px + env(safe-area-inset-bottom));
      z-index: 9998;
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
    }

    .bottom-nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 6px 2px;
      color: #8a94a6;
      text-decoration: none;
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 600;
      border-radius: 12px;
      position: relative;
      transition: all 0.18s ease;
      background: transparent;
      border: none;
      cursor: pointer;
    }

    .bottom-nav-item:hover {
      color: #f5be3c;
      background: rgba(245, 190, 60, 0.08);
    }

    .bottom-nav-item.active {
      color: #f5be3c;
    }

    .bottom-nav-item.active::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      background: #f5be3c;
      border-radius: 2px;
    }

    .bottom-nav-icon {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .bottom-nav-icon svg {
      width: 22px;
      height: 22px;
    }

    .bottom-nav-badge {
      position: absolute;
      top: -4px;
      right: -8px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      background: #ff4757;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #0a0f1a;
      animation: badge-pulse 1.5s ease-in-out infinite;
      font-family: 'Inter', sans-serif;
    }

    @keyframes badge-pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
      }
      50% {
        transform: scale(1.15);
        box-shadow: 0 0 0 6px rgba(255, 71, 87, 0);
      }
    }

    /* Espaço pro bottom nav no body */
    body {
      padding-bottom: 80px !important;
    }

    /* Desktop: esconde (ou mostra menor) */
    @media (min-width: 768px) {
      .bottom-nav {
        max-width: 480px;
        border-radius: 20px;
        bottom: 16px;
        border: 1px solid rgba(245, 190, 60, 0.3);
      }
      body {
        padding-bottom: 100px !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Cria nav
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.setAttribute('aria-label', 'Menu de navegação');

  itens.forEach(item => {
    const a = document.createElement('a');
    a.className = 'bottom-nav-item';
    a.href = item.href;
    a.dataset.id = item.id;

    if (item.id === 'home' && (paginaAtual === 'index.html' || paginaAtual === '')) {
      a.classList.add('active');
    }
    if (item.id === 'rewards' && paginaAtual === 'recompensas.html') {
      a.classList.add('active');
    }
    if (item.id === 'search' && (paginaAtual === 'jogos.html' || paginaAtual === 'favoritos.html')) {
      a.classList.add('active');
    }
    if (item.id === 'account' && (paginaAtual === 'minha-conta.html' || paginaAtual === 'alterar-dados.html' || paginaAtual === 'alterar-senha.html')) {
      a.classList.add('active');
    }
    if (item.id === 'invite' && paginaAtual === 'indicacao.html') {
      a.classList.add('active');
    }

    a.innerHTML = '<div class="bottom-nav-icon">' + item.svg + '<span class="bottom-nav-badge hidden" id="badge-' + item.id + '"></span></div><span>' + item.label + '</span>';
    nav.appendChild(a);
  });

  // Adiciona ao body
  document.body.appendChild(nav);

  // ============================================================
  // BADGES — calcula quantas coisas disponiveis
  // ============================================================
  async function calcularBadges() {
    if (!window.ZKNAuth || !window.ZKNAuth.isLoggedIn || !window.ZKNAuth.isLoggedIn()) return;

    let rewardsCount = 0;

    try {
      // 1) Roleta disponivel?
      const roulette = await ZKNAuth.api('/roulette/status');
      if (roulette.ok && roulette.data.available) {
        rewardsCount++;
      }
    } catch (e) {}

    try {
      // 2) Rebate disponivel (>= minimo)?
      const rebate = await ZKNAuth.api('/rebate/status');
      if (rebate.ok && rebate.data && rebate.data.balance >= rebate.data.min_claim) {
        rewardsCount++;
      }
    } catch (e) {}

    try {
      const pending = await ZKNAuth.api('/deposit-bonus/pending');
      if (pending.ok && pending.data.pending && pending.data.pending.length > 0) {
        rewardsCount++;
      }
    } catch (e) {}

    // Mostra badge se tiver algo
    const badgeRewards = document.getElementById('badge-rewards');
    if (badgeRewards) {
      if (rewardsCount > 0) {
        badgeRewards.textContent = rewardsCount;
        badgeRewards.classList.remove('hidden');
      } else {
        badgeRewards.classList.add('hidden');
      }
    }

    // Badge em Conta (futuro — verifica se tem algo pendente)
    // Ex: saque pendente, etc
    // Por enquanto, sem badge
  }

  // Roda ao carregar
  setTimeout(calcularBadges, 500);

  // Expõe pra atualizar manualmente
  window.ZKNBottomNav = {
    atualizarBadges: calcularBadges,
  };
})();
