# FreeJira - Task Management Application

A complete Jira-like task management web application built with Next.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: Register, login with JWT tokens
- **Workspaces & Projects**: Organize work into workspaces and projects
- **Kanban Board**: Drag-and-drop task management with Todo, In Progress, Done columns
- **Task Management**: Create, update, delete tasks with priorities, assignees, and subtasks (assignees must be project members)
- **Comments**: Add comments to tasks
- **Activity Log**: Track all task activities
- **User Roles**: Owner, Admin, User roles for workspaces
- **Modern UI**: Responsive design with dark mode support
- **Real-time Ready**: Socket.io prepared for future real-time features

## 🧱 Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- React Query
- @hello-pangea/dnd (Drag and Drop)

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Swagger UI for API documentation

## 📦 Installation

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### MongoDB Setup

You need MongoDB running before starting the backend. Choose one of the following options:

#### Option 1: Install MongoDB Locally (Ubuntu/Debian)

```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify it's running
sudo systemctl status mongod
```

#### Option 2: Use Docker

```bash
# Start MongoDB in Docker container
docker run -d -p 27017:27017 --name freejira-mongodb mongo:7

# Verify it's running
docker ps | grep mongo
```

#### Option 3: Use MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a cluster (free tier available)
3. Create a database user
4. Get your connection string
5. Update `MONGODB_URI` in your `.env` file with the Atlas connection string

#### Option 4: Use Docker Compose

```bash
# From the project root directory
docker-compose up -d mongodb
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/freejira
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

5. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`
API documentation at `http://localhost:5000/api-docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Backend

```bash
cd backend
docker build -t freejira-backend .
docker run -p 5000:5000 --env-file .env freejira-backend
```

### Frontend

```bash
cd frontend
docker build -t freejira-frontend .
docker run -p 3000:3000 --env-file .env.local freejira-frontend
```

## 📁 Project Structure

```
freejira/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Swagger config
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── server.js        # Express server
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # API clients, utilities
│   ├── package.json
│   └── Dockerfile
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Workspaces
- `GET /api/workspaces` - Get all workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/:id` - Get workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/members` - Add member

### Projects
- `GET /api/projects/workspace/:workspaceId` - Get projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks/project/:projectId` - Get tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/positions/update` - Update task positions

### Comments
- `GET /api/comments/task/:taskId` - Get comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Activities
- `GET /api/activities/task/:taskId` - Get activities

Full API documentation available at `/api-docs` when server is running.

## 🚢 Deployment

### Vercel (Frontend)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL

### Render/Railway (Backend)

1. Push code to GitHub
2. Create new service
3. Set environment variables from `.env.example`
4. Deploy

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
