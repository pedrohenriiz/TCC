import { FieldArray } from 'formik';
import { Plus } from 'lucide-react';

export default function AddColumnsHeader({
  isLoading,
}: {
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className='flex items-center justify-between mb-4'>
        <div className='h-5 w-24 rounded skeleton-shimmer' />

        <div className='h-9 w-40 rounded-lg skeleton-shimmer' />
      </div>
    );
  }

  return (
    <div className='flex items-center justify-between mb-4'>
      <h3 className='font-semibold text-gray-900'>Colunas</h3>
      <FieldArray name='columns'>
        {({ push }) => (
          <button
            type='button'
            onClick={() =>
              push({
                id: Date.now(),
                name: '',
                type: 'VARCHAR',
                length: '',
                is_pk: false,
                is_nullable: true,
                foreign_table_id: null,
                foreign_column_id: null,
              })
            }
            className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-700 bg-blue-600 text-white text-sm'
          >
            <Plus className='w-4 h-4' /> Adicionar coluna
          </button>
        )}
      </FieldArray>
    </div>
  );
}
