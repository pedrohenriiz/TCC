# app/tests/unit/application/test_natural_key_resolver.py
"""
Testes para NaturalKeyResolver
"""
import pytest
from application.migration_context import MigrationContext
from application.natural_key_resolver import NaturalKeyResolver


class TestNaturalKeyResolverBasic:
    """Testes básicos de resolução"""
    
    @pytest.fixture
    def context(self):
        """Contexto com dados de teste"""
        ctx = MigrationContext()
        ctx.register('customers', 'João Silva', 1)
        ctx.register('customers', 'Maria Souza', 2)
        return ctx
    
    @pytest.fixture
    def resolver(self, context):
        """Resolver com contexto pré-populado"""
        return NaturalKeyResolver(context)
    
    def test_resolve_rows_simple(self, resolver):
        """
        GIVEN: Dados com coluna de natural key
        WHEN: Resolvemos as linhas
        THEN: Natural key é substituída por ID
        """
        # Arrange
        rows = [
            {'id': '1', 'customer_name': 'João Silva', 'number': '999'}
        ]
        
        # Act
        result = resolver.resolve_rows(
            rows=rows,
            source_column='customer_name',
            target_column='customer_id',
            entity='customers'
        )
        
        # Assert
        assert len(result) == 1
        assert result[0]['id'] == '1'
        assert result[0]['customer_id'] == 1
        assert 'customer_name' not in result[0]
        assert result[0]['number'] == '999'
    
    def test_resolve_rows_keeps_source_if_same_as_target(self):
        """
        GIVEN: source_column e target_column são iguais
        WHEN: Resolvemos as linhas
        THEN: Coluna não é removida, apenas valor substituído
        """
        # Arrange
        context = MigrationContext()
        context.register('customers', 'João Silva', 1)
        resolver = NaturalKeyResolver(context)
        
        rows = [
            {'id': '1', 'customer_id': 'João Silva', 'number': '999'}
        ]
        
        # Act
        result = resolver.resolve_rows(
            rows=rows,
            source_column='customer_id',
            target_column='customer_id',
            entity='customers'
        )
        
        # Assert
        assert 'customer_id' in result[0]
        assert result[0]['customer_id'] == 1
    
    def test_resolve_rows_not_found_raises(self):
        """
        GIVEN: Natural key que não existe no contexto
        WHEN: Tentamos resolver
        THEN: Levanta ValueError
        """
        # Arrange
        context = MigrationContext()
        context.register('customers', 'João Silva', 1)
        resolver = NaturalKeyResolver(context)
        
        rows = [
            {'id': '1', 'customer_name': 'Pedro Santos', 'number': '999'}
        ]
        
        # Act & Assert
        with pytest.raises(ValueError, match="Chave natural não encontrada"):
            resolver.resolve_rows(
                rows=rows,
                source_column='customer_name',
                target_column='customer_id',
                entity='customers'
            )

    def test_resolve_rows_multiple(self, resolver):
        """
        GIVEN: Múltiplas linhas com natural keys diferentes
        WHEN: Resolvemos as linhas
        THEN: Todas são resolvidas corretamente
        """
        # Arrange
        rows = [
            {'id': '1', 'customer_name': 'João Silva', 'number': '111'},
            {'id': '2', 'customer_name': 'Maria Souza', 'number': '222'}
        ]
        
        # Act
        result = resolver.resolve_rows(
            rows=rows,
            source_column='customer_name',
            target_column='customer_id',
            entity='customers'
        )
        
        # Assert
        assert len(result) == 2
        assert result[0]['customer_id'] == 1
        assert result[1]['customer_id'] == 2
        assert 'customer_name' not in result[0]
        assert 'customer_name' not in result[1]
    
    def test_resolve_rows_preserves_other_columns(self, resolver):
        """
        GIVEN: Dados com múltiplas colunas
        WHEN: Resolvemos apenas uma coluna
        THEN: Outras colunas são preservadas
        """
        # Arrange
        rows = [
            {'id': '1', 'customer_name': 'João Silva', 'number': '999', 'type': 'mobile', 'active': True}
        ]
        
        # Act
        result = resolver.resolve_rows(
            rows=rows,
            source_column='customer_name',
            target_column='customer_id',
            entity='customers'
        )
        
        # Assert
        assert result[0]['id'] == '1'
        assert result[0]['number'] == '999'
        assert result[0]['type'] == 'mobile'
        assert result[0]['active'] is True
        assert result[0]['customer_id'] == 1


