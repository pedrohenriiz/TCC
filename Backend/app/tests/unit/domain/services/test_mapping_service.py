import pytest
from unittest.mock import Mock, MagicMock, patch, call
from datetime import datetime
from sqlalchemy.orm import Session

from domain.services.mapping_service import MappingService
from interfaces.schemas.mapping_schema import MappingCreate, MappingUpdate, StatusEnum
from domain.entities.mapping import Mapping, MappingColumn
from domain.entities.migration_project import MigrationProject
from domain.entities.table_config import TableConfigs, TableConfigColumns
from application.migration_context import MigrationContext


class TestMappingService:
    """Testes para o MappingService"""

    @pytest.fixture
    def mock_db(self):
        return Mock(spec=Session)

    @pytest.fixture
    def service(self, mock_db):
        service = MappingService(mock_db)
        # Inicializa o contexto para testes que usam _register_primary_keys diretamente
        service.context = MigrationContext(allow_duplicates=False, duplicate_strategy='first')
        return service

    @pytest.fixture
    def sample_mapping_create(self):
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
        return MappingUpdate(
            name="Updated Mapping",
            status=StatusEnum.COMPLETE,
            migration_project_id=1
        )

    @pytest.fixture
    def sample_mapping(self):
        mapping = Mock(spec=Mapping)
        mapping.id = 1
        mapping.name = "Test Mapping"
        mapping.status = StatusEnum.INCOMPLETE
        mapping.migration_project_id = 1
        mapping.columns = []
        return mapping

    @pytest.fixture
    def sample_table_with_pk(self):
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
        service.repo.create = Mock(return_value=sample_mapping)
        result = service.create_mapping(sample_mapping_create)
        service.repo.create.assert_called_once_with(sample_mapping_create)
        assert result == sample_mapping
        assert result.name == "Test Mapping"

    def test_list_mapping(self, service):
        expected_mappings = [Mock(spec=Mapping), Mock(spec=Mapping)]
        service.repo.list = Mock(return_value=expected_mappings)
        result = service.list_mapping(migration_project_id=1)
        service.repo.list.assert_called_once_with(1)
        assert len(result) == 2

    def test_list_mapping_empty(self, service):
        service.repo.list = Mock(return_value=[])
        result = service.list_mapping(migration_project_id=1)
        assert result == []

    def test_delete_mapping_success(self, service):
        service.repo.delete = Mock(return_value=True)
        result = service.delete_mapping(mapping_id=1)
        service.repo.delete.assert_called_once_with(1)
        assert result is True

    def test_delete_mapping_not_found(self, service):
        service.repo.delete = Mock(return_value=False)
        result = service.delete_mapping(mapping_id=999)
        assert result is False

    def test_show_mapping(self, service, sample_mapping):
        service.repo.get_by_id = Mock(return_value=sample_mapping)
        result = service.show_mapping(mapping_id=1)
        service.repo.get_by_id.assert_called_once_with(1)
        assert result == sample_mapping

    def test_show_mapping_not_found(self, service):
        service.repo.get_by_id = Mock(return_value=None)
        result = service.show_mapping(mapping_id=999)
        assert result is None

    def test_update_mapping(self, service, sample_mapping_update, sample_mapping):
        service.repo.update = Mock(return_value=sample_mapping)
        result = service.update_mapping(mapping_id=1, data=sample_mapping_update)
        service.repo.update.assert_called_once_with(1, sample_mapping_update)
        assert result == sample_mapping

    def test_update_mapping_not_found(self, service, sample_mapping_update):
        service.repo.update = Mock(return_value=None)
        result = service.update_mapping(mapping_id=999, data=sample_mapping_update)
        assert result is None

    # ============================================
    # TESTES DE _get_pk_column
    # ============================================

    def test_get_pk_column_found(self, service, sample_table_with_pk):
        result = service._get_pk_column(sample_table_with_pk)
        assert result == "id"

    def test_get_pk_column_not_found(self, service):
        table = Mock(spec=TableConfigs)
        col1 = Mock(spec=TableConfigColumns)
        col1.is_pk = False
        col1.name = "name"
        table.columns = [col1]
        result = service._get_pk_column(table)
        assert result is None

    def test_get_pk_column_empty_columns(self, service):
        table = Mock(spec=TableConfigs)
        table.columns = []
        result = service._get_pk_column(table)
        assert result is None

    # ============================================
    # TESTES DE _get_pk_column_obj
    # ============================================

    def test_get_pk_column_obj_found(self, service, sample_table_with_pk):
        result = service._get_pk_column_obj(sample_table_with_pk)
        assert result is not None
        assert result.name == "id"
        assert result.is_pk is True

    def test_get_pk_column_obj_not_found(self, service):
        table = Mock(spec=TableConfigs)
        table.columns = []
        result = service._get_pk_column_obj(table)
        assert result is None

    # ============================================
    # TESTES DE _register_primary_keys
    # Agora recebe (mapped_rows, raw_mappings)
    # ============================================

    def test_register_primary_keys_success(self, service):
        table = Mock()
        table.id = 1
        table.name = "users"

        pk_col = Mock()
        pk_col.name = "id"
        pk_col.is_pk = True
        table.columns = [pk_col]

        service.table_config.get_by_id = Mock(return_value=table)

        mapped_rows = {
            "1": [
                {"id": 1, "name": "John"},
                {"id": 2, "name": "Jane"}
            ]
        }

        # raw_mappings sem natural keys
        service._register_primary_keys(mapped_rows, raw_mappings=[])

        # Contexto foi inicializado no fixture — verifica que não lançou exceção
        assert True

    def test_register_primary_keys_no_pk_column(self, service):
        table = Mock()
        table.id = 1
        table.name = "users"
        table.columns = []

        service.table_config.get_by_id = Mock(return_value=table)

        mapped_rows = {"1": [{"name": "John"}]}

        # Não deve lançar exceção
        service._register_primary_keys(mapped_rows, raw_mappings=[])

    def test_register_primary_keys_empty_rows(self, service):
        mapped_rows = {"1": []}

        # Não deve lançar exceção
        service._register_primary_keys(mapped_rows, raw_mappings=[])

    def test_register_primary_keys_natural_keys(self, service):
        table = Mock()
        table.id = 1
        table.name = "users"

        pk_col = Mock()
        pk_col.name = "id"
        pk_col.is_pk = True
        table.columns = [pk_col]

        service.table_config.get_by_id = Mock(return_value=table)

        # Cria raw_mapping com natural key
        origin_col = Mock()
        origin_col.is_natural_key = True
        origin_col.name = "email"

        destiny_col = Mock()
        destiny_col.name = "email"

        mc = Mock()
        mc.origin_column = origin_col
        mc.destiny_table_id = "1"
        mc.destiny_column = destiny_col
        mc.destiny_table = Mock()
        mc.origin_table = Mock()

        raw_mapping = Mock()
        raw_mapping.columns = [mc]

        mapped_rows = {
            "1": [{"id": 1, "email": "john@test.com"}]
        }

        # Não deve lançar exceção
        service._register_primary_keys(mapped_rows, raw_mappings=[raw_mapping])

    def test_register_primary_keys_with_null_values(self, service):
        table = Mock()
        table.id = 1
        table.name = "users"

        pk_col = Mock()
        pk_col.name = "id"
        pk_col.is_pk = True
        table.columns = [pk_col]

        service.table_config.get_by_id = Mock(return_value=table)

        mapped_rows = {
            "1": [
                {"id": 1, "name": None},
                {"id": 2, "email": None}
            ]
        }

        # Não deve lançar exceção
        service._register_primary_keys(mapped_rows, raw_mappings=[])

    # ============================================
    # TESTES DE _extract_fk_mappings
    # ============================================

    def test_extract_fk_mappings_explicit_fk(self, service):
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

        result = service._extract_fk_mappings([mapping])

        assert 2 in result
        fk = result[2][0]
        assert fk['source_column'] == "customer_id"
        assert fk['reference_entity'] == "customers"

    def test_extract_fk_mappings_no_fks(self, service):
        origin_table = Mock()
        origin_table.id = 1
        origin_table.name = "source"

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
        mapping_column.origin_column = Mock(name="name")
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
        result = service._extract_fk_mappings([])
        assert result == {}

    # ============================================
    # TESTES DE _resolve_foreign_keys
    # ============================================

    @patch('domain.services.mapping_service.NaturalKeyResolver')
    def test_resolve_foreign_keys_success(self, mock_resolver_class, service):
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

        resolved_rows = [
            {"order_id": 1, "customer_id": 10},
            {"order_id": 2, "customer_id": 11}
        ]
        mock_resolver.resolve_rows.return_value = resolved_rows

        service._resolve_foreign_keys(mapped_rows, fk_mappings, raw_mappings=[])

        mock_resolver.resolve_rows.assert_called_once()
        call_args = mock_resolver.resolve_rows.call_args
        assert call_args[1]['source_column'] == 'customer_id'
        assert call_args[1]['entity'] == 'customers'

    @patch('domain.services.mapping_service.NaturalKeyResolver')
    def test_resolve_foreign_keys_missing_column(self, mock_resolver_class, service):
        mock_resolver = Mock()
        mock_resolver_class.return_value = mock_resolver

        table = Mock()
        table.name = "orders"
        service.table_config.get_by_id = Mock(return_value=table)

        mapped_rows = {1: [{"order_id": 1}]}
        fk_mappings = {
            1: [{'source_column': 'customer_id', 'target_column': 'customer_id',
                 'reference_entity': 'customers', 'reference_column': 'id'}]
        }

        service._resolve_foreign_keys(mapped_rows, fk_mappings, raw_mappings=[])

        mock_resolver.resolve_rows.assert_not_called()

    @patch('domain.services.mapping_service.NaturalKeyResolver')
    def test_resolve_foreign_keys_value_error(self, mock_resolver_class, service):
        mock_resolver = Mock()
        mock_resolver_class.return_value = mock_resolver
        mock_resolver.resolve_rows.side_effect = ValueError("FK não encontrada")

        table = Mock()
        table.name = "orders"
        service.table_config.get_by_id = Mock(return_value=table)

        mapped_rows = {1: [{"order_id": 1, "customer_id": "CUST001"}]}
        fk_mappings = {
            1: [{'source_column': 'customer_id', 'target_column': 'customer_id',
                 'reference_entity': 'customers', 'reference_column': 'id'}]
        }

        # Não deve lançar exceção
        service._resolve_foreign_keys(mapped_rows, fk_mappings, raw_mappings=[])

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
        migration_project = Mock()
        migration_project.id = 1
        migration_project.name = "Test Migration"
        migration_project.mappings = []

        service.repo.get_by_migration_project_id = Mock(return_value=migration_project)

        # Mock do setting_repo.get para retornar estratégia válida
        service.setting_repo.get = Mock(return_value='abort_on_first')

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

        service._extract_fk_mappings = Mock(return_value={})
        service._register_primary_keys = Mock()
        service._resolve_foreign_keys = Mock()

        result = service.get_by_migration_project(migration_project_id=1)

        assert result['migration_project_id'] == 1
        assert result['sql_file'] == "/app/sql_output/test.sql"

    @patch('domain.services.mapping_service.MigrationHelpers')
    def test_get_by_migration_project_with_duplicates_allowed(
        self, mock_helpers_class, service
    ):
        migration_project = Mock()
        migration_project.id = 1
        migration_project.name = "Test Migration"
        migration_project.mappings = []

        service.repo.get_by_migration_project_id = Mock(return_value=migration_project)
        service.setting_repo.get = Mock(return_value='abort_on_first')

        mock_helpers = Mock()
        mock_helpers_class.return_value = mock_helpers
        mock_helpers.normalize_mappings.return_value = []
        mock_helpers.build_migration_plan.return_value = {}
        mock_helpers.load_csv_data.return_value = {}

        service._extract_fk_mappings = Mock(return_value={})
        service._register_primary_keys = Mock()
        service._resolve_foreign_keys = Mock()

        service.get_by_migration_project(
            migration_project_id=1,
            allow_duplicates=True,
            duplicate_strategy='last'
        )

        assert service.context.allow_duplicates is True
        assert service.context.duplicate_strategy == 'last'

    @patch('domain.services.mapping_service.MigrationHelpers')
    def test_get_by_migration_project_duplicate_error(
        self, mock_helpers_class, service
    ):
        migration_project = Mock()
        migration_project.id = 1
        migration_project.name = "Test Migration"
        migration_project.mappings = []

        service.repo.get_by_migration_project_id = Mock(return_value=migration_project)
        service.setting_repo.get = Mock(return_value='abort_on_first')

        mock_helpers = Mock()
        mock_helpers_class.return_value = mock_helpers
        mock_helpers.normalize_mappings.return_value = []
        mock_helpers.build_migration_plan.return_value = {}
        mock_helpers.load_csv_data.return_value = {
            1: [{"id": 1, "name": "Test"}]
        }

        from application.validation.validation_result import ValidationResult
        mock_validation_result = Mock(spec=ValidationResult)
        mock_validation_result.has_errors = False
        mock_validation_result.errors = []
        mock_validation_result.to_dict = Mock(return_value={})

        service._extract_fk_mappings = Mock(return_value={})
        service._apply_transformations = Mock()
        service._apply_id_generation = Mock()
        service._get_dependency_order = Mock(return_value=[])
        service._validate_and_filter = Mock(
            return_value=(mock_validation_result, {1: [{"id": 1, "name": "Test"}]})
        )
        service._register_primary_keys = Mock(
            side_effect=ValueError("Chave natural duplicada!")
        )

        result = service.get_by_migration_project(
            migration_project_id=1,
            allow_duplicates=False
        )

        assert result['status'] == 'error'
        assert 'Chave natural duplicada' in result['message']

    @patch('domain.services.mapping_service.MigrationHelpers')
    def test_get_by_migration_project_empty_mappings(self, mock_helpers_class, service):
        migration_project = Mock()
        migration_project.id = 1
        migration_project.name = "Test Migration"
        migration_project.mappings = []

        service.repo.get_by_migration_project_id = Mock(return_value=migration_project)
        service.setting_repo.get = Mock(return_value='abort_on_first')

        mock_helpers = Mock()
        mock_helpers_class.return_value = mock_helpers
        mock_helpers.normalize_mappings.return_value = []
        mock_helpers.build_migration_plan.return_value = {}
        mock_helpers.load_csv_data.return_value = {}

        service._extract_fk_mappings = Mock(return_value={})
        service._register_primary_keys = Mock()
        service._resolve_foreign_keys = Mock()

        result = service.get_by_migration_project(migration_project_id=1)

        assert result['migration_project_id'] == 1
        assert result['status'] in ('success', 'completed_with_errors', 'validation_passed', 'validation_failed')
        assert 'sql_file' in result

    # ============================================
    # TESTES DE INTEGRAÇÃO
    # ============================================

    def test_full_crud_workflow(self, service, sample_mapping_create, sample_mapping):
        service.repo.create = Mock(return_value=sample_mapping)
        created = service.create_mapping(sample_mapping_create)
        assert created.id == 1

        service.repo.list = Mock(return_value=[sample_mapping])
        listed = service.list_mapping(migration_project_id=1)
        assert len(listed) == 1

        service.repo.get_by_id = Mock(return_value=sample_mapping)
        shown = service.show_mapping(mapping_id=1)
        assert shown.id == 1

        update_data = MappingUpdate(
            name="Updated", status=StatusEnum.COMPLETE, migration_project_id=1
        )
        updated_mapping = Mock(spec=Mapping)
        updated_mapping.name = "Updated"
        service.repo.update = Mock(return_value=updated_mapping)
        updated = service.update_mapping(mapping_id=1, data=update_data)
        assert updated.name == "Updated"

        service.repo.delete = Mock(return_value=True)
        deleted = service.delete_mapping(mapping_id=1)
        assert deleted is True


