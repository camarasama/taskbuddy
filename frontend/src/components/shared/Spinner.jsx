import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const Spinner = ({
  size = 'md',
  variant = 'primary',
  text,
  fullPage = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const variantStyles = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  const spinner = (
    <div className={\`flex flex-col items-center justify-center gap-3 \${className}\`}>
      <Loader2 className={\`animate-spin \${sizeStyles[size]} \${variantStyles[variant]}\`} />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
        {spinner}
      </div>
    );
  }

  return spinner;
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'white', 'gray']),
  text: PropTypes.string,
  fullPage: PropTypes.bool,
  className: PropTypes.string,
};

export default Spinner;