class TestNaturalKeyResolverExpansion:
    """Testes de expansão de linhas com duplicatas"""
    
    def test_resolve_rows_with_list_expands(self):
        """
        GIVEN: Contexto com strategy='all' retornando lista
        WHEN: Resolvemos as linhas
        THEN: Uma linha é expandida em múltiplas
        """
        # Arrange
        context = MigrationContext(allow_duplicates=True, duplicate_strategy='all')
        context.register('customers', 'João Silva', 100)
        context.register('customers', 'João Silva', 300)
        resolver = NaturalKeyResolver(context)
        
        rows = [
            {'id': '1', 'customer_name': 'João Silva', 'number': '999'}
        ]
        
        # Act
        result = resolver.resolve_rows(
            rows=rows,
            source_column='customer_name',
            target_column='customer_id',
            entity='customers',
            table_name='phones'
        )
        
        # Assert
        assert len(result) == 2
        assert result[0]['customer_id'] == 100
        assert result[1]['customer_id'] == 300
    
    def test_resolve_rows_expansion_generates_unique_ids(self):
        """
        GIVEN: Expansão de linhas
        WHEN: Linhas são expandidas
        THEN: IDs únicos são gerados para linhas adicionais
        """
        # Arrange
        context = MigrationContext(allow_duplicates=True, duplicate_strategy='all')
        context.register('customers', 'João Silva', 100)
        context.register('customers', 'João Silva', 300)
        resolver = NaturalKeyResolver(context)
        
        rows = [
            {'id': '1', 'customer_name': 'João Silva', 'number': '999'}
        ]
        
        # Act
        result = resolver.resolve_rows(
            rows=rows,
            source_column='customer_name',
            target_column='customer_id',
            entity='customers',
            table_name='phones'
        )
        
        # Assert
        assert result[0]['id'] == '1'  # Primeiro mantém ID original
        assert result[1]['id'] == '2'  # Segundo tem novo ID
        assert result[0]['id'] != result[1]['id']

    def test_resolve_rows_expansion_preserves_first_id(self):
        """
        GIVEN: Expansão de linhas
        WHEN: Linhas são expandidas
        THEN: Primeira linha mantém ID original
        """
        # Arrange
        context = MigrationContext(allow_duplicates=True, duplicate_strategy='all')
        context.register('customers', 'João Silva', 100)
        context.register('customers', 'João Silva', 300)
        resolver = NaturalKeyResolver(context)
        
        rows = [
            {'id': '5', 'customer_name': 'João Silva', 'number': '999'}
        ]
        
        # Act
        result = resolver.resolve_rows(
            rows=rows,
            source_column='customer_name',
            target_column='customer_id',
            entity='customers',
            table_name='phones'
        )
        
        # Assert
        assert result[0]['id'] == '5'  # Mantém original
        assert result[1]['id'] == '6'  # Novo ID gerado
    
    def test_resolve_rows_multiple_duplicates(self):
        """
        GIVEN: Múltiplas linhas com duplicatas diferentes
        WHEN: Resolvemos todas
        THEN: Cada linha é expandida corretamente
        """
        # Arrange
        context = MigrationContext(allow_duplicates=True, duplicate_strategy='all')
        context.register('customers', 'João Silva', 100)
        context.register('customers', 'João Silva', 300)
        context.register('customers', 'Maria Souza', 200)  # Sem duplicata
        resolver = NaturalKeyResolver(context)
        
        rows = [
            {'id': '1', 'customer_name': 'João Silva', 'number': '111'},
            {'id': '2', 'customer_name': 'Maria Souza', 'number': '222'}
        ]
        
        # Act
        result = resolver.resolve_rows(
            rows=rows,
            source_column='customer_name',
            target_column='customer_id',
            entity='customers',
            table_name='phones'
        )
        
        # Assert
        assert len(result) == 3  # João expandiu (2) + Maria (1)
        # João Silva - primeira ocorrência
        assert result[0]['id'] == '1'
        assert result[0]['customer_id'] == 100
        # João Silva - segunda ocorrência (ID gerado)
        assert result[1]['id'] == '3'
        assert result[1]['customer_id'] == 300
        # Maria Souza
        assert result[2]['id'] == '2'
        assert result[2]['customer_id'] == 200
    
    def test_resolve_rows_expansion_increments_correctly(self):
        """
        GIVEN: Dados com IDs não sequenciais
        WHEN: Linhas são expandidas
        THEN: Novo ID é max(IDs) + 1
        """
        # Arrange
        context = MigrationContext(allow_duplicates=True, duplicate_strategy='all')
        context.register('customers', 'João Silva', 100)
        context.register('customers', 'João Silva', 300)
        resolver = NaturalKeyResolver(context)
        
        rows = [
            {'id': '10', 'customer_name': 'João Silva', 'number': '999'}
        ]
        
        # Act
        result = resolver.resolve_rows(
            rows=rows,
            source_column='customer_name',
            target_column='customer_id',
            entity='customers',
            table_name='phones'
        )
        
        # Assert
        assert result[0]['id'] == '10'  # Mantém original
        assert result[1]['id'] == '11'  # max(10) + 1