/**
 * BIBLIOTECA ESCOLAR - SISTEMA JAVASCRIPT
 * Sistema completo de gerenciamento de HQs
 * Autor: Daniel Godoy de Oliveira Silva
 * Data: 10/09/2025
 */

// ========================================
// CONFIGURAÇÃO E CONSTANTES
// ========================================

const CONFIG = {
    API_BASE_URL: 'http://localhost:8000',
    ITEMS_PER_PAGE: 12,
    STORAGE_KEYS: {
        THEME: 'biblioteca_theme',
        SORT_ORDER: 'biblioteca_sort',
        FILTERS: 'biblioteca_filters'
    },
    TOAST_DURATION: 5000,
    ANIMATION_DURATION: 300
};

// Estado global da aplicação
let isOfflineMode = false;

const AppState = {
    currentPage: 'home',
    currentBooks: [],
    filteredBooks: [],
    totalBooks: 0,
    currentPagination: 1,
    filters: {
        search: '',
        status: '',
        editora: '',
        genero: '',
        sort: 'titulo-asc'
    },
    stats: {},
    isLoading: false,
    editingBook: null
};

// ========================================
// UTILITÁRIOS
// ========================================

/**
 * Utilitários gerais
 */
const Utils = {
    // Debounce para otimizar busca
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Formatação de data
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    },

    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Gerar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Validar URL
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    },

    // Capitalizar primeira letra
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// ========================================
// API SERVICE
// ========================================

/**
 * Serviço para comunicação com a API
 */
