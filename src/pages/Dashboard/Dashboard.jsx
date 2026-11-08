import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppLayout from "../../components/AppLayout/AppLayout";
import ChatFlutuante from "../../components/ChatFlutuante/ChatFlutuante";
import Icon from "../../components/Icon/Icon";
import { obterDashboard, listarAvisos } from "../../services/dados";
import { getEmpresa } from "../../utils/empresaStorage";
import { diasAte, corDoPrazo, textoPrazo, formatarData } from "../../utils/prazos";
import { segmentosDoDonut, percentualConcluido } from "../../utils/donut";
import "./Dashboard.css";

const RAIO = 52;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function CardNumero({ icone, rotulo, valor, tom }) {
  return (
    <div className="app-card dash-stat">
      <span className={`dash-stat-icone ${tom ?? ""}`}>
        <Icon nome={icone} tamanho={20} />
      </span>
      <span className="dash-stat-texto">
        <span className="dash-stat-label">{rotulo}</span>
        <span className="dash-stat-valor">{valor}</span>
      </span>
    </div>
  );
}

// Anel com a proporção de obrigações concluídas, pendentes e atrasadas.
function Anel({ resumo }) {
  const segmentos = segmentosDoDonut(resumo, CIRCUNFERENCIA);
  const percentual = percentualConcluido(resumo);

  return (
    <div className="dash-anel">
      <svg viewBox="0 0 140 140" role="img" aria-label="Proporção de obrigações por status">
        <g transform="rotate(-90 70 70)">
          <circle className="dash-anel-trilho" cx="70" cy="70" r={RAIO} />
          {segmentos.map((s) => (
            <circle
              key={s.chave}
              className={`dash-anel-seg ${s.chave}`}
              cx="70"
              cy="70"
              r={RAIO}
              strokeDasharray={`${s.comprimento} ${CIRCUNFERENCIA - s.comprimento}`}
              strokeDashoffset={-s.inicio}
            />
          ))}
        </g>
      </svg>
      <div className="dash-anel-centro">
        <span className="dash-anel-valor">{percentual === null ? "—" : `${percentual}%`}</span>
        <span className="dash-anel-legenda">concluídas</span>
      </div>
    </div>
  );
}

/**
 * Dashboard — Histórias 5.1 a 5.4 e 9.1.
 * Cartões com os números, anel de conformidade, lista dos próximos vencimentos com
 * cores por urgência (vermelho / amarelo / verde), avisos e o chat flutuante com a IA.
 */
