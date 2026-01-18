import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Radio = forwardRef(({
  label,
  description,
  name,
  value,
  checked = false,
  onChange,
  disabled = false,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={\`flex items-start \${className}\`}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={\`\${name}-\${value}\`}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="
            w-4 h-4
            text-primary-600
            border-gray-300
            focus:ring-primary-500
            focus:ring-2
            disabled:bg-gray-100 disabled:cursor-not-allowed
          "
          {...props}
        />
      </div>

      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={\`\${name}-\${value}\`}
              className={\`
                text-sm font-medium
                \${disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-900 cursor-pointer'}
              \`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

Radio.propTypes = {
  label: PropTypes.string,
  description: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export const RadioGroup = ({ children, label, error, className = '' }) => {
  return (
    <div className={\`\${className}\`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {children}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

RadioGroup.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default Radio;
