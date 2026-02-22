import * as Yup from 'yup';
import type { ColumnForm } from './types/tableForm';
import { VALIDATION_MESSAGES } from './utils/validationMessages';

export const originTableValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required(VALIDATION_MESSAGES.TABLE_NAME_REQUIRED)
    .min(3, VALIDATION_MESSAGES.TABLE_NAME_MIN)
    .max(100, VALIDATION_MESSAGES.TABLE_NAME_MAX),

  columns: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.mixed().required(),
        name: Yup.string()
          .trim()
          .required(VALIDATION_MESSAGES.COLUMN_NAME_REQUIRED)
          .min(1, VALIDATION_MESSAGES.COLUMN_NAME_MIN)
          .max(64, VALIDATION_MESSAGES.COLUMN_NAME_MAX),
        type: Yup.string()
          .required(VALIDATION_MESSAGES.COLUMN_TYPE_REQUIRED)
          .oneOf(
            ['text', 'number', 'date', 'boolean'],
            VALIDATION_MESSAGES.COLUMN_TYPE_INVALID,
          ),
        is_natural_key: Yup.boolean(),
      }),
    )
    .min(1, VALIDATION_MESSAGES.COLUMN_MIN)
    .test(
      'unique-column-names',
      VALIDATION_MESSAGES.COLUMN_DUPLICATE,
      function (columns) {
        if (!columns || columns.length === 0) return true;
        const names = columns
          .map((col) => col.name?.trim().toLowerCase())
          .filter(Boolean);
        return names.length === new Set(names).size;
      },
    ),

  is_pk: Yup.mixed()
    .required(VALIDATION_MESSAGES.PK_REQUIRED)
    .test('pk-exists', VALIDATION_MESSAGES.PK_INVALID, function (value) {
      if (!value) return false;
      const { columns } = this.parent;
      if (!columns || columns.length === 0) return false;
      return columns.some((col: ColumnForm) => col.id === value);
    }),
});
