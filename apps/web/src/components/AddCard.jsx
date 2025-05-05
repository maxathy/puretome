import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from './ui/card';

const AddCard = ({ title, onClick, testid, className = '', icon }) => {
  const defaultIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className='h-6 w-6 text-gray-400 mb-1' // Default size, adjust if needed
      fill='none'
      viewBox='0 0 12 12' // Adjusted viewbox for plus sign
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M6 2v8m4-4H2' // Simple plus sign
      />
    </svg>
  );

  return (
    <Card
      variant='muted'
      className={`cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center ${className}`}
      onClick={onClick}
      data-testid={testid}
    >
      <CardContent className='flex flex-col items-center justify-center h-full p-4'>
        {icon || defaultIcon}
        <span className='text-gray-500 text-sm mt-1'>{title}</span>
      </CardContent>
    </Card>
  );
};

AddCard.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  testid: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.node, // Allow passing a custom icon element
};

export default AddCard;
