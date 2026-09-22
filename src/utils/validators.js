// Validações usadas pelas telas de Login e Cadastro da Empresa (Sprint 1)
// Mantidas fora dos componentes para poderem ser reaproveitadas e testadas isoladamente.

export function isRequired(value) {
  return typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;
}

export function isValidEmail(value) {
  // Regra simples e suficiente para validação de formato no front-end.
  // A checagem definitiva (existência do e-mail) é responsabilidade do back-end.
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPasswordLength(value, min = 6) {
  return value.length >= min;
}

// Aplica a máscara 00.000.000/0000-00 enquanto o usuário digita.
export function maskCNPJ(value) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

// Validação estrutural do CNPJ (14 dígitos). Não recalcula os dígitos
// verificadores — suficiente para o MVP, podendo ser reforçada no back-end.
export function isValidCNPJ(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false; // todos os dígitos iguais
  return true;
}

// Mantém apenas dígitos, usado no campo "Número de funcionários".
export function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

export function isPositiveInteger(value) {
  if (value === "") return false;
  return /^\d+$/.test(value) && Number(value) >= 0;
}
