import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Briefcase, Laptop, User } from 'lucide-react';
import { useUpload } from 'zitejs/upload';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { cn } from '@project/components/lib/utils';
import { saveProfile } from 'zitejs/api';
import SkillPicker from '../components/SkillPicker';
import { errMsg } from '../lib/constants';
import { useMe } from '../lib/me';

export default function Profile() {
  const { me, refresh } = useMe();
  const nav = useNavigate();
  const { upload, isUploading } = useUpload();
  const p = me?.profile;
  const isNew = !p;
  const [role, setRole] = useState<'Client' | 'Freelancer'>((localStorage.getItem('souls254_role') as 'Client') || 'Freelancer');
  const [name, setName] = useState(''); const [country, setCountry] = useState('Kenya');
  const [bio, setBio] = useState(''); const [skills, setSkills] = useState<string[]>([]);
  const [rate, setRate] = useState(''); const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!p) return;
    setRole(p.role as 'Client'); setName(p.displayName); setCountry(p.country); setBio(p.bio);
    setSkills(p.skills); setRate(p.hourlyRate != null ? String(p.hourlyRate) : ''); setPhoto(p.photo);
  }, [p]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { setPhoto((await upload(f)).url); } catch (err) { toast.error(errMsg(err)); }
  };
  const submit = async () => {
    setSaving(true);
    try {
      await saveProfile({ displayName: name, role, country, bio, skills, hourlyRate: rate ? Number(rate) : null, photoUrl: photo });
      localStorage.removeItem('souls254_role');
      await refresh(); toast.success('Profile saved');
      if (isNew) nav('/jobs');
    } catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };
  const freelancer = role === 'Freelancer';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold">{isNew ? 'Welcome to Souls 254' : 'Your profile'}</h1>
      {isNew && <p className="text-muted-foreground mt-1">Tell us who you are. Your role can't be changed later.</p>}
      <div className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-6">
        {isNew ? (
          <div className="grid grid-cols-2 gap-3">
            {([['Freelancer', Laptop, 'I want to work'], ['Client', Briefcase, 'I want to hire']] as const).map(([r, Icon, l]) => (
              <button key={r} type="button" onClick={() => setRole(r)} className={cn('rounded-xl border-2 p-4 text-left transition', role === r ? 'border-primary bg-accent' : 'border-border')}>
                <Icon className="h-5 w-5 text-primary" /><p className="mt-2 font-semibold">{r}</p><p className="text-xs text-muted-foreground">{l}</p>
              </button>
            ))}
          </div>
        ) : <p className="text-sm">Role: <b>{role}</b></p>}
        <div className="flex items-center gap-4">
          {photo ? <img src={photo} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center"><User className="h-6 w-6 text-muted-foreground" /></div>}
          <Label className="cursor-pointer text-sm text-primary">{isUploading ? 'Uploading…' : 'Upload photo'}<input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={isUploading} /></Label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} />{!name.trim() && <p className="text-xs text-destructive mt-1">Required</p>}</div>
          <div><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
        </div>
        <div><Label>Bio</Label><Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder={freelancer ? 'What do you do best?' : 'About you or your business'} /></div>
        {freelancer && <>
          <div><Label>Skills</Label><div className="mt-2"><SkillPicker value={skills} onChange={setSkills} /></div></div>
          <div className="sm:w-48"><Label>Hourly rate (USD)</Label><Input type="number" min={0} value={rate} onChange={(e) => setRate(e.target.value)} /></div>
        </>}
        <Button disabled={!name.trim() || saving || isUploading} onClick={submit}>{saving ? 'Saving…' : isNew ? 'Create profile' : 'Save changes'}</Button>
      </div>
    </div>
  );
}
