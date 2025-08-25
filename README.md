# Biblioteca Escolar (DW2 - Daniel Godoy)

Projeto implementando o sistema Biblioteca conforme o guia da disciplina.

Estrutura:
- /frontend: interface (index.html, styles.css, scripts.js)
- /backend: FastAPI app (app.py, models.py, database.py, seed.py, app.db)

Como rodar (PowerShell):

```powershell
cd C:\Users\daniel_godoy\Desktop\dw2-danielgodoy-biblioteca\backend
python -m pip install -r requirements.txt
# popular o banco (seed)
C:/Users/daniel_godoy/AppData/Local/Microsoft/WindowsApps/python3.12.exe -m backend.seed
# iniciar servidor
C:/Users/daniel_godoy/AppData/Local/Microsoft/WindowsApps/python3.12.exe -m uvicorn backend.app:app --reload
```

Frontend: abra `frontend/index.html` no navegador (consome API em http://localhost:8000).

Notas:
- API endpoints: /livros, /livros/{id}/emprestar, /livros/{id}/devolver
- Seed com ~20 registros (muitos HQs conforme solicitado).
