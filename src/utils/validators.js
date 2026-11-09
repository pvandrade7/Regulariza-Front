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

// Regra de senha (BUG-002 / CT-007): não pode conter espaços em branco.
export function hasNoSpaces(value) {
  return !/\s/.test(value);
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

export function isValidCPF(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (let tamanho = 9; tamanho <= 10; tamanho++) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    if ((resto === 10 ? 0 : resto) !== Number(cpf[tamanho])) return false;
  }
  return true;
}
export function isValidCNPJ(value) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const digito = (base, pesos) => {
    const resto = pesos.reduce((soma, peso, i) => soma + Number(base[i]) * peso, 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return digito(cnpj, [5,4,3,2,9,8,7,6,5,4,3,2]) === Number(cnpj[12]) &&
    digito(cnpj, [6,5,4,3,2,9,8,7,6,5,4,3,2]) === Number(cnpj[13]);
}

// Mantém apenas dígitos, usado no campo "Número de funcionários".
export function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

export function isPositiveInteger(value) {
  if (value === "") return false;
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 2147483647;
}
