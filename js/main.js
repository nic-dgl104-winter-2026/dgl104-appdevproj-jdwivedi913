// Task Management System

// ---------- Storage Keys ----------
const USERS_KEY = "tms_users";
const TASKS_KEY = "tms_tasks";
const CURRENT_USER_KEY = "tms_current_user";

// ---------- Singleton Pattern ----------
class StorageManager {
    constructor() {
        if (StorageManager.instance) {
            return StorageManager.instance;
        }
        StorageManager.instance = this;
    }

    load(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error(`Failed to load ${key}:`, error);
            return fallback;
        }
    }

    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    remove(key) {
        localStorage.removeItem(key);
    }
}

const storageManager = new StorageManager();

// ---------- Factory Pattern ----------
class AdminUser {
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = "admin";
    }
}

class ManagerUser {
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = "manager";
    }
}

class DeveloperUser {
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = "developer";
    }
}

class TesterUser {
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = "tester";
    }
}

class UserFactory {
    static createUser(name, email, password, role) {
        const id = generateId("user");

        switch (role) {
            case "admin":
                return new AdminUser(id, name, email, password);
            case "manager":
                return new ManagerUser(id, name, email, password);
            case "developer":
                return new DeveloperUser(id, name, email, password);
            case "tester":
                return new TesterUser(id, name, email, password);
            default:
                throw new Error("Invalid user role");
        }
    }
}

// ---------- Observer Pattern ----------
class NotificationCenter {
    constructor() {
        this.observers = [];
    }

    subscribe(observerFn) {
        this.observers.push(observerFn);
    }

    notify(message) {
        this.observers.forEach((observer) => observer(message));
    }
}

const notificationCenter = new NotificationCenter();

// ---------- Command Pattern ----------
class AddTaskCommand {
    constructor(taskList, task) {
        this.taskList = taskList;
        this.task = task;
    }

    execute() {
        this.taskList.push(this.task);
    }

    undo() {
        const index = this.taskList.findIndex((item) => item.id === this.task.id);
        if (index !== -1) {
            this.taskList.splice(index, 1);
        }
    }
}

class DeleteTaskCommand {
    constructor(taskList, taskId) {
        this.taskList = taskList;
        this.taskId = taskId;
        this.removedTask = null;
        this.dependencyUpdates = [];
    }

    execute() {
        const index = this.taskList.findIndex((item) => item.id === this.taskId);
        if (index !== -1) {
            this.removedTask = JSON.parse(JSON.stringify(this.taskList[index]));
            this.taskList.splice(index, 1);

            this.taskList.forEach((item) => {
                if (item.dependencyId === this.taskId) {
                    this.dependencyUpdates.push({
                        taskId: item.id,
                        oldDependencyId: item.dependencyId
                    });
                    item.dependencyId = "";
                }
            });
        }
    }

    undo() {
        if (this.removedTask) {
            this.taskList.push(this.removedTask);
        }

        this.dependencyUpdates.forEach((update) => {
            const task = this.taskList.find((item) => item.id === update.taskId);
            if (task) {
                task.dependencyId = update.oldDependencyId;
            }
        });
    }
}

class UpdateTaskStatusCommand {
    constructor(task, newStatus) {
        this.task = task;
        this.oldStatus = task.status;
        this.newStatus = newStatus;
    }

    execute() {
        this.task.status = this.newStatus;
    }

    undo() {
        this.task.status = this.oldStatus;
    }
}

class CommandManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    execute(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
    }

    undo() {
        const command = this.undoStack.pop();
        if (!command) return false;
        command.undo();
        this.redoStack.push(command);
        return true;
    }

    redo() {
        const command = this.redoStack.pop();
        if (!command) return false;
        command.execute();
        this.undoStack.push(command);
        return true;
    }
}

const commandManager = new CommandManager();

// ---------- DOM ----------
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const userForm = document.getElementById("userForm");
const taskForm = document.getElementById("taskForm");

const userTableBody = document.getElementById("userTableBody");
const taskTableBody = document.getElementById("taskTableBody");

const assignedUserSelect = document.getElementById("assignedUser");
const taskDependencySelect = document.getElementById("taskDependency");

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
const calendarContainer = document.getElementById("calendarContainer");

const siteSubtitle = document.querySelector(".site-subtitle");
const accountInfo = document.getElementById("accountInfo");
const logoutBtn = document.getElementById("logoutBtn");

