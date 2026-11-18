import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Award, CalendarDays, Check, Download, FileText, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import KeyValue from '../../components/ui/KeyValue.jsx';
import Timeline from '../../components/ui/Timeline.jsx';
import Modal, { ConfirmModal } from '../../components/ui/Modal.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { StatusBadge, Tag } from '../../components/ui/Badge.jsx';
import { FormGrid, SelectField, TextareaField, TextField } from '../../components/ui/Field.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { can, useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { downloadFile } from '../../api/client.js';
import { REQUEST_STAGES, STAGE_INDEX } from '../../data/requests.js';
import { APPOINTMENT_TIMES, APPOINTMENT_PRIESTS } from '../../data/appointments.js';
import { formatIsoDate } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const REJECT_REASONS = ['Documents incomplete', 'Schedule not available', 'Requirements not met', 'Other'];

function RejectModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    if (!message.trim()) return setError('Add a short message so the parishioner knows what to do next.');
    onConfirm(reason);
  };
  return (
    <Modal open onClose={onClose} title="Reject this request" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger-solid" onClick={submit}>Reject request</Button></>}>
      <div className="flex flex-col gap-3.5">
        <SelectField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} options={REJECT_REASONS} />
        <TextareaField label="Message to the parishioner" placeholder="Explain what they need to fix so they can resubmit" value={message} onChange={(e) => setMessage(e.target.value)} error={error} />
      </div>
    </Modal>
  );
}

