import {
  ArrowRight,
  Save,
  Plus,
  Trash2,
  Link2,
  AlertCircle,
  Check,
  Eye,
} from 'lucide-react';
import { useState } from 'react';
import CreateMappingModal from './MappingModal';

export default function MappingPageLayout() {
  const [openModal, setOpenModal] = useState(false);

  // Dados mockados
  const sourceTables = [
    {
      id: 1,
      name: 'clientes_antigos',
      columns: [
        { id: 1, name: 'id_cliente', type: 'number' },
        { id: 2, name: 'nome_completo', type: 'text' },
        { id: 3, name: 'email', type: 'text' },
        { id: 4, name: 'telefone', type: 'text' },
        { id: 5, name: 'celular', type: 'text' },
      ],
    },
    {
      id: 2,
      name: 'enderecos',
      columns: [
        { id: 6, name: 'id_cliente', type: 'number' },
        { id: 7, name: 'rua', type: 'text' },
        { id: 8, name: 'numero', type: 'text' },
        { id: 9, name: 'cidade', type: 'text' },
      ],
    },
  ];

  const destinationTables = [
    {
      id: 1,
      name: 'customers',
      columns: [
        { id: 1, name: 'customer_id', type: 'number', required: true },
        { id: 2, name: 'full_name', type: 'text', required: true },
        { id: 3, name: 'email', type: 'text', required: true },
      ],
    },
    {
      id: 2,
      name: 'phones',
      columns: [
        { id: 4, name: 'customer_id', type: 'number', required: true },
        { id: 5, name: 'phone_number', type: 'text', required: true },
        { id: 6, name: 'phone_type', type: 'text', required: true },
      ],
    },
    {
      id: 3,
      name: 'addresses',
      columns: [
        { id: 7, name: 'customer_id', type: 'number', required: true },
        { id: 8, name: 'street', type: 'text', required: true },
        { id: 9, name: 'number', type: 'text', required: false },
        { id: 10, name: 'city', type: 'text', required: true },
      ],
    },
  ];

  // Mapeamentos configurados (array de mapeamentos)
  const [mappings, setMappings] = useState([
    {
      id: 1,
      name: 'Clientes → Customers',
      columnMappings: [
        {
          sourceTable: 'clientes_antigos',
          sourceColumn: 'id_cliente',
          destTable: 'customers',
          destColumn: 'customer_id',
        },
        {
          sourceTable: 'clientes_antigos',
          sourceColumn: 'nome_completo',
          destTable: 'customers',
          destColumn: 'full_name',
        },
        {
          sourceTable: 'clientes_antigos',
          sourceColumn: 'email',
          destTable: 'customers',
          destColumn: 'email',
        },
      ],
      status: 'complete',
    },
    {
      id: 2,
      name: 'Telefones → Phones',
      columnMappings: [
        {
          sourceTable: 'clientes_antigos',
          sourceColumn: 'id_cliente',
          destTable: 'phones',
          destColumn: 'customer_id',
        },
        {
          sourceTable: 'clientes_antigos',
          sourceColumn: 'telefone',
          destTable: 'phones',
          destColumn: 'phone_number',
        },
      ],
      status: 'incomplete',
    },
  ]);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                Configurar Mapeamento
              </h1>
              <p className='text-xs text-gray-600 mt-0.5'>
                Configure o relacionamento entre origens e destinos
              </p>
            </div>

            <button
              className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm'
              onClick={() => setOpenModal(true)}
            >
              <Plus className='w-4 h-4' />
              Novo Mapeamento
            </button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-6'>
        {/* Cards de Resumo */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          <div className='bg-white rounded-lg border border-gray-200 p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Link2 className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <p className='text-xs text-gray-600'>Origens</p>
                <p className='text-xl font-bold text-gray-900'>
                  {sourceTables.length}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                <Check className='w-5 h-5 text-green-600' />
              </div>
              <div>
                <p className='text-xs text-gray-600'>Destinos</p>
                <p className='text-xl font-bold text-gray-900'>
                  {destinationTables.length}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                <ArrowRight className='w-5 h-5 text-purple-600' />
              </div>
              <div>
                <p className='text-xs text-gray-600'>Mapeamentos</p>
                <p className='text-xl font-bold text-gray-900'>
                  {mappings.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Mapeamentos */}
        <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
          <div className='px-4 py-3 border-b border-gray-200 bg-gray-50'>
            <h2 className='text-sm font-semibold text-gray-900'>
              Mapeamentos Configurados
            </h2>
            <p className='text-xs text-gray-600 mt-0.5'>
              Cada mapeamento pode relacionar múltiplas tabelas de origem e
              destino
            </p>
          </div>

          <div className='divide-y divide-gray-200'>
            {mappings.map((mapping) => (
              <div key={mapping.id} className='p-4 hover:bg-gray-50 transition'>
                <div className='flex items-start justify-between'>
                  {/* Info do Mapeamento */}
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-3'>
                      <h3 className='font-semibold text-gray-900'>
                        {mapping.name}
                      </h3>
                      {mapping.status === 'complete' ? (
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium'>
                          <Check className='w-3 h-3' />
                          Completo
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium'>
                          <AlertCircle className='w-3 h-3' />
                          Incompleto
                        </span>
                      )}
                    </div>

                    {/* Lista de Mapeamentos de Colunas */}
                    <div className='space-y-1.5'>
                      {mapping.columnMappings.map((cm, idx) => (
                        <div
                          key={idx}
                          className='flex items-center gap-2 text-xs'
                        >
                          <span className='px-2 py-1 bg-blue-50 text-blue-700 rounded font-mono'>
                            {cm.sourceTable}.{cm.sourceColumn}
                          </span>
                          <ArrowRight className='w-3 h-3 text-gray-400' />
                          <span className='px-2 py-1 bg-green-50 text-green-700 rounded font-mono'>
                            {cm.destTable}.{cm.destColumn}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className='text-xs text-gray-500 mt-2'>
                      {mapping.columnMappings.length} coluna(s) mapeada(s)
                    </p>
                  </div>

                  {/* Ações */}
                  <div className='flex items-center gap-2 ml-4'>
                    <button
                      className='p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition'
                      title='Editar mapeamento'
                    >
                      <Eye className='w-4 h-4' />
                    </button>
                    <button
                      className='p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition'
                      title='Excluir mapeamento'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {mappings.length === 0 && (
              <div className='flex flex-col items-center justify-center py-12 px-6 text-center'>
                <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                  <Link2 className='w-8 h-8 text-blue-600' />
                </div>
                <h3 className='text-base font-semibold text-gray-900 mb-1'>
                  Nenhum mapeamento criado
                </h3>
                <p className='text-xs text-gray-600 max-w-sm mb-4'>
                  Crie seu primeiro mapeamento para relacionar colunas entre
                  origens e destinos
                </p>
                <button className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm'>
                  <Plus className='w-4 h-4' />
                  Criar Primeiro Mapeamento
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Seção de Ajuda */}
        <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='flex gap-3'>
            <div className='flex-shrink-0'>
              <AlertCircle className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h4 className='text-sm font-semibold text-blue-900 mb-1'>
                Como funciona o mapeamento flexível?
              </h4>
              <ul className='text-xs text-blue-800 space-y-1'>
                <li>
                  • <strong>1 origem → 1 destino:</strong> Exemplo: clientes →
                  customers
                </li>
                <li>
                  • <strong>1 origem → N destinos:</strong> Exemplo: clientes →
                  customers + phones
                </li>
                <li>
                  • <strong>N origens → 1 destino:</strong> Exemplo: clientes +
                  enderecos → customers_full
                </li>
                <li>
                  • <strong>N origens → N destinos:</strong> Cenários complexos
                  de migração
                </li>
              </ul>
            </div>
          </div>
        </div>
        {openModal && (
          <CreateMappingModal
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            projectId={123}
            transformation={{
              config: '',
              type: 'split',
            }}
          />
        )}
      </div>
    </div>
  );
}
