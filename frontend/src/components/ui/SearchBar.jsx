import { Search } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Input } from './Field.jsx';

export default function SearchBar({ value, onChange, placeholder = 'Search', label, className, ...props }) {
  return (
    <div className={cn('relative w-[260px] max-sm:w-full', className)}>
      <Search size={16} className="pointer-events-none absolute left-[11px] top-[11px] text-ink-3" aria-hidden="true" />
      <Input type="search" className="pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label ?? placeholder} {...props} />
    </div>
  );
}
