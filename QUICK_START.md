# 🚀 GUIA RÁPIDO - Sistema Biblioteca Escolar

## ⚡ Início Rápido

### 1. Instalar Dependências
```bash
cd backend
pip install fastapi uvicorn sqlalchemy pydantic
```

### 2. Rodar Backend
```bash
python seed.py    # Criar banco e dados
python app.py     # Iniciar API (porta 8000)
```

### 3. Abrir Frontend
- Duplo-clique em `frontend/index.html`
- OU usar servidor: `python -m http.server 8080` (na pasta frontend)

### 4. Acessar
- **Sistema**: http://localhost:8080 (ou abra index.html)
- **API Docs**: http://localhost:8000/docs
- **API**: http://localhost:8000/health (teste)

## 🎯 Funcionalidades Principais

### No Sistema Web:
- 🏠 **Dashboard**: Estatísticas da biblioteca
- 📚 **Catálogo**: Visualizar e gerenciar HQs
- 🔍 **Filtros**: Por editora, gênero, status, busca
- ➕ **Adicionar**: Novo livro (Alt+N)
- ✏️ **Editar**: Livros existentes
- 🔄 **Empréstimos**: Emprestar/devolver livros
- 📊 **Relatórios**: Exportar CSV/JSON
- 🌙 **Tema**: Claro/escuro
- ♿ **Acessível**: Navegação por teclado, ARIA

### Na API:
- `GET /livros` - Listar com filtros
- `POST /livros` - Criar novo
- `PUT /livros/{id}` - Atualizar
- `DELETE /livros/{id}` - Remover
- `POST /livros/{id}/emprestar` - Emprestar
- `POST /livros/{id}/devolver` - Devolver
- `GET /estatisticas` - Estatísticas

## 🎮 Atalhos do Sistema

- **Alt + N**: Novo livro
- **Esc**: Fechar modal
- **Tab**: Navegar por elementos
- **Enter/Space**: Ativar botões

## 📝 Dados Incluídos

- 20 HQs famosas (Marvel, DC, Image)
- Homem-Aranha, Batman, X-Men, Liga da Justiça
- Walking Dead, Spawn, Saga, Watchmen
- Alguns emprestados, outros disponíveis

## 🧪 Testar API

Use o arquivo `api-tests.http` com:
- Thunder Client (VS Code)
- REST Client (VS Code)
- Insomnia
- Postman

## 🆘 Problemas Comuns

### API não conecta:
- Verificar se está rodando na porta 8000
- Testar: http://localhost:8000/health

### Sem dados:
```bash
cd backend
python seed.py
```

### Erro CORS:
- Verificar URLs no JavaScript
- Usar servidor web para frontend

### Banco não inicializa:
```bash
python -c "from database import init_database; init_database()"
```

## 📁 Arquivos Importantes

- `frontend/index.html` - Interface principal
- `backend/app.py` - API principal
- `backend/seed.py` - Dados de exemplo
- `api-tests.http` - Testes da API
- `README.md` - Documentação completa
- `REPORT.md` - Relatório técnico

## 🏆 Peculiaridades Implementadas

✅ **Acessibilidade completa** (ARIA, teclado, screen readers)  
✅ **Filtros avançados** (múltiplos critérios, persistência)  
✅ **Seed script** (20 HQs realísticas)  

---

💡 **Dica**: Comece testando a API em `/docs`, depois explore o frontend!

🎯 **Meta**: Sistema profissional de biblioteca focado em HQs

👨‍💻 **Autor**: Daniel Godoy de Oliveira Silva

---

**Sistema pronto para avaliação! 🚀**
