import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import TimelineBoard from '../components/TimelineBoard';
import MemoirPicker from '../components/MemoirPicker';
import Draftor from '../components/Draftor';

const Editor = () => {
  const [role, setRole] = useState(null);
  const [view, setView] = useState('timeline');
  const navigate = useNavigate();
  const { memoirId, chapterId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    const decoded = jwtDecode(token);
    setRole(decoded.role);
  }, [navigate]);

  useEffect(() => {
    if (chapterId) {
      setView('draftor');
    }
  }, [chapterId]);

  if (!memoirId) {
    return (
      <div className='p-6'>
        <MemoirPicker />
      </div>
    );
  }

  return (
    <div className='p-6 relative'>
      <div className='absolute top-4 right-8 z-10'>
        {view === 'draftor' && (
          <button
            className={`px-4 py-2 mr-2 rounded ${view === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('timeline')}
          >
            Board
          </button>
        )}

        {view === 'timeline' && (
          <button
            className={`px-4 py-2  mr-2 rounded ${view === 'draftor' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('draftor')}
          >
            Draft
          </button>
        )}
      </div>
      {view === 'timeline' && <TimelineBoard memoirId={memoirId} />}
      {view === 'draftor' && (
        <Draftor memoirId={memoirId} chapterId={chapterId} />
      )}
    </div>
  );
};

export default Editor;
