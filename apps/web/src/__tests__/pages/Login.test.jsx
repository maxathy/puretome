import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import LoginPage from '../../../src/pages/Login';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../../../src/store/userSlice';

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
const renderWithProviders = (ui, { route = '/login', preloadedState = {}, initialEntries = [route] } = {}) => {
  const store = configureStore({ reducer: { user: userReducer }, preloadedState });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
         <Routes>
            <Route path="/login" element={ui} />
            <Route path="/editor" element={<div>Editor Page</div>} />
            <Route path="/register" element={<div>Register Page</div>} />
            <Route path="/invite/:memoirId" element={<div>Invite Page</div>} /> 
         </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders login form correctly', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    expect(screen.getByPlaceholderText(/email/i).value).toBe('test@example.com');
    expect(screen.getByPlaceholderText(/password/i).value).toBe('password123');
  });



  it('handles login failure and displays error message', async () => {
    const errorMessage = 'Invalid credentials mate!';
    axios.post.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
  
  it('navigates to register page when sign up button is clicked', () => {
      renderWithProviders(<LoginPage />);
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});
