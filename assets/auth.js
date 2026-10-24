// ============================================================
// ZKNbet — Auth (sessão + chamadas API)
// ============================================================
const AUTH_CONFIG = {
  apiBase: window.ZKN_CONFIG?.api || 'https://zknbet-api.gabrielrobin63.workers.dev/api',
  jwtKey: 'zkn_jwt',
  userKey: 'zkn_user',
};

function getToken() { return localStorage.getItem(AUTH_CONFIG.jwtKey); }
function setToken(t) { localStorage.setItem(AUTH_CONFIG.jwtKey, t); }
function limparSessao() {
  localStorage.removeItem(AUTH_CONFIG.jwtKey);
  localStorage.removeItem(AUTH_CONFIG.userKey);
}
function getUser() {
  try {
    const raw = localStorage.getItem(AUTH_CONFIG.userKey);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function setUser(u) { localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(u)); }
function isLoggedIn() { return !!getToken() && !!getUser(); }
function requireLogin(redirectTo = null) {
  if (!isLoggedIn()) {
    const back = redirectTo || location.pathname.split('/').pop() || 'index.html';
    location.href = 'login.html?back=' + encodeURIComponent(back);
    return false;
  }
  return true;
}

// ---------- HTTP ----------
async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = 'Bearer ' + (getToken() || '');
  const res = await fetch(AUTH_CONFIG.apiBase + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data };
}

// ---------- Público ----------
async function register({ name, phone, email, password }) {
  const { ok, data } = await api('/auth/register', { method: 'POST', body: { name, phone, email, password }, auth: false });
  if (!ok) return { sucesso: false, mensagem: data.message || 'Erro ao cadastrar.' };
  setToken(data.token);
  setUser(data.user);
  return { sucesso: true, user: data.user };
}

async function login({ phone, password }) {
  const { ok, data } = await api('/auth/login', { method: 'POST', body: { phone, password }, auth: false });
  if (!ok) return { sucesso: false, mensagem: data.message || 'Celular ou senha incorretos.' };
  setToken(data.token);
  setUser(data.user);
  return { sucesso: true, user: data.user };
}

function logout() {
  limparSessao();
  location.href = 'index.html';
}

// ---------- Conta ----------
async function atualizarDados({ name, phone }) {
  const { ok, data } = await api('/me', { method: 'PUT', body: { name, phone } });
  if (!ok) return { sucesso: false, mensagem: data.message || 'Erro ao atualizar.' };
  setUser(data.user);
  return { sucesso: true, user: data.user };
}

async function alterarSenha({ currentPassword, newPassword }) {
  const { ok, data } = await api('/me/password', { method: 'PUT', body: { currentPassword, newPassword } });
  return ok ? { sucesso: true } : { sucesso: false, mensagem: data.message || 'Erro ao alterar senha.' };
}

async function getSaldo() {
  const { ok, data } = await api('/balance');
  if (ok && typeof data.balance === 'number') {
    const u = getUser() || {};
    u.balance = data.balance;
    setUser(u);
    document.querySelectorAll('[data-balance]').forEach(el => {
      el.textContent = window.ZKN?.formatBRL?.(data.balance) ?? ('R$ ' + data.balance.toFixed(2));
    });
    return data.balance;
  }
  return getUser()?.balance ?? 0;
}

// ---------- Favoritos (na conta) ----------
async function getFavoritos() {
  const { ok, data } = await api('/favorites');
  return ok ? (data.favorites || []) : [];
}
async function addFavorito(code) {
  const { ok, data } = await api('/favorites', { method: 'POST', body: { game_code: code } });
  return ok ? (data.favorites || []) : null;
}
async function removerFavorito(code) {
  const { ok, data } = await api('/favorites/' + encodeURIComponent(code), { method: 'DELETE' });
  return ok ? (data.favorites || []) : null;
}

// ---------- Recentes (na conta) ----------
async function getRecentes() {
  const { ok, data } = await api('/recent');
  return ok ? (data.recent || []) : [];
}
async function addRecente(code) {
  const { ok, data } = await api('/recent', { method: 'POST', body: { game_code: code } });
  return ok ? (data.recent || []) : null;
}

// ---------- PIN de saque ----------
async function salvarPinSaque({ pin, pixKey, pixKeyType, holderName, holderCpf }) {
  const { ok, data } = await api('/saque-pin/setup', { method: 'POST', body: { pin, pixKey, pixKeyType, holderName, holderCpf } });
  if (!ok) return { sucesso: false, mensagem: data.message || 'Erro ao salvar.' };
  const u = getUser(); u.hasWithdrawPin = true; setUser(u);
  return { sucesso: true };
}
async function verificarPinSaque(pin) {
  const { ok, data } = await api('/saque-pin/verify', { method: 'POST', body: { pin } });
  return ok ? { sucesso: true } : { sucesso: false, mensagem: data.message || 'PIN incorreto.' };
}
function temPinSaque() {
  const u = getUser();
  return !!(u && u.hasWithdrawPin);
}

// ---------- Transações ----------
async function getTransacoes() {
  const { ok, data } = await api('/transactions');
  return ok ? (data.transactions || []) : [];
}

// ---------- Indicação ----------
async function getIndicacoes() {
  const { ok, data } = await api('/referrals');
  return ok ? { referrals: data.referrals || [], stats: data.stats || {} } : { referrals: [], stats: {} };
}


// ---------- Dados de saque (PIX) - busca do backend ----------
async function getDadosSaque() {
  try {
    const res = await fetch((window.ZKN_CONFIG?.api || AUTH_CONFIG.apiBase) + '/me/pix', {
      headers: { 'Authorization': 'Bearer ' + (getToken() || '') },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.pix || null;
  } catch (e) {
    console.warn('[getDadosSaque]', e.message);
    return null;
  }
}

// ---------- Progresso do rollover (apostas obrigatorias) ----------
async function getRollover() {
  try {
    const res = await fetch((window.ZKN_CONFIG?.api || AUTH_CONFIG.apiBase) + '/me/rollover', {
      headers: { 'Authorization': 'Bearer ' + (getToken() || '') },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('[getRollover]', e.message);
    return null;
  }
}
window.ZKNAuth = {
  CONFIG: AUTH_CONFIG,
  api,
  register, login, logout,
  getUser, isLoggedIn, requireLogin, getToken, setUser,
  atualizarDados, alterarSenha, getSaldo,
  getFavoritos, addFavorito, removerFavorito, getRollover,
  getRecentes, addRecente,
  salvarPinSaque, verificarPinSaque, temPinSaque, getDadosSaque,
  getTransacoes, getIndicacoes,
};