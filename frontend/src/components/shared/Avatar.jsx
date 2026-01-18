import React from 'react';
import PropTypes from 'prop-types';
import { User } from 'lucide-react';

const Avatar = ({
  src,
  alt = 'User avatar',
  name,
  size = 'md',
  status,
  className = '',
}) => {
  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
    '2xl': 'w-24 h-24 text-4xl',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = name ? getInitials(name) : null;

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizeStyles[size]}
          rounded-full
          overflow-hidden
          bg-primary-100
          flex items-center justify-center
          text-primary-700
          font-semibold
        `}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : initials ? (
          initials
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </div>

      {/* Status Indicator */}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]}
            ${statusColors[status]}
            border-2 border-white
            rounded-full
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  status: PropTypes.oneOf(['online', 'offline', 'busy', 'away']),
  className: PropTypes.string,
};

export default Avatar;
