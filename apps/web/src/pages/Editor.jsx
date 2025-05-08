import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import TimelineBoard from '../components/TimelineBoard';
import MemoirPicker from '../components/MemoirPicker';
import Draftor from '../components/Draftor';
import DraftorNav from '../components/DraftorNav';

const Editor = () => {
  const [role, setRole] = useState(null);
  const [view, setView] = useState('timeline');
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem('draftorNavCollapsed');
    return stored === null ? false : stored === 'true';
  });
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
    <div className='flex h-screen min-h-0 pt-12'>
      {/* Sidebar Navigation */}
      <DraftorNav
        collapsed={collapsed}
        setCollapsed={(fnOrVal) => {
          setCollapsed((prev) => {
            const next = typeof fnOrVal === 'function' ? fnOrVal(prev) : fnOrVal;
            localStorage.setItem('draftorNavCollapsed', next);
            return next;
          });
        }}
        view={view}
        setView={setView}
        className="h-full"
      />
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-200 ml-2 pt-8 pl-4 pr-6 relative h-full min-h-0 overflow-y-auto`}>
        {/* Toggle removed, now handled in DraftorNav */}
        {view === 'timeline' && <TimelineBoard memoirId={memoirId} />}
        {view === 'draftor' && (
          <Draftor memoirId={memoirId} chapterId={chapterId} />
        )}
      </div>
    </div>
  );
};

export default Editor;
