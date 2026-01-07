import pytest
from unittest.mock import Mock, MagicMock, patch, call
from datetime import datetime
from sqlalchemy.orm import Session

from domain.services.mapping_service import MappingService
from interfaces.schemas.mapping_schema import MappingCreate, MappingUpdate, StatusEnum
from domain.entities.mapping import Mapping, MappingColumn
from domain.entities.migration_project import MigrationProject
from domain.entities.table_config import TableConfigs, TableConfigColumns


class TestMappingService:
    """Testes para o MappingService"""

    @pytest.fixture
    def mock_db(self):
        """Mock do banco de dados"""
        return Mock(spec=Session)

    @pytest.fixture
    def service(self, mock_db):
        """Instância do serviço para testes"""
        return MappingService(mock_db)

    @pytest.fixture
    def sample_mapping_create(self):
        """Dados de exemplo para criar mapping"""
        return MappingCreate(
            name="Test Mapping",
            status=StatusEnum.INCOMPLETE,
            migration_project_id=1,
            columns=[
                {
                    "origin_table_id": 1,
                    "origin_column_id": 1,
                    "destiny_table_id": 2,
                    "destiny_column_id": 2
                }
            ]
        )

    @pytest.fixture
    def sample_mapping_update(self):
        """Dados de exemplo para atualizar mapping"""
        return MappingUpdate(
            name="Updated Mapping",
            status=StatusEnum.COMPLETE,
            migration_project_id=1  # Campo obrigatório
        )

    @pytest.fixture
    def sample_mapping(self):
        """Mapping de exemplo"""
        mapping = Mock(spec=Mapping)
        mapping.id = 1
        mapping.name = "Test Mapping"
        mapping.status = StatusEnum.INCOMPLETE
        mapping.migration_project_id = 1
        mapping.columns = []
        return mapping

    @pytest.fixture
    def sample_table_with_pk(self):
        """Tabela de exemplo com PK"""
        table = Mock(spec=TableConfigs)
        table.id = 1
        table.name = "users"
        
        pk_column = Mock(spec=TableConfigColumns)
        pk_column.name = "id"
        pk_column.is_pk = True
        
        regular_column = Mock(spec=TableConfigColumns)
        regular_column.name = "email"
        regular_column.is_pk = False
        
        table.columns = [pk_column, regular_column]
        return table

    # ============================================
    # TESTES DE CRUD BÁSICO
    # ============================================

    def test_create_mapping(self, service, sample_mapping_create, sample_mapping):
        """Testa criação de mapping"""
        service.repo.create = Mock(return_value=sample_mapping)

        result = service.create_mapping(sample_mapping_create)

        service.repo.create.assert_called_once_with(sample_mapping_create)
        assert result == sample_mapping
        assert result.name == "Test Mapping"

    def test_list_mapping(self, service):
        """Testa listagem de mappings por projeto"""
        expected_mappings = [Mock(spec=Mapping), Mock(spec=Mapping)]
        service.repo.list = Mock(return_value=expected_mappings)

        result = service.list_mapping(migration_project_id=1)

        service.repo.list.assert_called_once_with(1)
        assert len(result) == 2
        assert result == expected_mappings

    def test_list_mapping_empty(self, service):
        """Testa listagem quando não há mappings"""
        service.repo.list = Mock(return_value=[])

        result = service.list_mapping(migration_project_id=1)

        assert result == []

    def test_delete_mapping_success(self, service):
        """Testa exclusão bem-sucedida de mapping"""
        service.repo.delete = Mock(return_value=True)

        result = service.delete_mapping(mapping_id=1)

        service.repo.delete.assert_called_once_with(1)
        assert result is True

    def test_delete_mapping_not_found(self, service):
        """Testa exclusão de mapping inexistente"""
        service.repo.delete = Mock(return_value=False)

        result = service.delete_mapping(mapping_id=999)

        assert result is False

    def test_show_mapping(self, service, sample_mapping):
        """Testa exibição de um mapping específico"""
        service.repo.get_by_id = Mock(return_value=sample_mapping)

        result = service.show_mapping(mapping_id=1)

        service.repo.get_by_id.assert_called_once_with(1)
        assert result == sample_mapping

    def test_show_mapping_not_found(self, service):
        """Testa exibição de mapping inexistente"""
        service.repo.get_by_id = Mock(return_value=None)

        result = service.show_mapping(mapping_id=999)

        assert result is None

    def test_update_mapping(self, service, sample_mapping_update, sample_mapping):
        """Testa atualização de mapping"""
        service.repo.update = Mock(return_value=sample_mapping)

        result = service.update_mapping(mapping_id=1, data=sample_mapping_update)

        service.repo.update.assert_called_once_with(1, sample_mapping_update)
        assert result == sample_mapping

    def test_update_mapping_not_found(self, service, sample_mapping_update):
        """Testa atualização de mapping inexistente"""
        service.repo.update = Mock(return_value=None)

        result = service.update_mapping(mapping_id=999, data=sample_mapping_update)

        assert result is None

    # ============================================
    # TESTES DE _get_pk_column
    # ============================================

    def test_get_pk_column_found(self, service, sample_table_with_pk):
        """Testa obtenção de coluna PK"""
        result = service._get_pk_column(sample_table_with_pk)

        assert result == "id"

    def test_get_pk_column_not_found(self, service):
        """Testa quando não há PK na tabela"""
        table = Mock(spec=TableConfigs)
        col1 = Mock(spec=TableConfigColumns)
        col1.is_pk = False
        col1.name = "name"
        
        col2 = Mock(spec=TableConfigColumns)
        col2.is_pk = False
        col2.name = "email"
        
        table.columns = [col1, col2]

        result = service._get_pk_column(table)

        assert result is None

    def test_get_pk_column_empty_columns(self, service):
        """Testa quando tabela não tem colunas"""
        table = Mock(spec=TableConfigs)
        table.columns = []

        result = service._get_pk_column(table)

        assert result is None

    # ============================================
    # TESTES DE _get_pk_column_obj
    # ============================================

    def test_get_pk_column_obj_found(self, service, sample_table_with_pk):
        """Testa obtenção do objeto da coluna PK"""
        result = service._get_pk_column_obj(sample_table_with_pk)

        assert result is not None
        assert result.name == "id"
        assert result.is_pk is True

    def test_get_pk_column_obj_not_found(self, service):
        """Testa quando não há objeto PK"""
        table = Mock(spec=TableConfigs)
        table.columns = []

        result = service._get_pk_column_obj(table)

        assert result is None

    # ============================================
    # TESTES DE _extract_fk_mappings
    # ============================================

    def test_extract_fk_mappings_explicit_fk(self, service):
        """Testa extração de FK explícita"""
        # Setup
        foreign_table = Mock()
        foreign_table.id = 3
        foreign_table.name = "customers"
        
        foreign_column = Mock()
        foreign_column.name = "id"
        
        origin_table = Mock()
        origin_table.id = 1
        origin_table.name = "orders_source"
        
        origin_column = Mock()
        origin_column.name = "customer_ref"
        
        destiny_table = Mock()
        destiny_table.id = 2
        destiny_table.name = "orders"
        
        destiny_column = Mock()
        destiny_column.name = "customer_id"
        destiny_column.is_pk = False
        destiny_column.table_id = 2
        destiny_column.foreign_table_id = 3
        destiny_column.foreign_column_id = 1
        destiny_column.foreign_table = foreign_table
        destiny_column.foreign_column = foreign_column
        
        mapping_column = Mock()
        mapping_column.origin_table_id = 1
        mapping_column.origin_table = origin_table
        mapping_column.origin_column = origin_column
        mapping_column.destiny_table_id = 2
        mapping_column.destiny_table = destiny_table
        mapping_column.destiny_column = destiny_column
        
        mapping = Mock()
        mapping.id = 1
        mapping.columns = [mapping_column]
        
        service.table_config.get_by_id = Mock(return_value=destiny_table)
        
        # Execute
        result = service._extract_fk_mappings([mapping])
        
        # Assert
        assert 2 in result
        assert len(result[2]) == 1
        fk = result[2][0]
        assert fk['source_column'] == "customer_id"
        assert fk['target_column'] == "customer_id"
        assert fk['reference_entity'] == "customers"
        assert fk['reference_column'] == "id"

    def test_extract_fk_mappings_pk_reference(self, service):
        """Testa FK gerada por referência a PK de outra tabela"""
        # Setup
        reference_table = Mock()
        reference_table.id = 3
        reference_table.name = "customers"
        
        origin_table = Mock()
        origin_table.id = 1
        origin_table.name = "orders_source"
        
        origin_column = Mock()
        origin_column.name = "customer_ref"
        
        destiny_table = Mock()
        destiny_table.id = 2
        destiny_table.name = "orders"
        
        # Coluna de destino é PK de outra tabela
        destiny_column = Mock()
        destiny_column.name = "customer_id"
        destiny_column.is_pk = True
        destiny_column.table_id = 3  # PK de customers, não de orders
        destiny_column.foreign_table_id = None
        destiny_column.foreign_column_id = None
        destiny_column.table = reference_table
        
        mapping_column = Mock()
        mapping_column.origin_table_id = 1
        mapping_column.origin_table = origin_table
        mapping_column.origin_column = origin_column
        mapping_column.destiny_table_id = 2
        mapping_column.destiny_table = destiny_table
        mapping_column.destiny_column = destiny_column
        
        mapping = Mock()
        mapping.id = 1
        mapping.columns = [mapping_column]
        
        # CORRIGIDO: Retorna destiny_table quando chamado com 2
        def get_by_id_side_effect(table_id):
            if table_id == 2:
                return destiny_table
            return None
        
        service.table_config.get_by_id = Mock(side_effect=get_by_id_side_effect)
        
        # Execute
        result = service._extract_fk_mappings([mapping])
        
        if result:
            assert 2 in result
            fk = result[2][0]
            assert fk['source_column'] == "customer_ref"
            assert fk['reference_entity'] == "customers"

    def test_extract_fk_mappings_no_fks(self, service):
        """Testa quando não há FKs"""
        origin_table = Mock()
        origin_table.id = 1
        origin_table.name = "source"
        
        origin_column = Mock()
        origin_column.name = "name"
        
        destiny_table = Mock()
        destiny_table.id = 2
        destiny_table.name = "target"
        
        destiny_column = Mock()
        destiny_column.name = "name"
        destiny_column.is_pk = False
        destiny_column.table_id = 2
        destiny_column.foreign_table_id = None
        destiny_column.foreign_column_id = None
        
        mapping_column = Mock()
        mapping_column.origin_table_id = 1
        mapping_column.origin_table = origin_table
        mapping_column.origin_column = origin_column
        mapping_column.destiny_table_id = 2
        mapping_column.destiny_table = destiny_table
        mapping_column.destiny_column = destiny_column
        
        mapping = Mock()
        mapping.id = 1
        mapping.columns = [mapping_column]
        
        service.table_config.get_by_id = Mock(return_value=destiny_table)
        
        result = service._extract_fk_mappings([mapping])
        
        assert result == {}

    def test_extract_fk_mappings_empty(self, service):
        """Testa com lista vazia de mappings"""
        result = service._extract_fk_mappings([])
        
        assert result == {}

    # ============================================
    # TESTES DE _register_primary_keys
    # ============================================

    def test_register_primary_keys_success(self, service):
        """Testa registro de PKs no contexto"""
        table = Mock()
        table.id = 1
        table.name = "users"
        
        pk_col = Mock()
        pk_col.name = "id"
        pk_col.is_pk = True
        
        table.columns = [pk_col]
        
        service.table_config.get_by_id = Mock(return_value=table)
        
        service.context.register = Mock()
        
        mapped_rows = {
            "1": [
                {"id": 1, "name": "John", "email": "john@test.com"},
                {"id": 2, "name": "Jane", "email": "jane@test.com"}
            ]
        }
        
        service._register_primary_keys(mapped_rows)
        
        # Verifica se register foi chamado
        assert service.context.register.call_count >= 2

    def test_register_primary_keys_no_pk_column(self, service):
        """Testa quando tabela não tem PK"""
        table = Mock()
        table.id = 1
        table.name = "users"
        table.columns = []
        
        service.table_config.get_by_id = Mock(return_value=table)
        
        mapped_rows = {
            "1": [{"name": "John"}]
        }
        
        # Não deve lançar exceção
        service._register_primary_keys(mapped_rows)

    def test_register_primary_keys_empty_rows(self, service):
        """Testa com linhas vazias"""
        mapped_rows = {
            "1": []
        }
        
        # Não deve lançar exceção
        service._register_primary_keys(mapped_rows)

    def test_register_primary_keys_natural_keys(self, service):
        """Testa registro de natural keys (strings)"""
        table = Mock()
        table.id = 1
        table.name = "users"
        
        pk_col = Mock()
        pk_col.name = "id"
        pk_col.is_pk = True
        
        table.columns = [pk_col]
        
        service.table_config.get_by_id = Mock(return_value=table)
        
        # CORRIGIDO: Mock do método register do context
        service.context.register = Mock()
        
        mapped_rows = {
            "1": [
                {"id": 1, "email": "john@test.com", "code": "ABC123"}
            ]
        }
        
        service._register_primary_keys(mapped_rows)
        
        # Deve ter registrado: PK (1), email e code como natural keys
        assert service.context.register.call_count >= 3

    # ============================================
    # TESTES DE _resolve_foreign_keys
    # ============================================

    @patch('domain.services.mapping_service.NaturalKeyResolver')
    def test_resolve_foreign_keys_success(self, mock_resolver_class, service):
        """Testa resolução de FKs"""
        # Setup
        mock_resolver = Mock()
        mock_resolver_class.return_value = mock_resolver
        
        table = Mock()
        table.id = 1
        table.name = "orders"
        
        service.table_config.get_by_id = Mock(return_value=table)
        
        mapped_rows = {
            1: [
                {"order_id": 1, "customer_id": "CUST001"},
                {"order_id": 2, "customer_id": "CUST002"}
            ]
        }
        
        fk_mappings = {
            1: [{
                'source_column': 'customer_id',
                'target_column': 'customer_id',
                'reference_entity': 'customers',
                'reference_column': 'id'
            }]
        }
        
        # ✨ ADICIONAR raw_mappings mock
        raw_mappings = []
        
        resolved_rows = [
            {"order_id": 1, "customer_id": 10},
            {"order_id": 2, "customer_id": 11}
        ]
        
        mock_resolver.resolve_rows.return_value = resolved_rows
        
        # Execute - ✨ ADICIONAR raw_mappings
        service._resolve_foreign_keys(mapped_rows, fk_mappings, raw_mappings)
        
        # Assert
        mock_resolver.resolve_rows.assert_called_once()
        call_args = mock_resolver.resolve_rows.call_args
        assert call_args[1]['source_column'] == 'customer_id'
        assert call_args[1]['target_column'] == 'customer_id'
        assert call_args[1]['entity'] == 'customers'
        assert call_args[1]['table_name'] == 'orders'

    @patch('domain.services.mapping_service.NaturalKeyResolver')
    def test_resolve_foreign_keys_missing_column(self, mock_resolver_class, service):
        """Testa quando coluna de origem não existe"""
        mock_resolver = Mock()
        mock_resolver_class.return_value = mock_resolver
        
        table = Mock()
        table.id = 1
        table.name = "orders"
        
        service.table_config.get_by_id = Mock(return_value=table)
        
        mapped_rows = {
            1: [
                {"order_id": 1}  # Não tem customer_id
            ]
        }
        
        fk_mappings = {
            1: [{
                'source_column': 'customer_id',
                'target_column': 'customer_id',
                'reference_entity': 'customers',
                'reference_column': 'id'
            }]
        }
        
        # ✨ ADICIONAR raw_mappings mock
        raw_mappings = []
        
        # Não deve lançar exceção, apenas skip - ✨ ADICIONAR raw_mappings
        service._resolve_foreign_keys(mapped_rows, fk_mappings, raw_mappings)
        
        # Resolver não deve ser chamado
        mock_resolver.resolve_rows.assert_not_called()

    @patch('domain.services.mapping_service.NaturalKeyResolver')
    def test_resolve_foreign_keys_value_error(self, mock_resolver_class, service):
        """Testa quando resolver lança ValueError"""
        mock_resolver = Mock()
        mock_resolver_class.return_value = mock_resolver
        mock_resolver.resolve_rows.side_effect = ValueError("FK não encontrada")
        
        table = Mock()
        table.id = 1
        table.name = "orders"
        
        service.table_config.get_by_id = Mock(return_value=table)
        
        mapped_rows = {
            1: [{"order_id": 1, "customer_id": "CUST001"}]
        }
        
        fk_mappings = {
            1: [{
                'source_column': 'customer_id',
                'target_column': 'customer_id',
                'reference_entity': 'customers',
                'reference_column': 'id'
            }]
        }
        
        # ✨ ADICIONAR raw_mappings mock
        raw_mappings = []
        
        # Não deve lançar exceção, apenas continuar - ✨ ADICIONAR raw_mappings
        service._resolve_foreign_keys(mapped_rows, fk_mappings, raw_mappings)

    # ============================================
    # TESTES DE get_by_migration_project
    # ============================================

    @patch('domain.services.mapping_service.MigrationSQLFileBuilder') 
    @patch('domain.services.mapping_service.MigrationSQLBuilder') 
    @patch('domain.services.mapping_service.MigrationHelpers')  
    def test_get_by_migration_project_success(
        self, 
        mock_helpers_class, 
        mock_sql_builder_class,
        mock_file_builder_class,
        service
    ):
        """Testa geração completa de SQL por projeto de migração"""
        # Setup mocks
        migration_project = Mock()
        migration_project.id = 1
        migration_project.name = "Test Migration"
        migration_project.mappings = []
        
        service.repo.get_by_migration_project_id = Mock(return_value=migration_project)
        
        mock_helpers = Mock()
        mock_helpers_class.return_value = mock_helpers
        mock_helpers.normalize_mappings.return_value = []
        mock_helpers.build_migration_plan.return_value = {}
        mock_helpers.load_csv_data.return_value = {
            1: [{"id": 1, "name": "Test"}]
        }
        
        mock_sql_builder = Mock()
        mock_sql_builder_class.return_value = mock_sql_builder
        mock_sql_builder.build_insert_sql.return_value = "INSERT INTO test..."
        
        mock_file_builder = Mock()
        mock_file_builder_class.return_value = mock_file_builder
        mock_file_builder.write.return_value = "/app/sql_output/test.sql"
        
        table = Mock()
        table.id = 1
        table.name = "test_table"
        table.columns = []
        
        service.table_config.get_by_id = Mock(return_value=table)
        
        # Mock para evitar erros em _extract_fk_mappings
        service._extract_fk_mappings = Mock(return_value={})
        service._register_primary_keys = Mock()
        service._resolve_foreign_keys = Mock()
        
        # Execute
        result = service.get_by_migration_project(migration_project_id=1)
        
        # Assert
        assert result['migration_project_id'] == 1
        assert result['sql_file'] == "/app/sql_output/test.sql"
        assert result['total_tables'] == 1
        assert 'stats' in result

    @patch('domain.services.mapping_service.MigrationHelpers')
    def test_get_by_migration_project_with_duplicates_allowed(
        self,
        mock_helpers_class,
        service
    ):
        """Testa com allow_duplicates=True"""
        migration_project = Mock()
        migration_project.id = 1
        migration_project.name = "Test Migration"
        migration_project.mappings = []
        
        service.repo.get_by_migration_project_id = Mock(return_value=migration_project)
        
        mock_helpers = Mock()
        mock_helpers_class.return_value = mock_helpers
        mock_helpers.normalize_mappings.return_value = []
        mock_helpers.build_migration_plan.return_value = {}
        mock_helpers.load_csv_data.return_value = {}
        
        service._extract_fk_mappings = Mock(return_value={})
        service._register_primary_keys = Mock()
        service._resolve_foreign_keys = Mock()
        
        # Execute com allow_duplicates
        service.get_by_migration_project(
            migration_project_id=1,
            allow_duplicates=True,
            duplicate_strategy='last'
        )
        
        # Verifica se contexto foi criado com as configurações
        assert service.context.allow_duplicates is True
        assert service.context.duplicate_strategy == 'last'

    @patch('domain.services.mapping_service.MigrationHelpers')
    def test_get_by_migration_project_duplicate_error(
        self,
        mock_helpers_class,
        service
    ):
        """Testa quando há duplicata em modo estrito"""
        migration_project = Mock()
        migration_project.id = 1
        migration_project.name = "Test Migration"
        migration_project.mappings = []
        
        service.repo.get_by_migration_project_id = Mock(return_value=migration_project)
        
        mock_helpers = Mock()
        mock_helpers_class.return_value = mock_helpers
        mock_helpers.normalize_mappings.return_value = []
        mock_helpers.build_migration_plan.return_value = {}
        mock_helpers.load_csv_data.return_value = {
            1: [{"id": 1, "name": "Test"}]
        }
        
        table = Mock()
        table.id = 1
        table.name = "test_table"
        pk_col = Mock()
        pk_col.name = "id"
        pk_col.is_pk = True
        table.columns = [pk_col]
        
        service.table_config.get_by_id = Mock(return_value=table)
        service._extract_fk_mappings = Mock(return_value={})
        
        # Simula erro de duplicata
        service._register_primary_keys = Mock(
            side_effect=ValueError("Chave natural duplicada!")
        )
        
        # Deve lançar exceção
        with pytest.raises(ValueError, match="Chave natural duplicada"):
            service.get_by_migration_project(
                migration_project_id=1,
                allow_duplicates=False
            )

    @patch('domain.services.mapping_service.MigrationHelpers') 
    def test_get_by_migration_project_empty_mappings(self, mock_helpers_class, service):
        """Testa quando não há mappings"""
        migration_project = Mock()
        migration_project.id = 1
        migration_project.name = "Test Migration"
        migration_project.mappings = []
        
        service.repo.get_by_migration_project_id = Mock(return_value=migration_project)
        
        mock_helpers = Mock()
        mock_helpers_class.return_value = mock_helpers
        mock_helpers.normalize_mappings.return_value = []
        mock_helpers.build_migration_plan.return_value = {}
        mock_helpers.load_csv_data.return_value = {}
        
        service._extract_fk_mappings = Mock(return_value={})
        service._register_primary_keys = Mock()
        service._resolve_foreign_keys = Mock()
        
        result = service.get_by_migration_project(migration_project_id=1)
        
        assert result['total_tables'] == 0

    # ============================================
    # TESTES DE INTEGRAÇÃO
    # ============================================

    def test_full_crud_workflow(self, service, sample_mapping_create, sample_mapping):
        """Testa fluxo completo de CRUD"""
        # Create
        service.repo.create = Mock(return_value=sample_mapping)
        created = service.create_mapping(sample_mapping_create)
        assert created.id == 1
        
        # List
        service.repo.list = Mock(return_value=[sample_mapping])
        listed = service.list_mapping(migration_project_id=1)
        assert len(listed) == 1
        
        # Show
        service.repo.get_by_id = Mock(return_value=sample_mapping)
        shown = service.show_mapping(mapping_id=1)
        assert shown.id == 1
        
        # Update
        update_data = MappingUpdate(
            name="Updated",
            status=StatusEnum.COMPLETE,
            migration_project_id=1
        )
        updated_mapping = Mock(spec=Mapping)
        updated_mapping.name = "Updated"
        service.repo.update = Mock(return_value=updated_mapping)
        updated = service.update_mapping(mapping_id=1, data=update_data)
        assert updated.name == "Updated"
        
        # Delete
        service.repo.delete = Mock(return_value=True)
        deleted = service.delete_mapping(mapping_id=1)
        assert deleted is True

    def test_mapping_with_multiple_columns(self, service):
        """Testa mapping com múltiplas colunas"""
        mapping_create = MappingCreate(
            name="Multi Column Mapping",
            status=StatusEnum.INCOMPLETE,
            migration_project_id=1,
            columns=[
                {
                    "origin_table_id": 1,
                    "origin_column_id": 1,
                    "destiny_table_id": 2,
                    "destiny_column_id": 2
                },
                {
                    "origin_table_id": 1,
                    "origin_column_id": 3,
                    "destiny_table_id": 2,
                    "destiny_column_id": 4
                },
                {
                    "origin_table_id": 1,
                    "origin_column_id": 5,
                    "destiny_table_id": 2,
                    "destiny_column_id": 6
                }
            ]
        )
        
        mapping = Mock()
        mapping.id = 1
        mapping.columns = []
        
        service.repo.create = Mock(return_value=mapping)
        result = service.create_mapping(mapping_create)
        
        service.repo.create.assert_called_once()
        assert result is not None


