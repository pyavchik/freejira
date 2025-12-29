import * as taskService from '../services/taskService.js';
import { body, validationResult } from 'express-validator';

/**
 * @swagger
 * /tasks/project/{projectId}:
 *   post:
 *     summary: Create task in project (assignee must be a project member; requester must be a project member)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               assignee:
 *                 type: string
 *                 description: Optional user ID (must be project member)
 *             required:
 *               - title
 *               - project
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a project member
 */

export const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const task = await taskService.createTask(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasks(
      req.params.projectId,
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

export const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(
      req.params.id,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update task (assignee must be a project member; requester must be a project member)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               assignee:
 *                 type: string
 *                 description: Optional user ID (must be project member)
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a project member
 *       404:
 *         description: Task not found
 */

export const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskPositions = async (req, res, next) => {
  try {
    const tasks = await taskService.updateTaskPositions(
      req.body.tasks,
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

export const validateTask = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('project')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('assignee')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid assignee ID'),
];

export const validateUpdateTask = [
  body('title').optional().trim().notEmpty().withMessage('Task title is required'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('assignee')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid assignee ID'),
];

export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasksByAssignee(req.user.userId);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasksForUser(req.user.userId);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};
