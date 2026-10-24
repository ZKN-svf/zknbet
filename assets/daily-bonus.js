// ============================================================
// BONUS DIARIO — botao flutuante + popup
// Aparece raramente (20% de chance) na pagina de jogos
// 1x por dia por usuario
// ============================================================

(function() {
  // Configuracoes
  const CHANCE = 0.20;
  const STORAGE_KEY = 'zkn_daily_bonus_last_shown';  // quando apareceu por ultimo
  const STORAGE_CLAIMED = 'zkn_daily_bonus_claimed'; // quando resgatou por ultimo
  const PAGES_ATIVAS = ['index.html', 'jogos.html'];

  // Pega a pagina atual
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  if (!PAGES_ATIVAS.includes(currentPage)) return;

  // Nao mostra se nao ta logado
  if (!window.ZKNAuth?.isLoggedIn?.()) return;

  // Chave do dia (BRT)
  function getDayKey() {
    const agora = new Date();
    const brasilia = new Date(agora.getTime() - 3 * 60 * 60 * 1000);
    return brasilia.toISOString().slice(0, 10);
  }

  // Ja resgatou hoje?
  function jaResgatouHoje() {
    const lastClaim = localStorage.getItem(STORAGE_CLAIMED);
    return lastClaim === getDayKey();
  }

  // Ja mostrou hoje? (pra nao ficar aparecendo toda hora)
  function jaMostrouHoje() {
    const lastShown = localStorage.getItem(STORAGE_KEY);
    return lastShown === getDayKey();
  }

  // So tenta mostrar se ainda nao resgatou hoje
  if (jaResgatouHoje()) return;

  // Rola o dado
  if (Math.random() > CHANCE) return;

  // Marca que mostrou hoje (pra nao ficar aparecendo toda hora)
  localStorage.setItem(STORAGE_KEY, getDayKey());

  // Cria o botao flutuante
  const botao = document.createElement('button');
  botao.id = 'daily-bonus-btn';
  botao.className = 'daily-bonus-btn';
  botao.innerHTML = '🎁 <span>Bônus surpresa!</span>';
  botao.onclick = abrirPopup;

  // CSS embutido
  const style = document.createElement('style');
  style.textContent = `
    .daily-bonus-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9998;
      background: linear-gradient(135deg, #f5be3c 0%, #ffd76e 100%);
      color: #0a0f1a;
      border: none;
      border-radius: 50px;
      padding: 14px 24px;
      font-family: 'Inter', sans-serif;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(245, 190, 60, 0.6);
      display: flex;
      align-items: center;
      gap: 8px;
      animation: daily-bonus-pulse 2s ease-in-out infinite;
      transition: all 0.2s ease;
    }
    .daily-bonus-btn:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 12px 40px rgba(245, 190, 60, 0.8);
    }
    .daily-bonus-btn:active {
      transform: scale(0.95);
    }
    @keyframes daily-bonus-pulse {
      0%, 100% { box-shadow: 0 8px 32px rgba(245, 190, 60, 0.6); }
      50% { box-shadow: 0 8px 48px rgba(245, 190, 60, 0.9); }
    }
    @media (max-width: 640px) {
      .daily-bonus-btn {
        bottom: 16px;
        right: 16px;
        padding: 12px 18px;
        font-size: 14px;
      }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(botao);

  // Popup
  function abrirPopup() {
    // Desabilita botao
    botao.disabled = true;
    botao.style.opacity = '0.7';
    botao.innerHTML = '⏳ Verificando...';

    // Cria o popup
    const popup = document.createElement('div');
    popup.className = 'daily-bonus-popup-backdrop';
    popup.innerHTML = `
      <div class="daily-bonus-popup">
        <div class="daily-bonus-popup-icon">🎁</div>
        <h3 class="daily-bonus-popup-title">Bônus surpresa!</h3>
        <p class="daily-bonus-popup-text">Preparando sua surpresa...</p>
      </div>
    `;
    document.body.appendChild(popup);

    // CSS do popup
    const popupStyle = document.createElement('style');
    popupStyle.textContent = `
      .daily-bonus-popup-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: db-fade-in 0.2s ease-out;
      }
      .daily-bonus-popup {
        background: linear-gradient(180deg, #1a2332 0%, #0a0f1a 100%);
        border: 2px solid #f5be3c;
        border-radius: 24px;
        padding: 32px 28px;
        max-width: 360px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 80px rgba(245, 190, 60, 0.5);
        animation: db-pop-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .daily-bonus-popup-icon {
        font-size: 64px;
        margin-bottom: 16px;
        animation: db-bounce 0.6s ease-out;
      }
      .daily-bonus-popup-title {
        font-family: 'Sora', 'Inter', sans-serif;
        font-size: 24px;
        font-weight: 800;
        color: #f5be3c;
        margin-bottom: 8px;
      }
      .daily-bonus-popup-text {
        font-size: 15px;
        color: #f5f7fa;
        margin-bottom: 20px;
        line-height: 1.5;
      }
      .daily-bonus-popup-amount {
        font-family: 'Sora', 'Inter', sans-serif;
        font-size: 42px;
        font-weight: 900;
        background: linear-gradient(135deg, #00d67f, #00b96d);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 16px 0;
        letter-spacing: -2px;
      }
      .daily-bonus-popup-btn {
        background: linear-gradient(135deg, #f5be3c 0%, #ffd76e 100%);
        color: #0a0f1a;
        border: none;
        border-radius: 12px;
        padding: 14px 32px;
        font-weight: 800;
        font-size: 15px;
        cursor: pointer;
        width: 100%;
        margin-top: 8px;
        transition: all 0.2s ease;
      }
      .daily-bonus-popup-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(245, 190, 60, 0.5);
      }
      @keyframes db-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes db-pop-in {
        0% { transform: scale(0.7); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes db-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
    `;
    document.head.appendChild(popupStyle);

    // Chama backend
    fetch(window.ZKN_CONFIG.api + '/daily-bonus/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + window.ZKNAuth.getToken(),
      },
    })
    .then(r => r.json().then(data => ({ ok: r.ok, data })))
    .then(({ ok, data }) => {
      if (ok && data.ok) {
        // Marca como resgatado
        localStorage.setItem(STORAGE_CLAIMED, getDayKey());

        // Atualiza popup com valor
        const popupBox = popup.querySelector('.daily-bonus-popup');
        popupBox.innerHTML = `
          <div class="daily-bonus-popup-icon">🎉</div>
          <h3 class="daily-bonus-popup-title">Parabéns!</h3>
          <p class="daily-bonus-popup-text">Você ganhou</p>
          <div class="daily-bonus-popup-amount">R$ ${data.amount.toFixed(2).replace('.', ',')}</div>
          <p class="daily-bonus-popup-text" style="font-size:13px;color:#8a94a6;">O valor foi adicionado ao seu saldo!</p>
          <button class="daily-bonus-popup-btn" onclick="this.closest('.daily-bonus-popup-backdrop').remove()">Continuar jogando</button>
        `;

        // Atualiza saldo no header
        if (window.ZKNSaldo?.atualizar) {
          setTimeout(() => window.ZKNSaldo.atualizar(), 500);
        }

        // Toast
        if (window.ZKN?.toast) {
          ZKN.toast('Bônus resgatado!', `R$ ${data.amount.toFixed(2).replace('.', ',')} no seu saldo.`);
        }

        // Remove botao
        botao.remove();
      } else {
        // Ja resgatou hoje ou erro
        const msg = data.message || 'Voce ja ganhou hoje. Volte amanha!';
        popup.querySelector('.daily-bonus-popup').innerHTML = `
          <div class="daily-bonus-popup-icon">😊</div>
          <h3 class="daily-bonus-popup-title">Ops!</h3>
          <p class="daily-bonus-popup-text">${msg}</p>
          <button class="daily-bonus-popup-btn" onclick="this.closest('.daily-bonus-popup-backdrop').remove()">OK</button>
        `;

        // Marca como resgatado no localStorage tambem
        localStorage.setItem(STORAGE_CLAIMED, getDayKey());
        botao.remove();
      }
    })
    .catch(() => {
      popup.querySelector('.daily-bonus-popup').innerHTML = `
        <div class="daily-bonus-popup-icon">😞</div>
        <h3 class="daily-bonus-popup-title">Erro</h3>
        <p class="daily-bonus-popup-text">Nao foi possivel resgatar. Tente mais tarde.</p>
        <button class="daily-bonus-popup-btn" onclick="this.closest('.daily-bonus-popup-backdrop').remove()">OK</button>
      `;
      botao.remove();
    });
  }
})();
