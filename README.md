# Sistema Biblioteca Escolar

## 📚 Visão Geral

Sistema web completo para gerenciamento de biblioteca escolar, especializado em HQs (Marvel, DC, Image Comics). Desenvolvido com tecnologias modernas e foco em acessibilidade e experiência do usuário.

## 🎯 Funcionalidades

- **CRUD Completo**: Adicionar, editar, visualizar e remover livros
- **Sistema de Empréstimos**: Controle de disponibilidade e devoluções
- **Filtros Avançados**: Busca por título, autor, editora, gênero e status
- **Dashboard Interativo**: Estatísticas em tempo real
- **Exportação**: Relatórios em CSV e JSON
- **Tema Claro/Escuro**: Alternância com persistência
- **Responsivo**: Design adaptável para todos os dispositivos
- **Acessibilidade**: ARIA, navegação por teclado, leitores de tela

## 🚀 Tecnologias

### Backend
- **Python 3.9+**
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para manipulação do banco
- **SQLite** - Banco de dados local
- **Pydantic** - Validação de dados
- **Uvicorn** - Servidor ASGI

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo com Grid/Flexbox
- **JavaScript ES6+** - Funcionalidades interativas
- **Font Awesome** - Ícones
- **Google Fonts** - Tipografia (Inter)

## 🏗️ Estrutura do Projeto

```
dw2-danielgodoy-biblioteca/
├── frontend/
│   ├── index.html          # Interface principal
│   ├── styles.css          # Estilos e temas
│   └── scripts.js          # Lógica do frontend
├── backend/
│   ├── app.py              # API FastAPI
│   ├── models.py           # Modelos SQLAlchemy
│   ├── database.py         # Configuração do banco
│   ├── seed.py             # Dados de exemplo
│   └── requirements.txt    # Dependências Python
├── README.md               # Documentação principal
├── REPORT.md               # Relatório técnico
└── ChatIA.md               # Conversas com IA
```

## ⚙️ Instalação e Execução

### Pré-requisitos
- Python 3.9 ou superior
- Navegador web moderno

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/dw2-danielgodoy-biblioteca.git
cd dw2-danielgodoy-biblioteca
```

### 2. Configurar Backend
```bash
cd backend

# Criar ambiente virtual (recomendado)
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar seed (dados de exemplo)
python seed.py

# Iniciar servidor da API
python app.py
```

### 3. Acessar Frontend
Abra o arquivo `frontend/index.html` em um navegador ou use um servidor web:

```bash
# Usando Python
cd frontend
python -m http.server 8080

# Acessar http://localhost:8080
```

## 🎨 Identidade Visual

- **Primária**: #1E3A8A (Azul marinho)
- **Secundária**: #F59E0B (Âmbar)
- **Acento**: #10B981 (Verde)
- **Fundo**: #F8FAFC (Cinza claro)
- **Fonte**: Inter (sans-serif)

## 📊 API Endpoints

### Livros
- `GET /livros` - Listar livros com filtros
- `POST /livros` - Criar novo livro
- `GET /livros/{id}` - Obter livro específico
- `PUT /livros/{id}` - Atualizar livro
- `DELETE /livros/{id}` - Excluir livro

### Empréstimos
- `POST /livros/{id}/emprestar` - Emprestar livro
- `POST /livros/{id}/devolver` - Devolver livro

### Estatísticas
- `GET /estatisticas` - Obter estatísticas da biblioteca
- `GET /health` - Status da API

## 🔧 Peculiaridades Implementadas

### 1. Acessibilidade Completa ✅
- **ARIA labels** em todos os elementos interativos
- **Navegação por teclado** (Tab, Enter, Esc, Alt+N)
- **Leitores de tela** compatível
- **Contraste** mínimo 4.5:1
- **Foco visível** em todos os elementos

### 2. Filtros Avançados ✅
- **Múltiplos critérios** simultâneos
- **Busca em tempo real** com debounce
- **Persistência** no localStorage
- **Atualização dinâmica** sem recarregar

### 3. Seed Script Completo ✅
- **20 HQs realistas** da Marvel, DC e Image
- **Dados plausíveis** (autores, anos, editoras)
- **Status variados** (disponível/emprestado)
- **Limpeza automática** antes da inserção

## 💡 Recursos Adicionais

- **Tema claro/escuro** com persistência
- **Paginação** inteligente
- **Exportação CSV/JSON**
- **Toasts informativos**
- **Validação robusta**
- **Design responsivo**
- **Animações suaves**

## 🧪 Testando a API

Você pode testar a API usando:

1. **Documentação automática**: http://localhost:8000/docs
2. **ReDoc**: http://localhost:8000/redoc
3. **Thunder Client** (VS Code)
4. **Insomnia** ou **Postman**

### Exemplos de Requisições

```javascript
// Listar todos os livros
GET http://localhost:8000/livros

// Buscar livros da Marvel
GET http://localhost:8000/livros?editora=Marvel

// Criar novo livro
POST http://localhost:8000/livros
Content-Type: application/json

{
  "titulo": "Homem-Aranha: Nova Era",
  "autor": "Dan Slott",
  "ano": 2024,
  "genero": "Super-Herói",
  "editora": "Marvel"
}
```

## 🐛 Solução de Problemas

### Erro de CORS
Se encontrar erro de CORS, certifique-se de que:
- A API está rodando na porta 8000
- O frontend está acessando a URL correta

### Banco não inicializa
```bash
cd backend
python -c "from database import init_database; init_database()"
```

### Dados não aparecem
```bash
cd backend
python seed.py
```

## 📝 Validações

### Frontend
- Título: 3-90 caracteres
- Autor: obrigatório, máx 100 chars
- Ano: 1900-2025
- URL da capa: formato válido

### Backend
- Validação Pydantic automática
- Títulos únicos por autor
- ISBN único se fornecido
- Status válidos apenas

## 🚀 Melhorias Futuras

- [ ] Sistema de autenticação
- [ ] Upload de capas
- [ ] Notificações push
- [ ] Relatórios avançados
- [ ] API de busca por ISBN
- [ ] Integração com bibliotecas externas
- [ ] App mobile (PWA)

## 👨‍💻 Autor

**Daniel Godoy de Oliveira Silva**
- GitHub: [seu-github]
- Email: [seu-email]

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais como parte do curso de Desenvolvimento Web.

---

⭐ **Sistema Biblioteca Escolar - HQs & Graphic Novels** ⭐