const authMessage = document.getElementById("authMessage");
const userMessage = document.getElementById("userMessage");
const taskFormMessage = document.getElementById("taskFormMessage");

const editTaskIdInput = document.getElementById("editTaskId");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");

const filterStatus = document.getElementById("filterStatus");
const filterPriority = document.getElementById("filterPriority");
const searchTask = document.getElementById("searchTask");

const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");

// ---------- App State ----------
let users = storageManager.load(USERS_KEY, []);
let tasks = storageManager.load(TASKS_KEY, []);
let currentUser = storageManager.load(CURRENT_USER_KEY, null);

// ---------- Helpers ----------
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

function saveUsers() {
    storageManager.save(USERS_KEY, users);
}

function saveTasks() {
    storageManager.save(TASKS_KEY, tasks);
}

function canSeeAllTasks(user) {
    if (!user) return false;
    return user.role === "admin" || user.role === "manager";
}

function canManageUsers(user) {
    if (!user) return false;
    return user.role === "admin" || user.role === "manager";
}

function canModifyTask(task) {
    if (!currentUser) return false;
    if (canSeeAllTasks(currentUser)) return true;
    return task.assignedUser === currentUser.name || task.createdBy === currentUser.name;
}

function findUserByEmail(email) {
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function getTaskById(taskId) {
    return tasks.find((task) => task.id === taskId);
}

function getDependencyTitle(taskId) {
    if (!taskId) return "None";
    const task = getTaskById(taskId);
    return task ? task.title : "None";
}

function isDependencyCompleted(task) {
    if (!task.dependencyId) return true;
    const dependencyTask = getTaskById(task.dependencyId);
    if (!dependencyTask) return true;
    return dependencyTask.status === "completed";
}

function showInlineMessage(element, message) {
    if (!element) {
        alert(message);
        return;
    }

    element.textContent = message;
    element.classList.add("show");

    setTimeout(() => {
        element.textContent = "";
        element.classList.remove("show");
    }, 3000);
}

function showMessage(message) {
    alert(message);
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

notificationCenter.subscribe((message) => addNotification(message));

function getVisibleTasks() {
    if (!currentUser) return [];

    if (canSeeAllTasks(currentUser)) {
        return [...tasks];
    }

    return tasks.filter((task) => task.assignedUser === currentUser.name);
}

function getFilteredTasks() {
    let visibleTasks = getVisibleTasks();

    const statusValue = filterStatus ? filterStatus.value : "";
    const priorityValue = filterPriority ? filterPriority.value : "";
    const searchValue = searchTask ? searchTask.value.trim().toLowerCase() : "";

    if (statusValue) {
        visibleTasks = visibleTasks.filter((task) => task.status === statusValue);
    }

    if (priorityValue) {
        visibleTasks = visibleTasks.filter((task) => task.priority === priorityValue);
    }

    if (searchValue) {
        visibleTasks = visibleTasks.filter((task) =>
            task.title.toLowerCase().includes(searchValue) ||
            (task.description || "").toLowerCase().includes(searchValue)
        );
    }

    return visibleTasks;
}

function resetTaskForm() {
    if (!taskForm) return;

    taskForm.reset();

    if (editTaskIdInput) {
        editTaskIdInput.value = "";
    }

    if (saveTaskBtn) {
        saveTaskBtn.textContent = "Save Task";
    }

    if (taskDependencySelect) {
        taskDependencySelect.value = "";
    }
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
    if (assignedUserSelect) {
        assignedUserSelect.innerHTML = `<option value="">Select User</option>`;

        users.forEach((user) => {
            const option = document.createElement("option");
            option.value = user.name;
            option.textContent = `${user.name} (${capitalize(user.role)})`;
            assignedUserSelect.appendChild(option);
        });
    }

    if (taskDependencySelect) {
        const currentValue = taskDependencySelect.value;
        taskDependencySelect.innerHTML = `<option value="">No Dependency</option>`;

        tasks.forEach((task) => {
            const option = document.createElement("option");
            option.value = task.id;
            option.textContent = task.title;
            taskDependencySelect.appendChild(option);
        });

        if (currentValue) {
            taskDependencySelect.value = currentValue;
        }
    }
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
    renderCalendar();
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

function renderCalendar() {
    if (!calendarContainer) return;

    const visibleTasks = getVisibleTasks();
    const tasksWithDeadlines = visibleTasks
        .filter((task) => task.deadline)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (tasksWithDeadlines.length === 0) {
        calendarContainer.innerHTML = `<p>No tasks with deadlines to display.</p>`;
        return;
    }

    calendarContainer.innerHTML = tasksWithDeadlines.map((task) => `
        <div style="background:#fff; border:1px solid #dce9f6; border-radius:10px; padding:12px; margin-bottom:10px;">
            <strong>${task.deadline}</strong><br>
            ${task.title} - ${task.assignedUser}
        </div>
    `).join("");
}

// ---------- Task Rendering ----------
function renderTasks() {
    if (!taskTableBody || !todoColumn || !inProgressColumn || !completedColumn) return;

    const visibleTasks = getFilteredTasks();

    taskTableBody.innerHTML = "";
    todoColumn.innerHTML = "";
    inProgressColumn.innerHTML = "";
    completedColumn.innerHTML = "";

    if (!currentUser) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="9">Please log in to view tasks.</td>`;
        taskTableBody.appendChild(row);
        return;
    }

    if (visibleTasks.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="9">No tasks available.</td>`;
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
    const dependencyTitle = getDependencyTitle(task.dependencyId);
    const canEdit = canModifyTask(task);

    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${task.title}</td>
        <td>${task.description || "-"}</td>
        <td>${task.assignedUser}</td>
        <td>${formatStatus(task.status)}</td>
        <td>${capitalize(task.priority)}</td>
        <td>${task.deadline || "-"}</td>
        <td>${dependencyTitle}</td>
        <td>
            ${canEdit ? `<button type="button" onclick="editTask('${task.id}')">Edit</button>` : ""}
            ${canEdit ? `<button type="button" onclick="changeTaskStatus('${task.id}')">Status</button>` : ""}
            ${canEdit ? `<button type="button" onclick="deleteTask('${task.id}')">Delete</button>` : ""}
        </td>
    `;

    taskTableBody.appendChild(row);
}

function renderKanbanCard(task) {
    const card = document.createElement("div");
    card.className = "task-card";

    const dependencyText = getDependencyTitle(task.dependencyId);
    const canEdit = canModifyTask(task);
    const blockedText = !isDependencyCompleted(task) ? `<p><strong>Blocked By:</strong> ${dependencyText}</p>` : "";

    card.innerHTML = `
        <h4>${task.title}</h4>
        <p><strong>User:</strong> ${task.assignedUser}</p>
        <p><strong>Priority:</strong> ${capitalize(task.priority)}</p>
        <p><strong>Deadline:</strong> ${task.deadline || "Not set"}</p>
        <p><strong>Created By:</strong> ${task.createdBy}</p>
        <p><strong>Dependency:</strong> ${dependencyText}</p>
        ${blockedText}
        <div>
            ${canEdit ? `<button type="button" onclick="editTask('${task.id}')">Edit</button>` : ""}
            ${canEdit ? `<button type="button" onclick="changeTaskStatus('${task.id}')">Change Status</button>` : ""}
            ${canEdit ? `<button type="button" onclick="deleteTask('${task.id}')">Delete</button>` : ""}
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
            showInlineMessage(authMessage, "Please fill all registration fields.");
            return;
        }

        if (findUserByEmail(email)) {
            showInlineMessage(authMessage, "A user with this email already exists.");
            return;
        }

        try {
            const newUser = UserFactory.createUser(name, email, password, role);
            users.push(newUser);
            saveUsers();

            renderUsers();
            updateAssignedUserDropdown();

            notificationCenter.notify(`${name} registered as ${role}.`);
            addActivity(`New user registered: ${name} (${role})`);

            registerForm.reset();
            showInlineMessage(authMessage, "Registration successful. You can now log in.");
        } catch (error) {
            console.error(error);
            showInlineMessage(authMessage, "Could not register user.");
        }
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();
        const role = document.getElementById("loginRole").value;

        if (!email || !password || !role) {
            showInlineMessage(authMessage, "Please enter email, password, and role.");
            return;
        }

        const matchedUser = users.find(
            (user) =>
                user.email.toLowerCase() === email.toLowerCase() &&
                user.password === password &&
                user.role === role
        );

        if (!matchedUser) {
            showInlineMessage(authMessage, "Invalid login details or role mismatch.");
            return;
        }

        currentUser = matchedUser;
        storageManager.save(CURRENT_USER_KEY, currentUser);

        updateHeaderState();
        renderTasks();
        updateDashboard();

        notificationCenter.notify(`${currentUser.name} logged in as ${currentUser.role}.`);
        addActivity(`User logged in: ${currentUser.name} (${currentUser.role})`);

        loginForm.reset();
        showInlineMessage(authMessage, `Welcome ${currentUser.name}.`);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        if (!currentUser) return;

        notificationCenter.notify(`${currentUser.name} logged out.`);
        addActivity(`User logged out: ${currentUser.name} (${currentUser.role})`);

        currentUser = null;
        storageManager.remove(CURRENT_USER_KEY);

        updateHeaderState();
        renderTasks();
        updateDashboard();
    });
}

