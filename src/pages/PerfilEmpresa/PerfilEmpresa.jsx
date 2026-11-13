
import AppLayout from "../../components/AppLayout/AppLayout";
import "./PerfilEmpresa.css";

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
    <AppLayout titulo="Perfil da empresa" acao={botaoEditar} empresa={empresa}>
      {!empresa ? (
        <div className="perfil-empty">
          <p>Nenhuma empresa cadastrada ainda. Complete o cadastro para visualizar o perfil.</p>
        </div>
      ) : (
        <div className="perfil-columns">
          <div className="perfil-col-main">
            <div className="info-card">
              <h2 className="info-card-title">Resumo da empresa</h2>

              <div className="resumo-header">
                <div className="resumo-avatar">
                  {empresa.nome?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="resumo-nome">{empresa.nome}</p>
                  <p className="resumo-porte">
                    {empresa.porte || "Porte não informado"}
                  </p>
                </div>
              </div>

              <ul className="resumo-list">
                <li>
                  <span className="resumo-icon">🏢</span>
                  Tipo de pessoa: {empresa.cpf ? "Pessoa Física" : "Pessoa Jurídica"}
                </li>
                <li>
                  <span className="resumo-icon">🧾</span>
                  {empresa.cpf ? "CPF" : "CNPJ"}: {empresa.cpf || empresa.cnpj || "Não informado"}
                </li>
                <li>
                  <span className="resumo-icon">📍</span>
                  {empresa.municipio || "Município não informado"}
                  {empresa.estado ? `/${empresa.estado}` : ""}
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h2 className="info-card-title">Atividade econômica</h2>
              <div className="readonly-select">
                {empresa.atividade || "Não informada"}
              </div>
            </div>
          </div>

          <div className="perfil-col-side">
            <div className="info-card">
              <h2 className="info-card-title">Dados operacionais</h2>

              <div className="tag-row">
                <span className="tag">
                  {empresa.numeroFuncionarios ?? 0} funcionário
                  {Number(empresa.numeroFuncionarios) === 1 ? "" : "s"}
                </span>
                <span className="tag">
                  {empresa.estabelecimentoFisico
                    ? "Possui estabelecimento físico"
                    : "Não possui estabelecimento físico"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
