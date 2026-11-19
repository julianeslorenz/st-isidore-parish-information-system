import { useEffect, useState } from 'react';
import { getPdfObjectUrl } from '../../api/client.js';

/**
 * Shows the actual generated form, including the supplied parish background and aligned text.
 */
export default function CertificatePreview({ certificateId, type, status }) {
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    setPdfUrl('');
    setError('');
    if (!certificateId || status !== 'processing') return () => { active = false; };

    getPdfObjectUrl(`/certificates/${certificateId}/pdf?background=true`)
      .then((url) => {
        objectUrl = url;
        if (active) setPdfUrl(url);
        else URL.revokeObjectURL(url);
      })
      .catch((cause) => { if (active) setError(cause.message || 'The filled certificate preview could not be opened.'); });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [certificateId, status]);

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      {status !== 'processing' ? (
        <p className="p-4 text-sm text-ink-2">The filled form preview is available while the certificate is being prepared.</p>
      ) : error ? (
        <p className="p-4 text-sm text-bad" role="alert">{error}</p>
      ) : pdfUrl ? (
        <iframe className="h-[min(70vh,680px)] w-full" src={pdfUrl} title={`${type} certificate with parish form background`} />
      ) : (
        <p className="p-4 text-sm text-ink-2" role="status">Loading the filled parish certificate form…</p>
      )}
    </div>
  );
}
