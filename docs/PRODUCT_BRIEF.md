# Documento do produto — Controle de Boletos

## Objetivo

Receber diariamente relatórios bancários, normalizar pagamentos, identificar duplicidades, aplicar a dedução correta e liberar para cada operador apenas os pagamentos da sua clínica.

Fluxo: importação → validação → duplicidade → regra → liberação → consulta por unidade → impressão → histórico.

## Perfis

- **Administrador:** todas as unidades, valores compensados/deduções, importações, liberações, regras, cadastros, exportações e auditoria.
- **Operador:** uma unidade obrigatória, filtros por período/forma/nome/documento e somente o valor a baixar. O backend nunca envia valor original, dedução, regra ou outra unidade.

## Regras financeiras

Valores são normalizados para centavos inteiros. Regras são configuráveis por valor, forma, unidade, plano e vigência. As regras iniciais globais são:

- R$ 60,00 − R$ 30,00 = R$ 30,00;
- R$ 149,00 − R$ 30,00 = R$ 119,00.

Por confirmação do usuário, ambas valem para boleto, PIX e cartão. Uma regra futura restrita por forma continua sendo suportada pelo cadastro.

## Dados e estados

O banco guarda usuários, unidades, sessões, pagamentos, regras, lotes e auditoria. Pagamentos passam por `VALIDADO`, `DUPLICADO`, `EXCECAO`, `LIBERADO` e `BAIXADO`; duplicados nunca são liberados automaticamente.

## Base existente

O importador reconhece CSV/XLSX e os cabeçalhos do arquivo analisado, sem depender da quantidade atual de linhas. A cópia histórica deve ser enviada pelo administrador depois da configuração inicial.
