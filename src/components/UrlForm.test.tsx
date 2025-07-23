import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UrlForm from './UrlForm';

describe('UrlForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('should render form elements', () => {
    render(<UrlForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByPlaceholderText(/Enter website URL/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze/i })).toBeInTheDocument();
  });

  test('should call onSubmit with valid URL', async () => {
    const user = userEvent.setup();
    render(<UrlForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText(/Enter website URL/i);
    const button = screen.getByRole('button', { name: /Analyze/i });

    await user.type(input, 'https://example.com');
    await user.click(button);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('https://example.com/');
    });
  });

  test('should normalize URL without protocol', async () => {
    const user = userEvent.setup();
    render(<UrlForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText(/Enter website URL/i);
    const button = screen.getByRole('button', { name: /Analyze/i });

    await user.type(input, 'example.com');
    await user.click(button);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('https://example.com/');
    });
  });

  test('should show error for invalid URL', async () => {
    const user = userEvent.setup();
    render(<UrlForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText(/Enter website URL/i);
    const button = screen.getByRole('button', { name: /Analyze/i });

    await user.type(input, 'not a url');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/URL cannot contain spaces/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  test('should disable button for empty URL', () => {
    render(<UrlForm onSubmit={mockOnSubmit} isLoading={false} />);

    const button = screen.getByRole('button', { name: /Analyze/i });

    // Button should be disabled when input is empty
    expect(button).toBeDisabled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should disable form when loading', () => {
    render(<UrlForm onSubmit={mockOnSubmit} isLoading={true} />);

    const input = screen.getByPlaceholderText(/Enter website URL/i);
    const button = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  test('should clear error when typing', async () => {
    const user = userEvent.setup();
    render(<UrlForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText(/Enter website URL/i);
    const button = screen.getByRole('button', { name: /Analyze/i });

    // First submit with invalid URL
    await user.type(input, 'invalid');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Invalid domain format|domain extension/i)).toBeInTheDocument();
    });

    // Clear and type valid URL
    await user.clear(input);
    await user.type(input, 'https://example.com');

    // Error should be cleared
    expect(screen.queryByText(/Please enter a valid URL/i)).not.toBeInTheDocument();
  });

  test('should handle Enter key submission', async () => {
    const user = userEvent.setup();
    render(<UrlForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText(/Enter website URL/i);

    await user.type(input, 'https://example.com{enter}');

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('https://example.com/');
    });
  });
});
