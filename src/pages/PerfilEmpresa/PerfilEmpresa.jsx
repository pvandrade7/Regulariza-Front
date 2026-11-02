import AppLayout from "../../components/AppLayout/AppLayout";
import "./PerfilEmpresa.css";

/**
 * Tela de Perfil da Empresa — cards com os dados cadastrados, dentro do layout
 * com menu lateral compartilhado com as demais telas internas.
 *
 * Props:
 *  - empresa: objeto salvo por CadastroEmpresa (nome, cnpj, atividade, porte,
 *    municipio, estado, funcionarios, contratacao, estabelecimentoFisico, caracteristicas).
 *  - onEditar(): navegação para editar o cadastro.
 */
export default function PerfilEmpresa({ empresa, onEditar }) {
  const botaoEditar = (
    <button className="perfil-edit-pill" type="button" onClick={onEditar}>
      <span className="perfil-edit-pill-icon">✎</span>
      <span>
        Editar dados da empresa
        <small>Atualize as informações cadastradas</small>
      </span>
    </button>
  );

  return (
    <AppLayout titulo="Perfil" acao={botaoEditar} empresa={empresa}>
      {!empresa ? (
        <div className="perfil-empty">
          <p>Nenhuma empresa cadastrada ainda. Complete o cadastro para ver o perfil aqui.</p>
        </div>
      ) : (
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
                {empresa.contratacao && <span className="tag">{empresa.contratacao}</span>}
                <span className="tag">
                  {empresa.estabelecimentoFisico
                    ? "Estabelecimento físico"
                    : "Sem estabelecimento físico"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}