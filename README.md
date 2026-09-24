# learning_platform - Online Project Collaboration Platform

An enterprise-grade, full-stack collaborative project and task management system built with **React 18**, **Node.js / Express**, **MongoDB / Mongoose**, **Socket.IO WebSockets**, and **Tailwind CSS**.

---

## 🚀 Key Features

- **Interactive Sprint Kanban Board**: Multi-lane board (`To Do`, `In Progress`, `Review`, `Completed`) with real-time status transitions.
- **Real-Time Direct & Team Chat**: WebSocket instant messaging with online presence, typing indicators, and auto-scroll.
- **Task Management & Sprint Planning**: Priority tags (`Critical`, `High`, `Medium`, `Low`), deadlines, assignees, subtasks, and discussion threads.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `Admin`, `Manager / Project Lead`, `Student / Team Member`, and `Viewer`.
- **Project File Vault**: Central repository for project documentation, specification attachments, and media assets.
- **System Governance Portal**: Administrator overview for user status management, role escalation, and global project audits.
- **Real-Time In-App Notifications**: Toast notifications and notification center for task assignments, mentions, and project updates.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Lucide Icons, Axios, Socket.IO Client, React Router v6 |
| **Backend** | Node.js, Express.js, Socket.IO, Mongoose, JWT (JSON Web Tokens), Multer, Morgan, Cors |
| **Database** | MongoDB Atlas Cloud Database |

---

## 📂 Project Structure

```
.
├── backend/
│   ├── config/             # MongoDB connection & DNS resolution
│   ├── controllers/        # Auth, Projects, Tasks, Comments, Files, Messages, Notifications, Invitations, Dashboard, Admin
│   ├── middleware/         # JWT Auth, Role Authorization, Multer Upload, Error Handling
│   ├── models/             # Mongoose Schemas (User, Project, Task, Comment, File, Message, etc.)
│   ├── routes/             # REST API Endpoint Routers
│   ├── seed.js             # Database Seeding Script
│   └── server.js           # Express + HTTP + Socket.IO Server
│
└── frontend/
    ├── src/
    │   ├── components/     # UI Components (Badges, Modal, Avatar, Navbar, Sidebar, Layout)
    │   ├── context/        # AuthContext, SocketContext, NotificationContext
    │   ├── pages/          # Login, Register, Dashboard, Projects, Tasks, Chat, Files, Invitations, Admin, Profile
    │   ├── services/       # Axios API client with token interceptor
    │   ├── App.jsx         # Client routing with Protected and Admin guards
    │   ├── index.css       # Tailwind directives and custom glassmorphism styles
    │   └── main.jsx        # App root
    ├── vite.config.js      # Vite proxy configuration
    └── tailwind.config.js  # Color palette and typography tokens
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed     # (Optional) Pre-populates database with demo projects and accounts
npm start        # Starts server on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@example.com` | `Password123!` |
| **Project Lead / Manager** | `manager@example.com` | `Password123!` |
| **Student / Member** | `student@example.com` | `Password123!` |

---

## 📦 Production Build

```bash
cd frontend
npm run build    # Compiles production-ready bundle in frontend/dist
```
