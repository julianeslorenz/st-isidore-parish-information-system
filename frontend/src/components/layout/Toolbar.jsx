import { cn } from '../../utils/cn.js';

/** Filter row at the top of a table card (prototype .toolbar). */
export default function Toolbar({ className, children }) {
  return <div className={cn('flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3.5 max-sm:[&>select]:w-full', className)}>{children}</div>;
}
