import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, Eye, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Logo from '../../components/ui/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import Container from '../../components/ui/Container.jsx';
import Dropdown, { MenuDivider, MenuItem } from '../../components/ui/Dropdown.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import IconButton from '../../components/ui/IconButton.jsx';
import { Skeleton, Spinner } from '../../components/ui/Loading.jsx';
import { Card, CardBody, CardHeader, linkClass } from '../../components/ui/Card.jsx';
import { CheckboxField, FormGrid, SelectField, TextareaField, TextField } from '../../components/ui/Field.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import Modal, { ConfirmModal } from '../../components/ui/Modal.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { colors } from '../../theme/tokens.js';

const SWATCHES = [
  ['Burgundy', colors.wine, 'Primary actions'], ['Deep wine', colors['wine-9'], 'Admin sidebar'], ['Warm gold', colors.gold, 'Accents, focus'],
  ['Off-white', colors.paper, 'Page background'], ['Warm gray', colors.line, 'Borders'], ['Charcoal', colors.ink, 'Text'],
  ['Approved', colors.ok, 'Success'], ['Pending', colors.warn, 'Waiting'], ['Rejected', colors.bad, 'Errors'],
];
const STATUSES = ['pending', 'approved', 'rescheduled', 'completed', 'rejected', 'confirmed', 'ready', 'draft'];
const ADAPTATIONS = [
  ['Admin sidebar', 'Fixed left sidebar', 'Slide-in drawer plus bottom tab bar'],
  ['Parishioner navigation', 'Top navbar', 'Bottom tab bar with 5 destinations'],
  ['Tables', 'Columns with row actions', 'Stacked cards with labeled rows'],
  ['Calendars', 'Event pills in each day', 'Compact grid with dots and a list below'],
  ['Forms and wizard', 'Two columns, step labels', 'One column, compact progress bar'],
  ['Modals', 'Centered dialog', 'Bottom sheet'],
  ['Messages', 'Two panes', 'List first, then a full-screen thread'],
];

const H2 = ({ children }) => <h2 className="mb-3.5 mt-8">{children}</h2>;