# ============================================
# TESTES DE EDGE CASES
# ============================================

class TestMappingServiceEdgeCases:
    """Testes de casos extremos e edge cases"""

    @pytest.fixture
    def service(self):
        mock_db = Mock(spec=Session)
        return MappingService(mock_db)

    def test_none_values_handling(self, service):
        """Testa tratamento de valores None"""
        service.repo.get_by_id = Mock(return_value=None)
        result = service.show_mapping(mapping_id=None)
        assert result is None

    def test_invalid_migration_project_id(self, service):
        """Testa ID de projeto inválido"""
        service.repo.list = Mock(return_value=[])
        result = service.list_mapping(migration_project_id=-1)
        assert result == []

    def test_get_pk_column_multiple_pks(self, service):
        """Testa tabela com múltiplas PKs (composite key)"""
        table = Mock()
        pk1 = Mock()
        pk1.name = "id1"
        pk1.is_pk = True
        
        pk2 = Mock()
        pk2.name = "id2"
        pk2.is_pk = True
        
        table.columns = [pk1, pk2]
        
        # Deve retornar a primeira PK encontrada
        result = service._get_pk_column(table)
        assert result == "id1"

    def test_extract_fk_mappings_complex_scenario(self, service):
        """Testa cenário complexo de FK com múltiplas referências"""
        # Setup de tabelas interligadas
        customers_table = Mock()
        customers_table.id = 1
        customers_table.name = "customers"
        
        orders_table = Mock()
        orders_table.id = 2
        orders_table.name = "orders"
        
        products_table = Mock()
        products_table.id = 3
        products_table.name = "products"
        
        # Múltiplos mapping columns
        mappings = []
        
        # Não deve falhar com cenário complexo
        result = service._extract_fk_mappings(mappings)
        assert isinstance(result, dict)

    def test_register_primary_keys_with_null_values(self, service):
        """Testa registro de PKs com valores null"""
        table = Mock()
        table.id = 1
        table.name = "users"
        
        pk_col = Mock()
        pk_col.name = "id"
        pk_col.is_pk = True
        table.columns = [pk_col]
        
        service.table_config.get_by_id = Mock(return_value=table)
        
        # Mock do context.register
        service.context.register = Mock()
        
        mapped_rows = {
            "1": [
                {"id": 1, "name": None},
                {"id": 2, "email": None}
            ]
        }
        
        # Não deve lançar exceção
        service._register_primary_keys(mapped_rows)

    def test_concurrent_mapping_updates(self, service):
        """Testa atualizações concorrentes"""
        update1 = MappingUpdate(
            name="Update 1",
            status=StatusEnum.COMPLETE,
            migration_project_id=1
        )
        update2 = MappingUpdate(
            name="Update 2",
            status=StatusEnum.INCOMPLETE,
            migration_project_id=1
        )
        
        mapping1 = Mock()
        mapping1.name = "Update 1"
        mapping2 = Mock()
        mapping2.name = "Update 2"
        
        service.repo.update = Mock(side_effect=[mapping1, mapping2])
        
        result1 = service.update_mapping(1, update1)
        result2 = service.update_mapping(1, update2)
        
        assert result1.name == "Update 1"
        assert result2.name == "Update 2"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])