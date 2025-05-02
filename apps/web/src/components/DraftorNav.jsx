import React from 'react';
import PropTypes from 'prop-types';
import {
  Home,
  Pencil,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navLinks = [
  { label: 'Home', icon: <Home className='h-6 w-6' /> },
  { label: 'Edit', icon: <Pencil className='h-6 w-6' /> },
  { label: 'Settings', icon: <Settings className='h-6 w-6' /> },
];

const DraftorNav = ({ collapsed, setCollapsed }) => (
  <nav
    className={`transition-all duration-200 bg-gray-800 text-white flex flex-col ${collapsed ? 'w-16' : 'w-48'} min-h-full py-4`}
    style={{ minWidth: collapsed ? '4rem' : '12rem' }}
  >
    <button
      className='mb-6 p-2 flex items-center justify-center hover:bg-gray-700 rounded'
      onClick={() => setCollapsed((c) => !c)}
      aria-label='Toggle navigation'
    >
      {collapsed ? (
        <ChevronRight className='h-6 w-6' />
      ) : (
        <ChevronLeft className='h-6 w-6' />
      )}
    </button>
    <ul className='flex-1 space-y-2'>
      {navLinks.map((link) => (
        <li key={link.label}>
          <a
            href='#'
            className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            {link.icon}
            {!collapsed && <span>{link.label}</span>}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

DraftorNav.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  setCollapsed: PropTypes.func.isRequired,
};

export default DraftorNav;
