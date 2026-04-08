[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/R5_Sso5O)
# DGL 104 - Task Management System (TMS)

## Live Demo 🚀

view the deployed Task Management System here:

 [Open Task Management App](https://jdwivedi913.github.io/Task-management-website-demo-/)

 This live demo showcases the full functionality of the application, including authentication, task management, dashboard, Kanban board, calendar view, notifications, and design pattern implementation.
 
## Introduction

## Tech Stack
- PHP
- HTML
- CSS
- JavaScript
- Etc.

## Unique Features

## Design Patterns

## Installation Guidelines

## Summary of the Project

## Contrubutions

## References


# Task Management System (TMS)

## Project Overview

The **Task Management System (TMS)** is a web-based application developed as part of the DGL 104 course. This system allows users to create, assign, track, and manage tasks efficiently.

The application simulates a real-world task management platform where multiple user roles can collaborate and monitor progress.


## Objectives

- Build a functional task management web application  
- Apply software design patterns  
- Implement CRUD operations  
- Follow modular and scalable coding practices  
- Practice debugging and logging  
- Understand real-world development workflows  


## Features

### 👤 Authentication
- User registration with role selection  
- Login with email, password, and role  
- Logout functionality  
- Session stored using localStorage  

### 👥 User Management
- Create users (Admin/Manager only)  
- View all users in a table  
- Role-based access control  

### 📝 Task Management (CRUD)
- Create tasks with:
  - Title
  - Description
  - Assigned user
  - Priority (High, Medium, Low)
  - Status (To Do, In Progress, Completed)
  - Deadline
  - Task dependency  
- Edit tasks  
- Delete tasks  
- Change task status  

###  Dashboard
- Total tasks count  
- To Do, In Progress, Completed counts  
- Visual overview of task progress  

###  Task List
- Filter by status  
- Filter by priority  
- Search tasks  
- Undo / Redo functionality  

###  Kanban Board
- Tasks organized into:
  - To Do  
  - In Progress  
  - Completed  

###  Calendar View
- Displays tasks based on deadlines  

###  Reports
- Bar chart showing task distribution  

###  Notifications & Activity Log
- Real-time notifications  
- Activity log of all actions  

---

##  Design Patterns Used

### 1. Factory Pattern
Used to create users dynamically based on roles.

Instead of manually creating user objects, a `UserFactory` class is used.

```javascript
UserFactory.createUser(name, email, password, role);
```

Benefit:
	•	Clean and scalable user creation
	•	Easy to add new roles in future

### 2. Observer Pattern

Used for handling notifications.

A NotificationCenter notifies subscribed functions when events occur.

```notificationCenter.notify("Task created");```

Benefit:
	•	Decouples notification logic
	•	Improves modularity


### 3. Singleton Pattern

Used for managing storage operations.

A single instance of StorageManager handles all localStorage operations.

```const storageManager = new StorageManager();```

Benefit:
	•	Ensures one consistent data source
	•	Prevents duplicate instances


### 4. Command Pattern

Used for undo/redo functionality.

Commands like:
	•	AddTaskCommand
	•	DeleteTaskCommand
	•	UpdateTaskStatusCommand

are executed through a CommandManager.

```
commandManager.execute(command);
commandManager.undo();
commandManager.redo();```


Benefit:
	•	Supports undo/redo
	•	Encapsulates operations
	•	Improves maintainability
```


## References (YouTube)

The following YouTube tutorials were used to understand concepts such as task management systems, localStorage, and JavaScript design patterns. The knowledge gained from these videos was adapted and implemented in this project.

- Task Manager App with LocalStorage  
  https://youtu.be/yfpeGwkVeHI  

- JavaScript Design Patterns Tutorial  
  https://youtu.be/kslfZCbr_Fg  

- To-Do List App using JavaScript  
  https://youtu.be/G0jO8kUrg-I  

- Simple Task Management App (HTML, CSS, JS)  
  https://youtu.be/txSwC82v6UM  

- Build Task Manager App from Scratch (CRUD)  
  https://youtu.be/mbLpQmPGKts  

- Full Stack Task Management App (Advanced Reference)  
  https://youtu.be/50NN3d-Ne1U  


> These videos were used for learning purposes. The final implementation was customized, extended, and integrated with additional features such as design patterns (Factory, Observer, Singleton, Command), task dependencies, undo/redo functionality, and UI improvements.
