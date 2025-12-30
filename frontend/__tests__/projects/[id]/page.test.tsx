import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectDetailPage from '@/app/dashboard/projects/[id]/page';
import { useParams } from 'next/navigation';
import { projectService, taskService, usersService, userStoryService, epicService } from '@/lib/api-services';
import { KanbanBoard } from '@/components/KanbanBoard';
import EditTaskModal from '@/components/EditTaskModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import toast from 'react-hot-toast';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

// Mock API services
jest.mock('@/lib/api-services', () => ({
  projectService: {
    getById: jest.fn(),
  },
  taskService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updatePositions: jest.fn(),
  },
  usersService: {
    getAll: jest.fn(),
  },
  userStoryService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updatePositions: jest.fn(),
  },
  epicService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updatePositions: jest.fn(),
  },
}));

// Mock child components
jest.mock('@/components/KanbanBoard', () => ({
  KanbanBoard: jest.fn(({ tasks, onEditTask, onDeleteTask }) => (
    <div data-testid="kanban-board">
      {tasks.map((task) => (
        <div key={task._id} data-testid={`kanban-task-${task._id}`}>
          <span>{task.title}</span>
          <button onClick={() => onEditTask(task)}>Edit {task._id}</button>
          <button onClick={() => onDeleteTask(task._id)}>Delete {task._id}</button>
        </div>
      ))}
    </div>
  )),
}));

jest.mock('@/components/EditTaskModal', () => ({
  __esModule: true,
  default: jest.fn(({ isOpen, onClose, onSave, task }) =>
    isOpen ? (
      <div data-testid="edit-task-modal">
        <h2>Edit Task</h2>
        <input data-testid="edit-title" value={task?.title || ''} onChange={(e) => {}} />
        <textarea data-testid="edit-description" value={task?.description || ''} onChange={(e) => {}} />
        <button onClick={() => onSave(task?._id || '', { title: 'Updated' })}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
  ),
}));

jest.mock('@/components/ConfirmationModal', () => ({
  __esModule: true,
  default: jest.fn(({ isOpen, onClose, onConfirm, title, message }) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
  ),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('ProjectDetailPage', () => {
  const queryClient = new QueryClient();
  const projectId = 'project1';
  const mockProject = {
    _id: projectId,
    name: 'Test Project',
    key: 'TP',
    workspace: { _id: 'ws1', name: 'Test Workspace' },
    members: [{ _id: 'user1', name: 'Test User', email: 'test@example.com' }],
  };
  const mockTasks = [
    {
      _id: 'task1',
      title: 'Task 1',
      status: 'todo',
      priority: 'medium',
      project: mockProject,
      reporter: mockProject.members[0],
      subtasks: [],
      labels: [],
    },
    {
      _id: 'task2',
      title: 'Task 2',
      status: 'in-progress',
      priority: 'high',
      project: mockProject,
      reporter: mockProject.members[0],
      subtasks: [],
      labels: [],
    },
  ];

  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({ id: projectId });
    (projectService.getById as jest.Mock).mockResolvedValue(mockProject);
    (taskService.getAll as jest.Mock).mockResolvedValue(mockTasks);
    (taskService.create as jest.Mock).mockResolvedValue(mockTasks[0]);
    (taskService.update as jest.Mock).mockResolvedValue(mockTasks[0]);
    (taskService.delete as jest.Mock).mockResolvedValue(undefined);
    (taskService.updatePositions as jest.Mock).mockResolvedValue(mockTasks);
    (usersService.getAll as jest.Mock).mockResolvedValue(mockProject.members);
    (userStoryService.getAll as jest.Mock).mockResolvedValue([]);
    (epicService.getAll as jest.Mock).mockResolvedValue([]);
    
    // Mock other services used in the page to prevent errors
    (KanbanBoard as jest.Mock).mockImplementation(
      ({ tasks, onTaskMove, onEditTask, onDeleteTask }) => (
        <div data-testid="kanban-board-mock">
          {tasks.map((task) => (
            <div key={task._id} data-testid={`kanban-task-mock-${task._id}`}>
              <span>{task.title}</span>
              <button onClick={() => onEditTask(task)}>Edit {task._id}</button>
              <button onClick={() => onDeleteTask(task._id)}>Delete {task._id}</button>
            </div>
          ))}
        </div>
      )
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  const renderWithClient = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  it('should render project details and KanbanBoard', async () => {
    renderWithClient(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText(/TP • 2 tasks • 0 user stories/)).toBeInTheDocument();
      expect(screen.getByTestId('kanban-board-mock')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
  });

  it('should open EditTaskModal when Edit button is clicked', async () => {
    renderWithClient(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit task1'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-task-modal')).toBeInTheDocument();
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });
  });

  it('should call update task service and close modal on save', async () => {
    renderWithClient(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit task1'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-task-modal')).toBeInTheDocument();
    });
    
    // Simulate typing in the mock modal inputs
    fireEvent.change(screen.getByTestId('edit-title'), { target: { value: 'Updated Title' } });
    fireEvent.change(screen.getByTestId('edit-description'), { target: { value: 'Updated Description' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(taskService.update).toHaveBeenCalledTimes(1);
      expect(taskService.update).toHaveBeenCalledWith('task1', { title: 'Updated' });
      expect(toast.success).toHaveBeenCalledWith('Task updated successfully!');
      expect(screen.queryByTestId('edit-task-modal')).not.toBeInTheDocument();
    });
  });

  it('should open ConfirmationModal when Delete button is clicked', async () => {
    renderWithClient(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete task1'));

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
      expect(screen.getByText('Delete Task')).toBeInTheDocument();
    });
  });

  it('should call delete task service and close modal on confirm', async () => {
    renderWithClient(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete task1'));

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(taskService.delete).toHaveBeenCalledTimes(1);
      expect(taskService.delete).toHaveBeenCalledWith('task1');
      expect(toast.success).toHaveBeenCalledWith('Task deleted successfully!');
      expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });
  });
});
