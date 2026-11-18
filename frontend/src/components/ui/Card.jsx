import { cn } from '../../utils/cn.js';

export function Card({ as: Tag = 'div', className, children, ...props }) {
  return <Tag className={cn('rounded-xl border border-line bg-white', className)} {...props}>{children}</Tag>;
}

export function CardHeader({ title, icon: Icon, action, className, children }) {
  return (
    <div className={cn('flex items-center gap-2.5 border-b border-line px-5 py-4', className)}>
      {Icon && <span className="text-wine"><Icon size={19} aria-hidden="true" /></span>}
      <h3 className="text-base">{title}</h3>
      <span className="flex-1" />
      {action}
      {children}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

/** Text link styled like the prototype ".link" (used for "View all" etc.). */
export const linkClass = 'cursor-pointer border-0 bg-transparent p-0 text-[13px] font-medium text-wine no-underline hover:underline';
