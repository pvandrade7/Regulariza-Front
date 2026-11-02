// Camada que as telas novas usam para buscar e salvar dados.
// Cada função decide sozinha: com o interruptor do .env ligado, chama o back-end;
// desligado, usa os dados de teste de mockData.js. As telas não sabem a diferença.

import {
  USE_API_OBRIGACOES,
  USE_API_DOCUMENTOS,
  USE_API_CHAT,
  USE_API_AVISOS,
  listarObrigacoesEmpresa,
  atualizarObrigacaoEmpresa,
  buscarDashboard,
  listarDocumentosEmpresa,
  criarDocumentoEmpresa,
  enviarMensagemChat,
  listarAvisosApi,
} from "./api.js";
import { getEmpresaId } from "../utils/empresaStorage.js";
import {
  AVISOS_TESTE,
  lerObrigacoes,
  atualizarObrigacaoTeste,
  lerDocumentos,
  criarDocumentoTeste,
  respostaDeTeste,
} from "./mockData.js";
import { calcularResumo, proximosVencimentos, situacaoGeral } from "../utils/prazos.js";

// ---------- Normalizadores ----------
// O formato exato das respostas do back ainda não está fechado. Estas funções aceitam
// os nomes mais prováveis; quando o back definir o formato, ajuste só aqui.

function dia(valor) {
  return typeof valor === "string" ? valor.slice(0, 10) : "";
}

function normalizarObrigacao(o) {
  const base = o.obrigacao ?? {};
  return {
    id: o.id,
    nome: o.nome ?? base.nome ?? "",
    descricao: o.descricao ?? base.descricao ?? "",
    categoria: o.categoria ?? base.categoria ?? "",
    periodicidade: o.periodicidade ?? base.periodicidade ?? "",
    orgao: o.orgao ?? o.orgaoRelacionado ?? base.orgaoRelacionado ?? "",
    vencimento: dia(o.vencimento ?? o.proximoVencimento ?? o.proximo_vencimento),
    status: String(o.status ?? "").startsWith("conclu") ? "concluida" : "pendente",
    responsavel: o.responsavel ?? "",
    explicacao: o.explicacao ?? o.explicacaoAplicabilidade ?? "",
  };
}

function normalizarDocumento(d) {
  return {
    id: d.id,
    nome: d.nome ?? "",
    tipo: d.tipo ?? "Outro",
    numero: d.numero ?? "",
    emissao: dia(d.emissao ?? d.dataEmissao),
    validade: dia(d.validade ?? d.dataVencimento ?? d.vencimento),
  };
}

function lista(resposta) {
  return Array.isArray(resposta) ? resposta : [];
}

// ---------- Obrigações ----------

export async function listarObrigacoes() {
  if (USE_API_OBRIGACOES) {
    return lista(await listarObrigacoesEmpresa(getEmpresaId())).map(normalizarObrigacao);
  }
  return lerObrigacoes();
}

// campos: { status?: "pendente" | "concluida", responsavel?: string }
export async function atualizarObrigacao(id, campos) {
  if (USE_API_OBRIGACOES) {
    const atualizada = await atualizarObrigacaoEmpresa(id, campos);
    return normalizarObrigacao(atualizada);
  }
  return atualizarObrigacaoTeste(id, campos);
}

// ---------- Dashboard ----------

// Devolve { resumo: { total, pendentes, atrasadas, concluidas, situacao }, proximos: [obrigação] }
export async function obterDashboard() {
  if (USE_API_OBRIGACOES) {
    const d = await buscarDashboard();
    const contagem = {
      total: d.total ?? 0,
      pendentes: d.pendentes ?? 0,
      atrasadas: d.atrasadas ?? 0,
      concluidas: d.concluidas ?? 0,
    };
    const proximos = lista(d.proximosVencimentos).map(normalizarObrigacao);
    return {
      resumo: { ...contagem, situacao: d.situacaoGeral ?? situacaoGeral(contagem, proximos) },
      proximos,
    };
  }
  const todas = lerObrigacoes();
  return { resumo: calcularResumo(todas), proximos: proximosVencimentos(todas) };
}

// ---------- Documentos ----------

export async function listarDocumentos() {
  if (USE_API_DOCUMENTOS) {
    return lista(await listarDocumentosEmpresa(getEmpresaId())).map(normalizarDocumento);
  }
  return lerDocumentos();
}

// dados: { nome, tipo, numero, emissao, validade }
export async function criarDocumento(dados) {
  if (USE_API_DOCUMENTOS) {
    return normalizarDocumento(await criarDocumentoEmpresa(getEmpresaId(), dados));
  }
  return criarDocumentoTeste(dados);
}

// ---------- Chat e avisos ----------

// Devolve o texto da resposta da IA.
export async function enviarMensagem(texto) {
  if (USE_API_CHAT) {
    const resposta = await enviarMensagemChat(texto);
    return resposta?.resposta ?? resposta?.mensagem ?? "";
  }
  await new Promise((resolver) => setTimeout(resolver, 900)); // simula a espera da IA
  return respostaDeTeste(texto);
}

export async function listarAvisos() {
  if (USE_API_AVISOS) return lista(await listarAvisosApi());
  return AVISOS_TESTE;
}