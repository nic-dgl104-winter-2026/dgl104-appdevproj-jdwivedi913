
// Task Management System - 

// ---------- Storage Keys ----------
const USERS_KEY = "tms_users";
const TASKS_KEY = "tms_tasks";
const CURRENT_USER_KEY = "tms_current_user";

// ---------- DOM ----------
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const userForm = document.getElementById("userForm");
const taskForm = document.getElementById("taskForm");

const userTableBody = document.getElementById("userTableBody");
const taskTableBody = document.getElementById("taskTableBody");

const assignedUserSelect = document.getElementById("assignedUser");

const totalTasksEl = document.getElementById("totalTasks");
const todoCountEl = document.getElementById("todoCount");
const inProgressCountEl = document.getElementById("inProgressCount");
const completedCountEl = document.getElementById("completedCount");

const todoColumn = document.getElementById("todoColumn");
const inProgressColumn = document.getElementById("inProgressColumn");
const completedColumn = document.getElementById("completedColumn");

const notificationList = document.getElementById("notificationList");
const activityLogList = document.getElementById("activityLogList");

const chartCanvas = document.getElementById("taskProgressChart");

// Optional UI elements if you add them
const siteSubtitle = document.querySelector(".site-subtitle");
const accountInfo = document.getElementById("accountInfo");
const logoutBtn = document.getElementById("logoutBtn");

// ---------- App State ----------
let users = loadFromStorage(USERS_KEY, []);
let tasks = loadFromStorage(TASKS_KEY, []);
let currentUser = loadFromStorage(CURRENT_USER_KEY, null);

// ---------- Helpers ----------
function loadFromStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error(`Failed to load ${key}:`, error);
        return fallback;
    }
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatStatus(status) {
    if (status === "todo") return "To Do";
    if (status === "in-progress") return "In Progress";
    if (status === "completed") return "Completed";
    return status;
}

function canSeeAllTasks(user) {
    if (!user) return false;
    return user.role === "admin" || user.role === "manager";
}

function getVisibleTasks() {
    if (!currentUser) return [];
    if (canSeeAllTasks(currentUser)) return tasks;
    return tasks.filter((task) => task.assignedUser === currentUser.name);
}

function addNotification(message) {
    if (!notificationList) return;
    const li = document.createElement("li");
    li.textContent = message;
    notificationList.prepend(li);
}

function addActivity(message) {
    if (!activityLogList) return;
    const li = document.createElement("li");
    li.textContent = `${new Date().toLocaleString()} - ${message}`;
    activityLogList.prepend(li);
}

function showMessage(message) {
    alert(message);
}

function findUserByEmail(email) {
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

// ---------- UI State ----------
function updateHeaderState() {
    if (siteSubtitle) {
        if (currentUser) {
            siteSubtitle.textContent = `Logged in as ${currentUser.name} (${capitalize(currentUser.role)})`;
        } else {
            siteSubtitle.textContent = "Organize tasks, users, and progress";
        }
    }

    if (accountInfo) {
        if (currentUser) {
            accountInfo.innerHTML = `
                <strong>${currentUser.name}</strong><br>
                ${currentUser.email}<br>
                ${capitalize(currentUser.role)}
            `;
        } else {
            accountInfo.textContent = "No user is logged in.";
        }
    }

    if (logoutBtn) {
        logoutBtn.style.display = currentUser ? "inline-block" : "none";
    }
}

// ---------- User Rendering ----------
function renderUsers() {
    if (!userTableBody) return;

    userTableBody.innerHTML = "";

    if (users.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="4">No users registered yet.</td>`;
        userTableBody.appendChild(row);
        return;
    }

    users.forEach((user, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${capitalize(user.role)}</td>
        `;

        userTableBody.appendChild(row);
    });
}

function updateAssignedUserDropdown() {
    if (!assignedUserSelect) return;

    assignedUserSelect.innerHTML = `<option value="">Select User</option>`;

    users.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.name;
        option.textContent = `${user.name} (${capitalize(user.role)})`;
        assignedUserSelect.appendChild(option);
    });
}

// ---------- Dashboard ----------
function updateDashboard() {
    const visibleTasks = getVisibleTasks();

    const total = visibleTasks.length;
    const todo = visibleTasks.filter((task) => task.status === "todo").length;
    const inProgress = visibleTasks.filter((task) => task.status === "in-progress").length;
    const completed = visibleTasks.filter((task) => task.status === "completed").length;

    if (totalTasksEl) totalTasksEl.textContent = total;
    if (todoCountEl) todoCountEl.textContent = todo;
    if (inProgressCountEl) inProgressCountEl.textContent = inProgress;
    if (completedCountEl) completedCountEl.textContent = completed;

    renderSimpleChart(todo, inProgress, completed);
}

