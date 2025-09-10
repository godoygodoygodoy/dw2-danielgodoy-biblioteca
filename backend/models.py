from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import datetime

Base = declarative_base()

class Livro(Base):
    __tablename__ = "livros"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(90), nullable=False, index=True)
    autor = Column(String(100), nullable=False)
    ano = Column(Integer, nullable=False)
    genero = Column(String(50), nullable=True)
    isbn = Column(String(20), nullable=True, unique=True)
    status = Column(String(20), nullable=False, default="disponível")  # disponível, emprestado
    data_emprestimo = Column(DateTime, nullable=True)
    editora = Column(String(50), nullable=True)  # Marvel, DC, Image, etc.
    numero_edicao = Column(Integer, nullable=True)  # Para HQs
    descricao = Column(Text, nullable=True)
    capa_url = Column(String(255), nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "autor": self.autor,
            "ano": self.ano,
            "genero": self.genero,
            "isbn": self.isbn,
            "status": self.status,
            "data_emprestimo": self.data_emprestimo.isoformat() if self.data_emprestimo else None,
            "editora": self.editora,
            "numero_edicao": self.numero_edicao,
            "descricao": self.descricao,
            "capa_url": self.capa_url
        }
