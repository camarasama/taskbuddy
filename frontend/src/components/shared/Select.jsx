import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

/**
 * Select Component
 * 
 * A styled select dropdown with label, error state, and validation.
 */
const Select = forwardRef(({
  label,
  name,
  options = [],
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  helperText,
  className = '',
  ...props
}, ref) => {
  const hasError = Boolean(error);

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        <select
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-4 py-2 pr-10
            border rounded-lg
            appearance-none
            bg-white
            text-gray-900
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            ${
              hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }
          `}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
      </div>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p className={`mt-1 text-sm ${hasError ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
};

export default Select;