const ApiService = {
    async makeRequest(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            UI.showLoading();
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            // Se API não estiver disponível, usar dados mock
            if (error.message.includes('fetch')) {
                console.warn('API não disponível, usando dados mock');
                
                // Marcar como modo offline e mostrar indicador
                if (!isOfflineMode) {
                    isOfflineMode = true;
                    this.showOfflineIndicator();
                    UI.showToast('Conectando em modo offline com dados de exemplo', 'warning');
                }
                
                return this.getMockData(endpoint);
            }
            UI.showToast('Erro na comunicação com o servidor', 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    },

    showOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.display = 'inline-flex';
        }
    },

    // Dados mock para quando API não estiver disponível
    getMockData(endpoint) {
        const mockBooks = [
            {
                id: 1,
                titulo: "Homem-Aranha: A Grande Responsabilidade",
                autor: "Stan Lee, Steve Ditko",
                ano: 2023,
                genero: "Super-Herói",
                editora: "Marvel",
                numero_edicao: 1,
                isbn: "978-0-12345-001-1",
                status: "disponível",
                data_emprestimo: null,
                descricao: "A origem clássica do Homem-Aranha reimaginada para uma nova geração.",
                capa_url: "https://via.placeholder.com/300x400/FF0000/FFFFFF?text=Spider-Man"
            },
            {
                id: 2,
                titulo: "X-Men: Fênix Negra - Saga Completa",
                autor: "Chris Claremont, John Byrne",
                ano: 2022,
                genero: "Super-Herói",
                editora: "Marvel",
                numero_edicao: 2,
                isbn: "978-0-12345-002-2",
                status: "emprestado",
                data_emprestimo: "2025-09-05T00:00:00",
                descricao: "A saga épica da Fênix Negra que mudou os X-Men para sempre.",
                capa_url: "https://via.placeholder.com/300x400/FFA500/FFFFFF?text=X-Men"
            },
            {
                id: 3,
                titulo: "Batman: Ano Um",
                autor: "Frank Miller, David Mazzucchelli",
                ano: 2023,
                genero: "Crime",
                editora: "DC",
                numero_edicao: 1,
                isbn: "978-0-12345-007-7",
                status: "disponível",
                data_emprestimo: null,
                descricao: "A origem definitiva do Batman e sua primeira parceria com Jim Gordon.",
                capa_url: "https://via.placeholder.com/300x400/000000/FFFF00?text=Batman"
            },
            {
                id: 4,
                titulo: "The Walking Dead: Compendium Vol. 1",
                autor: "Robert Kirkman, Tony Moore",
                ano: 2023,
                genero: "Horror",
                editora: "Image",
                numero_edicao: 1,
                isbn: "978-0-12345-013-3",
                status: "disponível",
                data_emprestimo: null,
                descricao: "A saga épica de sobrivência no apocalipse zumbi.",
                capa_url: "https://via.placeholder.com/300x400/2F4F2F/FFFFFF?text=WalkingDead"
            },
            {
                id: 5,
                titulo: "Superman: Todas as Estrelas",
                autor: "Grant Morrison, Frank Quitely",
                ano: 2022,
                genero: "Super-Herói",
                editora: "DC",
                numero_edicao: 3,
                isbn: "978-0-12345-008-8",
                status: "emprestado",
                data_emprestimo: "2025-09-08T00:00:00",
                descricao: "Uma reinvenção moderna do Homem de Aço.",
                capa_url: "https://via.placeholder.com/300x400/0066CC/FF0000?text=Superman"
            },
            {
                id: 6,
                titulo: "Saga Vol. 1",
                autor: "Brian K. Vaughan, Fiona Staples",
                ano: 2023,
                genero: "Ficção Científica",
                editora: "Image",
                numero_edicao: 1,
                isbn: "978-0-12345-015-5",
                status: "disponível",
                data_emprestimo: null,
                descricao: "Uma épica space opera sobre amor e família.",
                capa_url: "https://via.placeholder.com/300x400/9932CC/FFFFFF?text=Saga"
            }
        ];

        const mockStats = {
            total_livros: mockBooks.length,
            livros_disponiveis: mockBooks.filter(b => b.status === 'disponível').length,
            livros_emprestados: mockBooks.filter(b => b.status === 'emprestado').length,
            por_editora: {
                'Marvel': mockBooks.filter(b => b.editora === 'Marvel').length,
                'DC': mockBooks.filter(b => b.editora === 'DC').length,
                'Image': mockBooks.filter(b => b.editora === 'Image').length
            }
        };

        if (endpoint.includes('/livros')) {
            return mockBooks;
        } else if (endpoint.includes('/estatisticas')) {
            return mockStats;
        } else if (endpoint.includes('/health')) {
            return { status: 'mock', message: 'Usando dados mock' };
        }
        
        return [];
    },

    // Listar livros com filtros
    async getBooks(filters = {}) {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        return this.makeRequest(`/livros?${params.toString()}`);
    },

    // Obter livro por ID
    async getBook(id) {
        return this.makeRequest(`/livros/${id}`);
    },

    // Criar novo livro
    async createBook(bookData) {
        return this.makeRequest('/livros', {
            method: 'POST',
            body: JSON.stringify(bookData)
        });
    },

    // Atualizar livro
    async updateBook(id, bookData) {
        return this.makeRequest(`/livros/${id}`, {
            method: 'PUT',
            body: JSON.stringify(bookData)
        });
    },

    // Deletar livro
    async deleteBook(id) {
        return this.makeRequest(`/livros/${id}`, {
            method: 'DELETE'
        });
    },

    // Emprestar livro
    async borrowBook(id) {
        return this.makeRequest(`/livros/${id}/emprestar`, {
            method: 'POST'
        });
    },

    // Devolver livro
    async returnBook(id) {
        return this.makeRequest(`/livros/${id}/devolver`, {
            method: 'POST'
        });
    },

    // Obter estatísticas
    async getStats() {
        return this.makeRequest('/estatisticas');
    },

    // Health check
    async healthCheck() {
        return this.makeRequest('/health');
    }
};

// ========================================
// GERENCIAMENTO DE UI
// ========================================

/**
 * Utilitários de interface do usuário
 */
