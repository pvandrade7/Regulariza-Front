// Dados de teste, usados enquanto o back-end ainda não tem as rotas (interruptores do .env desligados).
// As alterações (marcar como concluída, cadastrar documento) ficam guardadas no navegador
// para as telas conversarem entre si. Para recomeçar do zero, limpe os dados do site.

import { dataParaISO } from "../utils/prazos.js";

const KEY_OBRIGACOES = "regulariza_teste_obrigacoes";
const KEY_DOCUMENTOS = "regulariza_teste_documentos";

const memoria = {};

function ler(chave, criarInicial) {
  if (memoria[chave]) return memoria[chave];
  let valor = null;
  try {
    valor = JSON.parse(localStorage.getItem(chave));
  } catch {
    // sem localStorage (ou conteúdo quebrado): usa só a memória
  }
  if (!valor) valor = criarInicial();
  memoria[chave] = valor;
  return valor;
}

function gravar(chave, valor) {
  memoria[chave] = valor;
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // sem localStorage: a memória basta durante a sessão
  }
}

// Data daqui a `n` dias (negativo = no passado), para mostrar as três cores no teste.
function emDias(n) {
  const data = new Date();
  data.setDate(data.getDate() + n);
  return dataParaISO(data);
}

function obrigacoesIniciais() {
  return [
    {
      id: 1,
      nome: "Pagamento do DAS (Simples Nacional)",
      descricao: "Guia mensal unificada de tributos das empresas optantes pelo Simples Nacional.",
      categoria: "Tributária",
      periodicidade: "Mensal",
      orgao: "Receita Federal",
      vencimento: emDias(3),
      status: "pendente",
      responsavel: "",
      explicacao:
        "Aplica-se porque a empresa é optante pelo Simples Nacional e tem faturamento no período.",
    },
    {
      id: 2,
      nome: "Recolhimento do FGTS",
      descricao: "Depósito mensal do FGTS dos funcionários contratados em regime CLT.",
      categoria: "Trabalhista",
      periodicidade: "Mensal",
      orgao: "Caixa Econômica Federal",
      vencimento: emDias(-2),
      status: "pendente",
      responsavel: "Marina (financeiro)",
      explicacao: "Aplica-se porque a empresa possui funcionários contratados em regime CLT.",
    },
    {
      id: 3,
      nome: "Envio da folha ao eSocial",
      descricao: "Transmissão mensal dos eventos da folha de pagamento ao eSocial.",
      categoria: "Trabalhista",
      periodicidade: "Mensal",
      orgao: "eSocial",
      vencimento: emDias(12),
      status: "pendente",
      responsavel: "",
      explicacao: "Aplica-se porque a empresa tem funcionários e precisa informar a folha.",
    },
    {
      id: 4,
      nome: "Renovação do Alvará de Funcionamento",
      descricao: "Renovação anual do alvará junto à prefeitura do município da empresa.",
      categoria: "Funcionamento",
      periodicidade: "Anual",
      orgao: "Prefeitura",
      vencimento: emDias(45),
      status: "pendente",
      responsavel: "",
      explicacao: "Aplica-se porque a empresa possui estabelecimento físico.",
    },
    {
      id: 5,
      nome: "Vistoria e renovação do AVCB",
      descricao: "Auto de Vistoria do Corpo de Bombeiros para estabelecimentos com atendimento ao público.",
      categoria: "Segurança",
      periodicidade: "Anual",
      orgao: "Corpo de Bombeiros",
      vencimento: emDias(20),
      status: "pendente",
      responsavel: "",
      explicacao: "Aplica-se porque a empresa possui estabelecimento físico com atendimento ao público.",
    },
    {
      id: 6,
      nome: "Declaração anual do Simples Nacional (DEFIS)",
      descricao: "Declaração anual de informações socioeconômicas e fiscais.",
      categoria: "Tributária",
      periodicidade: "Anual",
      orgao: "Receita Federal",
      vencimento: emDias(120),
      status: "pendente",
      responsavel: "",
      explicacao: "Aplica-se porque a empresa é optante pelo Simples Nacional.",
    },
    {
      id: 7,
      nome: "Atualização do PGR (gerenciamento de riscos)",
      descricao: "Programa de Gerenciamento de Riscos ocupacionais, revisado periodicamente.",
      categoria: "Segurança",
      periodicidade: "Anual",
      orgao: "Ministério do Trabalho",
      vencimento: emDias(200),
      status: "pendente",
      responsavel: "",
      explicacao: "Aplica-se porque a empresa tem funcionários contratados.",
    },
    {
      id: 8,
      nome: "Renovação da licença sanitária",
      descricao: "Licença da vigilância sanitária para atividades com manipulação de alimentos.",
      categoria: "Funcionamento",
      periodicidade: "Anual",
      orgao: "Vigilância Sanitária",
      vencimento: emDias(-10),
      status: "concluida",
      responsavel: "Carlos",
      explicacao: "Aplica-se porque a atividade da empresa envolve alimentos.",
    },
  ];
}

function documentosIniciais() {
  return [
    {
      id: 1,
      nome: "Alvará de Funcionamento",
      tipo: "Alvará",
      numero: "2025/004512",
      emissao: emDias(-320),
      validade: emDias(45),
    },
    {
      id: 2,
      nome: "Licença Sanitária",
      tipo: "Licença",
      numero: "LS-9981",
      emissao: emDias(-355),
      validade: emDias(10),
    },
    {
      id: 3,
      nome: "AVCB",
      tipo: "Certificado",
      numero: "",
      emissao: emDias(-380),
      validade: emDias(-15),
    },
    {
      id: 4,
      nome: "Contrato Social",
      tipo: "Contrato",
      numero: "",
      emissao: emDias(-900),
      validade: "",
    },
  ];
}

export const TIPOS_DOCUMENTO = ["Alvará", "Licença", "Certidão", "Certificado", "Contrato", "Outro"];

export const AVISOS_TESTE = [
  {
    id: 1,
    titulo: "Confira o prazo do DAS todo mês",
    texto: "O vencimento do DAS é mensal. Deixe o pagamento agendado para evitar multa.",
  },
  {
    id: 2,
    titulo: "Mantenha seus documentos em dia",
    texto: "Alvarás e licenças têm validade. Cadastre-os na aba Documentos para ser avisado.",
  },
];

// ---------- Obrigações ----------

export function lerObrigacoes() {
  return ler(KEY_OBRIGACOES, obrigacoesIniciais);
}

export function atualizarObrigacaoTeste(id, campos) {
  const lista = lerObrigacoes();
  const indice = lista.findIndex((o) => String(o.id) === String(id));
  if (indice === -1) throw new Error("Obrigação não encontrada.");
  const atualizada = { ...lista[indice], ...campos };
  const nova = [...lista];
  nova[indice] = atualizada;
  gravar(KEY_OBRIGACOES, nova);
  return atualizada;
}

// ---------- Documentos ----------

export function lerDocumentos() {
  return ler(KEY_DOCUMENTOS, documentosIniciais);
}

export function criarDocumentoTeste(dados) {
  const lista = lerDocumentos();
  const proximoId = lista.reduce((maior, d) => Math.max(maior, Number(d.id) || 0), 0) + 1;
  const novo = { id: proximoId, ...dados };
  gravar(KEY_DOCUMENTOS, [...lista, novo]);
  return novo;
}

