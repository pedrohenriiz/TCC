from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./data.db"

engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    """Cria as tabelas e popula os dados iniciais."""
    from infra.database.connection import Base, engine
    import domain.entities  # garante que todos os models são importados antes do create_all

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        from domain.repositories.setting_repository import SettingRepository
        SettingRepository(db).seed()
    finally:
        db.close()