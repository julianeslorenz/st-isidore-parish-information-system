import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const pageButton = 'h-8 min-w-8 rounded-lg border border-line-2 bg-white disabled:opacity-40';

export default function Pagination({ page, pages, total, perPage, onPageChange, noun = 'items' }) {
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1.5 border-t border-line px-4 py-3 text-[13px] text-ink-2">
      <span>Showing {start} to {end} of {total} {noun}</span>
      <span className="flex-1" />
      <button type="button" className={pageButton} disabled={page < 2} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        <ChevronLeft size={15} className="mx-auto" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPageChange(n)}
          aria-current={n === page ? 'page' : undefined}
          aria-label={`Page ${n}`}
          className={cn(pageButton, n === page ? 'border-wine bg-wine text-white' : 'max-sm:hidden')}
        >
          {n}
        </button>
      ))}
      <button type="button" className={pageButton} disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        <ChevronRight size={15} className="mx-auto" />
      </button>
    </nav>
  );
}
