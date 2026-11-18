import { cn } from '../../utils/cn.js';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('px-5 py-9 text-center text-ink-2', className)}>
      {Icon && (
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-[50%_50%_8px_8px] bg-wine-1 text-wine">
          <Icon size={26} aria-hidden="true" />
        </div>
      )}
      <h4 className="mb-1 text-[15px] text-ink">{title}</h4>
      {description && <p className="text-[12.5px]">{description}</p>}
      {action && <div className="mt-3.5">{action}</div>}
    </div>
  );
}
