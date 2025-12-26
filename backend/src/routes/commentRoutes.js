import express from 'express';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  validateComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/task/:taskId')
  .get(getComments)
  .post(validateComment, createComment);

router
  .route('/:id')
  .put(validateComment, updateComment)
  .delete(deleteComment);

export default router;

