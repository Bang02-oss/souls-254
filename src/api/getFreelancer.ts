import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { getProfile, one, profileMap } from '../lib/server';

export default createEndpoint({
  description: 'Public profile of one freelancer with completed jobs and reviews',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.any(),
  execute: async ({ input }) => {
    const p = await getProfile(input.userId);
    if (!p || p.role !== 'Freelancer' || p.blocked) throw new ZiteError({ code: 'NOT_FOUND', message: 'nf', userFacingMessage: 'Freelancer not found.' });
    const [{ records: reviews }, { records: jobs }] = await Promise.all([
      zite.reviews.findAll({ filters: { freelancer: input.userId }, limit: 2000 }),
      zite.jobs.findAll({ filters: { hiredFreelancer: input.userId, status: 'Completed' }, limit: 2000 }),
    ]);
    const names = await profileMap(reviews.map((r) => one(r.reviewer)));
    reviews.sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''));
    return {
      name: p.displayName ?? '',
      country: p.country ?? '',
      bio: p.bio ?? '',
      skills: (p.skills ?? []) as string[],
      hourlyRate: p.hourlyRate ?? null,
      photo: p.photo?.[0]?.url ?? null,
      completedJobs: jobs.length,
      rating: reviews.length ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length : null,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating ?? 0,
        comment: r.comment ?? '',
        reviewer: names[one(r.reviewer) ?? '']?.name ?? 'Client',
        created: r.created ?? '',
      })),
    };
  },
});
