import { useCallback, useEffect, useState } from "react";
import AppLayout from "../../components/AppLayout/AppLayout";
import ObrigacaoModal from "../../components/ObrigacaoModal/ObrigacaoModal";
import { listarObrigacoes, atualizarObrigacao } from "../../services/dados";
import {
  diasAte,
  corDoPrazo,
  textoPrazo,
  formatarData,
  statusDaObrigacao,
  filtrarObrigacoes,
  contarPorStatus,
} from "../../utils/prazos";
import "./Obrigacoes.css";
import { sincronizarObrigacoes } from "../../services/api";
import { getEmpresaId } from "../../utils/empresaStorage";


const FILTROS = [
  { valor: "em_andamento", rotulo: "Em andamento" },
  { valor: "desconhecido", rotulo: "Desconhecidas" },
  { valor: "todas", rotulo: "Todas" },
  { valor: "pendente", rotulo: "Pendentes" },
  { valor: "atrasada", rotulo: "Atrasadas" },
  { valor: "concluida", rotulo: "Concluídas" },
];

const ROTULO_STATUS = {
  em_andamento: "Em andamento",
  desconhecido: "Status desconhecido",
  pendente: "Pendente",
  atrasada: "Atrasada",
  concluida: "Concluída",
};

const COR_STATUS = {
  em_andamento: "amarelo",
  desconhecido: "neutro",
  pendente: "amarelo",
  atrasada: "vermelho",
  concluida: "verde",
};

// Contagem de cada filtro, usando os mesmos nomes dos botões.
function contagemDoFiltro(contagem, valor) {
  if (valor === "em_andamento") return contagem.emAndamento;
  if (valor === "desconhecido") return contagem.desconhecidas;
  if (valor === "todas") return contagem.total;
  if (valor === "pendente") return contagem.pendentes;
  if (valor === "atrasada") return contagem.atrasadas;
  return contagem.concluidas;
}

/**
 * Central de Obrigações — Histórias 6.1 a 6.5.
 * Lista com filtros por status; clicar em uma obrigação abre o painel de detalhes,
 * onde dá para ler a explicação, marcar como concluída e anotar o responsável.
 */
