import { useRef, useState } from 'react';
import { Check, Upload, X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

export default function FileUpload({ label, file, onSelect, onRemove }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const chooseFile = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;
    const extension = selected.name.slice(selected.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      setError('Choose a PDF, JPG, or PNG file.');
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError('Each file must be 5 MB or smaller.');
      return;
    }
    setError('');
    onSelect(selected);
  };

  return (
    <div className={cn('flex items-center gap-3.5 rounded-xl border-[1.5px] p-3.5', file ? 'border-solid border-[#B9D8C6] bg-[#F4FAF6]' : 'border-dashed border-line-2 bg-white')}>
      <div className={cn('flex h-10 w-10 flex-none items-center justify-center rounded-[10px]', file ? 'bg-ok-bg text-ok' : 'bg-wine-1 text-wine')}>
        {file ? <Check size={19} aria-hidden="true" /> : <Upload size={19} aria-hidden="true" />}
      </div>
      <div className="min-w-0">
        <b>{label}</b>
        <div className="truncate text-[12.5px] text-ink-3">{file ? file.name : 'Required · PDF, JPG, or PNG · up to 5 MB'}</div>
        {error && <div className="mt-1 text-[12px] text-bad" role="alert">{error}</div>}
      </div>
      <span className="flex-1" />
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only" aria-label={`Choose ${label}`} onChange={chooseFile} />
      {file ? (
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove ${label}`}><X size={15} aria-hidden="true" />Remove</Button>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} aria-label={`Upload ${label}`}>Upload</Button>
      )}
    </div>
  );
}
