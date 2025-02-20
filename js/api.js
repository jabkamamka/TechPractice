class Api {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    async request(endpoint, options = {}) {
        options.credentials = 'include'; // Важно для работы с eсессиями

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Произошла ошибка');
        }

        return data;
    }

    // Методы аутентификации
    async register(userData) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async logout() {
        return this.request('/logout', {
            method: 'POST'
        });
    }

    // Методы для работы с идеями
    async getIdeas() {
        return this.request('/ideas');
    }

    async createIdea(ideaData) {
        const formData = new FormData();
        Object.entries(ideaData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        return this.request('/ideas', {
            method: 'POST',
            headers: {},
            body: formData
        });
    }

    async likeIdea(ideaId) {
        return this.request(`/ideas/${ideaId}/like`, {
            method: 'POST'
        });
    }

    async commentIdea(ideaId, text) {
        return this.request(`/ideas/${ideaId}/comment`, {
            method: 'POST',
            body: JSON.stringify({ text })
        });
    }
}

const api = new Api(); 