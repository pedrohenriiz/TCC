// pages/ProjectsList.jsx
import React, { useState } from 'react';
import { Plus, Folder, Trash2, Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useMigrationProjectStore from '../../../store/useMigrationProjectStore';
import Table from './Table';
import PageHeader from '../../../components/pageHeader';
import Header from './Header';
import ConfirmModal from '../../../components/ConfirmModal';

export default function ProjectsList() {
  const navigate = useNavigate();
  const { projects, deleteProject } = useMigrationProjectStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const statusConfig = {
    draft: {
      label: 'Rascunho',
      color: 'bg-gray-100 text-gray-700',
      icon: '📝',
    },
    configured: {
      label: 'Configurado',
      color: 'bg-blue-100 text-blue-700',
      icon: '⚙️',
    },
    in_progress: {
      label: 'Em Progresso',
      color: 'bg-yellow-100 text-yellow-700',
      icon: '⏳',
    },
    completed: {
      label: 'Concluído',
      color: 'bg-green-100 text-green-700',
      icon: '✅',
    },
    failed: { label: 'Falhou', color: 'bg-red-100 text-red-700', icon: '❌' },
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewProject = () => {
    navigate('/migration-project/new');
  };

  const handleView = (project) => {
    navigate(`/migration-project/${project.id}`);
  };

  const handleDelete = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='space-y-6'>
      <div className='mx-auto'>
        <Header />

        <Table handleDelete={handleDelete} handleView={handleView} />
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title='Confirmar Exclusão'
          message='Tem certeza que deseja excluir o projeto:'
          confirmText='Excluir Projeto'
          variant='danger'
          icon={<Trash2 className='w-6 h-6' />}
          warningMessage='⚠️ Esta ação irá excluir o projeto e todas as configurações associadas (tabelas de origem, mapeamentos, etc). Esta ação não pode ser desfeita.'
          details={
            <p className='font-semibold text-gray-800'>
              {projectToDelete?.name}
            </p>
          }
        />
      )}
    </div>
  );
}
