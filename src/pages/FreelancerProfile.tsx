import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Star, User } from 'lucide-react';
import { Badge } from '@project/components/ui/badge';
import { getFreelancer, GetFreelancerOutputType } from 'zitejs/api';
import { Spinner } from '../components/RequireAuth';
import { errMsg, money, shortDate } from '../lib/constants';

export default function FreelancerProfile() {
  const { id } = useParams();
  const [f, setF] = useState<GetFreelancerOutputType | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { getFreelancer({ userId: id! }).then(setF).catch((e) => setError(errMsg(e))); }, [id]);
  if (error) return <p className="py-24 text-center text-muted-foreground">{error}</p>;
  if (!f) return <Spinner />;
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/freelancers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />All freelancers</Link>
      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          {f.photo ? <img src={f.photo} alt="" className="h-20 w-20 rounded-full object-cover" /> : <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center"><User className="h-8 w-8 text-muted-foreground" /></div>}
          <div>
            <h1 className="font-display text-3xl font-bold">{f.name}</h1>
            <p className="text-sm text-muted-foreground">{f.country}{f.hourlyRate != null && ` · ${money(f.hourlyRate)}/hr`}</p>
            <p className="mt-1 text-sm flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{f.rating ? f.rating.toFixed(1) : 'New'} · {f.reviews.length} reviews · {f.completedJobs} jobs done</p>
          </div>
        </div>
        {f.bio && <p className="mt-5 whitespace-pre-wrap">{f.bio}</p>}
        <div className="mt-4 flex flex-wrap gap-1.5">{f.skills.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
      </div>
      <h2 className="mt-8 mb-3 font-semibold">Reviews</h2>
      {!f.reviews.length && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
      <div className="space-y-3">
        {f.reviews.map((r: GetFreelancerOutputType['reviews'][0]) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= r.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />)}</span>
              <span className="text-xs text-muted-foreground">{r.reviewer} · {shortDate(r.created)}</span>
            </div>
            {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
