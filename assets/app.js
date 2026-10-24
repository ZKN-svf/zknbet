// ============================================================
// ZKNbet — App core (header, saldo, toasts, sessão, drawer)
// ============================================================

const ZKN_USER = {
  get balance() {
    return window.ZKNAuth?.getUser?.()?.balance ?? 0;
  },
  set balance(v) {
    const u = window.ZKNAuth?.getUser?.();
    if (u) { u.balance = v; window.ZKNAuth.setUser(u); }
    document.querySelectorAll('[data-balance]').forEach(el => {
      el.textContent = formatBRL(v);
    });
  },
  get refCode() {
    const u = window.ZKNAuth?.getUser?.();
    return u?.refCode || '';
  },
};

function formatBRL(v) {
  return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function gerarIniciais(nome) {
  if (!nome) return '?';
  const p = nome.trim().split(/\s+/);
  return (p[0][0] + (p[1]?.[0] || '')).toUpperCase();
}

// ---------- Toasts ----------
function toast(title, body = '', type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<div class="toast-title">${title}</div>${body ? `<div class="toast-body">${body}</div>` : ''}`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'slideIn 0.25s ease-out reverse';
    setTimeout(() => el.remove(), 250);
  }, 4000);
}

// ---------- Header ----------
function renderHeader() {
  const path = location.pathname.split('/').pop() || 'index.html';
  const user = window.ZKNAuth?.getUser?.();
  const logged = !!user;

  const navItems = [
    { href: 'index.html', label: 'Início' },
    { href: 'jogos.html', label: 'Jogos' },
    { href: 'deposito.html', label: 'Depositar' },
    { href: 'saque.html', label: 'Sacar' },
    { href: 'indicacao.html', label: 'Indicar' },
  ];

  const header = document.querySelector('.zkn-header-inner');
  if (!header) return;

  const rightSide = logged
    ? `
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="balance-chip" onclick="location.href='deposito.html'">
        <span class="value" data-balance>${formatBRL(ZKN_USER.balance)}</span>
      </div>
        <button class="balance-refresh" onclick="ZKN.atualizarSaldoBtn(this)" aria-label="Atualizar saldo" title="Atualizar saldo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>
      <button class="btn-header" onclick="location.href='deposito.html'">Depositar</button>
      <button class="btn-header ghost" onclick="window.ZKNAuth.logout()">Sair</button>
    `
    : `
      <button class="btn-header ghost" onclick="location.href='login.html'">Entrar</button>
      <button class="btn-header" onclick="location.href='cadastro.html'">Criar conta</button>
    `;

  header.innerHTML = `
    <button class="menu-toggle" onclick="ZKN.abrirDrawer()" aria-label="Abrir menu">
      <span></span><span></span><span></span>
    </button>
    <a href="index.html" class="zkn-logo">
      <span class="z">Z</span><span class="rest">KNbet</span>
    </a>
    <button class="bonus-chip" onclick="ZKN.abrirBonusDrawer()" title="Resgatar bônus">
      🎁 Bônus
    </button>
    <nav class="zkn-nav">
      ${navItems.map(i => `<a href="${i.href}" class="${path === i.href ? 'active' : ''}">${i.label}</a>`).join('')}
    </nav>
    <div class="zkn-header-right">${rightSide}</div>
  `;

  if (!document.getElementById('zknDrawer')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="drawer-backdrop" id="zknDrawerBackdrop" onclick="ZKN.fecharDrawer()"></div>
      <aside class="drawer" id="zknDrawer" aria-hidden="true">
        <div class="drawer-header">
          <a href="index.html" class="zkn-logo">
            <span class="z">Z</span><span class="rest">KNbet</span>
          </a>
    <button class="bonus-chip" onclick="ZKN.abrirBonusDrawer()" title="Resgatar bônus">
      🎁 Bônus
    </button>
          <button class="drawer-close" onclick="ZKN.fecharDrawer()" aria-label="Fechar">✕</button>
        </div>

        <div class="drawer-user" id="drawerUser"></div>

        <nav class="drawer-nav">
          <div class="drawer-section-title">Conta</div>
          <a class="drawer-link" href="index.html">🏠 Início</a>
          <a class="drawer-link" href="minha-conta.html">👤 Minha conta</a>
          <a class="drawer-link" href="alterar-dados.html">✏️ Alterar dados</a>
          <a class="drawer-link" href="alterar-senha.html">🔒 Alterar senha</a>

          <div class="drawer-section-title">Jogar</div>
          <a class="drawer-link" href="jogos.html">🎮 Todos os jogos</a>
          <a class="drawer-link" href="provedoras.html">🏆 Provedoras</a>
          <a class="drawer-link" href="favoritos.html">⭐ Favoritos</a>

          <div class="drawer-section-title">Carteira</div>
          <a class="drawer-link" href="deposito.html">💰 Depositar</a>
          <a class="drawer-link" href="saque.html">💸 Sacar</a>
          <a class="drawer-link" href="historico.html">📜 Histórico</a>

          <div class="drawer-section-title">Indicação</div>
          <a class="drawer-link" href="indicacao.html">🤝 Indique e ganhe</a>
          <button class="drawer-link drawer-link-btn" onclick="ZKN.abrirIndicacaoDrawer()">🔗 Seu código de indicação</button>

          <div class="drawer-section-title">Ajuda</div>
          <a class="drawer-link" href="https://t.me/Micaelasilva7" target="_blank" rel="noopener">💬 Suporte (Telegram)</a>
        </nav>

        <div class="drawer-footer" id="drawerFooter"></div>
      </aside>
    `);
  }

  atualizarDrawerUser();
}

