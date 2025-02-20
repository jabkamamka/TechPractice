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