# Community Learning and Doubt-Solving Platform
*(Online Project Collaboration Platform)*

A production-ready full-stack platform built with **React 18**, **Vite 6**, **Node.js / Express**, **MongoDB Atlas**, **Socket.IO WebSockets**, and **Tailwind CSS**.

---

## 🚀 Key Features

- **Interactive Kanban Sprint Board**: Multi-lane drag-and-drop workflow (`TODO`, `IN PROGRESS`, `REVIEW`, `COMPLETED`).
- **Real-Time Team & Direct Chat**: Instant messaging powered by WebSockets with presence and typing indicators.
- **Task & Deliverable Management**: Priority levels (`Critical`, `High`, `Medium`, `Low`), deadlines, assignees, subtasks, and discussion threads.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `Admin`, `Manager`, `Student / User`.
- **Project File Vault**: Central repository for specifications, code deliverables, attachments, and assets.
- **System Governance Portal**: Administrative dashboard for user status, role escalation, and global project audits.
- **Real-Time In-App Notifications**: Toast notifications and alert center for task assignments, mentions, and project updates.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Lucide Icons, Axios, React Router v6, Socket.IO Client |
| **Backend** | Node.js, Express.js 4.21, Mongoose 8.9, JWT (JSON Web Tokens), Multer, Socket.IO, Cors |
| **Database** | MongoDB Atlas Cloud Database |
| **Deployment** | Vercel (Frontend & Serverless API), Node.js (Standalone Server) |

---

## 📂 Project Structure

```
learning_platform/
├── api/
│   └── index.js              # Native Vercel Serverless Function entry point
├── backend/
│   ├── app.js                # Modular Express application (routes, middleware, CORS)
│   ├── config/               # MongoDB Atlas connection & connection caching
│   ├── controllers/          # Auth, Projects, Tasks, Comments, Files, Messages, Admin
│   ├── middleware/           # JWT Protect, Role Authorization, Multer Upload, Error Handler
│   ├── models/               # Mongoose Schemas (User, Project, Task, File, Message, etc.)
│   ├── routes/               # Express REST routers (/api/auth, /api/health, etc.)
│   ├── seed.js               # Database demo seed script
│   ├── server.js             # HTTP & Socket.IO server listener
│   ├── package.json          # Backend dependencies
│   ├── .env.example          # Backend environment variables template
│   └── vercel.json           # Backend standalone Vercel deployment config
├── frontend/
│   ├── src/
│   │   ├── components/       # Badges, Modal, Avatar, Navbar, Sidebar, Layout
│   │   ├── context/          # AuthContext, SocketContext, NotificationContext
│   │   ├── config/           # Centralized API configuration (src/config/api.js)
│   │   ├── services/         # Axios API client (src/services/api.js)
│   │   ├── pages/            # Login, Register, Dashboard, Projects, Tasks, Chat, Files
│   │   ├── App.jsx           # Client router with ProtectedRoute and AdminRoute
│   │   ├── index.css         # Tailwind directives & design system
│   │   └── main.jsx          # App root
│   ├── package.json          # Frontend dependencies
│   ├── .env.example          # Frontend environment variables template
│   └── vercel.json           # Frontend SPA routing (prevents 404/405 on refresh)
├── package.json              # Root monorepo build & start scripts
├── vercel.json               # Root Vercel unified full-stack configuration
├── .gitignore                # Git ignore rules for node_modules, dist, and .env
└── README.md
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@example.com` | `Password123!` |
| **Project Lead / Manager** | `manager@example.com` | `Password123!` |
| **Student / Member** | `student@example.com` | `Password123!` |

---

## ⚡ Local Development

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # (Optional) Pre-populates database with demo users & projects
npm start        # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite development server on http://localhost:5173
```

---

## 🌐 Production Deployment on Vercel

You can deploy this project using either of the two standard Vercel patterns:

### Option A: Unified Full-Stack Deployment (Recommended - 1 Vercel Project)

In this configuration, Vercel hosts both the React Vite frontend and the Express Serverless API together under the same domain.

- **STEP 1**: Push the repository to GitHub:
  ```bash
  git add .
  git commit -m "feat: complete production deployment configuration"
  git push origin main
  ```
- **STEP 2**: Go to [vercel.com/dashboard](https://vercel.com/dashboard) and click **"Add New" > "Project"**.
- **STEP 3**: Select and import your GitHub repository (`learning_platform` or `full-stack`).
- **STEP 4**: In the project configuration:
  - **Root Directory**: Leave as `./` (the root of the repository).
  - **Build Command**: `npm run build`
  - **Output Directory**: `frontend/dist`
- **STEP 5**: Add Environment Variables:
  | Variable | Value |
  |---|---|
  | `MONGODB_URI` | Your MongoDB Atlas connection string |
  | `JWT_SECRET` | Your strong random JWT secret |
  | `NODE_ENV` | `production` |
- **STEP 6**: Click **Deploy**.
- **STEP 7**: Verify deployment:
  - Health check: `https://YOUR-APP.vercel.app/api/health`
  - Direct login: `https://YOUR-APP.vercel.app/login`

---

### Option B: Separate Frontend and Backend (2 Vercel Projects)

If you prefer separate Vercel projects for the frontend and backend:

#### Project 1: Backend API (`learning-platform-backend`)
1. In Vercel, import the repository.
2. Set **Root Directory** to `backend`.
3. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret
   - `FRONTEND_URL`: `https://learning-platform-frontend.vercel.app`
4. Click **Deploy**.
5. Copy the assigned backend URL (e.g., `https://learning-platform-backend.vercel.app`).
6. Verify: `GET https://learning-platform-backend.vercel.app/api/health`.

#### Project 2: Frontend Client (`learning-platform-frontend`)
1. In Vercel, import the same repository again as a new project.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://learning-platform-backend.vercel.app`
5. Click **Deploy**.
6. Access `https://learning-platform-frontend.vercel.app/login` and test authentication.

---

## 🧪 Production API Endpoints

- **Health Check**: `GET /api/health`
  ```json
  { "success": true, "message": "Backend API is running" }
  ```
- **Login**: `POST /api/auth/login`
  ```json
  // Request
  { "email": "admin@example.com", "password": "Password123!" }

  // Response (200 OK)
  {
    "success": true,
    "message": "Login successful",
    "token": "JWT_TOKEN",
    "user": { "id": "...", "name": "...", "email": "..." }
  }
  ```
- **Register**: `POST /api/auth/register`
  ```json
  // Request
  { "name": "Test Student", "email": "student2@example.com", "password": "Password123!" }

  // Response (201 Created)
  {
    "success": true,
    "message": "Registration successful",
    "token": "JWT_TOKEN",
    "user": { "id": "...", "name": "...", "email": "..." }
  }
  ```
- **Direct SPA Routes**: Direct browser navigation and page refresh on `/login`, `/dashboard`, `/projects`, `/my-tasks` correctly load without `404` or `405` errors.
