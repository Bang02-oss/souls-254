import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Badge } from '@project/components/ui/badge';
import { cn } from '@project/components/lib/utils';
import { getMessages, sendMessage, GetMessagesOutputType } from 'zitejs/api';
import CompleteJobDialog from './CompleteJobDialog';
import { errMsg } from '../lib/constants';

type Msg = GetMessagesOutputType['messages'][0];

export default function ChatThread({ jobId }: { jobId: string }) {
  const [data, setData] = useState<GetMessagesOutputType | null>(null);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [pending, setPending] = useState<Msg[]>([]);
  const [complete, setComplete] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const load = () => getMessages({ jobId }).then((d) => { setData(d); setPending([]); }).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [jobId]);
  const count = (data?.messages.length ?? 0) + pending.length;
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [count]);

  if (error) return <div className="m-auto text-sm text-muted-foreground">{error}</div>;
  if (!data) return <div className="m-auto text-sm text-muted-foreground">Loading…</div>;

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    setPending((p) => [...p, { id: `tmp-${Date.now()}`, body, mine: true, senderName: '', sentAt: new Date().toISOString() }]);
    try { await sendMessage({ jobId, body }); load(); }
    catch (e) { toast.error(errMsg(e)); setPending([]); setText(body); }
  };

  const closed = data.job.status !== 'In Progress';
  return (
    <>
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Link to="/messages" className="md:hidden"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="min-w-0"><Link to={`/jobs/${jobId}`} className="font-semibold line-clamp-1 hover:text-primary">{data.job.title}</Link><p className="text-xs text-muted-foreground">with {data.otherName}</p></div>
        </div>
        {data.isClient && data.job.status === 'In Progress'
          ? <Button size="sm" onClick={() => setComplete(true)}>Mark completed & paid</Button>
          : <Badge variant="outline">{data.job.status}{data.job.paid && ` · Paid via ${data.job.paymentMethod}`}</Badge>}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {[...data.messages, ...pending].map((m) => (
          <div key={m.id} className={cn('max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap', m.mine ? 'self-end bg-primary text-primary-foreground' : 'self-start bg-muted')}>{m.body}</div>
        ))}
        {!count && <p className="m-auto text-sm text-muted-foreground">Say hello 👋</p>}
        <div ref={bottom} />
      </div>
      {!closed && (
        <form className="flex gap-2 p-3 border-t border-border" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" />
          <Button type="submit" disabled={!text.trim()}><Send className="h-4 w-4" /></Button>
        </form>
      )}
      <CompleteJobDialog open={complete} onOpenChange={setComplete} jobId={jobId} budget={data.job.budget} onDone={load} />
    </>
  );
}