// ---------- User Management ----------
if (userForm) {
    userForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!canManageUsers(currentUser)) {
            showInlineMessage(userMessage, "Only Admin or Manager can create users.");
            return;
        }

        const name = document.getElementById("userName").value.trim();
        const email = document.getElementById("userEmail").value.trim();
        const role = document.getElementById("userRole").value;

        if (!name || !email || !role) {
            showInlineMessage(userMessage, "Please fill all user fields.");
            return;
        }

        if (findUserByEmail(email)) {
            showInlineMessage(userMessage, "This email already exists.");
            return;
        }

        try {
            const newUser = UserFactory.createUser(name, email, "password123", role);
            users.push(newUser);
            saveUsers();

            renderUsers();
            updateAssignedUserDropdown();

            notificationCenter.notify(`${name} was added to the system.`);
            addActivity(`User added from user management: ${name} (${role})`);

            userForm.reset();
            showInlineMessage(userMessage, `${name} added successfully. Temporary password: password123`);
        } catch (error) {
            console.error(error);
            showInlineMessage(userMessage, "Could not create user.");
        }
    });
}

// ---------- Task Creation / Update ----------
if (taskForm) {
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!currentUser) {
            showInlineMessage(taskFormMessage, "Please log in first.");
            return;
        }

        const editTaskId = editTaskIdInput ? editTaskIdInput.value : "";
        const title = document.getElementById("taskTitle").value.trim();
        const description = document.getElementById("taskDescription").value.trim();
        const assignedUser = document.getElementById("assignedUser").value;
        const priority = document.getElementById("taskPriority").value;
        const status = document.getElementById("taskStatus").value;
        const deadline = document.getElementById("taskDeadline").value;
        const dependencyId = taskDependencySelect ? taskDependencySelect.value : "";

        if (!title || !assignedUser || !priority || !status || !deadline) {
            showInlineMessage(taskFormMessage, "Please fill all required task fields.");
            return;
        }

        if (editTaskId && dependencyId === editTaskId) {
            showInlineMessage(taskFormMessage, "A task cannot depend on itself.");
            return;
        }

        if (editTaskId) {
            const task = getTaskById(editTaskId);

            if (!task) {
                showInlineMessage(taskFormMessage, "Task not found.");
                return;
            }

            if (!canModifyTask(task)) {
                showInlineMessage(taskFormMessage, "You cannot edit this task.");
                return;
            }

            task.title = title;
            task.description = description;
            task.assignedUser = assignedUser;
            task.priority = priority;
            task.status = status;
            task.deadline = deadline;
            task.dependencyId = dependencyId;

            saveTasks();
            renderTasks();
            updateDashboard();
            updateAssignedUserDropdown();

            notificationCenter.notify(`Task "${title}" updated.`);
            addActivity(`${currentUser.name} updated task "${title}".`);

            resetTaskForm();
            showInlineMessage(taskFormMessage, "Task updated successfully.");
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
            dependencyId,
            createdBy: currentUser.name,
            createdByRole: currentUser.role,
            createdAt: new Date().toLocaleString()
        };

        const addTaskCommand = new AddTaskCommand(tasks, newTask);
        commandManager.execute(addTaskCommand);

        saveTasks();
        renderTasks();
        updateDashboard();
        updateAssignedUserDropdown();

        notificationCenter.notify(`Task "${title}" assigned to ${assignedUser}.`);
        addActivity(`${currentUser.name} assigned task "${title}" to ${assignedUser}.`);

        resetTaskForm();
        showInlineMessage(taskFormMessage, "Task saved successfully.");
    });
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", function () {
        resetTaskForm();
        showInlineMessage(taskFormMessage, "Edit cancelled.");
    });
}

