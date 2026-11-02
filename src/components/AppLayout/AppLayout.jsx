import { NavLink, useNavigate } from "react-router-dom";
import Icon from "../Icon/Icon";
import { clearToken } from "../../utils/auth";
import { getEmpresa } from "../../utils/empresaStorage";
import "./AppLayout.css";

// Quando a tela de Perfil entrar nesta branch, adicione a linha:
//   { to: "/perfil-empresa", label: "Perfil da empresa", icone: "perfil" },
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icone: "dashboard" },
  { to: "/obrigacoes", label: "Obrigações", icone: "obrigacoes" },
  { to: "/documentos", label: "Documentos", icone: "documentos" },
];

/**
 * Casca das telas internas: menu lateral + barra de título + conteúdo.
 *
 * Props:
 *  - titulo: texto do título da página.
 *  - acao (opcional): elemento exibido à direita do título (ex.: botão).
 *  - empresa (opcional): { nome, porte } para o topo do menu e o cartão do usuário.
 *    Se não vier, tenta a empresa guardada no modo de teste.
 */
export default function AppLayout({ titulo, acao, empresa, children }) {
  const navigate = useNavigate();
  const dadosEmpresa = empresa ?? getEmpresa();
  const nomeEmpresa = dadosEmpresa?.nome || "Minha empresa";

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-brand">
          <span className="app-brand-mark" />
          Regulariza
        </div>

        <nav className="app-nav" aria-label="Menu principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `app-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon nome={item.icone} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="app-logout" type="button" onClick={handleLogout}>
          <Icon nome="sair" />
          Sair
        </button>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <h1 className="app-topbar-title">{titulo}</h1>
          <div className="app-topbar-direita">
            {acao}
            <div className="app-user">
              <span className="app-user-avatar">{nomeEmpresa.charAt(0).toUpperCase()}</span>
              <span className="app-user-texto">
                <span className="app-user-nome">{nomeEmpresa}</span>
                {dadosEmpresa?.porte && <span className="app-user-porte">{dadosEmpresa.porte}</span>}
              </span>
            </div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}