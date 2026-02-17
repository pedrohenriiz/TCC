import * as Yup from 'yup';

export const originTableValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Nome da tabela é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  columns: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.mixed().required(),
        name: Yup.string()
          .trim()
          .required('Nome da coluna é obrigatório')
          .min(1, 'Nome da coluna não pode estar vazio')
          .max(64, 'Nome da coluna deve ter no máximo 64 caracteres'),
        type: Yup.string()
          .required('Tipo é obrigatório')
          .oneOf(['text', 'number', 'date', 'boolean'], 'Tipo inválido'),
        is_natural_key: Yup.boolean(),
      }),
    )
    .min(1, 'A tabela deve ter pelo menos uma coluna')
    .test(
      'unique-column-names',
      'Nomes de colunas devem ser únicos',
      function (columns) {
        if (!columns || columns.length === 0) return true;
        const names = columns
          .map((col) => col.name?.trim().toLowerCase())
          .filter(Boolean);
        return names.length === new Set(names).size;
      },
    ),

  is_pk: Yup.mixed()
    .required('Selecione uma coluna como Primary Key')
    .test(
      'pk-exists',
      'A Primary Key selecionada não existe nas colunas',
      function (value) {
        if (!value) return false;
        const { columns } = this.parent;
        if (!columns || columns.length === 0) return false;
        return columns.some((col: any) => col.id === value);
      },
    ),
});
