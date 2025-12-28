import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditTaskModal from '@/components/EditTaskModal';
import { Task } from '@/lib/api-services';

describe('EditTaskModal', () => {
  const mockTask: Task = {
    _id: '1',
    title: 'Original Title',
    description: 'Original Description',
    status: 'todo',
    priority: 'medium',
    project: { _id: 'proj1', name: 'Project 1', key: 'P1' },
    reporter: { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
    subtasks: [],
    labels: [],
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    task: mockTask,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with task data when open', () => {
    render(<EditTaskModal {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Edit Task' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue(mockTask.title);
    expect(screen.getByLabelText('Description')).toHaveValue(mockTask.description);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<EditTaskModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('heading', { name: 'Edit Task' })).not.toBeInTheDocument();
  });

  it('should update title and description on input change', () => {
    render(<EditTaskModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const descriptionTextarea = screen.getByLabelText('Description');

    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'New Description' } });

    expect(titleInput).toHaveValue('New Title');
    expect(descriptionTextarea).toHaveValue('New Description');
  });

  it('should call onSave with updated data when Save button is clicked', async () => {
    render(<EditTaskModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const descriptionTextarea = screen.getByLabelText('Description');

    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Updated Description' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSave).toHaveBeenCalledWith(mockTask._id, {
        title: 'Updated Title',
        description: 'Updated Description',
      });
    });
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<EditTaskModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('should initialize with empty title/description if task is null', () => {
    render(<EditTaskModal {...defaultProps} task={null} />);
    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
  });
});