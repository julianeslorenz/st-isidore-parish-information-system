import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import IconButton from './IconButton.jsx';

export const inputBase =
  'h-10 w-full rounded-lg border border-line-2 bg-white px-3 text-ink placeholder:text-ink-3 focus:border-wine focus:outline-none focus:ring-[3px] focus:ring-gold-1 disabled:bg-paper disabled:text-ink-2 read-only:bg-paper read-only:text-ink-2';

/** Wraps a control with its label, hint and error text, wiring up the ARIA relationships. */
export function Field({ id, label, hint, error, full = false, className, children }) {
  return (
    <div className={cn('flex flex-col gap-1.5', full && 'col-span-full', className)}>
      {label && <label htmlFor={id} className="text-[13px] font-medium">{label}</label>}
      {children}
      {hint && !error && <span id={`${id}-hint`} className="text-[12.5px] text-ink-3">{hint}</span>}
      {error && <span id={`${id}-err`} role="alert" className="text-[12.5px] text-bad">{error}</span>}
    </div>
  );
}

const describedBy = (id, hint, error) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined);

export const Input = forwardRef(function Input({ error, className, ...props }, ref) {
  return <input ref={ref} className={cn(inputBase, error && 'border-bad', className)} aria-invalid={error ? true : undefined} {...props} />;
});

export const Select = forwardRef(function Select({ options = [], error, className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(inputBase, 'field-select', error && 'border-bad', className)} aria-invalid={error ? true : undefined} {...props}>
      {children ?? options.map((o) => {
        const { value, label } = typeof o === 'string' ? { value: o, label: o } : o;
        return <option key={value} value={value}>{label}</option>;
      })}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ error, className, rows = 3, ...props }, ref) {
  return (
    <textarea ref={ref} rows={rows} className={cn(inputBase, 'h-auto resize-y py-2.5', error && 'border-bad', className)} aria-invalid={error ? true : undefined} {...props} />
  );
});

/** Labelled text input. */
export function TextField({ label, hint, error, full, fieldClassName, id: idProp, ...props }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} hint={hint} error={error} full={full} className={fieldClassName}>
      <Input id={id} error={error} aria-describedby={describedBy(id, hint, error)} {...props} />
    </Field>
  );
}

export function SelectField({ label, hint, error, full, fieldClassName, options, id: idProp, children, ...props }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} hint={hint} error={error} full={full} className={fieldClassName}>
      <Select id={id} options={options} error={error} aria-describedby={describedBy(id, hint, error)} {...props}>{children}</Select>
    </Field>
  );
}

export function TextareaField({ label, hint, error, full, fieldClassName, id: idProp, ...props }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} hint={hint} error={error} full={full} className={fieldClassName}>
      <Textarea id={id} error={error} aria-describedby={describedBy(id, hint, error)} {...props} />
    </Field>
  );
}

/** Password input with a show/hide button, as on the prototype login screens. */
export function PasswordField({ label = 'Password', labelAside, hint, error, id: idProp, ...props }) {
  const auto = useId();
  const id = idProp ?? auto;
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <label htmlFor={id} className="text-[13px] font-medium">{label}</label>
        <span className="flex-1" />
        {labelAside}
      </div>
      <div className="relative">
        <Input id={id} type={visible ? 'text' : 'password'} error={error} className="pr-11" aria-describedby={describedBy(id, hint, error)} {...props} />
        <IconButton
          size="sm"
          label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1 top-1"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </IconButton>
      </div>
      {hint && !error && <span id={`${id}-hint`} className="text-[12.5px] text-ink-3">{hint}</span>}
      {error && <span id={`${id}-err`} role="alert" className="text-[12.5px] text-bad">{error}</span>}
    </div>
  );
}

/** Two-column grid that stacks on phones (prototype .fgrid). */
export function FormGrid({ className, children }) {
  return <div className={cn('grid grid-cols-2 gap-4 max-sm:grid-cols-1', className)}>{children}</div>;
}

export function CheckboxField({ children, className, ...props }) {
  return (
    <label className={cn('flex items-start gap-2 font-normal', className)}>
      <input type="checkbox" className="mt-[3px]" {...props} />
      <span>{children}</span>
    </label>
  );
}