function abrirDrawer() {
  document.getElementById('zknDrawer')?.classList.add('open');
  document.getElementById('zknDrawerBackdrop')?.classList.add('open');
  document.getElementById('zknDrawer')?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
  atualizarDrawerUser();
}
function fecharDrawer() {
  document.getElementById('zknDrawer')?.classList.remove('open');
  document.getElementById('zknDrawerBackdrop')?.classList.remove('open');
  document.getElementById('zknDrawer')?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
}
function atualizarDrawerUser() {
  const userBox = document.getElementById('drawerUser');
  const footer = document.getElementById('drawerFooter');
  if (!userBox || !footer) return;

  const user = window.ZKNAuth?.getUser?.();
  if (user) {
    userBox.innerHTML = `
      <div class="drawer-avatar">${gerarIniciais(user.name)}</div>
      <div class="drawer-user-info">
        <div class="drawer-user-name">${user.name}</div>
        <div class="drawer-user-phone">${user.phone}</div>
      </div>
    `;
    footer.innerHTML = `<button class="drawer-btn" onclick="window.ZKNAuth.logout()">Sair da conta</button>`;
  } else {
    userBox.innerHTML = `
      <div class="drawer-avatar">?</div>
      <div class="drawer-user-info">
        <div class="drawer-user-name">Visitante</div>
        <div class="drawer-user-phone">Faça login</div>
      </div>
    `;
    footer.innerHTML = `
      <button class="drawer-btn ghost" onclick="location.href='login.html'">Entrar</button>
      <button class="drawer-btn" onclick="location.href='cadastro.html'">Criar conta</button>
    `;
  }
}

