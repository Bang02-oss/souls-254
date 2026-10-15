import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { one } from '../lib/server';

export default createEndpoint({
  description: 'Deletes a job the signed-in client owns',
  authenticated: true,
  inputSchema: z.object({ jobId: z.string() }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    const j = await zite.jobs.findOne({ id: input.jobId });
    if (!j || one(j.client) !== context.user.id) throw new ZiteError({ code: 'FORBIDDEN', message: 'owner', userFacingMessage: 'You can only delete your own jobs.' });
    await zite.jobs.delete({ id: j.id });
    return { ok: true };
  },
});
