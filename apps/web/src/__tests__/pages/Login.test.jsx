import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import LoginPage from '../../../src/pages/Login';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('Login Page', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    window.localStorage.clear();
    mockLocation.href = '';
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('handles successful login', async () => {
    // Mock successful login response
    axios.post.mockResolvedValueOnce({
      data: { token: 'fake-jwt-token', user: { email: 'test@example.com' } },
    });

    render(<LoginPage />);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Check axios called correctly
    expect(axios.post).toHaveBeenCalledWith('/api/users/login', {
      email: 'test@example.com',
      password: 'password123',
    });

    // Wait for async operations
    await waitFor(() => {
      // Check localStorage and redirect
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'token',
        'fake-jwt-token',
      );
      expect(mockLocation.href).toBe('/editor');
    });
  });

  it('handles login failure', async () => {
    // Mock failed login
    axios.post.mockRejectedValueOnce(new Error('Login failed'));

    // Spy on window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<LoginPage />);

    // Fill and submit form
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Wait for async operations
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Login failed');
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      expect(mockLocation.href).not.toBe('/editor');
    });

    alertSpy.mockRestore();
  });
});
