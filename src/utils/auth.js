// Controle simples de sessão via sessionStorage (backlog: "armazenar token na sessão").
// sessionStorage é limpo quando a aba fecha — troque por localStorage se quiser
// manter o usuário logado entre sessões do navegador.

const TOKEN_KEY = "regulariza_token";

export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
