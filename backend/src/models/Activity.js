import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'task_created',
        'task_updated',
        'task_deleted',
        'task_status_changed',
        'task_assigned',
        'user_story_created',
        'user_story_updated',
        'user_story_deleted',
        'user_story_status_changed',
        'comment_added',
        'comment_updated',
        'comment_deleted',
      ],
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    userStory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserStory',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
activitySchema.index({ task: 1, createdAt: -1 });
activitySchema.index({ userStory: 1, createdAt: -1 });
activitySchema.index({ user: 1 });

export default mongoose.model('Activity', activitySchema);

