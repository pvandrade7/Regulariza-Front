import { useEffect, useState } from "react";
import AppLayout from "../../components/AppLayout/AppLayout";
import { listarDocumentos, criarDocumento } from "../../services/dados";
import { TIPOS_DOCUMENTO } from "../../services/mockData";
import {
  dataParaISO,
  formatarData,
  diasAte,
  statusDoDocumento,
  textoValidade,
  validarDocumento,
} from "../../utils/prazos";
import "./Documentos.css";

const FORM_INICIAL = { nome: "", tipo: "", numero: "", emissao: "", validade: "" };

const ROTULO_STATUS = {
  valido: "Válido",
  "vence-em-breve": "Vence em breve",
  vencido: "Vencido",
  "sem-validade": "Sem validade",
};

const COR_STATUS = {
  valido: "verde",
  "vence-em-breve": "amarelo",
  vencido: "vermelho",
  "sem-validade": "",
};

// Com validade primeiro (do mais próximo de vencer ao mais distante); sem validade no fim.
function ordenar(lista) {
  return [...lista].sort((a, b) => {
    if (!a.validade && !b.validade) return 0;
    if (!a.validade) return 1;
    if (!b.validade) return -1;
    return diasAte(a.validade) - diasAte(b.validade);
  });
}

/**
 * Documentos e Licenças — Histórias 7.1 e 7.2.
 * Formulário de cadastro e lista com selo de validade (válido, vence em breve, vencido).
 */
export default function Documentos() {
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);
  const [erros, setErros] = useState({});
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    let ativo = true;
    listarDocumentos()
      .then((lista) => ativo && setDocumentos(lista))
      .catch((err) => ativo && setErroLista(err.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  function setCampo(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
    setSucesso("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroForm("");
    setSucesso("");

    const encontrados = validarDocumento(form);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setSalvando(true);
    try {
      const novo = await criarDocumento({
        nome: form.nome.trim(),
        tipo: form.tipo,
        numero: form.numero.trim(),
        emissao: form.emissao,
        validade: form.validade,
      });
      setDocumentos((lista) => [...lista, novo]);
      setForm(FORM_INICIAL);
      setSucesso("Documento cadastrado.");
    } catch (err) {
      setErroForm(err.message || "Não foi possível cadastrar o documento.");
    } finally {
      setSalvando(false);
    }
  }

  const hoje = dataParaISO();

  return (
    <AppLayout titulo="Documentos">
      <div className="doc-colunas">
        <section className="app-card">
          <h2 className="app-card-title">Cadastrar documento</h2>

          <p>Metadados, associação a obrigações e upload ainda não possuem suporte no backend. Nenhum documento será salvo localmente.</p>
          <form onSubmit={handleSubmit} noValidate><fieldset disabled style={{ border: 0, padding: 0 }}>
            {erroForm && <div className="form-banner">{erroForm}</div>}
            {sucesso && <div className="doc-sucesso">{sucesso}</div>}

            <div className={`field ${erros.nome ? "has-error" : ""}`}>
              <label htmlFor="doc-nome">Nome do documento</label>
              <input
                id="doc-nome"
                placeholder="Ex.: Alvará de Funcionamento"
                maxLength={150}
                value={form.nome}
                onChange={(e) => setCampo("nome", e.target.value)}
              />
              {erros.nome && <span className="error-text">{erros.nome}</span>}
            </div>

            <div className="field-row two-cols">
              <div className={`field ${erros.tipo ? "has-error" : ""}`}>
                <label htmlFor="doc-tipo">Tipo</label>
                <select
                  id="doc-tipo"
                  value={form.tipo}
                  onChange={(e) => setCampo("tipo", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {TIPOS_DOCUMENTO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {erros.tipo && <span className="error-text">{erros.tipo}</span>}
              </div>

              <div className="field">
                <label htmlFor="doc-numero">Número (opcional)</label>
                <input
                  id="doc-numero"
                  maxLength={60}
                  value={form.numero}
                  onChange={(e) => setCampo("numero", e.target.value)}
                />
              </div>
            </div>

            <div className="field-row two-cols">
              <div className={`field ${erros.emissao ? "has-error" : ""}`}>
                <label htmlFor="doc-emissao">Data de emissão</label>
                <input
                  id="doc-emissao"
                  type="date"
                  max={hoje}
                  value={form.emissao}
                  onChange={(e) => setCampo("emissao", e.target.value)}
                />
                {erros.emissao && <span className="error-text">{erros.emissao}</span>}
              </div>

              <div className={`field ${erros.validade ? "has-error" : ""}`}>
                <label htmlFor="doc-validade">Validade (opcional)</label>
                <input
                  id="doc-validade"
                  type="date"
                  min={form.emissao || undefined}
                  value={form.validade}
                  onChange={(e) => setCampo("validade", e.target.value)}
                />
                {erros.validade ? (
                  <span className="error-text">{erros.validade}</span>
                ) : (
                  <span className="hint">Deixe vazio se o documento não vence.</span>
                )}
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Cadastrar documento"}
            </button>
          </fieldset></form>
        </section>

        <section className="app-card">
          <h2 className="app-card-title">Seus documentos</h2>

          {erroLista && <div className="form-banner">{erroLista}</div>}
          {carregando && <p className="empty-state">Carregando...</p>}
          {!carregando && !erroLista && documentos.length === 0 && (
            <p className="empty-state">Nenhum documento cadastrado ainda.</p>
          )}

          <ul className="doc-lista">
            {ordenar(documentos).map((d) => {
              const status = statusDoDocumento(d);
              return (
                <li key={d.id} className={`doc-item ${COR_STATUS[status]}`}>
                  <div className="doc-item-info">
                    <span className="doc-item-nome">{d.nome}</span>
                    <span className="doc-item-meta">
                      {d.tipo}
                      {d.numero ? ` · nº ${d.numero}` : ""} · emitido em {formatarData(d.emissao)}
                    </span>
                    <span className="doc-item-meta">
                      {d.validade ? `Validade: ${formatarData(d.validade)} · ` : ""}
                      {textoValidade(d)}
                    </span>
                  </div>
                  <span className={`badge ${COR_STATUS[status]}`}>{ROTULO_STATUS[status]}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}