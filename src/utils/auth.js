import { createContext } from 'react';
// A identidade vem exclusivamente de /auth/me ou /auth/login; nunca do storage.
export const AuthContext = createContext(null);
export function limparIdentificacaoAntiga() {
  sessionStorage.removeItem('regulariza_demo_usuario_id');
  sessionStorage.removeItem('regulariza_token');
  sessionStorage.removeItem('regulariza_empresa');
}
