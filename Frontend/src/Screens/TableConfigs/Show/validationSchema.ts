import * as Yup from 'yup';

export const tableConfigValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Nome da tabela é obrigatório')
    .matches(
      /^[a-z][a-z0-9_]*$/,
      'Nome deve começar com letra minúscula e conter apenas letras minúsculas, números e underscore',
    )
    .max(64, 'Nome da tabela deve ter no máximo 64 caracteres'),

  exhibition_name: Yup.string()
    .required('Nome de exibição é obrigatório')
    .max(100, 'Nome de exibição deve ter no máximo 100 caracteres'),

  columns: Yup.array()
    .of(
      Yup.object()
        .shape({
          name: Yup.string()
            .required('Nome da coluna é obrigatório')
            .matches(
              /^[a-z][a-z0-9_]*$/,
              'Nome deve começar com letra minúscula e conter apenas letras minúsculas, números e underscore',
            )
            .max(64, 'Nome da coluna deve ter no máximo 64 caracteres'),

          type: Yup.string()
            .required('Tipo de dado é obrigatório')
            .oneOf(
              [
                'VARCHAR',
                'INT',
                'BIGINT',
                'TEXT',
                'DATE',
                'DATETIME',
                'BOOLEAN',
                'DECIMAL',
                'FLOAT',
              ],
              'Tipo de dado inválido',
            ),

          size: Yup.number()
            .nullable()
            .when('type', {
              is: (type: string) => ['VARCHAR', 'DECIMAL'].includes(type),
              then: (schema) =>
                schema
                  .required('Tamanho é obrigatório para VARCHAR e DECIMAL')
                  .positive('Tamanho deve ser um número positivo')
                  .integer('Tamanho deve ser um número inteiro')
                  .max(65535, 'Tamanho máximo é 65535'),
              otherwise: (schema) =>
                schema.when('type', {
                  is: (type: string) =>
                    !['TEXT', 'DATE', 'DATETIME', 'BOOLEAN'].includes(type),
                  then: (schema) =>
                    schema
                      .positive('Tamanho deve ser um número positivo')
                      .integer('Tamanho deve ser um número inteiro')
                      .max(65535, 'Tamanho máximo é 65535'),
                }),
            }),

          is_pk: Yup.boolean(),

          is_nullable: Yup.boolean(),

          foreign_table_id: Yup.number().nullable(),

          foreign_column_id: Yup.number().nullable(),
        })
        .test(
          'foreign-key-consistency',
          'Ao configurar Foreign Key, ambos tabela e coluna devem ser preenchidos',
          function (value) {
            const { foreign_table_id, foreign_column_id } = value || {};

            // Se um está preenchido, o outro também deve estar
            const tableSelected =
              foreign_table_id !== null &&
              foreign_table_id !== '' &&
              foreign_table_id !== undefined;
            const columnSelected =
              foreign_column_id !== null &&
              foreign_column_id !== '' &&
              foreign_column_id !== undefined;

            // Se apenas um dos dois foi preenchido, é erro
            if (tableSelected && !columnSelected) {
              return this.createError({
                path: `${this.path}.foreign_column_id`,
                message: 'Selecione a coluna referenciada',
              });
            }

            if (columnSelected && !tableSelected) {
              return this.createError({
                path: `${this.path}.foreign_table_id`,
                message: 'Selecione a tabela referenciada',
              });
            }

            return true;
          },
        ),
    )
    .min(1, 'A tabela deve ter pelo menos uma coluna')
    .test(
      'at-least-one-pk',
      'A tabela deve ter pelo menos uma coluna como Primary Key',
      function (columns) {
        if (!columns || columns.length === 0) return false;
        return columns.some((col) => col.is_pk === true);
      },
    )
    .test(
      'unique-column-names',
      'Nomes de colunas devem ser únicos',
      function (columns) {
        if (!columns || columns.length === 0) return true;
        const names = columns
          .map((col) => col.name?.toLowerCase())
          .filter(Boolean);
        return names.length === new Set(names).size;
      },
    ),
});
