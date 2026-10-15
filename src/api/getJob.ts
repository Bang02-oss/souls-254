import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { one, profileMap } from '../lib/server';

export default createEndpoint({
  description: 'Gets one job with its applications (applications only for its client)',
  authenticated: true,
  inputSchema: z.object({ jobId: z.string() }),
  outputSchema: z.any(),
  execute: async ({ input, context }) => {
    const j = await zite.jobs.findOne({ id: input.jobId });
    if (!j || j.status === 'Removed') throw new ZiteError({ code: 'NOT_FOUND', message: 'job', userFacingMessage: 'This job no longer exists.' });
    const me = context.user.id;
    const clientId = one(j.client);
    const isClient = clientId === me;
    const { records: apps } = await zite.applications.findAll({ filters: { job: j.id }, limit: 500 });
    const visible = isClient ? apps : apps.filter((a) => one(a.freelancer) === me);
    const names = await profileMap([clientId, one(j.hiredFreelancer), ...visible.map((a) => one(a.freelancer))]);
    return {
      job: {
        id: j.id,
        title: j.title ?? '',
        description: j.description ?? '',
        category: j.category ?? '',
        skills: (j.skillsNeeded ?? []) as string[],
        budget: j.budget ?? 0,
        dueDate: j.dueDate ?? null,
        status: j.status ?? 'Open',
        clientName: names[clientId ?? '']?.name ?? 'Client',
        clientCountry: names[clientId ?? '']?.country ?? '',
        hiredFreelancerId: one(j.hiredFreelancer) ?? null,
        hiredName: names[one(j.hiredFreelancer) ?? '']?.name ?? null,
      },
      isClient,
      isHired: one(j.hiredFreelancer) === me,
      applications: visible.map((a) => ({
        id: a.id,
        pitch: a.pitch ?? '',
        status: a.status ?? 'Pending',
        freelancerId: one(a.freelancer) ?? '',
        freelancerName: names[one(a.freelancer) ?? '']?.name ?? 'Freelancer',
        created: a.created ?? null,
      })),
    };
  },
});
