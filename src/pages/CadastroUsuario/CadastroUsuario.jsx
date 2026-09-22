import { useState } from "react";
import { isRequired, isValidEmail, isValidPasswordLength } from "../../utils/validators";
import "./CadastroUsuario.css";

/**
 * Tela de Cadastro de Usuário — História 2.1/2.2
 * Cria a conta que vai administrar a empresa (diferente do Cadastro da Empresa,
 * que vem depois, na primeira vez que o usuário loga).
 *
 * Props:
 *  - onSubmit(usuario): chamado com { nome, email, senha } validados, pronto para POST /registro.
 *  - onNavigateToLogin(): volta para a tela de login.
 */
export default function CadastroUsuario({ onSubmit, onNavigateToLogin }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const next = {};

    if (!isRequired(nome)) next.nome = "Informe seu nome.";

    if (!isRequired(email)) {
      next.email = "Informe seu e-mail.";
    } else if (!isValidEmail(email)) {
      next.email = "Digite um e-mail válido.";
    }

    if (!isRequired(senha)) {
      next.senha = "Crie uma senha.";
    } else if (!isValidPasswordLength(senha)) {
      next.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (!isRequired(confirmarSenha)) {
      next.confirmarSenha = "Confirme a senha.";
    } else if (senha !== confirmarSenha) {
      next.confirmarSenha = "As senhas não coincidem.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.({ nome: nome.trim(), email: email.trim(), senha });
    } catch (err) {
      setFormError(
        err?.message === "email_ja_cadastrado"
          ? "Esse e-mail já está cadastrado."
          : "Não foi possível criar a conta. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="cadastro-usuario-screen">
      <div className="cadastro-usuario-card">
        <p className="cadastro-usuario-eyebrow">Regulariza</p>
        <h1 className="cadastro-usuario-title">Criar conta</h1>
        <p className="cadastro-usuario-subtitle">
          Leva menos de um minuto. Depois disso, você cadastra sua empresa.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {formError && <div className="form-banner">{formError}</div>}

          <div className={`field ${errors.nome ? "has-error" : ""}`}>
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              placeholder="Seu nome"
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            {errors.nome && <span className="error-text">{errors.nome}</span>}
          </div>

          <div className={`field ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="voce@empresa.com.br"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="field-row two-cols">
            <div className={`field ${errors.senha ? "has-error" : ""}`}>
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              {errors.senha && <span className="error-text">{errors.senha}</span>}
            </div>

            <div className={`field ${errors.confirmarSenha ? "has-error" : ""}`}>
              <label htmlFor="confirmarSenha">Confirmar senha</label>
              <input
                id="confirmarSenha"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
              {errors.confirmarSenha && (
                <span className="error-text">{errors.confirmarSenha}</span>
              )}
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="cadastro-usuario-footer">
          Já tem conta?{" "}
          <button type="button" className="link-btn" onClick={onNavigateToLogin}>
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