export default function DesignSystemPage() {
  const toast = useToast();
  const [loadingButton, setLoadingButton] = useState(false);
  const [dialog, setDialog] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const tableColumns = [
    { key: 'id', header: 'Request ID', first: true, className: 'font-medium tabular-nums', render: (r) => r.id },
    { key: 'name', header: 'Applicant', render: (r) => r.name },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="min-h-screen bg-paper py-8">
      <Container className="max-w-[1100px]">
        <Link to="/" className="mb-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-wine no-underline hover:underline"><ChevronLeft size={15} aria-hidden="true" /> Back to public website</Link>
        <h1>Design system</h1>
        <p className="mt-1 text-ink-2">One set of components shared by the admin and parishioner interfaces.</p>

        <H2>Brand and color</H2>
        <Card><CardBody>
          <div className="mb-5 flex flex-wrap items-center gap-7">
            <Logo size={56} />
            <div><div className="font-serif text-[26px] font-semibold leading-[1.1]">St. Isidore Parish</div><span className="text-ink-2">Parish Information System</span></div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
            {SWATCHES.map(([name, hex, use]) => (
              <div key={name} className="overflow-hidden rounded-[10px] border border-line text-[12.5px]">
                <i className="block h-12" style={{ background: hex }} />
                <div className="p-2"><b className="block">{name}</b><span className="text-ink-3 tabular-nums">{hex}</span><br /><span className="text-ink-3">{use}</span></div>
              </div>
            ))}
          </div>
        </CardBody></Card>

        <H2>Typography</H2>
        <Card><CardBody className="flex flex-col gap-3.5">
          <div><div className="text-[12.5px] text-ink-3">Fraunces, headings</div><div className="font-serif text-[34px] font-semibold leading-[1.2]">Welcome back, Lorenz</div></div>
          <div><div className="font-serif text-2xl font-semibold">Baptism requests</div><div className="font-serif text-[17px] font-semibold">Upcoming appointment</div></div>
          <div className="text-ink-2"><div className="text-[12.5px] text-ink-3">Inter, interface and body text</div>Your request is being reviewed. We usually reply within 3 working days. <span className="text-[12.5px]">Small text, 12.5 px, is used for hints and metadata.</span></div>
        </CardBody></Card>

        <H2>Buttons and badges</H2>
        <Card><CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2.5">
            <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button>
            <Button variant="gold">Accent</Button><Button variant="success">Approve</Button><Button variant="danger">Reject</Button><Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button size="sm">Small</Button>
            <Button><Plus size={17} aria-hidden="true" /> With icon</Button>
            <Button size="lg">Large</Button>
            <IconButton variant="secondary" label="Search"><Search size={20} /></IconButton>
            <Button loading={loadingButton} onClick={() => { setLoadingButton(true); timer.current = window.setTimeout(() => setLoadingButton(false), 1400); }}>{loadingButton ? 'Loading' : 'Click to see loading'}</Button>
          </div>
          <div className="flex flex-wrap gap-2.5">{STATUSES.map((s) => <StatusBadge key={s} status={s} />)}</div>
        </CardBody></Card>

        <H2>Forms</H2>
        <Card><CardBody>
          <FormGrid>
            <TextField label="Text field" defaultValue="Maria Cristina Dela Cruz" hint="As it appears on the birth certificate" />
            <TextField label="With error" placeholder="09XX XXX XXXX" error="Enter a valid mobile number, like 0917 555 0142" />
            <SelectField label="Select" defaultValue="Baptism" options={['Baptism', 'Marriage', 'Confirmation', 'Funeral']} />
            <TextField label="Date" type="date" defaultValue="2026-10-25" />
            <TextareaField full label="Notes" placeholder="Anything the parish office should know" />
          </FormGrid>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <CheckboxField className="items-center" defaultChecked>Checkbox</CheckboxField>
            <label className="flex items-center gap-2 font-normal"><input type="radio" name="ds-radio" defaultChecked /> Radio</label>
            <label className="flex items-center gap-2 font-normal"><Toggle label="Toggle" defaultChecked /> Toggle</label>
          </div>
        </CardBody></Card>

        <H2>Cards, table and dropdown</H2>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <Card><CardHeader title="Card title" action={<span className={linkClass}>Action</span>} /><CardBody className="text-ink-2">Cards use a 12 px radius and a hairline border instead of shadows.</CardBody></Card>
          <Card><CardBody className="flex flex-wrap items-center gap-2.5">
            <Dropdown align="left" renderTrigger={({ triggerProps }) => <Button variant="secondary" {...triggerProps}>Dropdown <ChevronDown size={16} aria-hidden="true" /></Button>}>
              {({ close }) => (<><MenuItem icon={Eye} onClick={close}>View</MenuItem><MenuItem icon={Pencil} onClick={close}>Edit</MenuItem><MenuDivider /><MenuItem icon={Trash2} danger onClick={close}>Delete</MenuItem></>)}
            </Dropdown>
            <Button variant="secondary" onClick={() => setDialog('confirm')}>Confirm modal</Button>
            <Button variant="secondary" onClick={() => setDialog('form')}>Form modal</Button>
            <Button variant="secondary" onClick={() => toast('Request approved')}>Show toast</Button>
          </CardBody></Card>
        </div>
        <Card className="mt-5"><DataTable columns={tableColumns} rows={[{ id: 'BR-2026-048', name: 'Maria Cristina Dela Cruz', status: 'pending' }, { id: 'BR-2026-047', name: 'Jose Ramon Villanueva', status: 'approved' }]} getRowKey={(r) => r.id} caption="Sample table" /></Card>

        <H2>Empty and loading states</H2>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <Card><EmptyState icon={FileText} title="No requests yet" description="When you submit a request, you can follow its progress here." action={<Button>New request</Button>} /></Card>
          <Card><CardBody className="flex flex-col gap-3">
            <div className="flex items-center gap-3"><Skeleton className="!h-10 !w-10 !rounded-full" /><div className="flex flex-1 flex-col gap-2"><Skeleton style={{ width: '60%' }} /><Skeleton style={{ width: '35%' }} /></div></div>
            <Skeleton /><Skeleton style={{ width: '90%' }} /><Skeleton style={{ width: '70%' }} />
            <div className="flex items-center gap-2.5 text-wine"><Spinner /><span className="text-ink-2">Loading your requests</span></div>
          </CardBody></Card>
        </div>

        <H2>How layouts adapt on mobile</H2>
        <Card><DataTable columns={[
          { key: 'a', header: 'Element', first: true, render: (r) => <b>{r[0]}</b> },
          { key: 'b', header: 'Desktop', className: 'text-ink-2', render: (r) => r[1] },
          { key: 'c', header: 'Mobile', className: 'text-ink-2', render: (r) => r[2] },
        ]} rows={ADAPTATIONS} getRowKey={(r) => r[0]} caption="Responsive behaviour" /></Card>
        <p className="mt-3 text-ink-2">Resize the browser window to compare the desktop and mobile layouts.</p>
      </Container>

      <ConfirmModal open={dialog === 'confirm'} onClose={() => setDialog(null)} title="Approve this request?" tone="success" confirmLabel="Approve request" onConfirm={() => { setDialog(null); toast('Request approved'); }}>
        The parishioner will be notified and the schedule will be added to the calendar.
      </ConfirmModal>
      {dialog === 'form' && <ChangePasswordModal onClose={() => setDialog(null)} />}
    </div>
  );
}
