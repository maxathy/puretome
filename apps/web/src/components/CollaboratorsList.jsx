// apps/web/src/components/CollaboratorsList.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { inviteCollaborator } from '../store/memoirSlice';

const CollaboratorsList = ({ memoir }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const dispatch = useDispatch();

  const handleInvite = () => {
    if (!email.trim()) return;

    dispatch(
      inviteCollaborator({
        memoirId: memoir._id,
        email,
        role,
      }),
    );

    // Clear form
    setEmail('');
  };

  return (
    <div className='border rounded-lg p-4 my-4'>
      <h2 className='text-xl font-bold mb-4'>Collaborators</h2>

      {/* Show existing collaborators */}
      {memoir.collaborators && memoir.collaborators.length > 0 ? (
        <ul className='mb-4'>
          {memoir.collaborators.map((collab, index) => (
            <li
              key={index}
              className='flex justify-between items-center p-2 border-b'
            >
              <div>
                <span className='font-medium'>
                  {collab.user ? collab.user.email : collab.inviteEmail}
                </span>
                <span className='ml-2 text-sm text-gray-500'>
                  {collab.role} ({collab.inviteStatus})
                </span>
              </div>
              <button
                className='text-red-500 hover:text-red-700'
                onClick={() => {
                  /* TODO: Remove collaborator function */
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className='text-gray-500 mb-4'>No collaborators yet</p>
      )}

      {/* Invite form */}
      <div className='flex flex-col space-y-2'>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Collaborator's email"
          className='border p-2 rounded'
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className='border p-2 rounded'
        >
          <option value='viewer'>Viewer (can only read)</option>
          <option value='editor'>Editor (can suggest edits)</option>
          <option value='validator'>Validator (can approve events)</option>
        </select>

        <button
          onClick={handleInvite}
          className='bg-blue-500 text-white p-2 rounded hover:bg-blue-600'
        >
          Send Invitation
        </button>
      </div>
    </div>
  );
};

export default CollaboratorsList;
