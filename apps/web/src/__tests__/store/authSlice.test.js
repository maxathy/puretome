import authReducer, { login, logout, register } from '../../store/authSlice';

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

describe('authSlice', () => {
  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle login.pending', () => {
    const action = { type: login.pending.type };
    const state = authReducer(initialState, action);
    expect(state).toEqual({ ...initialState, loading: true, error: null });
  });

  it('should handle login.fulfilled', () => {
    const action = {
      type: login.fulfilled.type,
      payload: { user: { email: 'test@example.com', role: 'author' }, token: 'abc' },
    };
    const state = authReducer({ ...initialState, loading: true }, action);
    expect(state).toEqual({
      ...initialState,
      loading: false,
      user: { email: 'test@example.com', role: 'author' },
      token: 'abc',
      error: null,
    });
  });

  it('should handle login.rejected', () => {
    const action = { type: login.rejected.type, payload: 'Login failed' };
    const state = authReducer({ ...initialState, loading: true }, action);
    expect(state).toEqual({ ...initialState, loading: false, error: 'Login failed' });
  });

  it('should handle logout.fulfilled', () => {
    const action = { type: logout.fulfilled.type };
    const prevState = {
      ...initialState,
      user: { email: 'test@example.com', role: 'author' },
      token: 'abc',
      error: 'Some error',
    };
    const state = authReducer(prevState, action);
    expect(state).toEqual({ ...initialState });
  });

  it('should handle register.pending', () => {
    const action = { type: register.pending.type };
    const state = authReducer(initialState, action);
    expect(state).toEqual({ ...initialState, loading: true, error: null });
  });

  it('should handle register.fulfilled', () => {
    const action = {
      type: register.fulfilled.type,
      payload: { user: { email: 'test2@example.com', role: 'admin' }, token: 'def' },
    };
    const state = authReducer({ ...initialState, loading: true }, action);
    expect(state).toEqual({
      ...initialState,
      loading: false,
      user: { email: 'test2@example.com', role: 'admin' },
      token: 'def',
      error: null,
    });
  });

  it('should handle register.rejected', () => {
    const action = { type: register.rejected.type, payload: 'Registration failed' };
    const state = authReducer({ ...initialState, loading: true }, action);
    expect(state).toEqual({ ...initialState, loading: false, error: 'Registration failed' });
  });
});
