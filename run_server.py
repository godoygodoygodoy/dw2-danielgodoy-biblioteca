import os
import sys

import os
import sys
from pathlib import Path

# Carregar variáveis de ambiente do arquivo .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv não instalado, usar variáveis do sistema

# Add backend directory to path
backend_dir = os.path.join(os.path.dirname(__file__), "backend")
sys.path.insert(0, backend_dir)

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

# Import from backend
from models import Livro
from database import SessionLocal, init_database

# Initialize database
init_database()

app = FastAPI(title="Biblioteca Escolar - API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Root route to serve index.html
@app.get("/")
async def root():
    return FileResponse("frontend/index.html")

# Serve CSS and JS files
@app.get("/styles.css")
async def get_styles():
    return FileResponse("frontend/styles.css")

@app.get("/scripts.js")
async def get_scripts():
    return FileResponse("frontend/scripts.js")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class LivroCreate(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=90)
    autor: str = Field(..., min_length=3, max_length=100)
    ano: int = Field(..., ge=1900, le=datetime.utcnow().year)
    genero: Optional[str] = None
    isbn: Optional[str] = None
    editora: Optional[str] = None
    numero_edicao: Optional[int] = None
    descricao: Optional[str] = None
    capa_url: Optional[str] = None
    status: Optional[str] = "disponível"

    @validator('status')
    def status_allowed(cls, v):
        if v not in ("disponível", "emprestado"):
            raise ValueError('status must be "disponível" or "emprestado"')
        return v

class LivroUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=3, max_length=90)
    autor: Optional[str] = Field(None, min_length=3, max_length=100)
    ano: Optional[int] = Field(None, ge=1900, le=datetime.utcnow().year)
    genero: Optional[str] = None
    isbn: Optional[str] = None
    editora: Optional[str] = None
    numero_edicao: Optional[int] = None
    descricao: Optional[str] = None
    capa_url: Optional[str] = None
    status: Optional[str] = None

class LivroOut(BaseModel):
    id: int
    titulo: str
    autor: str
    ano: int
    genero: Optional[str] = None
    isbn: Optional[str] = None
    editora: Optional[str] = None
    numero_edicao: Optional[int] = None
    descricao: Optional[str] = None
    capa_url: Optional[str] = None
    status: str = "disponível"
    data_emprestimo: Optional[datetime] = None

    model_config = {"from_attributes": True}

@app.get("/api/estatisticas")
def get_estatisticas(db: Session = Depends(get_db)):
    total_livros = db.query(Livro).count()
    livros_disponiveis = db.query(Livro).filter(Livro.status == "disponível").count()
    livros_emprestados = db.query(Livro).filter(Livro.status == "emprestado").count()
    
    # Estatísticas por editora
    editoras = db.query(Livro.editora).distinct().all()
    por_editora = {}
    for (editora,) in editoras:
        if editora:
            count = db.query(Livro).filter(Livro.editora == editora).count()
            por_editora[editora] = count
    
    return {
        "total_livros": total_livros,
        "livros_disponiveis": livros_disponiveis,
        "livros_emprestados": livros_emprestados,
        "por_editora": por_editora
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/livros")
def list_livros(search: Optional[str] = None, genero: Optional[str] = None, ano: Optional[int] = None, status: Optional[str] = None, page: int = 1, per_page: int = 10, db: Session = Depends(get_db)) -> Dict[str, Any]:
    # pagination safety
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = 10
    if per_page > 100:
        per_page = 100

    q = db.query(Livro)
    if search:
        s = f"%{search}%"
        q = q.filter((Livro.titulo.ilike(s)) | (Livro.autor.ilike(s)))
    if genero:
        q = q.filter(Livro.genero == genero)
    if ano:
        q = q.filter(Livro.ano == ano)
    if status:
        q = q.filter(Livro.status == status)

    total = q.count()
    items = q.order_by(Livro.titulo).offset((page - 1) * per_page).limit(per_page).all()
    return {"items": items, "total": total, "page": page, "per_page": per_page}

@app.post("/api/livros", response_model=LivroOut, status_code=201)
def create_livro(payload: LivroCreate, db: Session = Depends(get_db)):
    # check duplicate titulo
    existing = db.query(Livro).filter(Livro.titulo == payload.titulo).first()
    if existing:
        raise HTTPException(status_code=422, detail="Título já existe")
    livro = Livro(
        titulo=payload.titulo,
        autor=payload.autor,
        ano=payload.ano,
        genero=payload.genero,
        isbn=payload.isbn,
        cover_url=payload.cover_url,
        status=payload.status,
    )
    db.add(livro)
    db.commit()
    db.refresh(livro)
    return livro

@app.put("/api/livros/{livro_id}", response_model=LivroOut)
def update_livro(livro_id: int, payload: LivroUpdate, db: Session = Depends(get_db)):
    livro = db.query(Livro).get(livro_id)
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(livro, k, v)
    db.add(livro)
    db.commit()
    db.refresh(livro)
    return livro

@app.delete("/api/livros/{livro_id}", status_code=204)
def delete_livro(livro_id: int, db: Session = Depends(get_db)):
    livro = db.query(Livro).get(livro_id)
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    db.delete(livro)
    db.commit()
    return None

@app.post("/api/livros/{livro_id}/emprestar", response_model=LivroOut)
def emprestar_livro(livro_id: int, db: Session = Depends(get_db)):
    livro = db.query(Livro).get(livro_id)
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    if livro.status == "emprestado":
        raise HTTPException(status_code=400, detail="Livro já está emprestado")
    livro.status = "emprestado"
    livro.data_emprestimo = datetime.utcnow()
    db.add(livro)
    db.commit()
    db.refresh(livro)
    return livro

@app.post("/api/livros/{livro_id}/devolver", response_model=LivroOut)
def devolver_livro(livro_id: int, db: Session = Depends(get_db)):
    livro = db.query(Livro).get(livro_id)
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    if livro.status == "disponível":
        raise HTTPException(status_code=400, detail="Livro já está disponível")
    livro.status = "disponível"
    livro.data_emprestimo = None
    db.add(livro)
    db.commit()
    db.refresh(livro)
    return livro

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Configuração para deploy (Render, Heroku, etc.)
    port = int(os.environ.get("PORT", 8002))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Iniciando servidor em {host}:{port}")
    uvicorn.run(app, host=host, port=port)
