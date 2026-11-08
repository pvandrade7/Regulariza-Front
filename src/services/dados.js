import { listarObrigacoesEmpresa, atualizarObrigacaoEmpresa } from "./api.js";
import { getEmpresaId } from "../utils/empresaStorage.js";
import { calcularResumo, proximosVencimentos } from "../utils/prazos.js";
import { respostaDeTeste } from "./mockData.js";

export function normalizarObrigacao(o) {
  return { ...o, orgao: o.orgaoRelacionado, explicacao: o.motivo,
    status: ({ Pendente: "pendente", "Em andamento": "em_andamento", "Concluída": "concluida" })[o.status] ?? "desconhecido",
    statusOriginal: o.status,
    vencimento: o.vencimento || null };
}
export async function listarObrigacoes() {
  const resposta = await listarObrigacoesEmpresa(getEmpresaId());
  if (!Array.isArray(resposta?.obrigacoes)) throw new Error("Formato inválido da lista de obrigações.");
  return resposta.obrigacoes.map(normalizarObrigacao);
}
export async function atualizarObrigacao(id, campos) {
  const status = ({ pendente: "Pendente", em_andamento: "Em andamento", concluida: "Concluída" })[campos.status];
  if (!status) throw new Error("Selecione um status válido.");
  await atualizarObrigacaoEmpresa(getEmpresaId(), id, status);
  return { id, status: campos.status };
}
export async function obterDashboard() {
  const todas = await listarObrigacoes();
  return { resumo: calcularResumo(todas), proximos: proximosVencimentos(todas) };
}
export async function listarDocumentos() { throw new Error("Documentos indisponíveis: o backend ainda não possui modelo nem rotas para metadados ou upload."); }
export async function criarDocumento() { throw new Error("Cadastro de documentos ainda não implementado no backend."); }
export async function enviarMensagem(texto) { return respostaDeTeste(texto); }
export async function listarAvisos() { return []; }
