import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg border font-medium whitespace-nowrap no-underline transition-colors disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

export const buttonVariants = {
  primary: 'border-wine bg-wine text-white hover:border-wine-7 hover:bg-wine-7',
  secondary: 'border-line-2 bg-white text-ink hover:border-ink-3 hover:bg-paper',
  ghost: 'border-transparent bg-transparent text-ink-2 hover:bg-mute-bg',
  outline: 'border-wine bg-transparent text-wine hover:bg-wine-1',
  gold: 'border-gold bg-gold text-gold-ink hover:border-[#A57924] hover:bg-[#A57924]',
  danger: 'border-[#E3B6B1] bg-white text-bad hover:bg-bad-bg',
  'danger-solid': 'border-bad bg-bad text-white hover:opacity-90',
  success: 'border-ok bg-ok text-white hover:border-[#245a3d] hover:bg-[#245a3d]',
  'on-wine': 'border-white bg-white text-wine hover:bg-gold-1',
  'on-wine-outline': 'border-white/55 bg-transparent text-white hover:bg-white/10',
};

const sizes = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px] max-sm:h-[46px]',
};
const iconSizes = { sm: 'h-8 w-8 px-0', md: 'h-10 w-10 px-0', lg: 'h-12 w-12 px-0' };

/** Primary action component. Pass `to` to render a router link styled as a button. */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon = false, to, loading = false, disabled, className, children, type = 'button', ...props },
  ref,
) {
  const classes = cn(base, buttonVariants[variant], icon ? iconSizes[size] : sizes[size], className);
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-disabled={disabled || undefined} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});

export default Button;
