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
    <nav className='fixed top-0 left-0 w-full z-50 bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between' style={{ height: 48 }}>
      <div className='flex items-center gap-4'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width={24}
          height={24}
          viewBox='0 0 24 24'
          fill='none'
          stroke='#53849e'
          strokeWidth={2}
          strokeLinecap='round'
          strokeLinejoin='round'
          className='h-8 w-8'
        >
          <path stroke='none' d='M0 0h24v24H0z' fill='none' />
          <path d='M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0' />
          <path d='M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0' />
          <path d='M3 6l0 13' />
          <path d='M12 6l0 13' />
          <path d='M21 6l0 13' />
        </svg>
        <Link
          to='/editor'
          className='text-xl font-bold text-gray-600 hover:text-gray-800 transition'
        >
          PureTome
        </Link>
      </div>
      <div className='flex items-center gap-4'>
        {user && (
          <>
            <Link to='/profile' className='text-gray-600 text-sm'>
              {user.name || user.email}
            </Link>

            <button
              onClick={handleLogout}
              className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm'
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
