export default function TableConfigForm() {
  return (
    <div className='grid grid-cols-2 gap-4 mb-6'>
      <div>
        <label className='block text-sm font-medium mb-2'>
          Nome da Tabela *
        </label>
        <input
          type='text'
          value={currentTable.name}
          onChange={(e) =>
            setCurrentTable({ ...currentTable, name: e.target.value })
          }
          placeholder='ex: cliente'
          className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
        />
      </div>
      <div>
        <label className='block text-sm font-medium mb-2'>
          Nome de Exibição
        </label>
        <input
          type='text'
          value={currentTable.displayName}
          onChange={(e) =>
            setCurrentTable({
              ...currentTable,
              displayName: e.target.value,
            })
          }
          placeholder='ex: Clientes'
          className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
        />
      </div>
    </div>
  );
}
