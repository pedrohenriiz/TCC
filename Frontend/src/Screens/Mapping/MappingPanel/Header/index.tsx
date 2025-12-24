export default function PanelHeader() {
  return (
    <div className='px-4 py-3 border-b border-gray-200 bg-gray-50 text-left'>
      <h2 className='text-sm font-semibold text-gray-900 '>
        Mapeamentos Configurados
      </h2>
      <p className='text-xs text-gray-600 mt-0.5'>
        Cada mapeamento pode relacionar múltiplas tabelas de origem e destino
      </p>
    </div>
  );
}
