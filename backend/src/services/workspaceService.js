import Workspace from '../models/Workspace.js';

export const createWorkspace = async (workspaceData, userId) => {
  const workspace = await Workspace.create({
    ...workspaceData,
    owner: userId,
    members: [
      {
        user: userId,
        role: 'owner',
      },
    ],
  });

  return await Workspace.findById(workspace._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
};

export const getWorkspaces = async (userId) => {
  return await Workspace.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 });
};

export const getWorkspaceById = async (workspaceId, userId) => {
  // #region agent log
  const logData = {location:'workspaceService.js:29',message:'getWorkspaceById called',data:{workspaceId,userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'};
  fetch('http://127.0.0.1:7242/ingest/16fec140-1f9b-4213-bc65-8d80294bbace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
  // #endregion

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    $or: [{ owner: userId }, { 'members.user': userId }],
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/16fec140-1f9b-4213-bc65-8d80294bbace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'workspaceService.js:37',message:'MongoDB query result',data:{workspaceId,found:!!workspace},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  if (!workspace) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/16fec140-1f9b-4213-bc65-8d80294bbace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'workspaceService.js:40',message:'Workspace not found error thrown',data:{workspaceId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    throw new Error('Workspace not found');
  }

  return workspace;
};

export const updateWorkspace = async (workspaceId, updateData, userId) => {
  const workspace = await getWorkspaceById(workspaceId, userId);

  // Check if user is owner or admin
  const member = workspace.members.find(
    (m) => m.user._id.toString() === userId.toString()
  );
  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    throw new Error('Not authorized to update workspace');
  }

  Object.assign(workspace, updateData);
  await workspace.save();

  return await Workspace.findById(workspace._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
};

export const deleteWorkspace = async (workspaceId, userId) => {
  const workspace = await getWorkspaceById(workspaceId, userId);

  if (workspace.owner._id.toString() !== userId.toString()) {
    throw new Error('Only owner can delete workspace');
  }

  await Workspace.findByIdAndDelete(workspaceId);
};

export const addMemberToWorkspace = async (workspaceId, memberData, userId) => {
  const workspace = await getWorkspaceById(workspaceId, userId);

  // Check if user is owner or admin
  const member = workspace.members.find(
    (m) => m.user._id.toString() === userId.toString()
  );
  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    throw new Error('Not authorized to add members');
  }

  // Check if member already exists
  const existingMember = workspace.members.find(
    (m) => m.user.toString() === memberData.user
  );
  if (existingMember) {
    throw new Error('Member already exists in workspace');
  }

  workspace.members.push(memberData);
  await workspace.save();

  return await Workspace.findById(workspace._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
};