function abrirIndicacaoDrawer() {
  const user = window.ZKNAuth?.getUser?.();
  if (!user) {
    toast('Faça login', 'Você precisa entrar para ver seu código.', 'warning');
    return;
  }
  const base = location.origin + location.pathname.replace(/\/[^/]*$/, '/');
  const link = `${base}cadastro.html?ref=${user.refCode}`;

  const w = window.open('', '_blank', 'width=520,height=380');
  w.document.write(`
    <html><head><title>Meu código de indicação</title>
    <style>
      body{background:#0a0f1a;color:#f5f7fa;font-family:Inter,system-ui,sans-serif;padding:32px;text-align:center;}
      h2{font-size:18px;margin-bottom:8px;color:#f5be3c;}
      p{font-size:13px;color:#8a94a6;margin-bottom:20px;}
      .code{background:#111827;border:1px solid rgba(245,190,60,0.35);border-radius:10px;padding:16px;font-family:monospace;font-size:16px;color:#f5be3c;word-break:break-all;margin-bottom:16px;}
      button{background:linear-gradient(135deg,#f5be3c,#ffd76e);color:#0a0f1a;border:none;padding:12px 24px;border-radius:8px;font-weight:800;font-size:14px;cursor:pointer;}
    </style></head><body>
      <h2>Seu código de indicação</h2>
      <p>Compartilhe e ganhe comissão em cada aposta dos seus indicados.</p>
      <div class="code">${link}</div>
      <button onclick="navigator.clipboard.writeText('${link}');this.textContent='Copiado!'">Copiar link</button>
    </body></html>
  `);
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  ZKN_USER.balance = ZKN_USER.balance;
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharDrawer(); });
  window.addEventListener('pageshow', () => { if (window.ZKNAuth?.isLoggedIn?.()) iniciarPollingSaldo(); });
});


// ============================================================
// ATUALIZACAO AUTOMATICA DE SALDO (polling)
// Chama /api/balance a cada 15s e atualiza o header sem reload
// ============================================================
let _saldoPollInterval = null;

async function atualizarSaldoHeader() {
  if (!window.ZKNAuth?.isLoggedIn?.()) return;
  try {
    const saldo = await window.ZKNAuth.getSaldo();
    // Atualiza todos os elementos [data-balance] (header, saldo-info, etc.)
    document.querySelectorAll('[data-balance]').forEach(el => {
      el.textContent = formatBRL(saldo);
    });
  } catch (e) {
    // silencioso
  }
}

function iniciarPollingSaldo() {
  if (_saldoPollInterval) clearInterval(_saldoPollInterval);
  if (!window.ZKNAuth?.isLoggedIn?.()) return;

  // Atualiza imediatamente ao carregar
  atualizarSaldoHeader();

  // Depois a cada 15 segundos
  _saldoPollInterval = setInterval(atualizarSaldoHeader, 15000);

  console.log('[SALDO] polling iniciado (15s)');
}

function pararPollingSaldo() {
  if (_saldoPollInterval) {
    clearInterval(_saldoPollInterval);
    _saldoPollInterval = null;
    console.log('[SALDO] polling parado');
  }
}

// Expoe no window pra usar em outras paginas se precisar
window.ZKNSaldo = {
  atualizar: atualizarSaldoHeader,
  iniciar: iniciarPollingSaldo,
  parar: pararPollingSaldo,
};

// ---------- Botao de atualizar saldo ----------
async function atualizarSaldoBtn(btn) {
  if (!btn || btn.classList.contains('loading')) return;
  btn.classList.add('loading');
  try {
    if (window.ZKNSaldo && window.ZKNSaldo.atualizar) {
      await window.ZKNSaldo.atualizar();
    } else if (window.ZKNAuth && window.ZKNAuth.getSaldo) {
      const saldo = await window.ZKNAuth.getSaldo();
      document.querySelectorAll('[data-balance]').forEach(el => {
        el.textContent = formatBRL(saldo);
      });
    }
    // Feedback visual
    btn.style.color = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    setTimeout(() => {
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 800);
  } catch (e) {
    console.warn('[atualizarSaldoBtn]', e.message);
  } finally {
    setTimeout(() => btn.classList.remove('loading'), 400);
  }
}

window.ZKN = {
  ZKN_USER, formatBRL, toast, gerarIniciais,
  renderHeader, abrirDrawer, fecharDrawer, abrirIndicacaoDrawer, atualizarSaldoBtn,
};
