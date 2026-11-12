# Regulariza — Frontend

React + Vite. Node validado: 22.19.0.

```sh
npm install
npm run dev
```

Sem `VITE_API_URL`, o frontend usa `https://regulariza-back-production.up.railway.app`. Para usar o backend local, configure `VITE_API_URL=http://localhost:3000` em `.env.local` (conforme `.env.example`). Use o mesmo hostname nos dois serviços em desenvolvimento; não misture localhost e 127.0.0.1 por causa do SameSite. Nunca exponha DATABASE_URL ou chaves privadas em variáveis VITE_. Reinicie Vite após mudar a configuração e gere um novo build para publicar alterações nessa variável.

Em produção, configure no backend `CORS_ORIGINS` com a origem HTTPS exata do frontend. Se front e back estiverem em sites diferentes, a sessão por cookie exige `NODE_ENV=production` e `COOKIE_SAME_SITE=none`; políticas do navegador ainda podem bloquear cookies de terceiros.

Cadastre nome/e-mail/senha, entre com e-mail/senha e selecione/cadastre sua empresa. A sessão vem do cookie HttpOnly, é recuperada em `/auth/me` e revogada por logout HTTP. O frontend não armazena senhas/tokens no storage; apenas o ID temporário da empresa selecionada, que é revalidado pelo backend.

Usuários antigos sem senha permanecem preservados, mas bloqueados até ativação verificada. Documentos continuam indisponíveis por falta de suporte no backend; chat e cálculo demonstrativo de prazos mantêm suas limitações anteriores.

```sh
npm test
npm run lint
npm run build
```

Layout e rotas de navegação foram preservados. Veja o [relatório de autenticação](../../RELATORIO_AUTENTICACAO.md) para testes, configuração de produção e limitações.
