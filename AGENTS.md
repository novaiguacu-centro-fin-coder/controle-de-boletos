# Instruções do projeto

## Produto

- Este projeto se chama Controle de Boletos.
- A interface, a documentação e as mensagens destinadas ao usuário devem ser escritas em português do Brasil.
- Antes de escolher ou alterar a arquitetura principal, registre a decisão em `docs/DECISIONS.md`.

## Dados financeiros

- Nunca use ponto flutuante para armazenar valores monetários; prefira centavos inteiros ou um tipo decimal adequado.
- Trate datas de emissão, vencimento e pagamento explicitamente, evitando conversões implícitas de fuso horário.
- Valide valores, estados e transições antes de persistir dados.
- Não registre dados financeiros sensíveis, tokens, senhas ou conteúdo de boletos em logs.

## Desenvolvimento

- Não adicione dependências de produção sem explicar a necessidade.
- Prefira mudanças pequenas, verificáveis e fáceis de revisar.
- Crie ou atualize testes para regras de negócio.
- Execute os testes e verificações disponíveis após cada alteração relevante.
- Mantenha o `README.md` e os documentos em `docs/` coerentes com o comportamento implementado.
- Nunca versionar segredos. Use variáveis de ambiente e mantenha um `.env.example` sem valores reais quando necessário.

## Entrega

- Ao concluir uma tarefa, resuma o que mudou, como foi validado e quais decisões ainda estão pendentes.
- Não faça deploy, publicação, envio de dados ou integração bancária sem autorização explícita do usuário.
