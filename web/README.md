# Controle de Boletos — aplicação web

Aplicação Next.js 16 para importar, validar e liberar pagamentos por unidade. O banco usa SQLite remoto no Turso e todas as consultas acontecem no servidor.

## Requisitos

- Node.js 24
- Um banco Turso
- `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`

Copie `.env.example` para `.env.local` e preencha os valores somente no ambiente local. Nunca versionar os valores reais.

## Desenvolvimento

```bash
npm install
npm run db:migrate
npm run dev
```

Na primeira visita, acesse `/configuracao-inicial` para criar o administrador. As unidades iniciais e as regras globais são cadastradas nesse passo.

## Validação

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

## Banco de dados

- `db/schema.ts`: esquema SQLite usado pelo Drizzle.
- `drizzle/*.sql`: migrações versionadas e imutáveis.
- `scripts/migrate.mjs`: aplica migrações pendentes e registra cada arquivo em `app_migrations`.

Para produção, configure as variáveis no provedor de hospedagem e execute `npm run db:migrate` antes de disponibilizar a aplicação.

### Importações e volume

- Cada lote aceita CSV ou XLSX de até 4 MB e até 100.000 lançamentos. Volumes maiores devem ser divididos em lotes.
- Os cabeçalhos originais são armazenados no lote e todos os valores de cada linha são preservados no pagamento, inclusive colunas que não aparecem na tela operacional.
- A tela operacional mantém apenas Data, Nome, Documento, Forma de pagamento e Valor a baixar, com paginação de 100 itens e resumo calculado sobre todo o filtro.
- A consulta de duplicidades busca somente as chaves do lote recebido e a listagem usa índice por unidade, situação e data, evitando carregar a base inteira em memória.
- Registros importados antes da migração `0004_preserve_source_columns.sql` permanecem intactos, mas não ganham retroativamente colunas que o sistema antigo não armazenou.

## Vercel

Use `web` como diretório raiz do projeto. A Vercel detecta Next.js e executa `npm run build`. As credenciais do Turso devem ser cadastradas nos ambientes Production, Preview e Development conforme necessário.
