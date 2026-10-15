import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { one } from '../lib/server';

export default createEndpoint({
  description: "Lists the signed-in client's posted jobs or the freelancer's applications",
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.any(),
  execute: async ({ context }) => {
    const me = context.user.id;
    const { records: posted } = await zite.jobs.findAll({ filters: { client: me }, limit: 500 });
    const { records: apps } = await zite.applications.findAll({ filters: { freelancer: me }, limit: 500 });
    const appJobIds = apps.map((a) => one(a.job)).filter((x): x is string => !!x);
    const { records: appJobs } = appJobIds.length
      ? await zite.jobs.findAll({ filters: { id: { in: appJobIds } }, limit: 500 })
      : { records: [] };
    const jobById = Object.fromEntries(appJobs.map((j) => [j.id, j]));
    return {
      posted: posted
        .filter((j) => j.status !== 'Removed')
        .sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''))
        .map((j) => ({ id: j.id, title: j.title ?? '', status: j.status ?? 'Open', budget: j.budget ?? 0, applicationCount: [j.applications ?? []].flat().length })),
      applied: apps
        .filter((a) => jobById[one(a.job) ?? ''])
        .map((a) => {
          const j = jobById[one(a.job)!];
          return { id: a.id, jobId: j.id, title: j.title ?? '', status: a.status ?? 'Pending', budget: j.budget ?? 0 };
        }),
    };
  },
});
