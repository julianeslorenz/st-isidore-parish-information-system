import { cn } from '../../utils/cn.js';

/** Row used inside cards (prototype .li). Becomes a button when `onClick` is given. */
export default function ListRow({ onClick, className, children, ...props }) {
  const classes = cn('flex w-full items-center gap-3 border-b border-line px-5 py-3 text-left last:border-b-0', onClick && 'cursor-pointer hover:bg-paper-3', className);
  if (onClick) return <button type="button" onClick={onClick} className={classes} {...props}>{children}</button>;
  return <div className={classes} {...props}>{children}</div>;
}
