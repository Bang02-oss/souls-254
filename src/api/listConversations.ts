import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { one, profileMap } from '../lib/server';

export default createEndpoint({
  description: 'Lists the chats (hired jobs) the signed-in user is part of',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.any(),
  execute: async ({ context }) => {
    const me = context.user.id;
    const [a, b] = await Promise.all([
      zite.jobs.findAll({ filters: { client: me, hiredFreelancer: { not: null } }, limit: 500 }),
      zite.jobs.findAll({ filters: { hiredFreelancer: me }, limit: 500 }),
    ]);
    const jobs = [...a.records, ...b.records].filter((j) => j.status !== 'Removed');
    const others = jobs.map((j) => (one(j.client) === me ? one(j.hiredFreelancer) : one(j.client)));
    const names = await profileMap(others);
    return {
      conversations: jobs
        .map((j, i) => ({
          jobId: j.id,
          title: j.title ?? '',
          status: j.status ?? '',
          otherName: names[others[i] ?? '']?.name ?? 'Member',
          otherCountry: names[others[i] ?? '']?.country ?? '',
          created: j.created ?? '',
        }))
        .sort((x, y) => y.created.localeCompare(x.created)),
    };
  },
});
