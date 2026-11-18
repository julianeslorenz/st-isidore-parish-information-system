import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import Button from './Button.jsx';
import IconButton from './IconButton.jsx';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: portal, Escape to close, focus moved in and trapped, focus restored on close.
 * Renders as a centered dialog on desktop and a bottom sheet on phones (prototype behaviour).
 */
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstField = bodyRef.current?.querySelector('[data-autofocus],input:not([type=hidden]),select,textarea');
    (firstField ?? dialogRef.current)?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.stopPropagation(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5 max-sm:items-end max-sm:p-0">
      <div className="absolute inset-0 bg-[rgba(43,23,27,.5)]" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-full w-full animate-pop flex-col rounded-2xl bg-white shadow-modal outline-none',
          size === 'lg' ? 'max-w-[680px]' : 'max-w-[520px]',
          'max-sm:max-w-none max-sm:animate-none max-sm:rounded-b-none max-sm:rounded-t-[20px]',
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
          <h3 id={titleId} className="flex-1">{title}</h3>
          <IconButton size="sm" label="Close dialog" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <div ref={bodyRef} className="overflow-auto p-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2.5 rounded-b-2xl border-t border-line bg-paper-2 px-5 py-3.5 max-sm:flex-wrap max-sm:rounded-b-none max-sm:[&>*]:flex-1">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Standard yes/no confirmation. `tone="danger"` styles the confirm button as destructive. */
export function ConfirmModal({ open, onClose, onConfirm, title, children, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'primary' }) {
  const variant = { danger: 'danger', success: 'success', primary: 'primary' }[tone];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
          <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      )}
    >
      {typeof children === 'string' ? <p>{children}</p> : children}
    </Modal>
  );
}
