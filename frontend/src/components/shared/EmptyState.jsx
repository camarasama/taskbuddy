import React from 'react';
import PropTypes from 'prop-types';
import { Inbox, Search, AlertCircle } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  title,
  description,
  icon: Icon,
  action,
  actionLabel,
  size = 'md',
  type = 'default',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-20',
  };

  const iconSize = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const defaultIcons = {
    default: Inbox,
    search: Search,
    error: AlertCircle,
  };

  const DisplayIcon = Icon || defaultIcons[type];

  return (
    <div className={\`flex flex-col items-center justify-center text-center \${sizeStyles[size]} \${className}\`}>
      {DisplayIcon && (
        <DisplayIcon className={\`\${iconSize[size]} text-gray-400 mb-4\`} />
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action && actionLabel && (
        <Button onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  action: PropTypes.func,
  actionLabel: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['default', 'search', 'error']),
  className: PropTypes.string,
};

export default EmptyState;
