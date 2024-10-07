const readline = require('readline');
const fetch = require('node-fetch');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const baseURL = 'http://localhost:4000';

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setAdmin() {
    const password = await askQuestion('请输入管理员密码：');
    const response = await fetch(`${baseURL}/set-admin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password }),
        credentials: 'include' // Ensure cookies are sent
    });

    if (response.ok) {
        console.log('管理员权限已启用');
        return true;
    } else {
        console.log('密码错误');
        return false;
    }
}

async function adminMenu() {
    while (true) {
        console.log('\n管理员菜单');
        console.log('1. 添加用户');
        console.log('2. 删除用户');
        console.log('3. 列出所有用户');
        console.log('4. 关闭服务器');
        console.log('5. 退出');

        const choice = await askQuestion('请选择一个选项：');

        switch (choice) {
            case '1':
                const addUserEmail = await askQuestion('请输入用户邮箱：');
                const addUserPassword = await askQuestion('请输入用户密码：');
                const addUserResponse = await fetch(`${baseURL}/admin/add-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: addUserEmail, password: addUserPassword }),
                    credentials: 'include'
                });
                console.log(await addUserResponse.text());
                break;
            case '2':
                const deleteUserEmail = await askQuestion('请输入要删除的用户邮箱：');
                const deleteUserResponse = await fetch(`${baseURL}/admin/delete-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: deleteUserEmail }),
                    credentials: 'include'
                });
                console.log(await deleteUserResponse.text());
                break;
            case '3':
                const listUsersResponse = await fetch(`${baseURL}/admin/list-users`, {
                    credentials: 'include'
                });
                const users = await listUsersResponse.json();
                console.log('用户列表：');
                users.forEach(user => console.log(user));
                break;
            case '4':
                const shutdownResponse = await fetch(`${baseURL}/admin/shutdown`, {
                    method: 'POST',
                    credentials: 'include'
                });
                console.log(await shutdownResponse.text());
                break;
            case '5':
                rl.close();
                process.exit(0);
            default:
                console.log('无效的选项，请重新选择。');
        }
    }
}

async function main() {
    const isAdminSet = await setAdmin();
    if (isAdminSet) {
        await adminMenu();
    } else {
        rl.close();
    }
}

main();







