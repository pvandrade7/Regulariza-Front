import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import CadastroUsuario from "./pages/CadastroUsuario/CadastroUsuario";
import CadastroEmpresa from "./pages/CadastroEmpresa/CadastroEmpresa";
import Dashboard from "./pages/Dashboard/Dashboard";
import Obrigacoes from "./pages/Obrigacoes/Obrigacoes";
import Documentos from "./pages/Documentos/Documentos";
import RequireAuth from "./routes/RequireAuth";
import AuthProvider from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { buscarEmpresa, criarUsuario } from "./services/api";
import { saveEmpresaId, getEmpresaId, setEmpresaAtual } from "./utils/empresaStorage";
import { salvarEmpresaComObrigacoes } from "./services/cadastroEmpresa";
import PerfilEmpresa from "./pages/PerfilEmpresa/PerfilEmpresa";

function LoginPage() {
  const navigate = useNavigate();
  const { usuario, carregando, entrar, sair } = useAuth();
  if (carregando) return <p className="page-message">Verificando sessão...</p>;
  function selecionar(empresaId) {
    saveEmpresaId(empresaId);
    navigate(empresaId ? '/dashboard' : '/cadastro-empresa', { replace: true });
  }
  return <Login usuario={usuario} onLogin={entrar} onLogout={sair} onSelecionar={selecionar} onNavigateToCadastro={() => navigate('/cadastro-usuario')} />;
}
function CadastroUsuarioPage() {
  const navigate = useNavigate();
  return <CadastroUsuario onSubmit={criarUsuario} onNavigateToLogin={() => navigate('/login')} />;
}
function EmpresaCarregada({ children }) {
  const [empresa, setEmpresa] = useState(null);
  const [erro, setErro] = useState("");
  const id = getEmpresaId();
  useEffect(() => {
    let ativo = true;
    if (id) buscarEmpresa(id).then(dados => {
      if (ativo) { setEmpresaAtual(dados); setEmpresa(dados); }
    }).catch(err => ativo && setErro(err.message));
    return () => { ativo = false; };
  }, [id]);
  if (!id) return children(null);
  if (erro) return <div className="form-banner" role="alert">{erro} <a href="/login">Voltar à seleção</a></div>;
  if (!empresa) return <p className="page-message">Carregando empresa...</p>;
  return children(empresa);
}
function CadastroEmpresaPage() {
  const navigate = useNavigate();
  async function handleSubmit(dados) {
    const resultado = await salvarEmpresaComObrigacoes(dados, getEmpresaId());
    navigate("/dashboard", { replace: true, state: resultado });
  }
  return <EmpresaCarregada>{empresa => <CadastroEmpresa key={empresa?.id || "nova"} empresa={empresa} onSubmit={handleSubmit} />}</EmpresaCarregada>;
}
function PerfilEmpresaPage() {
  const navigate = useNavigate();
  return <EmpresaCarregada>{empresa => <PerfilEmpresa empresa={empresa} onEditar={() => navigate("/cadastro-empresa")} />}</EmpresaCarregada>;
}
function DadosEmpresa({ children }) {
  if (!getEmpresaId()) return <Navigate to="/cadastro-empresa" replace />;
  return <EmpresaCarregada>{() => children}</EmpresaCarregada>;
}

export default function App() {
  return (
    <AuthProvider><BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuarioPage />} />
        <Route
          path="/cadastro-empresa"
          element={
            <RequireAuth>
              <CadastroEmpresaPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DadosEmpresa><Dashboard /></DadosEmpresa>
            </RequireAuth>
          }
        />
        <Route
          path="/obrigacoes"
          element={
            <RequireAuth>
              <DadosEmpresa><Obrigacoes /></DadosEmpresa>
            </RequireAuth>
          }
        />
        <Route
          path="/documentos"
          element={
            <RequireAuth>
              <DadosEmpresa><Documentos /></DadosEmpresa>
            </RequireAuth>
          }
        />
        <Route
          path="/perfil-empresa"
          element={
            <RequireAuth>
              <PerfilEmpresaPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter></AuthProvider>
  );
}