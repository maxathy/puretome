import React from 'react';

export const Card = React.forwardRef(({ children, className = '', variant = 'default', ...props }, ref) => {
  const baseStyle = 'rounded-xl border shadow-sm';
  const variants = {
    default: 'border-gray-300 bg-white',
    outlined: 'border-blue-500 bg-white',
    muted: 'border-gray-200 bg-gray-50',
  };

  return (
    <div
      ref={ref}
      className={`${baseStyle} ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardContent = ({ children, className = '' }) => (
  <div className={`text-sm text-gray-800 px-4 py-2 ${className}`}>{children}</div>
);