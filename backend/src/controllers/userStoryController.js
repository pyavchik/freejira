import * as userStoryService from '../services/userStoryService.js';
import { body, validationResult } from 'express-validator';

export const createUserStory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userStory = await userStoryService.createUserStory(
      req.body,
      req.user.userId
    );
    res.status(201).json({
      success: true,
      data: userStory,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStories = async (req, res, next) => {
  try {
    const userStories = await userStoryService.getUserStories(
      req.params.projectId,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: userStories,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStory = async (req, res, next) => {
  try {
    const userStory = await userStoryService.getUserStoryById(
      req.params.id,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: userStory,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userStory = await userStoryService.updateUserStory(
      req.params.id,
      req.body,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: userStory,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserStory = async (req, res, next) => {
  try {
    await userStoryService.deleteUserStory(req.params.id, req.user.userId);
    res.status(200).json({
      success: true,
      message: 'User Story deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStoryPositions = async (req, res, next) => {
  try {
    const userStories = await userStoryService.updateUserStoryPositions(
      req.body.userStories,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: userStories,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStoryTasks = async (req, res, next) => {
  try {
    const tasks = await userStoryService.getUserStoryTasks(
      req.params.id,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const validateUserStory = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('User Story title is required'),
  body('project')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('status')
    .optional()
    .isIn(['backlog', 'todo', 'in-progress', 'review', 'done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
];

export const validateUserStoryUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('User Story title cannot be empty'),
  body('status')
    .optional()
    .isIn(['backlog', 'todo', 'in-progress', 'review', 'done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
];

