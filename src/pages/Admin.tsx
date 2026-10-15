import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Badge } from '@project/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@project/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';
import { adminData, adminAction, AdminDataOutputType, AdminActionInputType } from 'zitejs/api';
import { Spinner } from '../components/RequireAuth';
import { errMsg, shortDate } from '../lib/constants';

function Confirm({ label, title, onYes, variant = 'destructive' }: { label: string; title: string; onYes: () => void; variant?: 'destructive' | 'outline' }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button size="sm" variant={variant}>{label}</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>Please confirm.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onYes}>{label}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function Admin() {
  const [data, setData] = useState<AdminDataOutputType | null>(null);
  const [q, setQ] = useState('');
  const load = () => adminData({}).then(setData).catch((e) => toast.error(errMsg(e)));
  useEffect(() => { load(); }, []);
  if (!data) return <Spinner />;
  const run = async (input: AdminActionInputType, msg: string) => {
    try { await adminAction(input); toast.success(msg); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  const s = q.toLowerCase();
  const jobs = data.jobs.filter((j: AdminDataOutputType['jobs'][0]) => (j.title + j.client).toLowerCase().includes(s));
  const users = data.users.filter((u: AdminDataOutputType['users'][0]) => (u.name + u.country).toLowerCase().includes(s));
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">Admin</h1>
      <Tabs defaultValue="jobs">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <TabsList><TabsTrigger value="jobs">Jobs ({data.jobs.length})</TabsTrigger><TabsTrigger value="users">Users ({data.users.length})</TabsTrigger></TabsList>
          <Input className="sm:ml-auto sm:w-72" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <TabsContent value="jobs"><div className="rounded-xl border border-border bg-card overflow-x-auto"><Table>
          <TableHeader><TableRow><TableHead>Job</TableHead><TableHead>Client</TableHead><TableHead>Status</TableHead><TableHead>Posted</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{jobs.map((j: AdminDataOutputType['jobs'][0]) => (
            <TableRow key={j.id}><TableCell className="font-medium">{j.title}</TableCell><TableCell>{j.client}</TableCell><TableCell><Badge variant="outline">{j.status}</Badge></TableCell><TableCell>{shortDate(j.created)}</TableCell>
              <TableCell className="text-right">{j.status !== 'Removed' && <Confirm label="Remove" title={`Remove "${j.title}"?`} onYes={() => run({ action: 'removeJob', id: j.id }, 'Job removed')} />}</TableCell></TableRow>
          ))}</TableBody></Table></div></TabsContent>
        <TabsContent value="users"><div className="rounded-xl border border-border bg-card overflow-x-auto"><Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Country</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{users.map((u: AdminDataOutputType['users'][0]) => (
            <TableRow key={u.id}><TableCell className="font-medium">{u.name}</TableCell><TableCell>{u.role}</TableCell><TableCell>{u.country}</TableCell><TableCell>{u.blocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="secondary">Active</Badge>}</TableCell>
              <TableCell className="text-right">{u.blocked
                ? <Confirm variant="outline" label="Unblock" title={`Unblock ${u.name}?`} onYes={() => run({ action: 'unblock', id: u.id }, 'User unblocked')} />
                : <Confirm label="Block" title={`Block ${u.name}?`} onYes={() => run({ action: 'block', id: u.id }, 'User blocked')} />}</TableCell></TableRow>
          ))}</TableBody></Table></div></TabsContent>
      </Tabs>
    </div>
  );
}