export default function Dashboard() {
  const location = useLocation();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [avisos, setAvisos] = useState([]);
  const empresa = getEmpresa();

  useEffect(() => {
    let ativo = true;
    obterDashboard()
      .then((resultado) => ativo && setDados(resultado))
      .catch((err) => ativo && setErro(err.message));
    // Os avisos são opcionais: se falharem, o dashboard continua normal.
    listarAvisos()
      .then((lista) => ativo && setAvisos(lista))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <AppLayout titulo="Dashboard">
      {location.state?.mensagem && <p role="status">{location.state.mensagem}</p>}
      {location.state?.avisoSincronizacao && <div className="form-banner" role="alert">{location.state.avisoSincronizacao} <Link to="/obrigacoes">Abrir Central de Obrigações</Link></div>}
      <p className="hint">Após editar o perfil, sincronize as obrigações na Central de Obrigações.</p>
      {erro && <div className="form-banner">Não foi possível carregar o dashboard: {erro}</div>}
      {!dados && !erro && <p className="page-message">Carregando...</p>}

      {dados && (
        <div className="dash-grid">
          <div className="dash-principal">
            <section className="dash-ola-linha">
              <div className="dash-ola">
                <span className="dash-ola-avatar">
                  {(empresa?.nome || "R").charAt(0).toUpperCase()}
                </span>
                <div>
                  <h2 className="dash-ola-titulo">
                    Olá{empresa?.nome ? ", " : "!"}
                    {empresa?.nome && <span>{empresa.nome}</span>}
                  </h2>
                  <p className="dash-ola-sub">Acompanhe as obrigações da sua empresa neste painel.</p>
                </div>
              </div>
              <span className={`dash-situacao ${dados.resumo.situacao.nivel}`}>
                <span className="dash-situacao-ponto" aria-hidden="true" />
                {dados.resumo.situacao.texto}
              </span>
            </section>

            <section className="dash-stats" aria-label="Resumo das obrigações">
              <CardNumero icone="total" rotulo="Total" valor={dados.resumo.total} />
              <CardNumero icone="pendentes" rotulo="Pendentes" valor={dados.resumo.pendentes} />
              <CardNumero
                icone="atrasadas"
                rotulo="Atrasadas"
                valor={dados.resumo.atrasadas}
                tom="alerta"
              />
              <CardNumero icone="pendentes" rotulo="Em andamento" valor={dados.resumo.emAndamento} />
              <CardNumero icone="total" rotulo="Status desconhecido" valor={dados.resumo.desconhecidas} />
              <CardNumero icone="concluidas" rotulo="Concluídas" valor={dados.resumo.concluidas} />
            </section>

            <section className="app-card">
              <div className="dash-card-header">
                <h2 className="app-card-title">Próximos vencimentos</h2>
                <Link className="dash-link" to="/obrigacoes">
                  Ver todas
                </Link>
              </div>

              {dados.proximos.length === 0 ? (
                <p className="empty-state">Nenhum vencimento futuro conhecido. Consulte todas as obrigações, inclusive atrasadas ou sem data.</p>
              ) : (
                <ul className="dash-tabela">
                  <li className="dash-tabela-cab" aria-hidden="true">
                    <span>Obrigação</span>
                    <span>Órgão</span>
                    <span>Vencimento</span>
                    <span>Prazo</span>
                  </li>
                  {dados.proximos.map((o) => {
                    const dias = diasAte(o.vencimento);
                    const cor = corDoPrazo(dias);
                    return (
                      <li key={o.id} className="dash-linha">
                        <span className="dash-linha-nome">
                          <span className={`dash-ponto ${cor}`} aria-hidden="true" />
                          {o.nome}
                        </span>
                        <span className="dash-linha-orgao">{o.orgao || o.categoria || "—"}</span>
                        <span className="dash-linha-data">{formatarData(o.vencimento)}</span>
                        <span className={`badge ${cor}`}>{textoPrazo(dias)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <aside className="dash-lateral">
            <section className="app-card">
              <h2 className="app-card-title">Conformidade</h2>
              <Anel resumo={dados.resumo} />
              <ul className="dash-legenda">
                <li>Em andamento<strong>{dados.resumo.emAndamento}</strong></li>
                <li>Status desconhecido<strong>{dados.resumo.desconhecidas}</strong></li>
                <li>
                  <span className="dash-ponto verde" aria-hidden="true" />
                  Concluídas
                  <strong>{dados.resumo.concluidas}</strong>
                </li>
                <li>
                  <span className="dash-ponto amarelo" aria-hidden="true" />
                  Pendentes
                  <strong>{dados.resumo.pendentes}</strong>
                </li>
                <li>
                  <span className="dash-ponto vermelho" aria-hidden="true" />
                  Atrasadas
                  <strong>{dados.resumo.atrasadas}</strong>
                </li>
              </ul>
            </section>

            <section className="app-card">
              <h2 className="app-card-title">Avisos regulatórios</h2>
              {avisos.length === 0 ? (
                <p className="empty-state">Avisos regulatórios ainda não integrados.</p>
              ) : (
                <ul className="dash-avisos">
                  {avisos.map((a) => (
                    <li key={a.id}>
                      <strong>{a.titulo}</strong>
                      <p>{a.texto}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      )}

      <ChatFlutuante />
    </AppLayout>
  );
}