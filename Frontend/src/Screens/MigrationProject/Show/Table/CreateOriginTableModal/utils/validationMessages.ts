export const VALIDATION_MESSAGES = {
  TABLE_NAME_REQUIRED: 'Nome da tabela é obrigatório',
  TABLE_NAME_MIN: 'Nome deve ter no mínimo 3 caracteres',
  TABLE_NAME_MAX: 'Nome deve ter no máximo 100 caracteres',
  TABLE_NAME_DUPLICATE: 'Já existe uma tabela com esse nome',

  COLUMN_NAME_REQUIRED: 'Nome da coluna é obrigatório',
  COLUMN_NAME_MIN: 'Nome da coluna não pode estar vazio',
  COLUMN_NAME_MAX: 'Nome da coluna deve ter no máximo 64 caracteres',

  COLUMN_TYPE_REQUIRED: 'Tipo é obrigatório',
  COLUMN_TYPE_INVALID: 'Tipo inválido',

  COLUMN_MIN: 'A tabela deve ter pelo menos uma coluna',
  COLUMN_DUPLICATE: 'Nomes de colunas devem ser únicos',

  PK_REQUIRED: 'Selecione uma coluna como Primary Key',
  PK_INVALID: 'A Primary Key selecionada não existe nas colunas',
};
