import express from 'express';
import {
  createEpic,
  getEpics,
  getEpic,
  updateEpic,
  deleteEpic,
  getEpicUserStories,
  getEpicTasks,
  validateEpic,
  updateEpicPositions,
} from '../controllers/epicController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/project/:projectId')
  .get(getEpics);

router.post('/', validateEpic, createEpic);

router
  .route('/:id')
  .get(getEpic)
  .put(validateEpic, updateEpic)
  .delete(deleteEpic);

router.get('/:id/user-stories', getEpicUserStories);
router.get('/:id/tasks', getEpicTasks);

router.put('/positions/update', updateEpicPositions);

export default router;
