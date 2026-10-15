import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Badge } from '@project/components/ui/badge';
import { listJobs, ListJobsOutputType } from 'zitejs/api';
import { money, shortDate } from '../lib/constants';

export type JobCardData = ListJobsOutputType['jobs'][0];

export function JobCard({ job }: { job: JobCardData }) {
  return (
    <Link to={`/jobs/${job.id}`} className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="text-xs font-semibold uppercase tracking-wide text-primary">{job.category}</span>
      <h3 className="mt-1 font-semibold text-card-foreground group-hover:text-primary line-clamp-2">{job.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{job.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 3).map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-lg font-bold text-foreground">{money(job.budget)}</span>
        <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{shortDate(job.dueDate)}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{job.clientName}{job.clientCountry && ` · ${job.clientCountry}`}</p>
    </Link>
  );
}

export function LatestJobs() {
  const [jobs, setJobs] = useState<JobCardData[] | null>(null);
  useEffect(() => { listJobs({ limit: 5 }).then((r) => setJobs(r.jobs)).catch(() => setJobs([])); }, []);
  if (!jobs) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}</div>;
  if (!jobs.length) return <p className="text-muted-foreground">No open jobs yet — be the first to post one.</p>;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>;
}
