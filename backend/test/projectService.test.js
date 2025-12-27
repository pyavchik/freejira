import mongoose from 'mongoose';
import Project from '../src/models/Project.js';
import Workspace from '../src/models/Workspace.js';
import User from '../src/models/User.js';
import * as projectService from '../src/services/projectService.js';
import connectDB from '../src/config/database.js';

describe('projectService.addUserToProject', () => {
  let workspace;
  let lead;
  let admin;
  let user1;
  let project;

  beforeAll(async () => {
    await connectDB();
    await Project.deleteMany({});
    await Workspace.deleteMany({});
    await User.deleteMany({});

    lead = await User.create({ name: 'Lead', email: 'lead@example.com', password: 'pass' });
    admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'pass' });
    user1 = await User.create({ name: 'User1', email: 'user1@example.com', password: 'pass' });

    workspace = await Workspace.create({
      name: 'WS',
      owner: lead._id,
      members: [{ user: admin._id, role: 'admin' }],
    });

    project = await Project.create({ name: 'Proj', key: 'PRJ', workspace: workspace._id, lead: lead._id, members: [lead._id] });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('adds a new user to project by lead', async () => {
    const updated = await projectService.addUserToProject(project._id, user1._id, lead._id);
    const memberIds = updated.members.map((m) => m._id.toString());
    expect(memberIds).toContain(user1._id.toString());
  });

  test('fails to add duplicate user', async () => {
    await expect(projectService.addUserToProject(project._id, lead._id, lead._id)).rejects.toThrow('User is already a project member');
  });
});