function renderSimpleChart(todo, inProgress, completed) {
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext("2d");
    if (!ctx) return;

    const width = chartCanvas.width = chartCanvas.clientWidth || 600;
    const height = chartCanvas.height = 240;

    ctx.clearRect(0, 0, width, height);

    const values = [todo, inProgress, completed];
    const labels = ["To Do", "In Progress", "Completed"];
    const colors = ["#93c5fd", "#60a5fa", "#2563eb"];

    const max = Math.max(...values, 1);
    const barWidth = 100;
    const gap = 50;
    const startX = 60;
    const baseY = 190;

    ctx.font = "14px Arial";
    ctx.fillStyle = "#334155";

    values.forEach((value, index) => {
        const barHeight = (value / max) * 120;
        const x = startX + index * (barWidth + gap);
        const y = baseY - barHeight;

        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = "#334155";
        ctx.fillText(labels[index], x + 10, 215);
        ctx.fillText(String(value), x + 40, y - 10);
    });
}

// ---------- Task Rendering ----------
function renderTasks() {
    if (!taskTableBody || !todoColumn || !inProgressColumn || !completedColumn) return;

    const visibleTasks = getVisibleTasks();

    taskTableBody.innerHTML = "";
    todoColumn.innerHTML = "";
    inProgressColumn.innerHTML = "";
    completedColumn.innerHTML = "";

    if (!currentUser) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5">Please log in to view tasks.</td>`;
        taskTableBody.appendChild(row);
        return;
    }

    if (visibleTasks.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5">No tasks available.</td>`;
        taskTableBody.appendChild(row);
        return;
    }

    visibleTasks.forEach((task, index) => {
        renderTaskRow(task, index);
        renderKanbanCard(task);
    });
}

