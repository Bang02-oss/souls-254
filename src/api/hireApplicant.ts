import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { notify, one, requireActive } from '../lib/server';

export default createEndpoint({
  description: 'Client hires one applicant; the job moves to In Progress',
  authenticated: true,
  inputSchema: z.object({ applicationId: z.string() }),
  outputSchema: z.object({ jobId: z.string() }),
  execute: async ({ input, context }) => {
    await requireActive(context.user.id);
    const app = await zite.applications.findOne({ id: input.applicationId });
    const jobId = one(app?.job);
    const j = jobId ? await zite.jobs.findOne({ id: jobId }) : undefined;
    if (!app || !j || one(j.client) !== context.user.id) throw new ZiteError({ code: 'FORBIDDEN', message: 'owner', userFacingMessage: 'You can only hire for your own jobs.' });
    if (j.status !== 'Open') throw new ZiteError({ code: 'BAD_REQUEST', message: 'closed', userFacingMessage: 'Someone is already hired for this job.' });
    const freelancer = one(app.freelancer);
    await zite.jobs.update({ id: j.id, record: { status: 'In Progress', hiredFreelancer: freelancer ?? null } });
    const { records: all } = await zite.applications.findAll({ filters: { job: j.id }, limit: 500 });
    await Promise.all(
      all.map((a) => zite.applications.update({ id: a.id, record: { status: a.id === app.id ? 'Hired' : 'Declined' } })),
    );
    await notify(freelancer, `You're hired: ${j.title}`, `Good news! You were hired for "${j.title}". Open the chat to get started.`, `/messages/${j.id}`);
    return { jobId: j.id };
  },
});
