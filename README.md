# Controle de Boletos

MVP web para substituir a planilha compartilhada de controle de pagamentos por clínica.

## O que já está funcionando

- Login com sessão persistida e perfis Administrador/Operador.
- Isolamento de unidade no servidor: o operador só consulta sua própria clínica.
- Importação de CSV e XLSX, lotes, validação, duplicidades e exceções.
- Regras configuráveis em centavos, com as regras globais iniciais R$ 60 → R$ 30 e R$ 149 → R$ 119 para boleto, PIX e cartão.
- Consulta operacional, relatório agrupado por dia, impressão e exportação CSV/XLSX.
- Cadastro de unidades, usuários, regras e auditoria.

## Iniciar localmente

Entre na pasta `web`, instale as dependências e inicie a aplicação. Na primeira visita, abra a configuração inicial para criar o administrador. As cinco unidades da planilha analisada e as regras globais são preparadas nesse passo.

O arquivo original `Boleto-Cartão-Pix - delta (1).xlsx` não é alterado pelo projeto. A importação acontece somente quando o administrador envia uma cópia pela tela de Importações.

## Estrutura

- `web/`: aplicação Next.js/React, rotas, banco Turso/SQLite e testes.
- `docs/PRODUCT_BRIEF.md`: escopo funcional.
- `docs/DECISIONS.md`: decisões de arquitetura e regras iniciais.

## Publicação

A aplicação é preparada para Vercel, com `web` como diretório raiz. O banco remoto precisa receber as migrações antes do primeiro acesso. Qualquer integração bancária permanece pendente de autorização explícita.
