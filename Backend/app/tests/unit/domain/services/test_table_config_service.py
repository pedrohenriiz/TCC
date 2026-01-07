import pytest
from unittest.mock import Mock, MagicMock, patch
from datetime import datetime
from sqlalchemy.orm import Session

from domain.services.table_config_service import TableConfigService
from interfaces.schemas.table_config_schema import TableConfigCreate, TableConfigUpdate
from domain.entities.table_config import TableConfigs, TableConfigColumns


class TestTableConfigService:
    """Testes para o TableConfigService"""

    @pytest.fixture
    def mock_db(self):
        """Mock do banco de dados"""
        return Mock(spec=Session)

    @pytest.fixture
    def service(self, mock_db):
        """Instância do serviço para testes"""
        return TableConfigService(mock_db)

    @pytest.fixture
    def sample_column_data(self):
        """Dados de exemplo para coluna"""
        return {
            "name": "id",
            "type": "integer",
            "size": None,
            "is_pk": True,
            "is_nullable": False,
            "foreign_table_id": None,
            "foreign_column_id": None
        }

    @pytest.fixture
    def sample_table_create(self, sample_column_data):
        """Dados de exemplo para criar tabela"""
        return TableConfigCreate(
            name="users",
            exhibition_name="Users Table",
            columns=[sample_column_data]
        )

    @pytest.fixture
    def sample_table_update(self):
        """Dados de exemplo para atualizar tabela"""
        return TableConfigUpdate(
            name="users_updated",
            exhibition_name="Updated Users Table"
        )

    @pytest.fixture
    def sample_table(self):
        """Tabela de exemplo"""
        table = Mock(spec=TableConfigs)
        table.id = 1
        table.name = "users"
        table.exhibition_name = "Users Table"
        table.created_at = datetime.now()
        table.updated_at = None
        table.deleted_at = None
        
        # Coluna PK
        pk_column = Mock(spec=TableConfigColumns)
        pk_column.id = 1
        pk_column.name = "id"
        pk_column.type = "integer"
        pk_column.is_pk = True
        pk_column.is_nullable = False
        pk_column.foreign_table_id = None
        pk_column.foreign_column_id = None
        
        table.columns = [pk_column]
        return table

    @pytest.fixture
    def sample_table_with_fk(self):
        """Tabela com FK de exemplo"""
        table = Mock(spec=TableConfigs)
        table.id = 2
        table.name = "orders"
        table.exhibition_name = "Orders Table"
        
        # Coluna PK - SEM FK
        pk_column = Mock(spec=TableConfigColumns)
        pk_column.id = 10
        pk_column.name = "id"
        pk_column.type = "integer"
        pk_column.is_pk = True
        pk_column.is_nullable = False
        pk_column.foreign_table_id = None  # PK não tem FK
        pk_column.foreign_column_id = None
        
        # Coluna FK - COM FK
        fk_column = Mock(spec=TableConfigColumns)
        fk_column.id = 11
        fk_column.name = "user_id"
        fk_column.type = "integer"
        fk_column.is_pk = False
        fk_column.is_nullable = True
        fk_column.foreign_table_id = 1  # Tem FK
        fk_column.foreign_column_id = 1
        
        table.columns = [pk_column, fk_column]
        return table

    # ============================================
    # TESTES DE CRUD BÁSICO
    # ============================================

    def test_create_table(self, service, sample_table_create, sample_table):
        """Testa criação de tabela"""
        service.repo.create = Mock(return_value=sample_table)

        result = service.create_table(sample_table_create)

        service.repo.create.assert_called_once_with(sample_table_create)
        assert result == sample_table
        assert result.name == "users"

    def test_create_table_with_multiple_columns(self, service):
        """Testa criação de tabela com múltiplas colunas"""
        table_create = TableConfigCreate(
            name="products",
            exhibition_name="Products",
            columns=[
                {
                    "name": "id",
                    "type": "integer",
                    "is_pk": True,
                    "is_nullable": False
                },
                {
                    "name": "name",
                    "type": "varchar",
                    "size": 100,
                    "is_pk": False,
                    "is_nullable": False
                },
                {
                    "name": "price",
                    "type": "decimal",
                    "is_pk": False,
                    "is_nullable": True
                }
            ]
        )
        
        table = Mock()
        table.id = 1
        table.name = "products"
        service.repo.create = Mock(return_value=table)

        result = service.create_table(table_create)

        service.repo.create.assert_called_once()
        assert result.name == "products"

    def test_create_table_without_columns(self, service):
        """Testa criação de tabela sem colunas"""
        table_create = TableConfigCreate(
            name="empty_table",
            exhibition_name="Empty Table",
            columns=[]
        )
        
        table = Mock()
        table.id = 1
        table.columns = []
        service.repo.create = Mock(return_value=table)

        result = service.create_table(table_create)

        service.repo.create.assert_called_once()
        assert result is not None

    def test_list_tables_without_columns(self, service):
        """Testa listagem de tabelas sem colunas"""
        expected_tables = [
            {
                "id": 1,
                "name": "users",
                "exhibition_name": "Users",
                "total_columns": 3,
                "total_foreign_keys": 0,
                "created_at": datetime.now()
            },
            {
                "id": 2,
                "name": "orders",
                "exhibition_name": "Orders",
                "total_columns": 5,
                "total_foreign_keys": 1,
                "created_at": datetime.now()
            }
        ]
        service.repo.list_tables = Mock(return_value=expected_tables)

        result = service.list_tables(with_columns=False)

        service.repo.list_tables.assert_called_once_with(False)
        assert len(result) == 2
        assert result[0]["name"] == "users"
        assert result[1]["name"] == "orders"

    def test_list_tables_with_columns(self, service):
        """Testa listagem de tabelas com colunas"""
        expected_tables = [
            {
                "id": 1,
                "name": "users",
                "exhibition_name": "Users",
                "total_columns": 2,
                "total_foreign_keys": 0,
                "created_at": datetime.now(),
                "columns": [
                    {
                        "id": 1,
                        "name": "id",
                        "type": "integer",
                        "foreign_table_id": None,
                        "foreign_column_id": None
                    },
                    {
                        "id": 2,
                        "name": "name",
                        "type": "varchar",
                        "foreign_table_id": None,
                        "foreign_column_id": None
                    }
                ]
            }
        ]
        service.repo.list_tables = Mock(return_value=expected_tables)

        result = service.list_tables(with_columns=True)

        service.repo.list_tables.assert_called_once_with(True)
        assert len(result) == 1
        assert "columns" in result[0]
        assert len(result[0]["columns"]) == 2

    def test_list_tables_empty(self, service):
        """Testa listagem quando não há tabelas"""
        service.repo.list_tables = Mock(return_value=[])

        result = service.list_tables()

        assert result == []

    def test_show_table(self, service, sample_table):
        """Testa exibição de uma tabela específica"""
        service.repo.get_by_id = Mock(return_value=sample_table)

        result = service.show_table(table_id=1)

        service.repo.get_by_id.assert_called_once_with(1)
        assert result == sample_table
        assert result.name == "users"

    def test_show_table_not_found(self, service):
        """Testa exibição de tabela inexistente"""
        service.repo.get_by_id = Mock(return_value=None)

        result = service.show_table(table_id=999)

        assert result is None

    def test_show_table_with_columns(self, service, sample_table):
        """Testa exibição de tabela com suas colunas"""
        service.repo.get_by_id = Mock(return_value=sample_table)

        result = service.show_table(table_id=1)

        assert result is not None
        assert len(result.columns) == 1
        assert result.columns[0].name == "id"

    def test_delete_table_success(self, service):
        """Testa exclusão bem-sucedida de tabela"""
        service.repo.delete_tables = Mock(return_value=True)

        result = service.delete_tables(table_id=1)

        service.repo.delete_tables.assert_called_once_with(1)
        assert result is True

    def test_delete_table_not_found(self, service):
        """Testa exclusão de tabela inexistente"""
        service.repo.delete_tables = Mock(return_value=False)

        result = service.delete_tables(table_id=999)

        assert result is False

    def test_update_table_name(self, service, sample_table):
        """Testa atualização do nome da tabela"""
        update_data = Mock()
        update_data.dict.return_value = {
            "name": "users_v2",
            "exhibition_name": "Users V2"
        }
        
        updated_table = Mock()
        updated_table.name = "users_v2"
        updated_table.exhibition_name = "Users V2"
        
        service.repo.update_table = Mock(return_value=updated_table)

        result = service.update_table(table_id=1, data=update_data)

        service.repo.update_table.assert_called_once_with(1, update_data)
        assert result.name == "users_v2"

    def test_update_table_not_found(self, service):
        """Testa atualização de tabela inexistente"""
        update_data = Mock()
        service.repo.update_table = Mock(return_value=None)

        result = service.update_table(table_id=999, data=update_data)

        assert result is None

    # ============================================
    # TESTES DE COLUNAS
    # ============================================

    def test_update_table_add_column(self, service, sample_table):
        """Testa adição de nova coluna"""
        update_data = Mock()
        update_data.dict.return_value = {
            "columns": [
                {
                    "name": "id",
                    "type": "integer",
                    "is_pk": True,
                    "is_nullable": False
                },
                {
                    "name": "email",
                    "type": "varchar",
                    "size": 255,
                    "is_pk": False,
                    "is_nullable": False
                }
            ]
        }
        
        updated_table = Mock()
        updated_table.columns = [Mock(), Mock()]
        service.repo.update_table = Mock(return_value=updated_table)

        result = service.update_table(table_id=1, data=update_data)

        service.repo.update_table.assert_called_once()
        assert len(result.columns) == 2

    def test_update_table_remove_column(self, service):
        """Testa remoção de coluna"""
        update_data = Mock()
        update_data.dict.return_value = {
            "columns": [
                {
                    "name": "id",
                    "type": "integer",
                    "is_pk": True,
                    "is_nullable": False
                }
            ]
        }
        
        updated_table = Mock()
        updated_table.columns = [Mock()]
        service.repo.update_table = Mock(return_value=updated_table)

        result = service.update_table(table_id=1, data=update_data)

        assert len(result.columns) == 1

    def test_update_table_modify_column(self, service):
        """Testa modificação de coluna existente"""
        update_data = Mock()
        update_data.dict.return_value = {
            "columns": [
                {
                    "name": "id",
                    "type": "bigint",  # Tipo modificado
                    "is_pk": True,
                    "is_nullable": False
                }
            ]
        }
        
        updated_table = Mock()
        service.repo.update_table = Mock(return_value=updated_table)

        result = service.update_table(table_id=1, data=update_data)

        service.repo.update_table.assert_called_once()

    # ============================================
    # TESTES DE FOREIGN KEYS
    # ============================================

    def test_create_table_with_foreign_key(self, service):
        """Testa criação de tabela com FK"""
        table_create = TableConfigCreate(
            name="orders",
            exhibition_name="Orders",
            columns=[
                {
                    "name": "id",
                    "type": "integer",
                    "is_pk": True,
                    "is_nullable": False
                },
                {
                    "name": "user_id",
                    "type": "integer",
                    "is_pk": False,
                    "is_nullable": True,
                    "foreign_table_id": 1,
                    "foreign_column_id": 1
                }
            ]
        )
        
        table = Mock()
        table.id = 2
        table.name = "orders"
        service.repo.create = Mock(return_value=table)

        result = service.create_table(table_create)

        service.repo.create.assert_called_once()
        assert result.name == "orders"

    def test_list_tables_shows_foreign_keys_count(self, service):
        """Testa que a listagem mostra contagem de FKs"""
        expected_tables = [
            {
                "id": 1,
                "name": "users",
                "total_columns": 2,
                "total_foreign_keys": 0
            },
            {
                "id": 2,
                "name": "orders",
                "total_columns": 3,
                "total_foreign_keys": 2
            }
        ]
        service.repo.list_tables = Mock(return_value=expected_tables)

        result = service.list_tables()

        assert result[0]["total_foreign_keys"] == 0
        assert result[1]["total_foreign_keys"] == 2

    def test_show_table_with_foreign_keys(self, service, sample_table_with_fk):
        """Testa exibição de tabela com FKs"""
        service.repo.get_by_id = Mock(return_value=sample_table_with_fk)

        result = service.show_table(table_id=2)

        assert result is not None
        # Verifica que existem colunas com FK
        fk_columns = [c for c in result.columns if c.foreign_table_id is not None]
        assert len(fk_columns) == 1
        assert fk_columns[0].name == "user_id"
        assert fk_columns[0].foreign_table_id == 1
        assert fk_columns[0].foreign_column_id == 1

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
        created = service.create_table(sample_table_create)
        assert created.id == 1
        
        # List
        service.repo.list_tables = Mock(return_value=[{"id": 1, "name": "users"}])
        listed = service.list_tables()
        assert len(listed) == 1
        
        # Show
        service.repo.get_by_id = Mock(return_value=created_table)
        shown = service.show_table(table_id=1)
        assert shown.id == 1
        
        # Update
        update_data = Mock()
        update_data.dict.return_value = {"name": "users_v2"}
        updated_table = Mock()
        updated_table.name = "users_v2"
        service.repo.update_table = Mock(return_value=updated_table)
        updated = service.update_table(table_id=1, data=update_data)
        assert updated.name == "users_v2"
        
        # Delete
        service.repo.delete_tables = Mock(return_value=True)
        deleted = service.delete_tables(table_id=1)
        assert deleted is True

    def test_create_multiple_tables(self, service):
        """Testa criação de múltiplas tabelas"""
        tables_data = [
            TableConfigCreate(name="users", exhibition_name="Users", columns=[]),
            TableConfigCreate(name="orders", exhibition_name="Orders", columns=[]),
            TableConfigCreate(name="products", exhibition_name="Products", columns=[])
        ]
        
        created_tables = []
        for i, table_data in enumerate(tables_data):
            mock_table = Mock()
            mock_table.id = i + 1
            mock_table.name = table_data.name
            created_tables.append(mock_table)
        
        service.repo.create = Mock(side_effect=created_tables)
        
        results = [service.create_table(data) for data in tables_data]
        
        assert len(results) == 3
        assert service.repo.create.call_count == 3

    # ============================================
    # TESTES DE EDGE CASES
    # ============================================

    def test_create_table_with_empty_exhibition_name(self, service):
        """Testa criação com exhibition_name vazio"""
        table_create = TableConfigCreate(
            name="test_table",
            exhibition_name="",  # String vazia, não None
            columns=[]
        )
        
        table = Mock()
        table.name = "test_table"
        table.exhibition_name = ""
        service.repo.create = Mock(return_value=table)

        result = service.create_table(table_create)

        service.repo.create.assert_called_once()
        assert result.exhibition_name == ""

    def test_list_tables_with_zero_columns(self, service):
        """Testa listagem de tabela sem colunas"""
        expected_tables = [
            {
                "id": 1,
                "name": "empty_table",
                "total_columns": 0,
                "total_foreign_keys": 0
            }
        ]
        service.repo.list_tables = Mock(return_value=expected_tables)

        result = service.list_tables()

        assert result[0]["total_columns"] == 0

    def test_update_table_with_empty_columns_list(self, service):
        """Testa atualização com lista vazia de colunas"""
        update_data = Mock()
        update_data.dict.return_value = {"columns": []}
        
        updated_table = Mock()
        updated_table.columns = []
        service.repo.update_table = Mock(return_value=updated_table)

        result = service.update_table(table_id=1, data=update_data)

        assert result.columns == []

    def test_delete_table_twice(self, service):
        """Testa exclusão dupla da mesma tabela"""
        service.repo.delete_tables = Mock(side_effect=[True, False])

        first_delete = service.delete_tables(table_id=1)
        second_delete = service.delete_tables(table_id=1)

        assert first_delete is True
        assert second_delete is False

    def test_show_table_with_none_id(self, service):
        """Testa show com ID None"""
        service.repo.get_by_id = Mock(return_value=None)

        result = service.show_table(table_id=None)

        assert result is None

    def test_create_table_with_special_characters(self, service):
        """Testa criação com caracteres especiais no nome"""
        table_create = TableConfigCreate(
            name="user_data_2024",
            exhibition_name="User Data (2024)",
            columns=[]
        )
        
        table = Mock()
        table.name = "user_data_2024"
        service.repo.create = Mock(return_value=table)

        result = service.create_table(table_create)

        assert result.name == "user_data_2024"

    def test_list_tables_ordered_by_name(self, service):
        """Testa que listagem retorna ordenada por nome"""
        expected_tables = [
            {"id": 2, "name": "orders"},
            {"id": 3, "name": "products"},
            {"id": 1, "name": "users"}
        ]
        service.repo.list_tables = Mock(return_value=expected_tables)

        result = service.list_tables()

        # Verifica que mantém a ordem retornada pelo repo
        assert result[0]["name"] == "orders"
        assert result[1]["name"] == "products"
        assert result[2]["name"] == "users"

    def test_update_table_partial_update(self, service):
        """Testa atualização parcial (apenas alguns campos)"""
        update_data = Mock()
        update_data.dict.return_value = {
            "exhibition_name": "New Exhibition Name"
            # Não inclui 'name' nem 'columns'
        }
        
        updated_table = Mock()
        updated_table.exhibition_name = "New Exhibition Name"
        service.repo.update_table = Mock(return_value=updated_table)

        result = service.update_table(table_id=1, data=update_data)

        assert result.exhibition_name == "New Exhibition Name"

    def test_create_table_with_precision_column(self, service):
        """Testa criação com coluna decimal que tem precision"""
        table_create = TableConfigCreate(
            name="financial",
            exhibition_name="Financial Data",
            columns=[
                {
                    "name": "amount",
                    "type": "decimal",
                    "size": 10,
                    "precision": 2,
                    "is_pk": False,
                    "is_nullable": True
                }
            ]
        )
        
        table = Mock()
        service.repo.create = Mock(return_value=table)

        result = service.create_table(table_create)

        service.repo.create.assert_called_once()


class TestTableConfigServiceValidation:
    """Testes de validação e regras de negócio"""

    @pytest.fixture
    def service(self):
        mock_db = Mock(spec=Session)
        return TableConfigService(mock_db)

    def test_cannot_delete_nonexistent_table(self, service):
        """Testa que não pode deletar tabela inexistente"""
        service.repo.delete_tables = Mock(return_value=False)

        result = service.delete_tables(table_id=999)

        assert result is False

    def test_list_with_columns_includes_fk_info(self, service):
        """Testa que listagem com colunas inclui info de FK"""
        expected_tables = [
            {
                "id": 1,
                "name": "orders",
                "columns": [
                    {
                        "id": 1,
                        "name": "user_id",
                        "type": "integer",
                        "foreign_table_id": 2,
                        "foreign_column_id": 1
                    }
                ]
            }
        ]
        service.repo.list_tables = Mock(return_value=expected_tables)

        result = service.list_tables(with_columns=True)

        assert result[0]["columns"][0]["foreign_table_id"] == 2
        assert result[0]["columns"][0]["foreign_column_id"] == 1


if __name__ == '__main__':
    pytest.main([__file__, '-v'])