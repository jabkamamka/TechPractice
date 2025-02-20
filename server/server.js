const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const session = require('express-session');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5500',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using HTTPS
}));

// Конфигурация базы данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'ideas_book'
});

// Конфигурация загрузки изображений
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Middleware для проверки авторизации
const checkAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    next();
};

// Маршруты аутентификации
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.promise().query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        req.session.userId = result.insertId;
        req.session.username = username;

        res.json({ user: { id: result.insertId, username, email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }

        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({ user: { id: user.id, username: user.username, email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Выход выполнен успешно' });
});

// Маршруты для идей
app.get('/api/ideas', async (req, res) => {
    try {
        const [ideas] = await db.promise().query(`
            SELECT i.*, u.username as author, 
                   COUNT(DISTINCT l.id) as likes_count,
                   COUNT(DISTINCT c.id) as comments_count
            FROM ideas i
            LEFT JOIN users u ON i.author_id = u.id
            LEFT JOIN likes l ON i.id = l.idea_id
            LEFT JOIN comments c ON i.id = c.idea_id
            GROUP BY i.id
            ORDER BY i.created_at DESC
        `);
        res.json(ideas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ideas', checkAuth, upload.single('image'), async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await db.promise().query(
            'INSERT INTO ideas (title, description, category, image_url, author_id) VALUES (?, ?, ?, ?, ?)',
            [title, description, category, imageUrl, req.session.userId]
        );

        res.json({ id: result.insertId, ...req.body, imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Маршруты для лайков и комментариев
app.post('/api/ideas/:id/like', checkAuth, async (req, res) => {
    try {
        await db.promise().query(
            'INSERT INTO likes (idea_id, user_id) VALUES (?, ?)',
            [req.params.id, req.session.userId]
        );
        res.json({ message: 'Лайк добавлен' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            await db.promise().query(
                'DELETE FROM likes WHERE idea_id = ? AND user_id = ?',
                [req.params.id, req.session.userId]
            );
            res.json({ message: 'Лайк удален' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

app.post('/api/ideas/:id/comment', checkAuth, async (req, res) => {
    try {
        const { text } = req.body;
        const [result] = await db.promise().query(
            'INSERT INTO comments (idea_id, user_id, text) VALUES (?, ?, ?)',
            [req.params.id, req.session.userId, text]
        );
        res.json({ id: result.insertId, text, author: req.session.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Статические файлы для загруженных изображений
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
}); 