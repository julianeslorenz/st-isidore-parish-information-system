import { cn } from '../../utils/cn.js';

/**
 * Responsive table. On phones (< 561px) each row becomes a stacked card whose cells show their
 * column label (prototype ".rtbl"). Columns:
 *   { key, header, label?, render(row), first?, align?: 'right', actions?, className? }
 */
export default function DataTable({ columns, rows, getRowKey, onRowClick, selectedKey, caption }) {
  const handleKey = (event, row) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onRowClick(row); }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse max-sm:block">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="max-sm:hidden">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn('whitespace-nowrap border-b border-line bg-paper-2 px-4 py-[11px] text-left text-[12.5px] font-medium text-ink-3', c.align === 'right' && 'text-right')}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {rows.map((row) => {
            const key = getRowKey(row);
            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => handleKey(e, row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                aria-selected={onRowClick ? key === selectedKey : undefined}
                className={cn(
                  'sm:[&:last-child>td]:border-b-0 max-sm:relative max-sm:block max-sm:border-b max-sm:border-line max-sm:px-4 max-sm:py-3.5',
                  onRowClick && 'cursor-pointer hover:[&>td]:bg-paper-3',
                  key === selectedKey && '[&>td]:!bg-wine-1',
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    data-label={c.label ?? c.header}
                    className={cn(
                      'border-b border-line px-4 py-[13px] align-middle',
                      'max-sm:flex max-sm:w-full max-sm:items-center max-sm:justify-between max-sm:gap-3 max-sm:border-0 max-sm:px-0 max-sm:py-[3px] max-sm:before:flex-none max-sm:before:text-[12.5px] max-sm:before:text-ink-3 max-sm:before:content-[attr(data-label)]',
                      c.first && 'max-sm:font-semibold max-sm:before:hidden',
                      c.align === 'right' && 'text-right',
                      c.actions && 'max-sm:justify-start max-sm:pt-2',
                      c.className,
                    )}
                  >
                    {c.actions ? <div className="flex justify-end gap-1 max-sm:justify-start">{c.render(row)}</div> : c.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
