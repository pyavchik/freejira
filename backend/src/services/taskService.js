import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

const memberIds = (project) => {
  const members = project?.members || [];
  if (!Array.isArray(members)) {
    return [];
  }
  return members.map((m) => {
    if (m && m._id) {
      return m._id.toString();
    } else if (m && typeof m === 'object' && m.toString) {
      return m.toString();
    } else {
      return String(m);
    }
  });
};

const isProjectMember = (project, userId) => {
  if (!project) return false;
  if (project.lead && project.lead.toString() === userId.toString()) return true;
  return memberIds(project).includes(userId.toString());
};

export const createTask = async (taskData, userId) => {

  // Verify user has access to project
  const project = await Project.findById(taskData.project).populate('members');
  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;

    throw err;
  }
  if (!isProjectMember(project, userId)) {
    const err = new Error('Access denied to project');
    err.statusCode = 403;

    throw err;
  }

  // Validate assignee exists and is a project member if provided
  if (taskData.assignee) {
    const assignee = await User.findById(taskData.assignee);
    if (!assignee) {
      const err = new Error('Assignee not found');
      err.statusCode = 404;

      throw err;
    }
    const isMember = memberIds(project).includes(taskData.assignee.toString());
    if (!isMember) {
      const err = new Error('Assignee must be a project member');
      err.statusCode = 400;

      throw err;
    }
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

  // If assigned on creation, log it
  if (task.assignee) {
    await Activity.create({
      type: 'task_assigned',
      task: task._id,
      user: userId,
      description: 'Task was assigned',
      metadata: { assignee: task.assignee },
    });
  }



  return await Task.findById(task._id)
    .populate('project', 'name key')
    .populate('epic', 'name')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar');
};

export const getTasks = async (projectId, userId) => {
  // Verify user has access to project
  const project = await Project.findById(projectId).populate('members');
  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }
  if (!isProjectMember(project, userId)) {
    const err = new Error('Access denied to project');
    err.statusCode = 403;
    throw err;
  }

  return await Task.find({ project: projectId })
    .populate('project', 'name key')
    .populate('epic', 'name')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .sort({ position: 1, createdAt: -1 });
};

export const getTaskById = async (taskId, userId) => {
  const task = await Task.findById(taskId)
    .populate('project', 'name key')
    .populate('epic', 'name')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar');

  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  // Verify user has access to project
  const project = await Project.findById(task.project._id).populate('members');
  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }
  if (!isProjectMember(project, userId)) {
    const err = new Error('Access denied to project');
    err.statusCode = 403;
    throw err;
  }

  return task;
};

export const updateTask = async (taskId, updateData, userId) => {
  const task = await getTaskById(taskId, userId);
  const project = await Project.findById(task.project._id).populate('members');
  const oldStatus = task.status;
  const oldAssignee = task.assignee ? task.assignee.toString() : null;

  if (!isProjectMember(project, userId)) {
    const err = new Error('Access denied to project');
    err.statusCode = 403;

    throw err;
  }

  // Validate assignee exists and is a project member if provided (including clearing)
  if (Object.prototype.hasOwnProperty.call(updateData, 'assignee')) {
    if (updateData.assignee) {
      const assignee = await User.findById(updateData.assignee);
      if (!assignee) {
        const err = new Error('Assignee not found');
        err.statusCode = 404;
  
        throw err;
      }
      const isMember = memberIds(project).includes(updateData.assignee.toString());
      if (!isMember) {
        const err = new Error('Assignee must be a project member');
        err.statusCode = 400;
  
        throw err;
      }
    } else {

    }
  }

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

  // Create activity log for assignment change (including unassign)
  const newAssignee = task.assignee ? task.assignee.toString() : null;
  if (Object.prototype.hasOwnProperty.call(updateData, 'assignee') && newAssignee !== oldAssignee) {
    await Activity.create({
      type: 'task_assigned',
      task: task._id,
      user: userId,
      description: 'Task assignment updated',
      metadata: {
        oldAssignee,
        newAssignee,
      },
    });
  }

  // Create activity log for general update
  if (!updateData.status && !Object.prototype.hasOwnProperty.call(updateData, 'assignee')) {
    await Activity.create({
      type: 'task_updated',
      task: task._id,
      user: userId,
      description: `Task was updated`,
    });
  }



  return await Task.findById(task._id)
    .populate('project', 'name key')
    .populate('epic', 'name')
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
    .populate('epic', 'name')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar');
};

export const getTasksByAssignee = async (assigneeId) => {
  return await Task.find({ assignee: assigneeId })
    .populate('project', 'name key')
    .populate('epic', 'name')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .sort({ createdAt: -1 });
};

export const getAllTasksForUser = async (userId) => {
  // Find all projects where user is a member or lead
  const projects = await Project.find({
    $or: [
      { lead: userId },
      { 'members': userId }
    ]
  });

  const projectIds = projects.map(p => p._id);

  // Get all tasks from these projects
  return await Task.find({ project: { $in: projectIds } })
    .populate('project', 'name key')
    .populate('epic', 'name')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .sort({ createdAt: -1 });
};


