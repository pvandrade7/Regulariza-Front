import { useState } from "react";
import {
  isRequired,
  maskCNPJ,
  isValidCNPJ,
  onlyDigits,
  isPositiveInteger,
} from "../../utils/validators";
import "./CadastroEmpresa.css";

const PORTES = ["MEI", "Microempresa (ME)", "Pequena empresa", "Média empresa"];

const ATIVIDADES = [
  "Comércio varejista",
  "Comércio atacadista",
  "Restaurante / alimentação",
  "Prestação de serviços",
  "Escritório contábil",
  "Escola / educação",
  "Indústria",
  "Outra",
];

const CONTRATACOES = ["CLT", "Pessoa jurídica (PJ)", "Autônomo", "Misto", "Não possui funcionários"];

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const initialForm = {
  nome: "",
  cnpj: "",
  atividade: "",
  porte: "",
  municipio: "",
  estado: "",
  funcionarios: "",
  contratacao: "",
  estabelecimentoFisico: "",
  caracteristicas: "",
};

/**
 * Tela de Cadastro da Empresa — História 3.1/3.2
 * Uma única tela dividida em duas seções: Informações Básicas e Operacionais,
 * conforme definido no PRD (seção 23, Tela 2).
 *
 * Props:
 *  - onSubmit(empresa): chamado com os dados validados, prontos para POST/PUT /empresa.
 */
