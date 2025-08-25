from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .database import Base

class Livro(Base):
    __tablename__ = "livros"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(120), nullable=False, unique=True)
    autor = Column(String(80), nullable=False)
    ano = Column(Integer, nullable=False)
    genero = Column(String(50), nullable=True)
    isbn = Column(String(20), nullable=True)
    status = Column(String(20), nullable=False, default="disponível")
    data_emprestimo = Column(DateTime, nullable=True)
