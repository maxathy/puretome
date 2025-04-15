import React, { useState } from 'react';
import axios from 'axios';


const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await axios.post('/api/users/register', { email, password });
      alert('Registration successful! Please log in.');
      window.location.href = '/';
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded shadow-md w-80'>
        <h2 className='text-xl font-bold mb-4'>Register</h2>
        <input
          className='border mb-2 p-2 w-full'
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className='border mb-4 p-2 w-full'
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className='bg-green-600 text-white px-4 py-2 rounded w-full'
          onClick={handleRegister}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
