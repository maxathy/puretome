import React, { useEffect } from 'react';

/**
 * Reusable Modal Component
 *
 * @component
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to call when closing the modal (e.g., clicking overlay or X button)
 * @param {string} [title] - Optional title to display at the top of the modal
 * @param {ReactNode} children - Content to render inside the modal
 * @param {string} [className] - Additional classes for the modal content container
 * @returns {JSX.Element|null} Modal component
 */
const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  // Handle clicks on the overlay to close the modal
  const handleOverlayClick = (e) => {
    // Close only if the direct target of the click is the overlay itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup listener on unmount or when modal closes
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]); // Rerun effect if isOpen or onClose changes

  return (
    // Overlay div
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000, // Ensure modal is on top
      }}
      onClick={handleOverlayClick} // Close on overlay click
    >
      {/* Modal Content Container */}
      <div
        className={`bg-white rounded-lg shadow-xl p-6 relative modal-content-responsive ${className}`} // Base styling + custom classes
        style={{
          width: '100%',
          minWidth: '90vw', // Full width on mobile
          maxWidth: '420px', // Default max for small screens
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @media (min-width: 768px) {
            .modal-content-responsive {
              min-width: 400px !important;
              max-width: 480px !important;
            }
          }
          @media (min-width: 1024px) {
            .modal-content-responsive {
              min-width: 400px !important;
              max-width: 540px !important;
            }
          }
        `}</style>
        {/* Close Button (Top Right) */}
        <button
          onClick={onClose}
          className='absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl leading-none'
          aria-label='Close modal'
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          &times;
        </button>

        {/* Optional Title */}
        {title && <h2 className='text-xl font-semibold mb-4'>{title}</h2>}

        {/* Modal Body Content */}
        {children}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';

export default Modal;
