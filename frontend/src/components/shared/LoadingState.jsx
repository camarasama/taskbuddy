import React from 'react';
import PropTypes from 'prop-types';

const LoadingState = ({ type = 'default', rows = 3, className = '' }) => {
  if (type === 'table') {
    return (
      <div className={\`space-y-3 \${className}\`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={\`bg-white border border-gray-200 rounded-lg p-4 \${className}\`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={\`animate-pulse space-y-3 \${className}\`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: \`\${100 - i * 10}%\` }}></div>
      ))}
    </div>
  );
};

LoadingState.propTypes = {
  type: PropTypes.oneOf(['default', 'table', 'card']),
  rows: PropTypes.number,
  className: PropTypes.string,
};

export default LoadingState;
