import { useEffect, useState } from "react";
import {
  diasAte,
  corDoPrazo,
  textoPrazo,
  formatarData,
  statusDaObrigacao,
} from "../../utils/prazos";
import "./ObrigacaoModal.css";

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

/**
 * Painel de detalhes da obrigação (Histórias 6.3 a 6.5).
 *
 * Props:
 *  - obrigacao: { id, nome, descricao, categoria, periodicidade, orgao, vencimento,
 *                 status, explicacao }
 * - onSalvar(id, campos): salva { status }. Deve lançar erro se falhar.
 *  - onFechar(): fecha o painel.
 */
export default function ObrigacaoModal({ obrigacao, onSalvar, onFechar }) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const status = statusDaObrigacao(obrigacao);
  const dias = diasAte(obrigacao.vencimento);
  const concluida = status === "concluida";

  // Esc fecha o painel; enquanto ele está aberto, a página de trás não rola.
  useEffect(() => {
    function aoApertar(e) {
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", aoApertar);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoApertar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onFechar]);

  async function salvar(campos) {
    setErro("");
    setSalvando(true);
    try {
      await onSalvar(obrigacao.id, campos);
    } catch (err) {
      setErro(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  function alternarConclusao() {
    salvar({ status: concluida ? "pendente" : "concluida" });
  }

  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div
        className="modal-painel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-topo">
          <div>
            <h2 id="modal-titulo" className="modal-titulo">
              {obrigacao.nome}
            </h2>
            <span className={`badge ${COR_STATUS[status]}`}>{status === "desconhecido" ? `Status: ${obrigacao.statusOriginal ?? "não informado"}` : ROTULO_STATUS[status]}</span>
          </div>
          <button type="button" className="modal-fechar" aria-label="Fechar" onClick={onFechar}>
            ×
          </button>
        </header>

        <div className="modal-corpo">
          {erro && <div className="form-banner">{erro}</div>}

          <dl className="modal-dados">
            <div>
              <dt>Vencimento</dt>
              <dd>
                {formatarData(obrigacao.vencimento)}
                {!concluida && (
                  <span className={`modal-prazo ${corDoPrazo(dias)}`}>{textoPrazo(dias)}</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Periodicidade</dt>
              <dd>{obrigacao.periodicidade || "—"}</dd>
            </div>
            <div>
              <dt>Órgão responsável</dt>
              <dd>{obrigacao.orgao || "—"}</dd>
            </div>
            <div>
              <dt>Categoria</dt>
              <dd>{obrigacao.categoria || "—"}</dd>
            </div>
          </dl>

          {obrigacao.descricao && (
            <section className="modal-secao">
              <h3>O que é</h3>
              <p>{obrigacao.descricao}</p>
            </section>
          )}

          <section className="modal-secao destaque">
            <h3>Por que isso se aplica à sua empresa</h3>
            <p>
              {obrigacao.explicacao ||
                "Ainda não há uma explicação cadastrada para esta obrigação."}
            </p>
          </section>

        </div>

        <footer className="modal-rodape">
          <button type="button" className="btn-outline" disabled={salvando || obrigacao.status === "em_andamento"} onClick={() => salvar({ status: "em_andamento" })}>Em andamento</button>
          <button type="button" className="btn-outline" onClick={onFechar}>
            Fechar
          </button>
          <button type="button" className="btn-solid" onClick={alternarConclusao} disabled={salvando}>
            {salvando ? "Salvando..." : concluida ? "Reabrir obrigação" : "Marcar como concluída"}
          </button>
        </footer>
      </div>
    </div>
  );
}