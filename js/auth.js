class Auth {
    constructor() {
        this.loginModal = document.getElementById('loginModal');
        this.registerModal = document.getElementById('registerModal');
        this.loginBtn = document.getElementById('loginBtn');
        this.openRegisterBtn = document.getElementById('openRegisterBtn');
        this.openLoginBtn = document.getElementById('openLoginBtn');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');

        this.currentUser = null;
        this.users = this.loadUsers();

        this.init();
    }

    init() {
        // Кнопки открытия модальных окон
        this.loginBtn.addEventListener('click', () => this.openLoginModal());
        this.openRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeLoginModal();
            this.openRegisterModal();
        });
        this.openLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeRegisterModal();
            this.openLoginModal();
        });

        // Кнопки закрытия модальных окон
        this.loginModal.querySelector('.close').addEventListener('click', () => this.closeLoginModal());
        this.registerModal.querySelector('.close').addEventListener('click', () => this.closeRegisterModal());

        // Закрытие по клику вне модального окна
        window.addEventListener('click', (e) => {
            if (e.target === this.loginModal) this.closeLoginModal();
            if (e.target === this.registerModal) this.closeRegisterModal();
        });

        // Обработка форм
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        // Проверяем сессию
        this.checkSession();
    }

    loadUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    checkSession() {
        const sessionUser = localStorage.getItem('currentUser');
        if (sessionUser) {
            this.currentUser = JSON.parse(sessionUser);
            this.updateUIForLoggedUser();
        }
    }

    openLoginModal() {
        this.loginModal.classList.add('active');
    }

    closeLoginModal() {
        this.loginModal.classList.remove('active');
        this.loginForm.reset();
        this.removeMessages(this.loginModal);
    }

    openRegisterModal() {
        this.registerModal.classList.add('active');
    }

    closeRegisterModal() {
        this.registerModal.classList.remove('active');
        this.registerForm.reset();
        this.removeMessages(this.registerModal);
    }

    removeMessages(modal) {
        const messages = modal.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }

    showMessage(form, message, type = 'error') {
        this.removeMessages(form.closest('.modal'));
        const messageElement = document.createElement('div');
        messageElement.className = `${type}-message`;
        messageElement.textContent = message;
        form.parentNode.appendChild(messageElement);
    }

    handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        const user = this.users.find(u => u.email === email);

        if (!user) {
            this.showMessage(this.loginForm, 'Пользователь не найден');
            return;
        }

        if (user.password !== password) {
            this.showMessage(this.loginForm, 'Неверный пароль');
            return;
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.updateUIForLoggedUser();
        this.showMessage(this.loginForm, 'Вход выполнен успешно!', 'success');

        setTimeout(() => {
            this.closeLoginModal();
        }, 1500);
    }

    handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        const username = form.username.value;
        const email = form.email.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        if (password !== confirmPassword) {
            this.showMessage(this.registerForm, 'Пароли не совпадают');
            return;
        }

        if (this.users.some(u => u.email === email)) {
            this.showMessage(this.registerForm, 'Пользователь с таким email уже существует');
            return;
        }

        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();

        this.showMessage(this.registerForm, 'Регистрация успешна! Выполняется вход...', 'success');

        setTimeout(() => {
            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            this.updateUIForLoggedUser();
            this.closeRegisterModal();
        }, 1500);
    }

    updateUIForLoggedUser() {
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.textContent = this.currentUser.username;

        // Добавляем кнопку выхода
        if (!document.getElementById('logoutBtn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.className = 'auth-btn';
            logoutBtn.textContent = 'Выйти';
            logoutBtn.addEventListener('click', () => this.handleLogout());
            loginBtn.parentNode.appendChild(logoutBtn);
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');

        // Обновляем UI
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.textContent = 'Войти';

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
    }
}

const auth = new Auth();

// Демо-пользователи для тестирования
const demoUsers = [
    {
        id: "user1",
        username: "Михаил",
        email: "mikhail@example.com",
        password: "password123"
    },
    {
        id: "user2",
        username: "Анна",
        email: "anna@example.com",
        password: "password123"
    }
];

// Инициализация хранилища пользователей
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(demoUsers));
}

document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const openRegisterBtn = document.getElementById('openRegisterBtn');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const addIdeaBtn = document.getElementById('addIdeaBtn');

    // Проверяем авторизацию при загрузке страницы
    function checkAuth() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            // Если пользователь не авторизован, блокируем действия
            if (addIdeaBtn) {
                addIdeaBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('Пожалуйста, войдите в систему, чтобы добавить идею');
                    loginModal.classList.add('active');
                });
            }

            // Блокируем лайки и комментарии
            document.addEventListener('click', (e) => {
                if (e.target.closest('.like-btn') || e.target.closest('.comment-btn')) {
                    e.preventDefault();
                    alert('Пожалуйста, войдите в систему, чтобы взаимодействовать с идеями');
                    loginModal.classList.add('active');
                }
            }, true);
        }
    }

    // Обработчики для открытия/закрытия модальных окон
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
    });

    openRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('active');
        registerModal.classList.add('active');
    });

    openLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.classList.remove('active');
        loginModal.classList.add('active');
    });

    // Закрытие модальных окон
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            loginModal.classList.remove('active');
            registerModal.classList.remove('active');
        });
    });

    // Обработка входа
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Успешный вход
            const userData = {
                id: user.id,
                username: user.username,
                email: user.email
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            loginModal.classList.remove('active');
            updateAuthUI();
            location.reload(); // Перезагружаем страницу для обновления UI
        } else {
            showError(loginForm, 'Неверный email или пароль');
        }
    });

    // Обработка регистрации
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (password !== confirmPassword) {
            showError(registerForm, 'Пароли не совпадают');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users'));
        if (users.some(u => u.email === email)) {
            showError(registerForm, 'Пользователь с таким email уже существует');
            return;
        }

        // Создаем нового пользователя
        const newUser = {
            id: 'user' + Date.now(),
            username,
            email,
            password
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Автоматически входим
        const userData = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));

        registerModal.classList.remove('active');
        updateAuthUI();
        location.reload(); // Перезагружаем страницу для обновления UI
    });

    // Обновление UI в зависимости от состояния авторизации
    function updateAuthUI() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const loginBtn = document.getElementById('loginBtn');

        if (currentUser) {
            loginBtn.textContent = currentUser.username;
            // Добавляем кнопку выхода
            if (!document.getElementById('logoutBtn')) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logoutBtn';
                logoutBtn.className = 'auth-btn';
                logoutBtn.textContent = 'Выйти';
                logoutBtn.addEventListener('click', logout);
                loginBtn.parentNode.insertBefore(logoutBtn, loginBtn.nextSibling);
            }
        } else {
            loginBtn.textContent = 'Войти';
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.remove();
            }
        }
    }

    // Функция выхода
    function logout() {
        localStorage.removeItem('currentUser');
        updateAuthUI();
        location.reload(); // Перезагружаем страницу для обновления UI
    }

    // Показ ошибок
    function showError(form, message) {
        let errorDiv = form.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            form.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    // Инициализация UI при загрузке страницы
    updateAuthUI();
    checkAuth();
}); 