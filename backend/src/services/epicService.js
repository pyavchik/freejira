import Epic from '../models/Epic.js';
import Project from '../models/Project.js';
import UserStory from '../models/UserStory.js';
import Task from '../models/Task.js';

export const createEpic = async (epicData, userId) => {
  // Verify user has access to project
  const project = await Project.findOne({
    _id: epicData.project,
    members: userId,
  });

  if (!project) {
    throw new Error('Project not found or access denied');
  }

  const epic = await Epic.create({
    ...epicData,
    reporter: userId,
  });

  return await Epic.findById(epic._id)
    .populate('project', 'name key')
    .populate('reporter', 'name email avatar')
    .populate('assignee', 'name email avatar');
};

export const getEpics = async (projectId, userId) => {
  // Verify user has access to project
  const project = await Project.findOne({
    _id: projectId,
    members: userId,
  });

  if (!project) {
    throw new Error('Project not found or access denied');
  }

  return await Epic.find({ project: projectId })
    .populate('project', 'name key')
    .populate('reporter', 'name email avatar')
    .populate('assignee', 'name email avatar')
    .sort({ createdAt: -1 });
};

export const getEpicById = async (epicId, userId) => {
  const epic = await Epic.findById(epicId)
    .populate('project', 'name key')
    .populate('reporter', 'name email avatar')
    .populate('assignee', 'name email avatar');

  if (!epic) {
    throw new Error('Epic not found');
  }

  // Verify user has access to project
  const project = await Project.findOne({
    _id: epic.project._id,
    members: userId,
  });

  if (!project) {
    throw new Error('Access denied');
  }

  return epic;
};

export const updateEpic = async (epicId, updateData, userId) => {
  const epic = await getEpicById(epicId, userId);

  // Check if user is project lead or reporter
  const project = await Project.findById(epic.project._id);
  if (
    project.lead.toString() !== userId.toString() &&
    epic.reporter._id.toString() !== userId.toString()
  ) {
    throw new Error('Not authorized to update epic');
  }

  Object.assign(epic, updateData);
  await epic.save();

  return await Epic.findById(epic._id)
    .populate('project', 'name key')
    .populate('reporter', 'name email avatar')
    .populate('assignee', 'name email avatar');
};

export const deleteEpic = async (epicId, userId) => {
  const epic = await getEpicById(epicId, userId);

  // Check if user is project lead
  const project = await Project.findById(epic.project._id);
  if (project.lead.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete epic');
  }

  // TODO: Decide on what to do with user stories and tasks associated with this epic.
  // For now, we will not delete them.

  await Epic.findByIdAndDelete(epicId);
};

export const getEpicUserStories = async (epicId, userId) => {
  const epic = await getEpicById(epicId, userId);

  return await UserStory.find({ epic: epicId })
    .populate('project', 'name key')
    .populate('epic', 'name')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .sort({ position: 1, createdAt: -1 });
};

export const getEpicTasks = async (epicId, userId) => {
  const epic = await getEpicById(epicId, userId);

  return await Task.find({ epic: epicId })
    .populate('project', 'name key')
    .populate('epic', 'name')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .sort({ position: 1, createdAt: -1 });
};

export const updateEpicPositions = async (epics, userId) => {
  // Verify user has access to all projects of the epics being updated
  const epicIds = epics.map((e) => e._id);
  const epicsToUpdate = await Epic.find({ _id: { $in: epicIds } })
    .populate('project', 'members')
    .exec();

  // Check if user has access to all projects
  for (const epic of epicsToUpdate) {
    const project = epic.project;
    if (!project) {
      throw new Error('Project not found for epic');
    }
    
    const hasAccess = project.members.some(
      (memberId) => memberId && memberId.toString() === userId.toString()
    );
    
    if (!hasAccess) {
      throw new Error('Access denied to update epic positions');
    }
  }

  const updatePromises = epics.map((epic, index) =>
    Epic.findByIdAndUpdate(epic._id, { position: index, status: epic.status })
  );

  await Promise.all(updatePromises);

  return await Epic.find({ _id: { $in: epicIds } })
    .populate('project', 'name key')
    .populate('reporter', 'name email avatar')
    .populate('assignee', 'name email avatar')
    .exec();
};
