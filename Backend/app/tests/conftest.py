import pytest
import sys
from pathlib import Path

app_dir = Path(__file__).parent.parent
sys.path.insert(0, str(app_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from infra.database.connection import Base

# Importa todos os models para garantir que o SQLAlchemy os registre antes do create_all
import domain.entities.mapping
import domain.entities.migration_project
import domain.entities.setting
import domain.entities.table_config
import domain.entities.transformation

TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def db_engine():
    engine = create_engine(TEST_DATABASE_URL, echo=False)
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(db_engine):
    Session = sessionmaker(bind=db_engine)
    session = Session()
    yield session
    session.rollback()
    session.close()


@pytest.fixture
def sample_customers_data():
    return [
        {'id': '1', 'name': 'João Silva', 'email': 'joao@email.com'},
        {'id': '2', 'name': 'Maria Souza', 'email': 'maria@email.com'}
    ]


@pytest.fixture
def sample_phones_data():
    return [
        {'id': '1', 'customer_name': 'João Silva', 'number': '11999999999'},
        {'id': '2', 'customer_name': 'Maria Souza', 'number': '11888888888'}
    ]


@pytest.fixture
def sample_customers_with_duplicates():
    return [
        {'id': '100', 'name': 'João Silva', 'email': 'joao@email.com'},
        {'id': '200', 'name': 'Maria Souza', 'email': 'maria@email.com'},
        {'id': '300', 'name': 'João Silva', 'email': 'joao2@email.com'}
    ]