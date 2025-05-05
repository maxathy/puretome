import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../store/authSlice';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    try {
      await dispatch(updateProfile({ name, email, bio })).unwrap();
      setSuccessMessage('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      // Error handling is managed by the Redux slice
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Your Profile</h2>

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

        <form onSubmit={handleUpdateProfile}>
          <div className='mb-4'>
            <label
              htmlFor='name'
              className='block text-gray-700 text-sm font-bold mb-2'
            >
              Full Name
            </label>
            <input
              id='name'
              className='border rounded w-full py-2 px-3'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='email'
              className='block text-gray-700 text-sm font-bold mb-2'
            >
              Email
            </label>
            <input
              id='email'
              className='border rounded w-full py-2 px-3 bg-gray-100'
              type='email'
              value={email}
              readOnly
              disabled
            />
            <p className='text-xs text-gray-500 mt-1'>
              Email cannot be changed
            </p>
          </div>

          <div className='mb-6'>
            <label
              htmlFor='bio'
              className='block text-gray-700 text-sm font-bold mb-2'
            >
              Bio
            </label>
            <textarea
              id='bio'
              className='border rounded w-full py-2 px-3 h-32'
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder='Tell us about yourself'
            />
          </div>

          <div className='flex items-center justify-between'>
            <button
              type='button'
              onClick={() => navigate('/editor')}
              className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
