import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { one, profileMap } from '../lib/server';

export default createEndpoint({
  description: 'Gets the chat messages for a job the user is part of',
  authenticated: true,
  inputSchema: z.object({ jobId: z.string() }),
  outputSchema: z.any(),
  execute: async ({ input, context }) => {
    const me = context.user.id;
    const j = await zite.jobs.findOne({ id: input.jobId });
    if (!j || (one(j.client) !== me && one(j.hiredFreelancer) !== me)) {
      throw new ZiteError({ code: 'FORBIDDEN', message: 'not member', userFacingMessage: "You don't have access to this chat." });
    }
    const { records } = await zite.messages.findAll({ filters: { job: j.id }, limit: 2000 });
    records.sort((a, b) => (a.sentAt ?? '').localeCompare(b.sentAt ?? ''));
    const names = await profileMap([one(j.client), one(j.hiredFreelancer)]);
    const { records: reviews } = await zite.reviews.findAll({ filters: { job: j.id }, limit: 1 });
    return {
      job: {
        id: j.id,
        title: j.title ?? '',
        status: j.status ?? '',
        budget: j.budget ?? 0,
        paid: !!j.paid,
        paymentMethod: j.paymentMethod ?? null,
        reviewed: reviews.length > 0,
      },
      isClient: one(j.client) === me,
      otherName: names[(one(j.client) === me ? one(j.hiredFreelancer) : one(j.client)) ?? '']?.name ?? 'Member',
      messages: records.map((m) => ({
        id: m.id,
        body: m.body ?? '',
        mine: one(m.sender) === me,
        senderName: names[one(m.sender) ?? '']?.name ?? '',
        sentAt: m.sentAt ?? '',
      })),
    };
  },
});
