import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import CadastroUsuario from "./pages/CadastroUsuario/CadastroUsuario";
import CadastroEmpresa from "./pages/CadastroEmpresa/CadastroEmpresa";
import Dashboard from "./pages/Dashboard/Dashboard";
import Obrigacoes from "./pages/Obrigacoes/Obrigacoes";
import Documentos from "./pages/Documentos/Documentos";
import RequireAuth from "./routes/RequireAuth";
import { saveToken } from "./utils/auth";
import { saveEmpresa, getEmpresa } from "./utils/empresaStorage";

// Modo de teste: ainda sem back-end de login e de empresa, tudo roda com dados de teste.

function LoginPage() {
  const navigate = useNavigate();

  async function handleLogin() {
    saveToken("token-de-teste");
    // Quem já cadastrou a empresa vai direto pro dashboard; os outros cadastram primeiro.
    navigate(getEmpresa() ? "/dashboard" : "/cadastro-empresa");
  }

  return (
    <Login onLogin={handleLogin} onNavigateToCadastro={() => navigate("/cadastro-usuario")} />
  );
}

function CadastroUsuarioPage() {
  const navigate = useNavigate();

  async function handleSubmit() {
    navigate("/login");
  }

  return (
    <CadastroUsuario onSubmit={handleSubmit} onNavigateToLogin={() => navigate("/login")} />
  );
}

function CadastroEmpresaPage() {
  const navigate = useNavigate();

  async function handleSubmit(empresa) {
    saveEmpresa(empresa);
    navigate("/dashboard");
  }

  return <CadastroEmpresa onSubmit={handleSubmit} />;
}

export default function App() {
  return (
    <BrowserRouter>
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
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/obrigacoes"
          element={
            <RequireAuth>
              <Obrigacoes />
            </RequireAuth>
          }
        />
        <Route
          path="/documentos"
          element={
            <RequireAuth>
              <Documentos />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}