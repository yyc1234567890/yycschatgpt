const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 4000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 } // secure should be true in production with HTTPS
}));

// 模拟用户数据库
const users = {
    'user@example.com': {
        password: bcrypt.hashSync('password', 10),
        chatHistory: [],
        prompt: ''
    }
};

// 模拟管理员密码
const ADMIN_PASSWORD = bcrypt.hashSync('engierous', 10);

// 全局变量控制管理员状态
let adminEnabled = false;

// 注册用户
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (users[email]) {
        return res.status(400).send('用户已存在');
    }
    users[email] = {
        password: bcrypt.hashSync(password, 10),
        chatHistory: [],
        prompt: ''
    };
    res.send('用户注册成功');
});

// 用户登录
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users[email];
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).send('凭据无效');
    }
    req.session.user = email;
    res.send('登录成功');
});

// 获取聊天历史记录
app.get('/history', (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('未经授权');
    }
    res.send(JSON.stringify(users[user].chatHistory));
});

// 保存聊天历史记录
app.post('/history', (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('未经授权');
    }
    const { message } = req.body;
    users[user].chatHistory.push(message);
    res.sendStatus(200);
});

// 获取用户自定义提示词
app.get('/prompt', (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('未经授权');
    }
    res.send(users[user].prompt);
});

// 保存用户自定义提示词
app.post('/prompt', (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('未经授权');
    }
    const { prompt } = req.body;
    users[user].prompt = prompt;
    res.sendStatus(200);
});

// 验证管理员密码并启用管理员权限
app.post('/set-admin', (req, res) => {
    const { password } = req.body;
    if (bcrypt.compareSync(password, ADMIN_PASSWORD)) {
        adminEnabled = true;
        res.send('管理员权限已启用');
    } else {
        res.status(403).send('密码错误');
    }
});

// 中间件检查管理员权限
function checkAdmin(req, res, next) {
    if (adminEnabled) {
        next();
    } else {
        res.status(403).send('禁止访问');
    }
}

// 添加用户（需要管理员权限）
app.post('/admin/add-user', checkAdmin, (req, res) => {
    const { email, password } = req.body;
    if (users[email]) {
        return res.status(400).send('用户已存在');
    }
    users[email] = {
        password: bcrypt.hashSync(password, 10),
        chatHistory: [],
        prompt: ''
    };
    res.send('用户添加成功');
});

// 删除用户（需要管理员权限）
app.post('/admin/delete-user', checkAdmin, (req, res) => {
    const { email } = req.body;
    if (!users[email]) {
        return res.status(400).send('用户不存在');
    }
    delete users[email];
    res.send('用户删除成功');
});

// 列出所有用户（需要管理员权限）
app.get('/admin/list-users', checkAdmin, (req, res) => {
    res.send(Object.keys(users));
});

// 关闭服务器（需要管理员权限）
app.post('/admin/shutdown', checkAdmin, (req, res) => {
    res.send('服务器正在关闭');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});

const server = app.listen(PORT, () => {
    console.log(`服务器正在运行在 http://localhost:${PORT}`);
});












