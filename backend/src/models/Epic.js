import mongoose from 'mongoose';

const epicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an epic name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
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
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    labels: [String],
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
epicSchema.index({ project: 1, status: 1 });
epicSchema.index({ assignee: 1 });
epicSchema.index({ reporter: 1 });

export default mongoose.model('Epic', epicSchema);
