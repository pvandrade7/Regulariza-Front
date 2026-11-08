// Apenas seleção temporária na sessão. Os dados sempre vêm do PostgreSQL.
const EMPRESA_ID_KEY = "regulariza_empresa_id";
let empresaAtual = null;
export function getEmpresa() { return empresaAtual; }
export function setEmpresaAtual(empresa) { empresaAtual = empresa; }
export function saveEmpresaId(id) {
  empresaAtual = null;
  sessionStorage.removeItem("regulariza_empresa");
  if (id) sessionStorage.setItem(EMPRESA_ID_KEY, id);
  else sessionStorage.removeItem(EMPRESA_ID_KEY);
}
export function getEmpresaId() { return sessionStorage.getItem(EMPRESA_ID_KEY); }
