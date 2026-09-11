# Transferência do projeto para outra conta Codex

## O que deve ser transferido

- Este repositório completo (`controle-de-boletos`).
- O histórico desta conversa, por meio do link de compartilhamento da tarefa.
- O banco de produção e os dados reais, separadamente e por canal seguro.

## Publicação do código

1. Criar um repositório **privado** no GitHub.
2. Enviar este projeto para o repositório.
3. Na outra conta Codex, conectar o GitHub e abrir o repositório.
4. Iniciar a tarefa com: `Leia README.md, AGENTS.md e docs/TRANSFERENCIA_CODEX.md e continue o projeto Controle de Boletos.`

## Atenção aos dados

Não enviar para o GitHub arquivos de banco local, `.env`, senhas, tokens, `node_modules`, `.wrangler`, `.next` ou `dist`. Esses itens já estão excluídos pelas regras do projeto.

## Hospedagem

O sistema usa Next.js 16 na Vercel e Turso/SQLite para persistência. Configure `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` na Vercel e aplique as migrações antes do primeiro acesso.

## Validação após importar na outra conta

- Executar `npm install` dentro de `web`.
- Executar `npm run typecheck` e `npm test`.
- Executar `npm run db:migrate` com as credenciais do banco de destino.
- Confirmar o acesso inicial em `/configuracao-inicial`.
- Confirmar que nenhum `.env`, token ou banco local foi enviado ao GitHub.
