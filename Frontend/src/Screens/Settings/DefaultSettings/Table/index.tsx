import { Edit, Trash2 } from 'lucide-react';

export default function Table({ columns, handleEditRow, deleteRow }) {
  return (
    <div className='overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gradient-to-r from-blue-50 to-blue-100'>
          <tr>
            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider'>
              Nome da Coluna
            </th>
            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider'>
              Tipo
            </th>
            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider'>
              Valor Padrão
            </th>
            <th className='px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider'>
              Ações
            </th>
          </tr>
        </thead>

        <tbody className='divide-y divide-gray-100'>
          {columns.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className='px-6 py-8 text-center text-gray-500 italic'
              >
                Nenhuma coluna configurada ainda
              </td>
            </tr>
          ) : (
            columns.map((col) => (
              <tr
                key={col.id}
                className='hover:bg-blue-50 transition-colors duration-150 text-left'
              >
                <td className='px-6 py-3 text-sm text-gray-800 font-medium'>
                  {col.column}
                </td>

                <td className='px-6 py-3 text-sm text-gray-700'>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      col.type === 'booleano'
                        ? 'bg-yellow-100 text-yellow-700'
                        : col.type === 'número'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {col.type}
                  </span>
                </td>

                <td className='px-6 py-3 text-sm text-gray-700'>
                  {col.value === 'true'
                    ? 'Verdadeiro'
                    : col.value === 'false'
                    ? 'Falso'
                    : col.value}
                </td>

                <td className='px-6 py-3 text-center'>
                  <div className='flex justify-center items-center gap-3'>
                    <button
                      onClick={() => handleEditRow(col.id)}
                      className='p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition'
                      title='Editar'
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => deleteRow(col.id)}
                      className='p-2 rounded-lg hover:bg-red-100 text-red-600 transition'
                      title='Excluir'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
