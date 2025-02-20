// Оборачиваем создание экземпляра класса в DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const ideasManager = new IdeasManager();
});

class IdeasManager {
    constructor() {
        // Проверяем наличие всех необходимых элементов
        const requiredElements = {
            ideasGrid: document.getElementById('ideasGrid'),
            addIdeaBtn: document.getElementById('addIdeaBtn'),
            ideaModal: document.getElementById('ideaModal'),
            newIdeaForm: document.getElementById('newIdeaForm'),
            imagePreview: document.getElementById('imagePreview'),
            imageViewerModal: document.getElementById('imageViewerModal'),
            fullSizeImage: document.getElementById('fullSizeImage'),
            categoryFilter: document.querySelector('.category-filter')
        };

        // Проверяем, все ли элементы найдены
        for (const [key, element] of Object.entries(requiredElements)) {
            if (!element) {
                console.error(`Required element not found: ${key}`);
                return;
            }
        }

        // Инициализируем свойства только если все элементы найдены
        this.ideasContainer = requiredElements.ideasGrid;
        this.addIdeaBtn = requiredElements.addIdeaBtn;
        this.ideaModal = requiredElements.ideaModal;
        this.newIdeaForm = requiredElements.newIdeaForm;
        this.imagePreview = requiredElements.imagePreview;
        this.imageViewerModal = requiredElements.imageViewerModal;
        this.fullSizeImage = requiredElements.fullSizeImage;
        this.currentCategory = 'all';
        this.ideas = this.loadIdeas();

        // Инициализируем функциональность
        this.init();
        this.setupImageUpload();
        this.setupImageViewer();
        this.setupCategoryFilter();
    }

    init() {
        this.renderIdeas();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.addIdeaBtn.addEventListener('click', () => this.handleAddIdeaClick());
        this.newIdeaForm.addEventListener('submit', (e) => this.handleNewIdea(e));

        // Закрытие модального окна
        const closeBtn = this.ideaModal.querySelector('.close');
        closeBtn.addEventListener('click', () => this.closeIdeaModal());

        window.addEventListener('click', (e) => {
            if (e.target === this.ideaModal) {
                this.closeIdeaModal();
            }
        });

        // Добавляем делегирование событий для удаления комментариев
        this.ideasContainer.addEventListener('click', (e) => {
            if (e.target.closest('.comment-delete-btn')) {
                const commentId = parseInt(e.target.closest('.comment-delete-btn').dataset.commentId);
                const ideaId = parseInt(e.target.closest('.comments-section').id.replace('comments-', ''));
                this.handleDeleteComment(ideaId, commentId);
            }
        });
    }

