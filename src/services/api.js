// Camada de comunicação com o back-end. Nenhuma tela chama fetch direto.
// O endereço e os interruptores vêm do arquivo .env.

import { getToken } from "../utils/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Interruptores: desligados, o app funciona com dados de teste, sem back-end.
export const USE_API_OBRIGACOES = import.meta.env.VITE_API_OBRIGACOES === "true"; // inclui o dashboard
export const USE_API_DOCUMENTOS = import.meta.env.VITE_API_DOCUMENTOS === "true";
export const USE_API_CHAT = import.meta.env.VITE_API_CHAT === "true";
export const USE_API_AVISOS = import.meta.env.VITE_API_AVISOS === "true";

// Erro com o status HTTP. `status` é 0 quando o servidor não respondeu.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique se o back-end está rodando.",
      0
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // resposta sem corpo JSON
  }

  if (!res.ok) {
    // O back envia { mensagem } e, nos erros de validação, também { erros: [...] }.
    const detalhes = Array.isArray(data?.erros) && data.erros.length ? data.erros.join(" ") : null;
    throw new ApiError(detalhes || data?.mensagem || "Erro inesperado no servidor.", res.status);
  }

  return data;
}

// ---------- Obrigações e dashboard ----------

// GET /obrigacoes/empresa -> lista de obrigações da empresa (o front filtra por status na tela).
export function listarObrigacoesEmpresa(empresaId) {
  const query = empresaId ? `?empresaId=${encodeURIComponent(empresaId)}` : "";
  return request(`/obrigacoes/empresa${query}`, { auth: true });
}

// PATCH /obrigacoes/empresa/:id com { status?, responsavel? } -> obrigação atualizada
export function atualizarObrigacaoEmpresa(id, campos) {
  return request(`/obrigacoes/empresa/${id}`, { method: "PATCH", body: campos, auth: true });
}

// Esperado: { total, pendentes, atrasadas, concluidas, proximosVencimentos: [obrigação, ...] }
export function buscarDashboard() {
  return request("/dashboard", { auth: true });
}

// ---------- Documentos ----------

export function listarDocumentosEmpresa(empresaId) {
  return request(`/empresas/${empresaId}/documentos`, { auth: true });
}

export function criarDocumentoEmpresa(empresaId, dados) {
  return request(`/empresas/${empresaId}/documentos`, { method: "POST", body: dados, auth: true });
}

// ---------- Chat e avisos ----------

// POST /chat com { mensagem } -> { resposta }
export function enviarMensagemChat(mensagem) {
  return request("/chat", { method: "POST", body: { mensagem }, auth: true });
}

// GET /avisos -> [{ id, titulo, texto }]
export function listarAvisosApi() {
  return request("/avisos", { auth: true });
}