import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { one } from '../lib/server';

export default createEndpoint({
  description: 'Public directory of freelancers with skills and ratings',
  inputSchema: z.object({ search: z.string().optional(), skill: z.string().optional() }),
  outputSchema: z.any(),
  execute: async ({ input }) => {
    const [{ records: profiles }, { records: reviews }] = await Promise.all([
      zite.profiles.findAll({ filters: { role: 'Freelancer' }, limit: 2000 }),
      zite.reviews.findAll({ limit: 2000 }),
    ]);
    const stats: Record<string, { sum: number; n: number }> = {};
    for (const r of reviews) {
      const f = one(r.freelancer);
      if (!f) continue;
      stats[f] ??= { sum: 0, n: 0 };
      stats[f].sum += r.rating ?? 0;
      stats[f].n += 1;
    }
    const q = (input.search ?? '').toLowerCase().trim();
    const list = profiles
      .filter((p) => !p.blocked && !!one(p.user) && !!p.displayName)
      .filter((p) => {
        const skills = (p.skills ?? []) as string[];
        if (input.skill && !skills.includes(input.skill)) return false;
        if (!q) return true;
        return (p.displayName ?? '').toLowerCase().includes(q) || skills.some((s) => s.toLowerCase().includes(q));
      })
      .map((p) => {
        const s = stats[one(p.user)!];
        return {
          userId: one(p.user)!,
          name: p.displayName ?? '',
          country: p.country ?? '',
          hourlyRate: p.hourlyRate ?? null,
          skills: (p.skills ?? []) as string[],
          photo: p.photo?.[0]?.url ?? null,
          rating: s ? s.sum / s.n : null,
          reviewCount: s?.n ?? 0,
        };
      });
    return { freelancers: list };
  },
});
