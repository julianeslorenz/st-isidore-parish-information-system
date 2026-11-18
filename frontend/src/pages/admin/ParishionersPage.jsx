import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Plus, Users } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import KeyValue from '../../components/ui/KeyValue.jsx';
import Timeline from '../../components/ui/Timeline.jsx';
import Modal from '../../components/ui/Modal.jsx';
import SearchBar from '../../components/ui/SearchBar.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Field.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import Toolbar from '../../components/layout/Toolbar.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import ParishionerRecordModal from '../../components/modals/ParishionerRecordModal.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { canOpenScreen, useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useIsMobile } from '../../hooks/useMediaQuery.js';
import { PARISHIONER_FILTERS, SACRAMENT_CHIPS } from '../../data/parishioners.js';
import { cn } from '../../utils/cn.js';

function SacramentChips({ received }) {
  return (
    <span className="flex gap-[5px]">
      {SACRAMENT_CHIPS.map((c, i) => (
        <span key={c.key} title={`${c.label}: ${received[i] ? 'received' : 'not yet'}`} aria-label={`${c.label}: ${received[i] ? 'received' : 'not yet'}`} className={cn('inline-flex h-[22px] w-[22px] items-center justify-center rounded-md text-[11px] font-semibold', received[i] ? 'bg-wine text-white' : 'bg-mute-bg text-[#B5ADA5]')}>{c.letter}</span>
      ))}
    </span>
  );
}

function Profile({ p, onRecord, onMessage }) {
  return (
    <>
      <div className="text-center">
        <Avatar name={p.name} size={72} className="mx-auto" />
        <h3 className="mt-2.5">{p.name}</h3>
        <div className="text-[12.5px] text-ink-2">{p.id}, {p.zone}</div>
        <div className="mt-2"><StatusBadge status={p.status} /></div>
      </div>
      <div className="my-[18px]"><KeyValue labelWidth={80} items={[['Mobile', p.phone], ['Age', p.age], ['Household', 'Family of 4']]} /></div>
      <h4 className="mb-3">Sacrament history</h4>
      <Timeline items={p.history.map((h, i) => ({
        state: p.received[i] ? 'done' : undefined,
        content: <b className={p.received[i] ? '' : 'font-medium text-ink-3'}>{h.sacrament}</b>,
        meta: p.received[i] ? `${h.date}, ${h.place}` : 'Not yet received',
      }))} />
      <div className="mt-[18px] flex gap-2.5">
        <Button variant="secondary" className="flex-1" onClick={onRecord}>Full record</Button>
        <Button className="flex-1" onClick={onMessage}><Mail size={16} aria-hidden="true" /> Message</Button>
      </div>
    </>
  );
}

export default function ParishionersPage() {
  usePageMeta('Parishioners', 'Records');
  const [params] = useSearchParams();
  const { admin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useIsMobile();
  const { parishioners } = useData();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(parishioners[0].id);
  const [dialog, setDialog] = useState(null); // 'sheet' | 'record'

  const rows = useMemo(() => parishioners.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${p.name}${p.id}`.toLowerCase().includes(q);
    const matchesFilter = filter === 'all' || (filter === 'active' ? p.status === 'active' : p.received[Number(filter)]);
    return matchesQuery && matchesFilter;
  }), [parishioners, query, filter]);

  const selected = parishioners.find((p) => p.id === selectedId) ?? parishioners[0];
  const canMessage = canOpenScreen(admin, 'messages');
  const message = () => { if (canMessage) navigate('/admin/messages', { state: { compose: selected.name } }); else toast('Your role cannot send messages'); };
  const profile = <Profile p={selected} onRecord={() => setDialog('record')} onMessage={message} />;

  const columns = [
    { key: 'name', header: 'Parishioner', first: true, render: (p) => (
      <div className="flex items-center gap-2.5 text-left"><Avatar name={p.name} size={36} /><div><b>{p.name}</b><div className="text-[12.5px] text-ink-3">{p.id}, age {p.age}</div></div></div>
    ) },
    { key: 'zone', header: 'Zone', render: (p) => p.zone },
    { key: 'phone', header: 'Contact', className: 'tabular-nums text-ink-2', render: (p) => p.phone },
    { key: 'sacraments', header: 'Sacraments', render: (p) => <SacramentChips received={p.received} /> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <>
      <PageHeader title="Parishioners" subtitle="1,248 registered members of the parish." actions={<Button onClick={() => toast('New parishioner form opened')}><Plus size={17} aria-hidden="true" /> Add parishioner</Button>} />
      <div className="grid grid-cols-[minmax(0,1fr)_350px] items-start gap-5 max-lg:grid-cols-1">
        <Card>
          <Toolbar>
            <SearchBar value={query} onChange={setQuery} placeholder="Search name or ID" />
            <Select aria-label="Filter by sacrament" className="w-auto" value={filter} onChange={(e) => setFilter(e.target.value)} options={PARISHIONER_FILTERS} />
          </Toolbar>
          {rows.length ? (
            <>
              <DataTable columns={columns} rows={rows} getRowKey={(p) => p.id} selectedKey={selected.id} onRowClick={(p) => { setSelectedId(p.id); if (isMobile) setDialog('sheet'); }} caption="Parishioners" />
              <div className="border-t border-line px-4 py-3 text-[13px] text-ink-2">{rows.length} parishioners</div>
            </>
          ) : (
            <EmptyState icon={Users} title="No parishioners found" description="Check the spelling or clear the filter." action={<Button variant="secondary" onClick={() => { setQuery(''); setFilter('all'); }}>Clear filters</Button>} />
          )}
          <div className="border-t border-line px-4 py-3 text-[12.5px] text-ink-3">B Baptism, C First Communion, K Confirmation, M Marriage. Filled means received.</div>
        </Card>
        <Card className="sticky top-0 max-md:hidden"><CardBody>{profile}</CardBody></Card>
      </div>

      {dialog === 'sheet' && <Modal open onClose={() => setDialog(null)} title="Parishioner">{profile}</Modal>}
      {dialog === 'record' && <ParishionerRecordModal parishioner={selected} onClose={() => setDialog(null)} />}
    </>
  );
}