// ---------- Task Actions ----------
function editTask(taskId) {
    const task = getTaskById(taskId);

    if (!task) {
        showMessage("Task not found.");
        return;
    }

    if (!canModifyTask(task)) {
        showMessage("You cannot edit this task.");
        return;
    }

    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDescription").value = task.description || "";
    document.getElementById("assignedUser").value = task.assignedUser;
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("taskStatus").value = task.status;
    document.getElementById("taskDeadline").value = task.deadline || "";

    if (taskDependencySelect) {
        taskDependencySelect.value = task.dependencyId || "";
    }

    if (editTaskIdInput) {
        editTaskIdInput.value = task.id;
    }

    if (saveTaskBtn) {
        saveTaskBtn.textContent = "Update Task";
    }

    const formSection = document.getElementById("task-form-section");
    if (formSection) {
        formSection.scrollIntoView({ behavior: "smooth" });
    }
}

function changeTaskStatus(taskId) {
    if (!currentUser) {
        showMessage("Please log in first.");
        return;
    }

    const task = getTaskById(taskId);
    if (!task) return;

    if (!canModifyTask(task)) {
        showMessage("You cannot change this task.");
        return;
    }

    if (!isDependencyCompleted(task) && task.status === "todo") {
        showMessage("Complete the dependent task first.");
        return;
    }

    let nextStatus = "todo";

    if (task.status === "todo") {
        nextStatus = "in-progress";
    } else if (task.status === "in-progress") {
        nextStatus = "completed";
    } else {
        nextStatus = "todo";
    }

    const statusCommand = new UpdateTaskStatusCommand(task, nextStatus);
    commandManager.execute(statusCommand);

    saveTasks();
    renderTasks();
    updateDashboard();

    notificationCenter.notify(`Task "${task.title}" moved to ${formatStatus(task.status)}.`);
    addActivity(`${currentUser.name} changed task "${task.title}" to ${formatStatus(task.status)}.`);
}

