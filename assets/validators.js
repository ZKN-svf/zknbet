// ============================================================
// ZKNbet — Validators + Máscaras (v2 — telefone robusto)
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

// ---------- CELULAR (BR) ----------
// Aceita:
//   - 11999999999 (11 dígitos, DDD + 9 + 8)
//   - 1199999999 (10 dígitos, DDD + 8 — fixo ou antigo)
//   - 5511999999999 (13 dígitos, com +55)
//   - +5511999999999
//   - (11) 99999-9999
//   - (11) 9999-9999
function validarCelular(tel) {
  let digits = String(tel || '').replace(/\D/g, '');

  // Remove prefixo 55 (Brasil) se tiver
  if (digits.length > 11 && digits.startsWith('55')) {
    digits = digits.slice(2);
  }

  // Aceita 10 ou 11 dígitos
  if (digits.length !== 10 && digits.length !== 11) return false;

  // DDD válido (11 a 99)
  const ddd = parseInt(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  // Se 11 dígitos, o terceiro precisa ser 9 (celular novo)
  if (digits.length === 11 && digits[2] !== '9') return false;

  // Se 10 dígitos, o terceiro precisa ser 2-5 (fixo) ou 6-9 (celular antigo)
  if (digits.length === 10) {
    const primeiro = digits[2];
    if (primeiro === '0' || primeiro === '1') return false;
  }

  return true;
}

// Normaliza: retorna só os dígitos, sem +55 (formato do D1: 11 dígitos)
function normalizarCelular(tel) {
  let digits = String(tel || '').replace(/\D/g, '');
  if (digits.length > 11 && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  return digits;
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

// Máscara de celular: aceita 10 ou 11 dígitos
// 11 dígitos: (11) 99999-9999
// 10 dígitos: (11) 9999-9999
function mascaraCelular(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 11);

  if (v.length <= 2) {
    input.value = v.length > 0 ? '(' + v : '';
    return input.value;
  }

  if (v.length <= 6) {
    input.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
    return input.value;
  }

  if (v.length <= 10) {
    // (11) 9999-9999
    input.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6);
  } else {
    // (11) 99999-9999 (11 dígitos)
    input.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
  }
  return input.value;
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
