import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@project/components/lib/utils';
import { listConversations, ListConversationsOutputType } from 'zitejs/api';
import ChatThread from '../components/ChatThread';

type C = ListConversationsOutputType['conversations'][0];

export default function Messages() {
  const { jobId } = useParams();
  const [convos, setConvos] = useState<C[] | null>(null);
  useEffect(() => { listConversations({}).then((r) => setConvos(r.conversations)).catch(() => setConvos([])); }, [jobId]);

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-6 py-0 sm:py-6">
      <div className="flex h-[calc(100vh-8rem)] min-h-[480px] sm:rounded-2xl border border-border bg-card overflow-hidden">
        <aside className={cn('w-full md:w-72 border-r border-border overflow-y-auto', jobId && 'hidden md:block')}>
          <div className="px-4 py-4 font-semibold">Conversations</div>
          {!convos && <div className="px-4 space-y-2">{[0, 1].map((i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>}
          {convos && !convos.length && <p className="px-4 text-sm text-muted-foreground">Chats appear here once a client hires a freelancer.</p>}
          {convos?.map((c) => (
            <Link key={c.jobId} to={`/messages/${c.jobId}`} className={cn('block px-4 py-3 border-t border-border', c.jobId === jobId ? 'bg-accent' : 'hover:bg-muted')}>
              <p className="text-sm font-medium line-clamp-1">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c.otherName}{c.otherCountry && ` (${c.otherCountry})`} · {c.status}</p>
            </Link>
          ))}
        </aside>
        <section className={cn('flex-1 flex flex-col', !jobId && 'hidden md:flex')}>
          {jobId ? <ChatThread key={jobId} jobId={jobId} /> : <div className="m-auto text-sm text-muted-foreground">Pick a conversation</div>}
        </section>
      </div>
    </div>
  );
}
