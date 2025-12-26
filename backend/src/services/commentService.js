import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

export const createComment = async (commentData, userId) => {
  // Verify task exists
  const task = await Task.findById(commentData.task);
  if (!task) {
    throw new Error('Task not found');
  }

  const comment = await Comment.create({
    ...commentData,
    author: userId,
  });

  // Create activity log
  await Activity.create({
    type: 'comment_added',
    task: task._id,
    user: userId,
    description: 'A comment was added',
  });

  return await Comment.findById(comment._id)
    .populate('author', 'name email avatar')
    .populate('task', 'title');
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

