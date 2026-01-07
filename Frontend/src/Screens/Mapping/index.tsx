import { MapPin, Goal, Map, Plus, Send } from 'lucide-react';
import { useState } from 'react';
import CreateMappingModal from './NewMappingModal';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMigrationProjectMappings } from '../../services/migrationProjectMappings/getMigrationProjectMappings';
import HeaderCard from './HeaderCard';
import { getTableConfigs } from '../../services/tableConfigs/getTableConfigs';
import { getUniqueMigrationProject } from '../../services/migrationProjects/getUniqueMigrationProject';
import MappingPanel from './MappingPanel';
import PagetTitle from '../../components/PageTitle';
import CustomHeader from '../../components/CustomHeader';
import type { MappingDataProps } from './types';
import ConfirmButton from '../../components/ConfirmButton';
import { createMigration } from '../../services/migration/createMigration';

export default function MappingPageLayout() {
  const { id } = useParams<{ id: string }>();
  const [openModal, setOpenModal] = useState(false);
  const [editingRow, setEditingRow] = useState<MappingDataProps | null>(null);

  const { data } = useQuery({
    queryKey: ['mappings', id],
    queryFn: () => getMigrationProjectMappings(Number(id)),
    enabled: Boolean(id),
  });

  const { data: tableConfigs } = useQuery({
    queryKey: ['tableConfigs'],
    queryFn: () =>
      getTableConfigs({
        params: {
          with_columns: true,
        },
      }),
    enabled: Boolean(id),
  });

  const { data: originTables } = useQuery({
    queryKey: ['migrationProjectMappings'],
    queryFn: () => getUniqueMigrationProject(Number(id)),
    enabled: Boolean(id),
  });

  const totalColumns = data?.reduce(
    (acc, item) => acc + item.columns.length,
    0
  );

  const totalOriginColumns = data?.reduce(
    (acc, item) => acc + item.columns.filter((c) => c.origin_column).length,
    0
  );

  const totalDestinyColumns = data?.reduce(
    (acc, item) => acc + item.columns.filter((c) => c.destiny_column).length,
    0
  );

  function handleOpenModal() {
    setOpenModal(true);
  }
  function handleOpenEditMapping(mapping?: MappingDataProps | null = null) {
    setEditingRow(mapping);
    setOpenModal(true);
  }

  const cardHeaderData = [
    {
      label: 'Origens',
      value: totalOriginColumns,
      color: 'bg-blue-100',
      Icon: <MapPin className='w-5 h-5 text-blue-600' />,
    },
    {
      label: 'Destinos',
      value: totalDestinyColumns,
      color: 'bg-green-100',
      Icon: <Goal className='w-5 h-5 text-green-600' />,
    },
    {
      label: 'Mapeamentos',
      value: totalColumns,
      color: 'bg-purple-100',
      Icon: <Map className='w-5 h-5 text-purple-600' />,
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <PagetTitle title='Migrare - Configurar Mapeamento' />

      <CustomHeader
        title={'Configurar Mapeamento'}
        subtitle='Configure o relacionamento entre origens e destinos'
        buttonProps={{
          Icon: <Plus className='w-4 h-4' />,
          onClick: handleOpenModal,
          iconPosition: 'left',
          text: 'Novo Mapeamento',
        }}
      />

      <div className='max-w-6xl mx-auto py-6'>
        <div className='grid grid-cols-3 gap-4 mb-6'>
          {cardHeaderData.map((data) => {
            return <HeaderCard key={data.label} {...data} />;
          })}
        </div>

        <MappingPanel
          data={data}
          id={id}
          onOpenEditing={handleOpenEditMapping}
        />

        <ConfirmButton
          Icon={<Send className='w-4 h-4' />}
          iconPosition='left'
          text='Iniciar migração'
          onClick={async () => {
            if (id) createMigration({ migration_project_id: id });
          }}
        />

        <ConfirmButton
          Icon={<Plus className='w-4 h-4' />}
          iconPosition='left'
          text='Criar Primeiro Mapeamento'
          onClick={() => handleOpenEditMapping()}
        />

        {openModal && (
          <CreateMappingModal
            isOpen={openModal}
            onClose={() => {
              setEditingRow(null);
              setOpenModal(false);
            }}
            originData={originTables.origin_tables}
            migrationProjectId={id}
            destinyData={tableConfigs}
            transformation={{
              config: '',
              type: 'split',
            }}
            data={editingRow}
          />
        )}
      </div>
    </div>
  );
}
