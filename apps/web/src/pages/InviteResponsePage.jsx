import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Assuming you use axios for API calls

function InviteResponsePage() {
  const navigate = useNavigate();
  const { memoirId } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'idle'
  const [message, setMessage] = useState('');

  const token = searchParams.get('token'); // Assuming token is passed as a query parameter

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invite token is missing.');
    } else {
        setStatus('idle'); // Ready to respond
    }
  }, [token]);

  const handleResponse = async (accepted) => {
    if (!token) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await axios.post(`/api/memoir/${memoirId}/collaborators/respond`, {
        token: token,
        accepted: accepted,
      });

      if (response.status === 200 || response.status === 204) {
        setStatus('success');
        if (accepted) {
            const successMsg = 'Invite accepted successfully! Please log in or register to access the memoir.';
            setMessage(successMsg);

        } else {
            setMessage('Invite declined.');
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
        console.error("Invite response error:", error.response.data);
        setMessage(`Error: ${error.response.data.message || 'Failed to process invite response.'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Invite response error:", error.request);
        setMessage('Error: No response from server.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error.message);
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="invite-response-page container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Memoir Invitation</h1>

      {status === 'loading' && <p>Processing...</p>}

      {status === 'idle' && (
        <div>
          <p className="mb-4">You have been invited to collaborate on a memoir.</p>
          <button
            onClick={() => handleResponse(true)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
            disabled={status === 'loading'}
          >
            Accept Invite
          </button>
          <button
            onClick={() => handleResponse(false)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            disabled={status === 'loading'}
          >
            Decline Invite
          </button>
        </div>
      )}

      {status === 'success' && (
        <p className="text-green-600">{message}</p>
        // Optionally add a link to the memoir or dashboard
      )}

      {status === 'error' && <p className="text-red-600">{message}</p>}
    </div>
  );
}

export default InviteResponsePage; 