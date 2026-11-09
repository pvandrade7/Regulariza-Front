import { useState } from 'react';
import './CadastroUsuario.css';
export default function CadastroUsuario({ onSubmit, onNavigateToLogin }) {
  const [nome, setNome] = useState(''); const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState(''); const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  async function salvar(e) {
    e.preventDefault(); setErro('');
    if (!nome.trim() || nome.trim().length > 150) { setErro('Informe seu nome (até 150 caracteres).'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 255) { setErro('Informe um e-mail válido.'); return; }
    if (senha.length < 8 || senha.length > 128) { setErro('A senha deve ter entre 8 e 128 caracteres.'); return; }
    if (senha !== confirmacao) { setErro('A confirmação deve corresponder à senha.'); return; }
    setLoading(true);
    try { await onSubmit({ nome: nome.trim(), email: email.trim(), senha }); setSucesso(true); setSenha(''); setConfirmacao(''); }
    catch (err) { setErro(err.message); } finally { setLoading(false); }
  }
  return <div className="cadastro-usuario-screen"><div className="cadastro-usuario-card">
    <p className="cadastro-usuario-eyebrow">Regulariza</p><h1 className="cadastro-usuario-title">Criar conta</h1>
    <p className="cadastro-usuario-subtitle">Cadastre-se para gerenciar suas empresas.</p>
    {sucesso ? <p role="status">Conta criada com sucesso. Entre com seu e-mail e senha.</p> :
      <form onSubmit={salvar} noValidate>{erro && <div className="form-banner" role="alert">{erro}</div>}
        <div className="field"><label htmlFor="nome">Nome</label><input id="nome" autoComplete="name" required maxLength={150} value={nome} onChange={e => setNome(e.target.value)} /></div>
        <div className="field"><label htmlFor="email">E-mail</label><input id="email" type="email" autoComplete="username" required maxLength={255} value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="field-row two-cols">
          <div className="field"><label htmlFor="senha">Senha</label><input id="senha" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={senha} onChange={e => setSenha(e.target.value)} /><span className="hint">Entre 8 e 128 caracteres.</span></div>
          <div className="field"><label htmlFor="confirmacao">Confirmar senha</label><input id="confirmacao" type="password" autoComplete="new-password" maxLength={128} required value={confirmacao} onChange={e => setConfirmacao(e.target.value)} /></div>
        </div>
        <button className="btn-primary" disabled={loading}>{loading ? 'Criando conta...' : 'Criar conta'}</button>
      </form>}
    <p className="cadastro-usuario-footer"><button className="link-btn" onClick={onNavigateToLogin}>Entrar</button></p>
  </div></div>;
}
