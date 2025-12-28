import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskCard } from '@/components/TaskCard';
import { Task } from '@/lib/api-services';

// Mock Next.js Link component to prevent actual navigation during tests
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('TaskCard', () => {
  const mockTask: Task = {
    _id: 'task1',
    title: 'Test Task',
    description: 'This is a test description.',
    status: 'todo',
    priority: 'medium',
    project: { _id: 'proj1', name: 'Project Alpha', key: 'PA' },
    reporter: { _id: 'user1', name: 'Reporter User', email: 'reporter@example.com' },
    subtasks: [{ title: 'Subtask 1', completed: false }, { title: 'Subtask 2', completed: true }],
    labels: [],
    assignee: { _id: 'user2', name: 'Assignee User', email: 'assignee@example.com' },
  };

  const defaultProps = {
    task: mockTask,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render task details correctly', () => {
    render(<TaskCard {...defaultProps} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('PA')).toBeInTheDocument();
    expect(screen.getByText('1/2 subtasks')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument(); // Assignee initial
  });

  it('should display unassigned if no assignee', () => {
    const taskWithoutAssignee = { ...mockTask, assignee: undefined };
    render(<TaskCard {...defaultProps} task={taskWithoutAssignee} />);
    expect(screen.getByText('?')).toBeInTheDocument(); // Unassigned initial
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<TaskCard {...defaultProps} />);
    
    // Open the menu
    fireEvent.click(screen.getByRole('button', { name: /options/i }));
    
    // Click the edit button
    fireEvent.click(screen.getByRole('menuitem', { name: /edit/i }));
    
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<TaskCard {...defaultProps} />);

    // Open the menu
    fireEvent.click(screen.getByRole('button', { name: /options/i }));

    // Click the delete button
    fireEvent.click(screen.getByRole('menuitem', { name: /delete/i }));

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockTask._id);
  });

  it('should navigate to task detail page when title is clicked', () => {
    render(<TaskCard {...defaultProps} />);
    const taskTitleLink = screen.getByText('Test Task').closest('a');
    expect(taskTitleLink).toHaveAttribute('href', `/dashboard/tasks/${mockTask._id}`);
  });
});
