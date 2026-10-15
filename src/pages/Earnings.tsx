import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@project/components/ui/table';
import { getEarnings, GetEarningsOutputType } from 'zitejs/api';
import { Spinner } from '../components/RequireAuth';
import { money, shortDate } from '../lib/constants';
import { useMe } from '../lib/me';

type Row = GetEarningsOutputType['earned'][0];

export default function Earnings() {
  const { me } = useMe();
  const [data, setData] = useState<GetEarningsOutputType | null>(null);
  const [sort, setSort] = useState<{ key: 'completedAt' | 'amount'; dir: 1 | -1 }>({ key: 'completedAt', dir: -1 });
  const [page, setPage] = useState(0);
  useEffect(() => { getEarnings({}).then(setData).catch(() => {}); }, []);
  const isClient = me?.profile?.role === 'Client';
  const rows: Row[] = data ? (isClient ? data.spent : data.earned) : [];
  const sorted = useMemo(() => [...rows].sort((a, b) =>
    sort.key === 'amount' ? (a.amount - b.amount) * sort.dir : a.completedAt.localeCompare(b.completedAt) * sort.dir), [rows, sort]);
  if (!data) return <Spinner />;
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const pages = Math.max(1, Math.ceil(sorted.length / 20));
  const toggle = (key: 'completedAt' | 'amount') => setSort((s) => ({ key, dir: s.key === key ? (-s.dir as 1 | -1) : -1 }));

  const stats = [
    { l: isClient ? 'Total spent' : 'Total earned', v: money(total) },
    { l: 'Jobs completed', v: rows.length },
    isClient ? { l: 'In progress', v: data.inProgress } : { l: 'Average rating', v: data.averageRating ? data.averageRating.toFixed(1) : '—' },
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">{isClient ? 'Spending' : 'Earnings'}</h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => <div key={s.l} className="rounded-xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{s.l}</p><p className="text-3xl font-bold mt-1">{s.v}</p></div>)}
      </div>
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Job</TableHead><TableHead>{isClient ? 'Freelancer' : 'Client'}</TableHead>
            <TableHead><Button variant="ghost" size="sm" onClick={() => toggle('completedAt')}>Completed<ArrowUpDown className="h-3 w-3 ml-1" /></Button></TableHead>
            <TableHead>Paid via</TableHead>
            <TableHead className="text-right"><Button variant="ghost" size="sm" onClick={() => toggle('amount')}>Amount<ArrowUpDown className="h-3 w-3 ml-1" /></Button></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {!sorted.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No completed jobs yet.</TableCell></TableRow>}
            {sorted.slice(page * 20, page * 20 + 20).map((r) => (
              <TableRow key={r.id}><TableCell className="font-medium">{r.title}</TableCell><TableCell>{r.other}{r.otherCountry && ` (${r.otherCountry})`}</TableCell>
                <TableCell>{shortDate(r.completedAt)}</TableCell><TableCell>{r.paymentMethod}</TableCell><TableCell className="text-right font-semibold">{money(r.amount)}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pages > 1 && <div className="flex justify-end items-center gap-2 mt-4 text-sm">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
        <span>{page + 1} / {pages}</span>
        <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button>
      </div>}
    </div>
  );
}
