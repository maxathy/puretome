import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/authSlice';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { loading, error } = useSelector((state) => state.auth);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    dispatch(register({ name, email, password }))
      .unwrap()
      .then(() => {
        setSuccessMessage('Registration successful! Redirecting...');
        const landingPage = searchParams.get('landingPage');
        const editorPath = landingPage
          ? decodeURIComponent(landingPage)
          : '/editor';
        setTimeout(() => {
          navigate(editorPath, { replace: true });
        }, 1200);
      })
      .catch(() => {});
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded shadow-md w-80'>
        <h2 className='text-xl font-bold mb-4 text-center'>Register</h2>
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm'>
            {error}
          </div>
        )}
        {successMessage && (
          <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm'>
            {successMessage}
          </div>
        )}
        <form onSubmit={handleRegister}>
          <fieldset disabled={!!successMessage || loading}>
            <input
              className='border mb-2 p-2 w-full'
              type='text'
              placeholder='Full Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              minLength={6}
            />
            <button
              type='submit'
              className='bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700 transition'
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
          </fieldset>
        </form>
        <p className='mt-4 text-center text-sm'>
          Already have an account?{' '}
          <button
            onClick={() => {
              const landingPage = searchParams.get('landingPage');
              const loginPath = landingPage
                ? `/login?landingPage=${landingPage}`
                : '/login';
              navigate(loginPath);
            }}
            className='text-blue-600 hover:underline'
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
