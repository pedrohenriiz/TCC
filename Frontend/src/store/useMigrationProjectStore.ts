// store/useMigrationProjectStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMigrationProjectStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      projects: [],
      currentProject: null,

      // Adicionar novo projeto
      addProject: (project) => {
        const newProject = {
          id: Date.now(),
          ...project,
          status: 'draft', // draft, configured, in_progress, completed, failed
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));

        return newProject;
      },

      // Atualizar projeto
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : project
          ),
        }));
      },

      // Deletar projeto
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          currentProject:
            state.currentProject?.id === id ? null : state.currentProject,
        }));
      },

      // Buscar projeto por ID
      getProjectById: (id) => {
        return get().projects.find((project) => project.id === id);
      },

      // Definir projeto atual
      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      // Limpar projeto atual
      clearCurrentProject: () => {
        set({ currentProject: null });
      },

      // Limpar todos os projetos
      clearAllProjects: () => {
        set({ projects: [], currentProject: null });
      },

      // Buscar projetos por nome
      searchProjects: (searchTerm) => {
        const projects = get().projects;
        if (!searchTerm) return projects;

        return projects.filter(
          (project) =>
            project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      },

      // Atualizar status do projeto
      updateProjectStatus: (id, status) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : project
          ),
        }));
      },

      // Obter estatísticas
      getProjectStats: (id) => {
        const project = get().getProjectById(id);
        if (!project) return null;

        // Aqui você pode buscar stats de outras stores
        return {
          sourceTables: 0, // Buscar do useSourceTablesStore
          targetTables: 0, // Buscar do useTableConfigStore
          mappings: 0, // Buscar do useMappingStore
          totalRecords: 0,
        };
      },
    }),
    {
      name: 'migration-projects-storage',
      partialize: (state) => ({
        projects: state.projects,
      }),
    }
  )
);

export default useMigrationProjectStore;
