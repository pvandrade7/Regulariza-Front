import "./PerfilEmpresa.css";

/**
 * Tela de Perfil da Empresa — exibição somente leitura dos dados cadastrados.
 * Página independente do Dashboard (que ainda não existe, Sprint 4 do backlog),
 * pensada para já ser encaixada dentro dele mais tarde sem precisar refazer nada:
 * basta renderizar <PerfilEmpresa empresa={...} /> dentro do layout do Dashboard.
 *
 * Props:
 *  - empresa: objeto com os mesmos campos salvos por CadastroEmpresa
 *    (nome, cnpj, atividade, porte, municipio, estado, funcionarios,
 *     contratacao, estabelecimentoFisico, caracteristicas).
 *  - onEditar(): navegação para editar o cadastro.
 */
export default function PerfilEmpresa({ empresa, onEditar }) {
  if (!empresa) {
    return (
      <div className="perfil-screen">
        <div className="perfil-card perfil-empty">
          <p className="perfil-eyebrow">Regulariza</p>
          <h1 className="perfil-title">Nenhuma empresa cadastrada ainda</h1>
          <p className="perfil-subtitle">
            Complete o cadastro da empresa para ver o perfil aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-screen">
      <div className="perfil-card">
        <div className="perfil-header">
          <div>
            <p className="perfil-eyebrow">Regulariza</p>
            <h1 className="perfil-title">{empresa.nome}</h1>
            <p className="perfil-subtitle">
              CNPJ {empresa.cnpj} · {empresa.municipio}/{empresa.estado}
            </p>
          </div>
          <span className="perfil-badge">{empresa.porte}</span>
        </div>

        <section className="perfil-section">
          <h2 className="perfil-section-title">Informações básicas</h2>
          <div className="perfil-grid">
            <InfoItem label="Nome da empresa" value={empresa.nome} />
            <InfoItem label="CNPJ" value={empresa.cnpj} />
            <InfoItem label="Atividade econômica" value={empresa.atividade} />
            <InfoItem label="Porte" value={empresa.porte} />
            <InfoItem label="Município" value={empresa.municipio} />
            <InfoItem label="Estado" value={empresa.estado} />
          </div>
        </section>

        <section className="perfil-section">
          <h2 className="perfil-section-title">Informações operacionais</h2>
          <div className="perfil-grid">
            <InfoItem label="Número de funcionários" value={String(empresa.funcionarios)} />
            <InfoItem label="Tipo de contratação" value={empresa.contratacao} />
            <InfoItem
              label="Estabelecimento físico"
              value={empresa.estabelecimentoFisico ? "Sim" : "Não"}
            />
          </div>
          {empresa.caracteristicas && (
            <InfoItem
              label="Características específicas"
              value={empresa.caracteristicas}
              fullWidth
            />
          )}
        </section>

        <button className="btn-primary perfil-edit-btn" type="button" onClick={onEditar}>
          Editar dados da empresa
        </button>
      </div>
    </div>
  );
}

function InfoItem({ label, value, fullWidth }) {
  return (
    <div className={`perfil-info-item ${fullWidth ? "full-width" : ""}`}>
      <span className="perfil-info-label">{label}</span>
      <span className="perfil-info-value">{value || "—"}</span>
    </div>
  );
}