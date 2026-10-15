import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Search, Plus } from 'lucide-react';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { listJobs } from 'zitejs/api';
import { JobCard, JobCardData } from '../components/JobCard';
import JobFormDialog from '../components/JobFormDialog';
import MyJobs from '../components/MyJobs';
import { CATEGORIES, SKILLS } from '../lib/constants';
import { useMe } from '../lib/me';

export default function Jobs() {
  const { user } = useAuth();
  const { me } = useMe();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [q] = useDebounce(search, 350);
  const category = params.get('category') ?? 'all';
  const [skill, setSkill] = useState('all');
  const [jobs, setJobs] = useState<JobCardData[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setJobs(null);
    listJobs({ search: q || undefined, category: category === 'all' ? undefined : category, skill: skill === 'all' ? undefined : skill })
      .then((r) => { setJobs(r.jobs); setPage(1); }).catch(() => setJobs([]));
  };
  useEffect(load, [q, category, skill]);

  const isClient = me?.profile?.role === 'Client';
  const shown = (jobs ?? []).slice(0, page * 12);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-3xl font-bold">Jobs</h1>
        {(isClient || !user) && (
          <Button onClick={() => (user ? setFormOpen(true) : loginWithRedirect())}><Plus className="h-4 w-4 mr-1" />Post a job</Button>
        )}
      </div>
      {user && me?.profile && <MyJobs role={me.profile.role} />}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search jobs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={(v) => setParams(v === 'all' ? {} : { category: v })}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All categories</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={skill} onValueChange={setSkill}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Any skill</SelectItem>{SKILLS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {!jobs ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : !jobs.length ? (
        <p className="py-16 text-center text-muted-foreground">No open jobs match your filters.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map((j) => <JobCard key={j.id} job={j} />)}</div>
          {shown.length < jobs.length && <div className="mt-8 text-center"><Button variant="outline" onClick={() => setPage(page + 1)}>Load more</Button></div>}
        </>
      )}
      <JobFormDialog open={formOpen} onOpenChange={setFormOpen} onSaved={load} />
    </div>
  );
}
