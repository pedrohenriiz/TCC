# app/tests/unit/application/test_migration_context.py
"""
Testes para MigrationContext - Componente mais simples
"""
import pytest
from application.migration_context import MigrationContext


class TestMigrationContextBasic:
    """Testes básicos de registro e resolução"""
    
    def test_register_simple_key(self):
        """
        GIVEN: Um contexto vazio
        WHEN: Registramos uma chave natural simples
        THEN: A chave é armazenada corretamente
        """
        # Arrange
        context = MigrationContext()
        
        # Act
        context.register(
            entity='customers',
            natural_key='João Silva',
            destination_id=1
        )
        
        # Assert
        result = context.resolve('customers', 'João Silva')
        assert result == 1
    
    def test_register_multiple_keys_same_entity(self):
        """
        GIVEN: Um contexto vazio
        WHEN: Registramos múltiplas chaves da mesma entidade
        THEN: Todas são armazenadas corretamente
        """
        # Arrange
        context = MigrationContext()
        
        # Act
        context.register('customers', 'João Silva', 1)
        context.register('customers', 'Maria Souza', 2)
        
        # Assert
        assert context.resolve('customers', 'João Silva') == 1
        assert context.resolve('customers', 'Maria Souza') == 2
    
    def test_register_multiple_entities(self):
        """
        GIVEN: Um contexto vazio
        WHEN: Registramos chaves de entidades diferentes
        THEN: Cada entidade mantém suas chaves separadas
        """
        # Arrange
        context = MigrationContext()
        
        # Act
        context.register('customers', 'João Silva', 1)
        context.register('products', 'Notebook', 10)
        
        # Assert
        assert context.resolve('customers', 'João Silva') == 1
        assert context.resolve('products', 'Notebook') == 10
        assert context.resolve('customers', 'Notebook') is None
    
    def test_resolve_non_existing_key_returns_none(self):
        """
        GIVEN: Um contexto com dados
        WHEN: Tentamos resolver uma chave que não existe
        THEN: Retorna None
        """
        # Arrange
        context = MigrationContext()
        context.register('customers', 'João Silva', 1)
        
        # Act
        result = context.resolve('customers', 'Pedro Santos')
        
        # Assert
        assert result is None
    
    def test_has_entity(self):
        """
        GIVEN: Um contexto com uma entidade registrada
        WHEN: Verificamos se a entidade existe
        THEN: Retorna True para existente e False para não existente
        """
        # Arrange
        context = MigrationContext()
        context.register('customers', 'João Silva', 1)
        
        # Act & Assert
        assert context.has_entity('customers') is True
        assert context.has_entity('products') is False


class TestMigrationContextDuplicates:
    """Testes de detecção de duplicatas"""
    
    def test_strict_mode_blocks_duplicates(self):
        """
        GIVEN: Contexto em modo estrito (allow_duplicates=False)
        WHEN: Tentamos registrar a mesma natural key com ID diferente
        THEN: Levanta ValueError
        """
        # Arrange
        context = MigrationContext(allow_duplicates=False)
        context.register('customers', 'João Silva', 100)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Chave natural duplicada detectada"):
            context.register('customers', 'João Silva', 300)
    
    def test_permissive_mode_allows_duplicates(self):
        """
        GIVEN: Contexto em modo permissivo (allow_duplicates=True)
        WHEN: Registramos a mesma natural key com ID diferente
        THEN: Não levanta erro e armazena ambos
        """
        # Arrange
        context = MigrationContext(allow_duplicates=True)
        
        # Act
        context.register('customers', 'João Silva', 100)
        context.register('customers', 'João Silva', 300)
        
        # Assert
        assert context.has_duplicates() is True
    
    def test_first_strategy(self):
        """
        GIVEN: Contexto com strategy='first' e duplicatas
        WHEN: Resolvemos a chave duplicada
        THEN: Retorna o primeiro ID
        """
        # Arrange
        context = MigrationContext(allow_duplicates=True, duplicate_strategy='first')
        context.register('customers', 'João Silva', 100)
        context.register('customers', 'João Silva', 300)
        
        # Act
        result = context.resolve('customers', 'João Silva')
        
        # Assert
        assert result == 100
    
    def test_last_strategy(self):
        """
        GIVEN: Contexto com strategy='last' e duplicatas
        WHEN: Resolvemos a chave duplicada
        THEN: Retorna o último ID
        """
        # Arrange
        context = MigrationContext(allow_duplicates=True, duplicate_strategy='last')
        context.register('customers', 'João Silva', 100)
        context.register('customers', 'João Silva', 300)
        
        # Act
        result = context.resolve('customers', 'João Silva')
        
        # Assert
        assert result == 300
    
    def test_all_strategy_returns_list(self):
        """
        GIVEN: Contexto com strategy='all' e duplicatas
        WHEN: Resolvemos a chave duplicada
        THEN: Retorna lista com todos os IDs
        """
        # Arrange
        context = MigrationContext(allow_duplicates=True, duplicate_strategy='all')
        context.register('customers', 'João Silva', 100)
        context.register('customers', 'João Silva', 300)
        
        # Act
        result = context.resolve('customers', 'João Silva')
        
        # Assert
        assert result == [100, 300]

class TestMigrationContextStats:
    """Testes de estatísticas"""
    
    def test_get_stats_empty_context(self):
        """
        GIVEN: Contexto vazio
        WHEN: Chamamos get_stats()
        THEN: Retorna estrutura com zeros
        """
        # Arrange
        context = MigrationContext()
        
        # Act
        stats = context.get_stats()
        
        # Assert
        assert stats['total_entities'] == 0
        assert stats['total_keys'] == 0
        assert stats['duplicates'] == 0
        assert stats['entities'] == {}
    
    def test_get_stats_with_data(self):
        """
        GIVEN: Contexto com dados
        WHEN: Chamamos get_stats()
        THEN: Retorna estatísticas corretas
        """
        # Arrange
        context = MigrationContext(allow_duplicates=True)
        context.register('customers', 'João Silva', 100)
        context.register('customers', 'João Silva', 300)  # Duplicata
        context.register('customers', 'Maria Souza', 200)
        context.register('products', 'Notebook', 10)
        
        # Act
        stats = context.get_stats()
        
        # Assert
        assert stats['total_entities'] == 2
        assert stats['total_keys'] == 3  # João Silva, Maria Souza, Notebook
        assert stats['duplicates'] == 1
        assert stats['entities']['customers']['total_keys'] == 2
        assert stats['entities']['customers']['duplicate_keys'] == 1
        assert stats['entities']['products']['total_keys'] == 1
        assert stats['entities']['products']['duplicate_keys'] == 0
    
    def test_get_duplicate_warnings_details(self):
        """
        GIVEN: Múltiplas duplicatas
        WHEN: Obtemos warnings
        THEN: Detalhes completos são retornados
        """
        # Arrange
        context = MigrationContext(allow_duplicates=True)
        context.register('customers', 'João Silva', 100)
        context.register('customers', 'João Silva', 300)
        context.register('customers', 'João Silva', 500)  # Terceira duplicata
        
        # Act
        warnings = context.get_duplicate_warnings()
        
        # Assert
        assert len(warnings) == 2  # Duas tentativas de duplicata
        assert warnings[0]['natural_key'] == 'João Silva'
        assert warnings[0]['existing_ids'] == [100]
        assert warnings[0]['new_id'] == 300
        assert warnings[1]['existing_ids'] == [100, 300]
        assert warnings[1]['new_id'] == 500