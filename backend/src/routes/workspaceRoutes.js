import express from 'express';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  validateWorkspace,
  validateMember,
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getWorkspaces)
  .post(validateWorkspace, createWorkspace);

router
  .route('/:id')
  .get(getWorkspace)
  .put(validateWorkspace, updateWorkspace)
  .delete(deleteWorkspace);

router.post('/:id/members', validateMember, addMember);

export default router;

