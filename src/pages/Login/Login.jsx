import { useEffect, useState } from 'react';
import { listarEmpresas } from '../../services/api';
import './Login.css';
export default function Login({ usuario, onLogin, onLogout, onSelecionar, onNavigateToCadastro }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [empresas, setEmpresas] = useState(null);
  const [empresaId, setEmpresaId] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let ativo = true;
    if (usuario) listarEmpresas().then(lista => {
      if (ativo) { setEmpresas(lista); setEmpresaId(lista[0]?.id || ''); }
    }).catch(err => ativo && setErro(err.message));
    return () => { ativo = false; };
  }, [usuario]);
  async function entrar(e) {
    e.preventDefault(); setErro('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || senha.length < 8 || senha.length > 128) {
      setErro('Informe e-mail válido e senha de 8 a 128 caracteres.'); return;
    }
    setLoading(true);
    try { await onLogin({ email: email.trim(), senha }); setSenha(''); }
    catch (err) { setErro(err.message); } finally { setLoading(false); }
  }
  async function sair() {
    setLoading(true); setErro('');
    try { await onLogout(); setEmpresas(null); setEmpresaId(''); }
    catch (err) { setErro(err.message); } finally { setLoading(false); }
  }
  return <div className="login-screen"><div className="login-card">
    <div className="login-mark" aria-hidden="true" /><p className="login-eyebrow">Regulariza</p>
    <h1 className="login-title">{usuario ? 'Selecione sua empresa' : 'Entrar'}</h1>
    <p className="login-subtitle">Acompanhe as obrigações da sua empresa em um só lugar.</p>
    {erro && <div className="form-banner" role="alert">{erro}</div>}
    {usuario ? <>
      <p>Olá, {usuario.nome}.</p>
      {empresas === null ? <p>{erro ? 'Recarregue a página para tentar consultar novamente.' : 'Carregando empresas...'}</p> : <form onSubmit={e => { e.preventDefault(); onSelecionar(empresaId); }}>
        <div className="field"><label htmlFor="empresa">Empresa</label>
          <select id="empresa" value={empresaId} onChange={e => setEmpresaId(e.target.value)}>
            <option value="">Cadastrar nova empresa</option>{empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
          </select></div>
        <button className="btn-primary">Continuar</button>
      </form>}
      <p className="login-footer"><button className="link-btn" onClick={sair} disabled={loading}>Sair da conta</button></p>
    </> : <>
      <form onSubmit={entrar} noValidate>
        <div className="field"><label htmlFor="email">E-mail</label><input id="email" type="email" autoComplete="username" maxLength={255} required value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="field"><label htmlFor="senha">Senha</label><input id="senha" type="password" autoComplete="current-password" maxLength={128} required value={senha} onChange={e => setSenha(e.target.value)} /></div>
        <button className="btn-primary" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <p className="login-footer"><button className="link-btn" onClick={onNavigateToCadastro}>Criar conta</button></p>
    </>}
  </div></div>;
}
