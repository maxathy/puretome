import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../store/authSlice'; // Make sure updateProfile is imported

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null); // State for the selected file
  const [avatarPreview, setAvatarPreview] = useState(null); // State for the preview URL
  const [updateError, setUpdateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!token) {
      navigate('/login');
    } else if (user) {
      // Populate form fields when user data is available
      setName(user.name || '');
      setBio(user.bio || '');
      // Only update the preview from the user state if a file is NOT currently staged for upload.
      // If avatarFile is set, avatarPreview should be showing the preview of that file.
      if (!avatarFile) {
        setAvatarPreview(user.avatar || null); // Set initial or updated avatar preview from user state
      }
    }
    // Add avatarFile to the dependency array. This ensures the effect runs
    // correctly in relation to whether a file is currently selected.
  }, [token, user, navigate, avatarFile]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result); // Show preview of the selected file
      };
      reader.readAsDataURL(file);
    } else {
      // Reset if no file is selected or selection is cancelled
      setAvatarFile(null);
      // When cancelled, revert preview to the one from the user state
      setAvatarPreview(user?.avatar || null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    setSuccessMessage('');

    // Prepare the data payload, including the file if selected
    const profileData = {
      name,
      bio,
      // Only include avatarFile if it's actually selected
      ...(avatarFile && { avatarFile }),
    };

    dispatch(updateProfile(profileData))
      .unwrap()
      .then((updatedData) => { // The thunk returns { user } on success
        setSuccessMessage('Profile updated successfully!');
        setAvatarFile(null); // Clear the file input state after successful upload

        // Explicitly set the preview to the new URL from the response
        // This avoids potential timing issues with useEffect and state updates
        if (updatedData.user && updatedData.user.avatar) {
          setAvatarPreview(updatedData.user.avatar);
        } else {
          // Fallback if the updated user or avatar URL isn't returned as expected
          setAvatarPreview(null);
        }
      })
      .catch((err) => {
        // Use the error from the rejected action payload
        setUpdateError(err || 'Profile update failed.');
      });
  };

  // Don't render anything until user data is loaded or redirect happens
  if (!user && token) {
    return <div>Loading profile...</div>;
  }
  // If no token (already handled by useEffect redirect, but good safety check)
  if (!token) {
    return null;
  }

  return (
    <div className='container mx-auto p-4 max-w-md'>
      <h1 className='text-2xl font-bold mb-6 text-center'>Your Profile</h1>

      {updateError && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm'>
          {updateError}
        </div>
      )}
      {successMessage && (
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm'>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleUpdate} className='space-y-4'>
        {/* Avatar Display and Input */}
        <div className='flex flex-col items-center space-y-2'>
          <label htmlFor='avatar-upload' className='cursor-pointer'>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt='Avatar Preview'
                className='w-24 h-24 rounded-full object-cover border border-gray-300'
              />
            ) : (
              <div className='w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500'>
                No Avatar
              </div>
            )}
          </label>
          <input
            id='avatar-upload'
            type='file'
            accept='image/*' // Accept only image files
            onChange={handleFileChange}
            className='hidden' // Hide the default file input
          />
          <button
            type='button'
            onClick={() => document.getElementById('avatar-upload').click()}
            className='text-sm text-blue-600 hover:underline'
          >
            Change Avatar
          </button>
        </div>

        {/* Name Input */}
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700'
          >
            Full Name
          </label>
          <input
            id='name'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            required
          />
        </div>

        {/* Email (Read-only) */}
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700'
          >
            Email
          </label>
          <input
            id='email'
            type='email'
            value={user?.email || ''}
            readOnly // Email should not be editable here
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm text-gray-500'
          />
        </div>

        {/* Bio Input */}
        <div>
          <label
            htmlFor='bio'
            className='block text-sm font-medium text-gray-700'
          >
            Bio
          </label>
          <textarea
            id='bio'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            placeholder='Tell us a little about yourself...'
          />
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          className='w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50'
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profiles'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;