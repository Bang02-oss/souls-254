import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { one, profileMap } from '../lib/server';

export default createEndpoint({
  description: 'Returns earnings (freelancer) or spending (client) from completed jobs',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.any(),
  execute: async ({ context }) => {
    const me = context.user.id;
    const [earned, spent, inProgA, inProgB, reviews] = await Promise.all([
      zite.jobs.findAll({ filters: { hiredFreelancer: me, status: 'Completed' }, limit: 2000 }),
      zite.jobs.findAll({ filters: { client: me, status: 'Completed' }, limit: 2000 }),
      zite.jobs.findAll({ filters: { hiredFreelancer: me, status: 'In Progress' }, limit: 2000 }),
      zite.jobs.findAll({ filters: { client: me, status: 'In Progress' }, limit: 2000 }),
      zite.reviews.findAll({ filters: { freelancer: me }, limit: 2000 }),
    ]);
    const all = [...earned.records, ...spent.records];
    const names = await profileMap(all.flatMap((j) => [one(j.client), one(j.hiredFreelancer)]));
    const rows = (list: typeof all, otherKey: 'client' | 'hiredFreelancer') =>
      list.map((j) => ({
        id: j.id,
        title: j.title ?? '',
        other: names[one(j[otherKey]) ?? '']?.name ?? '',
        otherCountry: names[one(j[otherKey]) ?? '']?.country ?? '',
        completedAt: j.completedAt ?? '',
        paymentMethod: j.paymentMethod ?? '',
        amount: j.budget ?? 0,
      }));
    const avg = reviews.records.length
      ? reviews.records.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.records.length
      : null;
    return {
      earned: rows(earned.records, 'client'),
      spent: rows(spent.records, 'hiredFreelancer'),
      inProgress: inProgA.records.length + inProgB.records.length,
      averageRating: avg,
    };
  },
});
