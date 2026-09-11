# Registro de decisões

Use este arquivo para registrar escolhas importantes de produto e arquitetura.

## Modelo

### AAAA-MM-DD — Título da decisão

- **Contexto:** problema ou necessidade.
- **Decisão:** escolha realizada.
- **Motivo:** por que esta opção foi escolhida.
- **Consequências:** vantagens, limitações e próximos passos.

## Decisões registradas

### 2026-09-10 — Arquitetura do MVP

- **Contexto:** o sistema precisa substituir uma planilha compartilhada, manter histórico, importar CSV/XLSX, separar dados por unidade e funcionar com pouca manutenção.
- **Decisão:** usar uma aplicação web TypeScript com Vinext/Next.js, React, Tailwind, banco SQLite compatível com Cloudflare D1 e Drizzle ORM. Valores monetários serão armazenados em centavos inteiros. Sessões serão persistidas no banco, e toda autorização ocorrerá no servidor.
- **Motivo:** essa base entrega um MVP simples, relacional e portátil, sem serviço pago obrigatório nem dependência de um banco externo durante o desenvolvimento local.
- **Consequências:** o projeto web fica em `web/`; importações e consultas usam D1/SQLite. Uma futura migração para PostgreSQL exigirá adaptar a camada de persistência, mas não as regras de negócio. Publicação permanece pendente de autorização explícita.

### 2026-09-10 — Regras iniciais de dedução

- **Contexto:** a planilha atual reduz R$ 30,00 para valores compensados de R$ 60,00 e R$ 149,00, e o usuário confirmou que a regra vale para todas as formas de pagamento.
- **Decisão:** cadastrar duas regras globais iniciais: R$ 60,00 menos R$ 30,00 e R$ 149,00 menos R$ 30,00, sem restrição de boleto, PIX ou cartão.
- **Motivo:** manter o comportamento confirmado sem fixá-lo no código.
- **Consequências:** o administrador poderá desativar ou restringir regras futuras por forma, unidade, plano e vigência. As regras iniciais, porém, alcançam todas as formas de pagamento.

### 2026-09-10 — Publicação na Vercel com Turso

- **Contexto:** o MVP foi criado para Cloudflare Workers/D1, mas a publicação solicitada será feita na Vercel.
- **Decisão:** executar a aplicação em Next.js 16 nativo na Vercel e usar Turso como banco SQLite remoto, mantendo o esquema e as regras de negócio existentes.
- **Motivo:** Next.js é suportado diretamente pela Vercel, enquanto Turso preserva a compatibilidade com SQLite e evita uma migração mais ampla para PostgreSQL.
- **Consequências:** as consultas continuam atrás do helper de banco; a produção exige `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` e aplicação prévia das migrações por `npm run db:migrate`. A configuração específica de Cloudflare/Sites deixa de fazer parte do projeto.
