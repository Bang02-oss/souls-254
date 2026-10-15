import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@project/components/ui/badge';
import { myJobs, MyJobsOutputType } from 'zitejs/api';
import { money } from '../lib/constants';

export default function MyJobs({ role }: { role: string }) {
  const [data, setData] = useState<MyJobsOutputType | null>(null);
  useEffect(() => { myJobs({}).then(setData).catch(() => {}); }, []);
  if (!data) return null;
  const items = role === 'Client'
    ? data.posted.map((j: MyJobsOutputType['posted'][0]) => ({ key: j.id, to: `/jobs/${j.id}`, title: j.title, status: j.status, sub: `${j.applicationCount} applicants · ${money(j.budget)}` }))
    : data.applied.map((a: MyJobsOutputType['applied'][0]) => ({ key: a.id, to: `/jobs/${a.jobId}`, title: a.title, status: a.status, sub: money(a.budget) }));
  if (!items.length) return null;
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{role === 'Client' ? 'Your posted jobs' : 'Your applications'}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((i) => (
          <Link key={i.key} to={i.to} className="min-w-[220px] rounded-xl border border-border bg-card p-4 hover:border-primary">
            <Badge variant="outline">{i.status}</Badge>
            <p className="mt-2 font-medium line-clamp-1">{i.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{i.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
