import * as epicService from '../services/epicService.js';
import { body, validationResult } from 'express-validator';

export const getEpicUserStories = async (req, res, next) => {
  try {
    const userStories = await epicService.getEpicUserStories(
      req.params.id,
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

export const getEpicTasks = async (req, res, next) => {
  try {
    const tasks = await epicService.getEpicTasks(
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

export const createEpic = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const epic = await epicService.createEpic(
      req.body,
      req.user.userId
    );
    res.status(201).json({
      success: true,
      data: epic,
    });
  } catch (error) {
    next(error);
  }
};

export const getEpics = async (req, res, next) => {
  try {
    const epics = await epicService.getEpics(
      req.params.projectId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: epics,
    });
  } catch (error) {
    next(error);
  }
};

export const getEpic = async (req, res, next) => {
  try {
    const epic = await epicService.getEpicById(
      req.params.id,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: epic,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEpic = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const epic = await epicService.updateEpic(
      req.params.id,
      req.body,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: epic,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEpic = async (req, res, next) => {
  try {
    await epicService.deleteEpic(req.params.id, req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Epic deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const updateEpicPositions = async (req, res, next) => {
  try {
    const epics = await epicService.updateEpicPositions(
      req.body.epics,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: epics,
    });
  } catch (error) {
    next(error);
  }
};

export const validateEpic = [
  body('name').trim().notEmpty().withMessage('Epic name is required'),
  body('project')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid project ID'),
];
