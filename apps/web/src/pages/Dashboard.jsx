import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import TimelineBoard from '../components/TimelineBoard';

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const { memoirId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    const decoded = jwtDecode(token);
    setRole(decoded.role);
  }, [navigate]);

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
      {role === 'admin' ? (
        <div className='text-green-700'>
          Welcome Admin! You have full access.
        </div>
      ) : (
        <div>
          {/* Pass the memoirId from URL params to TimelineBoard */}
          {memoirId ? (
            <TimelineBoard memoirId={memoirId} />
          ) : (
            <div>Please select a memoir to view</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
