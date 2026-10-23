// SIGILOPAY CLIENT (frontend) - chama o Worker
function _apiBase() {
  return (window.ZKN_CONFIG && window.ZKN_CONFIG.api) || 'https://zknbet-api.gabrielrobin63.workers.dev/api';
}

function _authHeaders() {
  const token = (window.ZKNAuth && window.ZKNAuth.getToken && window.ZKNAuth.getToken()) || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  };
}

function detectarTipoPix(chave) {
  const limpa = String(chave || '').replace(/\D/g, '');
  if (limpa.length === 11 && /^\d+$/.test(limpa)) return 'cpf';
  if (limpa.length === 14 && /^\d+$/.test(limpa)) return 'cnpj';
  if (String(chave).includes('@')) return 'email';
  if (limpa.length === 11 || limpa.length === 13) return 'phone';
  return 'random';
}

async function criarCobrancaPIX(valor) {
  try {
    const res = await fetch(_apiBase() + '/pix/deposit', {
      method: 'POST',
      headers: _authHeaders(),
      body: JSON.stringify({ amount: parseFloat(Number(valor).toFixed(2)) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { sucesso: false, mensagem: data.message || 'Erro ao gerar PIX' };
    return {
      sucesso: true,
      identifier: data.identifier,
      transactionId: data.transactionId,
      qr_code_copia_cola: data.pix && data.pix.code ? data.pix.code : null,
      expires_at: (data.pix && data.pix.expiresAt) || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      valor: valor,
    };
  } catch (e) {
    return { sucesso: false, mensagem: 'Erro de conexao: ' + e.message };
  }
}

async function consultarPagamento(identifier) {
  try {
    const res = await fetch(_apiBase() + '/pix/status/' + encodeURIComponent(identifier), {
      headers: _authHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    return { sucesso: res.ok, status: data.status, pago: data.paid === true };
  } catch (e) {
    return { sucesso: false, pago: false };
  }
}

async function criarTransferencia(valor, chavePix, dadosProprietario) {
  try {
    const res = await fetch(_apiBase() + '/pix/transfer', {
      method: 'POST',
      headers: _authHeaders(),
      body: JSON.stringify({
        amount: parseFloat(Number(valor).toFixed(2)),
        pix: { key: chavePix, type: detectarTipoPix(chavePix) },
        owner: {
          name: dadosProprietario.nome,
          document: String(dadosProprietario.cpf).replace(/\D/g, ''),
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { sucesso: false, mensagem: data.message || 'Erro no saque' };
    return {
      sucesso: true,
      withdraw_id: data.withdraw && data.withdraw.id,
      status: data.withdraw && data.withdraw.status,
      valor: data.withdraw && data.withdraw.amount,
      taxa: data.withdraw && data.withdraw.feeAmount,
    };
  } catch (e) {
    return { sucesso: false, mensagem: 'Erro de conexao: ' + e.message };
  }
}

function gerarQRCode(container, texto) {
  if (!container) return;
  container.innerHTML = '';
  if (typeof QRCode === 'undefined') {
    container.innerHTML = '<p style="color:#94a3b8;">QR nao carregado</p>';
    return;
  }
  new QRCode(container, {
    text: texto,
    width: 220,
    height: 220,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M,
  });
}

window.SigiloPay = {
  criarCobrancaPIX: criarCobrancaPIX,
  consultarPagamento: consultarPagamento,
  criarTransferencia: criarTransferencia,
  gerarQRCode: gerarQRCode,
  detectarTipoPix: detectarTipoPix,
};
