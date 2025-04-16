import React from 'react';
/**
 * Button Component
 * Styled button with multiple variants
 *
 * @component
 * @param {ReactNode} children - Button content
 * @param {String} className - Additional CSS classes
 * @param {String} variant - Button style variant (primary, secondary, outline)
 * @param {Object} props - Additional props passed to button element
 * @returns {JSX.Element} Styled button
 */
export const Button = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}) => {
  const baseStyle = 'px-4 py-2 rounded font-medium transition';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  return (
    <button
      className={`${baseStyle} ${
        variants[variant] || variants.primary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
