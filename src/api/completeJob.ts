import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { notify, one, requireActive } from '../lib/server';

export default createEndpoint({
  description: 'Client marks a job completed and paid, and reviews the freelancer',
  authenticated: true,
  inputSchema: z.object({
    jobId: z.string(),
    paymentMethod: z.enum(['M-Pesa', 'PayPal', 'Bank Transfer', 'Other']),
    rating: z.number().int().min(1).max(5),
    comment: z.string(),
  }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    const me = context.user.id;
    await requireActive(me);
    const j = await zite.jobs.findOne({ id: input.jobId });
    if (!j || one(j.client) !== me) throw new ZiteError({ code: 'FORBIDDEN', message: 'owner', userFacingMessage: 'Only the client can close this job.' });
    if (j.status !== 'In Progress') throw new ZiteError({ code: 'BAD_REQUEST', message: 'state', userFacingMessage: 'This job is not in progress.' });
    const freelancer = one(j.hiredFreelancer);
    await zite.jobs.update({
      id: j.id,
      record: { status: 'Completed', paid: true, paymentMethod: input.paymentMethod, completedAt: new Date().toISOString() },
    });
    await zite.reviews.create({ record: { comment: input.comment, job: j.id, rating: input.rating, freelancer: freelancer ?? null, reviewer: me } });
    await notify(freelancer, `Job completed: ${j.title}`, `"${j.title}" was marked completed and paid via ${input.paymentMethod}. You got ${input.rating} stars.`, '/earnings');
    return { ok: true };
  },
});
