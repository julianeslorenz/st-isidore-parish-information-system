import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, MessageSquare, Plus, ShieldCheck } from 'lucide-react';
import PortalPage from '../../components/layout/PortalPage.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import KeyValue from '../../components/ui/KeyValue.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Note from '../../components/ui/Note.jsx';
import Stepper from '../../components/ui/Stepper.jsx';
import { SelectField, TextField } from '../../components/ui/Field.jsx';
import { CERT_FLOW, PORTAL_CERT_LABELS, PORTAL_CERT_MESSAGES, PORTAL_CERT_STEPS, PORTAL_CERT_TYPES } from '../../data/certificates.js';
import { useData } from '../../context/DataContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

/*
 * Parishioners can only FOLLOW the certificate workflow. There is deliberately no download,
 * print or signing control anywhere on this page: the parish office prepares certificates on
 * the supplied pre-signed paper and releases them to parishioners.
 */
function StatusDetails({ certificate, onClose }) {
  return (
    <Modal
      open
      onClose={onClose}
      title={`${certificate.type} certificate`}
      footer={<><Button variant="secondary" onClick={onClose}>Close</Button><Button to="/portal/messages" onClick={onClose}>Message the parish office</Button></>}
    >
      <div className="mb-3"><StatusBadge status={certificate.status} label={PORTAL_CERT_LABELS[certificate.status]} /></div>
      <p className="text-ink-2">{PORTAL_CERT_MESSAGES[certificate.status]}</p>
      {certificate.status === 'ready' && (
        <>
          <h4 className="mb-1.5 mt-4">Pickup</h4>
          <KeyValue labelWidth={80} items={[['Where', 'Parish office'], ['When', 'Mon to Fri, 8:00 AM to 5:00 PM'], ['Bring', 'A valid ID. A representative needs an authorization letter.']]} />
        </>
      )}
    </Modal>
  );
}

function RequestCertificateModal({ onClose, onSubmit }) {
  const [type, setType] = useState('Baptism');
  const [purpose, setPurpose] = useState('');
  return (
    <Modal
      open
      onClose={onClose}
      title="Request a certificate"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => onSubmit(type, purpose)}>Send request</Button></>}
    >
      <div className="flex flex-col gap-3.5">
        <SelectField label="Certificate type" value={type} onChange={(e) => setType(e.target.value)} options={PORTAL_CERT_TYPES} />
        <TextField label="Purpose" placeholder="For example, wedding requirements" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        <p className="text-[12.5px] text-ink-2">The parish office will prepare it on parish paper. You will be told when it is ready for pickup.</p>
      </div>
    </Modal>
  );
}

export default function PortalCertificatesPage() {
  const [params, setParams] = useSearchParams();
  const { parishioner } = useAuth();
  const { certificates, addCertificate } = useData();
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const requestedCertificateId = params.get('certificateId');

  // Same records the parish office manages, filtered to this parishioner.
  const mine = certificates.filter((c) => c.name === parishioner.name);
  const hasMarriage = mine.some((c) => c.type === 'Marriage');
  const detailCertificate = mine.find((c) => c.number === detail);
  useEffect(() => {
    const certificate = mine.find((item) => String(item.id) === requestedCertificateId);
    if (!certificate) return;
    setDetail(certificate.number);
    setParams((current) => { const next = new URLSearchParams(current); next.delete('certificateId'); return next; }, { replace: true });
  }, [certificates, requestedCertificateId, parishioner.name, setParams]);

  return (
    <PortalPage>
      <PageHeader
        title="My certificates"
        subtitle="Follow the preparation and release of your certificates."
        actions={<Button variant="secondary" onClick={() => setRequesting(true)}><Plus size={17} aria-hidden="true" /> Request a certificate</Button>}
      />
      <Note className="mb-[18px] flex items-center gap-2.5">
        <ShieldCheck size={20} className="flex-none" aria-hidden="true" />
        <span>Your official certificate is prepared and released by the parish office. Please coordinate with the parish office for pickup.</span>
      </Note>

      <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
        {mine.map((c) => (
          <Card key={c.number}>
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-center gap-3"><b className="text-[15px]">{c.type} certificate</b><span className="flex-1" /><StatusBadge status={c.status} label={PORTAL_CERT_LABELS[c.status]} /></div>
              <div className="text-[12.5px] text-ink-2 tabular-nums">Reference {c.number}</div>
              <Stepper compact showLabels={false} steps={PORTAL_CERT_STEPS} current={CERT_FLOW.indexOf(c.status)} className="my-1" />
              <p className="text-[12.5px] text-ink-2">{PORTAL_CERT_MESSAGES[c.status]}</p>
              <div className="flex gap-2.5 max-sm:flex-col">
                <Button className="flex-1" variant={c.status === 'ready' ? 'primary' : 'secondary'} onClick={() => setDetail(c.number)}>{c.status === 'ready' ? 'Pickup details' : 'Status details'}</Button>
                <Button className="flex-1" variant="secondary" to="/portal/messages"><MessageSquare size={16} aria-hidden="true" /> Ask the office</Button>
              </div>
            </CardBody>
          </Card>
        ))}
        {!hasMarriage && (
          <Card className="border-dashed bg-transparent">
            <CardBody className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[50%_50%_8px_8px] bg-wine-1 text-wine"><Clock size={22} aria-hidden="true" /></div>
              <b>Marriage certificate</b>
              <p className="text-[12.5px] text-ink-2">Prepared after your wedding.</p>
            </CardBody>
          </Card>
        )}
      </div>

      {detailCertificate && <StatusDetails certificate={detailCertificate} onClose={() => setDetail(null)} />}
      {requesting && (
        <RequestCertificateModal
          onClose={() => setRequesting(false)}
          onSubmit={(type, purpose) => { addCertificate(parishioner.name, type, { purpose }); setRequesting(false); toast('Request sent. Status: Processing'); }}
        />
      )}
    </PortalPage>
  );
}
