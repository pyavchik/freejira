import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';

export const createTask = async (taskData, userId) => {
  // Verify user has access to project
  const project = await Project.findById(taskData.project);
  if (!project) {
    throw new Error('Project not found');
  }

  const task = await Task.create({
    ...taskData,
    reporter: userId,
  });

  // Create activity log
  await Activity.create({
    type: 'task_created',
    task: task._id,
    user: userId,
    description: `Task "${task.title}" was created`,
  });

  return await Task.findById(task._id)
    .populate('project', 'name key')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar');
};

export const getTasks = async (projectId, userId) => {
  // Verify user has access to project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  return await Task.find({ project: projectId })
    .populate('project', 'name key')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .sort({ position: 1, createdAt: -1 });
};

export const getTaskById = async (taskId, userId) => {
  const task = await Task.findById(taskId)
    .populate('project', 'name key')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar');

  if (!task) {
    throw new Error('Task not found');
  }

  // Verify user has access to project
  const project = await Project.findById(task.project._id);
  if (!project) {
    throw new Error('Project not found');
  }

  return task;
};

export const updateTask = async (taskId, updateData, userId) => {
  const task = await getTaskById(taskId, userId);
  const oldStatus = task.status;

  Object.assign(task, updateData);
  await task.save();

  // Create activity log for status change
  if (updateData.status && updateData.status !== oldStatus) {
    await Activity.create({
      type: 'task_status_changed',
      task: task._id,
      user: userId,
      description: `Task status changed from ${oldStatus} to ${updateData.status}`,
      metadata: {
        oldStatus,
        newStatus: updateData.status,
      },
    });
  }

  // Create activity log for assignment
  if (updateData.assignee && updateData.assignee !== task.assignee?.toString()) {
    await Activity.create({
      type: 'task_assigned',
      task: task._id,
      user: userId,
      description: `Task was assigned`,
      metadata: {
        assignee: updateData.assignee,
      },
    });
  }

  // Create activity log for general update
  if (!updateData.status && !updateData.assignee) {
    await Activity.create({
      type: 'task_updated',
      task: task._id,
      user: userId,
      description: `Task was updated`,
    });
  }

  return await Task.findById(task._id)
    .populate('project', 'name key')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar');
};

export const deleteTask = async (taskId, userId) => {
  const task = await getTaskById(taskId, userId);

  // Create activity log
  await Activity.create({
    type: 'task_deleted',
    task: task._id,
    user: userId,
    description: `Task "${task.title}" was deleted`,
  });

  await Task.findByIdAndDelete(taskId);
};

export const updateTaskPositions = async (tasks, userId) => {
  const updatePromises = tasks.map((task, index) =>
    Task.findByIdAndUpdate(task._id, { position: index, status: task.status })
  );

  await Promise.all(updatePromises);

  return await Task.find({ _id: { $in: tasks.map((t) => t._id) } })
    .populate('project', 'name key')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar');
};

