import userReducer, { setUser, clearUser } from '../../store/userSlice';

describe('userSlice', () => {
  const initialState = {
    email: '',
    role: '',
  };

  it('should return the initial state', () => {
    expect(userReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle setUser action', () => {
    const userData = {
      email: 'test@example.com',
      role: 'author',
    };

    const nextState = userReducer(initialState, setUser(userData));

    expect(nextState).toEqual(userData);
  });

  it('should handle clearUser action', () => {
    const filledState = {
      email: 'test@example.com',
      role: 'author',
    };

    const nextState = userReducer(filledState, clearUser());

    expect(nextState).toEqual(initialState);
  });

  it('should handle partial user updates', () => {
    const initialFilledState = {
      email: 'test@example.com',
      role: 'author',
    };

    // Update only the role
    const nextState = userReducer(
      initialFilledState,
      setUser({ email: 'test@example.com', role: 'admin' }),
    );

    expect(nextState).toEqual({
      email: 'test@example.com',
      role: 'admin',
    });
  });
});
