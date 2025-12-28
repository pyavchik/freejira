import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmationModal from '@/components/ConfirmationModal';

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Test Title',
    message: 'Test Message',
    confirmText: 'Yes',
    cancelText: 'No',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when open', () => {
    render(<ConfirmationModal {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: defaultProps.confirmText })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: defaultProps.cancelText })).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument();
  });

  it('should call onConfirm and onClose when confirm button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: defaultProps.confirmText }));

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: defaultProps.cancelText }));

    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should display default button texts if not provided', () => {
    const { rerender } = render(<ConfirmationModal isOpen={true} onClose={jest.fn()} onConfirm={jest.fn()} title="Title" message="Message" />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});