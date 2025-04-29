import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/authSlice';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(login({ email, password }))
      .unwrap()
      .then(() => {
        const landingPage = searchParams.get('landingPage');
        if (landingPage) {
          navigate(decodeURIComponent(landingPage), { replace: true });
        } else {
          navigate('/editor', { replace: true });
        }
      })
      .catch(() => {});
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded shadow-md w-80'>
        <h2 className='text-xl font-bold mb-4 text-center'>Login</h2>
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm'>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <input
            className='border mb-2 p-2 w-full'
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className='border mb-4 p-2 w-full'
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type='submit'
            className='bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition'
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className='mt-4 text-center text-sm'>
          Don't have an account?{' '}
          <button
            onClick={() => {
              const landingPage = searchParams.get('landingPage');
              const registerPath = landingPage
                ? `/register?landingPage=${landingPage}`
                : '/register';
              navigate(registerPath);
            }}
            className='text-blue-600 hover:underline'
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
