from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from . import models, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Biblioteca Escolar - API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


class LivroCreate(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=90)
    autor: str = Field(..., min_length=3, max_length=80)
    ano: int = Field(..., ge=1900, le=datetime.utcnow().year)
    genero: Optional[str] = None
    isbn: Optional[str] = None
    status: Optional[str] = "disponível"

    @validator('status')
    def status_allowed(cls, v):
        if v not in ("disponível", "emprestado"):
            raise ValueError('status must be "disponível" or "emprestado"')
        return v


class LivroUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=3, max_length=90)
    autor: Optional[str] = Field(None, min_length=3, max_length=80)
    ano: Optional[int] = Field(None, ge=1900, le=datetime.utcnow().year)
    genero: Optional[str]
    isbn: Optional[str]
    status: Optional[str]


class LivroOut(BaseModel):
    id: int
    titulo: str
    autor: str
    ano: int
    genero: Optional[str]
    isbn: Optional[str]
    status: str
    data_emprestimo: Optional[datetime]

    class Config:
        # Pydantic v2: use from_attributes to read from ORM objects
        model_config = {"from_attributes": True}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/livros")
def list_livros(search: Optional[str] = None, genero: Optional[str] = None, ano: Optional[int] = None, status: Optional[str] = None, page: int = 1, per_page: int = 10, db: Session = Depends(get_db)) -> Dict[str, Any]:
    # pagination safety
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = 10
    if per_page > 100:
        per_page = 100

    q = db.query(models.Livro)
    if search:
        s = f"%{search}%"
        q = q.filter((models.Livro.titulo.ilike(s)) | (models.Livro.autor.ilike(s)))
    if genero:
        q = q.filter(models.Livro.genero == genero)
    if ano:
        q = q.filter(models.Livro.ano == ano)
    if status:
        q = q.filter(models.Livro.status == status)

    total = q.count()
    items = q.order_by(models.Livro.titulo).offset((page - 1) * per_page).limit(per_page).all()
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@app.post("/livros", response_model=LivroOut, status_code=201)
def create_livro(payload: LivroCreate, db: Session = Depends(get_db)):
    # check duplicate titulo
    existing = db.query(models.Livro).filter(models.Livro.titulo == payload.titulo).first()
    if existing:
        raise HTTPException(status_code=422, detail="Título já existe")
    livro = models.Livro(
        titulo=payload.titulo,
        autor=payload.autor,
        ano=payload.ano,
        genero=payload.genero,
        isbn=payload.isbn,
        status=payload.status,
    )
    db.add(livro)
    db.commit()
    db.refresh(livro)
    return livro


@app.put("/livros/{livro_id}", response_model=LivroOut)
def update_livro(livro_id: int, payload: LivroUpdate, db: Session = Depends(get_db)):
    livro = db.query(models.Livro).get(livro_id)
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(livro, k, v)
    db.add(livro)
    db.commit()
    db.refresh(livro)
    return livro


@app.delete("/livros/{livro_id}", status_code=204)
def delete_livro(livro_id: int, db: Session = Depends(get_db)):
    livro = db.query(models.Livro).get(livro_id)
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    db.delete(livro)
    db.commit()
    return None


@app.post("/livros/{livro_id}/emprestar", response_model=LivroOut)
def emprestar_livro(livro_id: int, db: Session = Depends(get_db)):
    livro = db.query(models.Livro).get(livro_id)
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


@app.post("/livros/{livro_id}/devolver", response_model=LivroOut)
def devolver_livro(livro_id: int, db: Session = Depends(get_db)):
    livro = db.query(models.Livro).get(livro_id)
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
