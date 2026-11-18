import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Download, Eye, Plus, Search, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import IconButton from '../../components/ui/IconButton.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import FilterChips from '../../components/ui/FilterChips.jsx';
import SearchBar from '../../components/ui/SearchBar.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { Select } from '../../components/ui/Field.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { ConfirmModal } from '../../components/ui/Modal.jsx';
import { Card } from '../../components/ui/Card.jsx';
import Toolbar from '../../components/layout/Toolbar.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { can, useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { REQUEST_DATE_FILTERS, REQUEST_STATUS_FILTERS, REQUEST_TYPES } from '../../data/requests.js';
import { STATUS_LABELS } from '../../data/statuses.js';

const PER_PAGE = 8;

export default function RequestsPage() {
  const [params] = useSearchParams();
  const initialType = REQUEST_TYPES.includes(params.get('type')) ? params.get('type') : 'Baptism';
  const [type, setType] = useState(initialType);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [dateFilter, setDateFilter] = useState('any');
  const [page, setPage] = useState(1);
  const [approving, setApproving] = useState(null);

  usePageMeta(`${type} requests`, 'Requests');
  const { admin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { requests, updateRequest } = useData();
  const canDecide = can(admin, 'request.decide');

  const ofType = useMemo(() => requests.filter((r) => r.type === type), [requests, type]);
  const rows = useMemo(() => ofType.filter((r) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${r.applicant}${r.id}${r.subject}`.toLowerCase().includes(q);
    const matchesStatus = status === 'all' || r.status === status;
    const matchesDate = dateFilter === 'any'
      || (dateFilter === 'oct' && r.requested.startsWith('Oct'))
      || (dateFilter === 'nov' && r.requested.startsWith('Nov'))
      || (dateFilter === 'later' && r.requested.startsWith('Dec'));
    return matchesQuery && matchesStatus && matchesDate;
  }), [ofType, query, status, dateFilter]);

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const reset = () => { setStatus('all'); setQuery(''); setDateFilter('any'); setPage(1); };
  const changeFilter = (setter) => (value) => { setter(value); setPage(1); };
  const open = (r) => navigate(`/admin/requests/${r.id}`);

  const columns = [
    { key: 'id', header: 'Request ID', first: true, className: 'font-medium tabular-nums', render: (r) => r.id },
    { key: 'applicant', header: 'Applicant', label: 'Applicant', render: (r) => (
      <div className="flex items-center gap-2.5 text-left"><Avatar name={r.applicant} size={34} /><div><b>{r.applicant}</b><div className="text-[12.5px] text-ink-3">{r.subject}</div></div></div>
    ) },
    { key: 'requested', header: 'Requested date', label: 'Requested', className: 'tabular-nums', render: (r) => r.requested },
    { key: 'submitted', header: 'Submitted', className: 'tabular-nums text-ink-2', render: (r) => r.submitted },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: 'Actions', align: 'right', actions: true, render: (r) => (
      <>
        <IconButton size="sm" label={`View request ${r.id}`} onClick={(e) => { e.stopPropagation(); open(r); }}><Eye size={17} /></IconButton>
        {r.status === 'pending' && canDecide && (
          <>
            <IconButton size="sm" label={`Approve request ${r.id}`} className="text-ok" onClick={(e) => { e.stopPropagation(); setApproving(r); }}><Check size={17} /></IconButton>
            <IconButton size="sm" label={`Reject request ${r.id}`} className="text-bad" onClick={(e) => { e.stopPropagation(); navigate(`/admin/requests/${r.id}`, { state: { reject: true } }); }}><X size={17} /></IconButton>
          </>
        )}
      </>
    ) },
  ];

  const chips = REQUEST_STATUS_FILTERS.map((k) => ({
    value: k,
    label: k === 'all' ? 'All' : STATUS_LABELS[k],
    count: k === 'all' ? ofType.length : ofType.filter((r) => r.status === k).length,
  }));

  return (
    <>
      <PageHeader
        title={`${type} requests`}
        subtitle="Review, approve and schedule sacramental requests."
        actions={(
          <>
            <Button variant="secondary" onClick={() => toast('Request list exported')}><Download size={17} aria-hidden="true" /> Export</Button>
            <Button onClick={() => toast('Walk-in request form opened')}><Plus size={17} aria-hidden="true" /> Walk-in request</Button>
          </>
        )}
      />
      <Tabs tabs={REQUEST_TYPES} value={type} onChange={(t) => { setType(t); reset(); }} label="Sacrament type" />
      <Card>
        <Toolbar>
          <SearchBar value={query} onChange={changeFilter(setQuery)} placeholder="Search name or request ID" />
          <Select aria-label="Requested date" className="w-auto" value={dateFilter} onChange={(e) => changeFilter(setDateFilter)(e.target.value)} options={REQUEST_DATE_FILTERS} />
          <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
        </Toolbar>
        <FilterChips className="px-4 pt-3.5" options={chips} value={status} onChange={changeFilter(setStatus)} />
        {visible.length ? (
          <div className="mt-3">
            <DataTable columns={columns} rows={visible} getRowKey={(r) => r.id} onRowClick={open} caption={`${type} requests`} />
            <Pagination page={current} pages={pages} total={rows.length} perPage={PER_PAGE} onPageChange={setPage} noun="requests" />
          </div>
        ) : (
          <EmptyState icon={Search} title="No requests match your filters" description="Try a different status or clear the search." action={<Button variant="secondary" onClick={reset}>Clear filters</Button>} />
        )}
      </Card>

      <ConfirmModal
        open={!!approving}
        onClose={() => setApproving(null)}
        title="Approve this request?"
        tone="success"
        confirmLabel="Approve request"
        onConfirm={() => {
          updateRequest(approving.id, { status: 'approved' }, `Approved by ${admin.name}`);
          toast(`Request ${approving.id} approved`);
          setApproving(null);
        }}
      >
        {approving && <p>{approving.id} from <b>{approving.applicant}</b> will be approved and the parishioner will be notified.</p>}
      </ConfirmModal>
    </>
  );
}
