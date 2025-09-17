from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import uvicorn

from database import get_db, init_database
from models import Livro

# Inicializar FastAPI
app = FastAPI(
    title="Sistema Biblioteca Escolar - API",
    description="API RESTful para gerenciamento de biblioteca com foco em HQs",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic para validação
class LivroCreate(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=90, description="Título do livro")
    autor: str = Field(..., min_length=1, max_length=100, description="Autor do livro")
    ano: int = Field(..., ge=1900, le=datetime.now().year, description="Ano de publicação")
    genero: Optional[str] = Field(None, max_length=50, description="Gênero do livro")
    isbn: Optional[str] = Field(None, max_length=20, description="ISBN do livro")
    editora: Optional[str] = Field(None, max_length=50, description="Editora (Marvel, DC, Image, etc.)")
    numero_edicao: Optional[int] = Field(None, ge=1, description="Número da edição (para HQs)")
    descricao: Optional[str] = Field(None, description="Descrição do livro")
    capa_url: Optional[str] = Field(None, max_length=255, description="URL da capa")

class LivroUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=3, max_length=90)
    autor: Optional[str] = Field(None, min_length=1, max_length=100)
    ano: Optional[int] = Field(None, ge=1900, le=datetime.now().year)
    genero: Optional[str] = Field(None, max_length=50)
    isbn: Optional[str] = Field(None, max_length=20)
    editora: Optional[str] = Field(None, max_length=50)
    numero_edicao: Optional[int] = Field(None, ge=1)
    descricao: Optional[str] = None
    capa_url: Optional[str] = Field(None, max_length=255)

class LivroResponse(BaseModel):
    id: int
    titulo: str
    autor: str
    ano: int
    genero: Optional[str]
    isbn: Optional[str]
    status: str
    data_emprestimo: Optional[str]
    editora: Optional[str]
    numero_edicao: Optional[int]
    descricao: Optional[str]
    capa_url: Optional[str]

# Endpoint de saúde
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Sistema Biblioteca API está funcionando!"}

