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

const FILTROS = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "pendente", rotulo: "Pendentes" },
  { valor: "atrasada", rotulo: "Atrasadas" },
  { valor: "concluida", rotulo: "Concluídas" },
];

const ROTULO_STATUS = {
  pendente: "Pendente",
  atrasada: "Atrasada",
  concluida: "Concluída",
};

const COR_STATUS = {
  pendente: "amarelo",
  atrasada: "vermelho",
  concluida: "verde",
};

// Contagem de cada filtro, usando os mesmos nomes dos botões.
function contagemDoFiltro(contagem, valor) {
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

  const fecharPainel = useCallback(() => setSelecionadaId(null), []);

  const contagem = contarPorStatus(obrigacoes);
  const visiveis = filtrarObrigacoes(obrigacoes, filtro);
  const selecionada = obrigacoes.find((o) => o.id === selecionadaId) ?? null;

  return (
    <AppLayout titulo="Obrigações">
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
                        <span className="ob-item-data-valor">{formatarData(o.vencimento)}</span>
                        {status !== "concluida" && (
                          <span className="ob-item-data-texto">{textoPrazo(dias)}</span>
                        )}
                      </span>
                      <span className={`badge ${COR_STATUS[status]}`}>{ROTULO_STATUS[status]}</span>
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