import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Textarea } from '@project/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';
import { getJob, applyToJob, hireApplicant, deleteJob, GetJobOutputType } from 'zitejs/api';
import JobFormDialog from '../components/JobFormDialog';
import { Spinner } from '../components/RequireAuth';
import { errMsg, money, shortDate } from '../lib/constants';
import { useMe } from '../lib/me';

export default function JobDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { me } = useMe();
  const [data, setData] = useState<GetJobOutputType | null>(null);
  const [pitch, setPitch] = useState('');
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);

  const load = () => getJob({ jobId: id! }).then(setData).catch((e) => { toast.error(errMsg(e)); nav('/jobs'); });
  useEffect(() => { load(); }, [id]);
  if (!data) return <Spinner />;
  const { job, isClient, isHired, applications } = data;
  const isFreelancer = me?.profile?.role === 'Freelancer';
  const myApp = !isClient ? applications[0] : undefined;

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    setBusy(true);
    try { await fn(); toast.success(msg); await load(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />All jobs</Link>
      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">{job.category}</span>
            <h1 className="font-display text-3xl font-bold mt-1">{job.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{job.clientName}{job.clientCountry && ` · ${job.clientCountry}`}</p>
          </div>
          <Badge variant="outline">{job.status}</Badge>
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <span className="text-2xl font-bold">{money(job.budget)}</span>
          <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-4 w-4" />Due {shortDate(job.dueDate)}</span>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-foreground/90">{job.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">{job.skills.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
        <div className="mt-6 flex flex-wrap gap-2">
          {(isClient || isHired) && job.hiredFreelancerId && (
            <Button onClick={() => nav(`/messages/${job.id}`)}><MessageCircle className="h-4 w-4 mr-1" />Open chat</Button>
          )}
          {isClient && job.status === 'Open' && <>
            <Button variant="outline" onClick={() => setEdit(true)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="outline"><Trash2 className="h-4 w-4 mr-1" />Delete</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete this job?</AlertDialogTitle><AlertDialogDescription>This can't be undone.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => { try { await deleteJob({ jobId: job.id }); toast.success('Job deleted'); nav('/jobs'); } catch (e) { toast.error(errMsg(e)); } }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>}
        </div>
      </div>

      {isFreelancer && job.status === 'Open' && !myApp && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Apply for this job</h2>
          <Textarea className="mt-3" rows={4} placeholder="Why are you a good fit? (at least 10 characters)" value={pitch} onChange={(e) => setPitch(e.target.value)} />
          <Button className="mt-3" disabled={pitch.trim().length < 10 || busy} onClick={() => act(() => applyToJob({ jobId: job.id, pitch }), 'Application sent')}>Send application</Button>
        </div>
      )}
      {myApp && <p className="mt-6 rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">Your application status: <b>{myApp.status}</b></p>}

      {isClient && (
        <div className="mt-6">
          <h2 className="font-semibold mb-3">Applicants ({applications.length})</h2>
          {!applications.length && <p className="text-sm text-muted-foreground">No applications yet.</p>}
          <div className="space-y-3">
            {applications.map((a: GetJobOutputType['applications'][0]) => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link to={`/freelancers/${a.freelancerId}`} className="font-medium hover:text-primary">{a.freelancerName}</Link>
                  {job.status === 'Open'
                    ? <Button size="sm" disabled={busy} onClick={() => act(() => hireApplicant({ applicationId: a.id }), 'Freelancer hired')}>Hire</Button>
                    : <Badge variant="outline">{a.status}</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{a.pitch}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <JobFormDialog open={edit} onOpenChange={setEdit} onSaved={() => load()} initial={{ ...job, dueDate: job.dueDate }} />
    </div>
  );
}
