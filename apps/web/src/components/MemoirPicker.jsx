import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserMemoirs, deleteMemoir } from '../store/memoirSlice';
import { Card, CardContent } from './ui/card';
import MemoirForm from './MemoirForm';
import Modal from './ui/modal';
import { Trash2 } from 'lucide-react';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memoirToDelete, setMemoirToDelete] = useState(null);

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

  // Function to open the delete confirmation modal
  const openDeleteModal = (e, memoir) => {
    e.stopPropagation();
    setMemoirToDelete(memoir);
    setIsDeleteModalOpen(true);
  };

  // Function to close the delete confirmation modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setMemoirToDelete(null);
  };

  // Function to handle the actual deletion
  const handleDeleteConfirm = () => {
    if (!memoirToDelete) return;
    dispatch(deleteMemoir(memoirToDelete._id));
    closeDeleteModal();
  };

  if (loading) {
    return <div className='p-6 text-center'>Loading your memoirs...</div>;
  }

  if (error) {
    // Displaying the actual error message from Redux
    return <div className='p-6 text-center text-red-600'>Error: {error}</div>;
  }

  if (!userMemoirs || userMemoirs.length === 0) {
    // setShowCreateForm(true);
    return (<MemoirForm />);
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
            className='cursor-pointer relative'
            variant='default'
          >
            <CardContent className='pt-6 pb-4'>
              <h3 className='text-lg font-bold mb-1'>{memoir.title}</h3>
              {memoir.content && (
                <p className='text-gray-600 text-sm mb-2 line-clamp-2'>
                  {memoir.content}
                </p>
              )}
              <p className='text-gray-500 text-xs mt-2'>
                Status: {memoir.status}
              </p>

              {/* Delete Button */}
              <button
                onClick={(e) => openDeleteModal(e, memoir)}
                className='absolute top-2 right-2 m-2 text-gray-400 hover:text-red-600 p-3 rounded-full hover:bg-red-100 transition-colors'
                aria-label={`Delete memoir ${memoir.title}`}
              >
                <Trash2 size={18} />
              </button>
            </CardContent>
          </Card>
        ))}

        {/* Add New Memoir Card */}
        <Card
          key='add-new'
          onClick={() => setShowCreateForm(true)}
          className='cursor-pointer border-dashed border-gray-400 flex items-center justify-center h-full min-h-[150px] hover:border-gray-500 hover:bg-gray-50'
          variant='muted'
        >
          <CardContent className='text-center'>
            <span className='text-2xl font-bold text-gray-500'>+</span>
            <p className='text-gray-600 mt-1'>Add New Memoir</p>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title='Confirm Deletion'
      >
        <p className='mb-6'>
          Deleting this memoir will also delete all chapters associated with
          this storyline.{' '}
          <strong className='text-red-500'>This action is irreversible.</strong>
        </p>
        <div className='flex justify-end space-x-2'>
          <button
            onClick={closeDeleteModal}
            className='px-4 py-2 text-sm text-gray-700 border rounded hover:bg-gray-100'
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            className='px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700'
          >
            Confirm Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MemoirPicker;
