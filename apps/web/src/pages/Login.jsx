import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/api/users/login', { email, password });
      const token = res.data.token;
      const userData = res.data.user;

      localStorage.setItem('token', token);

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch(setUser({ email: userData.email, role: userData.role }));

      const landingPage = searchParams.get('landingPage');

      if (landingPage) {
        navigate(decodeURIComponent(landingPage), { replace: true });
      } else {
        navigate('/editor', { replace: true });
      }
    } catch (err) {
      console.error('Login failed:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
      setError(errorMsg);
    }
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
          >
            Log In
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
