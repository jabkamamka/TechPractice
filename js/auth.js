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
        const addIdeaBtn = document.getElementById('addIdeaBtn');

        if (currentUser) {
            loginBtn.textContent = currentUser.username;
            if (addIdeaBtn) {
                addIdeaBtn.style.display = 'block';
            }
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
            if (addIdeaBtn) {
                addIdeaBtn.style.display = 'none';
            }
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
}); 