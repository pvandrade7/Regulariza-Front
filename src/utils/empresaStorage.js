// Placeholder enquanto o back-end não tem GET /empresa.
// Guarda, no sessionStorage, os dados que o usuário acabou de cadastrar,
// só para a tela de Perfil da Empresa ter o que exibir.
//
// Quando o endpoint existir, troque getEmpresa() por uma chamada real
// (ex.: dentro de um useEffect na própria tela de perfil) e pode apagar este arquivo.

const EMPRESA_KEY = "regulariza_empresa";

export function saveEmpresa(empresa) {
  sessionStorage.setItem(EMPRESA_KEY, JSON.stringify(empresa));
}

export function getEmpresa() {
  const raw = sessionStorage.getItem(EMPRESA_KEY);
  return raw ? JSON.parse(raw) : null;
}