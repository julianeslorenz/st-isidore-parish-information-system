import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, MessageSquare, Plus } from 'lucide-react';
import PortalPage from '../../components/layout/PortalPage.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import KeyValue from '../../components/ui/KeyValue.jsx';
import SacramentIcon from '../../components/ui/SacramentIcon.jsx';
import Stepper from '../../components/ui/Stepper.jsx';
import { ConfirmModal } from '../../components/ui/Modal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { REQUEST_STAGES, STAGE_INDEX } from '../../data/requests.js';

function RequestDetail({ request, onBack }) {
  const { cancelMyRequest } = useData();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const at = STAGE_INDEX[request.status] ?? 1;

  return (
    <div className="mt-6">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-wine hover:underline"><ChevronLeft size={15} aria-hidden="true" /> Back to my requests</button>
      <div className="mb-1.5 mt-2 flex flex-wrap items-center gap-3"><h1>{request.title}</h1><StatusBadge status={request.status} /></div>
      <p className="mb-5 text-ink-2 tabular-nums">{request.id}, submitted {request.submitted}</p>

      <Card className="mb-5">
        <CardBody>
          <Stepper steps={REQUEST_STAGES} current={at} />
          <p className="mt-3.5 rounded-[10px] bg-paper px-3.5 py-3 text-ink-2">{request.note}</p>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <Card>
          <CardHeader title="Request details" />
          <CardBody><KeyValue labelWidth={120} items={[['Service', request.type], ['For', request.forWhom], ['Preferred schedule', request.schedule]]} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Documents" />
          <CardBody className="flex flex-col gap-2.5">
            {['Birth certificate', 'Valid ID'].map((d) => (
              <div key={d} className="flex items-center gap-3 rounded-[10px] border border-line px-3 py-2.5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-wine-1 text-wine"><FileText size={18} aria-hidden="true" /></span>
                <b>{d}</b><span className="flex-1" /><StatusBadge status="approved" label="Received" />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button to="/portal/messages"><MessageSquare size={17} aria-hidden="true" /> Message the parish office</Button>
        {request.status === 'pending' && <Button variant="danger" onClick={() => setConfirming(true)}>Cancel request</Button>}
      </div>

      <ConfirmModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Cancel this request?"
        confirmLabel="Cancel request"
        cancelLabel="Keep request"
        tone="danger"
        onConfirm={() => { cancelMyRequest(request.id); setConfirming(false); toast('Request cancelled'); }}
      >
        Your request will be withdrawn. You can submit a new one any time.
      </ConfirmModal>
    </div>
  );
}

export default function MyRequestsPage() {
  const { myRequests } = useData();
  const [params, setParams] = useSearchParams();
  const requestedId = params.get('requestId');
  const [selectedId, setSelectedId] = useState(requestedId);
  useEffect(() => {
    if (!requestedId || !myRequests.some((request) => request.id === requestedId)) return;
    setSelectedId(requestedId);
    setParams((current) => { const next = new URLSearchParams(current); next.delete('requestId'); return next; }, { replace: true });
  }, [requestedId, myRequests, setParams]);
  const selected = myRequests.find((r) => r.id === selectedId);

  return (
    <PortalPage>
      {selected ? <RequestDetail request={selected} onBack={() => setSelectedId(null)} /> : (
        <>
          <PageHeader title="My requests" subtitle="Open a request to see its progress and next steps." className="mt-0" actions={<Button to="/portal/requests/new"><Plus size={17} aria-hidden="true" /> New request</Button>} />
          {myRequests.length === 0 ? (
            <Card><EmptyState icon={FileText} title="No requests yet" description="When you submit a request, you can follow its progress here." action={<Button to="/portal/requests/new">New request</Button>} /></Card>
          ) : (
            <div className="flex flex-col gap-3">
              {myRequests.map((r) => (
                <Card key={r.id} className="hover:border-wine-2">
                  <button type="button" onClick={() => setSelectedId(r.id)} className="flex w-full items-center gap-3.5 rounded-xl px-[18px] py-4 text-left">
                    <SacramentIcon name={r.type} size={44} />
                    <span className="min-w-0"><b className="text-[15px]">{r.title}</b><span className="block text-[12.5px] text-ink-2 tabular-nums">{r.id}, submitted {r.submitted}</span></span>
                    <span className="flex-1" />
                    <StatusBadge status={r.status} />
                    <ChevronRight size={20} className="text-ink-3 max-md:hidden" aria-hidden="true" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </PortalPage>
  );
}
