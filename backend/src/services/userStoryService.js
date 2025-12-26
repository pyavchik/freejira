import UserStory from '../models/UserStory.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

export const createUserStory = async (userStoryData, userId) => {
  // Verify user has access to project
  const project = await Project.findById(userStoryData.project);
  if (!project) {
    throw new Error('Project not found');
  }

  const userStory = await UserStory.create({
    ...userStoryData,
    reporter: userId,
  });

  // Create activity log
  await Activity.create({
    type: 'user_story_created',
    userStory: userStory._id,
    user: userId,
    description: `User Story "${userStory.title}" was created`,
  });

  return await UserStory.findById(userStory._id)
    .populate('project', 'name key')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar');
};

export const getUserStories = async (projectId, userId) => {
  // Verify user has access to project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  return await UserStory.find({ project: projectId })
    .populate('project', 'name key')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .sort({ position: 1, createdAt: -1 });
};

export const getUserStoryById = async (userStoryId, userId) => {
  const userStory = await UserStory.findById(userStoryId)
    .populate('project', 'name key')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar');

  if (!userStory) {
    throw new Error('User Story not found');
  }

  // Verify user has access to project
  const project = await Project.findById(userStory.project._id);
  if (!project) {
    throw new Error('Project not found');
  }

  return userStory;
};

export const updateUserStory = async (userStoryId, updateData, userId) => {
  const userStory = await getUserStoryById(userStoryId, userId);
  const oldStatus = userStory.status;

  Object.assign(userStory, updateData);
  await userStory.save();

  // Create activity log for status change
  if (updateData.status && updateData.status !== oldStatus) {
    await Activity.create({
      type: 'user_story_status_changed',
      userStory: userStory._id,
      user: userId,
      description: `User Story status changed from ${oldStatus} to ${updateData.status}`,
      metadata: {
        oldStatus,
        newStatus: updateData.status,
      },
    });
  }

  return await UserStory.findById(userStory._id)
    .populate('project', 'name key')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar');
};

export const deleteUserStory = async (userStoryId, userId) => {
  const userStory = await getUserStoryById(userStoryId, userId);

  // Remove userStory reference from tasks
  await Task.updateMany(
    { userStory: userStoryId },
    { $unset: { userStory: 1 } }
  );

  await UserStory.findByIdAndDelete(userStoryId);
};

export const updateUserStoryPositions = async (userStories, userId) => {
  const updatePromises = userStories.map((story, index) =>
    UserStory.findByIdAndUpdate(story._id, {
      position: index,
      status: story.status,
    })
  );

  await Promise.all(updatePromises);

  return await UserStory.find({ _id: { $in: userStories.map((s) => s._id) } })
    .populate('project', 'name key')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar');
};

export const getUserStoryTasks = async (userStoryId, userId) => {
  const userStory = await getUserStoryById(userStoryId, userId);

  return await Task.find({ userStory: userStoryId })
    .populate('project', 'name key')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .populate('userStory', 'title')
    .sort({ position: 1, createdAt: -1 });
};

