import { useEffect, useState } from 'react';
import { AuthContext, limparIdentificacaoAntiga } from '../utils/auth';
import { consultarSessao, fazerLogin, fazerLogout, setCsrfToken } from '../services/api';
import { saveEmpresaId } from '../utils/empresaStorage';

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  useEffect(() => {
    let ativo = true;
    limparIdentificacaoAntiga();
    function expirada() {
      setCsrfToken(null); saveEmpresaId(null); setUsuario(null);
    }
    window.addEventListener('regulariza:unauthorized', expirada);
    consultarSessao().then(sessao => {
      if (ativo) { setCsrfToken(sessao.csrfToken); setUsuario(sessao.usuario); }
    }).catch(err => {
      if (!ativo) return;
      if (err.status === 401) expirada();
      else setErro(err.message);
    }).finally(() => ativo && setCarregando(false));
    return () => { ativo = false; window.removeEventListener('regulariza:unauthorized', expirada); };
  }, []);
  async function entrar(credenciais) {
    const sessao = await fazerLogin(credenciais);
    saveEmpresaId(null); setCsrfToken(sessao.csrfToken); setUsuario(sessao.usuario); setErro('');
    return sessao.usuario;
  }
  async function sair() {
    try { await fazerLogout(); } catch (err) { if (err.status !== 401) throw err; }
    setCsrfToken(null); saveEmpresaId(null); setUsuario(null); setErro('');
  }
  return <AuthContext.Provider value={{ usuario, carregando, erro, entrar, sair }}>{children}</AuthContext.Provider>;
}
