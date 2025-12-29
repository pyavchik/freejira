import mongoose from 'mongoose';

const userStorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a user story title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
      default: 'backlog',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    epic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Epic',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    acceptanceCriteria: [
      {
        description: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    storyPoints: {
      type: Number,
      min: 0,
      default: 0,
    },
    labels: [String],
    dueDate: {
      type: Date,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userStorySchema.index({ project: 1, status: 1 });
userStorySchema.index({ epic: 1 });
userStorySchema.index({ assignee: 1 });
userStorySchema.index({ reporter: 1 });

export default mongoose.model('UserStory', userStorySchema);

