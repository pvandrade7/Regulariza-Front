import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export default function RequireAuth({ children }) {
  const { usuario, carregando, erro } = useAuth();
  const location = useLocation();
  if (carregando) return <p className="page-message">Verificando sessão...</p>;
  if (erro) return <div className="form-banner" role="alert">{erro} <button onClick={() => window.location.reload()}>Tentar novamente</button></div>;
  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
