import { useState } from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@project/components/ui/dialog';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { completeJob } from 'zitejs/api';
import { PAYMENT_METHODS, errMsg, money } from '../lib/constants';

export default function CompleteJobDialog({ open, onOpenChange, jobId, budget, onDone }: {
  open: boolean; onOpenChange: (o: boolean) => void; jobId: string; budget: number; onDone: () => void;
}) {
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number] | ''>('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!method || !rating) return;
    setSaving(true);
    try { await completeJob({ jobId, paymentMethod: method, rating, comment }); toast.success('Job completed — thanks for the review!'); onOpenChange(false); onDone(); }
    catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Complete & mark paid</DialogTitle><DialogDescription>Confirm you've paid {money(budget)} outside the app, then rate the freelancer.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div><Label>How did you pay?</Label>
            <Select value={method || undefined} onValueChange={(v) => setMethod(v as typeof method)}>
              <SelectTrigger><SelectValue placeholder="Payment method" /></SelectTrigger>
              <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Rating</Label>
            <div className="flex gap-1 mt-1">{[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}><Star className={`h-7 w-7 ${n <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} /></button>
            ))}</div>
          </div>
          <div><Label>Review (optional)</Label><Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} /></div>
        </div>
        <DialogFooter><Button disabled={!method || !rating || saving} onClick={submit}>{saving ? 'Saving…' : 'Complete job'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
