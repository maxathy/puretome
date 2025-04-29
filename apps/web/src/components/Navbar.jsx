import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/editor" className="text-lg font-bold text-green-700 hover:text-green-900 transition">PureTome</Link>
        <Link to="/editor" className="text-gray-700 hover:text-green-700 transition">My Memoirs</Link>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-gray-600 text-sm">{user.name || user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
