import { cn } from '@project/components/lib/utils';
import { SKILLS } from '../lib/constants';

export default function SkillPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SKILLS.map((s) => {
        const on = value.includes(s);
        return (
          <button type="button" key={s} onClick={() => onChange(on ? value.filter((x) => x !== s) : [...value, s])}
            className={cn('rounded-full border px-3 py-1 text-sm transition', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary')}>
            {s}
          </button>
        );
      })}
    </div>
  );
}
