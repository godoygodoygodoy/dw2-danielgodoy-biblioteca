from datetime import datetime
from .database import SessionLocal, engine
from .models import Livro

# create tables
Livro.metadata = Livro.__table__

# simple seed: ~20 livros, muitos HQs (histórias em quadrinhos)
books = [
    {"titulo": "Homem-Aranha: De Volta ao Lar (HQ)", "autor": "Stan Lee", "ano": 1962, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "Batman: O Cavaleiro das Trevas (HQ)", "autor": "Frank Miller", "ano": 1986, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "X-Men: Dias de um Futuro Esquecido (HQ)", "autor": "Chris Claremont", "ano": 1981, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "V de Vingança (HQ)", "autor": "Alan Moore", "ano": 1988, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "Turma da Mônica: Lições de Vida", "autor": "Mauricio de Sousa", "ano": 2000, "genero": "Infantil", "isbn": "", "status": "disponível"},
    {"titulo": "Asterix e Obelix (HQ)", "autor": "René Goscinny", "ano": 1965, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "O Pequeno Príncipe", "autor": "Antoine de Saint-Exupéry", "ano": 1943, "genero": "Ficção", "isbn": "", "status": "disponível"},
    {"titulo": "O Senhor dos Anéis: A Sociedade do Anel", "autor": "J.R.R. Tolkien", "ano": 1954, "genero": "Fantasia", "isbn": "", "status": "disponível"},
    {"titulo": "Sherlock Holmes: Um Estudo em Vermelho", "autor": "Arthur Conan Doyle", "ano": 1887, "genero": "Mistério", "isbn": "", "status": "disponível"},
    {"titulo": "Calvin e Haroldo: Coleção (HQ)", "autor": "Bill Watterson", "ano": 1995, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "Watchmen (HQ)", "autor": "Alan Moore", "ano": 1987, "genero": "HQ", "isbn": "", "status": "emprestado"},
    {"titulo": "Maus (HQ)", "autor": "Art Spiegelman", "ano": 1991, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "Persepolis (HQ)", "autor": "Marjane Satrapi", "ano": 2000, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "Os Miseráveis", "autor": "Victor Hugo", "ano": 1862, "genero": "Ficção", "isbn": "", "status": "disponível"},
    {"titulo": "O Mundo de Sofia", "autor": "Jostein Gaarder", "ano": 1991, "genero": "Filosofia", "isbn": "", "status": "disponível"},
    {"titulo": "Sandman: Prelúdios e Noturnos (HQ)", "autor": "Neil Gaiman", "ano": 1989, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "Tintim: O Segredo do Licorne (HQ)", "autor": "Hergé", "ano": 1943, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "Dragon Ball: Volume 1 (HQ)", "autor": "Akira Toriyama", "ano": 1984, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "One Piece: Romance Dawn (HQ)", "autor": "Eiichiro Oda", "ano": 1997, "genero": "HQ", "isbn": "", "status": "disponível"},
    {"titulo": "Harry Potter e a Pedra Filosofal", "autor": "J.K. Rowling", "ano": 1997, "genero": "Fantasia", "isbn": "", "status": "disponível"},
]


def run():
    db = SessionLocal()
    # create tables
    from .database import Base
    Base.metadata.create_all(bind=engine)

    for b in books:
        existing = db.query(Livro).filter(Livro.titulo == b['titulo']).first()
        if existing:
            continue
        l = Livro(
            titulo=b['titulo'],
            autor=b['autor'],
            ano=b['ano'],
            genero=b['genero'],
            isbn=b['isbn'],
            status=b['status']
        )
        db.add(l)
    db.commit()
    db.close()


if __name__ == '__main__':
    run()
