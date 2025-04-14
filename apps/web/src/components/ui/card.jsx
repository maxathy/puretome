import React from 'react';

import { motion } from 'framer-motion';

export const Card = React.forwardRef(
  ({ children, className = '', variant = 'default', ...props }, ref) => {
    const baseStyle = 'rounded-xl border shadow-sm';
    const variants = {
      default: 'border-gray-300 bg-white',
      outlined: 'border-blue-500 bg-white',
      muted: 'border-gray-200 bg-gray-50',
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={`${baseStyle} ${
          variants[variant] || variants.default
        } ${className} hover:shadow-md hover:bg-gray-100`}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`text-sm text-gray-800 px-4 py-2 ${className}`}>
    {children}
  </div>
);
