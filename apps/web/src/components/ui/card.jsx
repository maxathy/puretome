import React from 'react';

export function Card({ children, className = '', ...props }, ref) {
  return (
    <div ref={ref} className={`rounded-xl border border-gray-300 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export const CardContent = ({ children, className = '' }) => (
  <div className={`text-sm text-gray-800 ${className}`}>{children}</div>
);
