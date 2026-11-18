import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

export default function PageHeader({ title, subtitle, actions, back, badge, className, avatar }) {
  return (
    <div className={cn('mb-[22px] flex flex-wrap items-end gap-4', className)}>
      <div className="flex items-center gap-3">
        {avatar}
        <div>
          {back && (
            <Link to={back.to} className="mb-1.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-wine no-underline hover:underline">
              <ChevronLeft size={15} aria-hidden="true" /> {back.label}
            </Link>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="max-md:text-2xl">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="mt-1 text-ink-2">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="ml-auto flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
