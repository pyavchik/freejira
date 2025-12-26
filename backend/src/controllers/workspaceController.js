import * as workspaceService from '../services/workspaceService.js';
import { body, validationResult } from 'express-validator';

export const createWorkspace = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const workspace = await workspaceService.createWorkspace(
      req.body,
      req.user.userId
    );
    res.status(201).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.getWorkspaces(req.user.userId);
    res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspace = async (req, res, next) => {
  try {
    // #region agent log
    const logData = {location:'workspaceController.js:39',message:'getWorkspace called',data:{workspaceId:req.params.id,userId:req.user?.userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
    fetch('http://127.0.0.1:7242/ingest/16fec140-1f9b-4213-bc65-8d80294bbace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    // #endregion

    const workspace = await workspaceService.getWorkspaceById(
      req.params.id,
      req.user.userId
    );

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/16fec140-1f9b-4213-bc65-8d80294bbace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'workspaceController.js:47',message:'getWorkspace success',data:{workspaceId:req.params.id,found:!!workspace},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/16fec140-1f9b-4213-bc65-8d80294bbace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'workspaceController.js:55',message:'getWorkspace error',data:{workspaceId:req.params.id,errorMessage:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    next(error);
  }
};

export const updateWorkspace = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const workspace = await workspaceService.updateWorkspace(
      req.params.id,
      req.body,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspace = async (req, res, next) => {
  try {
    await workspaceService.deleteWorkspace(
      req.params.id,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      message: 'Workspace deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const workspace = await workspaceService.addMemberToWorkspace(
      req.params.id,
      req.body,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const validateWorkspace = [
  body('name').trim().notEmpty().withMessage('Workspace name is required'),
];

export const validateMember = [
  body('user')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['owner', 'admin', 'user'])
    .withMessage('Invalid role'),
];