function renderTaskRow(task, index) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${task.title}</td>
        <td>${task.assignedUser}</td>
        <td>${formatStatus(task.status)}</td>
        <td>${capitalize(task.priority)}</td>
    `;

    taskTableBody.appendChild(row);
}

function renderKanbanCard(task) {
    const card = document.createElement("div");
    card.className = "task-card";
    card.style.backgroundColor = "#ffffff";
    card.style.border = "1px solid #d8e6f2";
    card.style.borderRadius = "10px";
    card.style.padding = "12px";
    card.style.marginBottom = "10px";

    card.innerHTML = `
        <h4 style="margin-bottom: 6px; color: #264766;">${task.title}</h4>
        <p style="margin-bottom: 4px;"><strong>User:</strong> ${task.assignedUser}</p>
        <p style="margin-bottom: 4px;"><strong>Priority:</strong> ${capitalize(task.priority)}</p>
        <p style="margin-bottom: 4px;"><strong>Deadline:</strong> ${task.deadline || "Not set"}</p>
        <p style="margin-bottom: 10px;"><strong>Created By:</strong> ${task.createdBy}</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" onclick="changeTaskStatus('${task.id}')">Change Status</button>
            <button type="button" onclick="deleteTask('${task.id}')">Delete</button>
        </div>
    `;

    if (task.status === "todo") {
        todoColumn.appendChild(card);
    } else if (task.status === "in-progress") {
        inProgressColumn.appendChild(card);
    } else {
        completedColumn.appendChild(card);
    }
}

// ---------- Auth ----------
if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value.trim();
        const role = document.getElementById("registerRole").value;

        if (!name || !email || !password || !role) {
            showMessage("Please fill all registration fields.");
            return;
        }

        if (findUserByEmail(email)) {
            showMessage("A user with this email already exists.");
            return;
        }

        const newUser = {
            id: generateId("user"),
            name,
            email,
            password,
            role
        };

        users.push(newUser);
        saveToStorage(USERS_KEY, users);

        renderUsers();
        updateAssignedUserDropdown();

        addNotification(`${name} registered as ${role}.`);
        addActivity(`New user registered: ${name} (${role})`);

        registerForm.reset();
        showMessage("Registration successful. You can now log in.");
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();
        const role = document.getElementById("loginRole").value;

        if (!email || !password || !role) {
            showMessage("Please enter email, password, and role.");
            return;
        }

        const matchedUser = users.find(
            (user) =>
                user.email.toLowerCase() === email.toLowerCase() &&
                user.password === password &&
                user.role === role
        );

        if (!matchedUser) {
            showMessage("Invalid login details or role mismatch.");
            return;
        }

        currentUser = matchedUser;
        saveToStorage(CURRENT_USER_KEY, currentUser);

        updateHeaderState();
        renderTasks();
        updateDashboard();

        addNotification(`${currentUser.name} logged in as ${currentUser.role}.`);
        addActivity(`User logged in: ${currentUser.name} (${currentUser.role})`);

        loginForm.reset();
        showMessage(`Welcome ${currentUser.name}.`);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        if (!currentUser) return;

        addNotification(`${currentUser.name} logged out.`);
        addActivity(`User logged out: ${currentUser.name} (${currentUser.role})`);

        currentUser = null;
        localStorage.removeItem(CURRENT_USER_KEY);

        updateHeaderState();
        renderTasks();
        updateDashboard();
    });
}

// ---------- User Management ----------
if (userForm) {
    userForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("userName").value.trim();
        const email = document.getElementById("userEmail").value.trim();
        const role = document.getElementById("userRole").value;

        if (!name || !email || !role) {
            showMessage("Please fill all user fields.");
            return;
        }

        if (findUserByEmail(email)) {
            showMessage("This email already exists.");
            return;
        }

        const newUser = {
            id: generateId("user"),
            name,
            email,
            password: "password123",
            role
        };

        users.push(newUser);
        saveToStorage(USERS_KEY, users);

        renderUsers();
        updateAssignedUserDropdown();

        addNotification(`${name} was added to the system.`);
        addActivity(`User added from user management: ${name} (${role})`);

        userForm.reset();
        showMessage(`${name} added successfully. Temporary password: password123`);
    });
}

// ---------- Task Creation ----------
if (taskForm) {
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!currentUser) {
            showMessage("Please log in first.");
            return;
        }

        const title = document.getElementById("taskTitle").value.trim();
        const description = document.getElementById("taskDescription").value.trim();
        const assignedUser = document.getElementById("assignedUser").value;
        const priority = document.getElementById("taskPriority").value;
        const status = document.getElementById("taskStatus").value;
        const deadline = document.getElementById("taskDeadline").value;

        if (!title || !assignedUser || !priority || !status || !deadline) {
            showMessage("Please fill all required task fields.");
            return;
        }

        const newTask = {
            id: generateId("task"),
            title,
            description,
            assignedUser,
            priority,
            status,
            deadline,
            createdBy: currentUser.name,
            createdByRole: currentUser.role,
            createdAt: new Date().toLocaleString()
        };

        tasks.push(newTask);
        saveToStorage(TASKS_KEY, tasks);

        renderTasks();
        updateDashboard();

        addNotification(`Task "${title}" assigned to ${assignedUser}.`);
        addActivity(`${currentUser.name} assigned task "${title}" to ${assignedUser}.`);

        taskForm.reset();
    });
}

// ---------- Task Actions ----------
function changeTaskStatus(taskId) {
    if (!currentUser) {
        showMessage("Please log in first.");
        return;
    }

    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    if (task.status === "todo") {
        task.status = "in-progress";
    } else if (task.status === "in-progress") {
        task.status = "completed";
    } else {
        task.status = "todo";
    }

    saveToStorage(TASKS_KEY, tasks);

    renderTasks();
    updateDashboard();

    addNotification(`Task "${task.title}" moved to ${formatStatus(task.status)}.`);
    addActivity(`${currentUser.name} changed task "${task.title}" to ${formatStatus(task.status)}.`);
}

function deleteTask(taskId) {
    if (!currentUser) {
        showMessage("Please log in first.");
        return;
    }

    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const confirmed = confirm(`Delete task "${task.title}"?`);
    if (!confirmed) return;

    tasks = tasks.filter((item) => item.id !== taskId);
    saveToStorage(TASKS_KEY, tasks);

    renderTasks();
    updateDashboard();

    addNotification(`Task "${task.title}" deleted.`);
    addActivity(`${currentUser.name} deleted task "${task.title}".`);
}

// ---------- Init ----------
function init() {
    renderUsers();
    updateAssignedUserDropdown();
    updateHeaderState();
    renderTasks();
    updateDashboard();

    if (currentUser) {
        addNotification(`${currentUser.name} is logged in.`);
    }
}

init();

// ---------- Global for inline buttons ----------
window.changeTaskStatus = changeTaskStatus;
window.deleteTask = deleteTask;