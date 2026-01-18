import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

/**
 * Checkbox Component
 * 
 * A styled checkbox with label and description support.
 */
const Checkbox = forwardRef(({
  label,
  description,
  name,
  checked = false,
  onChange,
  disabled = false,
  error,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`flex items-start ${className}`}>
      {/* Checkbox Input */}
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="
            w-4 h-4
            text-primary-600
            border-gray-300
            rounded
            focus:ring-primary-500
            focus:ring-2
            disabled:bg-gray-100 disabled:cursor-not-allowed
          "
          {...props}
        />
      </div>

      {/* Label and Description */}
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={name}
              className={`
                text-sm font-medium
                ${disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-900 cursor-pointer'}
              `}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  label: PropTypes.string,
  description: PropTypes.string,
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default Checkbox;
