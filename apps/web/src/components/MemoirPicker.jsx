import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserMemoirs } from '../store/memoirSlice';
import { Card, CardContent } from './ui/card';
import MemoirForm from './MemoirForm';

/**
 * MemoirPicker Component
 * Fetches (via Redux) and displays a list of memoirs belonging to the logged-in user.
 * Allows the user to select a memoir to navigate to the editor or create a new one.
 *
 * @component
 * @returns {JSX.Element} List of clickable memoir cards or the MemoirForm
 */
const MemoirPicker = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Select state from Redux store
  const {
    userMemoirs,
    userMemoirsLoading: loading,
    userMemoirsError: error,
  } = useSelector((state) => state.memoir);

  // Fetch memoirs on component mount
  useEffect(() => {
    dispatch(fetchUserMemoirs());
  }, [dispatch]);

  const handleSelectMemoir = (memoirId) => {
    navigate(`/editor/${memoirId}`);
  };

  if (loading) {
    return <div className='p-6 text-center'>Loading your memoirs...</div>;
  }

  if (error) {
    // Displaying the actual error message from Redux
    return <div className='p-6 text-center text-red-600'>Error: {error}</div>;
  }

  if (!userMemoirs || userMemoirs.length === 0) {
    return (
        <div className='p-6 text-center'>
            <p>You haven't created any memoirs yet.</p>
            {/* Optional: Add a button/link to create a new one */}
            <button 
                onClick={() => navigate('/create')} // Route to your create memoir page/component
                className='mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
            >
                Create New Memoir
            </button>
        </div>
    );
  }

  // If showCreateForm is true, render the form instead of the picker
  if (showCreateForm) {
    // Optionally pass a function to hide the form on cancel/back
    // e.g., <MemoirForm onCancel={() => setShowCreateForm(false)} />
    return <MemoirForm />;
  }

  return (
    <div className='p-6'>
      <h2 className='text-xl font-semibold mb-4'>Select a Memoir</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {userMemoirs.map((memoir) => (
          <Card
            key={memoir._id}
            onClick={() => handleSelectMemoir(memoir._id)}
            className='cursor-pointer' // Make it visually clear it's clickable
            variant='default' // Or use other variants like 'outlined'
          >
            <CardContent>
              <h3 className='text-lg font-bold mb-1'>{memoir.title}</h3>
              {/* Optionally display description or other details */}
              {memoir.content && (
                <p className='text-gray-600 text-sm mb-2 line-clamp-2'>
                  {memoir.content}
                </p>
              )}
              <p className='text-gray-500 text-xs mt-2'>Status: {memoir.status}</p>
            </CardContent>
          </Card>
        ))}

        {/* Add New Memoir Card */}
        <Card
          key="add-new"
          onClick={() => setShowCreateForm(true)} // Set state to show the form
          className='cursor-pointer border-dashed border-gray-400 flex items-center justify-center h-full min-h-[150px] hover:border-gray-500 hover:bg-gray-50' // Style for add new card
          variant='muted' // Use a different variant maybe?
        >
          <CardContent className="text-center">
            <span className="text-2xl font-bold text-gray-500">+</span>
            <p className="text-gray-600 mt-1">Add New Memoir</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemoirPicker;
