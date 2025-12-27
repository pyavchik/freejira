import express from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  validateProject,
  addUserToProject,
  validateAddUser,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Specific routes must come before parameterized routes
router
  .route('/workspace/:workspaceId')
  .get(getProjects);

router.post('/', validateProject, createProject);

router.post('/:projectId/add-user', validateAddUser, addUserToProject);

router
  .route('/:id')
  .get(getProject)
  .put(validateProject, updateProject)
  .delete(deleteProject);

export default router;
