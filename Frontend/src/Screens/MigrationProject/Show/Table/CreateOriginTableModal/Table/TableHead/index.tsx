export default function TableHead() {
  return (
    <tr>
      <th className='px-4 py-3 text-left font-semibold text-gray-700 w-[40%]'>
        Nome da Coluna
      </th>
      <th className='px-4 py-3 text-left font-semibold text-gray-700 w-[30%]'>
        Tipo
      </th>
      <th className='px-4 py-3 text-center font-semibold text-gray-700 w-[15%]'>
        Chave Primária
      </th>
      <th className='px-4 py-3 text-center font-semibold text-gray-700 w-[15%]'>
        Chave Natural
      </th>
      <th className='px-4 py-3 text-center font-semibold text-gray-700 w-[15%]'>
        Ações
      </th>
    </tr>
  );
}
