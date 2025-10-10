import { Edit, Trash2 } from 'lucide-react';

export default function Table({ data, handleEdit, handleDelete }) {
  return (
    <div className='overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gradient-to-r from-blue-50 to-blue-100'>
          <tr>
            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider'>
              Nome
            </th>
            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider'>
              Tipo Base
            </th>
            <th className='px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider'>
              Ações
            </th>
          </tr>
        </thead>

        <tbody className='divide-y divide-gray-100'>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className='px-6 py-8 text-center text-gray-500 italic'
              >
                Nenhum tipo de dado configurado ainda.
              </td>
            </tr>
          ) : (
            data.map((type) => (
              <tr
                key={type.id}
                className='hover:bg-blue-50 transition-colors duration-150 text-left'
              >
                <td className='px-6 py-3 text-sm text-gray-800 font-medium'>
                  {type.name}
                </td>

                <td className='px-6 py-3 text-sm text-gray-700'>
                  <span className='px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700'>
                    {type.baseType}
                  </span>
                </td>

                <td className='px-6 py-3 text-center'>
                  <div className='flex justify-center items-center gap-3'>
                    <button
                      onClick={() => handleEdit(type)}
                      className='p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition'
                      title='Editar'
                    >
                      <Edit className='w-4 h-4' />
                    </button>

                    <button
                      onClick={() => handleDelete(type.id)}
                      className='p-2 rounded-lg hover:bg-red-100 text-red-600 transition'
                      title='Excluir'
                    >
                      <Trash2 className='w-4 h-4' />
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
