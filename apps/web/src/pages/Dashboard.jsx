import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import TimelineBoard from '../components/TimelineBoard';

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

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
        <div className='text-blue-700'>
          <TimelineBoard memoirId='680295289478138c20585b03' />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
