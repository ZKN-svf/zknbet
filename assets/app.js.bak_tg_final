// Animacao do saldo
let _ultimoSaldoAnim = null;
function _animarSaldo() {
  const els = document.querySelectorAll('[data-balance]');
  if (!els.length) return;
  els.forEach(el => {
    const t = el.textContent.trim();
    if (t === _ultimoSaldoAnim) return;
    el.classList.remove('saldo-atualizado');
    void el.offsetWidth;
    el.classList.add('saldo-atualizado');
    const chip = el.closest('.balance-chip');
    if (chip) { chip.classList.remove('saldo-atualizado'); void chip.offsetWidth; chip.classList.add('saldo-atualizado'); }
    setTimeout(() => { el.classList.remove('saldo-atualizado'); if (chip) chip.classList.remove('saldo-atualizado'); }, 1000);
  });
  _ultimoSaldoAnim = els[0]?.textContent.trim();
}
window._animarSaldo = _animarSaldo;

// ============================================================
// ZKNbet — App core (header, saldo, toasts, sessão, drawer)
// ============================================================

const ZKN_USER = {
  get balance() { return Number((window.ZKNAuth?.getUser?.() || {}).balance || 0); },
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
    
          <button class="drawer-close" onclick="ZKN.fecharDrawer()" aria-label="Fechar">✕</button>
        </div>

        <div class="drawer-user" id="drawerUser"></div>

        <nav class="drawer-nav">
          <div class="drawer-section-title">Conta</div>
          <a class="drawer-link" href="index.html"><span class="ico ico-home"></span> Início</a>
          <a class="drawer-link" href="minha-conta.html"><span class="ico ico-user"></span> Minha conta</a>
          <a class="drawer-link" href="alterar-dados.html"><span class="ico ico-edit"></span> Alterar dados</a>
          <a class="drawer-link" href="alterar-senha.html"><span class="ico ico-lock"></span> Alterar senha</a>

          <div class="drawer-section-title">Jogar</div>
          <a class="drawer-link" href="jogos.html"><span class="ico ico-gamepad"></span> Todos os jogos</a>
          <a class="drawer-link" href="provedoras.html"><span class="ico ico-trophy"></span> Provedoras</a>
          <a class="drawer-link" href="favoritos.html"><span class="ico ico-star"></span> Favoritos</a>
          <a class="drawer-link" href="recompensas.html">🎰 Recompensas</a>
          <a class="drawer-link" href="ofertas.html">🎁 Ofertas</a>

          <div class="drawer-section-title">Carteira</div>
          <a class="drawer-link" href="deposito.html"><span class="ico ico-money"></span> Depositar</a>
          <a class="drawer-link" href="saque.html"><span class="ico ico-cash"></span> Sacar</a>
          <a class="drawer-link" href="historico.html"><span class="ico ico-history"></span> Histórico</a>
          <button class="drawer-link drawer-link-btn" onclick="ZKN.abrirResgatarCodigo()"><span class="ico ico-ticket" style="width:1.2em;height:1.2em;vertical-align:middle;"></span> Resgatar Código</button>

          <div class="drawer-section-title">Indicação</div>
          <a class="drawer-link" href="indicacao.html"><span class="ico ico-handshake"></span> Indique e ganhe</a>
          <button class="drawer-link drawer-link-btn" onclick="ZKN.abrirIndicacaoDrawer()">🔗 Seu código de indicação</button>

          <div class="drawer-section-title">Ajuda</div>
          <a class="drawer-link" href="https://t.me/Micaelasilva7" target="_blank" rel="noopener"><span class="ico ico-telegram"></span> Suporte (Telegram)</a>
        </nav>

        <div class="drawer-footer" id="drawerFooter"></div>
      </aside>
    `);
  }

  atualizarDrawerUser();

  // Banner de verificação de email
  (function() {
    const u = window.ZKNAuth?.getUser?.();
    if (!u || u.emailVerified || document.getElementById('zknEmailBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'zknEmailBanner';
    banner.style.cssText = 'position:fixed;top:68px;left:0;right:0;z-index:99;background:linear-gradient(90deg,#f5be3c,#ffd76e);color:#0a0f1a;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px;font-weight:700;box-shadow:0 4px 16px rgba(0,0,0,0.3);';
    banner.innerHTML = '<span>&#9888;&#65039; Verifique seu email para liberar saques. (olhe a caixa de spam)</span>' +
      '<button onclick="ZKN.reenviarEmail(this)" style="background:#0a0f1a;color:#f5be3c;border:none;padding:8px 16px;border-radius:8px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap;">Reenviar</button>';
    document.body.appendChild(banner);
  })();
}

function abrirDrawer() {
  document.getElementById('zknDrawer')?.classList.add('open');
  document.getElementById('zknDrawerBackdrop')?.classList.add('open');
  document.getElementById('zknDrawer')?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
  atualizarDrawerUser();

  // Banner de verificação de email
  (function() {
    const u = window.ZKNAuth?.getUser?.();
    if (!u || u.emailVerified || document.getElementById('zknEmailBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'zknEmailBanner';
    banner.style.cssText = 'position:fixed;top:68px;left:0;right:0;z-index:99;background:linear-gradient(90deg,#f5be3c,#ffd76e);color:#0a0f1a;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px;font-weight:700;box-shadow:0 4px 16px rgba(0,0,0,0.3);';
    banner.innerHTML = '<span>&#9888;&#65039; Verifique seu email para liberar saques. (olhe a caixa de spam)</span>' +
      '<button onclick="ZKN.reenviarEmail(this)" style="background:#0a0f1a;color:#f5be3c;border:none;padding:8px 16px;border-radius:8px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap;">Reenviar</button>';
    document.body.appendChild(banner);
  })();
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

// ============================================================
// Sincroniza o status de e-mail verificado com o servidor
// ============================================================
async function sincronizarEmailVerificado() {
  if (!window.ZKNAuth?.isLoggedIn?.()) return;
  try {
    const res = await ZKNAuth.api('/me');
    if (res.ok && res.data && res.data.user) {
      const serverUser = res.data.user;
      const localUser = ZKNAuth.getUser();
      
      if (localUser && !localUser.emailVerified && serverUser.emailVerified) {
        // Atualiza o cache local
        localUser.emailVerified = serverUser.emailVerified;
        ZKNAuth.setUser(localUser);
        
        // Remove o banner amarelo se ele existir na tela
        const banner = document.getElementById('zknEmailBanner');
        if (banner) banner.remove();
        
        // Se estiver na tela de saque, atualiza a mensagem de bloqueio
        if (location.pathname.includes('saque.html')) {
          const box = document.getElementById('statusBox');
          if (box && box.innerHTML.includes('Verifique seu email')) {
            box.className = 'status-box';
            box.innerHTML = '';
          }
        }
        
        // Toast de confirmação (opcional)
        if (window.ZKN && ZKN.toast) {
          ZKN.toast('E-mail verificado!', 'Seus saques estão liberados.');
        }
      }
    }
  } catch (e) {
    // Silencioso, se der erro na rede não faz nada
  }
}

// Chama a função quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(sincronizarEmailVerificado, 1500); // Espera 1.5s pra não travar o carregamento inicial
});

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  if (window.ZKNAuth?.isLoggedIn?.()) { window.ZKNAuth.getSaldo().catch(() => {}); }
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
      if (typeof _animarSaldo === 'function') _animarSaldo();
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
  reenviarEmail: async function(btn) {
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    const r = await window.ZKNAuth.reenviarVerificacao();
    if (r.sucesso) {
      toast('Email enviado!', 'Verifique sua caixa de entrada.');
      btn.textContent = 'Enviado \u2713';
      setTimeout(() => { btn.disabled = false; btn.textContent = 'Reenviar'; }, 30000);
    } else {
      toast('Erro', r.mensagem, 'error');
      btn.disabled = false;
      btn.textContent = 'Reenviar';
    }
  },

  ZKN_USER, formatBRL, toast, gerarIniciais,
  renderHeader, abrirDrawer, fecharDrawer, abrirIndicacaoDrawer, atualizarSaldoBtn,
};


// ============================================================
// ANIMACAO AUTOMATICA NO SALDO
// Observa todos os [data-balance] e dispara animacao quando
// o texto mudar (deposito, saque, aposta, bonus, polling, etc).
// ============================================================
(function() {
  function animar(el) {
    el.classList.remove('saldo-atualizado');
    void el.offsetWidth; // force reflow
    el.classList.add('saldo-atualizado');
    const chip = el.closest('.balance-chip');
    if (chip) {
      chip.classList.remove('saldo-atualizado');
      void chip.offsetWidth;
      chip.classList.add('saldo-atualizado');
    }
    setTimeout(() => {
      el.classList.remove('saldo-atualizado');
      if (chip) chip.classList.remove('saldo-atualizado');
    }, 1000);
  }

  function observar() {
    const els = document.querySelectorAll('[data-balance]');
    els.forEach(el => {
      if (el.__animObs) return;
      el.__animObs = true;
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          if (m.type === 'characterData' || m.type === 'childList') {
            const atual = el.textContent.trim();
            if (el.__animLast !== undefined && el.__animLast !== atual) {
              animar(el);
            }
            el.__animLast = atual;
          }
        });
      });
      observer.observe(el, { characterData: true, childList: true, subtree: true });
      el.__animLast = el.textContent.trim();
    });
  }

  // Observa elementos existentes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observar);
  } else {
    observar();
  }
  // Re-observa se novos [data-balance] forem adicionados (ex: apos drawer)
  new MutationObserver(() => {
    document.querySelectorAll('[data-balance]').forEach(el => {
      if (!el.__animObs) observar();
    });
  }).observe(document.body, { childList: true, subtree: true });
})();

window._animarSaldo = function() {
  document.querySelectorAll('[data-balance]').forEach(el => {
    if (typeof animar === 'function') animar(el);
  });
};

// Forca a animacao mesmo se o saldo nao mudou (uso no botao de recarregar)
function forcarAnimacaoSaldo() {
  document.querySelectorAll('[data-balance]').forEach(el => {
    el.classList.remove('saldo-atualizado');
    void el.offsetWidth;
    el.classList.add('saldo-atualizado');
    const chip = el.closest('.balance-chip');
    if (chip) {
      chip.classList.remove('saldo-atualizado');
      void chip.offsetWidth;
      chip.classList.add('saldo-atualizado');
    }
    setTimeout(() => {
      el.classList.remove('saldo-atualizado');
      if (chip) chip.classList.remove('saldo-atualizado');
    }, 1000);
  });
}
window.forcarAnimacaoSaldo = forcarAnimacaoSaldo;

// ============================================================
// RESGATAR CODIGO PROMOCIONAL (Modal)
// ============================================================
window.ZKN = window.ZKN || {};

// ============================================================
// RESGATAR CODIGO PROMOCIONAL (Modal)
// ============================================================

// ============================================================
// RESGATAR CODIGO PROMOCIONAL (Modal) - VERSAO CORRIGIDA
// ============================================================

// ============================================================
// RESGATAR CODIGO PROMOCIONAL (Modal) - VERSAO CORRIGIDA
// ============================================================
window.ZKN.abrirResgatarCodigo = function() {
  const backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
  
  backdrop.innerHTML = `
    <div style="background:linear-gradient(180deg, #1a2332 0%, #0a0f1a 100%); border:2px solid #f5be3c; border-radius:24px; padding:32px 24px; max-width:400px; width:100%; text-align:center; box-shadow:0 20px 60px rgba(245,190,60,0.3); position:relative;">
      <button id="btnFecharModal" style="position:absolute;top:12px;right:16px;background:transparent;border:none;color:#8a94a6;font-size:24px;cursor:pointer;">&times;</button>
      <div style="font-size:56px;margin-bottom:16px;"><span class="ico ico-ticket" style="width:3.5rem;height:3.5rem;vertical-align:middle;"></span></div>
      <h3 style="font-family:var(--font-display);font-size:22px;font-weight:800;color:#f5be3c;margin-bottom:8px;">Resgatar Código</h3>
      <p style="font-size:14px;color:#8a94a6;margin-bottom:20px;">Digite o código promocional para receber seu bônus.</p>
      
      <input id="inputPromoCode" type="text" placeholder="Ex: ZKN10" style="width:100%;padding:16px;background:#15171C;border:1px solid #333;border-radius:10px;color:#fff;font-size:18px;text-align:center;text-transform:uppercase;margin-bottom:16px;outline:none;font-weight:700;">
      
      <div style="display:flex;gap:8px;">
        <button id="btnCancelarPromo" style="flex:1;padding:14px;border-radius:10px;background:#2a2a2a;border:1px solid #444;color:#fff;font-weight:700;cursor:pointer;">Cancelar</button>
        <button id="btnConfirmarPromo" style="flex:1;padding:14px;border-radius:10px;background:linear-gradient(135deg, #00d67f, #00b96d);color:#fff;font-weight:800;border:none;cursor:pointer;">Resgatar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(backdrop);
  
  const input = backdrop.querySelector('#inputPromoCode');
  const btnFechar = backdrop.querySelector('#btnFecharModal');
  const btnCancelar = backdrop.querySelector('#btnCancelarPromo');
  const btnConfirmar = backdrop.querySelector('#btnConfirmarPromo');
  
  input.focus();
  
  btnFechar.onclick = () => backdrop.remove();
  btnCancelar.onclick = () => backdrop.remove();
  
  btnConfirmar.onclick = async () => {
    const codeValue = String(input.value || '').trim().toUpperCase();
    
    if (!codeValue) {
      if (window.ZKN && window.ZKN.toast) window.ZKN.toast('Atenção', 'Digite um código antes de resgatar.', 'warning');
      return;
    }
    
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = 'Verificando...';
    
    try {
      const token = window.ZKNAuth.getToken();
      const apiBase = (window.ZKN_CONFIG && window.ZKN_CONFIG.api) || 'https://zknbet-api.gabrielrobin63.workers.dev/api';
      
      // Usa fetch direto, igual o auth.js faz
      const res = await fetch(apiBase + '/promo/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ code: codeValue })
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        if (window.ZKN && window.ZKN.toast) {
          window.ZKN.toast('Sucesso!', 'Você ganhou R$ ' + Number(data.value).toFixed(2).replace('.', ','), 'success');
        }
        backdrop.remove();
        if (window.ZKNSaldo && window.ZKNSaldo.atualizar) {
          window.ZKNSaldo.atualizar();
        }
      } else {
        if (window.ZKN && window.ZKN.toast) {
          window.ZKN.toast('Erro', data.message || 'Código inválido', 'error');
        }
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Resgatar';
      }
    } catch (e) {
      if (window.ZKN && window.ZKN.toast) {
        window.ZKN.toast('Erro', e.message, 'error');
      }
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = 'Resgatar';
    }
  };
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnConfirmar.click();
  });
};
// ============================================================
// OLHO PARA MOSTRAR SENHA (global)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('input[type="password"]');
  
  inputs.forEach(input => {
    // Evita colocar duas vezes
    if (input.parentNode.classList.contains('zkn-pass-wrap')) return;

    const wrap = document.createElement('div');
    wrap.className = 'zkn-pass-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'zkn-eye-toggle';
    
    // Ícone do olho fechado (SVG)
    const eyeOffSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
    
    // Ícone do olho aberto (SVG)
    const eyeOnSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    
    btn.innerHTML = eyeOffSvg;

    wrap.appendChild(btn);

    btn.onclick = () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.innerHTML = isHidden ? eyeOnSvg : eyeOffSvg;
    };
  });
});