# ============================================
# TESTES DE EDGE CASES
# ============================================

class TestMappingServiceEdgeCases:

    @pytest.fixture
    def service(self):
        mock_db = Mock(spec=Session)
        service = MappingService(mock_db)
        # Inicializa contexto para testes que usam _register_primary_keys diretamente
        service.context = MigrationContext(allow_duplicates=False, duplicate_strategy='first')
        return service

    def test_none_values_handling(self, service):
        service.repo.get_by_id = Mock(return_value=None)
        result = service.show_mapping(mapping_id=None)
        assert result is None

    def test_invalid_migration_project_id(self, service):
        service.repo.list = Mock(return_value=[])
        result = service.list_mapping(migration_project_id=-1)
        assert result == []

    def test_get_pk_column_multiple_pks(self, service):
        table = Mock()
        pk1 = Mock()
        pk1.name = "id1"
        pk1.is_pk = True
        pk2 = Mock()
        pk2.name = "id2"
        pk2.is_pk = True
        table.columns = [pk1, pk2]

        result = service._get_pk_column(table)
        assert result == "id1"

    def test_extract_fk_mappings_complex_scenario(self, service):
        result = service._extract_fk_mappings([])
        assert isinstance(result, dict)

    def test_register_primary_keys_with_null_values(self, service):
        table = Mock()
        table.id = 1
        table.name = "users"

        pk_col = Mock()
        pk_col.name = "id"
        pk_col.is_pk = True
        table.columns = [pk_col]

        service.table_config.get_by_id = Mock(return_value=table)

        mapped_rows = {
            "1": [
                {"id": 1, "name": None},
                {"id": 2, "email": None}
            ]
        }

        # Não deve lançar exceção
        service._register_primary_keys(mapped_rows, raw_mappings=[])

    def test_concurrent_mapping_updates(self, service):
        update1 = MappingUpdate(name="Update 1", status=StatusEnum.COMPLETE, migration_project_id=1)
        update2 = MappingUpdate(name="Update 2", status=StatusEnum.INCOMPLETE, migration_project_id=1)

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