import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

/**
 * Popover menu. `renderTrigger` receives props to spread onto its button; `children` can be a
 * function receiving `{ close }`. Closes on outside click and Escape.
 */
export default function Dropdown({ renderTrigger, children, align = 'right', menuClassName }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => { if (!wrapperRef.current?.contains(e.target)) close(); };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') { close(); wrapperRef.current?.querySelector('button')?.focus(); }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      {renderTrigger({
        open,
        triggerProps: { onClick: () => setOpen((v) => !v), 'aria-haspopup': 'true', 'aria-expanded': open, 'aria-controls': open ? menuId : undefined },
      })}
      {open && (
        <div
          id={menuId}
          className={cn(
            'absolute top-[calc(100%+6px)] z-40 min-w-[220px] rounded-xl border border-line bg-white p-1.5 text-left shadow-menu',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}

const itemClass = 'flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-2.5 py-[9px] text-left font-medium text-ink no-underline hover:bg-paper';

export function MenuItem({ icon: Icon, to, onClick, danger, children }) {
  const content = (
    <>
      {Icon && <Icon size={17} aria-hidden="true" />}
      {children}
    </>
  );
  const classes = cn(itemClass, danger && 'text-bad');
  if (to) return <Link to={to} onClick={onClick} className={classes}>{content}</Link>;
  return <button type="button" onClick={onClick} className={classes}>{content}</button>;
}

export const MenuDivider = () => <hr className="my-1.5 border-0 border-t border-line" />;
