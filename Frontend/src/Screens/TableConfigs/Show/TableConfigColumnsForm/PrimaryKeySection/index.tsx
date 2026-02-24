import { Field } from 'formik';
import { Zap } from 'lucide-react';
import type { FormProps } from '../../types';

interface PrimaryKeySectionProps {
  index: number;
  formik: FormProps;
}

export default function PrimaryKeySection({
  index,
  formik,
}: PrimaryKeySectionProps) {
  const idGenerationStrategies = [
    {
      value: 'keep',
      label: 'Mantém Original',
      description: 'Usa o ID atual',
    },
    {
      value: 'auto_increment',
      label: 'Auto Incremento',
      description: 'Gera IDs sequenciais',
    },
  ];

  const idStrategy =
    formik.values.columns[index].id_generation_strategy || 'keep';

  return (
    <div className='pt-4 border-t border-gray-200 mb-4'>
      <div className='flex items-center gap-2 mb-3'>
        <Zap size={16} className='text-purple-600' />
        <span className='text-sm font-medium text-gray-700'>Geração de ID</span>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-left text-xs font-medium text-gray-700 mb-1'>
            Estratégia
          </label>
          <Field
            as='select'
            name={`columns.${index}.id_generation_strategy`}
            className='w-full px-4 py-3 bg-white text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            {idGenerationStrategies.map((strategy) => (
              <option key={strategy.value} value={strategy.value}>
                {strategy.label}
              </option>
            ))}
          </Field>
          <p className='text-xs text-left text-gray-500 mt-1'>
            {
              idGenerationStrategies.find((s) => s.value === idStrategy)
                ?.description
            }
          </p>
        </div>

        <div>
          <label className='block text-left text-xs font-medium text-gray-700 mb-1'>
            Valor Inicial
            {idStrategy === 'auto_increment' && (
              <span className='text-blue-600'> (recomendado)</span>
            )}
          </label>
          <Field
            name={`columns.${index}.id_start_value`}
            placeholder='1'
            type='number'
            min='1'
            disabled={idStrategy !== 'auto_increment'}
            className={`w-full px-4 py-3 bg-white text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              idStrategy !== 'auto_increment'
                ? 'bg-gray-100 cursor-not-allowed border-gray-300'
                : 'border-gray-300'
            }`}
          />
          <p className='text-xs text-left text-gray-500 mt-1'>
            {idStrategy === 'auto_increment'
              ? 'IDs começarão deste valor'
              : 'Usado apenas com Auto Increment'}
          </p>
        </div>
      </div>
    </div>
  );
}
