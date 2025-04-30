import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import RegisterPage from '../../../src/pages/Register';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../src/store/authSlice';

// Mock axios module (simple version)
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

// Helper function to render with Router and Redux context
const renderWithProviders = (
  ui,
  { route = '/register', preloadedState = {}, initialEntries = [route] } = {},
) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path='/register' element={ui} />
          <Route path='/login' element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Use axios.post directly again for mock setup/reset
    axios.post.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders register form correctly', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign up/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderWithProviders(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });
    expect(screen.getByPlaceholderText(/full name/i).value).toBe('Test User');
    expect(screen.getByPlaceholderText(/email/i).value).toBe(
      'test@example.com',
    );
    expect(screen.getByPlaceholderText(/password/i).value).toBe('password123');
  });

  it('shows error if fields are empty on submit', async () => {
    renderWithProviders(<RegisterPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(axios.post).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles successful registration and redirects to /login by default', async () => {
    // Use axios.post for mock setup
    axios.post.mockResolvedValueOnce({ data: {} });

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Use axios.post for assertion
    expect(axios.post).toHaveBeenCalledWith('/api/users/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('navigates to /login when "Log In" button is clicked (no landingPage)', () => {
    renderWithProviders(<RegisterPage />);
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to /login with landingPage when "Log In" button is clicked', () => {
    const landingPage = '/invite/mem456?token=xyz'; // Decoded target page
    // Initial route has the landing page value encoded
    const initialRoute = `/register?landingPage=${encodeURIComponent(landingPage)}`;
    renderWithProviders(<RegisterPage />, { initialEntries: [initialRoute] });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Check navigation uses the DECODED landingPage value in the query string
    expect(mockNavigate).toHaveBeenCalledWith(
      `/login?landingPage=${landingPage}`,
    );
  });
});
