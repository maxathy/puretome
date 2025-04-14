import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import TimelineBoard from '../components/TimelineBoard';
const mockChapters = [
  {
    id: 'ch1',
    title: 'Childhood',
    events: [
      { id: 'e1', title: 'First Day of School' },
      { id: 'e2', title: 'Family Picnic at the Lake' },
    ],
  },
  {
    id: 'ch2',
    title: 'Teen Years',
    events: [
      { id: 'e3', title: 'High School Graduation' },
      { id: 'e4', title: 'First Part-time Job' },
    ],
  },
];

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
          Welcome User! Enjoy your memoir tools.
          <TimelineBoard chapters={mockChapters} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
