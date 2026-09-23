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

### 2026-09-14 — Preservação integral da origem e consultas em grande volume

- **Contexto:** a base deverá ultrapassar 500.000 lançamentos, sem alterar as cinco colunas exibidas ao operador, mas todas as colunas recebidas precisam permanecer disponíveis no banco.
- **Decisão:** armazenar os cabeçalhos originais uma vez em cada lote (`source_headers`) e os valores completos de cada linha em cada pagamento (`source_values`), ambos como JSON. A listagem operacional passa a usar paginação e resumo agregado no banco, com índice composto por unidade, situação e data. A verificação de duplicidade consulta somente as chaves presentes no lote recebido.
- **Motivo:** preservar fielmente arquivos com formatos variáveis sem criar uma coluna física nova a cada banco, reduzir leitura e memória nas consultas e manter a interface operacional estável.
- **Consequências:** novos lotes mantêm todas as colunas originais; as cinco colunas visíveis não mudam. Arquivos são limitados a 4 MB e 100.000 linhas por lote, portanto cargas maiores precisam ser fracionadas. Registros antigos continuam intactos, mas colunas que não eram armazenadas antes não podem ser reconstruídas sem os arquivos de origem.

### 2026-09-23 — Identidade de uma movimentação importada

- **Contexto:** CPF, unidade e valor se repetem naturalmente em pagamentos mensais e, por isso, não identificam uma movimentação de forma segura. A base anterior também continha lotes sem todas as colunas originais.
- **Decisão:** uma movimentação só é duplicada quando coincidem, após normalização, Data de Pagamento, Id da Cobrança, UUID, Nome da Loja e Chave da Transação. A primeira ocorrência permanece `VALIDADO`; somente as ocorrências posteriores recebem `DUPLICADO`. Se qualquer um dos cinco campos estiver ausente ou inválido, o registro recebe `EXCECAO` para revisão, sem reservar uma chave de duplicidade. CPF, unidade, valor e Id da Transação não participam dessa decisão.
- **Motivo:** os cinco campos juntos preservam a particularidade da transação e evitam rejeitar pagamentos legítimos recorrentes.
- **Consequências:** as cinco informações passam a ter colunas próprias, além da preservação integral de `source_headers` e `source_values`. Para eliminar o legado incompleto, os lotes e pagamentos importados serão removidos após backup verificável; usuários, unidades, regras e auditoria permanecem intactos.
