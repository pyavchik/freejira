// Test for epic service authorization
import mongoose from 'mongoose';
import Epic from '../src/models/Epic.js';
import Project from '../src/models/Project.js';
import User from '../src/models/User.js';
import * as epicService from '../src/services/epicService.js';

// Mock the database models
jest.mock('../src/models/Epic.js');
jest.mock('../src/models/Project.js');
jest.mock('../src/models/User.js');

describe('epicService.updateEpicPositions', () => {
  let mockUserId;
  let mockEpic1, mockEpic2;
  let mockProject;

  beforeEach(() => {
    mockUserId = new mongoose.Types.ObjectId();
    const otherUserId = new mongoose.Types.ObjectId();
    
    mockProject = {
      _id: new mongoose.Types.ObjectId(),
      members: [mockUserId, otherUserId],
      name: 'Test Project',
      key: 'TP'
    };

    mockEpic1 = {
      _id: new mongoose.Types.ObjectId(),
      project: mockProject,
      name: 'Epic 1',
      status: 'todo'
    };

    mockEpic2 = {
      _id: new mongoose.Types.ObjectId(),
      project: mockProject,
      name: 'Epic 2',
      status: 'in-progress'
    };

    // Mock the Epic.find method with populate support
    const mockFindWithPopulate = {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { ...mockEpic1, project: mockProject },
        { ...mockEpic2, project: mockProject }
      ])
    };
    Epic.find.mockReturnValue(mockFindWithPopulate);
    
    // Mock the Epic.findByIdAndUpdate method
    Epic.findByIdAndUpdate.mockResolvedValue({});
    
    // Mock the final Epic.find for return
    const mockFinalFind = {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { ...mockEpic1, position: 0, status: 'todo', project: mockProject },
        { ...mockEpic2, position: 1, status: 'in-progress', project: mockProject }
      ])
    };
    Epic.find.mockReturnValueOnce(mockFindWithPopulate).mockReturnValueOnce(mockFinalFind);
  });

  test('should update epic positions when user has access', async () => {
    const epicsToUpdate = [
      { _id: mockEpic1._id, status: 'todo' },
      { _id: mockEpic2._id, status: 'in-progress' }
    ];

    const result = await epicService.updateEpicPositions(epicsToUpdate, mockUserId);
    
    expect(result.length).toBe(2);
    expect(Epic.findByIdAndUpdate).toHaveBeenCalledTimes(2);
    expect(Epic.findByIdAndUpdate).toHaveBeenCalledWith(
      mockEpic1._id,
      { position: 0, status: 'todo' }
    );
    expect(Epic.findByIdAndUpdate).toHaveBeenCalledWith(
      mockEpic2._id,
      { position: 1, status: 'in-progress' }
    );
  });

  test('should throw error when user does not have access', async () => {
    const unauthorizedUserId = new mongoose.Types.ObjectId();
    const epicsToUpdate = [
      { _id: mockEpic1._id, status: 'todo' }
    ];

    // Mock project without the unauthorized user
    const unauthorizedProject = {
      _id: mockProject._id,
      members: [new mongoose.Types.ObjectId()], // Different user
      name: 'Test Project',
      key: 'TP'
    };

    const unauthorizedEpic = {
      _id: mockEpic1._id,
      project: unauthorizedProject,
      name: 'Epic 1',
      status: 'todo'
    };

    const mockUnauthorizedFind = {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([unauthorizedEpic])
    };
    Epic.find.mockReturnValueOnce(mockUnauthorizedFind);

    await expect(
      epicService.updateEpicPositions(epicsToUpdate, unauthorizedUserId)
    ).rejects.toThrow('Access denied to update epic positions');
  });
});