// ============================================================
// BOTTOM NAV - barra de navegacao inferior (95H.com style)
// 5 tabs: Inicio, Promocao, Convidar (center FAB), Saque, Perfil
// Center button: raised circular medallion with golden glow ring
// ============================================================

(function() {
  // Não mostra nas telas de auth e admin
  const PAGINAS_SEM_NAV = ['login.html', 'cadastro.html', 'esqueci-senha.html', 'redefinir-senha.html', 'admin.html'];
  const paginaAtual = location.pathname.split('/').pop() || 'index.html';
  if (PAGINAS_SEM_NAV.includes(paginaAtual)) return;

  // Clean minimal SVG icons
  const SVG_HOME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
  const SVG_PROMO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>';
  const SVG_INVITE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>';
  const SVG_WITHDRAW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  const SVG_PROFILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

  const itens = [
    { id: 'home',     label: 'Início',    href: 'index.html',       svg: SVG_HOME,     isFab: false },
    { id: 'promo',    label: 'Promoção',  href: 'recompensas.html', svg: SVG_PROMO,    isFab: false },
    { id: 'invite',   label: 'Convidar',  href: 'indicacao.html',   svg: SVG_INVITE,   isFab: true  },
    { id: 'withdraw', label: 'Saque',     href: 'saque.html',       svg: SVG_WITHDRAW, isFab: false },
    { id: 'profile',  label: 'Perfil',    href: 'minha-conta.html', svg: SVG_PROFILE,  isFab: false },
  ];

  // Active detection
  function isActive(item) {
    if (item.id === 'home' && (paginaAtual === 'index.html' || paginaAtual === '')) return true;
    if (item.id === 'promo' && (paginaAtual === 'recompensas.html' || paginaAtual === 'ofertas.html')) return true;
    if (item.id === 'invite' && paginaAtual === 'indicacao.html') return true;
    if (item.id === 'withdraw' && (paginaAtual === 'saque.html' || paginaAtual === 'saque-primeiro-acesso.html')) return true;
    if (item.id === 'profile' && (paginaAtual === 'minha-conta.html' || paginaAtual === 'alterar-dados.html' || paginaAtual === 'alterar-senha.html')) return true;
    return false;
  }

  // Cria nav
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.setAttribute('aria-label', 'Menu de navegação');

  itens.forEach(function(item) {
    const a = document.createElement('a');
    a.href = item.href;
    a.dataset.id = item.id;

    if (item.isFab) {
      // Center FAB: raised circular medallion
      a.className = 'bottom-nav-fab';
      a.innerHTML =
        '<div class="bottom-nav-fab-ring">' +
          '<div class="bottom-nav-fab-circle">' +
            item.svg +
          '</div>' +
        '</div>' +
        '<span class="bottom-nav-fab-label">' + item.label + '</span>';
    } else {
      a.className = 'bottom-nav-item' + (isActive(item) ? ' active' : '');
      a.innerHTML =
        '<div class="bottom-nav-icon">' +
          item.svg +
          '<span class="bottom-nav-badge hidden" id="badge-' + item.id + '"></span>' +
        '</div>' +
        '<span>' + item.label + '</span>';
    }

    nav.appendChild(a);
  });

  // Adiciona ao body
  document.body.appendChild(nav);

  // ============================================================
  // BADGES — calcula quantas coisas disponiveis
  // ============================================================
  async function calcularBadges(force) {
    if (!window.ZKNAuth || !window.ZKNAuth.isLoggedIn || !window.ZKNAuth.isLoggedIn()) return;

    if (window.ZKN && window.ZKN.getSummaryCached) {
      var sum = await window.ZKN.getSummaryCached(force).catch(function() { return null; });
      if (sum && sum.rewards !== undefined) return;
    }

    var rewardsCount = 0;

    try {
      var roulette = await ZKNAuth.api('/roulette/status');
      if (roulette.ok && roulette.data.available) rewardsCount++;
    } catch (e) {}

    try {
      var rebate = await ZKNAuth.api('/rebate/status');
      if (rebate.ok && rebate.data && rebate.data.balance >= rebate.data.min_claim) rewardsCount++;
    } catch (e) {}

    try {
      var pending = await ZKNAuth.api('/deposit-bonus/pending');
      if (pending.ok && pending.data.pending && pending.data.pending.length > 0) rewardsCount++;
    } catch (e) {}

    if (window.ZKN && window.ZKN.aplicarBadgesUI) {
      window.ZKN.aplicarBadgesUI(rewardsCount);
      return;
    }

    // Fallback: apply to promo badge (was 'rewards' in old nav)
    var badgePromo = document.getElementById('badge-promo');
    if (badgePromo) {
      if (rewardsCount > 0) {
        badgePromo.textContent = rewardsCount;
        badgePromo.classList.remove('hidden');
      } else {
        badgePromo.classList.add('hidden');
      }
    }
  }

  // Roda ao carregar
  setTimeout(function() { calcularBadges(false); }, 400);

  // Expoe pra atualizar manualmente (ex: apos girar roleta / resgatar bonus)
  window.ZKNBottomNav = {
    atualizarBadges: function() { return calcularBadges(true); },
  };
})();
