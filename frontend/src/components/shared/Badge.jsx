import React from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  icon: Icon,
  onRemove,
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <span
      className={\`
        inline-flex items-center gap-1
        font-medium rounded-full
        \${variantStyles[variant]}
        \${sizeStyles[size]}
        \${className}
      \`}
    >
      {dot && (
        <span className={\`w-2 h-2 rounded-full \${dotColors[variant]}\`} />
      )}
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  dot: PropTypes.bool,
  icon: PropTypes.elementType,
  onRemove: PropTypes.func,
  className: PropTypes.string,
};

export default Badge;
