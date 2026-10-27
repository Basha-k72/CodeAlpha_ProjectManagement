const API_URL = 'https://codealpha-projectmanagement-k7ii.onrender.com/api';
let isLoginMode = true;
let currentProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) showDashboard(user);
});

function toggleAuth() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Login to ProjectHub' : 'Create an Account';
    document.getElementById('auth-btn').innerText = isLoginMode ? 'Login' : 'Register';
    document.getElementById('name').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('toggle-msg').innerText = isLoginMode ? "Don't have an account? Register" : "Already have an account? Login";
}

async function handleAuth() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const body = isLoginMode ? { email, password } : { name, email, password };

    try {
        const res = await fetch(API_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok) {
            if (isLoginMode) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showDashboard(data.user);
            } else {
                alert('Registration successful! Please login.');
                toggleAuth();
            }
        } else { alert(data.msg || 'Error'); }
    } catch (err) { alert('Server error!'); }
}

function showDashboard(user) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('welcome-msg').innerText = `Hi, ${user.name}`;
    fetchProjects();
}

function logout() {
    localStorage.clear();
    location.reload();
}

async function fetchProjects() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(API_URL + '/projects', { headers: { 'Authorization': `Bearer ${token}` } });
        const projects = await res.json();
        const list = document.getElementById('projects-list');
        if (projects.length === 0) {
            list.innerHTML = '<p>No projects yet. Create one!</p>';
            return;
        }
        list.innerHTML = projects.map(p => `
            <div class="project-card" onclick="openBoard('${p._id}', '${p.name}')">
                <h4>${p.name}</h4>
                <p>${p.description || 'No description'}</p>
            </div>
        `).join('');
    } catch (err) { console.log(err); }
}

async function createProject() {
    const name = document.getElementById('project-name').value;
    const description = document.getElementById('project-desc').value;
    const token = localStorage.getItem('token');
    if (!name) return alert('Enter project name');

    try {
        await fetch(API_URL + '/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name, description })
        });
        document.getElementById('project-name').value = '';
        document.getElementById('project-desc').value = '';
        fetchProjects();
    } catch (err) { console.log(err); }
}

// Board & Task Logic
function openBoard(projectId, projectName) {
    currentProjectId = projectId;
    document.getElementById('current-project-name').innerText = projectName;
    document.getElementById('board-section').style.display = 'block';
    document.querySelector('.create-box').style.display = 'none';
    document.getElementById('projects-list').style.display = 'none';
    fetchTasks();
}

function closeBoard() {
    currentProjectId = null;
    document.getElementById('board-section').style.display = 'none';
    document.querySelector('.create-box').style.display = 'block';
    document.getElementById('projects-list').style.display = 'grid';
}

async function fetchTasks() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(API_URL + `/tasks/${currentProjectId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const tasks = await res.json();
        
        const todoList = document.getElementById('todo-tasks');
        const doneList = document.getElementById('done-tasks');
        
        todoList.innerHTML = '';
        doneList.innerHTML = '';

        tasks.forEach(task => {
            const taskHtml = `
                <div class="task-card">
                    <span>${task.title}</span>
                    ${task.status === 'Todo' 
                        ? `<button onclick="updateTaskStatus('${task._id}', 'Done')">Mark Done</button>`
                        : `<button class="undo" onclick="updateTaskStatus('${task._id}', 'Todo')">Undo</button>`
                    }
                </div>
            `;
            if (task.status === 'Todo') todoList.innerHTML += taskHtml;
            else doneList.innerHTML += taskHtml;
        });
    } catch (err) { console.log(err); }
}

async function createTask() {
    const title = document.getElementById('task-title').value;
    const token = localStorage.getItem('token');
    if (!title) return alert('Enter task name');

    try {
        await fetch(API_URL + '/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title, projectId: currentProjectId })
        });
        document.getElementById('task-title').value = '';
        fetchTasks();
    } catch (err) { console.log(err); }
}

async function updateTaskStatus(taskId, newStatus) {
    const token = localStorage.getItem('token');
    try {
        await fetch(API_URL + `/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
        });
        fetchTasks();
    } catch (err) { console.log(err); }
}