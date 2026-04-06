Add Contrubtion information and guidelines in the page.
# CONTRIBUTING.md

## Project: Task Management System (TMS)

> Contribution process and implementation details

## Contribution Workflow

git clone 
git checkout -b feature-name
git commit -m “Your message”
git push origin feature-name


## Authentication Logic

```javascript
const matchedUser = users.find(
  user =>
    user.email.toLowerCase() === email.toLowerCase() &&
    user.password === password &&
    user.role === role
);
```

## Local Storage (Singleton Pattern)

```
const storageManager = new StorageManager();

storageManager.save("tms_users", users);
storageManager.load("tms_users", []);
```

## Factory Pattern (User Creation)

```
const newUser = UserFactory.createUser(name, email, password, role);
```

## Observer Pattern (Notifications)

```
notificationCenter.notify("Task created successfully");
```

## Command Pattern (Undo/Redo)

```
commandManager.execute(command);
commandManager.undo();
commandManager.redo();
```

## Task Creation

```
const newTask = {
  id: generateId("task"),
  title,
  assignedUser,
  priority,
  status,
  deadline
};
```

## Task Update Rendering

```
renderTasks();
updateDashboard();
```

## Dependency Check

```
if (!isDependencyCompleted(task)) {
  alert("Complete dependency first");
  return;
}
```

## Logout UI Handling

```
logoutBtn.style.display = currentUser ? "inline-block" : "none";
```

## Undo Action

```
const success = commandManager.undo();
```

## Redo Action

```
const success = commandManager.redo();
```