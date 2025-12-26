import * as activityService from '../services/activityService.js';

export const getActivities = async (req, res, next) => {
  try {
    const activities = await activityService.getActivities(req.params.taskId);
    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

