import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Textarea = forwardRef(({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  helperText,
  className = '',
  ...props
}, ref) => {
  const hasError = Boolean(error);
  const charCount = value?.length || 0;

  return (
    <div className={\`w-full \${className}\`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={\`
          w-full px-4 py-2
          border rounded-lg
          text-gray-900
          placeholder-gray-400
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
          resize-vertical
          \${hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }
        \`}
        {...props}
      />

      <div className="flex justify-between mt-1">
        <p className={\`text-sm \${hasError ? 'text-red-600' : 'text-gray-500'}\`}>
          {error || helperText}
        </p>
        {maxLength && (
          <p className="text-sm text-gray-500">
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  helperText: PropTypes.string,
  className: PropTypes.string,
};

export default Textarea;
