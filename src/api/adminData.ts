import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { isAdmin, one, profileMap } from '../lib/server';

export default createEndpoint({
  description: 'Admin: lists all jobs and users',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.any(),
  execute: async ({ context }) => {
    if (!isAdmin(context.user.email)) throw new ZiteError({ code: 'FORBIDDEN', message: 'admin', userFacingMessage: 'Admins only.' });
    const [{ records: jobs }, { records: profiles }] = await Promise.all([
      zite.jobs.findAll({ limit: 2000 }),
      zite.profiles.findAll({ limit: 2000 }),
    ]);
    const names = await profileMap(jobs.map((j) => one(j.client)));
    return {
      jobs: jobs
        .sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''))
        .map((j) => ({ id: j.id, title: j.title ?? '', client: names[one(j.client) ?? '']?.name ?? '', status: j.status ?? '', created: j.created ?? '' })),
      users: profiles.map((p) => ({ id: p.id, name: p.displayName ?? '', role: p.role ?? '', country: p.country ?? '', blocked: !!p.blocked })),
    };
  },
});
