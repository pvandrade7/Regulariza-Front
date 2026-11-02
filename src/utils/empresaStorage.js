// Guarda dados da empresa na sessão do navegador.
//
// - saveEmpresa/getEmpresa: MODO DE TESTE (sem back-end). Guarda o formulário inteiro.
// - saveEmpresaId/getEmpresaId: MODO API. Guarda só o id que o back devolver.

const EMPRESA_KEY = "regulariza_empresa";
const EMPRESA_ID_KEY = "regulariza_empresa_id";

export function saveEmpresa(empresa) {
  sessionStorage.setItem(EMPRESA_KEY, JSON.stringify(empresa));
}

export function getEmpresa() {
  const raw = sessionStorage.getItem(EMPRESA_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveEmpresaId(id) {
  sessionStorage.setItem(EMPRESA_ID_KEY, id);
}

export function getEmpresaId() {
  return sessionStorage.getItem(EMPRESA_ID_KEY);
}