const UI = {
    // Mostrar/esconder loading
    showLoading() {
        AppState.isLoading = true;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
        }
    },

    hideLoading() {
        AppState.isLoading = false;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        }
    },

    // Sistema de Toast (notificações)
    showToast(message, type = 'info', title = '') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toastId = Utils.generateId();
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const titleMap = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Atenção',
            info: 'Informação'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${iconMap[type]}" aria-hidden="true"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title || titleMap[type]}</div>
                <div class="toast-message">${Utils.escapeHtml(message)}</div>
            </div>
            <button type="button" class="toast-close" aria-label="Fechar notificação">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;

        // Adicionar event listener para fechar
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toastId);
        });

        container.appendChild(toast);
        
        // Mostrar toast com animação
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto-remover após tempo configurado
        setTimeout(() => this.removeToast(toastId), CONFIG.TOAST_DURATION);

        return toastId;
    },

    removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), CONFIG.ANIMATION_DURATION);
        }
    },

    // Navegação entre páginas
    showPage(pageId) {
        // Esconder todas as páginas
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Mostrar página selecionada
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.classList.add('animate-fade-in');
        }

        // Atualizar navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        AppState.currentPage = pageId;

        // Carregar dados da página se necessário
        this.loadPageData(pageId);
    },

    async loadPageData(pageId) {
        switch (pageId) {
            case 'home':
                await this.loadDashboard();
                break;
            case 'catalogo':
                await this.loadCatalog();
                break;
            case 'relatorios':
                await this.loadReports();
                break;
        }
    },

    // Dashboard
    async loadDashboard() {
        try {
            const [books, stats] = await Promise.all([
                ApiService.getBooks({ limit: 6 }),
                ApiService.getStats()
            ]);

            AppState.stats = stats;
            this.updateStats(stats);
            this.renderRecentBooks(books);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    },

    updateStats(stats) {
        const elements = {
            'total-livros': stats.total_livros || 0,
            'total-disponiveis': stats.livros_disponiveis || 0,
            'total-emprestados': stats.livros_emprestados || 0,
            'total-editoras': Object.keys(stats.por_editora || {}).length
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateNumber(element, value);
            }
        });

        // Atualizar contadores nos filtros
        document.getElementById('count-todos').textContent = stats.total_livros || 0;
        document.getElementById('count-disponiveis').textContent = stats.livros_disponiveis || 0;
        document.getElementById('count-emprestados').textContent = stats.livros_emprestados || 0;
    },

    animateNumber(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const stepTime = 50;
        const steps = duration / stepTime;
        const increment = (targetValue - startValue) / steps;
        let current = startValue;

        const timer = setInterval(() => {
            current += increment;
            if (
                (increment > 0 && current >= targetValue) ||
                (increment < 0 && current <= targetValue)
            ) {
                current = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, stepTime);
    },

    renderRecentBooks(books) {
        const container = document.getElementById('recent-books');
        if (!container || !books.length) return;

        container.innerHTML = books.map(book => this.createBookCard(book)).join('');
    },

    // Catálogo
    async loadCatalog() {
        await this.searchAndFilter();
    },

    async searchAndFilter() {
        try {
            const filters = { ...AppState.filters };
            
            // Mapear filtros para API
            const apiFilters = {};
            if (filters.search) apiFilters.search = filters.search;
            if (filters.status) apiFilters.status = filters.status;
            if (filters.editora) apiFilters.editora = filters.editora;
            if (filters.genero) apiFilters.genero = filters.genero;

            const books = await ApiService.getBooks(apiFilters);
            
            AppState.currentBooks = books;
            AppState.filteredBooks = this.sortBooks([...books], filters.sort);
            
            this.renderBooks();
            this.updateResultCount();
            
        } catch (error) {
            console.error('Erro ao buscar livros:', error);
        }
    },

    sortBooks(books, sortOrder) {
        const [field, direction] = sortOrder.split('-');
        
        return books.sort((a, b) => {
            let valueA = a[field] || '';
            let valueB = b[field] || '';
            
            // Converter para string para comparação
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            
            if (direction === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });
    },

    renderBooks() {
        const container = document.getElementById('books-grid');
        if (!container) return;

        const startIndex = (AppState.currentPagination - 1) * CONFIG.ITEMS_PER_PAGE;
        const endIndex = startIndex + CONFIG.ITEMS_PER_PAGE;
        const booksToShow = AppState.filteredBooks.slice(startIndex, endIndex);

        if (booksToShow.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search fa-3x" aria-hidden="true"></i>
                    <h3>Nenhum livro encontrado</h3>
                    <p>Tente ajustar os filtros ou adicionar novos livros ao acervo.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = booksToShow.map(book => this.createBookCard(book)).join('');
        this.renderPagination();
    },

    createBookCard(book) {
        const statusClass = book.status === 'disponível' ? 'disponivel' : 'emprestado';
        const statusText = Utils.capitalize(book.status);
        const defaultCover = 'https://via.placeholder.com/300x400/1E3A8A/FFFFFF?text=Sem+Capa';
        
        return `
            <article class="book-card animate-fade-in">
                <div class="book-cover">
                    <img 
                        src="${book.capa_url || defaultCover}" 
                        alt="Capa do livro ${Utils.escapeHtml(book.titulo)}"
                        loading="lazy"
                        onerror="this.src='${defaultCover}'"
                    >
                    <div class="book-status ${statusClass}">${statusText}</div>
                </div>
                <div class="book-info">
                    <h3 class="book-title">${Utils.escapeHtml(book.titulo)}</h3>
                    <p class="book-author">por ${Utils.escapeHtml(book.autor)}</p>
                    <div class="book-meta">
                        <span class="book-year">${book.ano}</span>
                        ${book.editora ? `<span class="book-editora">${Utils.escapeHtml(book.editora)}</span>` : ''}
                        ${book.numero_edicao ? `<span class="book-edition">#${book.numero_edicao}</span>` : ''}
                    </div>
                    <div class="book-actions">
                        <button 
                            type="button" 
                            class="btn btn-outline" 
                            onclick="BookManager.editBook(${book.id})"
                            aria-label="Editar livro ${Utils.escapeHtml(book.titulo)}"
                        >
                            <i class="fas fa-edit" aria-hidden="true"></i>
                            Editar
                        </button>
                        <button 
                            type="button" 
                            class="btn ${book.status === 'disponível' ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="BookManager.toggleBookStatus(${book.id})"
                            aria-label="${book.status === 'disponível' ? 'Emprestar' : 'Devolver'} livro"
                        >
                            <i class="fas ${book.status === 'disponível' ? 'fa-hand-holding' : 'fa-undo'}" aria-hidden="true"></i>
                            ${book.status === 'disponível' ? 'Emprestar' : 'Devolver'}
                        </button>
                    </div>
                </div>
            </article>
        `;
    },

    updateResultCount() {
        const showingElement = document.getElementById('showing-count');
        const totalElement = document.getElementById('total-count');
        
        if (showingElement && totalElement) {
            const total = AppState.filteredBooks.length;
            const showing = Math.min(CONFIG.ITEMS_PER_PAGE, total);
            
            showingElement.textContent = showing;
            totalElement.textContent = total;
        }
    },

    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container) return;

        const totalPages = Math.ceil(AppState.filteredBooks.length / CONFIG.ITEMS_PER_PAGE);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Botão anterior
        paginationHTML += `
            <button 
                type="button" 
                class="pagination-btn" 
                onclick="UI.goToPage(${AppState.currentPagination - 1})"
                ${AppState.currentPagination === 1 ? 'disabled' : ''}
                aria-label="Página anterior"
            >
                <i class="fas fa-chevron-left" aria-hidden="true"></i>
            </button>
        `;

        // Números das páginas
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || 
                i === totalPages || 
                (i >= AppState.currentPagination - 2 && i <= AppState.currentPagination + 2)
            ) {
                paginationHTML += `
                    <button 
                        type="button" 
                        class="pagination-btn ${i === AppState.currentPagination ? 'active' : ''}" 
                        onclick="UI.goToPage(${i})"
                        aria-label="Página ${i}"
                        aria-current="${i === AppState.currentPagination ? 'page' : 'false'}"
                    >
                        ${i}
                    </button>
                `;
            } else if (
                i === AppState.currentPagination - 3 || 
                i === AppState.currentPagination + 3
            ) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        // Botão próximo
        paginationHTML += `
            <button 
                type="button" 
                class="pagination-btn" 
                onclick="UI.goToPage(${AppState.currentPagination + 1})"
                ${AppState.currentPagination === totalPages ? 'disabled' : ''}
                aria-label="Próxima página"
            >
                <i class="fas fa-chevron-right" aria-hidden="true"></i>
            </button>
        `;

        container.innerHTML = paginationHTML;
    },

    goToPage(page) {
        const totalPages = Math.ceil(AppState.filteredBooks.length / CONFIG.ITEMS_PER_PAGE);
        
        if (page < 1 || page > totalPages) return;
        
        AppState.currentPagination = page;
        this.renderBooks();
        
        // Scroll para o topo da lista
        document.getElementById('books-grid').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    },

    // Relatórios
    async loadReports() {
        const statsContainer = document.getElementById('detailed-stats');
        if (!statsContainer) return;

        try {
            const stats = await ApiService.getStats();
            
            let statsHTML = `
                <div class="stats-grid">
                    <div class="stat-item">
                        <h4>Total de Livros</h4>
                        <p class="stat-value">${stats.total_livros}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Disponíveis</h4>
                        <p class="stat-value">${stats.livros_disponiveis}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Emprestados</h4>
                        <p class="stat-value">${stats.livros_emprestados}</p>
                    </div>
                </div>
                
                <h4>Por Editora</h4>
                <div class="editora-stats">
            `;

            Object.entries(stats.por_editora || {}).forEach(([editora, count]) => {
                statsHTML += `
                    <div class="editora-item">
                        <span class="editora-name">${Utils.escapeHtml(editora)}</span>
                        <span class="editora-count">${count}</span>
                    </div>
                `;
            });

            statsHTML += '</div>';
            statsContainer.innerHTML = statsHTML;
            
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
            statsContainer.innerHTML = '<p>Erro ao carregar estatísticas.</p>';
        }
    }
};

// ========================================
// GERENCIAMENTO DE LIVROS
// ========================================

/**
 * Gerenciador de operações CRUD de livros
 */
const BookManager = {
    // Mostrar modal para novo livro
    showNewBookModal() {
        AppState.editingBook = null;
        this.resetForm();
        document.getElementById('modal-title').textContent = 'Novo Livro';
        document.getElementById('save-btn').textContent = 'Salvar Livro';
        this.showModal('livro-modal');
    },

    // Editar livro existente
    async editBook(id) {
        try {
            const book = await ApiService.getBook(id);
            AppState.editingBook = book;
            this.populateForm(book);
            document.getElementById('modal-title').textContent = 'Editar Livro';
            document.getElementById('save-btn').textContent = 'Atualizar Livro';
            this.showModal('livro-modal');
        } catch (error) {
            UI.showToast('Erro ao carregar dados do livro', 'error');
        }
    },

    // Popular formulário com dados do livro
    populateForm(book) {
        const form = document.getElementById('livro-form');
        const formData = new FormData();
        
        Object.entries(book).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && value !== null) {
                input.value = value;
            }
        });
    },

    // Resetar formulário
    resetForm() {
        const form = document.getElementById('livro-form');
        form.reset();
        this.clearValidationErrors();
    },

    // Salvar livro (criar ou atualizar)
    async saveBook(formData) {
        try {
            if (AppState.editingBook) {
                await ApiService.updateBook(AppState.editingBook.id, formData);
                UI.showToast('Livro atualizado com sucesso!', 'success');
            } else {
                await ApiService.createBook(formData);
                UI.showToast('Livro adicionado com sucesso!', 'success');
            }

            this.hideModal('livro-modal');
            
            // Recarregar dados
            if (AppState.currentPage === 'catalogo') {
                await UI.searchAndFilter();
            }
            if (AppState.currentPage === 'home') {
                await UI.loadDashboard();
            }
            
        } catch (error) {
            UI.showToast(error.message || 'Erro ao salvar livro', 'error');
        }
    },

    // Deletar livro
    async deleteBook(id) {
        const confirmed = await this.showConfirmDialog(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.'
        );

        if (!confirmed) return;

        try {
            await ApiService.deleteBook(id);
            UI.showToast('Livro excluído com sucesso!', 'success');
            
            // Recarregar dados
            if (AppState.currentPage === 'catalogo') {
                await UI.searchAndFilter();
            }
            if (AppState.currentPage === 'home') {
                await UI.loadDashboard();
            }
            
        } catch (error) {
            UI.showToast(error.message || 'Erro ao excluir livro', 'error');
        }
    },

    // Alternar status do livro (emprestar/devolver)
    async toggleBookStatus(id) {
        try {
            // Encontrar livro no estado atual
            let book = AppState.currentBooks.find(b => b.id === id);
            if (!book) {
                // Se não encontrou, buscar nos dados mock
                const mockData = ApiService.getMockData('/livros');
                book = mockData.find(b => b.id === id);
            }
            
            if (!book) {
                UI.showToast('Livro não encontrado', 'error');
                return;
            }

            try {
                let result;
                if (book.status === 'disponível') {
                    result = await ApiService.borrowBook(id);
                    UI.showToast(`Livro "${book.titulo}" emprestado com sucesso!`, 'success');
                } else {
                    result = await ApiService.returnBook(id);
                    UI.showToast(`Livro "${book.titulo}" devolvido com sucesso!`, 'success');
                }
            } catch (apiError) {
                // Se API não estiver disponível, simular localmente
                console.warn('API não disponível, simulando operação localmente');
                
                // Atualizar status localmente
                book.status = book.status === 'disponível' ? 'emprestado' : 'disponível';
                book.data_emprestimo = book.status === 'emprestado' ? new Date().toISOString() : null;
                
                // Atualizar no array local
                const bookIndex = AppState.currentBooks.findIndex(b => b.id === id);
                if (bookIndex >= 0) {
                    AppState.currentBooks[bookIndex] = book;
                }
                
                UI.showToast(
                    `Livro "${book.titulo}" ${book.status === 'emprestado' ? 'emprestado' : 'devolvido'} com sucesso! (modo offline)`, 
                    'warning'
                );
            }

            // Recarregar dados
            if (AppState.currentPage === 'catalogo') {
                await UI.searchAndFilter();
            }
            if (AppState.currentPage === 'home') {
                await UI.loadDashboard();
            }

        } catch (error) {
            console.error('Erro ao alterar status:', error);
            UI.showToast('Erro ao alterar status do livro', 'error');
        }
    },

    // Validação do formulário
    validateForm() {
        const form = document.getElementById('livro-form');
        const formData = new FormData(form);
        const errors = {};

        // Validar campos obrigatórios
        const titulo = formData.get('titulo').trim();
        if (!titulo || titulo.length < 3 || titulo.length > 90) {
            errors.titulo = 'Título deve ter entre 3 e 90 caracteres';
        }

        const autor = formData.get('autor').trim();
        if (!autor || autor.length > 100) {
            errors.autor = 'Autor é obrigatório e deve ter até 100 caracteres';
        }

        const ano = parseInt(formData.get('ano'));
        const currentYear = new Date().getFullYear();
        if (!ano || ano < 1900 || ano > currentYear) {
            errors.ano = `Ano deve estar entre 1900 e ${currentYear}`;
        }

        // Validar ISBN se fornecido
        const isbn = formData.get('isbn').trim();
        if (isbn && isbn.length > 20) {
            errors.isbn = 'ISBN deve ter até 20 caracteres';
        }

        // Validar URL da capa se fornecida
        const capaUrl = formData.get('capa_url').trim();
        if (capaUrl && !Utils.isValidUrl(capaUrl)) {
            errors.capa_url = 'URL da capa deve ser válida';
        }

        // Mostrar erros
        this.showValidationErrors(errors);

        return Object.keys(errors).length === 0;
    },

    showValidationErrors(errors) {
        this.clearValidationErrors();

        Object.entries(errors).forEach(([field, message]) => {
            const formGroup = document.querySelector(`[name="${field}"]`).closest('.form-group');
            const errorElement = formGroup.querySelector('.error-message');
            
            formGroup.classList.add('error');
            errorElement.textContent = message;
        });
    },

    clearValidationErrors() {
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
            group.querySelector('.error-message').textContent = '';
        });
    },

    // Gerenciamento de modais
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            
            // Focar no primeiro input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
            
            // Prevenir scroll do body
            document.body.style.overflow = 'hidden';
        }
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    },

    // Dialog de confirmação
    showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const titleElement = document.getElementById('confirm-title');
            const messageElement = document.getElementById('confirm-message');
            const cancelBtn = document.getElementById('confirm-cancel');
            const okBtn = document.getElementById('confirm-ok');

            titleElement.textContent = title;
            messageElement.textContent = message;

            const handleCancel = () => {
                this.hideModal('confirm-modal');
                resolve(false);
                cleanup();
            };

            const handleOk = () => {
                this.hideModal('confirm-modal');
                resolve(true);
                cleanup();
            };

            const cleanup = () => {
                cancelBtn.removeEventListener('click', handleCancel);
                okBtn.removeEventListener('click', handleOk);
            };

            cancelBtn.addEventListener('click', handleCancel);
            okBtn.addEventListener('click', handleOk);

            this.showModal('confirm-modal');
        });
    }
};

// ========================================
// GERENCIAMENTO DE FILTROS
// ========================================

/**
 * Gerenciador de filtros e busca
 */
const FilterManager = {
    init() {
        this.setupEventListeners();
        this.loadSavedFilters();
    },

    setupEventListeners() {
        // Busca com debounce
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const debouncedSearch = Utils.debounce(() => {
                AppState.filters.search = searchInput.value.trim();
                this.applyFilters();
            }, 500);

            searchInput.addEventListener('input', debouncedSearch);
        }

        // Filtros de radio
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const filterType = e.target.name.replace('-filter', '');
                AppState.filters[filterType] = e.target.value;
                this.applyFilters();
            });
        });

        // Ordenação
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                AppState.filters.sort = e.target.value;
                this.applyFilters();
                this.saveFilters();
            });
        }

        // Limpar filtros
        const clearButton = document.getElementById('clear-filters');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    },

    applyFilters() {
        AppState.currentPagination = 1; // Reset para primeira página
        
        if (AppState.currentPage === 'catalogo') {
            UI.searchAndFilter();
        }
        
        this.saveFilters();
    },

    clearAllFilters() {
        // Resetar estado
        AppState.filters = {
            search: '',
            status: '',
            editora: '',
            genero: '',
            sort: 'titulo-asc'
        };

        // Resetar UI
        document.getElementById('search-input').value = '';
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = radio.value === '';
        });
        document.getElementById('sort-select').value = 'titulo-asc';

        this.applyFilters();
    },

    saveFilters() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.FILTERS, JSON.stringify(AppState.filters));
    },

    loadSavedFilters() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.FILTERS);
            if (saved) {
                const filters = JSON.parse(saved);
                AppState.filters = { ...AppState.filters, ...filters };
                
                // Aplicar na UI
                Object.entries(filters).forEach(([key, value]) => {
                    if (key === 'search') {
                        const input = document.getElementById('search-input');
                        if (input) input.value = value;
                    } else if (key === 'sort') {
                        const select = document.getElementById('sort-select');
                        if (select) select.value = value;
                    } else {
                        const radio = document.querySelector(`input[name="${key}-filter"][value="${value}"]`);
                        if (radio) radio.checked = true;
                    }
                });
            }
        } catch (error) {
            console.warn('Erro ao carregar filtros salvos:', error);
        }
    }
};

// ========================================
// GERENCIAMENTO DE TEMA
// ========================================

/**
 * Gerenciador de tema claro/escuro
 */
const ThemeManager = {
    currentTheme: 'light',

    init() {
        this.loadSavedTheme();
        this.setupEventListeners();
    },

    setupEventListeners() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
    },

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        
        // Atualizar ícone do botão
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Atualizar aria-label
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', 
                theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'
            );
        }
        
        // Salvar preferência
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
        
        // Feedback para usuário
        UI.showToast(`Tema ${theme === 'dark' ? 'escuro' : 'claro'} ativado`, 'info');
        
        console.log(`Tema alterado para: ${theme}`);
    },

    loadSavedTheme() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        this.setTheme(theme);
    }
};

// ========================================
// EXPORTAÇÃO DE DADOS
// ========================================

/**
 * Gerenciador de exportação de relatórios
 */
const ExportManager = {
    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        const csvBtn = document.getElementById('export-csv');
        const jsonBtn = document.getElementById('export-json');

        if (csvBtn) {
            csvBtn.addEventListener('click', () => this.exportCSV());
        }

        if (jsonBtn) {
            jsonBtn.addEventListener('click', () => this.exportJSON());
        }
    },

    async exportCSV() {
        try {
            const books = await ApiService.getBooks();
            const csvContent = this.convertToCSV(books);
            this.downloadFile(csvContent, 'biblioteca-acervo.csv', 'text/csv');
            UI.showToast('Arquivo CSV exportado com sucesso!', 'success');
        } catch (error) {
            UI.showToast('Erro ao exportar CSV', 'error');
        }
    },

    async exportJSON() {
        try {
            const books = await ApiService.getBooks();
            const jsonContent = JSON.stringify(books, null, 2);
            this.downloadFile(jsonContent, 'biblioteca-acervo.json', 'application/json');
            UI.showToast('Arquivo JSON exportado com sucesso!', 'success');
        } catch (error) {
            UI.showToast('Erro ao exportar JSON', 'error');
        }
    },

    convertToCSV(data) {
        if (!data.length) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [];

        // Cabeçalho
        csvRows.push(headers.join(','));

        // Dados
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Escapar aspas e quebras de linha
                return typeof value === 'string' 
                    ? `"${value.replace(/"/g, '""')}"` 
                    : value;
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    },

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
};

// ========================================
// ACESSIBILIDADE
// ========================================

/**
 * Melhorias de acessibilidade
 */
const AccessibilityManager = {
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupAriaLiveRegions();
    },

    setupKeyboardNavigation() {
        // Atalho Alt+N para novo livro
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                BookManager.showNewBookModal();
            }

            // ESC para fechar modais
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    BookManager.hideModal(activeModal.id);
                }
            }

            // Enter/Space em elementos clicáveis
            if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute('data-clickable')) {
                e.preventDefault();
                e.target.click();
            }
        });
    },

    setupFocusManagement() {
        // Trap de foco em modais
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.trapFocus(e, activeModal);
                }
            }
        });
    },

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    },

    setupAriaLiveRegions() {
        // Anunciar mudanças de página
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('page') && target.classList.contains('active')) {
                        this.announcePageChange(target.id);
                    }
                }
            });
        });

        document.querySelectorAll('.page').forEach(page => {
            observer.observe(page, { attributes: true });
        });
    },

    announcePageChange(pageId) {
        const pageNames = {
            'home-page': 'Dashboard da Biblioteca',
            'catalogo-page': 'Catálogo de Livros',
            'gerenciar-page': 'Gerenciar Acervo',
            'relatorios-page': 'Relatórios'
        };

        const pageName = pageNames[pageId];
        if (pageName) {
            this.announce(`Navegou para ${pageName}`);
        }
    },

    announce(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
};

