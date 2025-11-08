from sqlalchemy.orm import Session
from domain.entities.migration_project import MigrationProject
from interfaces.schemas.migration_project_schema import MigrationProjectCreate

class MigrationProjectRepository:
    def __init__(self, db: Session):
        self.db = db    
    
    def create(self, data: MigrationProjectCreate) -> MigrationProject:
        migration_project = MigrationProject(name=data.name, description=data.description)

        self.db.add(migration_project)
        self.db.commit()
        self.db.refresh(migration_project)
        return migration_project
    
    def list_migration_projects(self):
        # Quando tiver as outras informações, aprimorar essa query
        query = self.db.query(MigrationProject).order_by(MigrationProject.created_at)

        data = [
            {
                "id": r.id,
                "name": r.name,
                "description": r.description,
            }
            for r in query
        ]

        return data

    def update_migration_project(self, migration_project_id: int, data):
    # Busca o registro pelo ID
        migration_project = (
            self.db.query(MigrationProject)
            .filter(MigrationProject.id == migration_project_id)
            .first()
        )

        if not migration_project:
            return None  # Se não encontrou, retorna None

        # Converte o schema (ex: Pydantic) para dicionário, ignorando campos não informados
        update_data = data.dict(exclude_unset=True)

        # Aplica as alterações no objeto
        for key, value in update_data.items():
            setattr(migration_project, key, value)

        # Confirma a transação e recarrega o objeto atualizado
        self.db.commit()
        self.db.refresh(migration_project)

        return migration_project
        
    def get_by_id(self, migration_project_id: int) -> MigrationProject:
        return self.db.query(MigrationProject).filter(MigrationProject.id == migration_project_id).first()
    
    def delete_migration_project(self, migration_project_id: int):
        migration_project = self.db.query(MigrationProject).filter(MigrationProject.id == migration_project_id).first()

        if not migration_project:
            return False
        
        self.db.delete(migration_project)
        self.db.commit()

        return True