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

O sistema usa Vinext e Cloudflare D1. A publicação recomendada é em Cloudflare Workers/D1. A Vercel exigiria adaptar a camada de banco para PostgreSQL ou outro serviço compatível antes do primeiro deploy.

## Validação após importar na outra conta

- Executar `npm install` dentro de `web`.
- Executar `npm run typecheck` e `npm test`.
- Confirmar o acesso inicial em `/configuracao-inicial`.
- Aplicar as migrações no banco de produção antes de importar dados reais.
