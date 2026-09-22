import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

// Envolve rotas que exigem login. Sem token na sessão, manda pro /login.
export default function RequireAuth({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
