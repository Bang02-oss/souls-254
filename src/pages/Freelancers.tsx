import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Search, Star, User } from 'lucide-react';
import { Input } from '@project/components/ui/input';
import { Badge } from '@project/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { listFreelancers, ListFreelancersOutputType } from 'zitejs/api';
import { SKILLS, money } from '../lib/constants';

type F = ListFreelancersOutputType['freelancers'][0];

export default function Freelancers() {
  const [search, setSearch] = useState('');
  const [q] = useDebounce(search, 350);
  const [skill, setSkill] = useState('all');
  const [sort, setSort] = useState('rating');
  const [list, setList] = useState<F[] | null>(null);

  useEffect(() => {
    setList(null);
    listFreelancers({ search: q || undefined, skill: skill === 'all' ? undefined : skill }).then((r) => setList(r.freelancers)).catch(() => setList([]));
  }, [q, skill]);

  const sorted = useMemo(() => [...(list ?? [])].sort((a, b) =>
    sort === 'rating' ? (b.rating ?? 0) - (a.rating ?? 0) : sort === 'rateLow' ? (a.hourlyRate ?? 1e9) - (b.hourlyRate ?? 1e9) : a.name.localeCompare(b.name),
  ), [list, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">Freelancers</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search by name or skill" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select value={skill} onValueChange={setSkill}><SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Any skill</SelectItem>{SKILLS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        <Select value={sort} onValueChange={setSort}><SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="rating">Sort: Top rated</SelectItem><SelectItem value="rateLow">Sort: Lowest rate</SelectItem><SelectItem value="name">Sort: Name</SelectItem></SelectContent></Select>
      </div>
      {!list ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : !sorted.length ? <p className="py-16 text-center text-muted-foreground">No freelancers found.</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((f) => (
            <Link key={f.userId} to={`/freelancers/${f.userId}`} className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition">
              <div className="flex items-center gap-3">
                {f.photo ? <img src={f.photo} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center"><User className="h-5 w-5 text-muted-foreground" /></div>}
                <div><p className="font-semibold">{f.name}</p><p className="text-xs text-muted-foreground">{f.country || '—'}{f.hourlyRate != null && ` · ${money(f.hourlyRate)}/hr`}</p></div>
              </div>
              <p className="mt-3 text-sm flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{f.rating ? f.rating.toFixed(1) : 'New'} · {f.reviewCount} reviews</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{f.skills.slice(0, 4).map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
