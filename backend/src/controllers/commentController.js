import * as commentService from '../services/commentService.js';
import { body, validationResult } from 'express-validator';

export const createComment = async (req, res, next) => {
  try {
    console.log('=== COMMENT CREATION REQUEST ===');
    console.log('User ID:', req.user.userId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Task ID from URL:', req.params.taskId);
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Add taskId from URL params to the request body
    const commentData = {
      ...req.body,
      task: req.params.taskId
    };
    
    console.log('Final comment data being sent to service:', commentData);
    
    const comment = await commentService.createComment(
      commentData,
      req.user.userId
    );
    console.log('Comment created successfully:', comment._id);
    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Error in createComment controller:', error.message);
    console.error('Full error:', error);
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getComments(req.params.taskId);
    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const comment = await commentService.updateComment(
      req.params.id,
      req.body,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    await commentService.deleteComment(req.params.id, req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Comment deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const validateComment = [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
];

export const validateCommentWithTask = [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
  body('task')
    .notEmpty()
    .withMessage('Task ID is required')
    .isMongoId()
    .withMessage('Invalid task ID'),
];