function deleteTask(taskId) {
    if (!currentUser) {
        showMessage("Please log in first.");
        return;
    }

    const task = getTaskById(taskId);
    if (!task) return;

    if (!canModifyTask(task)) {
        showMessage("You cannot delete this task.");
        return;
    }

    const confirmed = confirm(`Delete task "${task.title}"?`);
    if (!confirmed) return;

    const deleteCommand = new DeleteTaskCommand(tasks, taskId);
    commandManager.execute(deleteCommand);

    saveTasks();
    renderTasks();
    updateDashboard();
    updateAssignedUserDropdown();

    notificationCenter.notify(`Task "${task.title}" deleted.`);
    addActivity(`${currentUser.name} deleted task "${task.title}".`);
}

// ---------- Undo / Redo ----------
if (undoBtn) {
    undoBtn.addEventListener("click", function () {
        const success = commandManager.undo();

        if (!success) {
            showMessage("Nothing to undo.");
            return;
        }

        saveTasks();
        renderTasks();
        updateDashboard();
        updateAssignedUserDropdown();

        notificationCenter.notify("Undo performed.");
        addActivity("Undo performed.");
    });
}

if (redoBtn) {
    redoBtn.addEventListener("click", function () {
        const success = commandManager.redo();

        if (!success) {
            showMessage("Nothing to redo.");
            return;
        }

        saveTasks();
        renderTasks();
        updateDashboard();
        updateAssignedUserDropdown();

        notificationCenter.notify("Redo performed.");
        addActivity("Redo performed.");
    });
}

// ---------- Filters ----------
if (filterStatus) {
    filterStatus.addEventListener("change", renderTasks);
}

if (filterPriority) {
    filterPriority.addEventListener("change", renderTasks);
}

if (searchTask) {
    searchTask.addEventListener("input", renderTasks);
}

// ---------- Init ----------
function init() {
    renderUsers();
    updateAssignedUserDropdown();
    updateHeaderState();
    renderTasks();
    updateDashboard();

    if (currentUser) {
        notificationCenter.notify(`${currentUser.name} is logged in.`);
    }
}

init();

// ---------- Global for inline buttons ----------
window.changeTaskStatus = changeTaskStatus;
window.deleteTask = deleteTask;
window.editTask = editTask;