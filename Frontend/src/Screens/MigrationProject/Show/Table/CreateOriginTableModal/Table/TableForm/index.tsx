import { Trash2 } from 'lucide-react';
import Textfield from '../../../../../../../components/Inputs/Textfield';
import Select from '../../../../../../../components/Inputs/Select';
import Radio from '../../../../../../../components/Inputs/Radio';
import Checkbox from '../../../../../../../components/Inputs/Checkbox';
import TableButton from '../../../../../../../components/TableButton';

export default function TableForm({ formik }) {
  const handleRemoveColumn = (id?: number) => {
    const newColumns = formik.values.columns.filter((c) => c.id !== id);

    if (formik.values.is_pk === id) {
      formik.setFieldValue('primaryKey', '');
    }

    formik.setFieldValue('columns', newColumns);
  };

  return formik.values.columns.map((column) => (
    <tr
      key={column.id}
      className={`border-b border-gray-100 ${
        formik.values.is_pk === column.id ? 'bg-green-50' : 'hover:bg-gray-50'
      }`}
    >
      {/* Nome */}
      <td className='px-4 py-3'>
        <Textfield
          label=''
          name={`column-${column.id}`}
          placeholder='Ex: id, nome, email'
          formik={{
            values: { [`column-${column.id}`]: column.name },
            handleChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const newColumns = [...formik.values.columns];
              const index = newColumns.findIndex((c) => c.id === column.id);
              newColumns[index].name = e.target.value;
              formik.setFieldValue('columns', newColumns);
            },
            handleBlur: formik.handleBlur,
            touched: {},
            errors: {},
          }}
        />
      </td>

      {/* Tipo */}
      <td className='px-4 py-3'>
        <Select
          value={column.type}
          onChange={(value) => {
            const newColumns = [...formik.values.columns];
            const index = newColumns.findIndex((c) => c.id === column.id);
            newColumns[index].type = value;
            formik.setFieldValue('columns', newColumns);
          }}
          options={[
            { label: 'Texto', value: 'text' },
            { label: 'Número', value: 'number' },
            { label: 'Data', value: 'date' },
            { label: 'Booleano', value: 'boolean' },
          ]}
        />
      </td>

      {/* Primary Key */}
      <td className='px-4 py-3 text-center'>
        <Radio
          name='is_pk'
          value={column.id}
          checked={formik.values.is_pk === column.id}
          onChange={() => formik.setFieldValue('is_pk', column.id)}
          className='h-full justify-center'
        />
      </td>

      <td className='px-4 py-3 text-center'>
        <Checkbox
          name='is_natural_key'
          checked={column.is_natural_key}
          onChange={() => {
            const newColumns = [...formik.values.columns];
            const index = newColumns.findIndex((c) => c.id === column.id);
            newColumns[index].is_natural_key =
              !newColumns[index].is_natural_key;
            formik.setFieldValue('columns', newColumns);
          }}
          className='h-full justify-center'
        />
      </td>

      {/* Ações */}
      <td className='px-4 py-3 text-center'>
        <TableButton
          Icon={<Trash2 className='w-4 h-4' />}
          variant='delete'
          onClick={() => handleRemoveColumn(column.id)}
          title='Remover coluna'
        />
      </td>
    </tr>
  ));
}
