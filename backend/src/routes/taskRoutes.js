import express from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateTaskPositions,
  validateTask,
  validateUpdateTask,
  getMyTasks,
  getAllTasks,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyTasks);
router.get('/', getAllTasks);

router
  .route('/project/:projectId')
  .get(getTasks)
  .post(validateTask, createTask);

router
  .route('/:id')
  .get(getTask)
  .put(validateUpdateTask, updateTask)
  .delete(deleteTask);

router.put('/positions/update', updateTaskPositions);

export default router;
