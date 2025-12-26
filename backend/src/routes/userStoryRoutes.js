import express from 'express';
import {
  createUserStory,
  getUserStories,
  getUserStory,
  updateUserStory,
  deleteUserStory,
  updateUserStoryPositions,
  getUserStoryTasks,
  validateUserStory,
  validateUserStoryUpdate,
} from '../controllers/userStoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/project/:projectId')
  .get(getUserStories)
  .post(validateUserStory, createUserStory);

// Specific routes must come before parameterized routes
router.put('/positions/update', updateUserStoryPositions);
router.get('/:id/tasks', getUserStoryTasks);

router
  .route('/:id')
  .get(getUserStory)
  .put(validateUserStoryUpdate, updateUserStory)
  .delete(deleteUserStory);

export default router;