export default function Obrigacoes() {
  const [sincronizando, setSincronizando] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [competencia, setCompetencia] = useState("");
  const [anoCalendario, setAnoCalendario] = useState("");
  const [situacaoEspecial, setSituacaoEspecial] = useState(false);
  const [obrigacoes, setObrigacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [selecionadaId, setSelecionadaId] = useState(null);

  useEffect(() => {
    let ativo = true;
    listarObrigacoes()
      .then((lista) => ativo && setObrigacoes(lista))
      .catch((err) => ativo && setErro(err.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  // Salva no back (ou nos dados de teste) e troca só essa obrigação na lista,
  // sem recarregar a tela.
  async function handleSalvar(id, campos) {
    const atualizada = await atualizarObrigacao(id, campos);
    setObrigacoes((lista) => lista.map((o) => (o.id === id ? { ...o, ...atualizada } : o)));
  }

  async function sincronizar() {
    setSincronizando(true); setErro(""); setSucesso("");
    try {
      const resultado = await sincronizarObrigacoes(getEmpresaId(), {
        ...(competencia ? { competencia } : {}),
        ...(anoCalendario ? { anoCalendario: Number(anoCalendario) } : {}),
        situacaoEspecial
      });
      setObrigacoes(await listarObrigacoes()); setSucesso(`${resultado.mensagem} ${resultado.vinculosCriados} vínculo(s) criado(s); ${resultado.vencimentosPreenchidos ?? 0} vencimento(s) preenchido(s). Datas anteriores preservadas.`);
    } catch (err) { setErro(err.message); } finally { setSincronizando(false); }
  }
  const fecharPainel = useCallback(() => setSelecionadaId(null), []);

  const contagem = contarPorStatus(obrigacoes);
  const visiveis = filtrarObrigacoes(obrigacoes, filtro);
  const selecionada = obrigacoes.find((o) => o.id === selecionadaId) ?? null;

  return (
    <AppLayout titulo="Obrigações">
      <section className="app-card">
      <p className="hint">Triagem demonstrativa: os critérios cadastrados selecionam itens para revisão, mas não confirmam obrigação legal. Ausência na lista não significa dispensa. Status e indicadores refletem apenas os itens cadastrados.</p>
        <p>Sincronize as obrigações aplicáveis após cadastrar ou editar a empresa. Informe o período fiscal: DAS/FGTS usam competência mensal; DASN-SIMEI usa ano-calendário. Aplicamos regras gerais verificadas, sujeitas a situações especiais. Datas existentes são preservadas, inclusive demonstrativas antigas; confira a guia oficial.</p>
        <label htmlFor="competencia">Competência mensal</label> <input id="competencia" type="month" value={competencia} onChange={e => setCompetencia(e.target.value)} />
        <label htmlFor="ano-calendario">Ano-calendário da DASN-SIMEI</label> <input id="ano-calendario" type="number" min="2000" max="2099" placeholder="Ex.: 2025" value={anoCalendario} onChange={e => setAnoCalendario(e.target.value)} />
        <label><input type="checkbox" checked={situacaoEspecial} onChange={e => setSituacaoEspecial(e.target.checked)} /> Situação especial, extinção ou prorrogação (não calcular pela regra geral)</label>
        <button className="btn-outline" disabled={sincronizando || carregando || (!competencia && !anoCalendario)} onClick={sincronizar}>{sincronizando ? "Sincronizando..." : "Sincronizar obrigações"}</button>
        {sucesso && <p role="status">{sucesso}</p>}
      </section>
      {erro && <div className="form-banner">Não foi possível carregar as obrigações: {erro}</div>}
      {carregando && <p className="page-message">Carregando...</p>}

      {!carregando && !erro && (
        <>
          <div className="ob-filtros" role="group" aria-label="Filtrar por status">
            {FILTROS.map((f) => (
              <button
                key={f.valor}
                type="button"
                className={`ob-filtro ${filtro === f.valor ? "ativo" : ""}`}
                aria-pressed={filtro === f.valor}
                onClick={() => setFiltro(f.valor)}
              >
                {f.rotulo}
                <span className="ob-filtro-contagem">{contagemDoFiltro(contagem, f.valor)}</span>
              </button>
            ))}
          </div>

          {visiveis.length === 0 ? (
            <div className="app-card">
              <p className="empty-state">Nenhuma obrigação neste filtro.</p>
            </div>
          ) : (
            <ul className="ob-lista">
              {visiveis.map((o) => {
                const status = statusDaObrigacao(o);
                const dias = diasAte(o.vencimento);
                const cor = status === "concluida" ? "verde" : corDoPrazo(dias);
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      className={`ob-item ${cor}`}
                      onClick={() => setSelecionadaId(o.id)}
                    >
                      <span className="ob-item-principal">
                        <span className="ob-item-nome">{o.nome}</span>
                        <span className="ob-item-meta">
                          {o.categoria}
                          {o.periodicidade ? ` · ${o.periodicidade}` : ""}
                        </span>
                      </span>
                      <span className="ob-item-data">
                        <span className="ob-item-data-valor">{dias === null ? "Sem vencimento definido" : formatarData(o.vencimento)}</span>
                        {status !== "concluida" && (
                          <span className="ob-item-data-texto">{textoPrazo(dias)}</span>
                        )}
                      </span>
                      <span className={`badge ${COR_STATUS[status]}`}>{status === "desconhecido" ? `Status: ${o.statusOriginal ?? "não informado"}` : ROTULO_STATUS[status]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {selecionada && (
        <ObrigacaoModal
          obrigacao={selecionada}
          onSalvar={handleSalvar}
          onFechar={fecharPainel}
        />
      )}
    </AppLayout>
  );
}