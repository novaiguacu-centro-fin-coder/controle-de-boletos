// Executado dentro do INSERT: verificação e escrita são atômicas.
// Argumentos: situação candidata e chave de duplicidade.
export const IMPORT_STATUS_SQL = `CASE
  WHEN ? = 'EXCECAO' THEN 'EXCECAO'
  WHEN EXISTS (SELECT 1 FROM payments WHERE duplicate_key = ?
    AND status IN ('VALIDADO', 'LIBERADO', 'BAIXADO')) THEN 'DUPLICADO'
  ELSE 'VALIDADO'
END`;
