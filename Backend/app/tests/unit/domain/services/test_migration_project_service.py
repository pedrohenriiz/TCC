import pytest
from unittest.mock import Mock
from datetime import datetime
from sqlalchemy.orm import Session

from domain.services.migration_project_origin_table_service import MigrationProjectOriginTableService
from interfaces.schemas.migration_project_origin_table_schema import (
    MigrationProjectOriginTableCreate,
    MigrationProjectOriginTableUpdate,
    MigrationProjectOriginColumnCreate,
    MigrationProjectOriginColumnUpdate
)
from domain.entities.migration_project import (
    MigrationProjectOriginTable,
    MigrationProjectOriginTableColumn
)


class TestMigrationProjectOriginTableService:
    """Testes para MigrationProjectOriginTableService"""

    @pytest.fixture
    def mock_db(self):
        """Mock do banco de dados"""
        return Mock(spec=Session)

    @pytest.fixture
    def service(self, mock_db):
        """Instância do serviço para testes"""
        return MigrationProjectOriginTableService(mock_db)

    @pytest.fixture
    def sample_column_create(self):
        """Dados para criar coluna"""
        return MigrationProjectOriginColumnCreate(
            name="id",
            type="integer",
            is_pk=True
        )

    @pytest.fixture
    def sample_table_create(self):
        """Dados para criar tabela"""
        return MigrationProjectOriginTableCreate(
            name="users",
            columns=[
                {"name": "id", "type": "integer", "is_pk": True}
            ]
        )

    @pytest.fixture
    def sample_table_update(self):
        """Dados para atualizar tabela"""
        return MigrationProjectOriginTableUpdate(
            name="users_updated"
        )

    @pytest.fixture
    def sample_table(self):
        """Tabela de exemplo"""
        table = Mock(spec=MigrationProjectOriginTable)
        table.id = 1
        table.name = "users"
        table.migration_project_id = 1
        table.created_at = datetime.now()
        table.updated_at = None
        table.deleted_at = None
        
        column = Mock(spec=MigrationProjectOriginTableColumn)
        column.id = 1
        column.name = "id"
        column.type = "integer"
        column.is_pk = True
        column.origin_table_id = 1
        
        table.columns = [column]
        return table

    # ============================================
    # TESTES DE CRUD BÁSICO
    # ============================================

    def test_create_origin_table(self, service, sample_table_create, sample_table):
        """Testa criação de tabela de origem"""
        service.repo.create = Mock(return_value=sample_table)

        result = service.create_migration_project_origin_table(
            migration_project_id=1,
            data=sample_table_create
        )

        service.repo.create.assert_called_once_with(1, sample_table_create)
        assert result == sample_table
        assert result.name == "users"

    def test_create_table_without_columns(self, service):
        """Testa criação sem colunas"""
        table_create = MigrationProjectOriginTableCreate(
            name="empty_table",
            columns=[]
        )
        
        table = Mock()
        table.id = 1
        table.name = "empty_table"
        table.columns = []
        service.repo.create = Mock(return_value=table)

        result = service.create_migration_project_origin_table(
            migration_project_id=1,
            data=table_create
        )

        assert len(result.columns) == 0

    def test_create_table_with_multiple_columns(self, service):
        """Testa criação com múltiplas colunas"""
        table_create = MigrationProjectOriginTableCreate(
            name="products",
            columns=[
                {"name": "id", "type": "integer", "is_pk": True},
                {"name": "name", "type": "varchar", "is_pk": False},
                {"name": "price", "type": "decimal", "is_pk": False}
            ]
        )
        
        table = Mock()
        table.columns = [Mock(), Mock(), Mock()]
        service.repo.create = Mock(return_value=table)

        result = service.create_migration_project_origin_table(
            migration_project_id=1,
            data=table_create
        )

        assert len(result.columns) == 3

    def test_show_origin_table(self, service, sample_table):
        """Testa exibição de tabela"""
        service.repo.show = Mock(return_value=sample_table)

        result = service.show_migration_project_origin_table(
            migration_project_id=1,
            id=1
        )

        service.repo.show.assert_called_once_with(1, 1)
        assert result == sample_table

    def test_show_table_not_found(self, service):
        """Testa exibição de tabela inexistente"""
        service.repo.show = Mock(return_value=None)

        result = service.show_migration_project_origin_table(
            migration_project_id=1,
            id=999
        )

        assert result is None

    def test_show_table_with_columns(self, service, sample_table):
        """Testa que show retorna colunas"""
        service.repo.show = Mock(return_value=sample_table)

        result = service.show_migration_project_origin_table(
            migration_project_id=1,
            id=1
        )

        assert len(result.columns) == 1
        assert result.columns[0].name == "id"

    def test_delete_origin_table_success(self, service):
        """Testa exclusão bem-sucedida"""
        service.repo.delete = Mock(return_value=True)

        result = service.delete_migration_project_origin_table(
            migration_project_id=1,
            id=1
        )

        service.repo.delete.assert_called_once_with(1, 1)
        assert result is True

    def test_delete_table_not_found(self, service):
        """Testa exclusão de tabela inexistente"""
        service.repo.delete = Mock(return_value=False)

        result = service.delete_migration_project_origin_table(
            migration_project_id=1,
            id=999
        )

        assert result is False

    def test_update_origin_table_name(self, service, sample_table_update, sample_table):
        """Testa atualização do nome da tabela"""
        updated_table = Mock()
        updated_table.name = "users_updated"
        service.repo.update = Mock(return_value=updated_table)

        result = service.update_migration_project_origin_table(
            migration_project_id=1,
            id=1,
            data=sample_table_update
        )

        service.repo.update.assert_called_once_with(1, table_id=1, data=sample_table_update)
        assert result.name == "users_updated"

    def test_update_table_not_found(self, service, sample_table_update):
        """Testa atualização de tabela inexistente"""
        service.repo.update = Mock(return_value=None)

        result = service.update_migration_project_origin_table(
            migration_project_id=1,
            id=999,
            data=sample_table_update
        )

        assert result is None

    def test_update_table_add_column(self, service):
        """Testa adição de nova coluna"""
        update_data = MigrationProjectOriginTableUpdate(
            name="users",
            columns=[
                {"id": 1, "name": "id", "type": "integer", "is_pk": True},
                {"name": "email", "type": "varchar", "is_pk": False}
            ]
        )
        
        updated_table = Mock()
        updated_table.columns = [Mock(), Mock()]
        service.repo.update = Mock(return_value=updated_table)

        result = service.update_migration_project_origin_table(
            migration_project_id=1,
            id=1,
            data=update_data
        )

        assert len(result.columns) == 2

    def test_update_table_remove_column(self, service):
        """Testa remoção de coluna"""
        update_data = MigrationProjectOriginTableUpdate(
            columns=[
                {"id": 1, "name": "id", "type": "integer"}
            ]
        )
        
        updated_table = Mock()
        updated_table.columns = [Mock()]
        service.repo.update = Mock(return_value=updated_table)

        result = service.update_migration_project_origin_table(
            migration_project_id=1,
            id=1,
            data=update_data
        )

        assert len(result.columns) == 1

    def test_update_table_modify_column(self, service):
        """Testa modificação de coluna existente"""
        update_data = MigrationProjectOriginTableUpdate(
            columns=[
                {"id": 1, "name": "id", "type": "bigint", "is_pk": True}
            ]
        )
        
        updated_table = Mock()
        service.repo.update = Mock(return_value=updated_table)

        result = service.update_migration_project_origin_table(
            migration_project_id=1,
            id=1,
            data=update_data
        )

        service.repo.update.assert_called_once()

    # ============================================
    # TESTES DE INTEGRAÇÃO
    # ============================================

    def test_full_crud_workflow(self, service, sample_table_create):
        """Testa fluxo completo de CRUD"""
        # Create
        created_table = Mock()
        created_table.id = 1
        created_table.name = "users"
        service.repo.create = Mock(return_value=created_table)
        created = service.create_migration_project_origin_table(1, sample_table_create)
        assert created.id == 1
        
        # Show
        service.repo.show = Mock(return_value=created_table)
        shown = service.show_migration_project_origin_table(1, 1)
        assert shown.id == 1
        
        # Update
        update_data = MigrationProjectOriginTableUpdate(name="users_v2")
        updated_table = Mock()
        updated_table.name = "users_v2"
        service.repo.update = Mock(return_value=updated_table)
        updated = service.update_migration_project_origin_table(1, 1, update_data)
        assert updated.name == "users_v2"
        
        # Delete
        service.repo.delete = Mock(return_value=True)
        deleted = service.delete_migration_project_origin_table(1, 1)
        assert deleted is True

    def test_create_multiple_tables_for_same_project(self, service):
        """Testa criação de múltiplas tabelas no mesmo projeto"""
        tables_data = [
            MigrationProjectOriginTableCreate(name="users", columns=[]),
            MigrationProjectOriginTableCreate(name="orders", columns=[]),
            MigrationProjectOriginTableCreate(name="products", columns=[])
        ]
        
        created_tables = []
        for i, data in enumerate(tables_data):
            mock_table = Mock()
            mock_table.id = i + 1
            mock_table.name = data.name
            created_tables.append(mock_table)
        
        service.repo.create = Mock(side_effect=created_tables)
        
        results = [
            service.create_migration_project_origin_table(1, data)
            for data in tables_data
        ]
        
        assert len(results) == 3
        assert service.repo.create.call_count == 3

    # ============================================
    # TESTES DE EDGE CASES
    # ============================================

    def test_create_table_without_columns_list(self, service):
        """Testa criação sem lista de colunas"""
        table_create = MigrationProjectOriginTableCreate(
            name="no_columns",
            columns=None
        )
        
        table = Mock()
        table.columns = []
        service.repo.create = Mock(return_value=table)

        result = service.create_migration_project_origin_table(1, table_create)

        service.repo.create.assert_called_once()

    def test_show_table_from_wrong_project(self, service):
        """Testa buscar tabela de projeto errado"""
        service.repo.show = Mock(return_value=None)

        result = service.show_migration_project_origin_table(
            migration_project_id=1,
            id=1  # Tabela existe mas não neste projeto
        )

        assert result is None

    def test_delete_table_twice(self, service):
        """Testa exclusão dupla"""
        service.repo.delete = Mock(side_effect=[True, False])

        first_delete = service.delete_migration_project_origin_table(1, 1)
        second_delete = service.delete_migration_project_origin_table(1, 1)

        assert first_delete is True
        assert second_delete is False

    def test_update_with_none_id(self, service):
        """Testa update com ID None"""
        update_data = MigrationProjectOriginTableUpdate(name="test")
        service.repo.update = Mock(return_value=None)

        result = service.update_migration_project_origin_table(1, None, update_data)

        assert result is None

    def test_create_table_with_special_characters(self, service):
        """Testa criação com caracteres especiais"""
        table_create = MigrationProjectOriginTableCreate(
            name="user_data_2024",
            columns=[]
        )
        
        table = Mock()
        table.name = "user_data_2024"
        service.repo.create = Mock(return_value=table)

        result = service.create_migration_project_origin_table(1, table_create)

        assert result.name == "user_data_2024"

    def test_update_only_columns_not_name(self, service):
        """Testa atualização apenas das colunas"""
        update_data = MigrationProjectOriginTableUpdate(
            name=None,
            columns=[
                {"id": 1, "name": "id", "type": "integer"}
            ]
        )
        
        updated_table = Mock()
        service.repo.update = Mock(return_value=updated_table)

        result = service.update_migration_project_origin_table(1, 1, update_data)

        service.repo.update.assert_called_once()

    def test_create_with_invalid_migration_project_id(self, service, sample_table_create):
        """Testa criação com ID de projeto inválido"""
        service.repo.create = Mock(return_value=None)

        result = service.create_migration_project_origin_table(-1, sample_table_create)

        assert result is None


class TestMigrationProjectOriginTableServiceValidation:
    """Testes de validação"""

    @pytest.fixture
    def service(self):
        mock_db = Mock(spec=Session)
        return MigrationProjectOriginTableService(mock_db)

    def test_cannot_delete_nonexistent_table(self, service):
        """Testa que não pode deletar tabela inexistente"""
        service.repo.delete = Mock(return_value=False)

        result = service.delete_migration_project_origin_table(1, 999)

        assert result is False

    def test_show_includes_columns(self, service):
        """Testa que show inclui colunas"""
        table = Mock()
        table.columns = [Mock(), Mock()]
        service.repo.show = Mock(return_value=table)

        result = service.show_migration_project_origin_table(1, 1)

        assert hasattr(result, 'columns')
        assert len(result.columns) == 2


if __name__ == '__main__':
    pytest.main([__file__, '-v'])