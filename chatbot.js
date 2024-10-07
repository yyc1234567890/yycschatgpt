document.getElementById('login-form').addEventListener('submit', login);
document.getElementById('register-form').addEventListener('submit', register);
document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

let messages = [];

// 用户登录
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('chat-container').style.display = 'flex';
            loadHistory();
        } else {
            alert('Login failed');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

// 用户注册
async function register(event) {
    event.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            alert('注册成功！请重新登录！');
        } else {
            alert('注册失败');
        }
    } catch (error) {
        console.error('Error during registration:', error);
    }
}

// 加载聊天历史记录
async function loadHistory() {
    try {
        const response = await fetch('/history');
        const history = await response.text();
        if (history) {
            const lines = JSON.parse(history);
            lines.forEach(line => {
                if (line) {
                    displayMessage(line.content, line.role === 'user' ? 'user-message' : 'bot-message');
                    messages.push(line);
                }
            });
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// 保存消息到历史记录
async function saveMessage(message) {
    try {
        await fetch('/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

async function sendMessage() {
    const inputBox = document.getElementById('user-input');
    const message = inputBox.value.trim();
    if (!message) return;

    displayMessage(message, 'user-message');
    inputBox.value = '';

    messages.push({ role: "user", content: message });
    await saveMessage({ role: "user", content: message });

    try {
        const response = await fetch('https://api.chatanywhere.tech/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-QQHSBncscYTIXugAJjcvEbeyLOiK3bvsvZP37gTOptOc8MNG'
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messages,
                max_tokens: 2000 // 根据实际需要调整
            })
        });

        const data = await response.json();
        console.log('API Response:', data); // 添加调试信息

        const botMessage = data.choices[0]?.message?.content?.trim();
        if (botMessage) {
            displayMessage(botMessage, 'bot-message');
            messages.push({ role: "assistant", content: botMessage });
            await saveMessage({ role: "assistant", content: botMessage });
        } else {
            console.error('No content in API response');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function displayMessage(message, className) {
    const chatbox = document.getElementById('chatbox');
    if (!chatbox) {
        console.error('Chatbox element not found');
        return;
    }

    const messageElement = document.createElement('div');
    messageElement.className = className;
    messageElement.innerText = message;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}