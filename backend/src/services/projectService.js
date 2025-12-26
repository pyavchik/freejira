import Project from '../models/Project.js';
import Workspace from '../models/Workspace.js';

export const createProject = async (projectData, userId) => {
  // Verify user has access to workspace
  const workspace = await Workspace.findOne({
    _id: projectData.workspace,
    $or: [{ owner: userId }, { 'members.user': userId }],
  });

  if (!workspace) {
    throw new Error('Workspace not found or access denied');
  }

  // Check if key already exists
  const existingProject = await Project.findOne({ key: projectData.key });
  if (existingProject) {
    throw new Error('Project key already exists');
  }

  const project = await Project.create({
    ...projectData,
    lead: userId,
    members: [userId],
  });

  return await Project.findById(project._id)
    .populate('workspace', 'name')
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar');
};

export const getProjects = async (workspaceId, userId) => {
  // Verify user has access to workspace
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    $or: [{ owner: userId }, { 'members.user': userId }],
  });

  if (!workspace) {
    throw new Error('Workspace not found or access denied');
  }

  return await Project.find({ workspace: workspaceId })
    .populate('workspace', 'name')
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ createdAt: -1 });
};

export const getProjectById = async (projectId, userId) => {
  const project = await Project.findById(projectId)
    .populate('workspace', 'name')
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar');

  if (!project) {
    throw new Error('Project not found');
  }

  // Verify user has access to workspace
  const workspace = await Workspace.findOne({
    _id: project.workspace._id,
    $or: [{ owner: userId }, { 'members.user': userId }],
  });

  if (!workspace) {
    throw new Error('Access denied');
  }

  return project;
};

export const updateProject = async (projectId, updateData, userId) => {
  const project = await getProjectById(projectId, userId);

  // Check if user is lead or workspace admin/owner
  const workspace = await Workspace.findById(project.workspace._id);
  const member = workspace.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  const isWorkspaceAdmin =
    member && (member.role === 'owner' || member.role === 'admin');

  if (
    project.lead._id.toString() !== userId.toString() &&
    !isWorkspaceAdmin
  ) {
    throw new Error('Not authorized to update project');
  }

  Object.assign(project, updateData);
  await project.save();

  return await Project.findById(project._id)
    .populate('workspace', 'name')
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar');
};

export const deleteProject = async (projectId, userId) => {
  const project = await getProjectById(projectId, userId);

  // Check if user is lead or workspace owner
  const workspace = await Workspace.findById(project.workspace._id);
  if (
    project.lead._id.toString() !== userId.toString() &&
    workspace.owner.toString() !== userId.toString()
  ) {
    throw new Error('Not authorized to delete project');
  }

  await Project.findByIdAndDelete(projectId);
};

