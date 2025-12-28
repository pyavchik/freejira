import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userStoryRoutes from './routes/userStoryRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load env vars
dotenv.config();

// Log environment variables to check if they are loaded
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Not Loaded');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Not Loaded');
console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE ? 'Loaded' : 'Not Loaded');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://70.34.254.102:3000',
      'http://70.34.254.102',
      'https://freejira.online',
      'https://www.freejira.online'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/user-stories', userStoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
