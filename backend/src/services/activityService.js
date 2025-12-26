import Activity from '../models/Activity.js';

export const getActivities = async (taskId) => {
  return await Activity.find({ task: taskId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 });
};

