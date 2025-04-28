import React, { useState, useEffect } from 'react';
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux'; // Import useSelector

function InviteResponsePage() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const { memoirId } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'processing_auth', 'success', 'error', 'idle'
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  // Get auth status from Redux store
  const { email: userEmail } = useSelector((state) => state.user);
  const isLoggedIn = !!userEmail;

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invite token is missing.');
      return;
    }

    // Check login status
    if (!isLoggedIn) {
      // Construct the landingPage URL (current path + search params)
      const landingPage = encodeURIComponent(location.pathname + location.search);
      // Redirect to login page
      navigate(`/login?landingPage=${landingPage}`, { replace: true });
    } else {
      // User is logged in, proceed to show buttons
      setStatus('idle'); 
    }
    // Rerun effect if login status changes (e.g., after redirect and login)
  }, [token, isLoggedIn, navigate, location]);

  const handleResponse = async (accepted) => {
    if (!token) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await axios.post(
        `/api/memoir/${memoirId}/collaborators/respond`,
        {
          token: token,
          accepted: accepted,
        },
      );

      if (response.status === 200 || response.status === 204) {
        if (accepted) {
          // Redirect to the memoir editor page on successful accept
          navigate(`/editor/${memoirId}`);
        } else {
          setMessage('Invite declined.');
          setStatus('success'); // Keep status for declined message
        }
      } else {
        // Handle unexpected success statuses if necessary
        setStatus('error');
        setMessage(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      setStatus('error');
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Invite response error:', error.response.data);
        setMessage(
          `Error: ${error.response.data.message || 'Failed to process invite response.'}`,
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Invite response error:', error.request);
        setMessage('Error: No response from server.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error.message);
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className='invite-response-page container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Memoir Invitation</h1>

      {/* Show loading indicator while checking auth or processing API */}
      {(status === 'loading' || status === 'processing_auth') && <p>Processing...</p>}

      {/* Only show buttons if logged in and ready */}
      {isLoggedIn && status === 'idle' && (
        <div>
          <p className='mb-4'>
            You have been invited to collaborate on a memoir.
          </p>
          <button
            onClick={() => handleResponse(true)}
            className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2'
            disabled={status === 'loading'}
          >
            Accept Invite
          </button>
          <button
            onClick={() => handleResponse(false)}
            className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
            disabled={status === 'loading'}
          >
            Decline Invite
          </button>
        </div>
      )}

      {/* Show success message ONLY for declined status now */}
      {status === 'success' && !message.includes('accepted') && (
        <p className='text-green-600'>{message}</p>
      )}

      {status === 'error' && <p className='text-red-600'>{message}</p>}
    </div>
  );
}

export default InviteResponsePage;
