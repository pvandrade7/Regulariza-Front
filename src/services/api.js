let csrfToken = null;
export function setCsrfToken(token) { csrfToken = token; }
const BASE_URL = (import.meta.env?.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}
export async function request(path, { method = "GET", body } = {}) {
  let res;
  const headers = body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (!['GET', 'HEAD'].includes(method)) {
    headers['Content-Type'] = 'application/json';
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  }
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor ou o tempo de resposta foi excedido.", 0);
  }
  if (res.status === 204) return null;
  let data;
  try { data = await res.json(); } catch {
    throw new ApiError("O servidor retornou uma resposta inválida.", res.status);
  }
  if (res.status === 401 && path !== '/auth/login' && typeof window !== 'undefined') {
    setCsrfToken(null);
    window.dispatchEvent(new Event('regulariza:unauthorized'));
  }
  if (!res.ok) throw new ApiError(data?.erros?.join(" ") || data?.mensagem || "Erro no servidor.", res.status);
  return data;
}
const empresaPath = id => {
  if (!id) throw new ApiError("Selecione ou cadastre uma empresa para continuar.", 400);
  return `/empresas/${encodeURIComponent(id)}`;
};
export const listarRegimes = () => request("/regimes-juridicos");
export const criarUsuario = dados => request("/auth/register", { method: "POST", body: dados });
export const listarEmpresas = () => request('/empresas');
export const fazerLogin = dados => request('/auth/login', { method: 'POST', body: dados });
export const fazerLogout = () => request('/auth/logout', { method: 'POST', body: {} });
export const consultarSessao = () => request('/auth/me');
export const perguntarAssistente = mensagem => request('/assistente/perguntar', { method: 'POST', body: { mensagem } });
export const buscarEmpresa = id => request(empresaPath(id));
export const salvarEmpresa = (dados, id) => request(id ? empresaPath(id) : "/empresas", { method: id ? "PATCH" : "POST", body: dados });
export const listarObrigacoesEmpresa = id => request(`${empresaPath(id)}/obrigacoes`);
export const sincronizarObrigacoes = (id, dataBase) => request(`${empresaPath(id)}/obrigacoes/sincronizar`, { method: "POST", body: { dataBase } });
export const atualizarObrigacaoEmpresa = (empresaId, id, status) => request(`${empresaPath(empresaId)}/obrigacoes/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } });
