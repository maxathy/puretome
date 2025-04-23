import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import TimelineBoard from '../components/TimelineBoard';
import MemoirPicker from '../components/MemoirPicker';
const Editor = () => {
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


          {/* Pass the memoirId from URL params to TimelineBoard */}
          {memoirId ? (
            <TimelineBoard memoirId={memoirId} />
          ) : (
            <MemoirPicker />
          )}
        </div>
   
  );
};

export default Editor;
