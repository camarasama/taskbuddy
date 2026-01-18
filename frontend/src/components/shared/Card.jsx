import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card Component
 * 
 * A versatile card component with multiple variants and sections.
 * 
 * @component
 * @example
 * ```jsx
 * <Card variant="elevated" hover>
 *   <Card.Header>
 *     <h3>Card Title</h3>
 *   </Card.Header>
 *   <Card.Body>
 *     Card content goes here
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button>Action</Button>
 *   </Card.Footer>
 * </Card>
 * ```
 */
const Card = ({
  children,
  variant = 'default',
  padding = 'default',
  hover = false,
  onClick,
  className = '',
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    bordered: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border border-gray-100',
    flat: 'bg-gray-50',
    primary: 'bg-primary-50 border border-primary-200',
    success: 'bg-green-50 border border-green-200',
    warning: 'bg-yellow-50 border border-yellow-200',
    danger: 'bg-red-50 border border-red-200',
  };

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Hover effect
  const hoverStyle = hover
    ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
    : '';

  // Clickable effect
  const clickableStyle = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        rounded-lg
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hoverStyle}
        ${clickableStyle}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header Section
 */
const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        border-b border-gray-200 
        pb-3 mb-3
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Body Section
 */
const CardBody = ({ children, className = '', scrollable = false, maxHeight, ...props }) => {
  const scrollStyle = scrollable ? 'overflow-y-auto' : '';
  const heightStyle = maxHeight ? `max-h-[${maxHeight}]` : '';

  return (
    <div
      className={`
        ${scrollStyle}
        ${heightStyle}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Footer Section
 */
const CardFooter = ({ children, className = '', align = 'right', ...props }) => {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={`
        border-t border-gray-200 
        pt-3 mt-3
        flex items-center gap-2
        ${alignStyles[align]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Attach sub-components to Card
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// PropTypes
Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'default',
    'bordered',
    'elevated',
    'flat',
    'primary',
    'success',
    'warning',
    'danger',
  ]),
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg', 'xl']),
  hover: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  scrollable: PropTypes.bool,
  maxHeight: PropTypes.string,
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center', 'right', 'between']),
};

export default Card;
