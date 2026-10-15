import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { notify, one, requireActive } from '../lib/server';

export default createEndpoint({
  description: 'Sends a chat message in a job and emails the other person',
  authenticated: true,
  inputSchema: z.object({ jobId: z.string(), body: z.string().min(1).max(4000) }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    const me = context.user.id;
    const profile = await requireActive(me);
    const j = await zite.jobs.findOne({ id: input.jobId });
    if (!j || (one(j.client) !== me && one(j.hiredFreelancer) !== me) || j.status === 'Removed') {
      throw new ZiteError({ code: 'FORBIDDEN', message: 'not member', userFacingMessage: "You can't message in this chat." });
    }
    await zite.messages.create({ record: { body: input.body.trim(), job: j.id, sender: me } });
    const other = one(j.client) === me ? one(j.hiredFreelancer) : one(j.client);
    await notify(other, `New message about "${j.title}"`, `${profile.displayName}: ${input.body.slice(0, 300)}`, `/messages/${j.id}`);
    return { ok: true };
  },
});
