import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

export const createComment = async (commentData, userId) => {
  console.log('=== COMMENT SERVICE CREATE ===');
  console.log('User ID:', userId);
  console.log('Comment data:', JSON.stringify(commentData, null, 2));
  
  // Verify task exists
  const task = await Task.findById(commentData.task);
  console.log('Task found:', task ? 'Yes' : 'No');
  if (!task) {
    console.error('Task not found for ID:', commentData.task);
    throw new Error('Task not found');
  }

  console.log('Creating comment with data:', {
    ...commentData,
    author: userId,
  });
  
  const comment = await Comment.create({
    ...commentData,
    author: userId,
  });
  console.log('Comment created with ID:', comment._id);

  // Create activity log
  console.log('Creating activity log for task:', task._id);
  await Activity.create({
    type: 'comment_added',
    task: task._id,
    user: userId,
    description: 'A comment was added',
  });

  console.log('Fetching comment with populated data');
  const populatedComment = await Comment.findById(comment._id)
    .populate('author', 'name email avatar')
    .populate('task', 'title');
    
  console.log('Comment service completed successfully');
  return populatedComment;
};

export const getComments = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  return await Comment.find({ task: taskId })
    .populate('author', 'name email avatar')
    .sort({ createdAt: -1 });
};

export const updateComment = async (commentId, updateData, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to update this comment');
  }

  comment.content = updateData.content;
  comment.edited = true;
  await comment.save();

  // Create activity log
  await Activity.create({
    type: 'comment_updated',
    task: comment.task,
    user: userId,
    description: 'A comment was updated',
  });

  return await Comment.findById(comment._id)
    .populate('author', 'name email avatar')
    .populate('task', 'title');
};

export const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this comment');
  }

  // Create activity log
  await Activity.create({
    type: 'comment_deleted',
    task: comment.task,
    user: userId,
    description: 'A comment was deleted',
  });

  await Comment.findByIdAndDelete(commentId);
};

