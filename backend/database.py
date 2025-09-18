from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
import os

# Configuração do banco de dados para produção
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./app.db")

# Fix para Railway/Heroku PostgreSQL URLs
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configuração do engine baseada no tipo de banco
if "postgresql" in DATABASE_URL:
    # PostgreSQL para produção
    engine = create_engine(
        DATABASE_URL,
        echo=False  # Desabilitar logs em produção
    )
else:
    # SQLite para desenvolvimento
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False},
        echo=True  # Para debug - mostra as queries SQL
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Cria todas as tabelas no banco de dados"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency para obter sessão do banco de dados"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_database():
    """Inicializa o banco de dados criando as tabelas"""
    create_tables()
    print("✅ Banco de dados inicializado com sucesso!")