export default function CadastroEmpresa({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCNPJChange(e) {
    setField("cnpj", maskCNPJ(e.target.value));
  }

  function handleFuncionariosChange(e) {
    setField("funcionarios", onlyDigits(e.target.value));
  }

  function validate() {
    const next = {};

    if (!isRequired(form.nome)) next.nome = "Informe o nome da empresa.";
    if (!isRequired(form.cnpj)) {
      next.cnpj = "Informe o CNPJ.";
    } else if (!isValidCNPJ(form.cnpj)) {
      next.cnpj = "CNPJ inválido. Verifique os 14 dígitos.";
    }
    if (!isRequired(form.atividade)) next.atividade = "Selecione a atividade.";
    if (!isRequired(form.porte)) next.porte = "Selecione o porte da empresa.";
    if (!isRequired(form.municipio)) next.municipio = "Informe o município.";
    if (!isRequired(form.estado)) next.estado = "Selecione o estado.";

    if (!isRequired(form.funcionarios)) {
      next.funcionarios = "Informe o número de funcionários.";
    } else if (!isPositiveInteger(form.funcionarios)) {
      next.funcionarios = "Use apenas números.";
    }
    if (!isRequired(form.contratacao)) next.contratacao = "Selecione o tipo de contratação.";
    if (!isRequired(form.estabelecimentoFisico)) {
      next.estabelecimentoFisico = "Informe se a empresa possui estabelecimento físico.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!validate()) {
      setFormError("Revise os campos destacados antes de continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.({
        ...form,
        funcionarios: Number(form.funcionarios),
        estabelecimentoFisico: form.estabelecimentoFisico === "sim",
      });
    } catch {
      setFormError("Não foi possível salvar a empresa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="cadastro-screen">
      <div className="cadastro-card">
        <p className="cadastro-eyebrow">Regulariza</p>
        <h1 className="cadastro-title">Cadastro da empresa</h1>
        <p className="cadastro-subtitle">
          Essas informações formam o perfil que o motor de aplicabilidade usa para identificar
          quais obrigações valem para o seu negócio.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {formError && <div className="form-banner">{formError}</div>}

          <section className="form-section">
            <h2 className="section-title">Informações básicas</h2>

            <div className={`field ${errors.nome ? "has-error" : ""}`}>
              <label htmlFor="nome">Nome da empresa</label>
              <input
                id="nome"
                placeholder="Ex.: Restaurante ABC"
                value={form.nome}
                onChange={(e) => setField("nome", e.target.value)}
              />
              {errors.nome && <span className="error-text">{errors.nome}</span>}
            </div>

            <div className="field-row two-cols">
              <div className={`field ${errors.cnpj ? "has-error" : ""}`}>
                <label htmlFor="cnpj">CNPJ</label>
                <input
                  id="cnpj"
                  inputMode="numeric"
                  placeholder="00.000.000/0000-00"
                  value={form.cnpj}
                  onChange={handleCNPJChange}
                />
                {errors.cnpj && <span className="error-text">{errors.cnpj}</span>}
              </div>

              <div className={`field ${errors.atividade ? "has-error" : ""}`}>
                <label htmlFor="atividade">Atividade econômica</label>
                <select
                  id="atividade"
                  value={form.atividade}
                  onChange={(e) => setField("atividade", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {ATIVIDADES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                {errors.atividade && <span className="error-text">{errors.atividade}</span>}
              </div>
            </div>

            <div className="field-row two-cols">
              <div className={`field ${errors.porte ? "has-error" : ""}`}>
                <label htmlFor="porte">Porte</label>
                <select
                  id="porte"
                  value={form.porte}
                  onChange={(e) => setField("porte", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {PORTES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.porte && <span className="error-text">{errors.porte}</span>}
              </div>

              <div className="field-row three-cols-inner">
                <div className={`field ${errors.municipio ? "has-error" : ""}`}>
                  <label htmlFor="municipio">Município</label>
                  <input
                    id="municipio"
                    placeholder="Ex.: Fortaleza"
                    value={form.municipio}
                    onChange={(e) => setField("municipio", e.target.value)}
                  />
                  {errors.municipio && <span className="error-text">{errors.municipio}</span>}
                </div>

                <div className={`field estado-field ${errors.estado ? "has-error" : ""}`}>
                  <label htmlFor="estado">UF</label>
                  <select
                    id="estado"
                    value={form.estado}
                    onChange={(e) => setField("estado", e.target.value)}
                  >
                    <option value="">--</option>
                    {ESTADOS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                  {errors.estado && <span className="error-text">{errors.estado}</span>}
                </div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="section-title">Informações operacionais</h2>

            <div className="field-row two-cols">
              <div className={`field ${errors.funcionarios ? "has-error" : ""}`}>
                <label htmlFor="funcionarios">Número de funcionários</label>
                <input
                  id="funcionarios"
                  inputMode="numeric"
                  placeholder="Ex.: 15"
                  value={form.funcionarios}
                  onChange={handleFuncionariosChange}
                />
                {errors.funcionarios && <span className="error-text">{errors.funcionarios}</span>}
                {!errors.funcionarios && (
                  <span className="hint">Use 0 se a empresa ainda não tem funcionários.</span>
                )}
              </div>

              <div className={`field ${errors.contratacao ? "has-error" : ""}`}>
                <label htmlFor="contratacao">Tipo de contratação</label>
                <select
                  id="contratacao"
                  value={form.contratacao}
                  onChange={(e) => setField("contratacao", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {CONTRATACOES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.contratacao && <span className="error-text">{errors.contratacao}</span>}
              </div>
            </div>

            <div className={`field ${errors.estabelecimentoFisico ? "has-error" : ""}`}>
              <label>Possui estabelecimento físico?</label>
              <div className="radio-group">
                {[
                  { value: "sim", label: "Sim" },
                  { value: "nao", label: "Não" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`radio-option ${
                      form.estabelecimentoFisico === opt.value ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="estabelecimentoFisico"
                      value={opt.value}
                      checked={form.estabelecimentoFisico === opt.value}
                      onChange={(e) => setField("estabelecimentoFisico", e.target.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.estabelecimentoFisico && (
                <span className="error-text">{errors.estabelecimentoFisico}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="caracteristicas">
                Características específicas da atividade{" "}
                <span className="hint-inline">(opcional)</span>
              </label>
              <textarea
                id="caracteristicas"
                placeholder="Ex.: manipula alimentos, armazena produtos químicos, atende ao público infantil..."
                value={form.caracteristicas}
                onChange={(e) => setField("caracteristicas", e.target.value)}
              />
            </div>
          </section>

          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar e continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
