import { useState } from "react";
import { isRequired, isValidEmail, isValidPasswordLength } from "../../utils/validators";
import "./Login.css";

/**
 * Tela de Login — História 2.1/2.2
 *
 * Props:
 *  - onLogin(credentials): chamado com { email, senha } após validação bem-sucedida.
 *    Deve retornar (ou lançar) para indicar erro de autenticação, ex.:
 *      onLogin={(c) => api.login(c)}  // rejeita a Promise em caso de credenciais inválidas
 *  - onNavigateToCadastro(): navegação para a criação de conta, se aplicável.
 */
export default function Login({ onLogin, onNavigateToCadastro }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const next = {};

    if (!isRequired(email)) {
      next.email = "Informe seu e-mail.";
    } else if (!isValidEmail(email)) {
      next.email = "Digite um e-mail válido.";
    }

    if (!isRequired(senha)) {
      next.senha = "Informe sua senha.";
    } else if (!isValidPasswordLength(senha)) {
      next.senha = "A senha deve ter pelo menos 6 caracteres.";
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
      await onLogin?.({ email: email.trim(), senha });
    } catch (err) {
      setFormError(
        err?.message === "invalid_credentials"
          ? "E-mail ou senha incorretos."
          : "Não foi possível entrar. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-mark" aria-hidden="true" />
        <p className="login-eyebrow">Regulariza</p>
        <h1 className="login-title">Entrar</h1>
        <p className="login-subtitle">Acompanhe as obrigações da sua empresa em um só lugar.</p>

        <form onSubmit={handleSubmit} noValidate>
          {formError && <div className="form-banner">{formError}</div>}

          <div className={`field ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className={`field ${errors.senha ? "has-error" : ""}`}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {errors.senha && <span className="error-text">{errors.senha}</span>}
          </div>

          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="login-footer">
          Ainda não tem conta?{" "}
          <button type="button" className="link-btn" onClick={onNavigateToCadastro}>
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
}
