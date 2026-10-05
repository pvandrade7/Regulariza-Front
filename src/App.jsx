import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import CadastroUsuario from "./pages/CadastroUsuario/CadastroUsuario";
import CadastroEmpresa from "./pages/CadastroEmpresa/CadastroEmpresa";
import PerfilEmpresa from "./pages/PerfilEmpresa/PerfilEmpresa";
import RequireAuth from "./routes/RequireAuth";
import { saveToken } from "./utils/auth";
import { saveEmpresa, getEmpresa } from "./utils/empresaStorage";

// Cada função abaixo "liga" uma tela às rotas e, por enquanto, a dados falsos.
// O // TODO marca exatamente onde entra a chamada real à API quando o back-end
// estiver pronto (ver README para os endpoints esperados).

function LoginPage() {
  const navigate = useNavigate();

  async function handleLogin(credenciais) {
    // TODO: trocar por chamada real -> POST /login
    // const res = await fetch("/api/login", { method: "POST", body: JSON.stringify(credenciais) });
    // if (!res.ok) throw new Error("invalid_credentials");
    // const { token } = await res.json();
    const tokenFalso = "token-de-teste";
    saveToken(tokenFalso);
    navigate("/cadastro-empresa");
  }

  return (
    <Login onLogin={handleLogin} onNavigateToCadastro={() => navigate("/cadastro-usuario")} />
  );
}

function CadastroUsuarioPage() {
  const navigate = useNavigate();

  async function handleSubmit(usuario) {
    // TODO: trocar por chamada real -> POST /registro
    navigate("/login");
  }

  return (
    <CadastroUsuario onSubmit={handleSubmit} onNavigateToLogin={() => navigate("/login")} />
  );
}

function CadastroEmpresaPage() {
  const navigate = useNavigate();

  async function handleSubmit(empresa) {
    // TODO: trocar por chamada real -> POST/PUT /empresa
    saveEmpresa(empresa); // placeholder até existir GET /empresa — ver utils/empresaStorage.js
    navigate("/perfil-empresa");
  }

  return <CadastroEmpresa onSubmit={handleSubmit} />;
}

function PerfilEmpresaPage() {
  const navigate = useNavigate();
  // TODO: trocar getEmpresa() por um fetch real a GET /empresa quando o back-end existir.
  const empresa = getEmpresa();

  return <PerfilEmpresa empresa={empresa} onEditar={() => navigate("/cadastro-empresa")} />;
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
          path="/perfil-empresa"
          element={
            <RequireAuth>
              <PerfilEmpresaPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}