    setupImageUpload() {
        const imageInput = document.getElementById('ideaImage');
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    setupImageViewer() {
        // Закрытие просмотрщика изображений
        this.imageViewerModal.querySelector('.close').addEventListener('click', () => {
            this.imageViewerModal.classList.remove('active');
        });

        // Закрытие по клику вне изображения
        this.imageViewerModal.addEventListener('click', (e) => {
            if (e.target === this.imageViewerModal) {
                this.imageViewerModal.classList.remove('active');
            }
        });

        // Закрытие по клавише Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.imageViewerModal.classList.contains('active')) {
                this.imageViewerModal.classList.remove('active');
            }
        });
    }

    setupCategoryFilter() {
        const categoryFilter = document.querySelector('.category-filter');
        console.log('Category filter element:', categoryFilter);

        categoryFilter.addEventListener('click', (e) => {
            console.log('Click event target:', e.target);
            console.log('Click event currentTarget:', e.currentTarget);

            const btn = e.target.closest('.category-btn');
            console.log('Found category button:', btn);

            if (!btn) return;

            console.log('Category value:', btn.dataset.category);

            // Обновляем активную кнопку
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            btn.classList.add('active');

            // Фильтруем идеи
            this.currentCategory = btn.dataset.category;
            console.log('Current category set to:', this.currentCategory);

            const ideasBeforeFilter = this.ideas.length;
            this.renderIdeas();
            const ideasAfterFilter = document.querySelectorAll('.idea-card').length;
            console.log(`Ideas before/after filter: ${ideasBeforeFilter}/${ideasAfterFilter}`);
        });
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Файл слишком большой. Максимальный размер: 5MB');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview.src = e.target.result;
                this.imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    }

    loadIdeas() {
        const ideas = localStorage.getItem('ideas');
        return ideas ? JSON.parse(ideas) : [];
    }

    saveIdeas() {
        localStorage.setItem('ideas', JSON.stringify(this.ideas));
    }

    handleAddIdeaClick() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Пожалуйста, войдите в систему, чтобы добавить идею');
            return;
        }
        this.ideaModal.classList.add('active');
    }

    closeIdeaModal() {
        this.ideaModal.classList.remove('active');
        this.newIdeaForm.reset();
        this.resetImageUpload();
    }

    handleNewIdea(e) {
        e.preventDefault();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        const ideaData = {
            title: e.target.title.value,
            description: e.target.description.value,
            category: e.target.category.value,
            author: currentUser.username,
            authorId: currentUser.id,
            likes: [],
            comments: [],
            createdAt: new Date().toISOString(),
            image: this.imagePreview.classList.contains('hidden') ? null : this.imagePreview.src
        };

        if (this.editingIdeaId) {
            const ideaIndex = this.ideas.findIndex(i => i.id === this.editingIdeaId);
            if (ideaIndex !== -1) {
                this.ideas[ideaIndex] = {
                    ...this.ideas[ideaIndex],
                    ...ideaData,
                    id: this.editingIdeaId
                };
            }
            this.editingIdeaId = null;
        } else {
            ideaData.id = Date.now();
            this.ideas.unshift(ideaData);
        }

        this.saveIdeas();
        this.renderIdeas();
        this.closeIdeaModal();
        this.resetImageUpload();
    }

    resetImageUpload() {
        const imageInput = document.getElementById('ideaImage');
        imageInput.value = '';
        this.imagePreview.src = '';
        this.imagePreview.classList.add('hidden');
    }

    openImageViewer(imageSrc, title) {
        this.fullSizeImage.src = imageSrc;
        this.fullSizeImage.alt = title;
        this.imageViewerModal.classList.add('active');
    }

    createIdeaCard(idea) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const isLiked = currentUser ? idea.likes.includes(currentUser.id) : false;
        const isAuthor = currentUser && currentUser.id === idea.authorId;

        const card = document.createElement('div');
        card.className = 'idea-card';
        card.innerHTML = `
            <div class="idea-header">
                <h3>${idea.title}</h3>
                ${isAuthor ? `
                    <div class="idea-actions">
                        <button class="idea-actions-btn">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="idea-actions-menu">
                            <button class="edit-idea-btn">
                                <i class="fas fa-edit"></i> Редактировать
                            </button>
                            <button class="delete-idea-btn delete">
                                <i class="fas fa-trash-alt"></i> Удалить
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
            <span class="idea-category ${idea.category}">${this.getCategoryName(idea.category)}</span>
            ${idea.image ? `
                <div class="idea-image-container">
                    <img src="${idea.image}" alt="${idea.title}" class="idea-image">
                </div>
            ` : ''}
            <div class="idea-content">
                <p>${idea.description}</p>
            </div>
            <div class="idea-meta">
                <span class="author">Автор: ${idea.author}</span>
                <div class="interactions">
                    <button class="like-btn ${isLiked ? 'active' : ''}" data-idea-id="${idea.id}">
                        <i class="fas fa-heart"></i>
                        <span>${idea.likes.length}</span>
                    </button>
                    <button class="comment-btn" data-idea-id="${idea.id}">
                        <i class="fas fa-comment"></i>
                        <span>${idea.comments.length}</span>
                    </button>
                </div>
            </div>
            <div class="comments-section" id="comments-${idea.id}">
                ${this.renderComments(idea.comments, currentUser)}
                ${this.renderCommentForm(idea.id)}
            </div>
        `;

        // Добавляем обработчики событий
        if (isAuthor) {
            const actionsBtn = card.querySelector('.idea-actions-btn');
            const actionsMenu = card.querySelector('.idea-actions-menu');
            const editBtn = card.querySelector('.edit-idea-btn');
            const deleteBtn = card.querySelector('.delete-idea-btn');

            actionsBtn.addEventListener('click', () => {
                actionsMenu.classList.toggle('active');
            });

            editBtn.addEventListener('click', () => this.handleEditIdea(idea));
            deleteBtn.addEventListener('click', () => this.handleDeleteIdea(idea.id));

            // Закрытие меню при клике вне его
            document.addEventListener('click', (e) => {
                if (!actionsBtn.contains(e.target)) {
                    actionsMenu.classList.remove('active');
                }
            });
        }

        const likeBtn = card.querySelector('.like-btn');
        const commentBtn = card.querySelector('.comment-btn');

        likeBtn.addEventListener('click', () => this.handleLike(idea.id));
        commentBtn.addEventListener('click', () => this.toggleComments(idea.id));

        const commentForm = card.querySelector('.comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.handleNewComment(e, idea.id));
        }

        // Добавляем обработчик клика по изображению
        if (idea.image) {
            const imageContainer = card.querySelector('.idea-image-container');
            imageContainer.addEventListener('click', () => {
                this.openImageViewer(idea.image, idea.title);
            });
        }

        return card;
    }

    renderComments(comments, currentUser) {
        if (comments.length === 0) return '';

        return `
            <div class="comments-list">
                ${comments.map(comment => `
                    <div class="comment">
                        <div class="comment-header">
                            <div class="comment-author">${comment.author}</div>
                            ${currentUser && (currentUser.id === comment.authorId || currentUser.id === this.ideas.find(i => i.comments.includes(comment)).authorId) ? `
                                <div class="comment-actions">
                                    <button class="comment-delete-btn" data-comment-id="${comment.id}">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                        <div class="comment-text">${comment.text}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCommentForm(ideaId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser) {
            return '<p class="auth-required">Войдите, чтобы оставить комментарий</p>';
        }

        return `
            <form class="comment-form" data-idea-id="${ideaId}">
                <input type="text" placeholder="Написать комментарий..." required>
                <button type="submit">Отправить</button>
            </form>
        `;
    }

    handleLike(ideaId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Пожалуйста, войдите в систему, чтобы оценить идею');
            return;
        }

        const idea = this.ideas.find(i => i.id === ideaId);
        const likeIndex = idea.likes.indexOf(currentUser.id);

        if (likeIndex === -1) {
            idea.likes.push(currentUser.id);
        } else {
            idea.likes.splice(likeIndex, 1);
        }

        this.saveIdeas();
        this.renderIdeas();
    }

    toggleComments(ideaId) {
        const commentsSection = document.getElementById(`comments-${ideaId}`);
        commentsSection.classList.toggle('hidden');
    }

    handleNewComment(e, ideaId) {
        e.preventDefault();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        const commentText = e.target.querySelector('input').value;
        const idea = this.ideas.find(i => i.id === ideaId);

        const newComment = {
            id: Date.now(),
            author: currentUser.username,
            authorId: currentUser.id,
            text: commentText,
            createdAt: new Date().toISOString()
        };

        idea.comments.push(newComment);
        this.saveIdeas();
        this.renderIdeas();
    }

    handleEditIdea(idea) {
        const form = this.newIdeaForm;
        form.title.value = idea.title;
        form.description.value = idea.description;
        form.category.value = idea.category;

        if (idea.image) {
            this.imagePreview.src = idea.image;
            this.imagePreview.classList.remove('hidden');
        } else {
            this.resetImageUpload();
        }

        this.ideaModal.classList.add('active');
        this.editingIdeaId = idea.id;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Сохранить изменения';
    }

    handleDeleteIdea(ideaId) {
        if (confirm('Вы уверены, что хотите удалить эту идею?')) {
            this.ideas = this.ideas.filter(idea => idea.id !== ideaId);
            this.saveIdeas();
            this.renderIdeas();
        }
    }

    handleDeleteComment(ideaId, commentId) {
        const idea = this.ideas.find(i => i.id === ideaId);
        if (idea) {
            idea.comments = idea.comments.filter(comment => comment.id !== commentId);
            this.saveIdeas();
            this.renderIdeas();
        }
    }

    getCategoryName(category) {
        const categories = {
            tech: 'Технологии',
            art: 'Искусство',
            science: 'Наука',
            social: 'Общество',
            business: 'Бизнес',
            education: 'Образование',
            entertainment: 'Развлечения',
            other: 'Другое'
        };
        return categories[category] || 'Без категории';
    }

    renderIdeas() {
        this.ideasContainer.innerHTML = '';
        let ideasToShow = this.ideas;

        // Фильтруем идеи по категории
        if (this.currentCategory !== 'all') {
            ideasToShow = this.ideas.filter(idea => idea.category === this.currentCategory);
        }

        ideasToShow.forEach(idea => {
            const card = this.createIdeaCard(idea);
            this.ideasContainer.appendChild(card);
        });
    }
} 