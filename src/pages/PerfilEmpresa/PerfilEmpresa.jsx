import { useNavigate } from "react-router-dom";
import { clearToken } from "../../utils/auth";
import "./PerfilEmpresa.css";

const NAV_ITEMS = [
  { label: "Dashboard", disabled: true },
  { label: "Obrigações", disabled: true },
  { label: "Documentos", disabled: true },
  { label: "Perfil da empresa", disabled: false, active: true },
];

/**
 * Tela de Perfil da Empresa — layout tipo dashboard (sidebar + conteúdo em cards),
 * já preparado pra virar a casca do Dashboard de verdade no Sprint 4: os itens de
 * navegação desabilitados (Dashboard, Obrigações, Documentos) ganham link assim que
 * essas telas existirem.
 *
 * Props:
 *  - empresa: objeto salvo por CadastroEmpresa (nome, cnpj, atividade, porte,
 *    municipio, estado, funcionarios, contratacao, estabelecimentoFisico, caracteristicas).
 *  - onEditar(): navegação para editar o cadastro.
 */
export default function PerfilEmpresa({ empresa, onEditar }) {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="perfil-layout">
      <aside className="perfil-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-mark" />
          Regulariza
        </div>

        {empresa && (
          <div className="sidebar-empresa">
            <span className="sidebar-empresa-nome">{empresa.nome}</span>
            <span className="sidebar-empresa-porte">{empresa.porte}</span>
          </div>
        )}

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <span
              key={item.label}
              className={`sidebar-nav-item ${item.active ? "active" : ""} ${
                item.disabled ? "disabled" : ""
              }`}
              title={item.disabled ? "Ainda não disponível" : undefined}
            >
              {item.label}
            </span>
          ))}
        </nav>

        <button className="sidebar-logout" type="button" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      <div className="perfil-main">
        <header className="perfil-topbar">
          <h1 className="perfil-topbar-title">Perfil</h1>
          <button className="perfil-edit-pill" type="button" onClick={onEditar}>
            <span className="perfil-edit-pill-icon">✎</span>
            <span>
              Editar dados da empresa
              <small>Atualize as informações cadastradas</small>
            </span>
          </button>
        </header>

        {!empresa ? (
          <div className="perfil-empty">
            <p>Nenhuma empresa cadastrada ainda. Complete o cadastro para ver o perfil aqui.</p>
          </div>
        ) : (
          <div className="perfil-body">
            <div className="perfil-columns">
              <div className="perfil-col-main">
                <div className="info-card">
                  <h2 className="info-card-title">Resumo da empresa</h2>
                  <div className="resumo-header">
                    <div className="resumo-avatar">{empresa.nome?.charAt(0) ?? "?"}</div>
                    <div>
                      <p className="resumo-nome">{empresa.nome}</p>
                      <p className="resumo-porte">{empresa.porte}</p>
                    </div>
                  </div>
                  <ul className="resumo-list">
                    <li>
                      <span className="resumo-icon">🧾</span> CNPJ: {empresa.cnpj}
                    </li>
                    <li>
                      <span className="resumo-icon">📍</span> {empresa.municipio}/{empresa.estado}
                    </li>
                    <li>
                      <span className="resumo-icon">👥</span> {empresa.funcionarios} funcionário
                      {Number(empresa.funcionarios) === 1 ? "" : "s"}
                    </li>
                  </ul>
                </div>

                <div className="info-card">
                  <h2 className="info-card-title">Características específicas</h2>
                  <p className="caracteristicas-text">
                    {empresa.caracteristicas || "Nenhuma característica adicional informada."}
                  </p>
                </div>
              </div>

              <div className="perfil-col-side">
                <div className="info-card">
                  <h2 className="info-card-title">Atividade econômica</h2>
                  <div className="readonly-select">{empresa.atividade}</div>
                </div>

                <div className="info-card">
                  <h2 className="info-card-title">
                    Dados operacionais <span className="info-help">?</span>
                  </h2>
                  <div className="tag-row">
                    <span className="tag">{empresa.contratacao}</span>
                    <span className="tag">
                      {empresa.estabelecimentoFisico
                        ? "Estabelecimento físico"
                        : "Sem estabelecimento físico"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
