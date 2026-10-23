// ============================================================
// ZKNbet — Validators + Máscaras
// ============================================================

// ---------- CPF ----------
function validarCPF(cpf) {
  cpf = String(cpf || '').replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let d1 = (soma * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  let d2 = (soma * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(cpf[10]);
}

// ---------- Celular BR ----------
// Aceita (11) 91234-5678, 11912345678, +5511912345678
function validarCelular(tel) {
  tel = String(tel || '').replace(/\D/g, '');
  if (tel.startsWith('55') && tel.length > 11) tel = tel.slice(2);
  if (tel.length !== 11) return false;
  if (!/^[1-9]{2}9\d{8}$/.test(tel)) return false;
  return true;
}

function normalizarCelular(tel) {
  tel = String(tel || '').replace(/\D/g, '');
  if (tel.startsWith('55') && tel.length > 11) tel = tel.slice(2);
  return tel;
}

// ---------- E-mail ----------
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

// ---------- Detecta CPF, celular ou e-mail ----------
function identificarTipo(valor) {
  const v = String(valor || '').trim();
  if (v.includes('@')) return { tipo: 'email', valor: v.toLowerCase() };
  const digits = v.replace(/\D/g, '');
  if (digits.length === 11 && validarCPF(digits)) return { tipo: 'cpf', valor: digits };
  if (validarCelular(digits)) return { tipo: 'phone', valor: normalizarCelular(digits) };
  return { tipo: 'unknown', valor: v };
}

// ---------- Máscaras ----------
function mascaraCPF(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  input.value = v;
  return v;
}

function mascaraCelular(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 6) {
    v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  } else if (v.length > 2) {
    v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  } else if (v.length > 0) {
    v = v.replace(/(\d{0,2})/, '($1');
  }
  input.value = v;
  return v;
}

// Máscara dinâmica (auto-detecta CPF ou celular)
function mascaraPixDinamica(input) {
  const raw = input.value.replace(/\D/g, '');
  if (raw.length === 11 && validarCPF(raw)) {
    return mascaraCPF(input);
  }
  if (raw.length === 11) {
    return mascaraCelular(input);
  }
  // Em digitação, aplica a de celular até saber
  return mascaraCelular(input);
}

// ---------- Exporta global ----------
window.ZKNVal = {
  validarCPF,
  validarCelular,
  normalizarCelular,
  validarEmail,
  identificarTipo,
  mascaraCPF,
  mascaraCelular,
  mascaraPixDinamica,
};