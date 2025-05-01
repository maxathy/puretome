import React from 'react';
import PropTypes from 'prop-types';

const Draftor = ({ memoirId, chapterId }) => {
  return (
    <div className="draftor-container">
      <h2>Draftor</h2>
      <div>Memoir ID: {memoirId}</div>
      {chapterId && <div>Chapter ID: {chapterId}</div>}
      {/* Draftor content goes here */}
    </div>
  );
};

Draftor.propTypes = {
  memoirId: PropTypes.string.isRequired,
  chapterId: PropTypes.string,
};

export default Draftor;
