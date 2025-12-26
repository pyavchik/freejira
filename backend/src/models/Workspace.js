import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a workspace name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'user'],
          default: 'user',
        },
      },
    ],
    settings: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });

export default mongoose.model('Workspace', workspaceSchema);

