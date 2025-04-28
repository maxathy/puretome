// apps/web/src/components/CollaboratorsList.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  inviteCollaborator,
  fetchMemoir,
  removeOrRevokeCollaborator,
} from '../store/memoirSlice';

const CollaboratorsList = ({ memoir }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const dispatch = useDispatch();

  const handleInvite = async () => {
    if (!email.trim() || !memoir?._id) return;

    try {
      const resultAction = await dispatch(
        inviteCollaborator({
          memoirId: memoir._id,
          email,
          role,
        }),
      );

      if (inviteCollaborator.fulfilled.match(resultAction)) {
        setEmail('');
        dispatch(fetchMemoir(memoir._id));
      } else {
        console.error('Failed to invite collaborator:', resultAction.payload);
      }
    } catch (error) {
      console.error('Error dispatching inviteCollaborator:', error);
    }
  };

  const handleRemove = async (collab) => {
    if (!memoir?._id || !collab?._id) return;

    const status = collab.status === 'pending' || collab.inviteStatus === 'pending' ? 'pending' : 'accepted';
    const targetId = collab._id;

    if (!window.confirm(
        `Are you sure you want to ${status === 'pending' ? 'revoke the invitation for' : 'remove'} ${collab.user?.email || collab.inviteEmail}?`
    )) {
        return;
    }

    try {
      const resultAction = await dispatch(
        removeOrRevokeCollaborator({
          memoirId: memoir._id,
          targetId: targetId,
          status: status,
        }),
      );

      if (removeOrRevokeCollaborator.fulfilled.match(resultAction)) {
        dispatch(fetchMemoir(memoir._id));
      } else {
        console.error('Failed to remove/revoke collaborator:', resultAction.payload);
        alert(`Failed: ${resultAction.payload || 'Could not update collaborator'}`);
      }
    } catch (error) {
      console.error('Error dispatching removeOrRevokeCollaborator:', error);
      alert('An unexpected error occurred.');
    }
  };

  return (
    <div className='border rounded-lg p-4 my-4'>
      <h2 className='text-xl font-bold mb-4'>Collaborators</h2>

      {/* Show existing collaborators */}
      {memoir.collaborators && memoir.collaborators.length > 0 ? (
        <ul className='mb-4'>
          {memoir.collaborators.map((collab) => (
            <li
              key={collab._id}
              className='flex justify-between items-center p-2 border-b'
            >
              <div>
                <span className='font-medium'>
                  {collab.user
                    ? collab.user.email
                    : collab.inviteEmail || 'Invited User'}
                </span>
                <span className='ml-2 text-sm text-gray-500'>
                  {collab.role} (
                  {collab.status === 'pending' ||
                  collab.inviteStatus === 'pending'
                    ? 'Pending'
                    : 'Accepted'}
                  )
                </span>
              </div>
              <button
                className='text-red-500 hover:text-red-700'
                onClick={() => handleRemove(collab)}
              >
                {(collab.status === 'pending' || collab.inviteStatus === 'pending') ? 'Revoke' : 'Remove'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className='text-gray-500 mb-4'>
          No collaborators or pending invites
        </p>
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
