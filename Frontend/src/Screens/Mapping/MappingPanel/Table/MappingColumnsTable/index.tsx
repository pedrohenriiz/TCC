import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useMigrationProjectMappingDelete } from '../../../../../hooks/migrationProjectMappings/useMigrationProjectMappingDelete';
import ConfirmModal from '../../../../../components/ConfirmModal';
import TableButton from '../../../../../components/TableButton';
import Chip from '../../../../../components/Chip';
import type { MappingDataProps } from '../../../types';

interface MappingColumnsTableProps {
  data: MappingDataProps[];
  migrationProjectId: string | undefined;
  handleSetEditingRow: (mapping?: MappingDataProps | null) => void;
}

export default function MappingColumnsTable({
  data,
  migrationProjectId,
  handleSetEditingRow,
}: MappingColumnsTableProps) {
  const deleteMutation = useMigrationProjectMappingDelete();

  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRow, setDeletingRow] = useState<{
    id: number;
    name?: string;
  } | null>(null);

  function toggleRow(id: number) {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function handleConfirmToDeleteRow() {
    if (deletingRow) {
      deleteMutation.mutate({
        id: deletingRow.id,
        migrationProjectId: Number(migrationProjectId),
      });
    }
  }

  function handleOpenDeleteModal(id: number, name: string) {
    setDeletingRow({ id, name });
    setShowDeleteModal(true);
  }

  const isExpanded = (id: number) => expandedRows.has(id);

  return (
    <div className='w-full bg-white border border-gray-200 overflow-hidden'>
      {/* Header da Tabela */}
      <div className='bg-gray-50 border-b border-gray-200'>
        <div className='grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide'>
          <div className='col-span-5 text-left'>Nome do Mapeamento</div>
          <div className='col-span-2'>Status</div>
          <div className='col-span-2 text-center'>Colunas</div>
          <div className='col-span-3 text-right'>Ações</div>
        </div>
      </div>

      {/* Body da Tabela */}
      <div className='divide-y divide-gray-200'>
        {data?.map((mapping) => (
          <React.Fragment key={mapping.id}>
            {/* Linha Principal */}
            <div className='hover:bg-gray-50 transition-colors'>
              <div className='grid grid-cols-12 gap-4 px-4 py-4 items-center'>
                {/* Nome com botão expandir */}
                <div className='col-span-5 flex items-center gap-2'>
                  <button
                    onClick={() => toggleRow(mapping.id)}
                    className='p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0'
                  >
                    {isExpanded(mapping.id) ? (
                      <ChevronDown className='w-4 h-4 text-gray-600' />
                    ) : (
                      <ChevronRight className='w-4 h-4 text-gray-600' />
                    )}
                  </button>
                  <span className='font-semibold text-gray-900 truncate'>
                    {mapping.name}
                  </span>
                </div>

                {/* Status */}
                <div className='col-span-2'>
                  {mapping.status === 'COMPLETE' ? (
                    <Chip
                      Icon={<Check className='w-3 h-3' />}
                      iconPosition='left'
                      text='Completo'
                      color='green'
                    />
                  ) : (
                    <Chip
                      Icon={<AlertCircle className='w-3 h-3' />}
                      iconPosition='left'
                      text='Incompleto'
                      color='yellow'
                    />
                  )}
                </div>

                {/* Quantidade de Colunas */}
                <div className='col-span-2 text-center'>
                  <span className='inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold'>
                    {mapping.columns?.length || 0}
                  </span>
                </div>

                {/* Ações */}
                <div className='col-span-3 flex items-center justify-end gap-2'>
                  <TableButton
                    Icon={<Eye className='w-4 h-4' />}
                    variant='view'
                    onClick={() => {
                      handleSetEditingRow(mapping);
                    }}
                    title='Visualizar mapeamento'
                  />

                  <TableButton
                    Icon={<Trash2 className='w-4 h-4' />}
                    variant='delete'
                    onClick={() => {
                      handleOpenDeleteModal(mapping.id, mapping.name);
                    }}
                    title='Excluir mapeamento'
                  />
                </div>
              </div>
            </div>

            {/* Linhas Expandidas (Detalhes das Colunas) */}
            {isExpanded(mapping.id) && (
              <div className='bg-gray-50'>
                <div className='px-4 py-3'>
                  <div className='space-y-2'>
                    <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3'>
                      Mapeamentos de Colunas
                    </div>

                    {/* Tabela interna de colunas */}
                    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                      {/* Header da tabela interna */}
                      <div className='bg-gray-100 border-b border-gray-200 px-4 py-2'>
                        <div className='grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600'>
                          <div className='col-span-5'>Origem</div>
                          <div className='col-span-2 text-center'>→</div>
                          <div className='col-span-5'>Destino</div>
                        </div>
                      </div>

                      {/* Linhas das colunas */}
                      <div className='divide-y divide-gray-200'>
                        {mapping.columns &&
                          mapping.columns.map((cm, idx) => (
                            <div
                              key={idx}
                              className='px-4 py-3 hover:bg-gray-50 transition-colors'
                            >
                              <div className='grid grid-cols-12 gap-4 items-center'>
                                {/* Origem */}
                                <div className='col-span-5'>
                                  <span className='inline-block px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-mono text-xs'>
                                    {cm.origin_table.name}.
                                    {cm.origin_column.name}
                                  </span>
                                </div>

                                {/* Seta */}
                                <div className='col-span-2 flex justify-center'>
                                  <ArrowRight className='w-4 h-4 text-gray-400' />
                                </div>

                                {/* Destino */}
                                <div className='col-span-5'>
                                  <span className='inline-block px-3 py-1.5 bg-green-50 text-green-700 rounded-md font-mono text-xs'>
                                    {cm.destiny_table.name}.
                                    {cm.destiny_column.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Footer com totais */}
      <div className='bg-gray-50 border-t border-gray-200 px-4 py-3'>
        <p className='text-xs text-gray-600'>
          Total: <span className='font-semibold'>{data?.length}</span>{' '}
          mapeamento(s) |
          <span className='ml-2'>
            {data?.reduce((acc, m) => {
              if (m.columns) {
                return acc + m.columns?.length;
              }

              return acc + 0;
            }, 0)}{' '}
            coluna(s) mapeada(s)
          </span>
        </p>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmToDeleteRow}
          title='Confirmar Exclusão'
          message='Tem certeza que deseja excluir a tabela de origem?'
          confirmText='Excluir'
          variant='danger'
          icon={<Trash2 className='w-6 h-6' />}
          warningMessage='⚠️ Esta ação irá excluir a tabela de origem e todas as configurações associadas (colunas mapeadas). Esta ação não pode ser desfeita.'
          details={
            <p className='font-semibold text-gray-800'>{deletingRow?.name}</p>
          }
        />
      )}
    </div>
  );
}