function RescheduleModal({ onClose, onConfirm }) {
  const [date, setDate] = useState('2026-11-01');
  const [time, setTime] = useState(APPOINTMENT_TIMES[0]);
  const [note, setNote] = useState('');
  return (
    <Modal open onClose={onClose} title="Reschedule" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => onConfirm(date, time)}>Save new schedule</Button></>}>
      <FormGrid>
        <TextField label="New date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <SelectField label="Time" value={time} onChange={(e) => setTime(e.target.value)} options={APPOINTMENT_TIMES} />
        <TextareaField full label="Reason for the change" placeholder="Optional note to the parishioner" value={note} onChange={(e) => setNote(e.target.value)} />
      </FormGrid>
    </Modal>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const toast = useToast();
  const { getRequest, updateRequest } = useData();
  const request = getRequest(id);
  const [dialog, setDialog] = useState(location.state?.reject ? 'reject' : null);

  usePageMeta('Request details', `Requests / ${request?.type ?? ''}`);
  // The quick "reject" icon in the list opens this dialog right away; clear the state so a refresh does not repeat it.
  useEffect(() => { if (location.state?.reject) navigate(location.pathname, { replace: true, state: null }); }, [location, navigate]);

  if (!request) {
    return <EmptyState icon={FileText} title="Request not found" description="It may have been removed or the link is incorrect." action={<Button to="/admin/requests" variant="secondary">Back to requests</Button>} />;
  }

  const canDecide = can(admin, 'request.decide');
  const done = request.status === 'completed' || request.status === 'rejected';
  const stage = STAGE_INDEX[request.status] ?? 1;
  const isBaptism = request.type === 'Baptism';
  const timeline = [...request.timeline].reverse();
  const close = () => setDialog(null);
  const apply = (patch, text, message) => { updateRequest(request.id, patch, text); close(); toast(message); };
  const downloadDocument = async (document) => {
    try {
      await downloadFile(`/requests/${encodeURIComponent(request.id)}/documents/${document.id}`, document.filename);
    } catch (error) {
      toast(error.message || 'The file could not be downloaded.');
    }
  };

  return (
    <>
      <PageHeader
        back={{ to: `/admin/requests?type=${request.type}`, label: `Back to ${request.type.toLowerCase()} requests` }}
        title={request.id}
        badge={<StatusBadge status={request.status} />}
        subtitle={`Submitted ${request.submitted} by ${request.applicant}`}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_420px] items-start gap-5 max-lg:grid-cols-1">
        <div className="flex flex-col gap-5">
          <Card><CardHeader title="Applicant information" /><CardBody>
            <KeyValue items={[['Full name', request.applicant], ['Relationship', 'Mother'], ['Civil status', 'Married'], ['Parish member', 'Yes, PAR-0002']]} />
          </CardBody></Card>

          {isBaptism ? (
            <Card><CardHeader title="Child information" /><CardBody>
              <KeyValue items={[['Full name', request.child], ['Date of birth', 'August 3, 2026'], ['Sex', 'Male'], ['Place of birth', 'Laguna Medical Center'], ['Father', 'Joaquin Dela Cruz'], ['Mother', request.applicant], ['Godparents', 'Ricardo and Elena Aquino']]} />
            </CardBody></Card>
          ) : (
            <Card><CardHeader title={`${request.type} details`} /><CardBody>
              <KeyValue items={[['Service', request.type], ['Subject', request.subject], ['Requested date', request.requested]]} />
            </CardBody></Card>
          )}

          <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
            <Card><CardHeader title="Contact information" /><CardBody><KeyValue labelWidth={90} items={[['Mobile', '0918 555 0177'], ['Email', 'mc.delacruz@example.com'], ['Address', 'Zone 1, Purok 4']]} /></CardBody></Card>
            <Card><CardHeader title="Preferred schedule" /><CardBody><KeyValue labelWidth={100} items={[['First choice', `${request.requested}, 9:00 AM`], ['Second choice', 'Nov 1, 2026, 9:00 AM'], ['Guests', 'About 12']]} /></CardBody></Card>
          </div>

          <Card>
            <CardHeader title="Supporting documents" action={<Tag>{request.documents?.length || 0} uploaded</Tag>} />
            <CardBody className="flex flex-col gap-2.5">
              {(request.documents || []).length ? request.documents.map((document) => (
                <div key={document.id} className="flex items-center gap-3 rounded-[10px] border border-line px-3 py-2.5">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-wine-1 text-wine"><FileText size={19} aria-hidden="true" /></span>
                  <div className="min-w-0"><b>{document.label}</b><div className="truncate text-[12.5px] text-ink-3">{document.filename} · {Math.max(1, Math.ceil(document.size_bytes / 1024))} KB</div></div>
                  <span className="flex-1" />
                  <Button variant="secondary" size="sm" onClick={() => downloadDocument(document)}><Download size={15} aria-hidden="true" />Download</Button>
                </div>
              )) : <p className="text-sm text-ink-3">No supporting documents were attached to this request.</p>}
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Request status"><StatusBadge status={request.status} /></CardHeader>
            <CardBody>
              <Timeline className="!pl-7" items={REQUEST_STAGES.map((name, i) => ({
                state: i < stage ? 'done' : i === stage ? 'current' : undefined,
                content: <b className={cn(i > stage ? 'font-medium text-ink-3' : 'font-semibold')}>{name}</b>,
              })).concat(request.status === 'rejected' ? [{ content: <b className="text-bad">Rejected</b> }] : [])} />
              <div className="my-4">
                <SelectField label="Assigned priest" value={request.priest} onChange={(e) => { updateRequest(request.id, { priest: e.target.value }); toast(`Assigned to ${e.target.value}`); }} options={APPOINTMENT_PRIESTS} />
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="success" disabled={!canDecide || (request.status !== 'pending' && request.status !== 'rescheduled')} onClick={() => setDialog('approve')}><Check size={17} aria-hidden="true" /> Approve request</Button>
                <Button variant="secondary" disabled={!canDecide || done} onClick={() => setDialog('reschedule')}><CalendarDays size={17} aria-hidden="true" /> Reschedule</Button>
                <Button variant="secondary" disabled={!canDecide || (request.status !== 'approved' && request.status !== 'rescheduled')} onClick={() => setDialog('complete')}><Award size={17} aria-hidden="true" /> Mark completed</Button>
                <Button variant="danger" disabled={!canDecide || done} onClick={() => setDialog('reject')}><X size={17} aria-hidden="true" /> Reject request</Button>
              </div>
            </CardBody>
          </Card>
          <Card><CardHeader title="Activity timeline" /><CardBody>
            <Timeline items={timeline.map((e) => ({ state: e.state, meta: e.when, content: <span className="font-medium">{e.text}</span> }))} />
          </CardBody></Card>
        </div>
      </div>

      <ConfirmModal open={dialog === 'approve'} onClose={close} tone="success" title="Approve this request?" confirmLabel="Approve request" onConfirm={() => apply({ status: 'approved' }, `Approved by ${admin.name}`, 'Request approved')}>
        The parishioner will be notified and the schedule will be added to the calendar.
      </ConfirmModal>
      <ConfirmModal open={dialog === 'complete'} onClose={close} title="Mark as completed?" cancelLabel="Not yet" confirmLabel="Mark completed" onConfirm={() => apply({ status: 'completed' }, 'Sacrament completed', 'Marked as completed')}>
        Confirm that the sacrament was celebrated. A certificate can then be issued.
      </ConfirmModal>
      {dialog === 'reject' && <RejectModal onClose={close} onConfirm={(reason) => apply({ status: 'rejected' }, `Rejected: ${reason.toLowerCase()}`, 'Request rejected')} />}
      {dialog === 'reschedule' && (
        <RescheduleModal onClose={close} onConfirm={(date, time) => apply({ status: 'rescheduled', requested: formatIsoDate(date) }, `Rescheduled to ${formatIsoDate(date)}, ${time}`, 'New schedule saved')} />
      )}
    </>
  );
}
