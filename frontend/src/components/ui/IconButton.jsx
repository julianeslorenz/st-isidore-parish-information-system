import { forwardRef } from 'react';
import Button from './Button.jsx';

/** Icon-only button. `label` becomes the accessible name (and tooltip). */
const IconButton = forwardRef(function IconButton({ label, variant = 'ghost', size = 'md', children, ...props }, ref) {
  return (
    <Button ref={ref} icon variant={variant} size={size} aria-label={label} title={props.title ?? label} {...props}>
      {children}
    </Button>
  );
});

export default IconButton;
