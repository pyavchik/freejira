import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
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
    userStory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserStory',
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
    subtasks: [
      {
        title: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
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
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ epic: 1 });
taskSchema.index({ userStory: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });

export default mongoose.model('Task', taskSchema);

