import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Task } from '@/lib/api-services';

// Mock the TaskCard component to simplify testing of KanbanBoard
jest.mock('@/components/TaskCard', () => ({
  TaskCard: jest.fn(({ task, onEdit, onDelete }) => (
    <div data-testid={`task-card-${task._id}`}>
      <span>{task.title}</span>
      <button onClick={() => onEdit(task)}>Edit {task._id}</button>
      <button onClick={() => onDelete(task._id)}>Delete {task._id}</button>
    </div>
  )),
}));

// Mock DragDropContext, Droppable, and Draggable from @hello-pangea/dnd
// This is a minimal mock to allow rendering without DND functionality
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-drop-context">{children}</div>
  ),
  Droppable: ({ children }: { children: (provided: any, snapshot: any) => React.ReactNode }) => (
    <div data-testid="droppable-context">
      {children({ innerRef: jest.fn(), droppableProps: {} }, { isDraggingOver: false })}
    </div>
  ),
  Draggable: ({ children }: { children: (provided: any, snapshot: any) => React.ReactNode }) => (
    <div data-testid="draggable-context">
      {children(
        { innerRef: jest.fn(), draggableProps: {}, dragHandleProps: {} },
        { isDragging: false }
      )}
    </div>
  ),
}));

describe('KanbanBoard', () => {
  const mockTasks: Task[] = [
    {
      _id: 'task1',
      title: 'Task 1',
      status: 'todo',
      priority: 'medium',
      project: { _id: 'proj1', name: 'Project Alpha', key: 'PA' },
      reporter: { _id: 'user1', name: 'Reporter User', email: 'reporter@example.com' },
      subtasks: [],
      labels: [],
    },
    {
      _id: 'task2',
      title: 'Task 2',
      status: 'in-progress',
      priority: 'high',
      project: { _id: 'proj1', name: 'Project Alpha', key: 'PA' },
      reporter: { _id: 'user1', name: 'Reporter User', email: 'reporter@example.com' },
      subtasks: [],
      labels: [],
    },
    {
      _id: 'task3',
      title: 'Task 3',
      status: 'done',
      priority: 'low',
      project: { _id: 'proj1', name: 'Project Alpha', key: 'PA' },
      reporter: { _id: 'user1', name: 'Reporter User', email: 'reporter@example.com' },
      subtasks: [],
      labels: [],
    },
  ];

  const defaultProps = {
    tasks: mockTasks,
    onTaskMove: jest.fn(),
    onEditTask: jest.fn(),
    onDeleteTask: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render columns and task cards', () => {
    render(<KanbanBoard {...defaultProps} />);

    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('should pass onEditTask and onDeleteTask to TaskCard', () => {
    const { getByTestId } = render(<KanbanBoard {...defaultProps} />);

    // Find a task card and simulate clicking its edit/delete buttons
    const task1Card = getByTestId('task-card-task1');
    
    within(task1Card).getByText('Edit task1').click();
    expect(defaultProps.onEditTask).toHaveBeenCalledTimes(1);
    expect(defaultProps.onEditTask).toHaveBeenCalledWith(mockTasks[0]);

    within(task1Card).getByText('Delete task1').click();
    expect(defaultProps.onDeleteTask).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDeleteTask).toHaveBeenCalledWith(mockTasks[0]._id);
  });
});
