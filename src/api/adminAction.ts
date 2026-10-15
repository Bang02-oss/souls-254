import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { isAdmin } from '../lib/server';

export default createEndpoint({
  description: 'Admin: removes a job or blocks/unblocks a user',
  authenticated: true,
  inputSchema: z.object({ action: z.enum(['removeJob', 'block', 'unblock']), id: z.string() }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    if (!isAdmin(context.user.email)) throw new ZiteError({ code: 'FORBIDDEN', message: 'admin', userFacingMessage: 'Admins only.' });
    if (input.action === 'removeJob') await zite.jobs.update({ id: input.id, record: { status: 'Removed' } });
    else await zite.profiles.update({ id: input.id, record: { blocked: input.action === 'block' } });
    return { ok: true };
  },
});
