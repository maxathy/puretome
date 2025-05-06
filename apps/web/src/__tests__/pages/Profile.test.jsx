import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ProfilePage from '../../pages/Profile';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/authSlice';

// Mock axios module
vi.mock('axios');

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render with providers
const renderWithProviders = (ui, { preloadedState = {} } = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  );
};

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('redirects to login if user is not authenticated', () => {
    renderWithProviders(<ProfilePage />);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders profile form with user data', () => {
    const user = {
      name: 'Test User',
      email: 'test@example.com',
      bio: 'Test bio',
    };

    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        auth: { user, token: 'fake-token', loading: false, error: null },
      },
    });

    expect(screen.getByLabelText(/full name/i)).toHaveValue('Test User');
    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/bio/i)).toHaveValue('Test bio');
  });

  it('handles profile update successfully', async () => {
    const user = {
      name: 'Test User',
      email: 'test@example.com',
      bio: 'Test bio',
    };

    axios.put.mockResolvedValueOnce({
      data: {
        user: { ...user, name: 'Updated Name', bio: 'Updated bio' },
      },
    });

    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        auth: { user, token: 'fake-token', loading: false, error: null },
      },
    });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Updated Name' },
    });

    fireEvent.change(screen.getByLabelText(/bio/i), {
      target: { value: 'Updated bio' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update profile/i }));

    const [url, data] = axios.put.mock.calls[0];
    expect(url).toBe('/api/users/profile');
    expect(data instanceof FormData).toBe(true);
    const entries = Array.from(data.entries());
    expect(entries).toEqual(
      expect.arrayContaining([
        ['name', 'Updated Name'],
        ['bio', 'Updated bio'],
      ])
    );

    await waitFor(() => {
      expect(
        screen.getByText(/profile updated successfully/i),
      ).toBeInTheDocument();
    });
  });

  it('handles update failure and displays error message', async () => {
    const user = {
      name: 'Test User',
      email: 'test@example.com',
      bio: 'Test bio',
    };
    const errorMessage = 'Profile update failed';

    axios.put.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        auth: { user, token: 'fake-token', loading: false, error: null },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /update profile/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
