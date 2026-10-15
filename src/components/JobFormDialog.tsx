import { useEffect, useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@project/components/ui/dialog';
import { Input } from '@project/components/ui/input';
import { Textarea } from '@project/components/ui/textarea';
import { Label } from '@project/components/ui/label';
import { Button } from '@project/components/ui/button';
import { DatePicker } from '@project/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { saveJob } from 'zitejs/api';
import SkillPicker from './SkillPicker';
import { CATEGORIES, errMsg } from '../lib/constants';

const schema = z.object({
  title: z.string().min(3, 'At least 3 characters'),
  description: z.string().min(10, 'At least 10 characters'),
  category: z.string().min(1, 'Pick a category'),
  budget: z.number({ invalid_type_error: 'Enter a budget' }).positive('Must be more than 0'),
  dueDate: z.date({ required_error: 'Pick a due date' }),
});

export type JobInitial = { id: string; title: string; description: string; category: string; skills: string[]; budget: number; dueDate: string | null };

export default function JobFormDialog({ open, onOpenChange, onSaved, initial }: {
  open: boolean; onOpenChange: (o: boolean) => void; onSaved: (id: string) => void; initial?: JobInitial;
}) {
  const [title, setTitle] = useState(''); const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); const [skills, setSkills] = useState<string[]>([]);
  const [budget, setBudget] = useState(''); const [dueDate, setDueDate] = useState<Date | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? ''); setDescription(initial?.description ?? ''); setCategory(initial?.category ?? '');
    setSkills(initial?.skills ?? []); setBudget(initial ? String(initial.budget) : '');
    setDueDate(initial?.dueDate ? new Date(initial.dueDate) : undefined);
  }, [open, initial]);

  const parsed = schema.safeParse({ title, description, category, budget: budget === '' ? undefined : Number(budget), dueDate });
  const errors = parsed.success ? {} : parsed.error.flatten().fieldErrors;
  const touched = title || description || budget;

  const submit = async () => {
    if (!parsed.success) return;
    setSaving(true);
    try {
      const d = parsed.data;
      const r = await saveJob({ id: initial?.id, ...d, skills, dueDate: d.dueDate.toISOString().slice(0, 10) });
      toast.success(initial ? 'Job updated' : 'Job posted');
      onOpenChange(false); onSaved(r.id);
    } catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };

  const err = (k: keyof typeof errors) => touched && errors[k]?.[0] && <p className="text-xs text-destructive mt-1">{errors[k]![0]}</p>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? 'Edit job' : 'Post a job'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Logo for my bakery" />{err('title')}</div>
          <div><Label>Description</Label><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />{err('description')}</div>
          <div><Label>Category</Label>
            <Select value={category || undefined} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>{err('category')}
          </div>
          <div><Label>Skills needed</Label><div className="mt-2"><SkillPicker value={skills} onChange={setSkills} /></div></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Budget (USD)</Label><Input type="number" min={1} value={budget} onChange={(e) => setBudget(e.target.value)} />{err('budget')}</div>
            <div><Label>Due date</Label><DatePicker value={dueDate} onChange={setDueDate} />{err('dueDate')}</div>
          </div>
        </div>
        <DialogFooter><Button disabled={!parsed.success || saving} onClick={submit}>{saving ? 'Saving…' : initial ? 'Save changes' : 'Post job'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
