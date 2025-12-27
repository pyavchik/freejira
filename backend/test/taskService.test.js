import mongoose from 'mongoose';
import Task from '../src/models/Task.js';
import Project from '../src/models/Project.js';
import User from '../src/models/User.js';
import * as taskService from '../src/services/taskService.js';
import connectDB from '../src/config/database.js';

// Simple in-memory mongo is not configured; these tests expect a test DB via env
// Run with MONGODB_URI pointing to a test database.
describe('taskService assignment rules', () => {
  let project;
  let member;
  let nonMember;

  beforeAll(async () => {
    await connectDB();
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});

    member = await User.create({ name: 'Member', email: 'm@example.com', password: 'pass' });
    nonMember = await User.create({ name: 'NonMember', email: 'n@example.com', password: 'pass' });
    project = await Project.create({ name: 'Proj', key: 'PRJ', workspace: new mongoose.Types.ObjectId(), members: [member._id] });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('allows assigning to project member', async () => {
    const task = await taskService.createTask({ title: 'T1', project: project._id, assignee: member._id }, member._id);
    expect(task.assignee._id.toString()).toBe(member._id.toString());
  });

  test('rejects assigning to non-member', async () => {
    await expect(
      taskService.createTask({ title: 'T2', project: project._id, assignee: nonMember._id }, member._id)
    ).rejects.toThrow('Assignee must be a project member');
  });

  test('rejects action by non-member', async () => {
    await expect(
      taskService.createTask({ title: 'T3', project: project._id }, nonMember._id)
    ).rejects.toThrow('Access denied to project');
  });
});

