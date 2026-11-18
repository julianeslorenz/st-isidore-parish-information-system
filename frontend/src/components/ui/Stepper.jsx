import { Check } from 'lucide-react';

/** Horizontal stepper. Steps before `current` are done, `current` is highlighted. */
export default function Stepper({ steps, current, showLabels = true, compact = false, className = '' }) {
  return (
    <ol className={`stepper ${compact ? 'compact' : ''} ${className}`} aria-label="Progress">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li key={label} className="stepper-step" data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="stepper-dot">{state === 'done' ? <Check size={compact ? 14 : 16} aria-hidden="true" /> : i + 1}</span>
            {showLabels ? label : <span className="sr-only">{label}</span>}
          </li>
        );
      })}
    </ol>
  );
}

/** Compact "Step 2 of 6" bar used instead of the stepper on phones. */
export function StepProgress({ step, total, label }) {
  return (
    <div className="mb-5">
      <b>Step {step} of {total}: {label}</b>
      <div className="mt-2 h-1.5 overflow-hidden rounded-[3px] bg-line" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
        <i className="block h-full rounded-[3px] bg-wine" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}
