# Regulariza — Frontend

React + Vite. Node validado: 22.19.0.

```sh
npm install
npm run dev
```

`VITE_API_URL=http://localhost:3000` (padrão). Use o mesmo hostname nos dois serviços em desenvolvimento; não misture localhost e 127.0.0.1 por causa do SameSite. Nunca exponha DATABASE_URL ou chaves privadas em variáveis VITE_. Reinicie Vite após mudar a configuração.

Cadastre nome/e-mail/senha, entre com e-mail/senha e selecione/cadastre sua empresa. A sessão vem do cookie HttpOnly, é recuperada em `/auth/me` e revogada por logout HTTP. O frontend não armazena senhas/tokens no storage; apenas o ID temporário da empresa selecionada, que é revalidado pelo backend.

Usuários antigos sem senha permanecem preservados, mas bloqueados até ativação verificada. Documentos continuam indisponíveis por falta de suporte no backend. Os prazos calculados pela periodicidade precisam de conferência.

O chat do dashboard usa `POST /assistente/perguntar` com a sessão atual. Para receber respostas, a API indicada por `VITE_API_URL` precisa incluir a rota da etapa 2 e ter `GEMINI_API_KEY` configurada no ambiente do backend. Cada envio leva apenas a pergunta atual.

```sh
npm test
npm run lint
npm run build
```

Layout e rotas de navegação foram preservados. Veja o [relatório de autenticação](../../RELATORIO_AUTENTICACAO.md) para testes, configuração de produção e limitações.
