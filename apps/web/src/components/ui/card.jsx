import React from 'react';

import { motion } from 'framer-motion';
/**
 * Card Component
 * Animated card container with various styles
 *
 * @component
 * @param {ReactNode} children - Card content
 * @param {String} className - Additional CSS classes
 * @param {String} variant - Card style variant (default, outlined, muted)
 * @param {Object} props - Additional props
 * @returns {JSX.Element} Animated card container
 */

/**
 * CardContent Component
 * Standard padding for card content
 *
 * @component
 * @param {ReactNode} children - Content
 * @param {String} className - Additional CSS classes
 * @returns {JSX.Element} Styled card content container
 */

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

// Add this line to fix the ESLint error
Card.displayName = 'Card';

export const CardContent = ({ children, className = '' }) => (
  <div className={`text-sm text-gray-800 px-4 py-2 ${className}`}>
    {children}
  </div>
);

// Also add a display name for CardContent
CardContent.displayName = 'CardContent';
