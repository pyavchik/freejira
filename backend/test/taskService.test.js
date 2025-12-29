import * as taskService from '../src/services/taskService.js';


jest.mock('mongoose', () => {
  // Simple mock for ObjectId
  class MockObjectId {
    constructor(id = Math.random().toString(36).substring(2, 15)) {
      this._id = id;
    }
    toString() {
      return this._id;
    }
    equals(other) {
      return other && other.toString() === this._id;
    }
  }
  


  // Simple in-memory "database" for mocks
  const store = {
    Task: new Map(),
    Project: new Map(),
    User: new Map(),
    Activity: new Map(),
  };

  class MockModel {
    constructor(data) {
      this._id = data._id || new MockObjectId().toString();
      Object.assign(this, data);
    }

    save() {
      store[this.constructor.modelName].set(this._id, this);
      return Promise.resolve(this);
    }

    populate(path, select) {
      // Very basic populate mock - just return the id if it's a ref
      // For more complex scenarios, this would need to fetch from store
      if (this[path] && store.User.has(this[path].toString())) {
        return {
          ...this,
          [path]: store.User.get(this[path].toString()),
        };
      }
      if (this[path] && store.Project.has(this[path].toString())) {
        return {
          ...this,
          [path]: store.Project.get(this[path].toString()),
        };
      }

      // Handle array population (e.g., members)
      if (Array.isArray(this[path])) {
        const populatedArray = this[path].map(id => {
          // If it's an object with _id, extract _id, otherwise assume it's already an ID
          const userId = id && id._id ? id._id.toString() : id.toString();
          return store.User.get(userId) || id; // Return populated user or original ID if not found
        });
        return {
          ...this,
          [path]: populatedArray,
        };
      }
      return this;
    }

    static findById(id) {
      const item = store[this.modelName].get(id.toString());
      return item ? new this(item) : null;
    }

    static find(query) {
      let initialResults = Array.from(store[this.modelName].values());
      if (query && query.project) {
        initialResults = initialResults.filter(item => item.project && item.project.toString() === query.project.toString());
      }

      const queryChain = {
        _results: initialResults, // Store results within the chain object
        _model: this, // Keep reference to the model constructor

        populate: function(path, select) {
          // Eagerly populate all known paths to avoid chaining issues
          this._results = this._results.map(item => {
            const newItem = { ...item }; // Create a mutable copy

            if (newItem.project && !newItem.project.name) { // Check if project is not already populated
                newItem.project = store.Project.get(newItem.project.toString()) || newItem.project;
            }
            if (newItem.assignee && !newItem.assignee.name) { // Check if assignee is not already populated
                newItem.assignee = store.User.get(newItem.assignee.toString()) || newItem.assignee;
            }
            if (newItem.reporter && !newItem.reporter.name) { // Check if reporter is not already populated
                newItem.reporter = store.User.get(newItem.reporter.toString()) || newItem.reporter;
            }
            if (newItem.members && Array.isArray(newItem.members) && newItem.members.every(m => !m.name)) { // Check if members are not already populated
              newItem.members = newItem.members.map(memberId => {
                const userId = memberId && memberId._id ? memberId._id.toString() : memberId.toString();
                return store.User.get(userId) || memberId;
              });
            }
            return newItem;
          });
          return this; // Allow chaining, but now populates eagerly
        },

        sort: function(criteria) {
          // No-op for simple mock for now
          return this;
        },

        exec: function() {
          return Promise.resolve(this._results.map(item => new this._model(item)));
        },

        then: function(cb) {
          return this.exec().then(cb);
        }
      };
      return queryChain;
    }

    static create(data) {
      const instance = new this(data);
      store[this.modelName].set(instance._id, instance);
      return Promise.resolve(instance);
    }

    static findByIdAndUpdate(id, updates) {
      const item = store[this.modelName].get(id.toString());
      if (!item) return null;
      Object.assign(item, updates);
      store[this.modelName].set(id.toString(), item);
      return Promise.resolve(new this(item));
    }

    static findByIdAndDelete(id) {
      const item = store[this.modelName].get(id.toString());
      if (!item) return null;
      store[this.modelName].delete(id.toString());
      return Promise.resolve(new this(item));
    }

    static deleteMany(query) {
      if (Object.keys(query).length === 0) { // Empty query means delete all
        store[this.modelName].clear();
      }
      return Promise.resolve({ deletedCount: 1 }); // Simplistic
    }
  }

  // Define specific mock models
  class MockTask extends MockModel { static modelName = 'Task'; }
  class MockProject extends MockModel { static modelName = 'Project'; }
  class MockUser extends MockModel { static modelName = 'User'; }
  class MockActivity extends MockModel { static modelName = 'Activity'; }

  return {
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      close: jest.fn().mockResolvedValue(true),
    },
    model: jest.fn((name) => {
      switch (name) {
        case 'Task': return MockTask;
        case 'Project': return MockProject;
        case 'User': return MockUser;
        case 'Activity': return MockActivity;
        default: return MockModel;
      }
    }),
    Schema: class MockSchema {
      constructor() {
        this.methods = {};
        this.statics = {};
      }
      static Types = { // Define Types as a static property of MockSchema
        ObjectId: MockObjectId,
      };
      index() {
        // No-op for testing purposes
      }
      pre() {
        // No-op for testing purposes
      }
    },
    Types: {
      ObjectId: MockObjectId,
    },
    __clearMockStore: () => {
      Object.values(store).forEach(map => map.clear());
    },
  };
});

