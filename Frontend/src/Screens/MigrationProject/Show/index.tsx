// pages/ProjectForm.jsx
import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Folder } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import useMigrationProjectStore from '../../../store/useMigrationProjectStore';

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addProject, updateProject, getProjectById } =
    useMigrationProjectStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  // Carregar projeto se estiver editando
  useEffect(() => {
    if (id && id !== 'new') {
      const project = getProjectById(parseInt(id));
      if (project) {
        setFormData({
          name: project.name,
          description: project.description,
        });
      } else {
        navigate('/migration-projects');
      }
    }
  }, [id, getProjectById, navigate]);

  // Validar formulário
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do projeto é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Descrição deve ter no mínimo 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar projeto
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (id === 'new') {
      // Criar novo projeto
      const newProject = addProject(formData);
      alert('Projeto criado com sucesso!');
      navigate(`/migration-project/${newProject.id}/source-tables`);
    } else {
      // Atualizar projeto existente
      updateProject(parseInt(id), formData);
      alert('Projeto atualizado com sucesso!');
      navigate(`/migration-project/${id}`);
    }
  };

  const handleCancel = () => {
    navigate('/migration-projects');
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          <div className='flex items-center gap-3 mb-4'>
            <button
              onClick={handleCancel}
              className='p-2 hover:bg-gray-100 rounded-lg transition'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
            <Folder className='w-8 h-8 text-blue-600' />
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>
                {id === 'new' ? 'Novo Projeto de Migração' : 'Editar Projeto'}
              </h1>
              <p className='text-gray-600 text-sm'>
                {id === 'new'
                  ? 'Crie um novo projeto para organizar sua migração de dados'
                  : 'Atualize as informações do projeto'}
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className='bg-white rounded-lg shadow-lg p-6'
        >
          <div className='space-y-6'>
            {/* Nome do Projeto */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Nome do Projeto *
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='Ex: Migração Cliente ABC'
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
              )}
              <p className='mt-1 text-sm text-gray-500'>
                Escolha um nome descritivo para identificar facilmente este
                projeto
              </p>
            </div>

            {/* Descrição */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Ex: Migração do sistema legado para o novo banco de dados. Inclui dados de clientes, pedidos e produtos do período de 2020 a 2024.'
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.description}
                </p>
              )}
              <p className='mt-1 text-sm text-gray-500'>
                Descreva o objetivo e escopo desta migração
              </p>
            </div>

            {/* Informações Adicionais */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <h3 className='font-semibold text-blue-900 mb-2'>
                📝 Próximos Passos
              </h3>
              <p className='text-sm text-blue-800'>
                Após criar o projeto, você poderá:
              </p>
              <ul className='mt-2 text-sm text-blue-800 space-y-1 list-disc list-inside'>
                <li>Fazer upload de arquivos Excel com os dados de origem</li>
                <li>Configurar manualmente as tabelas de origem</li>
                <li>Definir o mapeamento entre origem e destino</li>
                <li>Executar a migração dos dados</li>
              </ul>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className='flex items-center justify-between mt-8 pt-6 border-t'>
            <button
              type='button'
              onClick={handleCancel}
              className='px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition'
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold transition'
            >
              <Save className='w-5 h-5' />
              {id === 'new' ? 'Criar Projeto' : 'Salvar Alterações'}
            </button>
          </div>
        </form>

        {/* Dica */}
        {id === 'new' && (
          <div className='mt-6 bg-white rounded-lg shadow-lg p-4'>
            <div className='flex items-start gap-3'>
              <span className='text-2xl'>💡</span>
              <div>
                <h3 className='font-semibold text-gray-800 mb-1'>Dica</h3>
                <p className='text-sm text-gray-600'>
                  Você pode criar vários projetos para organizar diferentes
                  migrações. Cada projeto pode ter suas próprias configurações
                  de origem, destino e mapeamentos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
