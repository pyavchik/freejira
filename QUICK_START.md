# Quick Start Guide

Get FreeJira up and running in minutes!

## Option 1: Docker Compose (Recommended)

The easiest way to run the entire stack:

```bash
# Clone the repository (if not already done)
cd freejira

# Create .env file for backend
cd backend
cp .env.example .env
# Edit .env and set your JWT secrets

# Go back to root
cd ..

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs
- MongoDB: localhost:27017

## Option 2: Local Development

### Prerequisites
- Node.js 20+
- MongoDB running locally or MongoDB Atlas connection string

### MongoDB Setup

If MongoDB is not installed, choose one of these options:

#### Install MongoDB on Ubuntu/Debian:

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

#### Or use Docker:

```bash
docker run -d -p 27017:27017 --name freejira-mongodb mongo:7
```

#### Or use MongoDB Atlas (Cloud):

1. Sign up at https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Get your connection string and update `MONGODB_URI` in `.env`

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Ensure MongoDB is running (see above)
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod (if installed)
# Or use MongoDB Atlas connection string

# Start backend
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start frontend
npm run dev
```

Frontend will run on http://localhost:3000

## First Steps

1. **Register an account**: Go to http://localhost:3000/register
2. **Create a workspace**: Click "New Workspace" on the dashboard
3. **Create a project**: Open your workspace and click "New Project"
4. **Add tasks**: Open your project and start creating tasks!
5. **Drag & drop**: Move tasks between Todo, In Progress, and Done columns

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongosh` or check service status
- Verify MONGODB_URI in backend/.env is correct
- For Docker: MongoDB container should be running

### CORS Errors
- Ensure FRONTEND_URL in backend/.env matches your frontend URL
- Default: http://localhost:3000

### Port Already in Use
- Backend: Change PORT in backend/.env
- Frontend: Change port in package.json scripts or use `-p 3001`

### JWT Errors
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set in backend/.env
- Use strong, random strings in production

## Production Deployment

See README.md for deployment instructions to Vercel (frontend) and Render/Railway (backend).

