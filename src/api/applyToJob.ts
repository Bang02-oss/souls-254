import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { notify, one, requireActive } from '../lib/server';

export default createEndpoint({
  description: 'Lets a freelancer apply to an open job',
  authenticated: true,
  inputSchema: z.object({ jobId: z.string(), pitch: z.string().min(10) }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    const me = context.user.id;
    const profile = await requireActive(me);
    if (profile.role !== 'Freelancer') throw new ZiteError({ code: 'FORBIDDEN', message: 'role', userFacingMessage: 'Only freelancers can apply.' });
    const j = await zite.jobs.findOne({ id: input.jobId });
    if (!j || j.status !== 'Open') throw new ZiteError({ code: 'BAD_REQUEST', message: 'closed', userFacingMessage: 'This job is no longer open.' });
    const { records } = await zite.applications.findAll({ filters: { job: j.id, freelancer: me }, limit: 1 });
    if (records.length) throw new ZiteError({ code: 'BAD_REQUEST', message: 'dup', userFacingMessage: 'You already applied to this job.' });
    await zite.applications.create({ record: { pitch: input.pitch, job: j.id, freelancer: me, status: 'Pending' } });
    await notify(one(j.client), `New application: ${j.title}`, `${profile.displayName} applied to "${j.title}".`, `/jobs/${j.id}`);
    return { ok: true };
  },
});