// Mock connectDB to prevent it from trying to connect to a real database
jest.mock('../src/config/database.js', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

// We need to access the mocked mongoose to get the models
const mongooseMock = jest.requireMock('mongoose');
const Task = mongooseMock.model('Task');
const Project = mongooseMock.model('Project');
const User = mongooseMock.model('User');
const Activity = mongooseMock.model('Activity'); // This is the mocked Activity model

describe('taskService assignment rules', () => {
  let project;
  let member;
  let nonMember;
  let task;

  // Access the mocked mongoose to clear store before all tests
  const { __clearMockStore } = mongooseMock;

  beforeAll(async () => {
    __clearMockStore(); // Clear all mock data before tests
    
    // Create initial data using mocked models
    member = await User.create({ name: 'Member', email: 'm@example.com', password: 'pass' });
    nonMember = await User.create({ name: 'NonMember', email: 'n@example.com', password: 'pass' });
    project = await Project.create({ name: 'Proj', key: 'PRJ', workspace: new mongooseMock.Types.ObjectId().toString(), members: [member._id] });
    task = await taskService.createTask({ title: 'Test Task', project: project._id }, member._id);
  });

  beforeEach(async () => {
    // Clear and re-populate some data for isolation between tests in the same describe block
    __clearMockStore();
    member = await User.create({ name: 'Member', email: 'm@example.com', password: 'pass' });
    nonMember = await User.create({ name: 'NonMember', email: 'n@example.com', password: 'pass' });
    project = await Project.create({ name: 'Proj', key: 'PRJ', workspace: new mongooseMock.Types.ObjectId().toString(), members: [member._id] });
    task = await taskService.createTask({ title: 'Test Task', project: project._id }, member._id);
  });

  afterAll(async () => {
    // Mocked mongoose.connection.close will be called
    mongooseMock.connection.close();
  });

  test('allows assigning to project member', async () => {
    const assignedTask = await taskService.createTask({ title: 'T1', project: project._id, assignee: member._id }, member._id);
    expect(assignedTask.assignee._id.toString()).toBe(member._id.toString());
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

  // Tests for updateTask
  describe('updateTask', () => {
    test('successfully updates task title and description', async () => {
      const updatedTask = await taskService.updateTask(task._id, { title: 'Updated Title', description: 'New Description' }, member._id);
      expect(updatedTask.title).toBe('Updated Title');
      expect(updatedTask.description).toBe('New Description');
    });

    test('successfully updates task status', async () => {
      const updatedTask = await taskService.updateTask(task._id, { status: 'in-progress' }, member._id);
      expect(updatedTask.status).toBe('in-progress');
    });

    test('successfully updates task priority', async () => {
      const updatedTask = await taskService.updateTask(task._id, { priority: 'high' }, member._id);
      expect(updatedTask.priority).toBe('high');
    });

    test('successfully reassigns task to another project member', async () => {
      const newMember = await User.create({ name: 'New Member', email: 'nm@example.com', password: 'pass' });
      project.members.push(newMember._id);
      await project.save();

      const updatedTask = await taskService.updateTask(task._id, { assignee: newMember._id }, member._id);
      expect(updatedTask.assignee._id.toString()).toBe(newMember._id.toString());
    });

    test('successfully unassigns task', async () => {
      // First assign the task
      const assignedTask = await taskService.updateTask(task._id, { assignee: member._id }, member._id);
      expect(assignedTask.assignee._id.toString()).toBe(member._id.toString());

      // Then unassign
      const unassignedTask = await taskService.updateTask(task._id, { assignee: null }, member._id);
      expect(unassignedTask.assignee).toBeNull();
    });

    test('rejects updating if user is not a project member', async () => {
      await expect(
        taskService.updateTask(task._id, { title: 'Unauthorized Update' }, nonMember._id)
      ).rejects.toThrow('Access denied to project');
    });

    test('rejects assigning to a non-project member during update', async () => {
      await expect(
        taskService.updateTask(task._id, { assignee: nonMember._id }, member._id)
      ).rejects.toThrow('Assignee must be a project member');
    });

    test('rejects update if task not found', async () => {
      const fakeTaskId = new mongoose.Types.ObjectId();
      await expect(
        taskService.updateTask(fakeTaskId, { title: 'Fake Update' }, member._id)
      ).rejects.toThrow('Task not found');
    });
  });

  // Tests for deleteTask
  describe('deleteTask', () => {
    test('successfully deletes a task', async () => {
      const taskToDelete = await taskService.createTask({ title: 'Task to Delete', project: project._id }, member._id);
      await taskService.deleteTask(taskToDelete._id, member._id);
      const foundTask = await Task.findById(taskToDelete._id);
      expect(foundTask).toBeNull();
    });

    test('rejects deletion if user is not a project member', async () => {
      const taskToDelete = await taskService.createTask({ title: 'Task to Delete 2', project: project._id }, member._id);
      await expect(
        taskService.deleteTask(taskToDelete._id, nonMember._id)
      ).rejects.toThrow('Access denied to project');
    });

    test('rejects deletion if task not found', async () => {
      const fakeTaskId = new mongoose.Types.ObjectId();
      await expect(
        taskService.deleteTask(fakeTaskId, member._id)
      ).rejects.toThrow('Task not found');
    });
  });
});
