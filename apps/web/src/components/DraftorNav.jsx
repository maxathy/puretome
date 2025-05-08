import React from 'react';
import PropTypes from 'prop-types';
import {
  Home,
  Pencil,
  Settings,
  ChevronLeft,
  ChevronRight,
  PenTool,
  LayoutDashboard,
} from 'lucide-react';

const navLinks = [
  // { label: 'Home', icon: <Home className='h-6 w-6' /> },
  // { label: 'Edit', icon: <Pencil className='h-6 w-6' /> },
  // { label: 'Settings', icon: <Settings className='h-6 w-6' /> },
];

const DraftorNav = ({ collapsed, setCollapsed, view, setView, className = '' }) => (
  <nav
    className={`transition-all duration-200 bg-gray-800 text-white flex flex-col w-8 h-full min-h-0 py-4 ${className}`}
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
    {/* Board/Draft Toggle */}
    <div className={`flex flex-col ${collapsed ? 'items-center' : 'items-stretch'} mb-6`}>
      <button
        className={`flex items-center gap-2 px-3 py-2 mb-2 rounded hover:bg-gray-700 transition-colors ${view === 'draftor' ? 'bg-blue-600 text-white' : ''} ${collapsed ? 'justify-center' : ''}`}
        onClick={() => setView('draftor')}
        aria-label='Draft View'
      >
        <PenTool className='h-6 w-6' />
        {!collapsed && <span>Draft</span>}
      </button>
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 transition-colors ${view === 'timeline' ? 'bg-blue-600 text-white' : ''} ${collapsed ? 'justify-center' : ''}`}
        onClick={() => setView('timeline')}
        aria-label='Board View'
      >
        <LayoutDashboard className='h-6 w-6' />
        {!collapsed && <span>Board</span>}
      </button>
    </div>
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
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default DraftorNav;
