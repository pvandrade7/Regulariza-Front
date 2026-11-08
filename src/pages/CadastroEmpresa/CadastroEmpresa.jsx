import { useEffect, useState } from "react";
import { useRef } from "react";
import { maskCNPJ } from "../../utils/validators";
import { iniciarEmpresaForm, validarEmpresaForm, payloadEmpresa, tipoDoRegime } from "../../utils/empresaForm";
import "./CadastroEmpresa.css";
import { listarRegimes } from "../../services/api";

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

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

/**
 * Tela de Cadastro da Empresa — História 3.1/3.2
 * Uma única tela dividida em duas seções: Informações Básicas e Operacionais,
 * conforme definido no PRD (seção 23, Tela 2).
 *
 * Props:
 *  - onSubmit(empresa): chamado com os dados validados, prontos para POST/PUT /empresa.
 */
export default function CadastroEmpresa({ onSubmit, empresa }) {
  const [form, setForm] = useState(() => iniciarEmpresaForm(empresa));
  const enviando = useRef(false);
  const [regimes, setRegimes] = useState([]);
  const tipo = tipoDoRegime(regimes, form.regimeJuridicoId);
  const [erroRegimes, setErroRegimes] = useState("");
  useEffect(() => {
    let ativo = true;
    listarRegimes().then(lista => { if (ativo) setRegimes(lista); }).catch(err => ativo && setErroRegimes(err.message));
    return () => { ativo = false; };
  }, []);
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
    setField("funcionarios", e.target.value);
  }

  function validate() {
    const next = validarEmpresaForm(form, regimes);

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (enviando.current) return;
    setFormError("");

    if (!validate()) {
      setFormError("Revise os campos destacados antes de continuar.");
      return;
    }

    enviando.current = true;
    setIsSubmitting(true);
    try {
      await onSubmit?.(payloadEmpresa(form, regimes));
    } catch (err) {
      setFormError(err.message || "Não foi possível salvar a empresa.");
    } finally {
      enviando.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="cadastro-screen">
      <div className="cadastro-card">
        <p className="cadastro-eyebrow">Regulariza</p>
        <h1 className="cadastro-title">{empresa ? "Editar empresa" : "Cadastro da empresa"}</h1>
        <p className="cadastro-subtitle">
          Essas informações formam o perfil que o motor de aplicabilidade usa para identificar
          quais obrigações valem para o seu negócio.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {formError && <div className="form-banner">{formError}</div>}

          <section className="form-section">
            <h2 className="section-title">Informações básicas</h2>
            {erroRegimes && <div className="form-banner">{erroRegimes}</div>}
            <div className="field">
              <label htmlFor="regime">Tipo de pessoa</label>
              <select id="regime" value={form.regimeJuridicoId} onChange={e => setForm(prev => ({ ...prev, regimeJuridicoId: e.target.value, cpf: "", cnpj: "" }))}>
                <option value="">Selecione</option>
                {regimes.filter(reg => ["Pessoa Física", "Pessoa Jurídica"].includes(reg.nome)).map(reg => <option key={reg.id} value={reg.id}>{reg.nome}</option>)}
              </select>
              {errors.regimeJuridicoId && <span className="error-text">{errors.regimeJuridicoId}</span>}
              {!erroRegimes && regimes.length === 0 && <span className="hint">Aguardando regimes cadastrados no banco.</span>}
            </div>
            {tipo === "PF" && <div className="field"><label htmlFor="cpf">CPF</label><input id="cpf" inputMode="numeric" maxLength={14} value={form.cpf || ""} onChange={e => setField("cpf", e.target.value)} />{errors.cpf && <span className="error-text">{errors.cpf}</span>}</div>}

            <div className={`field ${errors.nome ? "has-error" : ""}`}>
              <label htmlFor="nome">Nome do negócio</label>
              <input
                id="nome"
                maxLength={150}
                placeholder="Ex.: Restaurante ABC"
                value={form.nome}
                onChange={(e) => setField("nome", e.target.value)}
              />
              {errors.nome && <span className="error-text">{errors.nome}</span>}
            </div>

            <div className="field-row two-cols">
              {tipo === "PJ" && <div className={`field ${errors.cnpj ? "has-error" : ""}`}>
                <label htmlFor="cnpj">CNPJ</label>
                <input
                  id="cnpj"
                  inputMode="numeric"
                  placeholder="00.000.000/0000-00"
                  value={form.cnpj || ""}
                  onChange={handleCNPJChange}
                />
                {errors.cnpj && <span className="error-text">{errors.cnpj}</span>}
              </div>}

              <div className={`field ${errors.atividade ? "has-error" : ""}`}>
                <label htmlFor="atividade">Atividade econômica</label>
                <select
                  id="atividade"
                  value={form.atividade}
                  onChange={(e) => setField("atividade", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {form.atividade && !ATIVIDADES.includes(form.atividade) && <option value={form.atividade}>{form.atividade}</option>}
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
                <label htmlFor="porte">Porte (opcional)</label>
                <select
                  id="porte"
                  value={form.porte || ""}
                  onChange={(e) => setField("porte", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {form.porte && !PORTES.includes(form.porte) && <option value={form.porte}>{form.porte}</option>}
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
                    maxLength={100}
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

          </section>

          <button className="btn-primary" type="submit" disabled={isSubmitting || regimes.length === 0}>
            {isSubmitting ? "Salvando..." : "Salvar e continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
