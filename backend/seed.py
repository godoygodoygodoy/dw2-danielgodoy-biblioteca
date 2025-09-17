from sqlalchemy.orm import Session
from database import SessionLocal, init_database
from models import Livro
from datetime import datetime

def create_seed_data():
    """Cria dados de exemplo para a biblioteca com foco em HQs"""
    
    # Inicializar banco de dados
    init_database()
    
    # Criar sessão
    db = SessionLocal()
    
    try:
        # Verificar se já existem dados
        if db.query(Livro).count() > 0:
            print("⚠️  Dados já existem no banco. Limpando dados antigos...")
            db.query(Livro).delete()
            db.commit()
        
        # Dados de HQs Marvel, DC e Image Comics
        livros_seed = [
            # Marvel Comics
            {
                "titulo": "Homem-Aranha: A Grande Responsabilidade",
                "autor": "Stan Lee, Steve Ditko",
                "ano": 2023,
                "genero": "Super-Herói",
                "editora": "Marvel",
                "numero_edicao": 1,
                "isbn": "978-0-12345-001-1",
                "descricao": "A origem clássica do Homem-Aranha reimaginada para uma nova geração.",
                "capa_url": "https://via.placeholder.com/300x400/FF0000/FFFFFF?text=Spider-Man",
                "status": "disponível"
            },
            {
                "titulo": "X-Men: Fênix Negra - Saga Completa",
                "autor": "Chris Claremont, John Byrne",
                "ano": 2022,
                "genero": "Super-Herói",
                "editora": "Marvel",
                "numero_edicao": 2,
                "isbn": "978-0-12345-002-2",
                "descricao": "A saga épica da Fênix Negra que mudou os X-Men para sempre.",
                "capa_url": "https://via.placeholder.com/300x400/FFA500/FFFFFF?text=X-Men",
                "status": "emprestado",
                "data_emprestimo": datetime(2025, 9, 5)
            },
            {
                "titulo": "Vingadores: Guerra Infinita",
                "autor": "Jonathan Hickman",
                "ano": 2023,
                "genero": "Super-Herói",
                "editora": "Marvel",
                "numero_edicao": 1,
                "isbn": "978-0-12345-003-3",
                "descricao": "Os Vingadores enfrentam sua maior ameaça: Thanos e as Joias do Infinito.",
                "capa_url": "https://via.placeholder.com/300x400/FFD700/000000?text=Avengers",
                "status": "disponível"
            },
            {
                "titulo": "Quarteto Fantástico: Primeira Família",
                "autor": "John Byrne",
                "ano": 2022,
                "genero": "Super-Herói",
                "editora": "Marvel",
                "numero_edicao": 3,
                "isbn": "978-0-12345-004-4",
                "descricao": "As aventuras da primeira família de super-heróis da Marvel.",
                "capa_url": "https://via.placeholder.com/300x400/0000FF/FFFFFF?text=FF",
                "status": "disponível"
            },
            {
                "titulo": "Thor: Ragnarok",
                "autor": "Walter Simonson",
                "ano": 2023,
                "genero": "Mitologia",
                "editora": "Marvel",
                "numero_edicao": 1,
                "isbn": "978-0-12345-005-5",
                "descricao": "O fim dos tempos em Asgard e o destino do Deus do Trovão.",
                "capa_url": "https://via.placeholder.com/300x400/008000/FFFFFF?text=Thor",
                "status": "disponível"
            },
            {
                "titulo": "Demolidor: O Homem Sem Medo",
                "autor": "Frank Miller",
                "ano": 2022,
                "genero": "Crime",
                "editora": "Marvel",
                "numero_edicao": 2,
                "isbn": "978-0-12345-006-6",
                "descricao": "Matt Murdock luta contra o crime em Hell's Kitchen.",
                "capa_url": "https://via.placeholder.com/300x400/8B0000/FFFFFF?text=Daredevil",
                "status": "emprestado",
                "data_emprestimo": datetime(2025, 9, 8)
            },
            
            # DC Comics
            {
                "titulo": "Batman: Ano Um",
                "autor": "Frank Miller, David Mazzucchelli",
                "ano": 2023,
                "genero": "Crime",
                "editora": "DC",
                "numero_edicao": 1,
                "isbn": "978-0-12345-007-7",
                "descricao": "A origem definitiva do Batman e sua primeira parceria com Jim Gordon.",
                "capa_url": "https://via.placeholder.com/300x400/000000/FFFF00?text=Batman",
                "status": "disponível"
            },
            {
                "titulo": "Superman: Todas as Estrelas",
                "autor": "Grant Morrison, Frank Quitely",
                "ano": 2022,
                "genero": "Super-Herói",
                "editora": "DC",
                "numero_edicao": 3,
                "isbn": "978-0-12345-008-8",
                "descricao": "Uma reinvenção moderna do Homem de Aço.",
                "capa_url": "https://via.placeholder.com/300x400/0066CC/FF0000?text=Superman",
                "status": "disponível"
            },
            {
                "titulo": "Mulher-Maravilha: Deusa da Guerra",
                "autor": "Brian Azzarello, Cliff Chiang",
                "ano": 2023,
                "genero": "Mitologia",
                "editora": "DC",
                "numero_edicao": 1,
                "isbn": "978-0-12345-009-9",
                "descricao": "Diana Prince descobre seus verdadeiros poderes divinos.",
                "capa_url": "https://via.placeholder.com/300x400/FF1493/FFD700?text=WonderWoman",
                "status": "disponível"
            },
            {
                "titulo": "Liga da Justiça: Origem",
                "autor": "Geoff Johns, Jim Lee",
                "ano": 2022,
                "genero": "Super-Herói",
                "editora": "DC",
                "numero_edicao": 2,
                "isbn": "978-0-12345-010-0",
                "descricao": "A formação da maior equipe de super-heróis do mundo.",
                "capa_url": "https://via.placeholder.com/300x400/4169E1/FFFFFF?text=JusticeLeague",
                "status": "emprestado",
                "data_emprestimo": datetime(2025, 9, 7)
            },
            {
                "titulo": "Flash: Renascimento",
                "autor": "Geoff Johns, Ethan Van Sciver",
                "ano": 2023,
                "genero": "Super-Herói",
                "editora": "DC",
                "numero_edicao": 1,
                "isbn": "978-0-12345-011-1",
                "descricao": "Barry Allen retorna como o Flash mais rápido do mundo.",
                "capa_url": "https://via.placeholder.com/300x400/DC143C/FFFF00?text=Flash",
                "status": "disponível"
            },
            {
                "titulo": "Aquaman: Trono de Atlântida",
                "autor": "Geoff Johns, Ivan Reis",
                "ano": 2022,
                "genero": "Aventura",
                "editora": "DC",
                "numero_edicao": 2,
                "isbn": "978-0-12345-012-2",
                "descricao": "Arthur Curry luta pelo trono dos sete mares.",
                "capa_url": "https://via.placeholder.com/300x400/008B8B/FFA500?text=Aquaman",
                "status": "disponível"
            },
            
            # Image Comics
            {
                "titulo": "The Walking Dead: Compendium Vol. 1",
                "autor": "Robert Kirkman, Tony Moore",
                "ano": 2023,
                "genero": "Horror",
                "editora": "Image",
                "numero_edicao": 1,
                "isbn": "978-0-12345-013-3",
                "descricao": "A saga épica de sobrevivência no apocalipse zumbi.",
                "capa_url": "https://via.placeholder.com/300x400/2F4F2F/FFFFFF?text=WalkingDead",
                "status": "disponível"
            },
            {
                "titulo": "Spawn: Origens Vol. 1",
                "autor": "Todd McFarlane",
                "ano": 2022,
                "genero": "Horror",
                "editora": "Image",
                "numero_edicao": 4,
                "isbn": "978-0-12345-014-4",
                "descricao": "Al Simmons retorna do inferno como Spawn.",
                "capa_url": "https://via.placeholder.com/300x400/800080/00FF00?text=Spawn",
                "status": "emprestado",
                "data_emprestimo": datetime(2025, 9, 6)
            },
            {
                "titulo": "Saga Vol. 1",
                "autor": "Brian K. Vaughan, Fiona Staples",
                "ano": 2023,
                "genero": "Ficção Científica",
                "editora": "Image",
                "numero_edicao": 1,
                "isbn": "978-0-12345-015-5",
                "descricao": "Uma épica space opera sobre amor e família.",
                "capa_url": "https://via.placeholder.com/300x400/9932CC/FFFFFF?text=Saga",
                "status": "disponível"
            },
            {
                "titulo": "Invincible: Compendium Vol. 1",
                "autor": "Robert Kirkman, Cory Walker",
                "ano": 2022,
                "genero": "Super-Herói",
                "editora": "Image",
                "numero_edicao": 2,
                "isbn": "978-0-12345-016-6",
                "descricao": "Mark Grayson descobre que ser um super-herói não é tão simples.",
                "capa_url": "https://via.placeholder.com/300x400/FFD700/0000FF?text=Invincible",
                "status": "disponível"
            },
            {
                "titulo": "Sandman: Prelúdios e Noturnos",
                "autor": "Neil Gaiman, Sam Kieth",
                "ano": 2023,
                "genero": "Horror",
                "editora": "DC/Vertigo",
                "numero_edicao": 1,
                "isbn": "978-0-12345-017-7",
                "descricao": "Morpheus, o Senhor dos Sonhos, inicia sua jornada épica.",
                "capa_url": "https://via.placeholder.com/300x400/483D8B/FFD700?text=Sandman",
                "status": "disponível"
            },
            {
                "titulo": "Watchmen",
                "autor": "Alan Moore, Dave Gibbons",
                "ano": 2022,
                "genero": "Super-Herói",
                "editora": "DC",
                "numero_edicao": 3,
                "isbn": "978-0-12345-018-8",
                "descricao": "Uma desconstrução sombria do gênero de super-heróis.",
                "capa_url": "https://via.placeholder.com/300x400/B8860B/000000?text=Watchmen",
                "status": "disponível"
            },
            {
                "titulo": "Hellboy: Semente da Destruição",
                "autor": "Mike Mignola",
                "ano": 2023,
                "genero": "Horror",
                "editora": "Dark Horse",
                "numero_edicao": 1,
                "isbn": "978-0-12345-019-9",
                "descricao": "O demônio vermelho que protege a humanidade.",
                "capa_url": "https://via.placeholder.com/300x400/B22222/000000?text=Hellboy",
                "status": "emprestado",
                "data_emprestimo": datetime(2025, 9, 4)
            },
            {
                "titulo": "Scott Pilgrim vs. O Mundo",
                "autor": "Bryan Lee O'Malley",
                "ano": 2022,
                "genero": "Comédia",
                "editora": "Oni Press",
                "numero_edicao": 2,
                "isbn": "978-0-12345-020-0",
                "descricao": "Scott deve derrotar os 7 ex-namorados malvados de Ramona.",
                "capa_url": "https://via.placeholder.com/300x400/FF69B4/FFFFFF?text=ScottPilgrim",
                "status": "disponível"
            }
        ]
        
        # Inserir dados no banco
        for livro_data in livros_seed:
            data_emprestimo = livro_data.pop("data_emprestimo", None)
            livro = Livro(**livro_data)
            if data_emprestimo:
                livro.data_emprestimo = data_emprestimo
            db.add(livro)
        
        db.commit()
        print(f"✅ {len(livros_seed)} livros inseridos com sucesso!")
        
        # Mostrar estatísticas
        total = db.query(Livro).count()
        disponiveis = db.query(Livro).filter(Livro.status == "disponível").count()
        emprestados = db.query(Livro).filter(Livro.status == "emprestado").count()
        
        print(f"📊 Estatísticas:")
        print(f"   Total de livros: {total}")
        print(f"   Disponíveis: {disponiveis}")
        print(f"   Emprestados: {emprestados}")
        
    except Exception as e:
        print(f"❌ Erro ao inserir dados: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data()
