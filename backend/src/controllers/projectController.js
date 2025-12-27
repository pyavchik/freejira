import * as projectService from '../services/projectService.js';
import { body, validationResult } from 'express-validator';

export const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const project = await projectService.createProject(
      req.body,
      req.user.userId
    );
    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    // #region agent log
    const logData = {location:'projectController.js:27',message:'getProjects called',data:{workspaceId:req.params.workspaceId,userId:req.user?.userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
    fetch('http://127.0.0.1:7242/ingest/16fec140-1f9b-4213-bc65-8d80294bbace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    // #endregion

    const projects = await projectService.getProjects(
      req.params.workspaceId,
      req.user.userId
    );

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/16fec140-1f9b-4213-bc65-8d80294bbace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projectController.js:35',message:'getProjects success',data:{workspaceId:req.params.workspaceId,projectCount:projects?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/16fec140-1f9b-4213-bc65-8d80294bbace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'projectController.js:43',message:'getProjects error',data:{workspaceId:req.params.workspaceId,errorMessage:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(
      req.params.id,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const project = await projectService.updateProject(
      req.params.id,
      req.body,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Project deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const validateProject = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('key')
    .trim()
    .notEmpty()
    .withMessage('Project key is required')
    .isUppercase()
    .withMessage('Project key must be uppercase')
    .isLength({ min: 2, max: 10 })
    .withMessage('Project key must be between 2 and 10 characters'),
  body('workspace')
    .notEmpty()
    .withMessage('Workspace ID is required')
    .isMongoId()
    .withMessage('Invalid workspace ID'),
];

export const addUserToProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const project = await projectService.addUserToProject(
      req.params.projectId,
      req.body.userId,
      req.user.userId
    );

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const validateAddUser = [
  body('userId').notEmpty().withMessage('userId is required').isMongoId().withMessage('Invalid user ID'),
];
