import { useEffect, useState } from 'react';
import { BarChart3, Check, Clock, Download, Printer, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { LoadingState } from '../../components/ui/Loading.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Field.jsx';
import Toolbar from '../../components/layout/Toolbar.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import { BarChart, ProgressRow } from '../../components/common/Charts.jsx';
import { usePageMeta } from '../../context/AdminShellContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { REPORT_RANGES } from '../../data/reports.js';
import { api } from '../../api/client.js';

const REPORT_TYPES = ['All requests', 'Baptism', 'Marriage', 'Confirmation', 'Funeral', 'Appointments', 'Parishioners', 'Certificates', 'Events'];
const STAT_ICONS = [BarChart3, Clock, Check, X];

function exportCsv(report) {
  const lines = [['Month', 'Count'], ...report.months.map((row) => [row.label, row.count])];
  const csv = lines.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'parish-report.csv'; anchor.click(); URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  usePageMeta('Reports', 'Communication');
  const toast = useToast();
  const [type, setType] = useState('All requests');
  const [range, setRange] = useState('6');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    setLoading(true); setError('');
    const queryType = type === 'All requests' ? '' : `&sacrament_type=${encodeURIComponent(type)}`;
    api(`/reports?months=${range}${queryType}`)
      .then((data) => { if (current) setReport(data); })
      .catch((e) => { if (current) setError(e.message); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [type, range]);

  const reset = () => { setType('All requests'); setRange('6'); };
  const values = report?.months || [];
  const rows = values.map((item, index) => {
    const previous = values[index - 1]?.count;
    const change = previous ? Math.round(((item.count - previous) / previous) * 100) : null;
    return { month: item.label, count: item.count, change };
  });
  const breakdown = report?.breakdown || [];
  const stats = report ? [
    [type === 'All requests' ? 'Total requests' : type, report.total, 'in this period'],
    ...breakdown.slice(0, 3).map((part) => [part.label, part.count, `${Math.round(part.share * 100)}% of total`]),
  ] : [];

  const columns = [
    { key: 'month', header: 'Month', first: true, render: (r) => r.month },
    { key: 'count', header: type, label: 'Count', className: 'tabular-nums', render: (r) => r.count },
    { key: 'change', header: 'Change', className: 'tabular-nums', render: (r) => (r.change === null ? 'n/a' : `${r.change > 0 ? '+' : ''}${r.change}%`) },
  ];

  return (
    <>
      <PageHeader title="Reports" subtitle="Live summaries of requests, appointments, parishioners, certificates and events."
        actions={<><Button variant="secondary" onClick={() => window.print()}><Printer size={17} aria-hidden="true" /> Print</Button><Button disabled={!report} onClick={() => { if (report) { exportCsv(report); toast('Report exported as CSV'); } }}><Download size={17} aria-hidden="true" /> Export CSV</Button></>} />
      <Card className="mb-5"><Toolbar className="!border-b-0">
        <Select aria-label="Report type" className="w-auto" value={type} onChange={(e) => setType(e.target.value)} options={REPORT_TYPES} />
        <Select aria-label="Date range" className="w-auto" value={range} onChange={(e) => setRange(e.target.value)} options={REPORT_RANGES} />
      </Toolbar></Card>
      {loading ? <Card><CardBody><LoadingState label="Loading report" /></CardBody></Card>
        : error ? <Card><EmptyState icon={BarChart3} title="Report could not be loaded" description={error} action={<Button variant="secondary" onClick={reset}>Reset filters</Button>} /></Card>
          : !report?.total ? <Card><EmptyState icon={BarChart3} title="No data for this period" description="There are no records for the selected date range." action={<Button variant="secondary" onClick={reset}>Reset filters</Button>} /></Card>
            : <>
              <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:gap-3">{stats.map(([label, value, detail], i) => <StatCard key={label} icon={STAT_ICONS[i]} value={value} label={label} detail={detail} />)}</div>
              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_420px] items-start gap-5 max-lg:grid-cols-1">
                <Card><CardHeader title="Monthly trend" /><CardBody><BarChart data={values.map((item) => ({ label: item.label, value: item.count }))} label="Monthly trend" /></CardBody></Card>
                <Card><CardHeader title="Breakdown" /><CardBody className="flex flex-col gap-3.5">{breakdown.map((part) => <ProgressRow key={part.label} label={part.label} value={part.count} share={part.share} />)}</CardBody></Card>
              </div>
              <Card className="mt-5"><CardHeader title="Month by month" /><DataTable columns={columns} rows={rows} getRowKey={(r) => r.month} caption="Month by month" /></Card>
            </>}
    </>
  );
}