# Endpoints principais
@app.get("/livros", response_model=List[LivroResponse])
async def listar_livros(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Buscar por título ou autor"),
    genero: Optional[str] = Query(None, description="Filtrar por gênero"),
    editora: Optional[str] = Query(None, description="Filtrar por editora"),
    ano: Optional[int] = Query(None, description="Filtrar por ano"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    limit: Optional[int] = Query(10, ge=1, le=100, description="Limite de resultados"),
    offset: Optional[int] = Query(0, ge=0, description="Offset para paginação")
):
    """Listar livros com filtros opcionais"""
    try:
        query = db.query(Livro)
        
        if search:
            query = query.filter(
                (Livro.titulo.ilike(f"%{search}%")) | 
                (Livro.autor.ilike(f"%{search}%"))
            )
        
        if genero:
            query = query.filter(Livro.genero.ilike(f"%{genero}%"))
        
        if editora:
            query = query.filter(Livro.editora.ilike(f"%{editora}%"))
            
        if ano:
            query = query.filter(Livro.ano == ano)
            
        if status:
            query = query.filter(Livro.status == status)
        
        livros = query.offset(offset).limit(limit).all()
        return [livro.to_dict() for livro in livros]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@app.post("/livros", response_model=LivroResponse, status_code=201)
async def criar_livro(livro_data: LivroCreate, db: Session = Depends(get_db)):
    """Criar um novo livro"""
    try:
        # Verificar se já existe livro com mesmo título e autor
        livro_existente = db.query(Livro).filter(
            Livro.titulo == livro_data.titulo,
            Livro.autor == livro_data.autor
        ).first()
        
        if livro_existente:
            raise HTTPException(
                status_code=400, 
                detail="Já existe um livro com este título e autor"
            )
        
        # Verificar ISBN único se fornecido
        if livro_data.isbn:
            isbn_existente = db.query(Livro).filter(Livro.isbn == livro_data.isbn).first()
            if isbn_existente:
                raise HTTPException(
                    status_code=400,
                    detail="Já existe um livro com este ISBN"
                )
        
        novo_livro = Livro(
            titulo=livro_data.titulo,
            autor=livro_data.autor,
            ano=livro_data.ano,
            genero=livro_data.genero,
            isbn=livro_data.isbn,
            editora=livro_data.editora,
            numero_edicao=livro_data.numero_edicao,
            descricao=livro_data.descricao,
            capa_url=livro_data.capa_url,
            status="disponível"
        )
        
        db.add(novo_livro)
        db.commit()
        db.refresh(novo_livro)
        
        return novo_livro.to_dict()
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar livro: {str(e)}")

@app.get("/livros/{livro_id}", response_model=LivroResponse)
async def obter_livro(livro_id: int, db: Session = Depends(get_db)):
    """Obter um livro específico por ID"""
    livro = db.query(Livro).filter(Livro.id == livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    return livro.to_dict()

@app.put("/livros/{livro_id}", response_model=LivroResponse)
async def atualizar_livro(livro_id: int, livro_data: LivroUpdate, db: Session = Depends(get_db)):
    """Atualizar um livro existente"""
    try:
        livro = db.query(Livro).filter(Livro.id == livro_id).first()
        if not livro:
            raise HTTPException(status_code=404, detail="Livro não encontrado")
        
        # Atualizar apenas os campos fornecidos
        update_data = livro_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(livro, field, value)
        
        db.commit()
        db.refresh(livro)
        
        return livro.to_dict()
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar livro: {str(e)}")

@app.delete("/livros/{livro_id}")
async def deletar_livro(livro_id: int, db: Session = Depends(get_db)):
    """Deletar um livro"""
    try:
        livro = db.query(Livro).filter(Livro.id == livro_id).first()
        if not livro:
            raise HTTPException(status_code=404, detail="Livro não encontrado")
        
        if livro.status == "emprestado":
            raise HTTPException(
                status_code=400, 
                detail="Não é possível deletar um livro emprestado"
            )
        
        db.delete(livro)
        db.commit()
        
        return {"message": "Livro deletado com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar livro: {str(e)}")

@app.post("/livros/{livro_id}/emprestar")
async def emprestar_livro(livro_id: int, db: Session = Depends(get_db)):
    """Emprestar um livro"""
    try:
        livro = db.query(Livro).filter(Livro.id == livro_id).first()
        if not livro:
            raise HTTPException(status_code=404, detail="Livro não encontrado")
        
        if livro.status == "emprestado":
            raise HTTPException(
                status_code=400, 
                detail="Este livro já está emprestado"
            )
        
        livro.status = "emprestado"
        livro.data_emprestimo = datetime.utcnow()
        
        db.commit()
        db.refresh(livro)
        
        return {
            "message": "Livro emprestado com sucesso",
            "livro": livro.to_dict()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao emprestar livro: {str(e)}")

@app.post("/livros/{livro_id}/devolver")
async def devolver_livro(livro_id: int, db: Session = Depends(get_db)):
    """Devolver um livro"""
    try:
        livro = db.query(Livro).filter(Livro.id == livro_id).first()
        if not livro:
            raise HTTPException(status_code=404, detail="Livro não encontrado")
        
        if livro.status != "emprestado":
            raise HTTPException(
                status_code=400, 
                detail="Este livro não está emprestado"
            )
        
        livro.status = "disponível"
        livro.data_emprestimo = None
        
        db.commit()
        db.refresh(livro)
        
        return {
            "message": "Livro devolvido com sucesso",
            "livro": livro.to_dict()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao devolver livro: {str(e)}")

@app.get("/estatisticas")
async def obter_estatisticas(db: Session = Depends(get_db)):
    """Obter estatísticas da biblioteca"""
    try:
        total_livros = db.query(Livro).count()
        livros_disponiveis = db.query(Livro).filter(Livro.status == "disponível").count()
        livros_emprestados = db.query(Livro).filter(Livro.status == "emprestado").count()
        
        # Estatísticas por editora
        editoras = db.query(Livro.editora).distinct().all()
        stats_editoras = {}
        for (editora,) in editoras:
            if editora:
                count = db.query(Livro).filter(Livro.editora == editora).count()
                stats_editoras[editora] = count
        
        return {
            "total_livros": total_livros,
            "livros_disponiveis": livros_disponiveis,
            "livros_emprestados": livros_emprestados,
            "por_editora": stats_editoras
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas: {str(e)}")

# Inicializar banco de dados ao startar a aplicação
@app.on_event("startup")
async def startup_event():
    init_database()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