// ========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ========================================

/**
 * Inicialização principal da aplicação
 */
class BibliotecaApp {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Verificar se API está disponível (não bloquear se não estiver)
            const apiAvailable = await this.checkApiHealth();

            // Inicializar módulos
            ThemeManager.init();
            FilterManager.init();
            ExportManager.init();
            AccessibilityManager.init();

            // Setup event listeners
            this.setupEventListeners();

            // Carregar página inicial
            UI.showPage('home');

            this.isInitialized = true;
            
            if (apiAvailable) {
                UI.showToast('Sistema carregado com sucesso!', 'success');
            } else {
                UI.showToast('Sistema carregado em modo demonstração!', 'info');
            }

        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            UI.showToast('Erro ao carregar o sistema', 'error');
        }
    }

    async checkApiHealth() {
        try {
            await ApiService.healthCheck();
            console.log('✅ API conectada com sucesso');
            return true;
        } catch (error) {
            console.warn('⚠️ API não disponível, usando modo offline com dados mock');
            UI.showToast('Modo offline ativado - usando dados de exemplo', 'warning');
            return false;
        }
    }

    setupEventListeners() {
        // Navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('data-page');
                UI.showPage(page);
            });
        });

        // Botão novo livro
        const novoLivroBtn = document.getElementById('novo-livro-btn');
        if (novoLivroBtn) {
            novoLivroBtn.addEventListener('click', () => {
                BookManager.showNewBookModal();
            });
        }

        // Formulário de livro
        const livroForm = document.getElementById('livro-form');
        if (livroForm) {
            livroForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (!BookManager.validateForm()) return;

                const formData = new FormData(e.target);
                const bookData = Object.fromEntries(formData.entries());
                
                // Limpar campos vazios
                Object.keys(bookData).forEach(key => {
                    if (!bookData[key]) delete bookData[key];
                });

                await BookManager.saveBook(bookData);
            });
        }

        // Botões do modal
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                BookManager.hideModal('livro-modal');
            });
        }

        // Fechar modais clicando no overlay
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    BookManager.hideModal(modal.id);
                }
            });
        });

        // Botões de fechar modal
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                BookManager.hideModal(modal.id);
            });
        });

        // Controles de visualização
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const view = e.target.getAttribute('data-view');
                this.changeView(view);
            });
        });
    }

    changeView(view) {
        const booksGrid = document.getElementById('books-grid');
        if (booksGrid) {
            booksGrid.className = view === 'list' ? 'book-list' : 'book-grid';
        }
    }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Instanciar e inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    const app = new BibliotecaApp();
    await app.init();
});

// Expor funções globais necessárias
window.BookManager = BookManager;
window.UI = UI;
