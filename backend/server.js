const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

// Настройки Telegram бота
const token = '7512183473:AAHiP4JgZ57tdV1KsLhZS3I5bnu3HTkxA9g';
const webAppUrl = 'https://beznegative.github.io/testvpnserv/';
const bot = new TelegramBot(token, {polling: true});

const app = express();
const PORT = 3000; // Изменен порт с 8000 на 3000
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());

// Обработка команд в Telegram боте
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Добро пожаловать в VPN сервис! Нажмите кнопку ниже, чтобы подключить VPN.', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Подключить VPN', web_app: {url: webAppUrl}}]
                ]
            }
        });
    }
});

// Получить всех пользователей (для админа)
app.get('/users', (req, res) => {
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Ошибка чтения users.json' });
        let users = [];
        try {
            users = JSON.parse(data);
        } catch (e) {}
        res.json(users);
    });
});

// Добавить/обновить пользователя
app.post('/users', (req, res) => {
    const { id, username, photo_url } = req.body;
    if (!id || !username) {
        return res.status(400).json({ error: 'id и username обязательны' });
    }
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        let users = [];
        if (!err && data) {
            try {
                users = JSON.parse(data);
            } catch (e) {}
        }
        // Обновить или добавить пользователя
        const idx = users.findIndex(u => u.id === id);
        if (idx > -1) {
            users[idx] = { id, username, photo_url };
        } else {
            users.push({ id, username, photo_url });
        }
        fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Ошибка записи users.json' });
            res.json({ ok: true });
        });
    });
});

// Эндпоинт для проверки статуса бота
app.get('/bot-status', (req, res) => {
    res.json({ 
        status: 'active', 
        message: 'Telegram бот запущен и работает' 
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Telegram bot started. Use /start command to interact.`);
});
