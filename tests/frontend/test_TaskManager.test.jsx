import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskManager from '../../src/components/TaskManager';

// Mock fetch globally
global.fetch = jest.fn();

describe('TaskManager Component', () => {
  beforeEach(() => {
    // Reset fetch mocks
    fetch.mockClear();
  });

  test('renders task creation form', () => {
    render(<TaskManager />);
    
    expect(screen.getByPlaceholderText('Task Title')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  test('creates a new task', async () => {
    // Mock successful task creation
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        difficulty: 2,
        status: false
      })
    });

    render(<TaskManager />);
    
    // Fill out task form
    fireEvent.change(screen.getByPlaceholderText('Task Title'), {
      target: { value: 'Test Task' }
    });
    fireEvent.change(screen.getByPlaceholderText('Description (optional)'), {
      target: { value: 'Test Description' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create Task'));
    
    // Wait for task to be added
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  test('handles task deletion', async () => {
    // Mock task fetch and deletion
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          difficulty: 2,
          status: false
        }])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Task deleted successfully' })
      });

    render(<TaskManager />);
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Wait for task to be deleted
    await waitFor(() => {
      expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
    });
  });
});