// ============================================================
// CARREGAR TEMA SAZONAL
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const apiBase = (window.ZKN_CONFIG && window.ZKN_CONFIG.api) || '';
    const res = await fetch(apiBase + '/settings/theme');
    const data = await res.json();
    
    if (data.theme && data.theme !== 'default') {
      if (!document.getElementById('event-theme-css')) {
        const link = document.createElement('link');
        link.id = 'event-theme-css';
        link.rel = 'stylesheet';
        link.href = 'assets/events.css';
        document.head.appendChild(link);
      }
      document.body.classList.add('theme-' + data.theme);
    }
  } catch(e) { console.error('Erro ao carregar tema', e); }
});

// ============================================================
// CARREGAR TEMA SAZONAL ULTRA
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const apiBase = (window.ZKN_CONFIG && window.ZKN_CONFIG.api) || '';
    const res = await fetch(apiBase + '/settings/theme');
    const data = await res.json();
    
    if (data.theme && data.theme !== 'default') {
      // Adiciona o CSS do tema
      if (!document.getElementById('event-theme-css')) {
        const link = document.createElement('link');
        link.id = 'event-theme-css';
        link.rel = 'stylesheet';
        link.href = 'assets/events.css?v=' + Date.now(); // Cache bust
        document.head.appendChild(link);
      }
      
      // Aplica a classe no body
      document.body.classList.add('theme-' + data.theme);

      // Exemplo de injeção de HTML extra (se precisar)
      if (data.theme === 'christmas' && !document.getElementById('xmas-lights')) {
        const lights = document.createElement('div');
        lights.id = 'xmas-lights';
        // Aqui poderia injetar luzes via DOM se o CSS não fosse suficiente
        document.body.appendChild(lights);
      }
    }
  } catch(e) { console.error('Erro ao carregar tema', e); }
});
