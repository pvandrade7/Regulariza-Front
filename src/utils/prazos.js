// Regras de prazo e status usadas no Dashboard, na Central de Obrigações e nos Documentos.
// Ficam fora das telas para poderem ser testadas e ajustadas em um lugar só.
//
// Todas as datas trafegam como texto "AAAA-MM-DD" (o mesmo formato do <input type="date">).

// ---------- Limites das cores (backlog 5.4: vermelho, amarelo, verde) ----------
export const LIMITE_VERMELHO_DIAS = 7; // vencido ou vence em até 7 dias
export const LIMITE_AMARELO_DIAS = 30; // de 8 a 30 dias. Acima disso: verde
export const LIMITE_DOCUMENTO_AVISO_DIAS = 30; // documento "vence em breve"

// ---------- Datas ----------

// "2026-11-20" -> Date à meia-noite local. Devolve null se o texto não for uma data real.
function lerData(iso) {
  if (typeof iso !== "string") return null;
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  const data = new Date(ano, mes - 1, dia);
  const existe =
    data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
  return existe ? data : null;
}

export function dataParaISO(data = new Date()) {
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  const dd = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mm}-${dd}`;
}

export function formatarData(iso) {
  const data = lerData(iso);
  if (!data) return "—";
  const dd = String(data.getDate()).padStart(2, "0");
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${data.getFullYear()}`;
}

// Quantos dias faltam até a data (negativo = já passou). null se a data for inválida.
export function diasAte(iso, hoje = new Date()) {
  const alvo = lerData(iso);
  if (!alvo) return null;
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((alvo - inicioHoje) / 86400000);
}

function plural(n) {
  return n === 1 ? "dia" : "dias";
}

export function textoPrazo(dias) {
  if (dias === null) return "Sem data";
  if (dias < 0) return `Venceu há ${-dias} ${plural(-dias)}`;
  if (dias === 0) return "Vence hoje";
  if (dias === 1) return "Vence amanhã";
  return `Vence em ${dias} dias`;
}

// "vermelho" | "amarelo" | "verde" | "neutro"
export function corDoPrazo(dias) {
  if (dias === null) return "neutro";
  if (dias <= LIMITE_VERMELHO_DIAS) return "vermelho";
  if (dias <= LIMITE_AMARELO_DIAS) return "amarelo";
  return "verde";
}

// ---------- Obrigações ----------

// Status que a tela mostra: "concluida", "atrasada" (pendente com data passada) ou "pendente".
export function statusDaObrigacao(obrigacao, hoje = new Date()) {
  if (obrigacao.status === "concluida") return "concluida";
  if (!["pendente", "em_andamento"].includes(obrigacao.status)) return "desconhecido";
  const dias = diasAte(obrigacao.vencimento, hoje);
  return dias !== null && dias < 0 ? "atrasada" : obrigacao.status;
}

// filtro: "todas" | "pendente" | "atrasada" | "concluida"
export function filtrarObrigacoes(lista, filtro, hoje = new Date()) {
  if (filtro === "todas") return lista;
  return lista.filter((o) => statusDaObrigacao(o, hoje) === filtro);
}

export function contarPorStatus(lista, hoje = new Date()) {
  const contagem = { total: lista.length, pendentes: 0, atrasadas: 0, concluidas: 0, emAndamento: 0, desconhecidas: 0 };
  for (const o of lista) {
    const status = statusDaObrigacao(o, hoje);
    if (status === "concluida") contagem.concluidas += 1;
    else if (status === "atrasada") contagem.atrasadas += 1;
    else if (status === "pendente") contagem.pendentes += 1;
    else if (status === "em_andamento") contagem.emAndamento += 1;
    else contagem.desconhecidas += 1;
  }
  return contagem;
}

// Não concluídas, da data mais próxima (ou já vencida) para a mais distante.
export function proximosVencimentos(lista, hoje = new Date(), limite = 5) {
  return lista
    .filter((o) => ["pendente", "em_andamento"].includes(statusDaObrigacao(o, hoje)) && diasAte(o.vencimento, hoje) !== null)
    .sort((a, b) => {
      const da = diasAte(a.vencimento, hoje);
      const db = diasAte(b.vencimento, hoje);
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    })
    .slice(0, limite);
}

// Situação geral do card do dashboard.
// `naoConcluidas` é a lista de obrigações ainda abertas (ou os próximos vencimentos).
export function situacaoGeral(contagem, naoConcluidas = [], hoje = new Date()) {
  if (contagem.total === 0) {
    return { nivel: "neutro", texto: "Nenhuma obrigação cadastrada" };
  }
  if (contagem.desconhecidas > 0) return { nivel: "neutro", texto: "Há status não reconhecidos; revise as obrigações" };
  if (contagem.atrasadas > 0) {
    return { nivel: "vermelho", texto: "Há obrigações atrasadas" };
  }
  if (naoConcluidas.some(o => diasAte(o.vencimento, hoje) === null)) return { nivel: "neutro", texto: "Há obrigações sem vencimento definido" };
  const apertado = naoConcluidas.some((o) => {
    const dias = diasAte(o.vencimento, hoje);
    return dias !== null && dias <= LIMITE_VERMELHO_DIAS;
  });
  if (apertado) {
    return { nivel: "amarelo", texto: "Atenção aos prazos próximos" };
  }
  return { nivel: "verde", texto: "Tudo em dia" };
}

export function calcularResumo(lista, hoje = new Date()) {
  const contagem = contarPorStatus(lista, hoje);
  const abertas = lista.filter((o) => statusDaObrigacao(o, hoje) !== "concluida");
  return { ...contagem, situacao: situacaoGeral(contagem, abertas, hoje) };
}

// ---------- Documentos ----------

// "sem-validade" | "valido" | "vence-em-breve" | "vencido"
export function statusDoDocumento(documento, hoje = new Date()) {
  const dias = diasAte(documento.validade, hoje);
  if (!documento.validade || dias === null) return "sem-validade";
  if (dias < 0) return "vencido";
  if (dias <= LIMITE_DOCUMENTO_AVISO_DIAS) return "vence-em-breve";
  return "valido";
}

export function textoValidade(documento, hoje = new Date()) {
  const dias = diasAte(documento.validade, hoje);
  if (!documento.validade || dias === null) return "Sem data de validade";
  if (dias < 0) return `Vencido há ${-dias} ${plural(-dias)}`;
  if (dias === 0) return "Vence hoje";
  return `Vence em ${dias} ${plural(dias)}`;
}

// Devolve um objeto { campo: "mensagem" }. Vazio = formulário válido.
export function validarDocumento(form, hoje = new Date()) {
  const erros = {};
  const nome = (form.nome || "").trim();

  if (!nome) erros.nome = "Informe o nome do documento.";
  else if (nome.length > 150) erros.nome = "Use até 150 caracteres.";

  if (!form.tipo) erros.tipo = "Selecione o tipo.";

  if (!form.emissao) {
    erros.emissao = "Informe a data de emissão.";
  } else if (!lerData(form.emissao)) {
    erros.emissao = "Data de emissão inválida.";
  } else if (diasAte(form.emissao, hoje) > 0) {
    erros.emissao = "A data de emissão não pode ser no futuro.";
  }

  if (form.validade) {
    if (!lerData(form.validade)) {
      erros.validade = "Data de validade inválida.";
    } else if (lerData(form.emissao) && lerData(form.validade) < lerData(form.emissao)) {
      erros.validade = "A validade não pode ser antes da emissão.";
    }
  }

  return erros;
}